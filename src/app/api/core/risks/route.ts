import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';

export async function GET() {
  const rows = await db.select().from(schema.risks);
  return NextResponse.json({ status: 'success', risks: rows.map(row => row.payload), count: rows.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.title) {
    return NextResponse.json({ status: 'error', error: 'Title is required.' }, { status: 400 });
  }

  const id = body.id || crypto.randomUUID();

  await db.insert(schema.risks).values({
    id,
    title: body.title,
    severity: body.severity || 'medium',
    status: body.status || 'open',
    payload: body,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: schema.risks.id,
    set: {
      title: body.title,
      severity: body.severity || 'medium',
      status: body.status || 'open',
      payload: body,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ status: 'success', risk: body });
}
