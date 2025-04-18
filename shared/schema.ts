import { pgTable, text, serial, integer, timestamp, pgEnum, uniqueIndex, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums for ticket status and priority
export const ticketStatusEnum = pgEnum('ticket_status', [
  'open', 
  'in_progress', 
  'waiting', 
  'resolved', 
  'closed'
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', [
  'low', 
  'medium', 
  'high', 
  'urgent'
]);

// User roles
export const userRoleEnum = pgEnum('user_role', [
  'user', 
  'agent', 
  'admin'
]);

// User schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('user'),
  avatarUrl: text('avatar_url'),
  msTeamsId: text('ms_teams_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Define user relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTickets: many(tickets, { relationName: 'user_created_tickets' }),
  assignedTickets: many(tickets, { relationName: 'user_assigned_tickets' }),
  ticketActivities: many(ticketActivities),
}));

// Tickets schema
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: ticketStatusEnum('status').notNull().default('open'),
  priority: ticketPriorityEnum('priority').notNull().default('medium'),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  assigneeId: integer('assignee_id').references(() => users.id),
  department: text('department'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  resolvedById: integer('resolved_by_id').references(() => users.id),
  teamsChannelId: text('teams_channel_id'),
});

// Define ticket relations
export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  creator: one(users, {
    fields: [tickets.creatorId],
    references: [users.id],
    relationName: 'user_created_tickets',
  }),
  assignee: one(users, {
    fields: [tickets.assigneeId],
    references: [users.id],
    relationName: 'user_assigned_tickets',
  }),
  resolvedBy: one(users, {
    fields: [tickets.resolvedById],
    references: [users.id],
  }),
  activities: many(ticketActivities),
  comments: many(ticketComments),
}));

// Ticket activity schema for tracking changes
export const ticketActivities = pgTable('ticket_activities', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull().references(() => tickets.id),
  userId: integer('user_id').notNull().references(() => users.id),
  activityType: text('activity_type').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Define ticket activity relations
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

// Ticket comments schema
export const ticketComments = pgTable('ticket_comments', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull().references(() => tickets.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isInternal: boolean('is_internal').default(false),
});

// Define ticket comment relations
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

// Insert schemas for users and tickets
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true })
  .extend({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  resolvedById: true,
  teamsChannelId: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true, 
  createdAt: true
});

export const insertTicketActivitySchema = createInsertSchema(ticketActivities).omit({
  id: true, 
  createdAt: true
});

export const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketActivity = typeof ticketActivities.$inferSelect;
export type InsertTicketActivity = z.infer<typeof insertTicketActivitySchema>;

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
