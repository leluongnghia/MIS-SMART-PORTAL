import { NextResponse } from 'next/server';
import { crmStore } from '../../../../libs/server/crm';
import { verifyApiAuth } from '../../../../libs/server/auth';

export async function GET(req: Request) {
  // Verify auth (Only Admissions & PR workspace or ADMIN can fetch CRM leads)
  const { errorResponse } = await verifyApiAuth(req, { requiredWorkspace: 'TUYEN_SINH_PR' });
  if (errorResponse) return errorResponse;

  const leads = Array.from(crmStore.leads.values())
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  return NextResponse.json({ status: 'success', leads, count: leads.length });
}
