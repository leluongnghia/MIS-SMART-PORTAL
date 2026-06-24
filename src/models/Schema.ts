import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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

// ==========================================
// CORE ACADEMIC & ORGANIZATION
// ==========================================

export const schools = pgTable('schools', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  principalName: text('principal_name'),
  establishedDate: timestamp('established_date', { withTimezone: true }),
  logoUrl: text('logo_url'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'INACTIVE'
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const academicYears = pgTable('academic_years', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "2023-2024"
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  isCurrent: boolean('is_current').default(false).notNull(),
  schoolId: text('school_id').references(() => schools.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('ACTIVE'), // 'PLANNED', 'ACTIVE', 'COMPLETED'
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').unique(),
  gradeLevel: text('grade_level').notNull(),
  academicYearId: text('academic_year_id').references(() => academicYears.id, { onDelete: 'cascade' }),
  homeroomTeacherId: text('homeroom_teacher_id').references(() => users.id, { onDelete: 'set null' }),
  roomLocationId: text('room_location_id'),
  capacity: integer('capacity'),
  status: text('status').notNull().default('ACTIVE'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const timetableSlots = pgTable('timetable_slots', {
  id: text('id').primaryKey(),
  day: integer('day').notNull(),
  period: integer('period').notNull(),
  subject: text('subject').notNull(),
  className: text('class_name').notNull(),
  teacherId: text('teacher_id').references(() => users.id, { onDelete: 'set null' }),
  teacherName: text('teacher_name'),
  room: text('room').notNull(),
  academicYearId: text('academic_year_id').references(() => academicYears.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('ACTIVE'),
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
}, table => [
  index('timetable_slots_day_period_idx').on(table.day, table.period),
  index('timetable_slots_class_idx').on(table.className),
  index('timetable_slots_teacher_idx').on(table.teacherId),
]);

/* =============================================================================
 * BLOCK: XE ĐƯA ĐÓN / BÁN TRÚ / Y TẾ HỌC ĐƯỜNG
 * Thêm: 2026-06-24 — nguồn: mis_portal_handoff/02_schema/schema_transport_meals_health.ts
 * NOTE: Dùng text id (thay serial) + text thay numeric/time cho tương thích PGlite
 * ============================================================================= */

// === ENUMS ===
export const transportDirectionEnum = pgEnum('transport_direction', ['pickup', 'dropoff', 'both']);
export const transportBoardStatusEnum = pgEnum('transport_board_status', ['boarded', 'alighted', 'absent', 'no_show']);
export const vehicleStatusEnum = pgEnum('vehicle_status', ['active', 'maintenance', 'inactive']);
export const incidentSeverityEnum = pgEnum('incident_severity', ['low', 'medium', 'high', 'critical']);
export const mealPlanTypeEnum = pgEnum('meal_plan_type', ['full', 'lunch_only', 'custom']);
export const mealTypeEnum = pgEnum('meal_type', ['breakfast', 'lunch', 'snack', 'dinner']);
export const opsRegistrationStatusEnum = pgEnum('ops_registration_status', ['pending', 'active', 'paused', 'cancelled']);
export const healthSeverityEnum = pgEnum('health_severity', ['info', 'minor', 'moderate', 'serious', 'emergency']);
export const medicationStatusEnum = pgEnum('medication_status', ['active', 'completed', 'stopped']);

// === XE ĐƯA ĐÓN ===
export const transportRoutes = pgTable('transport_routes', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  direction: transportDirectionEnum('direction').default('both').notNull(),
  campus: text('campus'),
  active: boolean('active').default(true).notNull(),
  ...timestamps,
}, t => [
  uniqueIndex('transport_routes_code_idx').on(t.code),
  index('transport_routes_active_idx').on(t.active),
]);

export const transportStops = pgTable('transport_stops', {
  id: text('id').primaryKey(),
  routeId: text('route_id').references(() => transportRoutes.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  address: text('address'),
  lat: text('lat'),
  lng: text('lng'),
  sequence: integer('sequence').default(0).notNull(),
  pickupTime: text('pickup_time'),
  dropoffTime: text('dropoff_time'),
  ...timestamps,
}, t => [
  index('transport_stops_route_idx').on(t.routeId),
]);

export const transportVehicles = pgTable('transport_vehicles', {
  id: text('id').primaryKey(),
  plate: text('plate').notNull(),
  model: text('model'),
  capacity: integer('capacity').default(0).notNull(),
  driverId: text('driver_id').references(() => employeeProfiles.id),
  assistantId: text('assistant_id').references(() => employeeProfiles.id),
  routeId: text('route_id').references(() => transportRoutes.id),
  status: vehicleStatusEnum('status').default('active').notNull(),
  gpsDeviceId: text('gps_device_id'),
  nextMaintenanceAt: text('next_maintenance_at'),
  ...timestamps,
}, t => [
  uniqueIndex('transport_vehicles_plate_idx').on(t.plate),
  index('transport_vehicles_route_idx').on(t.routeId),
]);

export const transportStudentAssignments = pgTable('transport_student_assignments', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  routeId: text('route_id').references(() => transportRoutes.id, { onDelete: 'cascade' }).notNull(),
  pickupStopId: text('pickup_stop_id').references(() => transportStops.id),
  dropoffStopId: text('dropoff_stop_id').references(() => transportStops.id),
  guardianPhone: text('guardian_phone'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  status: opsRegistrationStatusEnum('status').default('active').notNull(),
  note: text('note'),
  ...timestamps,
}, t => [
  index('transport_assign_student_idx').on(t.studentId),
  index('transport_assign_route_idx').on(t.routeId),
  uniqueIndex('transport_assign_uniq').on(t.studentId, t.routeId),
]);

export const transportAttendance = pgTable('transport_attendance', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  routeId: text('route_id').references(() => transportRoutes.id, { onDelete: 'cascade' }).notNull(),
  vehicleId: text('vehicle_id').references(() => transportVehicles.id),
  date: text('date').notNull(),
  direction: transportDirectionEnum('direction').notNull(),
  boardOnTime: timestamp('board_on_time', { withTimezone: true }),
  boardOffTime: timestamp('board_off_time', { withTimezone: true }),
  status: transportBoardStatusEnum('status').default('boarded').notNull(),
  recordedBy: text('recorded_by').references(() => employeeProfiles.id),
  note: text('note'),
  ...timestamps,
}, t => [
  index('transport_att_day_idx').on(t.date, t.routeId),
  uniqueIndex('transport_att_student_day_idx').on(t.studentId, t.date, t.direction),
]);

export const transportIncidents = pgTable('transport_incidents', {
  id: text('id').primaryKey(),
  routeId: text('route_id').references(() => transportRoutes.id),
  vehicleId: text('vehicle_id').references(() => transportVehicles.id),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  type: text('type'),
  severity: incidentSeverityEnum('severity').default('low').notNull(),
  description: text('description'),
  handledBy: text('handled_by').references(() => employeeProfiles.id),
  notifiedParentAt: timestamp('notified_parent_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  ...timestamps,
}, t => [
  index('transport_incident_route_idx').on(t.routeId),
  index('transport_incident_time_idx').on(t.occurredAt),
]);

// === BÁN TRÚ / BẾP ĂN ===
export const mealMenus = pgTable('meal_menus', {
  id: text('id').primaryKey(),
  weekStart: text('week_start').notNull(),
  dayOfWeek: integer('day_of_week').notNull(),
  mealType: mealTypeEnum('meal_type').notNull(),
  items: jsonb('items').notNull().default([]),
  nutritionNote: text('nutrition_note'),
  calories: integer('calories'),
  campus: text('campus'),
  publishedBy: text('published_by').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  index('meal_menus_week_idx').on(t.weekStart),
  uniqueIndex('meal_menus_slot_idx').on(t.weekStart, t.dayOfWeek, t.mealType),
]);

export const mealRegistrations = pgTable('meal_registrations', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  planType: mealPlanTypeEnum('plan_type').default('lunch_only').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  monthlyFee: text('monthly_fee'),
  status: opsRegistrationStatusEnum('status').default('active').notNull(),
  note: text('note'),
  ...timestamps,
}, t => [
  index('meal_reg_student_idx').on(t.studentId),
  index('meal_reg_status_idx').on(t.status),
]);

export const mealDietaryProfiles = pgTable('meal_dietary_profiles', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  allergies: jsonb('allergies').notNull().default([]),
  specialDiet: text('special_diet'),
  notes: text('notes'),
  confirmedByParent: boolean('confirmed_by_parent').default(false).notNull(),
  ...timestamps,
}, t => [
  uniqueIndex('meal_diet_student_idx').on(t.studentId),
]);

export const mealDailyAttendance = pgTable('meal_daily_attendance', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(),
  mealType: mealTypeEnum('meal_type').notNull(),
  served: boolean('served').default(true).notNull(),
  note: text('note'),
  recordedBy: text('recorded_by').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  index('meal_att_day_idx').on(t.date, t.mealType),
  uniqueIndex('meal_att_student_day_idx').on(t.studentId, t.date, t.mealType),
]);

export const mealFeedback = pgTable('meal_feedback', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id),
  date: text('date').notNull(),
  mealType: mealTypeEnum('meal_type'),
  rating: integer('rating'),
  comment: text('comment'),
  ...timestamps,
}, t => [
  index('meal_feedback_day_idx').on(t.date),
]);

export const mealFoodSafetyLogs = pgTable('meal_food_safety_logs', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  supplier: text('supplier'),
  sampleKept: boolean('sample_kept').default(true).notNull(),
  temperatureNote: text('temperature_note'),
  inspector: text('inspector').references(() => employeeProfiles.id),
  note: text('note'),
  ...timestamps,
}, t => [
  index('meal_safety_day_idx').on(t.date),
]);

