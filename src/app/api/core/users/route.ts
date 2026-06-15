import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';
import { verifyApiAuth } from '../../../../libs/server/auth';

export async function GET(req: Request) {
  // Verify auth (Must be logged in to view personnel directory)
  const { errorResponse } = await verifyApiAuth(req);
  if (errorResponse) return errorResponse;

  const rows = await db.select().from(schema.users);
  return NextResponse.json({ status: 'success', users: rows.map(row => row.payload), count: rows.length });
}
