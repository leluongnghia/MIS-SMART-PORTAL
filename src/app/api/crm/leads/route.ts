import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';
import { getCrmLeadScopeCondition } from '../../../../libs/server/crm-permissions';
import { permissionErrorResponse } from '../../../../libs/server/permission-service';

export async function GET(req: Request) {
  try {
    const scopeCondition = await getCrmLeadScopeCondition('crm.lead.view');
    const query = db.select().from(schema.leads);
    const leads = scopeCondition
      ? await query.where(scopeCondition).orderBy(desc(schema.leads.updatedAt))
      : await query.orderBy(desc(schema.leads.updatedAt));
    return NextResponse.json({ status: 'success', leads, count: leads.length });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
