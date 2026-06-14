import { NextResponse } from 'next/server';
import { getNotificationConfigStatus } from '../../../../libs/server/notification';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    config: getNotificationConfigStatus(),
  });
}
