import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, schema } from '../../../../../libs/server/db';
import { dbLeadToCrmLead } from '../../../../../libs/server/crm';
import { getCrmLeadScopeCondition } from '../../../../../libs/server/crm-permissions';
import { permissionErrorResponse } from '../../../../../libs/server/permission-service';

export async function GET() {
  try {
    const scopeCondition = await getCrmLeadScopeCondition('crm.lead.view');
    const statusCondition = eq(schema.leads.status, 'received');
    const where = scopeCondition ? and(statusCondition, scopeCondition) : statusCondition;
    const leads = await db.select()
      .from(schema.leads)
      .where(where)
      .orderBy(desc(schema.leads.createdAt));

    return NextResponse.json({
      status: 'success',
      leads: leads.map(dbLeadToCrmLead),
      count: leads.length,
    });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
