import { NextResponse } from 'next/server';
import { crmStore } from '../../../../libs/server/crm';

export async function GET() {
  const leads = Array.from(crmStore.leads.values())
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  return NextResponse.json({ status: 'success', leads, count: leads.length });
}
