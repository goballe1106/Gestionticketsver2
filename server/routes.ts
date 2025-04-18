import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, checkRole } from "./auth";
import { teamsService } from "./teams";
import { insertTicketSchema, insertTicketCommentSchema, tickets, User } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "./db";
import { promisify } from "util";
import { scrypt, randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/login, /api/register, /api/logout, /api/user)
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Ticket endpoints
  
  // Get all tickets (with filtering options)
  app.get("/api/tickets", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    try {
      const { status, limit = 50, offset = 0, assigneeId, creatorId } = req.query;
      let ticketList;
      
      // Apply different filters based on query parameters
      if (status) {
        ticketList = await storage.getTicketsByStatus(status as string, Number(limit), Number(offset));
      } else if (assigneeId) {
        ticketList = await storage.getTicketsByAssignee(Number(assigneeId), Number(limit), Number(offset));
      } else if (creatorId) {
        ticketList = await storage.getTicketsByCreator(Number(creatorId), Number(limit), Number(offset));
      } else if (req.query.unassigned === "true") {
        ticketList = await storage.getUnassignedTickets(Number(limit), Number(offset));
      } else {
        // User role determines which tickets they can see
        if (req.user.role === "admin" || req.user.role === "agent") {
          ticketList = await storage.getAllTickets(Number(limit), Number(offset));
        } else {
          // Regular users can only see their own tickets
          ticketList = await storage.getTicketsByCreator(req.user.id, Number(limit), Number(offset));
        }
      }
      
      // Get user info for creators and assignees
      const userIds = new Set<number>();
      ticketList.forEach(ticket => {
        userIds.add(ticket.creatorId);
        if (ticket.assigneeId) userIds.add(ticket.assigneeId);
        if (ticket.resolvedById) userIds.add(ticket.resolvedById);
      });
      
      // Get all users in one query
      const users = await Promise.all(
        Array.from(userIds).map(id => storage.getUser(id))
      );
      
      const userMap = users.reduce((map, user) => {
        if (user) {
          // Remove password from user object
          const { password, ...safeUser } = user;
          map[user.id] = safeUser;
        }
        return map;
      }, {} as Record<number, any>);
      
      // Attach user info to tickets
      const ticketsWithUsers = ticketList.map(ticket => ({
        ...ticket,
        creator: userMap[ticket.creatorId],
        assignee: ticket.assigneeId ? userMap[ticket.assigneeId] : null,
        resolvedBy: ticket.resolvedById ? userMap[ticket.resolvedById] : null
      }));
      
      res.json(ticketsWithUsers);
    } catch (error) {
      console.error("Error getting tickets:", error);
      res.status(500).json({ message: "Error al obtener los tickets" });
    }
  });
  
  // Get ticket by ID or number
  app.get("/api/tickets/:identifier", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    try {
      const { identifier } = req.params;
      let ticket;
      
      // Check if identifier is a number (id) or string (ticketNumber)
      if (!isNaN(Number(identifier))) {
        ticket = await storage.getTicket(Number(identifier));
      } else {
        ticket = await storage.getTicketByNumber(identifier);
      }
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket no encontrado" });
      }
      
      // Check if user has access to this ticket
      if (req.user.role === "user" && ticket.creatorId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para ver este ticket" });
      }
      
      // Get creator and assignee info
      const creator = await storage.getUser(ticket.creatorId);
      const assignee = ticket.assigneeId ? await storage.getUser(ticket.assigneeId) : null;
      const resolvedBy = ticket.resolvedById ? await storage.getUser(ticket.resolvedById) : null;
      
      // Get comments for this ticket
      const comments = await storage.getTicketComments(ticket.id);
      
      // Get user info for comment authors
      const commentUserIds = new Set<number>();
      comments.forEach(comment => commentUserIds.add(comment.userId));
      
      const commentUsers = await Promise.all(
        Array.from(commentUserIds).map(id => storage.getUser(id))
      );
      
      const userMap = commentUsers.reduce((map, user) => {
        if (user) {
          // Remove password from user object
          const { password, ...safeUser } = user;
          map[user.id] = safeUser;
        }
        return map;
      }, {} as Record<number, any>);
      
      // Add user info to comments
      const commentsWithUsers = comments.map(comment => ({
        ...comment,
        user: userMap[comment.userId]
      }));
      
      // Get activities for this ticket
      const activities = await storage.getTicketActivities(ticket.id);
      
      // Add user info to activities
      const activitiesWithUsers = await Promise.all(
        activities.map(async (activity) => {
          const user = await storage.getUser(activity.userId);
          if (user) {
            const { password, ...safeUser } = user;
            return { ...activity, user: safeUser };
          }
          return activity;
        })
      );
      
      // Remove sensitive information from users
      const { password: _creatorPass, ...safeCreator } = creator || {};
      const safeAssignee = assignee ? (({ password: _, ...rest }) => rest)(assignee) : null;
      const safeResolvedBy = resolvedBy ? (({ password: _, ...rest }) => rest)(resolvedBy) : null;
      
      res.json({
        ticket,
        creator: safeCreator,
        assignee: safeAssignee,
        resolvedBy: safeResolvedBy,
        comments: commentsWithUsers,
        activities: activitiesWithUsers
      });
    } catch (error) {
      console.error("Error getting ticket:", error);
      res.status(500).json({ message: "Error al obtener el ticket" });
    }
  });
  
  // Create a new ticket
  app.post("/api/tickets", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    try {
      // Si se proporciona un tipo de ticket, asegúrese de que la prioridad sea la correcta
      let ticketDataWithDefaults = { ...req.body };
      
      // Importar las utilidades de tickets
      if (ticketDataWithDefaults.type) {
        const { getTicketPriorityFromType, getSLAHoursFromType, getTicketTypeText } = require('./ticket-utils');
        
        // Establecer prioridad automáticamente según el tipo (si no se ha establecido explícitamente)
        if (!ticketDataWithDefaults.priority) {
          ticketDataWithDefaults.priority = getTicketPriorityFromType(ticketDataWithDefaults.type);
        }
        
        // Establecer SLA automáticamente según el tipo (si no se ha establecido explícitamente)
        if (!ticketDataWithDefaults.slaHours) {
          ticketDataWithDefaults.slaHours = getSLAHoursFromType(ticketDataWithDefaults.type);
        }
        
        // Si no se ha proporcionado un título, usar el texto descriptivo del tipo
        if (!ticketDataWithDefaults.title || ticketDataWithDefaults.title.trim() === '') {
          ticketDataWithDefaults.title = getTicketTypeText(ticketDataWithDefaults.type);
        }
      }
      
      // Validate ticket data
      const ticketData = insertTicketSchema.parse({
        ...ticketDataWithDefaults,
        creatorId: req.user.id
      });
      
      // Create the ticket
      const ticket = await storage.createTicket(ticketData);
      
      // Record the activity
      await storage.createTicketActivity({
        ticketId: ticket.id,
        userId: req.user.id,
        activityType: "created",
        description: `Ticket creado: ${ticket.title}`
      });
      
      // Try to create Teams chat for this ticket (if integration enabled)
      try {
        if (process.env.TEAMS_INTEGRATION_ENABLED === "true") {
          const channelId = await teamsService.createTeamsChatForTicket(
            ticket.ticketNumber,
            ticket.title,
            [req.user.msTeamsId].filter(Boolean) as string[]
          );
          
          // Update ticket with the Teams channel ID
          if (channelId) {
            await db.update(tickets)
              .set({ teamsChannelId: channelId })
              .where(eq(tickets.id, ticket.id));
          }
        }
      } catch (teamsError) {
        console.error("Error creating Teams chat:", teamsError);
        // Continue even if Teams integration fails
      }
      
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Error al crear el ticket" });
    }
  });
  
  // Update a ticket
  app.patch("/api/tickets/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    try {
      const ticketId = Number(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket no encontrado" });
      }
      
      // Check permissions
      if (req.user.role === "user" && ticket.creatorId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para actualizar este ticket" });
      }
      
      // Handle special case: resolving a ticket
      if (req.body.status === "resolved" && ticket.status !== "resolved") {
        req.body.resolvedAt = new Date();
        req.body.resolvedById = req.user.id;
      }
      
      // Update the ticket
      const updatedTicket = await storage.updateTicket(ticketId, req.body);
      
      if (!updatedTicket) {
        return res.status(500).json({ message: "Error al actualizar el ticket" });
      }
      
      // Record the activity
      let activityType = "updated";
      let description = "Ticket actualizado";
      
      if (req.body.status && req.body.status !== ticket.status) {
        activityType = "status_changed";
        description = `Estado cambiado de ${ticket.status} a ${req.body.status}`;
      } else if (req.body.assigneeId && req.body.assigneeId !== ticket.assigneeId) {
        activityType = "assigned";
        const assignee = await storage.getUser(req.body.assigneeId);
        description = `Asignado a ${assignee?.fullName || "Usuario"}`;
      }
      
      await storage.createTicketActivity({
        ticketId: ticket.id,
        userId: req.user.id,
        activityType,
        description
      });
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Error al actualizar el ticket" });
    }
  });
  
  // Add a comment to a ticket
  app.post("/api/tickets/:id/comments", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    try {
      const ticketId = Number(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket no encontrado" });
      }
      
      // Check permissions for internal comments
      if (req.body.isInternal && req.user.role === "user") {
        return res.status(403).json({ message: "Los usuarios no pueden crear comentarios internos" });
      }
      
      // Validate comment data
      const commentData = insertTicketCommentSchema.parse({
        ...req.body,
        ticketId,
        userId: req.user.id
      });
      
      // Create the comment
      const comment = await storage.createTicketComment(commentData);
      
      // Record the activity
      await storage.createTicketActivity({
        ticketId,
        userId: req.user.id,
        activityType: "comment_added",
        description: `Comentario añadido por ${req.user.fullName}`
      });
      
      // Try to send message to Teams chat (if integration enabled)
      try {
        if (process.env.TEAMS_INTEGRATION_ENABLED === "true" && ticket.teamsChannelId) {
          await teamsService.sendMessageToTeamsChat(
            ticket.teamsChannelId,
            commentData.content,
            req.user.fullName
          );
        }
      } catch (teamsError) {
        console.error("Error sending message to Teams chat:", teamsError);
        // Continue even if Teams integration fails
      }
      
      // Get the user info for the response
      const { password, ...safeUser } = req.user;
      
      res.status(201).json({
        ...comment,
        user: safeUser
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Error al añadir comentario" });
    }
  });
  
  // Get ticket statistics
  app.get("/api/stats/tickets", checkRole(["admin", "agent"]), async (req: Request, res: Response) => {
    try {
      const statusCounts = await storage.getTicketsCountByStatus();
      
      // Get tickets resolved today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const resolvedToday = await db.select({ count: sql`count(*)::int` })
        .from(tickets)
        .where(
          and(
            eq(tickets.status, "resolved"),
            sql`${tickets.resolvedAt} >= ${today}`
          )
        );
      
      res.json({
        byStatus: statusCounts,
        resolvedToday: resolvedToday[0]?.count || 0
      });
    } catch (error) {
      console.error("Error getting ticket statistics:", error);
      res.status(500).json({ message: "Error al obtener estadísticas" });
    }
  });
  
  // Get recent activities
  app.get("/api/activities", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    try {
      const limit = Number(req.query.limit) || 10;
      const activities = await storage.getRecentActivities(limit);
      
      // Add user and ticket info to activities
      const enhancedActivities = await Promise.all(
        activities.map(async (activity) => {
          const user = await storage.getUser(activity.userId);
          const ticket = await storage.getTicket(activity.ticketId);
          
          if (user) {
            const { password, ...safeUser } = user;
            return { 
              ...activity, 
              user: safeUser,
              ticket: ticket ? {
                id: ticket.id,
                ticketNumber: ticket.ticketNumber,
                title: ticket.title,
                status: ticket.status
              } : null
            };
          }
          return activity;
        })
      );
      
      res.json(enhancedActivities);
    } catch (error) {
      console.error("Error getting activities:", error);
      res.status(500).json({ message: "Error al obtener actividades" });
    }
  });
  
  // User management endpoints (admin only)
  
  // Get all users
  app.get("/api/users", checkRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from user objects
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });
  
  // Get users by role
  app.get("/api/users/role/:role", checkRole(["admin", "agent"]), async (req: Request, res: Response) => {
    try {
      const role = req.params.role;
      const users = await storage.getUsersByRole(role);
      
      // Remove passwords from user objects
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error getting users by role:", error);
      res.status(500).json({ message: "Error al obtener usuarios por rol" });
    }
  });
  
  // Update user (admin only)
  app.patch("/api/users/:id", checkRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // If password is being updated, hash it
      if (req.body.password) {
        req.body.password = await hashPassword(req.body.password);
      }
      
      // Update the user
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Error al actualizar el usuario" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  });
  
  return httpServer;
}

// Helper function for password hashing (duplicated from auth.ts for use in user updates)
async function hashPassword(password: string) {
  const scryptAsync = promisify(scrypt);
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}