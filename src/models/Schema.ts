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
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  departmentId: text('department_id'),
  status: text('status').notNull().default('ACTIVE'),
  
  employeeCode: text('employee_code'),
  staffType: text('staff_type'),
  joinedAt: timestamp('joined_at', { withTimezone: true }),
  managerId: text('manager_id'),
  teachingLevel: text('teaching_level'),
  subject: text('subject'),
  homeroomClassId: text('homeroom_class_id'),
  
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }),
  mustChangePassword: boolean('must_change_password').default(false).notNull(),
  internalNote: text('internal_note'),

  dataScope: text('data_scope').default('OWN').notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),

  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  payload: jsonb('payload').notNull().default({}),
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
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const directives = pgTable('directives', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category'),
  urgency: text('urgency'),
  senderId: text('sender_id'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
  payload: jsonb('payload').notNull(),
  ...timestamps,
});

export const announcements = pgTable('announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  senderName: text('sender_name'),
  isMeeting: boolean('is_meeting').default(false).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
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
  'received',
  'consulting',
  'test_scheduled',
  'test_participated',
  'seat_reserved',
  'docs_submitted',
  'enrolled',
  'cancelled',
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
  status: leadStatus('status').notNull().default('received'),
  assignedUserId: text('assigned_user_id').references(() => users.id, { onDelete: 'set null' }),
  notes: text('notes'),
  
  // Student Details
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  currentClass: text('current_class'),
  currentSchool: text('current_school'),
  address: text('address'),
  enrollmentSystem: text('enrollment_system'),

  // Test Details
  testDate: timestamp('test_date', { withTimezone: true }),
  testTime: text('test_time'),
  mathScore: integer('math_score'),
  englishScore: integer('english_score'),
  vietnameseScore: integer('vietnamese_score'),

  // Financial & Discount Details
  scholarshipPercent: integer('scholarship_percent'),
  periodDiscountPercent: integer('period_discount_percent'),
  siblingDiscountPercent: integer('sibling_discount_percent'),
  staffDiscountPercent: integer('staff_discount_percent'),
  otherDiscountPercent: integer('other_discount_percent'),
  finalTuition: integer('final_tuition'),
  seatReservationFee: integer('seat_reservation_fee'),
  additionalFee: integer('additional_fee'),
  seatReservationDate: timestamp('seat_reservation_date', { withTimezone: true }),

  // Post-Enrollment Details
  nationalStudentId: text('national_student_id'),
  insuranceId: text('insurance_id'),
  moetStudentId: text('moet_student_id'),
  siblingsInfo: jsonb('siblings_info'),

  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
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

export const userInvitations = pgTable('user_invitations', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  departmentId: text('department_id'),
  dataScope: text('data_scope').default('OWN').notNull(),
  invitedById: text('invited_by_id'),
  invitedByName: text('invited_by_name'),
  status: text('status').default('PENDING').notNull(), // PENDING, ACCEPTED, EXPIRED, CANCELED
  tokenHash: text('token_hash'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  ...timestamps,
}, table => [
  index('user_invitations_email_idx').on(table.email),
  index('user_invitations_status_idx').on(table.status),
]);

export const userLoginHistory = pgTable('user_login_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  loginAt: timestamp('login_at', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceName: text('device_name'),
  success: boolean('success').default(true).notNull(),
  failureReason: text('failure_reason'),
}, table => [
  index('user_login_history_user_idx').on(table.userId),
  index('user_login_history_login_at_idx').on(table.loginAt),
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

export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(), // e.g., BGH, HANH_CHINH, TOAN_TIN, etc.
  description: text('description'),
  managerId: text('manager_id'), // User ID of the department head
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const positions = pgTable('positions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g., Hiệu trưởng, Tổ trưởng chuyên môn, Giáo viên
  code: text('code').notNull().unique(),
  departmentId: text('department_id').references(() => departments.id, { onDelete: 'cascade' }),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const employeeProfiles = pgTable('employee_profiles', {
  id: text('id').primaryKey(), // matches users.id
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  employeeCode: text('employee_code').notNull().unique(),
  identityCard: text('identity_card'), // CCCD (nhạy cảm)
  socialInsurance: text('social_insurance'), // BHXH (nhạy cảm)
  phoneNumber: text('phone_number'),
  gender: text('gender'),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  address: text('address'),
  bankAccount: text('bank_account'),
  bankName: text('bank_name'),
  reportsTo: text('reports_to'), // ID của người quản lý trực tiếp
  status: text('status').notNull().default('active'), // active, probation, terminated
  joinDate: timestamp('join_date', { withTimezone: true }),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const employmentContracts = pgTable('employment_contracts', {
  id: text('id').primaryKey(),
  employeeProfileId: text('employee_profile_id').notNull().references(() => employeeProfiles.id, { onDelete: 'cascade' }),
  contractNumber: text('contract_number').notNull().unique(),
  type: text('type').notNull(), // thử việc, xác định thời hạn 1 năm, 3 năm, không xác định thời hạn
  status: text('status').notNull().default('active'), // active, expired, terminated
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  baseSalary: integer('base_salary').notNull(), // Lương cơ bản (nhạy cảm)
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const leaveRequests = pgTable('leave_requests', {
  id: text('id').primaryKey(),
  employeeProfileId: text('employee_profile_id').notNull().references(() => employeeProfiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // phép năm, ốm, thai sản, không lương...
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected, cancelled
  approvedById: text('approved_by_id').references(() => users.id, { onDelete: 'set null' }),
  substituteTeacherId: text('substitute_teacher_id').references(() => users.id, { onDelete: 'set null' }), // giáo viên dạy thay
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const attendanceRecords = pgTable('attendance_records', {
  id: text('id').primaryKey(),
  employeeProfileId: text('employee_profile_id').notNull().references(() => employeeProfiles.id, { onDelete: 'cascade' }),
  date: timestamp('date', { withTimezone: true }).notNull(),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  status: text('status').notNull().default('present'), // present, absent, late, half_day
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const payrollRecords = pgTable('payroll_records', {
  id: text('id').primaryKey(),
  employeeProfileId: text('employee_profile_id').notNull().references(() => employeeProfiles.id, { onDelete: 'cascade' }),
  month: text('month').notNull(), // định dạng YYYY-MM
  baseSalary: integer('base_salary').notNull(),
  allowances: integer('allowances').default(0).notNull(),
  deductions: integer('deductions').default(0).notNull(),
  netSalary: integer('net_salary').notNull(),
  status: text('status').notNull().default('draft'), // draft, approved, paid
  paidAt: timestamp('paid_at', { withTimezone: true }),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const certifications = pgTable('certifications', {
  id: text('id').primaryKey(),
  employeeProfileId: text('employee_profile_id').notNull().references(() => employeeProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  issuingOrganization: text('issuing_organization').notNull(),
  issueDate: timestamp('issue_date', { withTimezone: true }),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  certificateUrl: text('certificate_url'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const approvalFlows = pgTable('approval_flows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  entityType: text('entity_type').notNull(), // leave_request, contract...
  steps: jsonb('steps').notNull(), // định nghĩa các bước duyệt [{ step: 1, role: 'MANAGER' }]
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const permissionPolicies = pgTable('permission_policies', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  workspaceId: text('workspace_id'),
  capability: text('capability').notNull(), // e.g., CRM_ADMISSIONS, PAYROLL, etc.
  action: text('action').notNull(), // read, write, approve
  effect: text('effect').notNull().default('allow'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

// Relationships
export const departmentsRelations = relations(departments, ({ one, many }) => ({
  manager: one(users, {
    fields: [departments.managerId],
    references: [users.id],
  }),
  positions: many(positions),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  department: one(departments, {
    fields: [positions.departmentId],
    references: [departments.id],
  }),
}));

export const employeeProfilesRelations = relations(employeeProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [employeeProfiles.userId],
    references: [users.id],
  }),
  contracts: many(employmentContracts),
  leaveRequests: many(leaveRequests),
  attendanceRecords: many(attendanceRecords),
  payrollRecords: many(payrollRecords),
  certifications: many(certifications),
}));

export const employmentContractsRelations = relations(employmentContracts, ({ one }) => ({
  employeeProfile: one(employeeProfiles, {
    fields: [employmentContracts.employeeProfileId],
    references: [employeeProfiles.id],
  }),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employeeProfile: one(employeeProfiles, {
    fields: [leaveRequests.employeeProfileId],
    references: [employeeProfiles.id],
  }),
  approvedBy: one(users, {
    fields: [leaveRequests.approvedById],
    references: [users.id],
  }),
  substituteTeacher: one(users, {
    fields: [leaveRequests.substituteTeacherId],
    references: [users.id],
  }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  employeeProfile: one(employeeProfiles, {
    fields: [attendanceRecords.employeeProfileId],
    references: [employeeProfiles.id],
  }),
}));

export const payrollRecordsRelations = relations(payrollRecords, ({ one }) => ({
  employeeProfile: one(employeeProfiles, {
    fields: [payrollRecords.employeeProfileId],
    references: [employeeProfiles.id],
  }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  employeeProfile: one(employeeProfiles, {
    fields: [certifications.employeeProfileId],
    references: [employeeProfiles.id],
  }),
}));


export const risks = pgTable('risks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  severity: text('severity').notNull(), // high, medium, low
  status: text('status').notNull().default('open'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  department: text('department'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const systemSettings = pgTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  group: text('group'),
  label: text('label'),
  description: text('description'),
  isSecret: boolean('is_secret').default(false).notNull(),
  isEditable: boolean('is_editable').default(true).notNull(),
  updatedBy: text('updated_by'),
  ...timestamps,
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  module: text('module').notNull(),
  type: text('type').notNull(),
  severity: text('severity').default('INFO').notNull(),
  actorId: text('actor_id'),
  actorName: text('actor_name'),
  targetUrl: text('target_url'),
  sourceType: text('source_type'),
  sourceId: text('source_id'),
  scopeType: text('scope_type').default('USER').notNull(),
  scopeId: text('scope_id'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
}, table => [
  index('notifications_module_idx').on(table.module),
  index('notifications_source_idx').on(table.sourceType, table.sourceId),
  index('notifications_created_idx').on(table.createdAt),
]);

export const notificationRecipients = pgTable('notification_recipients', {
  id: text('id').primaryKey(),
  notificationId: text('notification_id').notNull(),
  userId: text('user_id').notNull(),
  status: text('status').default('UNREAD').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  ...timestamps,
}, table => [
  index('notification_recipients_user_status_idx').on(table.userId, table.status),
  index('notification_recipients_notification_idx').on(table.notificationId),
]);

export const approvalRequests = pgTable('approval_requests', {
  id: text('id').primaryKey(),
  module: text('module').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('PENDING').notNull(),
  requesterId: text('requester_id'),
  requesterName: text('requester_name'),
  approverId: text('approver_id'),
  approverRole: text('approver_role'),
  approverWorkspaceId: text('approver_workspace_id'),
  approverDepartmentId: text('approver_department_id'),
  currentStep: integer('current_step').default(1).notNull(),
  targetUrl: text('target_url'),
  payload: jsonb('payload').notNull().default({}),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  ...timestamps,
}, table => [
  index('approval_requests_status_idx').on(table.status),
  index('approval_requests_module_status_idx').on(table.module, table.status),
  index('approval_requests_entity_idx').on(table.entityType, table.entityId),
  index('approval_requests_requester_idx').on(table.requesterId),
  index('approval_requests_approver_idx').on(table.approverId, table.approverRole, table.approverWorkspaceId, table.approverDepartmentId),
]);

export const approvalEvents = pgTable('approval_events', {
  id: text('id').primaryKey(),
  approvalRequestId: text('approval_request_id').notNull(),
  action: text('action').notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status'),
  actorId: text('actor_id'),
  actorName: text('actor_name'),
  comment: text('comment'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [
  index('approval_events_request_idx').on(table.approvalRequestId),
  index('approval_events_created_idx').on(table.createdAt),
]);

export const systemCategories = pgTable('system_categories', {
  id: text('id').primaryKey(),
  group: text('group').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  status: text('status').default('ACTIVE').notNull(),
  metadata: jsonb('metadata'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
}, table => [
  index('sys_categories_group_idx').on(table.group),
  index('sys_categories_status_idx').on(table.status),
  index('sys_categories_deleted_idx').on(table.deletedAt),
  index('sys_categories_group_code_idx').on(table.group, table.code),
]);

export const dataFiles = pgTable('data_files', {
  id: text('id').primaryKey(),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  displayName: text('display_name'),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  mimeType: text('mime_type'),
  extension: text('extension'),
  fileSize: integer('file_size').notNull(),
  storageProvider: text('storage_provider').default('LOCAL').notNull(),
  storageKey: text('storage_key'),
  module: text('module').default('SYSTEM').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  entityLabel: text('entity_label'),
  documentType: text('document_type'),
  category: text('category'),
  relatedModule: text('related_module'),
  tags: jsonb('tags'),
  visibility: text('visibility').default('SCHOOL').notNull(),
  departmentId: text('department_id'),
  version: integer('version').default(1).notNull(),
  parentFileId: text('parent_file_id'),
  uploadedBy: text('uploaded_by'),
  uploadedByName: text('uploaded_by_name'),
  status: text('status').default('ACTIVE').notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
  metadata: jsonb('metadata').notNull().default({}),
  ...timestamps,
}, table => [
  index('data_files_visibility_idx').on(table.visibility),
  index('data_files_uploaded_by_idx').on(table.uploadedBy),
  index('data_files_status_idx').on(table.status),
  index('data_files_module_idx').on(table.module),
  index('data_files_entity_idx').on(table.entityType, table.entityId),
  index('data_files_storage_key_idx').on(table.storageProvider, table.storageKey),
]);

export const dataImportJobs = pgTable('data_import_jobs', {
  id: text('id').primaryKey(),
  module: text('module').notNull(),
  fileId: text('file_id'),
  status: text('status').default('PENDING').notNull(),
  totalRows: integer('total_rows').default(0).notNull(),
  successRows: integer('success_rows').default(0).notNull(),
  failedRows: integer('failed_rows').default(0).notNull(),
  errorSummary: jsonb('error_summary'),
  mappingConfig: jsonb('mapping_config'),
  createdBy: text('created_by'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  ...timestamps,
});

export const dataExportJobs = pgTable('data_export_jobs', {
  id: text('id').primaryKey(),
  module: text('module').notNull(),
  fileId: text('file_id'),
  filters: jsonb('filters'),
  status: text('status').default('PENDING').notNull(),
  createdBy: text('created_by'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  ...timestamps,
});

export const chatConversations = pgTable('chat_conversations', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'SCHOOL_ANNOUNCEMENT', 'DEPARTMENT_CHANNEL', 'GROUP_CHAT', 'DIRECT_MESSAGE'
  name: text('name'),
  description: text('description'),
  departmentId: text('department_id'),
  createdBy: text('created_by'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'ARCHIVED', 'LOCKED'
  isPinned: boolean('is_pinned').default(false).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
});

export const chatMembers = pgTable('chat_members', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  userId: text('user_id').notNull(),
  role: text('role').notNull().default('MEMBER'), // 'OWNER', 'MODERATOR', 'MEMBER'
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  lastReadMessageId: text('last_read_message_id'),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }),
  mutedUntil: timestamp('muted_until', { withTimezone: true }),
  ...timestamps,
});

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  senderId: text('sender_id').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull().default('TEXT'), // 'TEXT', 'SYSTEM', 'FILE', 'IMAGE'
  replyToMessageId: text('reply_to_message_id'),
  isPinned: boolean('is_pinned').default(false).notNull(),
  isEdited: boolean('is_edited').default(false).notNull(),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
  ...timestamps,
});

export const chatMentions = pgTable('chat_mentions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull(),
  conversationId: text('conversation_id').notNull(),
  mentionType: text('mention_type').notNull(), // 'USER', 'DEPARTMENT', 'SCHOOL'
  mentionedUserId: text('mentioned_user_id'),
  mentionedDepartmentId: text('mentioned_department_id'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chatMentionRecipients = pgTable('chat_mention_recipients', {
  id: text('id').primaryKey(),
  mentionId: text('mention_id').notNull(),
  userId: text('user_id').notNull(),
  notificationStatus: text('notification_status').notNull().default('UNREAD'), // 'UNREAD', 'READ', 'DISMISSED'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
});

export const chatAttachments = pgTable('chat_attachments', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedBy: text('uploaded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// MODULE CSVC & THIẾT BỊ (FACILITIES)
// ==========================================

export const facilitiesLocations = pgTable('facilities_locations', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'CLASSROOM', 'LAB', 'LIBRARY', 'MEETING_ROOM', 'WAREHOUSE', 'OTHER'
  building: text('building'),
  floor: text('floor'),
  capacity: integer('capacity'),
  managerId: text('manager_id'),
  managerName: text('manager_name'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'MAINTENANCE', 'INACTIVE'
  note: text('note'),
  ...timestamps,
});

export const facilitiesAssets = pgTable('facilities_assets', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'IT', 'FURNITURE', 'ELECTRONIC', 'SPORT', 'OTHER'
  type: text('type'),
  brand: text('brand'),
  model: text('model'),
  serialNumber: text('serial_number'),
  purchaseDate: timestamp('purchase_date', { withTimezone: true }),
  startUsingDate: timestamp('start_using_date', { withTimezone: true }),
  locationId: text('location_id'),
  locationName: text('location_name'),
  responsibleUserId: text('responsible_user_id'),
  responsibleUserName: text('responsible_user_name'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'BROKEN', 'MAINTENANCE', 'LIQUIDATED', 'LOST'
  maintenancePriority: text('maintenance_priority'), // 'LOW', 'MEDIUM', 'HIGH'
  lastMaintenanceDate: timestamp('last_maintenance_date', { withTimezone: true }),
  nextMaintenanceDate: timestamp('next_maintenance_date', { withTimezone: true }),
  imageUrl: text('image_url'),
  qrCode: text('qr_code'),
  note: text('note'),
  sourceType: text('source_type').default('MANUAL'), // 'MANUAL', 'PURCHASE_REQUEST', 'INVENTORY'
  sourceId: text('source_id'),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
});

export const facilitiesRepairRequests = pgTable('facilities_repair_requests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  assetId: text('asset_id'),
  assetName: text('asset_name'),
  locationId: text('location_id'),
  locationName: text('location_name'),
  description: text('description').notNull(),
  priority: text('priority').notNull().default('MEDIUM'), // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  status: text('status').notNull().default('NEW'), // 'NEW', 'PROCESSING', 'WAITING_PART', 'WAITING_PURCHASE', 'DONE', 'REJECTED'
  requestedById: text('requested_by_id').notNull(),
  requestedByName: text('requested_by_name'),
  assignedToId: text('assigned_to_id'),
  assignedToName: text('assigned_to_name'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  resolutionNote: text('resolution_note'),
  relatedPurchaseRequestId: text('related_purchase_request_id'),
  
  // SLA tracking
  receivedAt: timestamp('received_at', { withTimezone: true }),
  firstResponseDueAt: timestamp('first_response_due_at', { withTimezone: true }),
  resolutionDueAt: timestamp('resolution_due_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  isFirstResponseOverdue: boolean('is_first_response_overdue').default(false),
  isResolutionOverdue: boolean('is_resolution_overdue').default(false),
  slaStatus: text('sla_status'), // 'IN_TIME', 'OVERDUE_RESPONSE', 'OVERDUE_RESOLUTION', 'DONE_ON_TIME', 'DONE_LATE'

  ...timestamps,
});

export const facilitiesMaintenanceLogs = pgTable('facilities_maintenance_logs', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name'),
  maintenanceType: text('maintenance_type').notNull(), // 'ROUTINE', 'SAFETY', 'REPAIR', 'INSPECTION'
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }).notNull(),
  completedDate: timestamp('completed_date', { withTimezone: true }),
  responsibleUserId: text('responsible_user_id'),
  responsibleUserName: text('responsible_user_name'),
  status: text('status').notNull().default('SCHEDULED'), // 'SCHEDULED', 'OVERDUE', 'DONE', 'CANCELLED'
  checklist: jsonb('checklist'),
  result: text('result'),
  note: text('note'),
  relatedRepairRequestId: text('related_repair_request_id'),
  relatedPurchaseRequestId: text('related_purchase_request_id'),
  ...timestamps,
});

export const facilitiesPurchaseRequests = pgTable('facilities_purchase_requests', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  requestType: text('request_type').notNull(), // 'NEW', 'ADDITIONAL', 'REPLACEMENT', 'PART', 'SUPPLY', 'URGENT'
  reason: text('reason'),
  departmentId: text('department_id'),
  locationId: text('location_id'),
  locationName: text('location_name'),
  relatedRepairRequestId: text('related_repair_request_id'),
  relatedAssetId: text('related_asset_id'),
  priority: text('priority').default('MEDIUM'),
  neededByDate: timestamp('needed_by_date', { withTimezone: true }),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT', 'SUBMITTED', 'INFO_REQUIRED', 'APPROVED', 'REJECTED', 'PURCHASING', 'PARTIAL_RECEIVED', 'COMPLETED', 'CANCELLED'
  requestedById: text('requested_by_id').notNull(),
  requestedByName: text('requested_by_name'),
  reviewedById: text('reviewed_by_id'),
  reviewedByName: text('reviewed_by_name'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  approvedById: text('approved_by_id'),
  approvedByName: text('approved_by_name'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedReason: text('rejected_reason'),
  note: text('note'),
  ...timestamps,
});

export const facilitiesPurchaseItems = pgTable('facilities_purchase_items', {
  id: text('id').primaryKey(),
  purchaseRequestId: text('purchase_request_id').notNull(),
  itemName: text('item_name').notNull(),
  category: text('category').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unit: text('unit').notNull(),
  specification: text('specification'),
  purpose: text('purpose'),
  necessityLevel: text('necessity_level'),
  estimatedUnitPrice: integer('estimated_unit_price'),
  suggestedSupplier: text('suggested_supplier'),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'PURCHASED', 'RECEIVED'
  receivedQuantity: integer('received_quantity').default(0),
  createdAssetId: text('created_asset_id'),
  note: text('note'),
  ...timestamps,
});

export const facilitiesHandoverLogs = pgTable('facilities_handover_logs', {
  id: text('id').primaryKey(),
  code: text('code').unique(),
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name'),
  receiverId: text('receiver_id').notNull(),
  receiverName: text('receiver_name'),
  department: text('department'),
  handoverDate: timestamp('handover_date', { withTimezone: true }).notNull(),
  expectedReturnDate: timestamp('expected_return_date', { withTimezone: true }),
  actualReturnDate: timestamp('actual_return_date', { withTimezone: true }),
  conditionOnHandover: text('condition_on_handover'),
  conditionOnReturn: text('condition_on_return'),
  handedOverById: text('handed_over_by_id'),
  handedOverByName: text('handed_over_by_name'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'RETURNED', 'OVERDUE', 'CANCELLED'
  note: text('note'),
  attachmentUrl: text('attachment_url'),
  ...timestamps,
});

export const facilitiesInventoryChecks = pgTable('facilities_inventory_checks', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  scope: text('scope'), // 'ALL', 'LOCATION', 'CATEGORY'
  locationId: text('location_id'),
  category: text('category'),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT', 'IN_PROGRESS', 'WAITING_APPROVAL', 'COMPLETED', 'CANCELLED'
  assignedToId: text('assigned_to_id'),
  assignedToName: text('assigned_to_name'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  summary: text('summary'),
  createdById: text('created_by_id').notNull(),
  createdByName: text('created_by_name'),
  ...timestamps,
});

export const facilitiesInventoryCheckItems = pgTable('facilities_inventory_check_items', {
  id: text('id').primaryKey(),
  inventoryCheckId: text('inventory_check_id').notNull(),
  assetId: text('asset_id').notNull(),
  assetCode: text('asset_code'),
  assetName: text('asset_name'),
  expectedLocationId: text('expected_location_id'),
  actualLocationId: text('actual_location_id'),
  expectedStatus: text('expected_status'),
  actualStatus: text('actual_status'),
  result: text('result'), // 'CORRECT', 'WRONG_LOCATION', 'MISSING', 'SURPLUS', 'DAMAGED', 'NEEDS_UPDATE'
  note: text('note'),
  checkedAt: timestamp('checked_at', { withTimezone: true }),
});

export const facilitiesAttachments = pgTable('facilities_attachments', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'LOCATION', 'ASSET', 'REPAIR', 'MAINTENANCE', 'PURCHASE', 'HANDOVER', 'INVENTORY'
  entityId: text('entity_id').notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedBy: text('uploaded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const facilitiesSupplies = pgTable('facilities_supplies', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  unit: text('unit').notNull(),
  currentQuantity: integer('current_quantity').notNull().default(0),
  minimumQuantity: integer('minimum_quantity').notNull().default(0),
  storageLocation: text('storage_location'),
  managerId: text('manager_id'),
  managerName: text('manager_name'),
  status: text('status').notNull().default('IN_STOCK'), // 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED'
  lastImportedAt: timestamp('last_imported_at', { withTimezone: true }),
  note: text('note'),
  ...timestamps,
});

export const facilitiesSupplyTransactions = pgTable('facilities_supply_transactions', {
  id: text('id').primaryKey(),
  supplyId: text('supply_id').notNull(),
  type: text('type').notNull(), // 'IMPORT', 'EXPORT', 'ADJUST'
  quantity: integer('quantity').notNull(),
  reason: text('reason'),
  relatedRepairRequestId: text('related_repair_request_id'),
  relatedMaintenanceId: text('related_maintenance_id'),
  performedById: text('performed_by_id').notNull(),
  performedByName: text('performed_by_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const facilitiesSuppliers = pgTable('facilities_suppliers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  serviceTypes: jsonb('service_types'), // array of service types e.g., ['REPAIR', 'SUPPLY']
  rating: integer('rating'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'PAUSED', 'INACTIVE'
  note: text('note'),
  ...timestamps,
});

export const facilitiesWarranties = pgTable('facilities_warranties', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  supplierId: text('supplier_id'),
  warrantyStartDate: timestamp('warranty_start_date', { withTimezone: true }),
  warrantyEndDate: timestamp('warranty_end_date', { withTimezone: true }),
  warrantyTerms: text('warranty_terms'),
  warrantyCode: text('warranty_code'),
  documentUrl: text('document_url'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'VOID'
  ...timestamps,
});

export const facilitiesSafetyChecks = pgTable('facilities_safety_checks', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  checkType: text('check_type').notNull(), // 'FIRE_SAFETY', 'ELECTRICAL', 'WATER', 'HYGIENE', 'SECURITY', 'OTHER'
  locationId: text('location_id'),
  assignedToId: text('assigned_to_id'),
  assignedToName: text('assigned_to_name'),
  cycle: text('cycle'), // e.g., 'WEEKLY', 'MONTHLY', 'QUARTERLY'
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
  nextCheckAt: timestamp('next_check_at', { withTimezone: true }),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'PASSED', 'FAILED', 'NEEDS_ACTION', 'OVERDUE'
  result: text('result'),
  issueDescription: text('issue_description'),
  beforeImageUrl: text('before_image_url'),
  afterImageUrl: text('after_image_url'),
  relatedRepairRequestId: text('related_repair_request_id'),
  note: text('note'),
  ...timestamps,
});

export const facilitiesBookingRequests = pgTable('facilities_booking_requests', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  targetType: text('target_type').notNull(), // 'ASSET', 'LOCATION'
  assetId: text('asset_id'),
  locationId: text('location_id'),
  requesterId: text('requester_id').notNull(),
  requesterName: text('requester_name'),
  department: text('department'),
  purpose: text('purpose'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  approvedById: text('approved_by_id'),
  approvedByName: text('approved_by_name'),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'APPROVED', 'REJECTED', 'IN_USE', 'RETURNED', 'OVERDUE', 'CANCELLED'
  conditionBefore: text('condition_before'),
  conditionAfter: text('condition_after'),
  note: text('note'),
  attachmentUrl: text('attachment_url'), // File/Ảnh đính kèm
  ...timestamps,
});

export const facilitiesRenovationProjects = pgTable('facilities_renovation_projects', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  scope: text('scope'),
  reason: text('reason'),
  locationId: text('location_id'),
  managerId: text('manager_id'),
  managerName: text('manager_name'),
  plannedStartDate: timestamp('planned_start_date', { withTimezone: true }),
  plannedEndDate: timestamp('planned_end_date', { withTimezone: true }),
  actualStartDate: timestamp('actual_start_date', { withTimezone: true }),
  actualEndDate: timestamp('actual_end_date', { withTimezone: true }),
  status: text('status').notNull().default('PROPOSED'), // 'PROPOSED', 'APPROVED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ACCEPTED', 'CANCELLED'
  tasks: jsonb('tasks'), // Array of subtasks
  beforeImageUrls: jsonb('before_image_urls'),
  afterImageUrls: jsonb('after_image_urls'),
  acceptanceNote: text('acceptance_note'),
  relatedPurchaseRequestId: text('related_purchase_request_id'),
  ...timestamps,
});

export const facilitiesSlaSettings = pgTable('facilities_sla_settings', {
  id: text('id').primaryKey(),
  priority: text('priority').notNull().unique(), // 'URGENT', 'HIGH', 'MEDIUM', 'LOW'
  firstResponseHours: integer('first_response_hours').notNull(),
  resolutionHours: integer('resolution_hours').notNull(),
  ...timestamps,
});

