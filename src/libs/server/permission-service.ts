import { randomUUID } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { getCurrentActor } from './auth-helper';
import { db, schema } from './db';
import { getUserModules, getModuleDataScope } from './module-auth-service';

export type ActionType = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export' | 'manage' | string;
export type DataScope = 'none' | 'own' | 'class' | 'group' | 'department' | 'school' | 'all' | string;

export interface EffectivePermission {
  code: string;
  action: string;
  dataScope: DataScope;
  effect: 'ALLOW' | 'DENY';
}

export interface UserEffectivePermissions {
  permissions: Map<string, EffectivePermission>;
  allowedModules: string[];
  deniedPermissions: string[];
}

export class PermissionError extends Error {
  status: number;
  code: 'UNAUTHORIZED' | 'PERMISSION_DENIED' | 'MODULE_DISABLED' | 'SCOPE_DENIED';

  constructor(
    code: PermissionError['code'],
    message: string,
    status = code === 'UNAUTHORIZED' ? 401 : 403,
  ) {
    super(message);
    this.name = 'PermissionError';
    this.code = code;
    this.status = status;
  }
}

const SCOPE_LEVELS: Record<string, number> = {
  none: 0,
  own: 1,
  class: 2,
  group: 3,
  department: 4,
  school: 5,
  all: 6,
};

const CORE_MODULES = [
  { code: 'DASHBOARD', name: 'Bộ máy điều hành', sortOrder: 1, isSystem: true },
  { code: 'ACADEMIC', name: 'Học vụ và nhân sự', sortOrder: 2, isSystem: false },
  { code: 'OPERATIONS', name: 'Vận hành và nguồn lực', sortOrder: 3, isSystem: false },
  { code: 'SERVICES', name: 'Dịch vụ học đường', sortOrder: 4, isSystem: false },
  { code: 'CRM_ADMISSIONS', name: 'Tuyển sinh CRM', sortOrder: 5, isSystem: false, routePath: '/admissions' },
  { code: 'SYSTEM', name: 'Cài đặt hệ thống', sortOrder: 99, isSystem: true },
];

