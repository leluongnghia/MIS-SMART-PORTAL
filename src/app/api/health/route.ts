import { NextResponse } from 'next/server';
import { hasSmtpConfig } from '../../../libs/server/notification';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasSmtpConfig: hasSmtpConfig(),
  });
}
