import { NextResponse } from 'next/server';
import { crmStore } from '../../../../../libs/server/crm';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    leads: crmStore.leadIntakeQueue,
    count: crmStore.leadIntakeQueue.length,
  });
}
