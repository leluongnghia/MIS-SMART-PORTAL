import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';

export async function GET() {
  const rows = await db.select().from(schema.users);
  return NextResponse.json({ status: 'success', users: rows.map(row => row.payload), count: rows.length });
}
