import type { UserProfile } from '@/src/types';

export const SYSTEM_ROLES = ['ADMIN', 'CHAIRMAN', 'BGH', 'MANAGER', 'TEACHER', 'STAFF', 'ADMISSIONS', 'HRM', 'FACILITIES'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const DATA_SCOPES = ['SYSTEM', 'SCHOOL', 'DEPARTMENT', 'TEAM', 'CLASS', 'OWN'] as const;
export type DataScope = (typeof DATA_SCOPES)[number];

export const PERMISSION_ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT', 'CONFIGURE', 'MANAGE_USERS', 'MANAGE_PERMISSIONS', 'MANAGE_BACKUP'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_MODULES = [
  'DASHBOARD', 'TASKS', 'APPROVALS', 'CALENDAR', 'DIRECTIVES', 'ANNOUNCEMENTS', 'CHAT', 'HRM', 'RISKS',
  'FACILITIES', 'ADMISSIONS', 'STUDENTS', 'TIMETABLE', 'LESSON_PLANS', 'CATEGORIES', 'REPORTS', 'STORAGE',
  'SETTINGS', 'USERS', 'AUDIT_LOGS',
] as const;
export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export type PermissionUser = Omit<Partial<UserProfile>, 'role'> & {
  id?: string | null;
  role?: string | null;
  title?: string | null;
  workspaceId?: string | null;
  departmentId?: string | null;
};

export type MenuItem = { label: string; href: string; icon: any; badgeKey?: 'tasks' | 'directives' | 'announcements'; module?: string };

export type MenuItemGroup = {
  title: string;
  items: MenuItem[];
};

export type ScopedEntity = {
  id?: string | null;
  userId?: string | null;
  ownerId?: string | null;
  createdBy?: string | null;
  assignedId?: string | null;
  uploadedBy?: string | null;
  workspaceId?: string | null;
  departmentId?: string | null;
  teamId?: string | null;
  classId?: string | null;
  visibility?: string | null;
};

const ALL_MODULES = new Set<PermissionModule>(PERMISSION_MODULES);
const SYSTEM_ONLY = new Set<PermissionModule>(['SETTINGS', 'USERS', 'AUDIT_LOGS']);
const SCHOOL_WIDE = new Set<PermissionModule>(['DASHBOARD', 'TASKS', 'APPROVALS', 'CALENDAR', 'DIRECTIVES', 'ANNOUNCEMENTS', 'CHAT', 'STUDENTS', 'TIMETABLE', 'LESSON_PLANS', 'REPORTS', 'STORAGE']);
const ADMISSIONS_MODULES = new Set<PermissionModule>(['DASHBOARD', 'ADMISSIONS', 'STUDENTS', 'TASKS', 'APPROVALS', 'CALENDAR', 'ANNOUNCEMENTS', 'CHAT', 'REPORTS', 'STORAGE']);
const HRM_MODULES = new Set<PermissionModule>(['DASHBOARD', 'HRM', 'TASKS', 'APPROVALS', 'CALENDAR', 'ANNOUNCEMENTS', 'CHAT', 'REPORTS', 'STORAGE']);
const FACILITIES_MODULES = new Set<PermissionModule>(['DASHBOARD', 'FACILITIES', 'TASKS', 'APPROVALS', 'CALENDAR', 'ANNOUNCEMENTS', 'CHAT', 'REPORTS', 'STORAGE']);
const TEACHER_MODULES = new Set<PermissionModule>(['DASHBOARD', 'TASKS', 'CALENDAR', 'DIRECTIVES', 'ANNOUNCEMENTS', 'CHAT', 'STUDENTS', 'TIMETABLE', 'LESSON_PLANS', 'STORAGE']);
const STAFF_MODULES = new Set<PermissionModule>(['DASHBOARD', 'TASKS', 'CALENDAR', 'ANNOUNCEMENTS', 'CHAT', 'STORAGE']);

const moduleFromString = (module: PermissionModule | string): PermissionModule | null => {
  const normalized = String(module || '').toUpperCase().replace(/-/g, '_');
  if (normalized === 'EVENTS') return 'CALENDAR';
  if (normalized === 'RISK') return 'RISKS';
  if (normalized === 'SCHEDULE') return 'TIMETABLE';
  if (normalized === 'SYSTEM_DATA_CATEGORIES') return 'CATEGORIES';
  if (normalized === 'SYSTEM_DATA_REPORTS') return 'REPORTS';
  if (normalized === 'SYSTEM_DATA_STORAGE') return 'STORAGE';
  if ((PERMISSION_MODULES as readonly string[]).includes(normalized)) return normalized as PermissionModule;
  return null;
};

export function normalizeSystemRole(user?: PermissionUser | null): SystemRole | 'PARENT' | 'STUDENT' | 'UNKNOWN' {
  if (!user) return 'UNKNOWN';
  const rawRole = String(user.role || '').toUpperCase();
  if (rawRole === 'PARENT' || rawRole === 'STUDENT') return rawRole;
  if ((SYSTEM_ROLES as readonly string[]).includes(rawRole)) return rawRole as SystemRole;

  const workspace = String(user.workspaceId || user.departmentId || '').toUpperCase();
  const title = String(user.title || '').toLowerCase();
  if (workspace === 'BGH') return 'BGH';
  if (workspace === 'TUYEN_SINH_PR') return 'ADMISSIONS';
  if (workspace.includes('CSVC') || title.includes('cơ sở vật chất') || title.includes('thiết bị')) return 'FACILITIES';
  if (workspace.includes('HR') || title.includes('nhân sự')) return 'HRM';
  if (title.includes('giáo viên')) return 'TEACHER';
  return 'STAFF';
}

