import { 
  users, tickets, ticketComments, ticketActivities, notifications, teamsChats,
  type User, type InsertUser, type Ticket, type InsertTicket,
  type TicketComment, type InsertTicketComment, type TicketActivity, 
  type InsertTicketActivity, type Notification, type InsertNotification,
  type TeamsChat, type InsertTeamsChat
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, or, isNull, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTicket(id: number): Promise<Ticket | undefined>;
  updateTicket(id: number, ticketData: Partial<InsertTicket>): Promise<Ticket | undefined>;
  getTickets(userId?: number, role?: string): Promise<Ticket[]>;
  assignTicket(ticketId: number, agentId: number): Promise<Ticket | undefined>;
  
  // Ticket comments
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  getTicketComments(ticketId: number): Promise<TicketComment[]>;
  
  // Ticket activities
  createTicketActivity(activity: InsertTicketActivity): Promise<TicketActivity>;
  getTicketActivities(ticketId?: number): Promise<TicketActivity[]>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Teams integration
  createTeamsChat(teamsChat: InsertTeamsChat): Promise<TeamsChat>;
  getTeamsChat(ticketId: number): Promise<TeamsChat | undefined>;

  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Ticket operations
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [createdTicket] = await db.insert(tickets).values(ticket).returning();
    return createdTicket;
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async updateTicket(id: number, ticketData: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const updateData = {
      ...ticketData,
      lastUpdated: new Date()
    };
    
    const [updatedTicket] = await db.update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket;
  }

  async getTickets(userId?: number, role?: string): Promise<Ticket[]> {
    if (!userId || !role) {
      return db.select().from(tickets).orderBy(desc(tickets.createdAt));
    }

    // Filter tickets based on user role
    if (role === 'admin') {
      // Admins can see all tickets
      return db.select().from(tickets).orderBy(desc(tickets.createdAt));
    } else if (role === 'agent') {
      // Agents can see tickets assigned to them or unassigned tickets
      return db.select().from(tickets)
        .where(or(
          eq(tickets.agentId, userId),
          isNull(tickets.agentId)
        ))
        .orderBy(desc(tickets.createdAt));
    } else {
      // Regular users can only see their own tickets
      return db.select().from(tickets)
        .where(eq(tickets.requesterId, userId))
        .orderBy(desc(tickets.createdAt));
    }
  }

  async assignTicket(ticketId: number, agentId: number): Promise<Ticket | undefined> {
    const [updatedTicket] = await db.update(tickets)
      .set({
        agentId: agentId,
        status: 'assigned',
        lastUpdated: new Date()
      })
      .where(eq(tickets.id, ticketId))
      .returning();
    return updatedTicket;
  }

  // Ticket comments
  async createTicketComment(comment: InsertTicketComment): Promise<TicketComment> {
    const [createdComment] = await db.insert(ticketComments)
      .values(comment)
      .returning();
    return createdComment;
  }

  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    return db.select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(ticketComments.createdAt);
  }

  // Ticket activities
  async createTicketActivity(activity: InsertTicketActivity): Promise<TicketActivity> {
    const [createdActivity] = await db.insert(ticketActivities)
      .values(activity)
      .returning();
    return createdActivity;
  }

  async getTicketActivities(ticketId?: number): Promise<TicketActivity[]> {
    if (ticketId) {
      return db.select()
        .from(ticketActivities)
        .where(eq(ticketActivities.ticketId, ticketId))
        .orderBy(desc(ticketActivities.createdAt));
    } else {
      return db.select()
        .from(ticketActivities)
        .orderBy(desc(ticketActivities.createdAt))
        .limit(20);
    }
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [createdNotification] = await db.insert(notifications)
      .values(notification)
      .returning();
    return createdNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  // Teams integration
  async createTeamsChat(teamsChat: InsertTeamsChat): Promise<TeamsChat> {
    const [createdTeamsChat] = await db.insert(teamsChats)
      .values(teamsChat)
      .returning();
    return createdTeamsChat;
  }

  async getTeamsChat(ticketId: number): Promise<TeamsChat | undefined> {
    const [teamsChat] = await db.select()
      .from(teamsChats)
      .where(eq(teamsChats.ticketId, ticketId));
    return teamsChat;
  }
}

export const storage = new DatabaseStorage();
