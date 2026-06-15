import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyApiAuth } from '../../../../libs/server/auth';

export async function POST(req: NextRequest) {
  // Verify auth (Only ADMIN role can save system config)
  const { errorResponse } = await verifyApiAuth(req, { requiredRole: 'ADMIN' });
  if (errorResponse) return errorResponse;

  try {
    const { smtp, zalo, gemini } = await req.json();

    const isSecretVal = (val: string | undefined) => {
      if (val === undefined) return true;
      const t = val.trim();
      return t === '' || t === '••••••••' || t === '***';
    };

    const updates: Record<string, string> = {};

    // 1. Update memory process.env variables and prepare disk updates
    if (smtp) {
      if (smtp.host !== undefined) { process.env.SMTP_HOST = smtp.host; updates['SMTP_HOST'] = smtp.host; }
      if (smtp.port !== undefined) { process.env.SMTP_PORT = smtp.port; updates['SMTP_PORT'] = smtp.port; }
      if (smtp.secure !== undefined) { process.env.SMTP_SECURE = smtp.secure; updates['SMTP_SECURE'] = smtp.secure; }
      if (smtp.user !== undefined && !isSecretVal(smtp.user)) { process.env.SMTP_USER = smtp.user; updates['SMTP_USER'] = smtp.user; }
      if (smtp.pass !== undefined && !isSecretVal(smtp.pass)) { process.env.SMTP_PASS = smtp.pass; updates['SMTP_PASS'] = smtp.pass; }
      if (smtp.from !== undefined) { process.env.EMAIL_FROM = smtp.from; updates['EMAIL_FROM'] = smtp.from; }
    }

    if (zalo) {
      if (zalo.oaId !== undefined) { process.env.ZALO_OA_ID = zalo.oaId; updates['ZALO_OA_ID'] = zalo.oaId; }
      if (zalo.appId !== undefined) { process.env.ZALO_APP_ID = zalo.appId; updates['ZALO_APP_ID'] = zalo.appId; }
      if (zalo.appSecret !== undefined && !isSecretVal(zalo.appSecret)) { process.env.ZALO_APP_SECRET = zalo.appSecret; updates['ZALO_APP_SECRET'] = zalo.appSecret; }
      if (zalo.accessToken !== undefined && !isSecretVal(zalo.accessToken)) { process.env.ZALO_ACCESS_TOKEN = zalo.accessToken; updates['ZALO_ACCESS_TOKEN'] = zalo.accessToken; }
      if (zalo.refreshToken !== undefined && !isSecretVal(zalo.refreshToken)) { process.env.ZALO_REFRESH_TOKEN = zalo.refreshToken; updates['ZALO_REFRESH_TOKEN'] = zalo.refreshToken; }
    }

    if (gemini) {
      if (gemini.apiKey !== undefined && !isSecretVal(gemini.apiKey)) { process.env.GEMINI_API_KEY = gemini.apiKey; updates['GEMINI_API_KEY'] = gemini.apiKey; }
    }

    // 2. Also dynamically update smtpConfig object in memory if possible
    try {
      const notificationLib = require('../../../../libs/server/notification');
      if (notificationLib && notificationLib.smtpConfig) {
        if (smtp) {
          if (smtp.host !== undefined) notificationLib.smtpConfig.host = smtp.host;
          if (smtp.port !== undefined) notificationLib.smtpConfig.port = parseInt(smtp.port, 10);
          if (smtp.secure !== undefined) notificationLib.smtpConfig.secure = smtp.secure === 'true';
          if (notificationLib.smtpConfig.auth) {
            if (smtp.user !== undefined && !isSecretVal(smtp.user)) notificationLib.smtpConfig.auth.user = smtp.user;
            if (smtp.pass !== undefined && !isSecretVal(smtp.pass)) notificationLib.smtpConfig.auth.pass = smtp.pass;
          }
        }
      }
    } catch (err) {
      console.error('Error updating in-memory smtpConfig:', err);
    }

    // 3. Persist to .env file on disk
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const lines = envContent.split(/\r?\n/);
    const updatedKeys = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#') || !line.includes('=')) continue;
      const parts = line.split('=');
      const key = parts[0].trim();
      if (updates[key] !== undefined) {
        lines[i] = `${key}="${updates[key].replace(/"/g, '\\"')}"`;
        updatedKeys.add(key);
      }
    }

    // Append any keys that weren't already in .env
    for (const [key, val] of Object.entries(updates)) {
      if (!updatedKeys.has(key)) {
        lines.push(`${key}="${val.replace(/"/g, '\\"')}"`);
      }
    }

    fs.writeFileSync(envPath, lines.join('\n'), 'utf8');

    return NextResponse.json({
      status: 'success',
      message: 'Config updated and saved successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error.message || 'Failed to save configuration.' },
      { status: 500 }
    );
  }
}