// === Y TẾ HỌC ĐƯỜNG ===
export const healthProfiles = pgTable('health_profiles', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  bloodType: text('blood_type'),
  heightCm: text('height_cm'),
  weightKg: text('weight_kg'),
  chronicConditions: jsonb('chronic_conditions').notNull().default([]),
  allergies: jsonb('allergies').notNull().default([]),
  vaccinations: jsonb('vaccinations').notNull().default([]),
  insuranceNumber: text('insurance_number'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  confidential: boolean('confidential').default(true).notNull(),
  ...timestamps,
}, t => [
  uniqueIndex('health_profile_student_idx').on(t.studentId),
]);

export const healthIncidents = pgTable('health_incidents', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  symptom: text('symptom'),
  firstAidGiven: text('first_aid_given'),
  severity: healthSeverityEnum('severity').default('minor').notNull(),
  handledBy: text('handled_by').references(() => employeeProfiles.id),
  referredToHospital: boolean('referred_to_hospital').default(false).notNull(),
  notifiedParentAt: timestamp('notified_parent_at', { withTimezone: true }),
  followUp: text('follow_up'),
  confidential: boolean('confidential').default(true).notNull(),
  ...timestamps,
}, t => [
  index('health_incident_student_idx').on(t.studentId),
  index('health_incident_time_idx').on(t.occurredAt),
  index('health_incident_severity_idx').on(t.severity),
]);

