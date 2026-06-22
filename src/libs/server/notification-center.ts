import { desc, eq, inArray } from 'drizzle-orm';
import { db, schema } from './db';
import { getCurrentActor, writeAuditLog, type Actor } from './auth-helper';
import { RoleCode, WorkspaceCode } from '../../utils/constants';

type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';
export type NotificationModule = 'TASKS' | 'APPROVALS' | 'ADMISSIONS' | 'STUDENTS' | 'STORAGE' | 'SETTINGS' | 'AUDIT_LOGS' | 'SYSTEM';
type NotificationType = 'TASK_ASSIGNED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'APPROVAL_REQUESTED' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED' | 'ADMISSION_LEAD_ASSIGNED' | 'ADMISSION_PAYMENT_UPDATED' | 'STUDENT_PROFILE_MISSING' | 'FILE_UPLOADED' | 'FILE_SHARED' | 'SYSTEM_SECURITY' | 'SETTINGS_CHANGED';

interface PortalNotification {
  id: string; title: string; message: string; module: NotificationModule; type: NotificationType; severity: NotificationSeverity; status: NotificationStatus;
  actor?: { id?: string | null; name?: string | null; title?: string | null }; targetUrl?: string | null; createdAt: string; readAt?: string | null; sourceId?: string | null; dedupeKey: string;
}

export interface NotificationFilters { status?: 'all' | 'unread' | 'read' | 'archived'; module?: string; severity?: string; q?: string; page?: number; pageSize?: number; }
export interface CreateNotificationPayload { title: string; message: string; module: NotificationModule; type: NotificationType; severity?: NotificationSeverity; actorId?: string | null; actorName?: string | null; targetUrl?: string | null; sourceType?: string | null; sourceId?: string | null; scopeType?: 'USER' | 'DEPARTMENT' | 'WORKSPACE' | 'SCHOOL' | 'SYSTEM'; scopeId?: string | null; recipientUserIds?: string[]; payload?: Record<string, any>; }

function canSeeSchoolWide(actor: Actor) { return actor.role === RoleCode.ADMIN || actor.workspaceId === WorkspaceCode.BGH; }
function id(prefix = 'noti') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

async function resolveRecipients(input: CreateNotificationPayload): Promise<string[]> {
  if (input.recipientUserIds?.length) return Array.from(new Set(input.recipientUserIds));
  if (input.scopeType === 'USER' && input.scopeId) return [input.scopeId];
  const users = await db.select().from(schema.users);
  if (input.scopeType === 'DEPARTMENT' || input.scopeType === 'WORKSPACE') return users.filter(u => u.departmentId === input.scopeId || u.workspaceId === input.scopeId || u.role === RoleCode.ADMIN || u.workspaceId === WorkspaceCode.BGH).map(u => u.id);
  return users.filter(u => u.role === RoleCode.ADMIN || u.workspaceId === WorkspaceCode.BGH).map(u => u.id);
}

export async function createNotification(input: CreateNotificationPayload, actorOverride?: Actor | null) {
  const actor = actorOverride ?? await getCurrentActor();
  const notificationId = id('notification');
  const recipients = await resolveRecipients(input);
  if (recipients.length === 0) return { id: notificationId, recipients: 0 };
  await db.insert(schema.notifications).values({
    id: notificationId, title: input.title, message: input.message, module: input.module, type: input.type, severity: input.severity || 'INFO',
    actorId: input.actorId ?? actor?.id ?? null, actorName: input.actorName ?? actor?.name ?? null, targetUrl: input.targetUrl ?? null,
    sourceType: input.sourceType ?? null, sourceId: input.sourceId ?? null, scopeType: input.scopeType || 'USER', scopeId: input.scopeId ?? null,
    payload: input.payload || {}, createdAt: new Date(), updatedAt: new Date(),
  }).onConflictDoNothing();
  await db.insert(schema.notificationRecipients).values(recipients.map(userId => ({ id: id('nr'), notificationId, userId, status: 'UNREAD', createdAt: new Date(), updatedAt: new Date() }))).onConflictDoNothing();
  if (actor) await writeAuditLog(actor.id, 'CREATE_SYSTEM_NOTIFICATION', 'NOTIFICATION', notificationId, { module: 'notifications', recipients: recipients.length });
  return { id: notificationId, recipients: recipients.length };
}

