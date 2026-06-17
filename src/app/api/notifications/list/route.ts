import { NextResponse } from 'next/server';
import { db, schema } from '@/src/libs/server/db';
import type { Announcement, BoardDirective, Task } from '@/src/types';

export async function GET() {
  try {
    const [taskRows, directiveRows, announcementRows] = await Promise.all([
      db.select().from(schema.tasks),
      db.select().from(schema.directives),
      db.select().from(schema.announcements),
    ]);

    const tasks = taskRows.map(row => row.payload as Task);
    const directives = directiveRows.map(row => row.payload as BoardDirective);
    const announcements = announcementRows.map(row => row.payload as Announcement);

    return NextResponse.json({
      status: 'success',
      tasks,
      directives,
      announcements,
    });
  } catch (error) {
    console.error('[notifications/list] DB error:', error);
    return NextResponse.json({
      status: 'error',
      tasks: [],
      directives: [],
      announcements: [],
    }, { status: 500 });
  }
}