export const healthMedications = pgTable('health_medications', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  medicine: text('medicine').notNull(),
  dosage: text('dosage'),
  schedule: text('schedule'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  parentConsent: boolean('parent_consent').default(false).notNull(),
  status: medicationStatusEnum('status').default('active').notNull(),
  administeredBy: text('administered_by').references(() => employeeProfiles.id),
  note: text('note'),
  ...timestamps,
}, t => [
  index('health_med_student_idx').on(t.studentId),
  index('health_med_status_idx').on(t.status),
]);

export const healthSickLeaves = pgTable('health_sick_leaves', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  fromDate: text('from_date').notNull(),
  toDate: text('to_date'),
  reason: text('reason'),
  docAttachmentUrl: text('doc_attachment_url'),
  reportedBy: text('reported_by'),
  verifiedBy: text('verified_by').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  index('health_sick_student_idx').on(t.studentId),
]);

// === CSKH TICKETS ===
export const parentTickets = pgTable('parent_tickets', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id),
  parentName: text('parent_name').notNull(),
  parentPhone: text('parent_phone'),
  category: text('category').notNull(), // 'academic' | 'service' | 'finance' | 'other'
  subject: text('subject').notNull(),
  description: text('description'),
  priority: text('priority').default('normal').notNull(), // 'normal' | 'high' | 'urgent'
  status: text('status').default('open').notNull(), // 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo: text('assigned_to').references(() => users.id),
  firstRespondedAt: timestamp('first_responded_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  satisfactionRating: integer('satisfaction_rating'), // 1-5
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
}, t => [
  index('parent_ticket_status_idx').on(t.status),
  index('parent_ticket_student_idx').on(t.studentId),
  index('parent_ticket_assigned_idx').on(t.assignedTo),
]);

