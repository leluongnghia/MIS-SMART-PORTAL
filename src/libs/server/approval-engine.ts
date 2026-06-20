import { and, desc, eq, inArray, or } from 'drizzle-orm';
import { db, schema } from './db';
import { getCurrentActor, writeAuditLog, type Actor } from './auth-helper';
import { createNotification, type NotificationModule } from './notification-center';

export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION' | 'CANCELLED';
export type ApprovalAction = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION' | 'CANCELLED' | 'COMMENTED';
export type ApprovalModule = 'TASKS' | 'ADMISSIONS' | 'STUDENTS' | 'FACILITIES' | 'STORAGE' | 'SETTINGS' | 'SYSTEM';

export interface ApprovalRequestInput {
  module: ApprovalModule;
  entityType: string;
  entityId: string;
  title: string;
  description?: string | null;
  status?: ApprovalStatus;
  requesterId?: string | null;
  requesterName?: string | null;
  approverId?: string | null;
  approverRole?: string | null;
  approverWorkspaceId?: string | null;
  approverDepartmentId?: string | null;
  targetUrl?: string | null;
  payload?: Record<string, any>;
}

export interface ApprovalFilters {
  status?: ApprovalStatus | 'ALL';
  module?: ApprovalModule | 'ALL';
  mine?: boolean;
  page?: number;
  pageSize?: number;
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isAdmin(actor: Actor) {
  return actor.role === 'ADMIN' || actor.workspaceId === 'BGH';
}

function typeToNotification(action: ApprovalAction) {
  if (action === 'APPROVED') return 'APPROVAL_APPROVED';
  if (action === 'REJECTED') return 'APPROVAL_REJECTED';
  return 'APPROVAL_REQUESTED';
}

function statusMessage(status: ApprovalStatus) {
  switch (status) {
    case 'APPROVED': return 'Đã được phê duyệt';
    case 'REJECTED': return 'Đã bị từ chối';
    case 'NEEDS_REVISION': return 'Cần bổ sung/chỉnh sửa';
    case 'CANCELLED': return 'Đã hủy yêu cầu';
    case 'DRAFT': return 'Bản nháp';
    default: return 'Đang chờ phê duyệt';
  }
}

export function canActOnApproval(actor: Actor, request: any) {
  if (isAdmin(actor)) return true;
  if (request.approverId && request.approverId === actor.id) return true;
  if (request.approverRole && request.approverRole === actor.role) return true;
  if (request.approverWorkspaceId && request.approverWorkspaceId === actor.workspaceId) return true;
  if (request.approverDepartmentId && request.approverDepartmentId === actor.departmentId) return true;
  return false;
}

async function addEvent(input: {
  requestId: string;
  action: ApprovalAction;
  fromStatus?: string | null;
  toStatus?: string | null;
  actor?: Actor | null;
  comment?: string | null;
  metadata?: Record<string, any>;
}) {
  await db.insert(schema.approvalEvents).values({
    id: id('approval_event'),
    approvalRequestId: input.requestId,
    action: input.action,
    fromStatus: input.fromStatus ?? null,
    toStatus: input.toStatus ?? null,
    actorId: input.actor?.id ?? null,
    actorName: input.actor?.name ?? null,
    comment: input.comment ?? null,
    metadata: input.metadata || {},
    createdAt: new Date(),
  });
}

async function notifyApproval(request: any, action: ApprovalAction, actor: Actor | null, comment?: string | null) {
  const users = await db.select().from(schema.users);
  const recipients = new Set<string>();
  if (request.requesterId) recipients.add(request.requesterId);
  if (request.approverId) recipients.add(request.approverId);
  for (const user of users) {
    if (user.role === 'ADMIN' || user.workspaceId === 'BGH') recipients.add(user.id);
    if (request.approverWorkspaceId && user.workspaceId === request.approverWorkspaceId) recipients.add(user.id);
    if (request.approverDepartmentId && user.departmentId === request.approverDepartmentId) recipients.add(user.id);
    if (request.approverRole && user.role === request.approverRole) recipients.add(user.id);
  }
  if (actor?.id) recipients.delete(actor.id);

  await createNotification({
    title: action === 'SUBMITTED' ? 'Có yêu cầu phê duyệt mới' : `Yêu cầu phê duyệt: ${statusMessage(request.status as ApprovalStatus)}`,
    message: `${request.title}${comment ? ` · ${comment}` : ''}`,
    module: 'APPROVALS' as NotificationModule,
    type: typeToNotification(action) as any,
    severity: action === 'REJECTED' ? 'ERROR' : action === 'APPROVED' ? 'SUCCESS' : 'WARNING',
    targetUrl: request.targetUrl || '/approvals',
    sourceType: 'APPROVAL_REQUEST',
    sourceId: request.id,
    recipientUserIds: Array.from(recipients),
    payload: { status: request.status, module: request.module, entityType: request.entityType, entityId: request.entityId },
  }, actor);
}

export async function createApprovalRequest(input: ApprovalRequestInput, actorOverride?: Actor | null) {
  const actor = actorOverride ?? await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const existing = await db.select().from(schema.approvalRequests).where(and(
    eq(schema.approvalRequests.entityType, input.entityType),
    eq(schema.approvalRequests.entityId, input.entityId),
    inArray(schema.approvalRequests.status, ['DRAFT', 'PENDING', 'NEEDS_REVISION']),
  )).limit(1);
  if (existing[0]) return existing[0];

  const request = {
    id: id('approval'),
    module: input.module,
    entityType: input.entityType,
    entityId: input.entityId,
    title: input.title,
    description: input.description ?? null,
    status: input.status || 'PENDING',
    requesterId: input.requesterId ?? actor.id,
    requesterName: input.requesterName ?? actor.name,
    approverId: input.approverId ?? null,
    approverRole: input.approverRole ?? null,
    approverWorkspaceId: input.approverWorkspaceId ?? null,
    approverDepartmentId: input.approverDepartmentId ?? null,
    currentStep: 1,
    targetUrl: input.targetUrl ?? '/approvals',
    payload: input.payload || {},
    submittedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(schema.approvalRequests).values(request);
  await addEvent({ requestId: request.id, action: 'SUBMITTED', toStatus: request.status, actor, metadata: { module: input.module } });
  await writeAuditLog(actor.id, 'APPROVAL_REQUEST_SUBMITTED', 'APPROVAL_REQUEST', request.id, { module: input.module, entityType: input.entityType, entityId: input.entityId });
  await notifyApproval(request, 'SUBMITTED', actor);
  return request;
}

export async function getApprovalRequests(filters: ApprovalFilters = {}) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');
  const clauses = [];
  if (filters.status && filters.status !== 'ALL') clauses.push(eq(schema.approvalRequests.status, filters.status));
  if (filters.module && filters.module !== 'ALL') clauses.push(eq(schema.approvalRequests.module, filters.module));
  if (filters.mine) clauses.push(eq(schema.approvalRequests.requesterId, actor.id));
  if (!isAdmin(actor)) clauses.push(or(
    eq(schema.approvalRequests.requesterId, actor.id),
    eq(schema.approvalRequests.approverId, actor.id),
    eq(schema.approvalRequests.approverRole, actor.role),
    actor.workspaceId ? eq(schema.approvalRequests.approverWorkspaceId, actor.workspaceId) : undefined,
    actor.departmentId ? eq(schema.approvalRequests.approverDepartmentId, actor.departmentId) : undefined,
  ) as any);
  const rows = await db.select().from(schema.approvalRequests).where(clauses.length ? and(...clauses as any[]) : undefined).orderBy(desc(schema.approvalRequests.createdAt));
  const page = Math.max(1, Number(filters.page || 1));
  const pageSize = Math.min(100, Math.max(5, Number(filters.pageSize || 50)));
  return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize };
}

