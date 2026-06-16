import { NextResponse } from 'next/server';
import { getNotificationConfigStatus } from '../../../../libs/server/notification';
import { verifyApiAuth } from '../../../../libs/server/auth';

export async function GET(req: Request) {
  // Verify auth (Must be logged in to view system config status)
  const { errorResponse } = await verifyApiAuth(req);
  if (errorResponse) return errorResponse;

  return NextResponse.json({
    status: 'success',
    config: await getNotificationConfigStatus(),
  });
}
