import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupTeamsRoutes, isAuthenticated, isAdmin, isAgentOrAdmin, canAccessTicket } from "./teams";
import { z } from "zod";
import { insertTicketSchema, insertTicketCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup Teams integration routes
  setupTeamsRoutes(app);

  // Users routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Filter out passwords before sending
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Filter out password before sending
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Tickets routes
  app.post("/api/tickets", isAuthenticated, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        requesterId: req.user.id
      });

      const ticket = await storage.createTicket(ticketData);

      // Create ticket activity
      await storage.createTicketActivity({
        ticketId: ticket.id,
        userId: req.user.id,
        action: "create",
        details: "Ticket created"
      });

      // Create notification for admins and agents
      const users = await storage.getUsers();
      const agentsAndAdmins = users.filter(user => 
        user.role === 'agent' || user.role === 'admin'
      );

      for (const user of agentsAndAdmins) {
        await storage.createNotification({
          userId: user.id,
          message: `New ticket #${ticket.id} created: ${ticket.title}`,
          relatedTicketId: ticket.id,
          isRead: false
        });
      }

      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid ticket data", errors: error.errors });
      } else {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: "Failed to create ticket" });
      }
    }
  });

  app.get("/api/tickets", isAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getTickets(req.user.id, req.user.role);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", isAuthenticated, canAccessTicket, async (req, res) => {
    res.json(req.ticket);
  });

  app.patch("/api/tickets/:id", isAuthenticated, canAccessTicket, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const updatedTicket = await storage.updateTicket(ticketId, req.body);

      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Create ticket activity
      let action = "update";
      let details = "Ticket updated";

      if (req.body.status) {
        action = "status_change";
        details = `Status changed to ${req.body.status}`;
      }

      await storage.createTicketActivity({
        ticketId,
        userId: req.user.id,
        action,
        details
      });

      // Create notification for relevant users
      if (updatedTicket.requesterId !== req.user.id) {
        await storage.createNotification({
          userId: updatedTicket.requesterId,
          message: `Your ticket #${ticketId} has been updated`,
          relatedTicketId: ticketId,
          isRead: false
        });
      }

      if (updatedTicket.agentId && updatedTicket.agentId !== req.user.id) {
        await storage.createNotification({
          userId: updatedTicket.agentId,
          message: `Ticket #${ticketId} you're assigned to has been updated`,
          relatedTicketId: ticketId,
          isRead: false
        });
      }

      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.post("/api/tickets/:id/assign", isAgentOrAdmin, canAccessTicket, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { agentId } = req.body;

      if (!agentId) {
        return res.status(400).json({ message: "Agent ID is required" });
      }

      const agent = await storage.getUser(agentId);
      if (!agent || (agent.role !== 'agent' && agent.role !== 'admin')) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const updatedTicket = await storage.assignTicket(ticketId, agentId);
      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Create ticket activity
      await storage.createTicketActivity({
        ticketId,
        userId: req.user.id,
        action: "assign",
        details: `Assigned to agent (ID: ${agentId})`
      });

      // Create notification for the agent
      await storage.createNotification({
        userId: agentId,
        message: `You have been assigned to ticket #${ticketId}`,
        relatedTicketId: ticketId,
        isRead: false
      });

      // Create notification for the requester
      await storage.createNotification({
        userId: updatedTicket.requesterId,
        message: `Your ticket #${ticketId} has been assigned to an agent`,
        relatedTicketId: ticketId,
        isRead: false
      });

      res.json(updatedTicket);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      res.status(500).json({ message: "Failed to assign ticket" });
    }
  });

  // Ticket comments
  app.post("/api/tickets/:id/comments", isAuthenticated, canAccessTicket, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const commentData = insertTicketCommentSchema.parse({
        ...req.body,
        ticketId,
        userId: req.user.id
      });

      const comment = await storage.createTicketComment(commentData);

      // Create ticket activity
      await storage.createTicketActivity({
        ticketId,
        userId: req.user.id,
        action: "comment",
        details: "Added a comment"
      });

      // Create notification for other users involved with the ticket
      const ticket = await storage.getTicket(ticketId);
      if (ticket) {
        if (ticket.requesterId !== req.user.id) {
          await storage.createNotification({
            userId: ticket.requesterId,
            message: `New comment on your ticket #${ticketId}`,
            relatedTicketId: ticketId,
            isRead: false
          });
        }

        if (ticket.agentId && ticket.agentId !== req.user.id) {
          await storage.createNotification({
            userId: ticket.agentId,
            message: `New comment on ticket #${ticketId}`,
            relatedTicketId: ticketId,
            isRead: false
          });
        }
      }

      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      } else {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  app.get("/api/tickets/:id/comments", isAuthenticated, canAccessTicket, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const comments = await storage.getTicketComments(ticketId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Ticket activities
  app.get("/api/activities", isAdmin, async (req, res) => {
    try {
      const activities = await storage.getTicketActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/tickets/:id/activities", isAuthenticated, canAccessTicket, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const activities = await storage.getTicketActivities(ticketId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching ticket activities:", error);
      res.status(500).json({ message: "Failed to fetch ticket activities" });
    }
  });

  // Notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Stats for admin dashboard
  app.get("/api/stats", isAdmin, async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      
      // Calculate basic stats
      const activeTickets = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length;
      const resolvedToday = tickets.filter(t => {
        const today = new Date();
        const ticketDate = new Date(t.lastUpdated);
        return t.status === 'resolved' && 
               ticketDate.getDate() === today.getDate() &&
               ticketDate.getMonth() === today.getMonth() &&
               ticketDate.getFullYear() === today.getFullYear();
      }).length;
      
      const urgentTickets = tickets.filter(t => 
        t.priority === 'critical' && 
        (t.status !== 'closed' && t.status !== 'resolved')
      ).length;
      
      // For a real application, you would calculate the average resolution time
      // from the ticket activities, but for this example we'll use a placeholder
      const avgResolutionTime = "3.5h";
      
      res.json({
        activeTickets,
        resolvedToday,
        urgentTickets,
        avgResolutionTime
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
