import { NextResponse } from 'next/server';
import { db, schema } from '@/src/libs/server/db';
import { MOCK_USERS } from '@/src/mockData';
import type { Announcement, BoardDirective, Task } from '@/src/types';

function isVisibleTask(task: Task, userId: string, workspaceId: string) {
  if (task.status === 'HOAN_THANH') return false;
  return task.assignedId === userId || task.workspaceId === workspaceId;
}

function isVisibleDirective(directive: BoardDirective, userId: string, workspaceId: string) {
  const impl = directive.implementations || [];
  if (impl.some(item => item.userId === userId && item.status !== 'DA_HOAN_THANH')) return true;
  if (impl.length === 0) return workspaceId !== 'BGH';
  return impl.some(item => item.userTitle?.includes(workspaceId) && item.status !== 'DA_HOAN_THANH');
}

function isVisibleAnnouncement(announcement: Announcement, userRole: string, userId: string) {
  const acknowledged = announcement.acknowledgedBy || [];
  if (acknowledged.some(item => item.userId === userId)) return false;
  return !announcement.targetRoles?.length || announcement.targetRoles.includes(userRole as any);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '';
    const user = MOCK_USERS.find(item => item.id === userId) || MOCK_USERS[0];

    const [taskRows, directiveRows, announcementRows] = await Promise.all([
      db.select().from(schema.tasks),
      db.select().from(schema.directives),
      db.select().from(schema.announcements),
    ]);

    const tasks = taskRows.map(row => row.payload as Task).filter(task => isVisibleTask(task, user.id, user.workspaceId));
    const directives = directiveRows.map(row => row.payload as BoardDirective).filter(item => isVisibleDirective(item, user.id, user.workspaceId));
    const announcements = announcementRows.map(row => row.payload as Announcement).filter(item => isVisibleAnnouncement(item, user.role, user.id));
    const urgent = tasks.filter(item => item.priority === 'CAO').length + directives.filter(item => item.urgency === 'KHAN' || item.urgency === 'DAC_BIET').length;

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
    return NextResponse.json({
      status: 'ok',
      total: 0,
      tasks: 0,
      directives: 0,
      announcements: 0,
      urgent: 0,
      latest: [],
      checkedAt: new Date().toISOString(),
    });
  }
}
