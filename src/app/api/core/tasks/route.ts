import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';
import { verifyApiAuth } from '../../../../libs/server/auth';
import { canAccessData, canCreate, canEdit } from '@/src/libs/security/permissions';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  // Verify auth (Must be logged in to fetch tasks)
  const { user, errorResponse } = await verifyApiAuth(req);
  if (errorResponse) return errorResponse;

  const rows = await db.select().from(schema.tasks);
  const tasks = rows.map(row => row.payload).filter((task: any) => user && canAccessData(user, task));
  return NextResponse.json({ status: 'success', tasks, count: tasks.length });
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

  if (!existingTask && !canCreate(user, 'TASKS')) {
    return NextResponse.json({ status: 'error', error: 'Forbidden. Cannot create tasks.' }, { status: 403 });
  }
  if (existingTask && !canEdit(user, 'TASKS', existingTask)) {
    return NextResponse.json({ status: 'error', error: 'Forbidden. Cannot modify this task.' }, { status: 403 });
  }
  if (task && !canAccessData(user, { ...task, assignedId: task.assignedId || user?.id })) {
    return NextResponse.json({ status: 'error', error: 'Forbidden. Task is outside your data scope.' }, { status: 403 });
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

  return NextResponse.json({ status: 'success', task });
}
