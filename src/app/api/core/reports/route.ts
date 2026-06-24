import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'quick_report';
  
  const rows = await db.select().from(schema.documents);
  const filteredRows = rows.filter(row => row.type === type);
  return NextResponse.json({ status: 'success', documents: filteredRows.map(row => row.payload), count: filteredRows.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.name) {
    return NextResponse.json({ status: 'error', error: 'Name is required.' }, { status: 400 });
  }

  const id = body.id || crypto.randomUUID();

  await db.insert(schema.documents).values({
    id,
    type: body.type || 'quick_report',
    name: body.name,
    status: body.status || 'pending',
    payload: body,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: schema.documents.id,
    set: {
      type: body.type || 'quick_report',
      name: body.name,
      status: body.status || 'pending',
      payload: body,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ status: 'success', document: body });
}