export const parentTicketActivities = pgTable('parent_ticket_activities', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').references(() => parentTickets.id, { onDelete: 'cascade' }).notNull(),
  actorId: text('actor_id').references(() => users.id),
  actorName: text('actor_name'),
  action: text('action').notNull(), // 'comment' | 'status_change' | 'assign' | 'resolve'
  content: text('content'),
  meta: jsonb('meta').notNull().default({}),
  ...timestamps,
}, t => [
  index('ticket_activity_ticket_idx').on(t.ticketId),
]);

/* =============================================================================
 * HẾT BLOCK SCHEMA BỔ SUNG (Xe / Bán trú / Y tế / CSKH)
 * ============================================================================= */

/* =============================================================================
 * BLOCK: TỔ CHUYÊN MÔN / GIÁO ÁN / ĐỀ THI / NỀ NẾP / SỔ LIÊN LẠC
 * Thêm: 2026-06-24 — nguồn: mis_portal_handoff/02_schema/schema_academic_teacher.ts
 * ============================================================================= */

// === ENUMS ACADEMIC ===
export const academicLevelEnum = pgEnum('academic_level', ['primary', 'secondary', 'high']);
export const lessonPlanStatusEnum = pgEnum('lesson_plan_status', ['draft', 'submitted', 'approved', 'rejected', 'published']);
export const examTypeEnum = pgEnum('exam_type', ['quiz', 'periodic', 'midterm', 'final', 'mock']);
export const examStatusEnum = pgEnum('exam_status', ['planned', 'ongoing', 'grading', 'completed', 'cancelled']);
export const questionDifficultyEnum = pgEnum('question_difficulty', ['recognition', 'comprehension', 'application', 'advanced']);
export const questionTypeEnum = pgEnum('question_type', ['mcq', 'true_false', 'short_answer', 'essay']);
export const academicAttendanceStatusEnum = pgEnum('academic_attendance_status', ['present', 'absent_excused', 'absent_unexcused', 'late']);
export const conductTypeEnum = pgEnum('conduct_type', ['violation', 'progress', 'support', 'praise']);
export const conductTermRatingEnum = pgEnum('conduct_term_rating', ['excellent', 'good', 'fair', 'weak']);
export const observationResultEnum = pgEnum('observation_result', ['excellent', 'good', 'achieved', 'needs_improvement']);

// === TỔ CHUYÊN MÔN ===
export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  level: academicLevelEnum('level'),
  active: boolean('active').default(true).notNull(),
  ...timestamps,
}, t => [
  uniqueIndex('subjects_code_idx').on(t.code),
]);

export const subjectGroups = pgTable('subject_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  level: academicLevelEnum('level'),
  headTeacherId: text('head_teacher_id').references(() => employeeProfiles.id),
  deputyTeacherId: text('deputy_teacher_id').references(() => employeeProfiles.id),
  description: text('description'),
  ...timestamps,
}, t => [
  index('subject_groups_name_idx').on(t.name),
]);

export const subjectGroupMembers = pgTable('subject_group_members', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => subjectGroups.id, { onDelete: 'cascade' }).notNull(),
  teacherId: text('teacher_id').references(() => employeeProfiles.id, { onDelete: 'cascade' }).notNull(),
  roleInGroup: text('role_in_group'),
  joinedAt: text('joined_at'),
  ...timestamps,
}, t => [
  uniqueIndex('sg_member_uniq').on(t.groupId, t.teacherId),
  index('sg_member_group_idx').on(t.groupId),
]);

export const subjectGroupMeetings = pgTable('subject_group_meetings', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => subjectGroups.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(),
  title: text('title'),
  minutes: text('minutes'),
  attendees: jsonb('attendees').notNull().default([]),
  attachmentUrl: text('attachment_url'),
  createdBy: text('created_by').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  index('sg_meeting_group_idx').on(t.groupId, t.date),
]);

