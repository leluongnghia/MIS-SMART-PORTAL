import { randomUUID } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { getCurrentActor } from './auth-helper';
import { db, schema } from './db';

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
  { code: 'DASHBOARD', name: 'Bo may dieu hanh', sortOrder: 1, isSystem: true },
  { code: 'ACADEMIC', name: 'Hoc vu va nhan su', sortOrder: 2, isSystem: false },
  { code: 'OPERATIONS', name: 'Van hanh va nguon luc', sortOrder: 3, isSystem: false },
  { code: 'SERVICES', name: 'Dich vu hoc duong', sortOrder: 4, isSystem: false },
  { code: 'CRM_ADMISSIONS', name: 'Tuyen sinh CRM', sortOrder: 5, isSystem: false, routePath: '/admissions' },
  { code: 'SYSTEM', name: 'Cai dat he thong', sortOrder: 99, isSystem: true },
];

const CORE_FEATURES = [
  { moduleCode: 'DASHBOARD', code: 'DASHBOARD_COUNCIL', name: 'Dashboard hoi dong', sortOrder: 1 },
  { moduleCode: 'DASHBOARD', code: 'DASHBOARD_PRINCIPAL', name: 'Dashboard hieu truong', sortOrder: 2 },
  { moduleCode: 'DASHBOARD', code: 'DIRECTIVES', name: 'Chi dao BGH', sortOrder: 3 },
  { moduleCode: 'DASHBOARD', code: 'TASKS', name: 'Nhiem vu va du an', sortOrder: 4 },
  { moduleCode: 'DASHBOARD', code: 'APPROVALS', name: 'Don tu va phe duyet', sortOrder: 5 },
  { moduleCode: 'DASHBOARD', code: 'RISKS', name: 'Quan tri rui ro', sortOrder: 6 },
  { moduleCode: 'DASHBOARD', code: 'ANNOUNCEMENTS', name: 'Thong bao noi bo', sortOrder: 7 },
  { moduleCode: 'ACADEMIC', code: 'STUDENTS', name: 'Ho so hoc sinh', sortOrder: 1 },
  { moduleCode: 'ACADEMIC', code: 'CLASSES', name: 'Quan ly lop hoc', sortOrder: 2 },
  { moduleCode: 'ACADEMIC', code: 'LESSON_PLANS', name: 'Giao an va du gio', sortOrder: 3 },
  { moduleCode: 'ACADEMIC', code: 'SCHEDULE', name: 'Thoi khoa bieu va lich', sortOrder: 4 },
  { moduleCode: 'ACADEMIC', code: 'EXAMS', name: 'Kiem tra va danh gia', sortOrder: 5 },
  { moduleCode: 'ACADEMIC', code: 'CONDUCT', name: 'So lien lac va ne nep', sortOrder: 6 },
  { moduleCode: 'ACADEMIC', code: 'HRM', name: 'Nhan su truong hoc', sortOrder: 7 },
  { moduleCode: 'OPERATIONS', code: 'PARENT_TICKETS', name: 'CSKH phu huynh', sortOrder: 1 },
  { moduleCode: 'OPERATIONS', code: 'EVENTS', name: 'Su kien va truyen thong', sortOrder: 2 },
  { moduleCode: 'OPERATIONS', code: 'TRANSPORT', name: 'Xe dua don', sortOrder: 3 },
  { moduleCode: 'OPERATIONS', code: 'MEALS', name: 'Ban tru va bep an', sortOrder: 4 },
  { moduleCode: 'OPERATIONS', code: 'FACILITIES', name: 'Tai san va co so vat chat', sortOrder: 5 },
  { moduleCode: 'OPERATIONS', code: 'KNOWLEDGE', name: 'Kho quy trinh va tri thuc', sortOrder: 6 },
  { moduleCode: 'OPERATIONS', code: 'MEETINGS', name: 'Hanh chinh va cuoc hop', sortOrder: 7 },
  { moduleCode: 'SERVICES', code: 'SERVICE_OVERVIEW', name: 'Tong quan dich vu hoc duong', sortOrder: 1 },
  { moduleCode: 'SERVICES', code: 'SERVICE_TICKETS', name: 'Trung tam ticket dich vu', sortOrder: 2 },
  { moduleCode: 'SERVICES', code: 'SERVICE_TRANSPORT', name: 'Xe dua don dich vu', sortOrder: 3 },
  { moduleCode: 'SERVICES', code: 'SERVICE_MEALS', name: 'Suat an va can tin', sortOrder: 4 },
  { moduleCode: 'SERVICES', code: 'SERVICE_HEALTH', name: 'Y te hoc duong', sortOrder: 5 },
  { moduleCode: 'SERVICES', code: 'SERVICE_BOARDING', name: 'Ban tru noi tru', sortOrder: 6 },
  { moduleCode: 'SERVICES', code: 'SERVICE_FACILITIES', name: 'Co so vat chat dich vu', sortOrder: 7 },
  { moduleCode: 'SERVICES', code: 'SERVICE_REPORTS', name: 'Bao cao va KPI dich vu', sortOrder: 8 },
  { moduleCode: 'SERVICES', code: 'SERVICE_SETTINGS', name: 'Cau hinh dich vu', sortOrder: 9 },
  { moduleCode: 'SYSTEM', code: 'PERSONAL_SETTINGS', name: 'Cau hinh ca nhan', sortOrder: 1 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_LEADS', name: 'Lead tuyen sinh', sortOrder: 1 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_PIPELINE', name: 'Pipeline va lich hen', sortOrder: 2 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_DOCUMENTS', name: 'Ho so va tai lieu', sortOrder: 3 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_PAYMENTS', name: 'Hoc phi va thanh toan', sortOrder: 4 },
  { moduleCode: 'CRM_ADMISSIONS', code: 'CRM_WORKFLOW', name: 'Workflow tu dong', sortOrder: 5 },
  { moduleCode: 'SYSTEM', code: 'RBAC', name: 'Phan quyen', sortOrder: 1 },
];

