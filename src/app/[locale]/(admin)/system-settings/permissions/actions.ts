'use server';

import { randomUUID } from 'crypto';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { db, schema } from '@/src/libs/server/db';
import { ensurePermissionCatalog, getEffectivePermissions, requirePermission } from '@/src/libs/server/permission-service';
import { hasPermission as checkMatrixPermission } from '@/src/libs/server/permission-evaluator';

const MODULE_PRESETS: Record<string, string[]> = {
  view: ['view'],
  operator: ['view', 'create', 'update'],
  manager: ['view', 'create', 'update', 'approve', 'export'],
  admin: ['view', 'create', 'update', 'delete', 'approve', 'export', 'manage', 'import'],
};

async function requireRbacAdmin() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error("PermissionError: Unauthorized");
  const isAllowed = await checkMatrixPermission(actor, "users", "manage");
  if (!isAllowed) throw new Error("PermissionError: Missing permission [system.rbac.manage]");
}

async function auditPermissionChange(targetType: string, targetId: string, action: string, beforeJson: any, afterJson: any, reason?: string) {
  const actor = await getCurrentActor();
  if (!actor) return;

  await db.insert(schema.permissionAuditLogs).values({
    id: randomUUID(),
    actorUserId: actor.id,
    targetType,
    targetId,
    action,
    beforeJson,
    afterJson,
    reason,
  });
}

export async function getPermissionOverview() {
  await requireRbacAdmin();

  const [modules, roles, groups, overrides, disabledModules, auditLogs] = await Promise.all([
    db.select().from(schema.sysModules),
    db.select().from(schema.roles),
    db.select().from(schema.sysGroups),
    db.select().from(schema.userOverrides),
    db.select().from(schema.sysModules).where(eq(schema.sysModules.isEnabled, false)),
    db.select().from(schema.permissionAuditLogs).orderBy(desc(schema.permissionAuditLogs.createdAt)).limit(8),
  ]);

  return {
    moduleCount: modules.length,
    enabledModuleCount: modules.filter(module => module.isEnabled).length,
    featureCount: await db.select().from(schema.sysFeatures).then(rows => rows.length),
    permissionCount: await db.select().from(schema.sysPermissions).then(rows => rows.length),
    roleCount: roles.length,
    activeRoleCount: roles.filter(role => role.status === 'ACTIVE').length,
    groupCount: groups.length,
    temporaryGroupCount: groups.filter(group => group.isTemporary).length,
    overrideCount: overrides.length,
    denyOverrideCount: overrides.filter(override => override.effect === 'DENY').length,
    disabledModules,
    auditLogs,
  };
}

export async function getPermissionModules() {
  await requireRbacAdmin();

  const [modules, features, permissions, rolePerms, groupPerms, userPerms] = await Promise.all([
    db.select().from(schema.sysModules).orderBy(schema.sysModules.sortOrder),
    db.select().from(schema.sysFeatures),
    db.select().from(schema.sysPermissions),
    db.select().from(schema.rolePermissions),
    db.select().from(schema.groupPermissions),
    db.select().from(schema.userPermissions),
  ]);

  return modules.map(module => {
    const moduleFeatures = features
      .filter(feature => feature.moduleId === module.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const modulePermissions = permissions.filter(permission => permission.moduleId === module.id);
    const modulePermissionIds = new Set(modulePermissions.map(permission => permission.id));
    return {
      ...module,
      features: moduleFeatures.map(feature => {
        const featurePermissions = modulePermissions.filter(permission => permission.featureId === feature.id);
        return {
          ...feature,
          permissionCount: featurePermissions.length,
          actions: Array.from(new Set(featurePermissions.map(permission => permission.action))),
        };
      }),
      featureCount: moduleFeatures.length,
      permissionCount: modulePermissions.length,
      assignmentCount:
        rolePerms.filter(item => modulePermissionIds.has(item.permissionId)).length +
        groupPerms.filter(item => modulePermissionIds.has(item.permissionId)).length +
        userPerms.filter(item => modulePermissionIds.has(item.permissionId)).length,
    };
  });
}

export async function togglePermissionModule(formData: FormData) {
  await requireRbacAdmin();

  const moduleId = String(formData.get('moduleId') || '');
  const nextEnabled = String(formData.get('nextEnabled')) === 'true';
  const reason = String(formData.get('reason') || 'Toggle module from permission UI');

  const [before] = await db.select().from(schema.sysModules).where(eq(schema.sysModules.id, moduleId)).limit(1);
  if (!before) throw new Error('Module not found');

  const [after] = await db.update(schema.sysModules)
    .set({ isEnabled: nextEnabled, updatedAt: new Date() })
    .where(eq(schema.sysModules.id, moduleId))
    .returning();

  await auditPermissionChange('MODULE', moduleId, nextEnabled ? 'ENABLE' : 'DISABLE', before, after, reason);
  revalidatePath('/[locale]/system-settings/permissions', 'layout');
}

export async function getPermissionRoles() {
  await requireRbacAdmin();

  const [roles, users, rolePermissions] = await Promise.all([
    db.select().from(schema.roles).orderBy(desc(schema.roles.level)),
    db.select({ role: schema.users.role }).from(schema.users),
    db.select().from(schema.rolePermissions),
  ]);

  return roles.map(role => ({
    ...role,
    userCount: users.filter(user => user.role === role.code).length,
    permissionCount: rolePermissions.filter(permission => permission.roleId === role.id).length,
  }));
}

export async function getRoleModuleMatrix(roleId: string) {
  await requireRbacAdmin();

  const [rolePerms, permissions, modules] = await Promise.all([
    db.select().from(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, roleId)),
    db.select().from(schema.sysPermissions),
    db.select().from(schema.sysModules).orderBy(schema.sysModules.sortOrder),
  ]);

  const grantedPermissionIds = new Set(rolePerms.map(item => item.permissionId));
  const scopeByPermissionId = new Map(rolePerms.map(item => [item.permissionId, item.dataScope]));

  return modules.map(module => {
    const modulePerms = permissions.filter(permission => permission.moduleId === module.id);
    const granted = modulePerms.filter(permission => grantedPermissionIds.has(permission.id));
    return {
      module,
      grantedCount: granted.length,
      permissionCount: modulePerms.length,
      actions: Array.from(new Set(granted.map(permission => permission.action))),
      scope: granted[0] ? scopeByPermissionId.get(granted[0].id) || 'own' : 'none',
    };
  });
}