// === PHÂN CÔNG GIẢNG DẠY ===
export const teachingAssignments = pgTable('teaching_assignments', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id').references(() => employeeProfiles.id).notNull(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  classId: text('class_id').references(() => classes.id).notNull(),
  schoolYear: text('school_year'),
  term: text('term'),
  periodsPerWeek: integer('periods_per_week').default(0),
  ...timestamps,
}, t => [
  index('teach_assign_teacher_idx').on(t.teacherId),
  index('teach_assign_class_idx').on(t.classId),
  uniqueIndex('teach_assign_uniq').on(t.teacherId, t.subjectId, t.classId, t.schoolYear, t.term),
]);

export const timetableEntries = pgTable('timetable_entries', {
  id: text('id').primaryKey(),
  classId: text('class_id').references(() => classes.id).notNull(),
  subjectId: text('subject_id').references(() => subjects.id),
  teacherId: text('teacher_id').references(() => employeeProfiles.id),
  dayOfWeek: integer('day_of_week').notNull(),
  period: integer('period').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  room: text('room'),
  schoolYear: text('school_year'),
  term: text('term'),
  ...timestamps,
}, t => [
  index('tt_class_day_idx').on(t.classId, t.dayOfWeek),
  uniqueIndex('tt_slot_uniq').on(t.classId, t.dayOfWeek, t.period, t.schoolYear, t.term),
]);

// === GIÁO ÁN & DỰ GIỜ ===
export const lessonPlans = pgTable('lesson_plans', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id').references(() => employeeProfiles.id).notNull(),
  subjectId: text('subject_id').references(() => subjects.id),
  classId: text('class_id').references(() => classes.id),
  groupId: text('group_id').references(() => subjectGroups.id),
  title: text('title').notNull(),
  week: integer('week'),
  schoolYear: text('school_year'),
  term: text('term'),
  content: text('content'),
  fileUrl: text('file_url'),
  status: lessonPlanStatusEnum('status').default('draft').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  approvedBy: text('approved_by').references(() => employeeProfiles.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  reviewNote: text('review_note'),
  ...timestamps,
}, t => [
  index('lesson_plan_teacher_idx').on(t.teacherId),
  index('lesson_plan_status_idx').on(t.status),
]);

export const teachingObservations = pgTable('teaching_observations', {
  id: text('id').primaryKey(),
  observerId: text('observer_id').references(() => employeeProfiles.id).notNull(),
  teacherId: text('teacher_id').references(() => employeeProfiles.id).notNull(),
  subjectId: text('subject_id').references(() => subjects.id),
  classId: text('class_id').references(() => classes.id),
  date: text('date').notNull(),
  period: integer('period'),
  score: text('score'),
  result: observationResultEnum('result'),
  strengths: text('strengths'),
  improvements: text('improvements'),
  ...timestamps,
}, t => [
  index('obs_teacher_idx').on(t.teacherId, t.date),
]);

// === ĐỀ THI / NGÂN HÀNG CÂU HỎI ===
export const examQuestionBank = pgTable('exam_question_bank', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  grade: integer('grade'),
  chapter: text('chapter'),
  questionType: questionTypeEnum('question_type').default('mcq').notNull(),
  difficulty: questionDifficultyEnum('difficulty').default('comprehension').notNull(),
  content: text('content').notNull(),
  options: jsonb('options').notNull().default([]),
  answer: text('answer'),
  points: text('points').default('1'),
  tags: jsonb('tags').notNull().default([]),
  createdBy: text('created_by').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  index('qbank_subject_idx').on(t.subjectId, t.grade),
  index('qbank_difficulty_idx').on(t.difficulty),
]);

export const exams = pgTable('exams', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  classId: text('class_id').references(() => classes.id),
  teacherId: text('teacher_id').references(() => employeeProfiles.id),
  title: text('title').notNull(),
  type: examTypeEnum('type').default('periodic').notNull(),
  date: text('date'),
  durationMinutes: integer('duration_minutes'),
  totalPoints: text('total_points').default('10'),
  schoolYear: text('school_year'),
  term: text('term'),
  status: examStatusEnum('status').default('planned').notNull(),
  questionIds: jsonb('question_ids').notNull().default([]),
  ...timestamps,
}, t => [
  index('exam_class_idx').on(t.classId),
  index('exam_subject_idx').on(t.subjectId),
  index('exam_status_idx').on(t.status),
]);

