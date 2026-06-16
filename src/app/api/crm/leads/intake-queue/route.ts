import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, schema } from '../../../../../libs/server/db';
import { dbLeadToCrmLead } from '../../../../../libs/server/crm';

export async function GET() {
  const leads = await db.select()
    .from(schema.leads)
    .where(eq(schema.leads.status, 'received'))
    .orderBy(desc(schema.leads.createdAt));

  return NextResponse.json({
    status: 'success',
    leads: leads.map(dbLeadToCrmLead),
    count: leads.length,
  });
}