export async function saveRoleModulePreset(formData: FormData) {
  await requireRbacAdmin();

  const roleId = String(formData.get('roleId') || '');
  const moduleCode = String(formData.get('moduleCode') || '');
  const preset = String(formData.get('preset') || 'view');
  const dataScope = String(formData.get('dataScope') || 'own');
  const reason = String(formData.get('reason') || 'Update role module preset');
  const allowedActions = MODULE_PRESETS[preset] || MODULE_PRESETS.view;

  const [module] = await db.select().from(schema.sysModules).where(eq(schema.sysModules.code, moduleCode)).limit(1);
  if (!module) throw new Error('Module not found');

  const permissions = await db.select()
    .from(schema.sysPermissions)
    .where(eq(schema.sysPermissions.moduleId, module.id));
  const targetPermissions = permissions.filter(permission => allowedActions.includes(permission.action));
  const targetPermissionIds = targetPermissions.map(permission => permission.id);
  const allModulePermissionIds = permissions.map(permission => permission.id);

  const before = allModulePermissionIds.length
    ? await db.select().from(schema.rolePermissions).where(and(
      eq(schema.rolePermissions.roleId, roleId),
      inArray(schema.rolePermissions.permissionId, allModulePermissionIds),
    ))
    : [];

  if (allModulePermissionIds.length > 0) {
    await db.delete(schema.rolePermissions).where(and(
      eq(schema.rolePermissions.roleId, roleId),
      inArray(schema.rolePermissions.permissionId, allModulePermissionIds),
    ));
  }

  if (targetPermissionIds.length > 0) {
    await db.insert(schema.rolePermissions).values(targetPermissionIds.map(permissionId => ({
      id: randomUUID(),
      roleId,
      permissionId,
      dataScope,
      conditionsJson: {},
    })));
  }

  const after = targetPermissionIds.length
    ? await db.select().from(schema.rolePermissions).where(and(
      eq(schema.rolePermissions.roleId, roleId),
      inArray(schema.rolePermissions.permissionId, targetPermissionIds),
    ))
    : [];

  await auditPermissionChange('ROLE', roleId, 'UPDATE_MODULE_PRESET', before, {
    moduleCode,
    preset,
    dataScope,
    permissions: after,
  }, reason);
  revalidatePath('/[locale]/system-settings/permissions/roles', 'page');
}

export async function getPermissionAuditLogs() {
  await requireRbacAdmin();
  return await db.select()
    .from(schema.permissionAuditLogs)
    .orderBy(desc(schema.permissionAuditLogs.createdAt))
    .limit(100);
}

export async function getPermissionUsers() {
  await requireRbacAdmin();
  return await db.select({
    id: schema.users.id,
    name: schema.users.name,
    role: schema.users.role,
    email: schema.users.email,
    departmentId: schema.users.departmentId,
    status: schema.users.status,
  }).from(schema.users).orderBy(schema.users.name);
}

export async function checkUserPermission(formData: FormData) {
  await requireRbacAdmin();

  const userId = String(formData.get('userId') || '');
  const permissionCode = String(formData.get('permissionCode') || '');
  const effective = await getEffectivePermissions(userId);
  const permission = effective.permissions.get(permissionCode);

  return {
    userId,
    permissionCode,
    allowed: permission?.effect === 'ALLOW',
    scope: permission?.effect === 'ALLOW' ? permission.dataScope : 'none',
    effect: permission?.effect || 'DENY',
    allowedModules: effective.allowedModules,
    deniedPermissions: effective.deniedPermissions,
  };
}