const CORE_FEATURES = [
  { moduleCode: 'DASHBOARD', code: 'DASHBOARD_COUNCIL', name: 'Dashboard hội đồng', sortOrder: 1 },
  { moduleCode: 'DASHBOARD', code: 'DASHBOARD_PRINCIPAL', name: 'Dashboard hiệu trưởng', sortOrder: 2 },
  { moduleCode: 'DASHBOARD', code: 'DIRECTIVES', name: 'Chỉ đạo BGH', sortOrder: 3 },
  { moduleCode: 'DASHBOARD', code: 'TASKS', name: 'Nhiệm vụ và dự án', sortOrder: 4 },
  { moduleCode: 'DASHBOARD', code: 'APPROVALS', name: 'Đơn từ và phê duyệt', sortOrder: 5 },
  { moduleCode: 'DASHBOARD', code: 'RISKS', name: 'Quản trị rủi ro', sortOrder: 6 },
  { moduleCode: 'DASHBOARD', code: 'ANNOUNCEMENTS', name: 'Thông báo nội bộ', sortOrder: 7 },
  { moduleCode: 'ACADEMIC', code: 'STUDENTS', name: 'Hồ sơ học sinh', sortOrder: 1 },
  { moduleCode: 'ACADEMIC', code: 'CLASSES', name: 'Quản lý lớp học', sortOrder: 2 },
  { moduleCode: 'ACADEMIC', code: 'LESSON_PLANS', name: 'Giáo án và dự giờ', sortOrder: 3 },
  { moduleCode: 'ACADEMIC', code: 'SCHEDULE', name: 'Thời khóa biểu và lịch', sortOrder: 4 },
  { moduleCode: 'ACADEMIC', code: 'EXAMS', name: 'Kiểm tra và đánh giá', sortOrder: 5 },
  { moduleCode: 'ACADEMIC', code: 'CONDUCT', name: 'Sổ liên lạc và nề nếp', sortOrder: 6 },
  { moduleCode: 'ACADEMIC', code: 'HRM', name: 'Nhân sự trường học', sortOrder: 7 },
  { moduleCode: 'OPERATIONS', code: 'PARENT_TICKETS', name: 'CSKH phụ huynh', sortOrder: 1 },
  { moduleCode: 'OPERATIONS', code: 'EVENTS', name: 'Sự kiện và truyền thông', sortOrder: 2 },
  { moduleCode: 'OPERATIONS', code: 'TRANSPORT', name: 'Xe đưa đón', sortOrder: 3 },
  { moduleCode: 'OPERATIONS', code: 'MEALS', name: 'Bán trú và bếp ăn', sortOrder: 4 },
  { moduleCode: 'OPERATIONS', code: 'FACILITIES', name: 'Tài sản và cơ sở vật chất', sortOrder: 5 },
  { moduleCode: 'OPERATIONS', code: 'KNOWLEDGE', name: 'Kho quy trình và tri thức', sortOrder: 6 },
  { moduleCode: 'OPERATIONS', code: 'MEETINGS', name: 'Hành chính và cuộc họp', sortOrder: 7 },
  { moduleCode: 'SERVICES', code: 'SERVICE_OVERVIEW', name: 'Tổng quan dịch vụ học đường', sortOrder: 1 },
  { moduleCode: 'SERVICES', code: 'SERVICE_TICKETS', name: 'Trung tâm ticket dịch vụ', sortOrder: 2 },
  { moduleCode: 'SERVICES', code: 'SERVICE_TRANSPORT', name: 'Xe đưa đón dịch vụ', sortOrder: 3 },
  { moduleCode: 'SERVICES', code: 'SERVICE_MEALS', name: 'Suất ăn và căn tin', sortOrder: 4 },
  { moduleCode: 'SERVICES', code: 'SERVICE_HEALTH', name: 'Y tế học đường', sortOrder: 5 },
  { moduleCode: 'SERVICES', code: 'SERVICE_BOARDING', name: 'Bán trú nội trú', sortOrder: 6 },
  { moduleCode: 'SERVICES', code: 'SERVICE_FACILITIES', name: 'Cơ sở vật chất dịch vụ', sortOrder: 7 },
  { moduleCode: 'SERVICES', code: 'SERVICE_REPORTS', name: 'Báo cáo và KPI dịch vụ', sortOrder: 8 },
  { moduleCode: 'SERVICES', code: 'SERVICE_SETTINGS', name: 'Cấu hình dịch vụ', sortOrder: 9 },
  { moduleCode: 'SYSTEM', code: 'PERSONAL_SETTINGS', name: 'Cấu hình cá nhân', sortOrder: 1 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_LEADS', name: 'Lead tuyển sinh', sortOrder: 1 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_PIPELINE', name: 'Pipeline và lịch hẹn', sortOrder: 2 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_DOCUMENTS', name: 'Hồ sơ và tài liệu', sortOrder: 3 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_PAYMENTS', name: 'Học phí và thanh toán', sortOrder: 4 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_WORKFLOW', name: 'Workflow tự động', sortOrder: 5 },
  { moduleCode: 'SYSTEM', code: 'RBAC', name: 'Phân quyền', sortOrder: 1 },
];

const CORE_PERMISSIONS = [
  { moduleCode: 'DASHBOARD', featureCode: 'DASHBOARD_COUNCIL', code: 'dashboard.council.view', name: 'Xem dashboard hội đồng', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'DASHBOARD_PRINCIPAL', code: 'dashboard.principal.view', name: 'Xem dashboard hiệu trưởng', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'DIRECTIVES', code: 'directive.view', name: 'Xem chỉ đạo', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'DIRECTIVES', code: 'directive.create', name: 'Tạo chỉ đạo', action: 'create' },
  { moduleCode: 'DASHBOARD', featureCode: 'DIRECTIVES', code: 'directive.update', name: 'Cập nhật chỉ đạo', action: 'update' },
  { moduleCode: 'DASHBOARD', featureCode: 'TASKS', code: 'task.view', name: 'Xem nhiệm vụ', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'TASKS', code: 'task.create', name: 'Tạo nhiệm vụ', action: 'create' },
  { moduleCode: 'DASHBOARD', featureCode: 'TASKS', code: 'task.update', name: 'Cập nhật nhiệm vụ', action: 'update' },
  { moduleCode: 'DASHBOARD', featureCode: 'TASKS', code: 'task.approve', name: 'Duyệt nhiệm vụ', action: 'approve' },
  { moduleCode: 'DASHBOARD', featureCode: 'APPROVALS', code: 'approval.view', name: 'Xem phê duyệt', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'APPROVALS', code: 'approval.approve', name: 'Xử lý phê duyệt', action: 'approve' },
  { moduleCode: 'DASHBOARD', featureCode: 'RISKS', code: 'risk.view', name: 'Xem rủi ro', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'RISKS', code: 'risk.create', name: 'Tạo rủi ro', action: 'create' },
  { moduleCode: 'DASHBOARD', featureCode: 'RISKS', code: 'risk.update', name: 'Cập nhật rủi ro', action: 'update' },
  { moduleCode: 'DASHBOARD', featureCode: 'RISKS', code: 'risk.manage', name: 'Quản trị rủi ro', action: 'manage' },
  { moduleCode: 'DASHBOARD', featureCode: 'ANNOUNCEMENTS', code: 'announcement.view', name: 'Xem thông báo', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'ANNOUNCEMENTS', code: 'announcement.create', name: 'Tạo thông báo', action: 'create' },
  { moduleCode: 'ACADEMIC', featureCode: 'STUDENTS', code: 'student.view', name: 'Xem hồ sơ học sinh', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'STUDENTS', code: 'student.create', name: 'Tạo hồ sơ học sinh', action: 'create' },
  { moduleCode: 'ACADEMIC', featureCode: 'STUDENTS', code: 'student.update', name: 'Cập nhật hồ sơ học sinh', action: 'update' },
  { moduleCode: 'ACADEMIC', featureCode: 'STUDENTS', code: 'student.delete', name: 'Xóa hồ sơ học sinh', action: 'delete' },
  { moduleCode: 'ACADEMIC', featureCode: 'CLASSES', code: 'class.view', name: 'Xem lớp học', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'CLASSES', code: 'class.manage', name: 'Quản lý lớp học', action: 'manage' },
  { moduleCode: 'ACADEMIC', featureCode: 'LESSON_PLANS', code: 'academic.lesson_plan.view', name: 'Xem giáo án', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'LESSON_PLANS', code: 'academic.lesson_plan.create', name: 'Tạo giáo án', action: 'create' },
  { moduleCode: 'ACADEMIC', featureCode: 'LESSON_PLANS', code: 'academic.lesson_plan.update', name: 'Cập nhật giáo án', action: 'update' },
  { moduleCode: 'ACADEMIC', featureCode: 'LESSON_PLANS', code: 'academic.lesson_plan.approve', name: 'Duyệt giáo án', action: 'approve' },
  { moduleCode: 'ACADEMIC', featureCode: 'SCHEDULE', code: 'schedule.view', name: 'Xem thời khóa biểu', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'SCHEDULE', code: 'schedule.manage', name: 'Quản lý thời khóa biểu', action: 'manage' },
  { moduleCode: 'ACADEMIC', featureCode: 'EXAMS', code: 'exam.view', name: 'Xem kiểm tra đánh giá', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'EXAMS', code: 'exam.manage', name: 'Quản lý kiểm tra đánh giá', action: 'manage' },
  { moduleCode: 'ACADEMIC', featureCode: 'CONDUCT', code: 'conduct.view', name: 'Xem nề nếp', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'CONDUCT', code: 'conduct.update', name: 'Cập nhật nề nếp', action: 'update' },
  { moduleCode: 'ACADEMIC', featureCode: 'HRM', code: 'hrm.view', name: 'Xem nhân sự', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'HRM', code: 'hrm.manage', name: 'Quản lý nhân sự', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'PARENT_TICKETS', code: 'parent_ticket.view', name: 'Xem ticket phụ huynh', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'PARENT_TICKETS', code: 'parent_ticket.process', name: 'Xử lý ticket phụ huynh', action: 'update' },
  { moduleCode: 'OPERATIONS', featureCode: 'EVENTS', code: 'event.view', name: 'Xem sự kiện', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'EVENTS', code: 'event.manage', name: 'Quản lý sự kiện', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'TRANSPORT', code: 'transport.view', name: 'Xem xe đưa đón', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'TRANSPORT', code: 'transport.manage', name: 'Quản lý xe đưa đón', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'MEALS', code: 'meal.view', name: 'Xem bán trú bếp ăn', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'MEALS', code: 'meal.manage', name: 'Quản lý bán trú bếp ăn', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'FACILITIES', code: 'facility.view', name: 'Xem tài sản cơ sở vật chất', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'FACILITIES', code: 'facility.manage', name: 'Quản lý tài sản cơ sở vật chất', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'KNOWLEDGE', code: 'knowledge.view', name: 'Xem tri thức quy trình', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'KNOWLEDGE', code: 'knowledge.manage', name: 'Quản lý tri thức quy trình', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'MEETINGS', code: 'meeting.view', name: 'Xem cuộc họp', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'MEETINGS', code: 'meeting.manage', name: 'Quản lý cuộc họp', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_OVERVIEW', code: 'service.overview.view', name: 'Xem tổng quan dịch vụ', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_TICKETS', code: 'service.ticket.view', name: 'Xem ticket dịch vụ', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_TICKETS', code: 'service.ticket.process', name: 'Xử lý ticket dịch vụ', action: 'update' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_TRANSPORT', code: 'service.transport.view', name: 'Xem xe đưa đón dịch vụ', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_TRANSPORT', code: 'service.transport.manage', name: 'Quản lý xe đưa đón dịch vụ', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_MEALS', code: 'service.meal.view', name: 'Xem suất ăn căn tin', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_MEALS', code: 'service.meal.manage', name: 'Quản lý suất ăn căn tin', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_HEALTH', code: 'service.health.view', name: 'Xem y tế học đường', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_HEALTH', code: 'service.health.manage', name: 'Quản lý y tế học đường', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_BOARDING', code: 'service.boarding.view', name: 'Xem bán trú nội trú', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_BOARDING', code: 'service.boarding.manage', name: 'Quản lý bán trú nội trú', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_FACILITIES', code: 'service.facility.view', name: 'Xem cơ sở vật chất dịch vụ', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_FACILITIES', code: 'service.facility.manage', name: 'Quản lý cơ sở vật chất dịch vụ', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_REPORTS', code: 'service.report.view', name: 'Xem báo cáo dịch vụ', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_REPORTS', code: 'service.report.export', name: 'Xuất báo cáo dịch vụ', action: 'export' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_SETTINGS', code: 'service.setting.manage', name: 'Cấu hình dịch vụ', action: 'manage' },
  { moduleCode: 'SYSTEM', featureCode: 'PERSONAL_SETTINGS', code: 'system.profile.update', name: 'Cập nhật cấu hình cá nhân', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.lead.view', name: 'Xem lead tuyển sinh', action: 'view' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.lead.create', name: 'Tạo lead tuyển sinh', action: 'create' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.lead.update', name: 'Sửa lead tuyển sinh', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.lead.delete', name: 'Xóa lead tuyển sinh', action: 'delete' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PIPELINE', code: 'crm.lead.stage.update', name: 'Cập nhật pipeline CRM', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PIPELINE', code: 'crm.appointment.update', name: 'Cập nhật lịch hẹn CRM', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_DOCUMENTS', code: 'crm.document.update', name: 'Cập nhật tài liệu CRM', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PAYMENTS', code: 'crm.payment.view', name: 'Xem thanh toán CRM', action: 'view' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PAYMENTS', code: 'crm.payment.create', name: 'Tạo thanh toán CRM', action: 'create' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PAYMENTS', code: 'crm.payment.reconcile', name: 'Đối soát thanh toán CRM', action: 'manage' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.import.preview', name: 'Kiểm tra import CRM', action: 'import' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.export', name: 'Xuất dữ liệu CRM', action: 'export' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_WORKFLOW', code: 'crm.workflow.run', name: 'Chạy workflow CRM', action: 'manage' },
  { moduleCode: 'SYSTEM', featureCode: 'RBAC', code: 'system.rbac.manage', name: 'Quản trị phân quyền', action: 'manage', isSystem: true },
];

let catalogEnsured = false;

export async function ensurePermissionCatalog() {
  if (catalogEnsured) return;

  for (const moduleDef of CORE_MODULES) {
    const [existing] = await db.select().from(schema.sysModules).where(eq(schema.sysModules.code, moduleDef.code)).limit(1);
    if (!existing) {
      await db.insert(schema.sysModules).values({
        id: randomUUID(),
        code: moduleDef.code,
        name: moduleDef.name,
        routePath: moduleDef.routePath || null,
        sortOrder: moduleDef.sortOrder,
        isSystem: moduleDef.isSystem,
        isEnabled: true,
      });
    } else if (existing.name !== moduleDef.name) {
      await db.update(schema.sysModules).set({ name: moduleDef.name }).where(eq(schema.sysModules.code, moduleDef.code));
    }
  }

  const modules = await db.select().from(schema.sysModules);
  const moduleMap = new Map(modules.map(module => [module.code, module.id]));

  for (const featureDef of CORE_FEATURES) {
    const moduleId = moduleMap.get(featureDef.moduleCode);
    if (!moduleId) continue;

    const [existing] = await db.select().from(schema.sysFeatures).where(eq(schema.sysFeatures.code, featureDef.code)).limit(1);
    if (!existing) {
      await db.insert(schema.sysFeatures).values({
        id: randomUUID(),
        moduleId,
        code: featureDef.code,
        name: featureDef.name,
        sortOrder: featureDef.sortOrder,
        isEnabled: true,
      });
    } else if (existing.name !== featureDef.name) {
      await db.update(schema.sysFeatures).set({ name: featureDef.name }).where(eq(schema.sysFeatures.code, featureDef.code));
    }
  }

  const features = await db.select().from(schema.sysFeatures);
  const featureMap = new Map(features.map(feature => [feature.code, feature.id]));

  for (const permissionDef of CORE_PERMISSIONS) {
    const moduleId = moduleMap.get(permissionDef.moduleCode);
    if (!moduleId) continue;

    const [existing] = await db.select().from(schema.sysPermissions).where(eq(schema.sysPermissions.code, permissionDef.code)).limit(1);
    if (!existing) {
      await db.insert(schema.sysPermissions).values({
        id: randomUUID(),
        moduleId,
        featureId: featureMap.get(permissionDef.featureCode) || null,
        code: permissionDef.code,
        name: permissionDef.name,
        action: permissionDef.action,
        isSystem: Boolean(permissionDef.isSystem),
      });
    } else if (existing.name !== permissionDef.name) {
      await db.update(schema.sysPermissions).set({ name: permissionDef.name }).where(eq(schema.sysPermissions.code, permissionDef.code));
    }
  }

  for (const roleDef of [
    { code: 'ADMIN', name: 'Quản trị hệ thống', level: 100, isSystemRole: true },
    { code: 'ADMISSIONS', name: 'Nhân sự tuyển sinh', level: 40, isSystemRole: false },
    { code: 'ACCOUNTANT', name: 'Kế toán', level: 40, isSystemRole: false },
    { code: 'MANAGER', name: 'Trưởng phòng', level: 60, isSystemRole: false },
    { code: 'STAFF', name: 'Nhân viên', level: 10, isSystemRole: false },
  ]) {
    const [existing] = await db.select().from(schema.roles).where(eq(schema.roles.code, roleDef.code)).limit(1);
    if (!existing) {
      await db.insert(schema.roles).values({
        id: randomUUID(),
        code: roleDef.code,
        name: roleDef.name,
        level: roleDef.level,
        isSystemRole: roleDef.isSystemRole,
        status: 'ACTIVE',
      });
    } else if (existing.name !== roleDef.name) {
      await db.update(schema.roles).set({ name: roleDef.name }).where(eq(schema.roles.code, roleDef.code));
    }
  }

  catalogEnsured = true;
}

function isActiveWindow(start?: Date | string | null, end?: Date | string | null, now = new Date()) {
  if (start && new Date(start) > now) return false;
  if (end && new Date(end) < now) return false;
  return true;
}

function strongestScope(left: DataScope, right: DataScope): DataScope {
  return (SCOPE_LEVELS[right] || 0) > (SCOPE_LEVELS[left] || 0) ? right : left;
}

export async function getEffectivePermissions(userId: string): Promise<UserEffectivePermissions> {
  const result: UserEffectivePermissions = {
    permissions: new Map(),
    allowedModules: [],
    deniedPermissions: [],
  };

  try {
    await ensurePermissionCatalog();

    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!user) return result;

    const now = new Date();
    const roleCodes = new Set<string>();
    const deptIds = new Set<string>();
    const groupIds = new Set<string>();
    const explicitUserDenies = new Set<string>();

    if (user.role) roleCodes.add(user.role);
    if (user.departmentId) deptIds.add(user.departmentId);

    const userDepts = await db.select().from(schema.userDepartments).where(eq(schema.userDepartments.userId, userId));
    for (const ud of userDepts) {
      if (ud.status !== 'ACTIVE') continue;
      if (!isActiveWindow(ud.startDate, ud.endDate, now)) continue;

      deptIds.add(ud.departmentId);
      if (ud.roleId) {
        const [role] = await db.select().from(schema.roles).where(eq(schema.roles.id, ud.roleId)).limit(1);
        if (role?.status === 'ACTIVE') roleCodes.add(role.code);
      }
    }

    const userGroups = await db.select()
      .from(schema.groupMembers)
      .innerJoin(schema.sysGroups, eq(schema.groupMembers.groupId, schema.sysGroups.id))
      .where(and(
        eq(schema.groupMembers.userId, userId),
        eq(schema.groupMembers.status, 'ACTIVE'),
        eq(schema.sysGroups.status, 'ACTIVE'),
      ));

    for (const row of userGroups) {
      const member = row.group_members;
      const group = row.sys_groups;
      if (!isActiveWindow(member.startDate, member.endDate, now)) continue;
      if (!isActiveWindow(group.startDate, group.endDate, now)) continue;
      groupIds.add(member.groupId);
    }

    const roleIds: string[] = [];
    if (roleCodes.size > 0) {
      const activeRoles = await db.select().from(schema.roles).where(and(
        inArray(schema.roles.code, Array.from(roleCodes)),
        eq(schema.roles.status, 'ACTIVE'),
      ));
      activeRoles.forEach(role => roleIds.push(role.id));
    }

    const enabledModulesData = await db.select({ id: schema.sysModules.id, code: schema.sysModules.code })
      .from(schema.sysModules)
      .where(eq(schema.sysModules.isEnabled, true));
    const enabledModuleIds = new Set(enabledModulesData.map(module => module.id));

    const permissionMap = new Map<string, EffectivePermission>();

    const mergePermission = (
      permCode: string,
      action: string,
      effect: 'ALLOW' | 'DENY',
      dataScope: string,
      moduleId: string,
    ) => {
      if (!enabledModuleIds.has(moduleId)) return;

      const existing = permissionMap.get(permCode);
      if (effect === 'DENY') {
        permissionMap.set(permCode, { code: permCode, action, dataScope: 'none', effect: 'DENY' });
        return;
      }

      if (!existing) {
        permissionMap.set(permCode, { code: permCode, action, dataScope, effect });
        return;
      }

      if (existing.effect === 'DENY') return;
      existing.dataScope = strongestScope(existing.dataScope, dataScope);
    };

    if (roleIds.length > 0) {
      const rolePerms = await db.select({
        permCode: schema.sysPermissions.code,
        action: schema.sysPermissions.action,
        dataScope: schema.rolePermissions.dataScope,
        moduleId: schema.sysPermissions.moduleId,
      })
        .from(schema.rolePermissions)
        .innerJoin(schema.sysPermissions, eq(schema.rolePermissions.permissionId, schema.sysPermissions.id))
        .where(inArray(schema.rolePermissions.roleId, roleIds));

      for (const perm of rolePerms) {
        mergePermission(perm.permCode, perm.action, 'ALLOW', perm.dataScope, perm.moduleId);
      }
    }

    if (deptIds.size > 0) {
      const departmentPerms = await db.select({
        permCode: schema.sysPermissions.code,
        action: schema.sysPermissions.action,
        dataScope: schema.departmentPermissions.dataScope,
        moduleId: schema.sysPermissions.moduleId,
      })
        .from(schema.departmentPermissions)
        .innerJoin(schema.sysPermissions, eq(schema.departmentPermissions.permissionId, schema.sysPermissions.id))
        .where(inArray(schema.departmentPermissions.departmentId, Array.from(deptIds)));

      for (const perm of departmentPerms) {
        mergePermission(perm.permCode, perm.action, 'ALLOW', perm.dataScope, perm.moduleId);
      }
    }

    if (groupIds.size > 0) {
      const groupPerms = await db.select({
        permCode: schema.sysPermissions.code,
        action: schema.sysPermissions.action,
        dataScope: schema.groupPermissions.dataScope,
        effect: schema.groupPermissions.effect,
        startDate: schema.groupPermissions.startDate,
        endDate: schema.groupPermissions.endDate,
        moduleId: schema.sysPermissions.moduleId,
      })
        .from(schema.groupPermissions)
        .innerJoin(schema.sysPermissions, eq(schema.groupPermissions.permissionId, schema.sysPermissions.id))
        .where(inArray(schema.groupPermissions.groupId, Array.from(groupIds)));

      for (const perm of groupPerms) {
        if (!isActiveWindow(perm.startDate, perm.endDate, now)) continue;
        mergePermission(perm.permCode, perm.action, perm.effect as 'ALLOW' | 'DENY', perm.dataScope, perm.moduleId);
      }
    }

    const userPerms = await db.select({
      permCode: schema.sysPermissions.code,
      action: schema.sysPermissions.action,
      dataScope: schema.userPermissions.dataScope,
      effect: schema.userPermissions.effect,
      expiresAt: schema.userPermissions.expiresAt,
      moduleId: schema.sysPermissions.moduleId,
    })
      .from(schema.userPermissions)
      .innerJoin(schema.sysPermissions, eq(schema.userPermissions.permissionId, schema.sysPermissions.id))
      .where(eq(schema.userPermissions.userId, userId));

    for (const perm of userPerms) {
      if (perm.expiresAt && new Date(perm.expiresAt) < now) continue;
      if (perm.effect === 'DENY') explicitUserDenies.add(perm.permCode);
      mergePermission(perm.permCode, perm.action, perm.effect as 'ALLOW' | 'DENY', perm.dataScope, perm.moduleId);
    }

    result.permissions = permissionMap;

    const allowedModuleCodes = new Set<string>();
    if (roleCodes.has('ADMIN')) {
      enabledModulesData.forEach(module => allowedModuleCodes.add(module.code));

      if (enabledModuleIds.size > 0) {
        const allPerms = await db.select()
          .from(schema.sysPermissions)
          .where(inArray(schema.sysPermissions.moduleId, Array.from(enabledModuleIds)));

        allPerms.forEach(perm => {
          if (explicitUserDenies.has(perm.code)) return;
          result.permissions.set(perm.code, {
            code: perm.code,
            action: perm.action,
            dataScope: 'all',
            effect: 'ALLOW',
          });
        });
      }
    } else {
      const activeCodes = Array.from(result.permissions.values())
        .filter(permission => permission.effect === 'ALLOW')
        .map(permission => permission.code);

      if (activeCodes.length > 0) {
        const activePermsData = await db.select({ moduleCode: schema.sysModules.code })
          .from(schema.sysPermissions)
          .innerJoin(schema.sysModules, eq(schema.sysPermissions.moduleId, schema.sysModules.id))
          .where(inArray(schema.sysPermissions.code, activeCodes));

        activePermsData.forEach(perm => allowedModuleCodes.add(perm.moduleCode));
      }
    }

    result.allowedModules = await getUserModules(userId);
    result.deniedPermissions = Array.from(result.permissions.values())
      .filter(permission => permission.effect === 'DENY')
      .map(permission => permission.code);
    return result;
  } catch (error) {
    console.error('Error fetching effective permissions:', error);
    return result;
  }
}

export async function hasPermission(permissionCode: string): Promise<boolean> {
  const actor = await getCurrentActor();
  if (!actor) return false;

  const effective = await getEffectivePermissions(actor.id);
  const perm = effective.permissions.get(permissionCode);

  return perm?.effect === 'ALLOW';
}

export async function getPermissionScope(permissionCode: string): Promise<DataScope> {
  const actor = await getCurrentActor();
  if (!actor) return 'none';

  const prefix = permissionCode.split('.')[0].toLowerCase();
  let moduleSlug = prefix;
  if (prefix === 'crm' || prefix === 'admissions' || prefix === 'lead' || prefix === 'leads') moduleSlug = 'crm';
  else if (prefix === 'academic' || prefix === 'student' || prefix === 'students' || prefix === 'classes') moduleSlug = 'academic';
  else if (prefix === 'services' || prefix === 'ticket' || prefix === 'tickets') moduleSlug = 'services';
  else if (prefix === 'finance' || prefix === 'payment' || prefix === 'payments') moduleSlug = 'finance';
  else if (prefix === 'system' || prefix === 'user' || prefix === 'users' || prefix === 'role') moduleSlug = 'system';
  else if (prefix === 'dashboard') moduleSlug = 'dashboard';

  const scope = await getModuleDataScope(actor.id, moduleSlug);
  return scope.toLowerCase() as any;
}

export async function requirePermission(permissionCode: string): Promise<EffectivePermission> {
  const actor = await getCurrentActor();
  if (!actor) throw new PermissionError('UNAUTHORIZED', 'Login required.');

  const prefix = permissionCode.split('.')[0].toLowerCase();
  let moduleSlug = prefix;
  if (prefix === 'crm' || prefix === 'admissions' || prefix === 'lead' || prefix === 'leads') moduleSlug = 'crm';
  else if (prefix === 'academic' || prefix === 'student' || prefix === 'students' || prefix === 'classes') moduleSlug = 'academic';
  else if (prefix === 'services' || prefix === 'ticket' || prefix === 'tickets') moduleSlug = 'services';
  else if (prefix === 'finance' || prefix === 'payment' || prefix === 'payments') moduleSlug = 'finance';
  else if (prefix === 'system' || prefix === 'user' || prefix === 'users' || prefix === 'role') moduleSlug = 'system';
  else if (prefix === 'dashboard') moduleSlug = 'dashboard';

  const allowedModules = await getUserModules(actor.id);
  const allowed = allowedModules.includes(moduleSlug) || allowedModules.includes(prefix) || actor.role === 'ADMIN' || (actor as any).userType === 'SUPER_ADMIN';

  if (!allowed) {
    throw new PermissionError('PERMISSION_DENIED', `Missing module access for [${permissionCode} -> ${moduleSlug}].`);
  }

  const newScope = await getModuleDataScope(actor.id, moduleSlug);
  const dataScope = newScope.toLowerCase() as any;

  return {
    code: permissionCode,
    action: 'manage',
    effect: 'ALLOW',
    dataScope,
  };
}

export async function requireModuleAccess(moduleCode: string): Promise<void> {
  const actor = await getCurrentActor();
  if (!actor) throw new PermissionError('UNAUTHORIZED', 'Login required.');

  const slug = moduleCode.toLowerCase();
  let targetSlug = slug;
  if (slug === 'crm_admissions' || slug === 'admissions') targetSlug = 'crm';
  else if (slug === 'operations') targetSlug = 'services';

  const allowedModules = await getUserModules(actor.id);
  if (!allowedModules.includes(targetSlug) && !allowedModules.includes(slug) && actor.role !== 'ADMIN' && (actor as any).userType !== 'SUPER_ADMIN') {
    throw new PermissionError('MODULE_DISABLED', `Missing access to module [${moduleCode}].`);
  }
}

export function permissionErrorResponse(error: unknown): Response {
  if (error instanceof PermissionError) {
    return Response.json({
      status: 'error',
      code: error.code,
      error: error.message,
    }, { status: error.status });
  }

  return Response.json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    error: error instanceof Error ? error.message : 'Unknown error.',
  }, { status: 500 });
}
