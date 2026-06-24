import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';

export async function GET() {
  const rows = await db.select().from(schema.events);
  return NextResponse.json({ status: 'success', events: rows.map(row => row.payload), count: rows.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.title) {
    return NextResponse.json({ status: 'error', error: 'Title is required.' }, { status: 400 });
  }

  const id = body.id || crypto.randomUUID();

  await db.insert(schema.events).values({
    id,
    title: body.title,
    date: body.date ? new Date(body.date) : new Date(),
    department: body.department || null,
    payload: body,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: schema.events.id,
    set: {
      title: body.title,
      date: body.date ? new Date(body.date) : new Date(),
      department: body.department || null,
      payload: body,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ status: 'success', event: body });
}