async function persistentNotifications(actor: Actor): Promise<PortalNotification[]> {
  const recs = await db.select().from(schema.notificationRecipients).where(eq(schema.notificationRecipients.userId, actor.id));
  if (recs.length === 0) return [];
  const ids = recs.map(r => r.notificationId);
  const rows = await db.select().from(schema.notifications).where(inArray(schema.notifications.id, ids)).orderBy(desc(schema.notifications.createdAt));
  const recByNotification = new Map(recs.map(r => [r.notificationId, r]));
  return rows.map(row => {
    const rec = recByNotification.get(row.id)!;
    return {
      id: row.id, title: row.title, message: row.message, module: row.module as NotificationModule, type: row.type as NotificationType, severity: row.severity as NotificationSeverity,
      status: rec.status as NotificationStatus, actor: { id: row.actorId, name: row.actorName }, targetUrl: row.targetUrl, createdAt: row.createdAt.toISOString(), readAt: rec.readAt?.toISOString() || null,
      sourceId: row.sourceId, dedupeKey: row.id,
    };
  });
}

function demoNotifications(actor: Actor): PortalNotification[] {
  const now = new Date(); const iso = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  const base = (n: Partial<PortalNotification>): PortalNotification => ({ id: n.id!, dedupeKey: n.id!, title: n.title!, message: n.message!, module: n.module!, type: n.type!, severity: n.severity || 'INFO', status: 'UNREAD', createdAt: n.createdAt || iso(1), targetUrl: n.targetUrl || '/dashboard' });
  const items: PortalNotification[] = [
    base({ id: 'demo-task-1', module: 'TASKS', type: 'TASK_ASSIGNED', title: 'Bạn có nhiệm vụ được giao', message: 'Rà soát kế hoạch tuần', targetUrl: '/tasks', createdAt: iso(2) }),
    base({ id: 'demo-task-2', module: 'TASKS', type: 'TASK_OVERDUE', severity: 'ERROR', title: 'Nhiệm vụ quá hạn', message: 'Báo cáo tiến độ chưa hoàn tất', targetUrl: '/tasks', createdAt: iso(3) }),
    base({ id: 'demo-approval-1', module: 'APPROVALS', type: 'APPROVAL_REQUESTED', severity: 'WARNING', title: 'Có việc cần duyệt', message: 'Một quy trình đang chờ phê duyệt', targetUrl: '/approvals', createdAt: iso(4) }),
    base({ id: 'demo-storage-1', module: 'STORAGE', type: 'FILE_SHARED', title: 'File được chia sẻ', message: 'Tài liệu vận hành mới', targetUrl: '/system-data/storage', createdAt: iso(5) }),
  ];
  if (canSeeSchoolWide(actor) || actor.workspaceId === WorkspaceCode.TUYEN_SINH_PR) items.push(base({ id: 'demo-admission-1', module: 'ADMISSIONS', type: 'ADMISSION_LEAD_ASSIGNED', title: 'Lead tuyển sinh mới', message: 'Hồ sơ TS-2027 cần xử lý', targetUrl: '/admissions', createdAt: iso(6) }));
  if (canSeeSchoolWide(actor)) items.push(base({ id: 'demo-security-1', module: 'AUDIT_LOGS', type: 'SYSTEM_SECURITY', severity: 'ERROR', title: 'Cảnh báo hệ thống', message: 'Demo switcher đang bật', targetUrl: '/system-data/settings', createdAt: iso(1) }));
  return items;
}

async function buildNotifications(actor: Actor, filters: NotificationFilters = {}) {
  const persistent = await persistentNotifications(actor);
  let all = persistent.length ? persistent : demoNotifications(actor);
  let items = all;
  if (filters.status && filters.status !== 'all') items = items.filter(i => i.status === filters.status!.toUpperCase()); else items = items.filter(i => i.status !== 'ARCHIVED');
  if (filters.module && filters.module !== 'all') items = items.filter(i => i.module === filters.module);
  if (filters.severity && filters.severity !== 'all') items = items.filter(i => i.severity === filters.severity);
  if (filters.q) { const q = filters.q.toLowerCase(); items = items.filter(i => `${i.title} ${i.message} ${i.module}`.toLowerCase().includes(q)); }
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const page = Math.max(1, Number(filters.page || 1)); const pageSize = Math.min(50, Math.max(5, Number(filters.pageSize || 10)));
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize, unread: all.filter(i => i.status === 'UNREAD').length, all };
}

export async function getNotifications(filters: NotificationFilters = {}) { const actor = await getCurrentActor(); if (!actor) throw new Error('UNAUTHORIZED'); return buildNotifications(actor, filters); }
export async function getUnreadNotificationCount() { const actor = await getCurrentActor(); if (!actor) throw new Error('UNAUTHORIZED'); const r = await buildNotifications(actor, { status: 'all', pageSize: 50 }); const visible = r.all.filter(i => i.status !== 'ARCHIVED'); return { total: visible.filter(i => i.status === 'UNREAD').length, tasks: visible.filter(i => i.status === 'UNREAD' && i.module === 'TASKS').length, approvals: visible.filter(i => i.status === 'UNREAD' && i.module === 'APPROVALS').length, admissions: visible.filter(i => i.status === 'UNREAD' && i.module === 'ADMISSIONS').length, urgent: visible.filter(i => i.status === 'UNREAD' && ['ERROR', 'WARNING'].includes(i.severity)).length }; }

