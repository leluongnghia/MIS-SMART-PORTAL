import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { verifyApiAuth } from '../../../../libs/server/auth';
import { db, schema } from '../../../../libs/server/db';

export async function GET(req: Request) {
  const { errorResponse } = await verifyApiAuth(req, { requiredWorkspace: 'TUYEN_SINH_PR' });
  if (errorResponse) return errorResponse;

  const leads = await db.select().from(schema.leads).orderBy(desc(schema.leads.updatedAt));
  return NextResponse.json({ status: 'success', leads, count: leads.length });
}