export const examResults = pgTable('exam_results', {
  id: text('id').primaryKey(),
  examId: text('exam_id').references(() => exams.id, { onDelete: 'cascade' }).notNull(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  score: text('score'),
  rank: integer('rank'),
  note: text('note'),
  gradedBy: text('graded_by').references(() => employeeProfiles.id),
  gradedAt: timestamp('graded_at', { withTimezone: true }),
  ...timestamps,
}, t => [
  index('exam_result_exam_idx').on(t.examId),
  uniqueIndex('exam_result_uniq').on(t.examId, t.studentId),
]);

export const subjectQualityReports = pgTable('subject_quality_reports', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').references(() => subjects.id),
  classId: text('class_id').references(() => classes.id),
  grade: integer('grade'),
  schoolYear: text('school_year'),
  term: text('term'),
  avgScore: text('avg_score'),
  passRate: text('pass_rate'),
  excellentRate: text('excellent_rate'),
  weakCount: integer('weak_count'),
  summary: text('summary'),
  createdBy: text('created_by').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  index('sqr_scope_idx').on(t.subjectId, t.classId, t.term),
]);

// === GVCN / CHỦ NHIỆM ===
export const homeroomAssignments = pgTable('homeroom_assignments', {
  id: text('id').primaryKey(),
  classId: text('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  teacherId: text('teacher_id').references(() => employeeProfiles.id).notNull(),
  role: text('role').notNull(), // 'GVCN' | 'QuanNhiem'
  schoolYear: text('school_year'),
  ...timestamps,
}, t => [
  index('homeroom_class_idx').on(t.classId),
  uniqueIndex('homeroom_uniq').on(t.classId, t.teacherId, t.role, t.schoolYear),
]);

export const studentAttendance = pgTable('student_attendance', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  classId: text('class_id').references(() => classes.id).notNull(),
  date: text('date').notNull(),
  period: integer('period'),
  status: academicAttendanceStatusEnum('status').default('present').notNull(),
  reason: text('reason'),
  recordedBy: text('recorded_by').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  index('att_day_idx').on(t.date, t.classId),
  uniqueIndex('att_student_day_idx').on(t.studentId, t.date, t.period),
]);

export const studentConductLogs = pgTable('student_conduct_logs', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  classId: text('class_id').references(() => classes.id),
  date: text('date').notNull(),
  type: conductTypeEnum('type').notNull(),
  description: text('description'),
  points: integer('points'),
  handledBy: text('handled_by').references(() => employeeProfiles.id),
  notifiedParent: boolean('notified_parent').default(false).notNull(),
  ...timestamps,
}, t => [
  index('conduct_student_idx').on(t.studentId, t.date),
  index('conduct_type_idx').on(t.type),
]);

export const conductTermRatings = pgTable('conduct_term_ratings', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  schoolYear: text('school_year'),
  term: text('term'),
  rating: conductTermRatingEnum('rating'),
  strengths: text('strengths'),
  reminders: text('reminders'),
  homeroomTeacherId: text('homeroom_teacher_id').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  uniqueIndex('conduct_term_uniq').on(t.studentId, t.schoolYear, t.term),
]);

export const communicationBook = pgTable('communication_book', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(),
  authorType: text('author_type').notNull(), // 'teacher' | 'parent'
  authorId: text('author_id'),
  content: text('content').notNull(),
  category: text('category'),
  parentSeenAt: timestamp('parent_seen_at', { withTimezone: true }),
  teacherSeenAt: timestamp('teacher_seen_at', { withTimezone: true }),
  ...timestamps,
}, t => [
  index('commbook_student_idx').on(t.studentId, t.date),
]);