export async function getApprovalRequestById(requestId: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');
  const [request] = await db.select().from(schema.approvalRequests).where(eq(schema.approvalRequests.id, requestId)).limit(1);
  if (!request) throw new Error('NOT_FOUND');
  if (!canActOnApproval(actor, request) && request.requesterId !== actor.id) throw new Error('FORBIDDEN');
  return request;
}

export async function getApprovalHistory(requestId: string) {
  await getApprovalRequestById(requestId);
  return db.select().from(schema.approvalEvents).where(eq(schema.approvalEvents.approvalRequestId, requestId)).orderBy(desc(schema.approvalEvents.createdAt));
}

async function transitionApproval(requestId: string, status: ApprovalStatus, action: ApprovalAction, comment?: string | null) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');
  const [request] = await db.select().from(schema.approvalRequests).where(eq(schema.approvalRequests.id, requestId)).limit(1);
  if (!request) throw new Error('NOT_FOUND');
  const isCancel = action === 'CANCELLED';
  if (!isCancel && !canActOnApproval(actor, request)) throw new Error('FORBIDDEN');
  if (isCancel && request.requesterId !== actor.id && !isAdmin(actor)) throw new Error('FORBIDDEN');
  if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(request.status)) throw new Error('REQUEST_ALREADY_CLOSED');

  const patch = { status, resolvedAt: ['APPROVED', 'REJECTED', 'CANCELLED'].includes(status) ? new Date() : null, updatedAt: new Date() };
  await db.update(schema.approvalRequests).set(patch).where(eq(schema.approvalRequests.id, requestId));
  const updated = { ...request, ...patch };
  await addEvent({ requestId, action, fromStatus: request.status, toStatus: status, actor, comment });
  await writeAuditLog(actor.id, `APPROVAL_${action}`, 'APPROVAL_REQUEST', requestId, { before: { status: request.status }, after: { status }, comment });
  await notifyApproval(updated, action, actor, comment);
  return updated;
}

export async function approveApprovalRequest(requestId: string, comment?: string | null) {
  return transitionApproval(requestId, 'APPROVED', 'APPROVED', comment);
}

export async function rejectApprovalRequest(requestId: string, comment?: string | null) {
  if (!comment?.trim()) throw new Error('COMMENT_REQUIRED');
  return transitionApproval(requestId, 'REJECTED', 'REJECTED', comment);
}

export async function requestApprovalRevision(requestId: string, comment?: string | null) {
  if (!comment?.trim()) throw new Error('COMMENT_REQUIRED');
  return transitionApproval(requestId, 'NEEDS_REVISION', 'NEEDS_REVISION', comment);
}

export async function cancelApprovalRequest(requestId: string, comment?: string | null) {
  return transitionApproval(requestId, 'CANCELLED', 'CANCELLED', comment);
}
