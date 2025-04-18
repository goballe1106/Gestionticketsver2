import { 
  users, tickets, ticketActivities, ticketComments,
  type User, type InsertUser, type Ticket, type InsertTicket, 
  type TicketActivity, type InsertTicketActivity,
  type TicketComment, type InsertTicketComment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, inArray, or, isNull, isNotNull } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { generateTicketNumber } from "./db";

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticketData: Partial<InsertTicket>): Promise<Ticket | undefined>;
  getAllTickets(limit?: number, offset?: number): Promise<Ticket[]>;
  getTicketsByStatus(status: string, limit?: number, offset?: number): Promise<Ticket[]>;
  getTicketsByCreator(creatorId: number, limit?: number, offset?: number): Promise<Ticket[]>;
  getTicketsByAssignee(assigneeId: number, limit?: number, offset?: number): Promise<Ticket[]>;
  getUnassignedTickets(limit?: number, offset?: number): Promise<Ticket[]>;
  getTicketsCountByStatus(): Promise<{status: string, count: number}[]>;
  
  // Ticket activity operations
  createTicketActivity(activity: InsertTicketActivity): Promise<TicketActivity>;
  getTicketActivities(ticketId: number, limit?: number, offset?: number): Promise<TicketActivity[]>;
  getRecentActivities(limit?: number, offset?: number): Promise<TicketActivity[]>;
  
  // Ticket comment operations
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  getTicketComments(ticketId: number, limit?: number, offset?: number): Promise<TicketComment[]>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
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
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }
  
  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber));
    return ticket;
  }
  
  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const ticketNumber = generateTicketNumber();
    const [ticket] = await db.insert(tickets)
      .values({ 
        ...ticketData,
        ticketNumber
      })
      .returning();
      
    return ticket;
  }
  
  async updateTicket(id: number, ticketData: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const [updatedTicket] = await db.update(tickets)
      .set({
        ...ticketData,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
      
    return updatedTicket;
  }
  
  async getAllTickets(limit = 50, offset = 0): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getTicketsByStatus(status: string, limit = 50, offset = 0): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(eq(tickets.status, status))
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getTicketsByCreator(creatorId: number, limit = 50, offset = 0): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(eq(tickets.creatorId, creatorId))
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getTicketsByAssignee(assigneeId: number, limit = 50, offset = 0): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(eq(tickets.assigneeId, assigneeId))
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getUnassignedTickets(limit = 50, offset = 0): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(isNull(tickets.assigneeId))
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getTicketsCountByStatus(): Promise<{status: string, count: number}[]> {
    const result = await db.select({
      status: tickets.status,
      count: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .groupBy(tickets.status);
    
    return result;
  }
  
  // Ticket activity operations
  async createTicketActivity(activityData: InsertTicketActivity): Promise<TicketActivity> {
    const [activity] = await db.insert(ticketActivities)
      .values(activityData)
      .returning();
      
    return activity;
  }
  
  async getTicketActivities(ticketId: number, limit = 50, offset = 0): Promise<TicketActivity[]> {
    return await db.select()
      .from(ticketActivities)
      .where(eq(ticketActivities.ticketId, ticketId))
      .orderBy(desc(ticketActivities.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getRecentActivities(limit = 10, offset = 0): Promise<TicketActivity[]> {
    return await db.select()
      .from(ticketActivities)
      .orderBy(desc(ticketActivities.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  // Ticket comment operations
  async createTicketComment(commentData: InsertTicketComment): Promise<TicketComment> {
    const [comment] = await db.insert(ticketComments)
      .values(commentData)
      .returning();
      
    return comment;
  }
  
  async getTicketComments(ticketId: number, limit = 50, offset = 0): Promise<TicketComment[]> {
    return await db.select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(asc(ticketComments.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

export const storage = new DatabaseStorage();
