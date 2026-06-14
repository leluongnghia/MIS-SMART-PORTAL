import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';

export async function GET() {
  const rows = await db.select().from(schema.tasks);
  return NextResponse.json({ status: 'success', tasks: rows.map(row => row.payload), count: rows.length });
}

export async function POST(request: Request) {
  const task = await request.json();
  if (!task?.id || !task?.title) {
    return NextResponse.json({ status: 'error', error: 'Task id and title are required.' }, { status: 400 });
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
