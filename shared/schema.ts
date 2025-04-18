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

// Enum para los tipos de tickets
export const ticketTypeEnum = pgEnum('ticket_type', [
  // Alta Prioridad (Urgente)
  'internet_outage',           // 1. Fallo total en la conexión a internet que impide trabajar
  'os_boot_failure',           // 2. Sistema operativo no arranca en equipos esenciales
  'malware_detected',          // 3. Virus o malware detectado en equipos de trabajo
  'email_access_lost',         // 4. Pérdida de acceso a correo electrónico en todos los dispositivos de un usuario
  'critical_hardware_failure', // 5. Fallo de hardware crítico (por ejemplo, disco duro dañado en un equipo clave)
  'essential_platform_error',  // 6. Error en acceso a plataforma esencial (ERP, CRM, etc.)
  'account_lockout',           // 7. Bloqueo total de cuenta de usuario

  // Media Prioridad (Importante, pero no crítico)
  'intermittent_internet',     // 1. Conexión a internet intermitente en algunos usuarios
  'printer_issues',            // 2. Problemas menores con impresoras
  'software_installation',     // 3. Solicitud de instalación de software o herramientas
  'non_critical_app_error',    // 4. Error en aplicación no crítica
  'cloud_sync_issues',         // 5. Problemas con la sincronización de archivos en plataformas en la nube
  'password_reset',            // 6. Restablecimiento de contraseñas para herramientas o servicios no críticos
  'tool_config_issue',         // 7. Fallo en la configuración de una herramienta que afecta la productividad

  // Baja Prioridad (Menos urgente)
  'mobile_email_setup',        // 1. Solicitudes de asistencia para configurar correo electrónico en dispositivos móviles
  'software_usage_help',       // 2. Consultas sobre cómo realizar tareas básicas en un software
  'file_access_issue',         // 3. Problemas menores de acceso a archivos o carpetas en servidores compartidos
  'peripheral_setup',          // 4. Pequeñas dificultades con la configuración de impresoras o escáneres
  'remote_access_setup',       // 5. Asistencia con la configuración de acceso remoto (VPN o aplicaciones similares)
  'non_critical_software',     // 6. Petición de instalación de programas no críticos para equipos de trabajo
  'minor_display_errors',      // 7. Errores menores de visualización o gráficos en herramientas de oficina

  // Muy Baja Prioridad (No urgente)
  'advanced_feature_help',     // 1. Preguntas sobre funciones avanzadas en software
  'ui_cosmetic_requests',      // 2. Solicitudes de cambios cosméticos en la apariencia de la interfaz de usuario
  'future_updates_info',       // 3. Consultas sobre actualizaciones futuras de programas o sistemas operativos
  'disk_space_management',     // 4. Peticiones para liberar espacio en discos duros personales
  'cleanup_request',           // 5. Solicitudes para eliminar archivos o aplicaciones no utilizadas
  'documentation_errors',      // 6. Errores menores de ortografía o detalles gráficos en documentación interna
  'support_process_help'       // 7. Consultas sobre procedimientos de soporte o cómo abrir tickets de ayuda
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
  type: ticketTypeEnum('type'),
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
  slaHours: integer('sla_hours'), // Tiempo en horas para el SLA
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
  .omit({ id: true, role: true })
  .extend({
    password: z.string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
      .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número")
      .regex(/[^A-Za-z0-9]/, "La contraseña debe contener al menos un carácter especial"),
    confirmPassword: z.string(),
    email: z.string().email("El correo electrónico no es válido"),
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
