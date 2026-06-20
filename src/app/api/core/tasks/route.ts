import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';
import { eq } from 'drizzle-orm';
import { verifyApiAuth } from '../../../../libs/server/auth';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { notifyApprovalRequested, notifyTaskAssigned } from '@/src/libs/server/notification-center';

export async function GET(req: Request) {
  // Verify auth (Must be logged in to fetch tasks)
  const { errorResponse } = await verifyApiAuth(req);
  if (errorResponse) return errorResponse;

  const rows = await db.select().from(schema.tasks);
  return NextResponse.json({ status: 'success', tasks: rows.map(row => row.payload), count: rows.length });
}

export async function POST(request: Request) {
  // Verify auth (Must be logged in to modify tasks)
  const { user, errorResponse } = await verifyApiAuth(request);
  if (errorResponse) return errorResponse;

  const task = await request.json();
  if (!task?.id || !task?.title) {
    return NextResponse.json({ status: 'error', error: 'Task id and title are required.' }, { status: 400 });
  }

  // Retrieve existing task if any
  const existingTaskRows = await db.select().from(schema.tasks).where(eq(schema.tasks.id, task.id));
  const existingTask = existingTaskRows.length > 0 ? (existingTaskRows[0].payload as any) : null;

  // Enforce role-based security policies for non-ADMIN
  if (user && user.role !== 'ADMIN' && user.workspaceId !== 'BGH') {
    // 1. MANAGER restriction: Cannot modify tasks outside their own department
    if (user.role === 'MANAGER') {
      if (task.workspaceId && task.workspaceId !== user.workspaceId) {
        return NextResponse.json(
          { status: 'error', error: 'Forbidden. Cannot create/modify tasks outside your workspace.' },
          { status: 403 }
        );
      }
      if (existingTask && existingTask.workspaceId !== user.workspaceId) {
        return NextResponse.json(
          { status: 'error', error: 'Forbidden. Cannot modify tasks outside your workspace.' },
          { status: 403 }
        );
      }
    }

    // 2. STAFF restriction: Cannot create new tasks, and can only edit tasks assigned to themselves
    if (user.role === 'STAFF') {
      if (!existingTask) {
        return NextResponse.json(
          { status: 'error', error: 'Forbidden. Staff members cannot create new tasks.' },
          { status: 403 }
        );
      }
      if (existingTask.assignedId !== user.id) {
        return NextResponse.json(
          { status: 'error', error: 'Forbidden. Cannot modify tasks assigned to other users.' },
          { status: 403 }
        );
      }
    }
  }

  await db.insert(schema.tasks).values({
    id: task.id,
    title: task.title,
    description: task.description || '',
    workspaceId: task.workspaceId || '',
    assignedId: task.assignedId || '',
    assignedName: task.assignedName || '',
    status: task.status || 'CHUA_BAT_DA',
    priority: task.priority || 'TRUNG_BINH',
    deadline: task.deadline || '',
    tag: task.tag || '',
    payload: task,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: schema.tasks.id,
    set: {
      title: task.title,
      description: task.description || '',
      workspaceId: task.workspaceId || '',
      assignedId: task.assignedId || '',
      assignedName: task.assignedName || '',
      status: task.status || 'CHUA_BAT_DA',
      priority: task.priority || 'TRUNG_BINH',
      deadline: task.deadline || '',
      tag: task.tag || '',
      payload: task,
      updatedAt: new Date(),
    },
  });

  const actor = await getCurrentActor().catch(() => null);
  if (!existingTask) {
    await notifyTaskAssigned(task, actor).catch(error => console.error('notifyTaskAssigned failed:', error));
  }
  if (task.status === 'CHO_DUYET' && existingTask?.status !== 'CHO_DUYET') {
    await notifyApprovalRequested(task, actor).catch(error => console.error('notifyApprovalRequested failed:', error));
  }

  return NextResponse.json({ status: 'success', task });
}