export async function markNotificationAsRead(notificationId: string) { const actor = await getCurrentActor(); if (!actor) throw new Error('UNAUTHORIZED'); const [rec] = await db.select().from(schema.notificationRecipients).where(eq(schema.notificationRecipients.notificationId, notificationId)); if (rec && rec.userId !== actor.id) throw new Error('NOT_FOUND'); if (rec) await db.update(schema.notificationRecipients).set({ status: 'READ', readAt: new Date(), updatedAt: new Date() }).where(eq(schema.notificationRecipients.id, rec.id)); await writeAuditLog(actor.id, 'MARK_NOTIFICATION_READ', 'NOTIFICATION', notificationId, { module: 'notifications' }); }
export async function markAllNotificationsAsRead() { const actor = await getCurrentActor(); if (!actor) throw new Error('UNAUTHORIZED'); await db.update(schema.notificationRecipients).set({ status: 'READ', readAt: new Date(), updatedAt: new Date() }).where(eq(schema.notificationRecipients.userId, actor.id)); await writeAuditLog(actor.id, 'MARK_ALL_NOTIFICATIONS_READ', 'NOTIFICATION', actor.id, { module: 'notifications' }); }
export async function archiveNotification(notificationId: string) { const actor = await getCurrentActor(); if (!actor) throw new Error('UNAUTHORIZED'); const [rec] = await db.select().from(schema.notificationRecipients).where(eq(schema.notificationRecipients.notificationId, notificationId)); if (rec && rec.userId !== actor.id) await Promise.reject(new Error('NOT_FOUND')); if (rec) await db.update(schema.notificationRecipients).set({ status: 'ARCHIVED', archivedAt: new Date(), updatedAt: new Date() }).where(eq(schema.notificationRecipients.id, rec.id)); await writeAuditLog(actor.id, 'ARCHIVE_NOTIFICATION', 'NOTIFICATION', notificationId, { module: 'notifications' }); }

export async function notifyTaskAssigned(task: any, actor?: Actor | null) { return createNotification({ title: 'Bạn có nhiệm vụ được giao', message: task.title || 'Nhiệm vụ mới', module: 'TASKS', type: 'TASK_ASSIGNED', severity: 'INFO', targetUrl: '/tasks', sourceType: 'TASK', sourceId: task.id, scopeType: 'USER', scopeId: task.assignedId, recipientUserIds: task.assignedId ? [task.assignedId] : [] }, actor); }
export async function notifyApprovalRequested(task: any, actor?: Actor | null) { const managers = await db.select().from(schema.users); return createNotification({ title: 'Có nhiệm vụ chờ duyệt', message: task.title || 'Quy trình cần duyệt', module: 'APPROVALS', type: 'APPROVAL_REQUESTED', severity: 'WARNING', targetUrl: '/approvals', sourceType: 'TASK', sourceId: task.id, recipientUserIds: managers.filter(u => u.role === RoleCode.ADMIN || u.workspaceId === WorkspaceCode.BGH || (u.role === RoleCode.MANAGER && u.workspaceId === task.workspaceId)).map(u => u.id) }, actor); }
export async function notifyAdmissionLeadAssigned(lead: any, actor?: Actor | null) { const users = await db.select().from(schema.users); return createNotification({ title: 'Lead tuyển sinh mới', message: lead.fullName || lead.studentName || lead.leadCode || 'Lead cần xử lý', module: 'ADMISSIONS', type: 'ADMISSION_LEAD_ASSIGNED', severity: 'INFO', targetUrl: '/admissions', sourceType: 'LEAD', sourceId: lead.id, recipientUserIds: users.filter(u => u.role === RoleCode.ADMIN || u.workspaceId === WorkspaceCode.BGH || u.workspaceId === WorkspaceCode.TUYEN_SINH_PR).map(u => u.id) }, actor); }
export async function notifyAdmissionPaymentUpdated(payment: any, actor?: Actor | null) { const users = await db.select().from(schema.users); return createNotification({ title: 'Thanh toán tuyển sinh cập nhật', message: `${payment.code || payment.id} · ${payment.status || 'updated'}`, module: 'ADMISSIONS', type: 'ADMISSION_PAYMENT_UPDATED', severity: 'SUCCESS', targetUrl: '/admissions?view=payments', sourceType: 'PAYMENT', sourceId: payment.id, recipientUserIds: users.filter(u => u.role === RoleCode.ADMIN || u.workspaceId === WorkspaceCode.BGH || u.workspaceId === WorkspaceCode.TUYEN_SINH_PR).map(u => u.id) }, actor); }
