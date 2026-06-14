import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';

export async function GET() {
  const rows = await db.select().from(schema.directives);
  return NextResponse.json({ status: 'success', directives: rows.map(row => row.payload), count: rows.length });
}

export async function POST(request: Request) {
  const directive = await request.json();
  if (!directive?.id || !directive?.title) {
    return NextResponse.json({ status: 'error', error: 'Directive id and title are required.' }, { status: 400 });
  }
  await db.insert(schema.directives).values({
    id: directive.id,
    title: directive.title,
    category: directive.category || '',
    urgency: directive.urgency || '',
    senderId: directive.senderId || '',
    payload: directive,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: schema.directives.id,
    set: {
      title: directive.title,
      category: directive.category || '',
      urgency: directive.urgency || '',
      senderId: directive.senderId || '',
      payload: directive,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json({ status: 'success', directive });
}
