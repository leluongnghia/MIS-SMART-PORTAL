import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkUserId: text('clerk_user_id'),
  name: text('name').notNull(),
  role: text('role').notNull(),
  roleName: text('role_name'),
  title: text('title'),
  email: text('email'),
  workspaceId: text('workspace_id'),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  iconName: text('icon_name'),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  workspaceId: text('workspace_id').notNull(),
  assignedId: text('assigned_id').notNull(),
  assignedName: text('assigned_name'),
  status: text('status').notNull(),
  priority: text('priority').notNull(),
  deadline: text('deadline'),
  tag: text('tag'),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const directives = pgTable('directives', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category'),
  urgency: text('urgency'),
  senderId: text('sender_id'),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const announcements = pgTable('announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  senderName: text('sender_name'),
  isMeeting: boolean('is_meeting').default(false).notNull(),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const rbacConfig = pgTable('rbac_config', {
  id: text('id').primaryKey(),
  config: jsonb('config').notNull(),
  ...timestamps,
});

export const userOverrides = pgTable('user_overrides', {
  id: text('id').primaryKey(),
  overrides: jsonb('overrides').notNull(),
  ...timestamps,
});

export const crmLeads = pgTable('crm_leads', {
  id: text('id').primaryKey(),
  leadCode: text('lead_code').notNull(),
  contactId: text('contact_id'),
  opportunityId: text('opportunity_id'),
  studentName: text('student_name').notNull(),
  parentName: text('parent_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  stage: text('stage').notNull(),
  source: text('source'),
  campaign: text('campaign'),
  leadScore: integer('lead_score').default(0).notNull(),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const crmPayments = pgTable('crm_payments', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull(),
  type: text('type').notNull(),
  code: text('code').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull(),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const crmWorkflowLogs = pgTable('crm_workflow_logs', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull(),
  name: text('name').notNull(),
  channel: text('channel').notNull(),
  status: text('status').notNull(),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const studentDirectory = pgTable('student_directory', {
  id: text('id').primaryKey(),
  code: text('code'),
  name: text('name').notNull(),
  className: text('class_name'),
  enrollmentStatus: text('enrollment_status'),
  parentName: text('parent_name'),
  parentPhone: text('parent_phone'),
  parentEmail: text('parent_email'),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const sisGrades = pgTable('sis_grades', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  subject: text('subject').notNull(),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const tuitionFees = pgTable('tuition_fees', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  invoiceNo: text('invoice_no'),
  amount: text('amount'),
  status: text('status'),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const leadStatus = pgEnum('lead_status', [
  'new',
  'contacted',
  'consultation_scheduled',
  'application_submitted',
  'seat_reserved',
  'payment_confirmed',
  'enrolled',
  'lost',
]);

export const paymentStatus = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'cancelled',
]);

export const paymentType = pgEnum('payment_type', [
  'seat_reservation',
  'tuition',
  'admission_fee',
]);

export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  leadCode: text('lead_code').notNull().unique(),
  fullName: text('full_name').notNull(),
  parentName: text('parent_name'),
  phone: text('phone').notNull(),
  email: text('email'),
  source: text('source').notNull().default('website'),
  grade: text('grade').notNull(),
  status: leadStatus('status').notNull().default('new'),
  assignedUserId: text('assigned_user_id').references(() => users.id, { onDelete: 'set null' }),
  notes: text('notes'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
}, table => [
  index('leads_status_idx').on(table.status),
  index('leads_source_idx').on(table.source),
  index('leads_grade_idx').on(table.grade),
  index('leads_assigned_user_idx').on(table.assignedUserId),
  index('leads_phone_idx').on(table.phone),
]);

export const leadActivities = pgTable('lead_activities', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  activityAt: timestamp('activity_at', { withTimezone: true }).defaultNow().notNull(),
  createdById: text('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
}, table => [
  index('lead_activities_lead_idx').on(table.leadId),
  index('lead_activities_activity_at_idx').on(table.activityAt),
]);

export const leadPipeline = pgTable('lead_pipeline', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  fromStatus: leadStatus('from_status'),
  toStatus: leadStatus('to_status').notNull(),
  changedById: text('changed_by_id').references(() => users.id, { onDelete: 'set null' }),
  changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
  note: text('note'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
}, table => [
  index('lead_pipeline_lead_idx').on(table.leadId),
  index('lead_pipeline_changed_at_idx').on(table.changedAt),
  index('lead_pipeline_to_status_idx').on(table.toStatus),
]);

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  studentCode: text('student_code').unique(),
  fullName: text('full_name').notNull(),
  grade: text('grade').notNull(),
  className: text('class_name'),
  parentName: text('parent_name'),
  parentPhone: text('parent_phone'),
  parentEmail: text('parent_email'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
}, table => [
  index('students_lead_idx').on(table.leadId),
  index('students_grade_idx').on(table.grade),
]);

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  studentId: text('student_id').references(() => students.id, { onDelete: 'set null' }),
  type: paymentType('type').notNull(),
  status: paymentStatus('status').notNull().default('pending'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('VND'),
  transferContent: text('transfer_content').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
}, table => [
  index('payments_lead_idx').on(table.leadId),
  index('payments_student_idx').on(table.studentId),
  index('payments_status_idx').on(table.status),
  index('payments_type_idx').on(table.type),
]);

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('pending'),
  fileUrl: text('file_url'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
}, table => [
  index('documents_lead_idx').on(table.leadId),
  index('documents_student_idx').on(table.studentId),
  index('documents_status_idx').on(table.status),
]);

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [
  index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  index('audit_logs_actor_idx').on(table.actorId),
]);

export const leadsRelations = relations(leads, ({ many, one }) => ({
  assignedUser: one(users, {
    fields: [leads.assignedUserId],
    references: [users.id],
  }),
  activities: many(leadActivities),
  pipeline: many(leadPipeline),
  payments: many(payments),
  documents: many(documents),
  students: many(students),
}));

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  lead: one(leads, {
    fields: [leadActivities.leadId],
    references: [leads.id],
  }),
}));

export const leadPipelineRelations = relations(leadPipeline, ({ one }) => ({
  lead: one(leads, {
    fields: [leadPipeline.leadId],
    references: [leads.id],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  lead: one(leads, {
    fields: [students.leadId],
    references: [leads.id],
  }),
  payments: many(payments),
  documents: many(documents),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  lead: one(leads, {
    fields: [payments.leadId],
    references: [leads.id],
  }),
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  lead: one(leads, {
    fields: [documents.leadId],
    references: [leads.id],
  }),
  student: one(students, {
    fields: [documents.studentId],
    references: [students.id],
  }),
}));
