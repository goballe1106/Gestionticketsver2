import { storage } from "./storage";
import { Request, Response, NextFunction } from "express";

// This file would normally include the Microsoft Graph SDK implementation
// for integrating with Microsoft Teams, but for this implementation,
// we'll provide a simplified version focusing on the API endpoints

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
};

// Middleware to check if user is an agent or admin
export const isAgentOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user.role === 'agent' || req.user.role === 'admin')) {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Agent or Admin access required" });
};

// Middleware to check if user is authorized to access a ticket
export const canAccessTicket = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const ticket = await storage.getTicket(ticketId);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  // Admins can access any ticket
  if (req.user.role === 'admin') {
    req.ticket = ticket;
    return next();
  }

  // Agents can access tickets assigned to them or unassigned tickets
  if (req.user.role === 'agent' && (ticket.agentId === req.user.id || ticket.agentId === null)) {
    req.ticket = ticket;
    return next();
  }

  // Users can only access their own tickets
  if (req.user.role === 'user' && ticket.requesterId === req.user.id) {
    req.ticket = ticket;
    return next();
  }

  res.status(403).json({ message: "Forbidden - You don't have access to this ticket" });
};

// Setup Teams-related routes
export function setupTeamsRoutes(app: any) {
  // Connect user to Microsoft Teams
  app.post("/api/teams/connect", isAuthenticated, async (req, res) => {
    try {
      const { msTeamsId } = req.body;
      
      if (!msTeamsId) {
        return res.status(400).json({ message: "Microsoft Teams ID is required" });
      }
      
      // Update user with Microsoft Teams ID
      const updatedUser = await storage.updateUser(req.user.id, { msTeamsId });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      res.json({ message: "Successfully connected to Microsoft Teams", user: updatedUser });
    } catch (error) {
      console.error("Error connecting to Microsoft Teams:", error);
      res.status(500).json({ message: "Failed to connect to Microsoft Teams" });
    }
  });

  // Create a Teams chat for a ticket
  app.post("/api/tickets/:id/teams-chat", isAuthenticated, canAccessTicket, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { teamsChannelId } = req.body;
      
      if (!teamsChannelId) {
        return res.status(400).json({ message: "Teams channel ID is required" });
      }
      
      // Check if a Teams chat already exists for this ticket
      const existingChat = await storage.getTeamsChat(ticketId);
      if (existingChat) {
        return res.status(409).json({ 
          message: "A Teams chat already exists for this ticket",
          teamsChat: existingChat
        });
      }
      
      // Create a new Teams chat
      const teamsChat = await storage.createTeamsChat({
        ticketId,
        teamsChannelId
      });
      
      // Create a notification
      await storage.createNotification({
        userId: req.ticket.requesterId,
        message: `A Teams chat has been created for ticket #${ticketId}`,
        relatedTicketId: ticketId,
        isRead: false
      });
      
      res.status(201).json({ message: "Teams chat created successfully", teamsChat });
    } catch (error) {
      console.error("Error creating Teams chat:", error);
      res.status(500).json({ message: "Failed to create Teams chat" });
    }
  });

  // Get Teams chat for a ticket
  app.get("/api/tickets/:id/teams-chat", isAuthenticated, canAccessTicket, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const teamsChat = await storage.getTeamsChat(ticketId);
      
      if (!teamsChat) {
        return res.status(404).json({ message: "No Teams chat found for this ticket" });
      }
      
      res.json(teamsChat);
    } catch (error) {
      console.error("Error fetching Teams chat:", error);
      res.status(500).json({ message: "Failed to fetch Teams chat" });
    }
  });
}

// Add the ticket property to the Request interface
declare global {
  namespace Express {
    interface Request {
      ticket?: any;
    }
  }
}
