import { db, schema } from './db';
import { eq, and } from 'drizzle-orm';
import { Actor } from './auth-helper';

export interface EffectivePermission {
  permissionId: string;
  code: string;
  action: string;
  dataScope: string;
  effect: 'ALLOW' | 'DENY';
}

/**
 * Lấy toàn bộ quyền hạn cuối cùng (effective permissions) của một User
 * Kết hợp từ Role, Department, Group, và User (cá nhân hoá)
 */
export async function getEffectivePermissions(userId: string): Promise<EffectivePermission[]> {
  const permissionsMap = new Map<string, EffectivePermission>();

  // 1. Lấy quyền từ User's Roles
  const userRolePerms = await db.select({
    permissionId: schema.sysPermissions.id,
    code: schema.sysPermissions.code,
    action: schema.sysPermissions.action,
    dataScope: schema.rolePermissions.dataScope,
  })
  .from(schema.userDepartments)
  .where(eq(schema.userDepartments.userId, userId))
  .innerJoin(schema.rolePermissions, eq(schema.userDepartments.roleId, schema.rolePermissions.roleId))
  .innerJoin(schema.sysPermissions, eq(schema.rolePermissions.permissionId, schema.sysPermissions.id));

  for (const rp of userRolePerms) {
    if (!permissionsMap.has(rp.code) || _isScopeWider(rp.dataScope, permissionsMap.get(rp.code)!.dataScope)) {
      permissionsMap.set(rp.code, {
        permissionId: rp.permissionId,
        code: rp.code,
        action: rp.action,
        dataScope: rp.dataScope,
        effect: 'ALLOW',
      });
    }
  }

  // 2. Lấy quyền từ Department
  const userDeptPerms = await db.select({
    permissionId: schema.sysPermissions.id,
    code: schema.sysPermissions.code,
    action: schema.sysPermissions.action,
    dataScope: schema.departmentPermissions.dataScope,
  })
  .from(schema.userDepartments)
  .where(eq(schema.userDepartments.userId, userId))
  .innerJoin(schema.departmentPermissions, eq(schema.userDepartments.departmentId, schema.departmentPermissions.departmentId))
  .innerJoin(schema.sysPermissions, eq(schema.departmentPermissions.permissionId, schema.sysPermissions.id));

  for (const dp of userDeptPerms) {
    if (!permissionsMap.has(dp.code) || _isScopeWider(dp.dataScope, permissionsMap.get(dp.code)!.dataScope)) {
      permissionsMap.set(dp.code, {
        permissionId: dp.permissionId,
        code: dp.code,
        action: dp.action,
        dataScope: dp.dataScope,
        effect: 'ALLOW',
      });
    }
  }

  // 3. Lấy quyền từ User Permissions (ghi đè ALLOW/DENY cá nhân)
  const userPerms = await db.select({
    permissionId: schema.sysPermissions.id,
    code: schema.sysPermissions.code,
    action: schema.sysPermissions.action,
    dataScope: schema.userPermissions.dataScope,
    effect: schema.userPermissions.effect,
  })
  .from(schema.userPermissions)
  .where(eq(schema.userPermissions.userId, userId))
  .innerJoin(schema.sysPermissions, eq(schema.userPermissions.permissionId, schema.sysPermissions.id));

  for (const up of userPerms) {
    if (up.effect === 'DENY') {
      permissionsMap.set(up.code, {
        permissionId: up.permissionId,
        code: up.code,
        action: up.action,
        dataScope: 'none',
        effect: 'DENY',
      });
    } else {
      if (!permissionsMap.has(up.code) || _isScopeWider(up.dataScope, permissionsMap.get(up.code)!.dataScope)) {
        permissionsMap.set(up.code, {
          permissionId: up.permissionId,
          code: up.code,
          action: up.action,
          dataScope: up.dataScope,
          effect: 'ALLOW' as 'ALLOW',
        });
      }
    }
  }

  return Array.from(permissionsMap.values());
}

/**
 * Kiểm tra User có quyền thực hiện hành động không
 */
export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  // Shortcut: Super Admin có toàn quyền (Nếu đang dùng `role` cũ)
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (user && user.role === 'SUPER_ADMIN') return true;

  const perms = await getEffectivePermissions(userId);
  const perm = perms.find(p => p.code === permissionCode);
  return perm !== undefined && perm.effect === 'ALLOW';
}

/**
 * Lấy Data Scope lớn nhất cho một hành động
 */
export async function getDataScope(userId: string, permissionCode: string): Promise<string> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (user && user.role === 'SUPER_ADMIN') return 'all';

  const perms = await getEffectivePermissions(userId);
  const perm = perms.find(p => p.code === permissionCode);
  if (perm && perm.effect === 'ALLOW') {
    return perm.dataScope;
  }
  return 'none';
}

export async function hasPermissionByActor(actor: Actor | null, permissionCode: string): Promise<boolean> {
  if (!actor) return false;
  return hasPermission(actor.id, permissionCode);
}

// Hàm so sánh độ bao phủ của Scope
function _isScopeWider(scope1: string, scope2: string): boolean {
  const ranks: Record<string, number> = {
    'none': 0,
    'own': 1,
    'department': 2,
    'school': 3,
    'all': 4
  };
  return (ranks[scope1] || 0) > (ranks[scope2] || 0);
}