export function getUserDataScope(user?: PermissionUser | null): DataScope {
  const role = normalizeSystemRole(user);
  if (role === 'ADMIN') return 'SYSTEM';
  if (role === 'CHAIRMAN' || role === 'BGH') return 'SCHOOL';
  if (role === 'MANAGER' || role === 'HRM' || role === 'FACILITIES' || role === 'ADMISSIONS') return 'DEPARTMENT';
  if (role === 'TEACHER') return 'CLASS';
  return 'OWN';
}

function canRoleViewModule(role: ReturnType<typeof normalizeSystemRole>, module: PermissionModule): boolean {
  if (role === 'ADMIN') return true;
  if (role === 'CHAIRMAN' || role === 'BGH') return !SYSTEM_ONLY.has(module) || module === 'AUDIT_LOGS';
  if (role === 'MANAGER') return SCHOOL_WIDE.has(module) || module === 'CATEGORIES' || module === 'USERS';
  if (role === 'ADMISSIONS') return ADMISSIONS_MODULES.has(module);
  if (role === 'HRM') return HRM_MODULES.has(module);
  if (role === 'FACILITIES') return FACILITIES_MODULES.has(module);
  if (role === 'TEACHER') return TEACHER_MODULES.has(module);
  if (role === 'STAFF') return STAFF_MODULES.has(module);
  return false;
}

export function hasPermission(user: PermissionUser | null | undefined, module: PermissionModule | string, action: PermissionAction): boolean {
  const normalizedModule = moduleFromString(module);
  if (!normalizedModule || !ALL_MODULES.has(normalizedModule)) return false;
  const role = normalizeSystemRole(user);
  if (role === 'ADMIN') return true;
  if (action === 'VIEW') return canRoleViewModule(role, normalizedModule);
  if (!canRoleViewModule(role, normalizedModule)) return false;

  if (action === 'MANAGE_USERS' || action === 'MANAGE_PERMISSIONS' || action === 'MANAGE_BACKUP') return false;
  if (action === 'CONFIGURE') return role === 'ADMISSIONS' && normalizedModule === 'ADMISSIONS';
  if (action === 'EXPORT') return ['CHAIRMAN', 'BGH', 'MANAGER', 'ADMISSIONS', 'HRM', 'FACILITIES'].includes(role);
  if (action === 'APPROVE') return ['CHAIRMAN', 'BGH', 'MANAGER', 'ADMISSIONS', 'HRM', 'FACILITIES'].includes(role);
  if (action === 'DELETE') return ['BGH', 'MANAGER', 'ADMISSIONS', 'HRM', 'FACILITIES'].includes(role);
  if (action === 'UPDATE') return ['BGH', 'MANAGER', 'TEACHER', 'STAFF', 'ADMISSIONS', 'HRM', 'FACILITIES'].includes(role);
  if (action === 'CREATE') return ['BGH', 'MANAGER', 'TEACHER', 'STAFF', 'ADMISSIONS', 'HRM', 'FACILITIES'].includes(role);
  return false;
}

export const canViewModule = (user: PermissionUser | null | undefined, module: PermissionModule | string) => hasPermission(user, module, 'VIEW');
export const canCreate = (user: PermissionUser | null | undefined, module: PermissionModule | string) => hasPermission(user, module, 'CREATE');
export const canExport = (user: PermissionUser | null | undefined, module: PermissionModule | string) => hasPermission(user, module, 'EXPORT');
export const canConfigure = (user: PermissionUser | null | undefined, module: PermissionModule | string) => hasPermission(user, module, 'CONFIGURE');
export const canManageUsers = (user: PermissionUser | null | undefined) => hasPermission(user, 'USERS', 'MANAGE_USERS');
export const canManagePermissions = (user: PermissionUser | null | undefined) => hasPermission(user, 'USERS', 'MANAGE_PERMISSIONS');

export function canAccessData(user: PermissionUser | null | undefined, entity?: ScopedEntity | null): boolean {
  if (!user || !entity) return false;
  const role = normalizeSystemRole(user);
  if (role === 'ADMIN') return true;
  const scope = getUserDataScope(user);
  const userId = String(user.id || '');
  const workspaceId = String(user.workspaceId || '');
  const departmentId = String(user.departmentId || user.workspaceId || '');
  const entityDept = String(entity.departmentId || entity.workspaceId || '');
  const own = [entity.id, entity.userId, entity.ownerId, entity.createdBy, entity.assignedId, entity.uploadedBy].some(v => String(v || '') === userId);

  if (scope === 'SCHOOL') return true;
  if (scope === 'DEPARTMENT' || scope === 'TEAM' || scope === 'CLASS') return own || entityDept === departmentId || String(entity.workspaceId || '') === workspaceId;
  return own;
}

export function canEdit(user: PermissionUser | null | undefined, module: PermissionModule | string, entity?: ScopedEntity | null): boolean {
  return hasPermission(user, module, 'UPDATE') && (!entity || canAccessData(user, entity));
}

export function canDelete(user: PermissionUser | null | undefined, module: PermissionModule | string, entity?: ScopedEntity | null): boolean {
  return hasPermission(user, module, 'DELETE') && (!entity || canAccessData(user, entity));
}

export function canApprove(user: PermissionUser | null | undefined, module: PermissionModule | string, entity?: ScopedEntity | null): boolean {
  return hasPermission(user, module, 'APPROVE') && (!entity || canAccessData(user, entity));
}

export function canManageBackup(user: PermissionUser | null | undefined) {
  return hasPermission(user, 'SETTINGS', 'MANAGE_BACKUP');
}
