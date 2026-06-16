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
  payload: jsonb('payload').notNull().default({}),
  ...timestamps,
});

export const systemSettings = pgTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  ...timestamps,
});