const CORE_PERMISSIONS = [
  { moduleCode: 'DASHBOARD', featureCode: 'DASHBOARD_COUNCIL', code: 'dashboard.council.view', name: 'Xem dashboard hoi dong', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'DASHBOARD_PRINCIPAL', code: 'dashboard.principal.view', name: 'Xem dashboard hieu truong', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'DIRECTIVES', code: 'directive.view', name: 'Xem chi dao', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'DIRECTIVES', code: 'directive.create', name: 'Tao chi dao', action: 'create' },
  { moduleCode: 'DASHBOARD', featureCode: 'DIRECTIVES', code: 'directive.update', name: 'Cap nhat chi dao', action: 'update' },
  { moduleCode: 'DASHBOARD', featureCode: 'TASKS', code: 'task.view', name: 'Xem nhiem vu', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'TASKS', code: 'task.create', name: 'Tao nhiem vu', action: 'create' },
  { moduleCode: 'DASHBOARD', featureCode: 'TASKS', code: 'task.update', name: 'Cap nhat nhiem vu', action: 'update' },
  { moduleCode: 'DASHBOARD', featureCode: 'TASKS', code: 'task.approve', name: 'Duyet nhiem vu', action: 'approve' },
  { moduleCode: 'DASHBOARD', featureCode: 'APPROVALS', code: 'approval.view', name: 'Xem phe duyet', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'APPROVALS', code: 'approval.approve', name: 'Xu ly phe duyet', action: 'approve' },
  { moduleCode: 'DASHBOARD', featureCode: 'RISKS', code: 'risk.view', name: 'Xem rui ro', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'RISKS', code: 'risk.create', name: 'Tao rui ro', action: 'create' },
  { moduleCode: 'DASHBOARD', featureCode: 'RISKS', code: 'risk.update', name: 'Cap nhat rui ro', action: 'update' },
  { moduleCode: 'DASHBOARD', featureCode: 'RISKS', code: 'risk.manage', name: 'Quan tri rui ro', action: 'manage' },
  { moduleCode: 'DASHBOARD', featureCode: 'ANNOUNCEMENTS', code: 'announcement.view', name: 'Xem thong bao', action: 'view' },
  { moduleCode: 'DASHBOARD', featureCode: 'ANNOUNCEMENTS', code: 'announcement.create', name: 'Tao thong bao', action: 'create' },
  { moduleCode: 'ACADEMIC', featureCode: 'STUDENTS', code: 'student.view', name: 'Xem ho so hoc sinh', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'STUDENTS', code: 'student.create', name: 'Tao ho so hoc sinh', action: 'create' },
  { moduleCode: 'ACADEMIC', featureCode: 'STUDENTS', code: 'student.update', name: 'Cap nhat ho so hoc sinh', action: 'update' },
  { moduleCode: 'ACADEMIC', featureCode: 'STUDENTS', code: 'student.delete', name: 'Xoa ho so hoc sinh', action: 'delete' },
  { moduleCode: 'ACADEMIC', featureCode: 'CLASSES', code: 'class.view', name: 'Xem lop hoc', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'CLASSES', code: 'class.manage', name: 'Quan ly lop hoc', action: 'manage' },
  { moduleCode: 'ACADEMIC', featureCode: 'LESSON_PLANS', code: 'academic.lesson_plan.view', name: 'Xem giao an', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'LESSON_PLANS', code: 'academic.lesson_plan.create', name: 'Tao giao an', action: 'create' },
  { moduleCode: 'ACADEMIC', featureCode: 'LESSON_PLANS', code: 'academic.lesson_plan.update', name: 'Cap nhat giao an', action: 'update' },
  { moduleCode: 'ACADEMIC', featureCode: 'LESSON_PLANS', code: 'academic.lesson_plan.approve', name: 'Duyet giao an', action: 'approve' },
  { moduleCode: 'ACADEMIC', featureCode: 'SCHEDULE', code: 'schedule.view', name: 'Xem thoi khoa bieu', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'SCHEDULE', code: 'schedule.manage', name: 'Quan ly thoi khoa bieu', action: 'manage' },
  { moduleCode: 'ACADEMIC', featureCode: 'EXAMS', code: 'exam.view', name: 'Xem kiem tra danh gia', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'EXAMS', code: 'exam.manage', name: 'Quan ly kiem tra danh gia', action: 'manage' },
  { moduleCode: 'ACADEMIC', featureCode: 'CONDUCT', code: 'conduct.view', name: 'Xem ne nep', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'CONDUCT', code: 'conduct.update', name: 'Cap nhat ne nep', action: 'update' },
  { moduleCode: 'ACADEMIC', featureCode: 'HRM', code: 'hrm.view', name: 'Xem nhan su', action: 'view' },
  { moduleCode: 'ACADEMIC', featureCode: 'HRM', code: 'hrm.manage', name: 'Quan ly nhan su', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'PARENT_TICKETS', code: 'parent_ticket.view', name: 'Xem ticket phu huynh', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'PARENT_TICKETS', code: 'parent_ticket.process', name: 'Xu ly ticket phu huynh', action: 'update' },
  { moduleCode: 'OPERATIONS', featureCode: 'EVENTS', code: 'event.view', name: 'Xem su kien', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'EVENTS', code: 'event.manage', name: 'Quan ly su kien', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'TRANSPORT', code: 'transport.view', name: 'Xem xe dua don', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'TRANSPORT', code: 'transport.manage', name: 'Quan ly xe dua don', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'MEALS', code: 'meal.view', name: 'Xem ban tru bep an', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'MEALS', code: 'meal.manage', name: 'Quan ly ban tru bep an', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'FACILITIES', code: 'facility.view', name: 'Xem tai san co so vat chat', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'FACILITIES', code: 'facility.manage', name: 'Quan ly tai san co so vat chat', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'KNOWLEDGE', code: 'knowledge.view', name: 'Xem tri thuc quy trinh', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'KNOWLEDGE', code: 'knowledge.manage', name: 'Quan ly tri thuc quy trinh', action: 'manage' },
  { moduleCode: 'OPERATIONS', featureCode: 'MEETINGS', code: 'meeting.view', name: 'Xem cuoc hop', action: 'view' },
  { moduleCode: 'OPERATIONS', featureCode: 'MEETINGS', code: 'meeting.manage', name: 'Quan ly cuoc hop', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_OVERVIEW', code: 'service.overview.view', name: 'Xem tong quan dich vu', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_TICKETS', code: 'service.ticket.view', name: 'Xem ticket dich vu', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_TICKETS', code: 'service.ticket.process', name: 'Xu ly ticket dich vu', action: 'update' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_TRANSPORT', code: 'service.transport.view', name: 'Xem xe dua don dich vu', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_TRANSPORT', code: 'service.transport.manage', name: 'Quan ly xe dua don dich vu', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_MEALS', code: 'service.meal.view', name: 'Xem suat an can tin', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_MEALS', code: 'service.meal.manage', name: 'Quan ly suat an can tin', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_HEALTH', code: 'service.health.view', name: 'Xem y te hoc duong', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_HEALTH', code: 'service.health.manage', name: 'Quan ly y te hoc duong', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_BOARDING', code: 'service.boarding.view', name: 'Xem ban tru noi tru', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_BOARDING', code: 'service.boarding.manage', name: 'Quan ly ban tru noi tru', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_FACILITIES', code: 'service.facility.view', name: 'Xem co so vat chat dich vu', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_FACILITIES', code: 'service.facility.manage', name: 'Quan ly co so vat chat dich vu', action: 'manage' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_REPORTS', code: 'service.report.view', name: 'Xem bao cao dich vu', action: 'view' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_REPORTS', code: 'service.report.export', name: 'Xuat bao cao dich vu', action: 'export' },
  { moduleCode: 'SERVICES', featureCode: 'SERVICE_SETTINGS', code: 'service.setting.manage', name: 'Cau hinh dich vu', action: 'manage' },
  { moduleCode: 'SYSTEM', featureCode: 'PERSONAL_SETTINGS', code: 'system.profile.update', name: 'Cap nhat cau hinh ca nhan', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.lead.view', name: 'Xem lead tuyen sinh', action: 'view' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.lead.create', name: 'Tao lead tuyen sinh', action: 'create' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.lead.update', name: 'Sua lead tuyen sinh', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.lead.delete', name: 'Xoa lead tuyen sinh', action: 'delete' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PIPELINE', code: 'crm.lead.stage.update', name: 'Cap nhat pipeline CRM', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PIPELINE', code: 'crm.appointment.update', name: 'Cap nhat lich hen CRM', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_DOCUMENTS', code: 'crm.document.update', name: 'Cap nhat tai lieu CRM', action: 'update' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PAYMENTS', code: 'crm.payment.view', name: 'Xem thanh toan CRM', action: 'view' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PAYMENTS', code: 'crm.payment.create', name: 'Tao thanh toan CRM', action: 'create' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_PAYMENTS', code: 'crm.payment.reconcile', name: 'Doi soat thanh toan CRM', action: 'manage' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.import.preview', name: 'Kiem tra import CRM', action: 'import' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_LEADS', code: 'crm.export', name: 'Xuat du lieu CRM', action: 'export' },
  { moduleCode: 'CRM_ADMISSIONS', featureCode: 'CRM_WORKFLOW', code: 'crm.workflow.run', name: 'Chay workflow CRM', action: 'manage' },
  { moduleCode: 'SYSTEM', featureCode: 'RBAC', code: 'system.rbac.manage', name: 'Quan tri phan quyen', action: 'manage', isSystem: true },
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
    }
  }

  for (const roleDef of [
    { code: 'ADMIN', name: 'Quan tri he thong', level: 100, isSystemRole: true },
    { code: 'ADMISSIONS', name: 'Nhan su tuyen sinh', level: 40, isSystemRole: false },
    { code: 'ACCOUNTANT', name: 'Ke toan', level: 40, isSystemRole: false },
    { code: 'MANAGER', name: 'Truong phong', level: 60, isSystemRole: false },
    { code: 'STAFF', name: 'Nhan vien', level: 10, isSystemRole: false },
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

    result.allowedModules = Array.from(allowedModuleCodes);
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

  const effective = await getEffectivePermissions(actor.id);
  const perm = effective.permissions.get(permissionCode);

  if (!perm || perm.effect === 'DENY') return 'none';
  return perm.dataScope;
}

export async function requirePermission(permissionCode: string): Promise<EffectivePermission> {
  const actor = await getCurrentActor();
  if (!actor) throw new PermissionError('UNAUTHORIZED', 'Login required.');

  const effective = await getEffectivePermissions(actor.id);
  const perm = effective.permissions.get(permissionCode);

  if (perm?.effect !== 'ALLOW') {
    throw new PermissionError('PERMISSION_DENIED', `Missing permission [${permissionCode}].`);
  }

  return perm;
}

export async function requireModuleAccess(moduleCode: string): Promise<void> {
  const actor = await getCurrentActor();
  if (!actor) throw new PermissionError('UNAUTHORIZED', 'Login required.');

  const effective = await getEffectivePermissions(actor.id);
  if (!effective.allowedModules.includes(moduleCode)) {
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
