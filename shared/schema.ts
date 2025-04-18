import { pgTable, text, serial, integer, boolean, timestamp, uuid, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'agent', 'admin']);
export const ticketStatusEnum = pgEnum('ticket_status', ['new', 'assigned', 'in_progress', 'resolved', 'closed']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'critical']);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default('user'),
  avatarUrl: text("avatar_url"),
  msTeamsId: text("ms_teams_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(tickets, { relationName: 'requester' }),
  assignedTickets: many(tickets, { relationName: 'agent' }),
}));

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default('new'),
  priority: ticketPriorityEnum("priority").notNull().default('medium'),
  category: text("category").notNull(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  agentId: integer("agent_id").references(() => users.id),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  requester: one(users, {
    fields: [tickets.requesterId],
    references: [users.id],
    relationName: 'requester',
  }),
  agent: one(users, {
    fields: [tickets.agentId],
    references: [users.id],
    relationName: 'agent',
  }),
  comments: many(ticketComments),
  activities: many(ticketActivities),
}));

export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}));

export const ticketActivities = pgTable("ticket_activities", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketActivitiesRelations = relations(ticketActivities, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketActivities.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketActivities.userId],
    references: [users.id],
  }),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedTicketId: integer("related_ticket_id").references(() => tickets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  ticket: one(tickets, {
    fields: [notifications.relatedTicketId],
    references: [tickets.id],
  }),
}));

export const teamsChats = pgTable("teams_chats", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  teamsChannelId: text("teams_channel_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamsChatsRelations = relations(teamsChats, ({ one }) => ({
  ticket: one(tickets, {
    fields: [teamsChats.ticketId],
    references: [tickets.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertTicketSchema = createInsertSchema(tickets)
  .omit({ id: true, createdAt: true, lastUpdated: true });

export const insertTicketCommentSchema = createInsertSchema(ticketComments)
  .omit({ id: true, createdAt: true });

export const insertTicketActivitySchema = createInsertSchema(ticketActivities)
  .omit({ id: true, createdAt: true });

export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, createdAt: true });

export const insertTeamsChatSchema = createInsertSchema(teamsChats)
  .omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;

export type TicketActivity = typeof ticketActivities.$inferSelect;
export type InsertTicketActivity = z.infer<typeof insertTicketActivitySchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type TeamsChat = typeof teamsChats.$inferSelect;
export type InsertTeamsChat = z.infer<typeof insertTeamsChatSchema>;

// Extended schemas for validation
export const userRegisterSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Create a version without confirmPassword for actual database insertion
export const userCreateSchema = z.object({
  username: insertUserSchema.shape.username,
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: insertUserSchema.shape.email,
  fullName: insertUserSchema.shape.fullName,
  role: insertUserSchema.shape.role,
  avatarUrl: insertUserSchema.shape.avatarUrl,
  msTeamsId: insertUserSchema.shape.msTeamsId,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
