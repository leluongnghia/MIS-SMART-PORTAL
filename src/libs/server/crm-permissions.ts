import { and, eq, inArray, sql } from 'drizzle-orm';
import { getCurrentActor, type Actor } from './auth-helper';
import { db, schema } from './db';
import { type DataScope, PermissionError, requirePermission } from './permission-service';

type Lead = typeof schema.leads.$inferSelect;

function denyCondition() {
  return sql`1 = 0`;
}

async function activeGroupIdsForUser(userId: string) {
  const now = new Date();
  const rows = await db.select({
    groupId: schema.groupMembers.groupId,
    memberStart: schema.groupMembers.startDate,
    memberEnd: schema.groupMembers.endDate,
    groupStart: schema.sysGroups.startDate,
    groupEnd: schema.sysGroups.endDate,
  })
    .from(schema.groupMembers)
    .innerJoin(schema.sysGroups, eq(schema.groupMembers.groupId, schema.sysGroups.id))
    .where(and(
      eq(schema.groupMembers.userId, userId),
      eq(schema.groupMembers.status, 'ACTIVE'),
      eq(schema.sysGroups.status, 'ACTIVE'),
    ));

  return rows
    .filter(row => (!row.memberStart || row.memberStart <= now)
      && (!row.memberEnd || row.memberEnd >= now)
      && (!row.groupStart || row.groupStart <= now)
      && (!row.groupEnd || row.groupEnd >= now))
    .map(row => row.groupId);
}

async function userIdsForScope(actor: Actor, scope: DataScope) {
  if (scope === 'own' || scope === 'class') return [actor.id];

  if (scope === 'department') {
    const userDepts = await db.select({ deptId: schema.userDepartments.departmentId })
      .from(schema.userDepartments)
      .where(eq(schema.userDepartments.userId, actor.id));
    
    const deptIds = userDepts.map(d => d.deptId);
    if (actor.departmentId && !deptIds.includes(actor.departmentId)) {
      deptIds.push(actor.departmentId);
    }

    if (deptIds.length === 0) return [actor.id];

    const deptUsers = await db.select({ userId: schema.userDepartments.userId })
      .from(schema.userDepartments)
      .where(inArray(schema.userDepartments.departmentId, deptIds));
    
    const fallbackUsers = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(inArray(schema.users.departmentId, deptIds));

    return Array.from(new Set([
      ...deptUsers.map(u => u.userId),
      ...fallbackUsers.map(u => u.id),
      actor.id
    ]));
  }

  if (scope === 'group') {
    const groupIds = await activeGroupIdsForUser(actor.id);
    if (groupIds.length === 0) return [actor.id];
    const members = await db.select({ userId: schema.groupMembers.userId })
      .from(schema.groupMembers)
      .where(and(
        inArray(schema.groupMembers.groupId, groupIds),
        eq(schema.groupMembers.status, 'ACTIVE'),
      ));
    return Array.from(new Set(members.map(member => member.userId)));
  }

  return null;
}

export async function getCrmLeadScopeCondition(permissionCode = 'crm.lead.view') {
  const permission = await requirePermission(permissionCode);
  const actor = await getCurrentActor();
  if (!actor) throw new PermissionError('UNAUTHORIZED', 'Login required.');

  if (permission.dataScope === 'all' || permission.dataScope === 'school') {
    return undefined;
  }

  const userIds = await userIdsForScope(actor, permission.dataScope);
  if (!userIds || userIds.length === 0) return denyCondition();
  return inArray(schema.leads.assignedUserId, userIds);
}

export async function requireCrmLeadAccess(leadId: string, permissionCode: string): Promise<Lead> {
  const permission = await requirePermission(permissionCode);
  const actor = await getCurrentActor();
  if (!actor) throw new PermissionError('UNAUTHORIZED', 'Login required.');

  const [lead] = await db.select().from(schema.leads).where(eq(schema.leads.id, leadId)).limit(1);
  if (!lead) throw new PermissionError('SCOPE_DENIED', 'CRM lead not found.', 404);

  if (permission.dataScope === 'all' || permission.dataScope === 'school') return lead;

  const userIds = await userIdsForScope(actor, permission.dataScope);
  if (!userIds || !lead.assignedUserId || !userIds.includes(lead.assignedUserId)) {
    throw new PermissionError('SCOPE_DENIED', 'CRM lead is outside your data scope.');
  }

  return lead;
}
