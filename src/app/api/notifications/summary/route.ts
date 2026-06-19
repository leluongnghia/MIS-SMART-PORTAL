import { NextResponse } from 'next/server';
import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import type { Announcement, BoardDirective, Task } from '@/src/types';

const TERMINAL_TASK_STATUSES = new Set(['HOAN_THANH', 'completed', 'done', 'closed', 'canceled', 'cancelled', 'archived', 'ARCHIVED', 'HUY']);

function isVisibleTask(task: Task, actor: { id: string; role: string; workspaceId: string | null }) {
  if (TERMINAL_TASK_STATUSES.has(String(task.status))) return false;
  if (actor.role === 'ADMIN' || actor.workspaceId === 'BGH') return true;
  if (actor.role === 'MANAGER') return task.workspaceId === actor.workspaceId || task.assignedId === actor.id;
  return task.assignedId === actor.id;
}

function isVisibleDirective(directive: BoardDirective, actor: { id: string; role: string; workspaceId: string | null }) {
  if (actor.role === 'ADMIN' || actor.workspaceId === 'BGH') return true;
  const impl = directive.implementations || [];
  if (impl.some(item => item.userId === actor.id && item.status !== 'DA_HOAN_THANH')) return true;
  if (impl.length === 0) return true;
  return impl.some(item => item.userTitle?.includes(String(actor.workspaceId || '')) && item.status !== 'DA_HOAN_THANH');
}

function isVisibleAnnouncement(announcement: Announcement, actor: { role: string; id: string }) {
  const acknowledged = announcement.acknowledgedBy || [];
  if (acknowledged.some(item => item.userId === actor.id)) return false;
  return !announcement.targetRoles?.length || announcement.targetRoles.includes(actor.role as any);
}

export async function GET() {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 });
    }

    const [taskRows, directiveRows, announcementRows] = await Promise.all([
      db.select().from(schema.tasks),
      db.select().from(schema.directives),
      db.select().from(schema.announcements),
    ]);

    const tasks = taskRows.map(row => row.payload as Task).filter(task => isVisibleTask(task, actor));
    const directives = directiveRows.map(row => row.payload as BoardDirective).filter(item => isVisibleDirective(item, actor));
    const announcements = announcementRows.map(row => row.payload as Announcement).filter(item => isVisibleAnnouncement(item, actor));
    const urgent = tasks.filter(item => ['CAO', 'high'].includes(String(item.priority))).length + directives.filter(item => ['KHAN', 'DAC_BIET', 'Khẩn cấp'].includes(String(item.urgency))).length;

    const latest = [
      ...tasks.slice(0, 3).map(item => ({ id: item.id, type: 'task', title: item.title, href: '/tasks' })),
      ...directives.slice(0, 3).map(item => ({ id: item.id, type: 'directive', title: item.title, href: '/directives' })),
      ...announcements.slice(0, 3).map(item => ({ id: item.id, type: 'announcement', title: item.title, href: '/announcements' })),
    ].slice(0, 6);

    return NextResponse.json({
      status: 'success',
      total: tasks.length + directives.length + announcements.length,
      tasks: tasks.length,
      directives: directives.length,
      announcements: announcements.length,
      urgent,
      latest,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[notifications/summary] DB error:', error);
    return NextResponse.json({ status: 'error', error: 'Không tải được badge thông báo' }, { status: 500 });
  }
}