export const rewardsDisciplines = pgTable('rewards_disciplines', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // 'reward' | 'discipline'
  reason: text('reason'),
  decision: text('decision'),
  decidedBy: text('decided_by').references(() => employeeProfiles.id),
  date: text('date'),
  documentUrl: text('document_url'),
  ...timestamps,
}, t => [
  index('reward_student_idx').on(t.studentId),
]);

/* =============================================================================
 * HẾT BLOCK SCHEMA TỔ CHUYÊN MÔN / GIÁO ÁN / GVCN
 * ============================================================================= */

/* =============================================================================
 * BLOCK: HÀNH CHÍNH — CÔNG VĂN & PHÒNG HỌP
 * Thêm: 2026-06-24
 * ============================================================================= */

// === ENUMS ===
export const letterTypeEnum = pgEnum('letter_type', ['incoming', 'outgoing', 'internal']);
export const letterStatusEnum = pgEnum('letter_status', ['draft', 'pending_approval', 'approved', 'sent', 'archived', 'rejected']);
export const letterApprovalStatusEnum = pgEnum('letter_approval_status', ['pending', 'approved', 'rejected', 'delegated']);
export const roomStatusEnum = pgEnum('room_status', ['available', 'occupied', 'maintenance']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);

// === CÔNG VĂN ===
export const officialLetters = pgTable('official_letters', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // CV-2026-0001
  type: letterTypeEnum('type').default('incoming').notNull(),
  status: letterStatusEnum('status').default('draft').notNull(),
  subject: text('subject').notNull(),
  summary: text('summary'),
  fromOrg: text('from_org'),        // đơn vị gửi
  toOrg: text('to_org'),            // đơn vị nhận
  issuedDate: text('issued_date'),  // ngày ban hành
  receivedDate: text('received_date'),
  dueDate: text('due_date'),
  fileUrl: text('file_url'),
  tags: jsonb('tags').notNull().default([]),
  priority: text('priority').default('normal'),  // normal / urgent
  createdBy: text('created_by').references(() => employeeProfiles.id),
  assignedTo: text('assigned_to').references(() => employeeProfiles.id),
  ...timestamps,
}, t => [
  index('official_letters_type_idx').on(t.type, t.status),
  index('official_letters_issued_idx').on(t.issuedDate),
]);

export const letterApprovals = pgTable('letter_approvals', {
  id: text('id').primaryKey(),
  letterId: text('letter_id').references(() => officialLetters.id, { onDelete: 'cascade' }).notNull(),
  approverId: text('approver_id').references(() => employeeProfiles.id).notNull(),
  stepOrder: integer('step_order').default(1).notNull(), // thứ tự ký
  status: letterApprovalStatusEnum('status').default('pending').notNull(),
  comment: text('comment'),
  actionAt: timestamp('action_at', { withTimezone: true }),
  ...timestamps,
}, t => [
  index('letter_approval_letter_idx').on(t.letterId),
  uniqueIndex('letter_approval_step_uniq').on(t.letterId, t.stepOrder),
]);

// === PHÒNG HỌP ===
export const meetingRooms = pgTable('meeting_rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  building: text('building'),
  floor: text('floor'),
  capacity: integer('capacity').default(10),
  facilities: jsonb('facilities').notNull().default([]), // ['projector','whiteboard','ac']
  status: roomStatusEnum('status').default('available').notNull(),
  active: boolean('active').default(true).notNull(),
  ...timestamps,
}, t => [
  index('meeting_rooms_status_idx').on(t.status),
]);

export const roomBookings = pgTable('room_bookings', {
  id: text('id').primaryKey(),
  roomId: text('room_id').references(() => meetingRooms.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  organizer: text('organizer').references(() => employeeProfiles.id),
  date: text('date').notNull(),     // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(),
  attendeesJson: jsonb('attendees_json').notNull().default([]), // [employeeProfileId]
  purpose: text('purpose'),
  status: bookingStatusEnum('status').default('confirmed').notNull(),
  cancelReason: text('cancel_reason'),
  ...timestamps,
}, t => [
  index('room_bookings_room_date_idx').on(t.roomId, t.date),
  index('room_bookings_organizer_idx').on(t.organizer),
]);

/* =============================================================================
 * HẾT BLOCK SCHEMA HÀNH CHÍNH (CÔNG VĂN & PHÒNG HỌP)
 * ============================================================================= */
