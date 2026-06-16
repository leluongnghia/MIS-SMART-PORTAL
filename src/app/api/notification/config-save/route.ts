import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '../../../../libs/server/auth';
import { db, schema, loadConfigFromDb } from '../../../../libs/server/db';
import { sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  // Verify auth: ADMIN/BGH can save everything. Any TUYEN_SINH_PR user can save Admissions SMTP settings.
  const { errorResponse, user } = await verifyApiAuth(req);
  if (errorResponse) return errorResponse;

  const isAdmin = user?.role === 'ADMIN' || user?.workspaceId === 'BGH';
  const isAdmissionsDept = user?.workspaceId === 'TUYEN_SINH_PR';

  if (!isAdmin && !isAdmissionsDept) {
    return NextResponse.json({ status: 'error', error: 'Forbidden. Insufficient permissions.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { smtp, zalo, gemini, admissionsSmtp, bank } = body;

    if (isAdmissionsDept && !isAdmin) {
      if (smtp || zalo || gemini || bank) {
        return NextResponse.json({ status: 'error', error: 'Forbidden. Admissions department can only configure Admissions SMTP settings.' }, { status: 403 });
      }
    }

    const isSecretVal = (val: string | undefined) => {
      if (val === undefined) return true;
      const t = val.trim();
      return t === '' || t === '••••••••' || t === '***';
    };

    const updates: Record<string, string> = {};

    // 1. Update memory process.env variables and prepare disk updates
    if (smtp && isAdmin) {
      if (smtp.host !== undefined) { process.env.SMTP_HOST = smtp.host; updates['SMTP_HOST'] = smtp.host; }
      if (smtp.port !== undefined) { process.env.SMTP_PORT = smtp.port; updates['SMTP_PORT'] = smtp.port; }
      if (smtp.secure !== undefined) { process.env.SMTP_SECURE = smtp.secure; updates['SMTP_SECURE'] = smtp.secure; }
      if (smtp.user !== undefined && !isSecretVal(smtp.user)) { process.env.SMTP_USER = smtp.user; updates['SMTP_USER'] = smtp.user; }
      if (smtp.pass !== undefined && !isSecretVal(smtp.pass)) { process.env.SMTP_PASS = smtp.pass; updates['SMTP_PASS'] = smtp.pass; }
      if (smtp.from !== undefined) { process.env.EMAIL_FROM = smtp.from; updates['EMAIL_FROM'] = smtp.from; }
      if (smtp.testReceiverEmail !== undefined) { process.env.TEST_RECEIVER_EMAIL = smtp.testReceiverEmail; updates['TEST_RECEIVER_EMAIL'] = smtp.testReceiverEmail; }
      if (smtp.maxCampaignEmailsPerRun !== undefined) { process.env.MAX_CAMPAIGN_EMAILS_PER_RUN = smtp.maxCampaignEmailsPerRun; updates['MAX_CAMPAIGN_EMAILS_PER_RUN'] = smtp.maxCampaignEmailsPerRun; }
      if (smtp.maxEmailRemindersPerRun !== undefined) { process.env.MAX_EMAIL_REMINDERS_PER_RUN = smtp.maxEmailRemindersPerRun; updates['MAX_EMAIL_REMINDERS_PER_RUN'] = smtp.maxEmailRemindersPerRun; }
    }

    if (zalo && isAdmin) {
      if (zalo.oaId !== undefined) { process.env.ZALO_OA_ID = zalo.oaId; updates['ZALO_OA_ID'] = zalo.oaId; }
      if (zalo.appId !== undefined) { process.env.ZALO_APP_ID = zalo.appId; updates['ZALO_APP_ID'] = zalo.appId; }
      if (zalo.appSecret !== undefined && !isSecretVal(zalo.appSecret)) { process.env.ZALO_APP_SECRET = zalo.appSecret; updates['ZALO_APP_SECRET'] = zalo.appSecret; }
      if (zalo.accessToken !== undefined && !isSecretVal(zalo.accessToken)) { process.env.ZALO_ACCESS_TOKEN = zalo.accessToken; updates['ZALO_ACCESS_TOKEN'] = zalo.accessToken; }
      if (zalo.refreshToken !== undefined && !isSecretVal(zalo.refreshToken)) { process.env.ZALO_REFRESH_TOKEN = zalo.refreshToken; updates['ZALO_REFRESH_TOKEN'] = zalo.refreshToken; }
      if (zalo.defaultAudience !== undefined) { process.env.ZALO_DEFAULT_AUDIENCE = zalo.defaultAudience; updates['ZALO_DEFAULT_AUDIENCE'] = zalo.defaultAudience; }
    }

    if (gemini && isAdmin) {
      if (gemini.apiKey !== undefined && !isSecretVal(gemini.apiKey)) { process.env.GEMINI_API_KEY = gemini.apiKey; updates['GEMINI_API_KEY'] = gemini.apiKey; }
    }

    if (admissionsSmtp) {
      if (admissionsSmtp.useCustom !== undefined) {
        const useCust = String(admissionsSmtp.useCustom) === 'true';
        process.env.ADMISSIONS_SMTP_USE_CUSTOM = String(useCust);
        updates['ADMISSIONS_SMTP_USE_CUSTOM'] = String(useCust);
      }
      if (admissionsSmtp.host !== undefined) { process.env.ADMISSIONS_SMTP_HOST = admissionsSmtp.host; updates['ADMISSIONS_SMTP_HOST'] = admissionsSmtp.host; }
      if (admissionsSmtp.port !== undefined) { process.env.ADMISSIONS_SMTP_PORT = admissionsSmtp.port; updates['ADMISSIONS_SMTP_PORT'] = admissionsSmtp.port; }
      if (admissionsSmtp.secure !== undefined) { process.env.ADMISSIONS_SMTP_SECURE = String(admissionsSmtp.secure); updates['ADMISSIONS_SMTP_SECURE'] = String(admissionsSmtp.secure); }
      if (admissionsSmtp.user !== undefined && !isSecretVal(admissionsSmtp.user)) { process.env.ADMISSIONS_SMTP_USER = admissionsSmtp.user; updates['ADMISSIONS_SMTP_USER'] = admissionsSmtp.user; }
      if (admissionsSmtp.pass !== undefined && !isSecretVal(admissionsSmtp.pass)) { process.env.ADMISSIONS_SMTP_PASS = admissionsSmtp.pass; updates['ADMISSIONS_SMTP_PASS'] = admissionsSmtp.pass; }
      if (admissionsSmtp.from !== undefined) { process.env.ADMISSIONS_SMTP_FROM = admissionsSmtp.from; updates['ADMISSIONS_SMTP_FROM'] = admissionsSmtp.from; }
    }

    if (bank && isAdmin) {
      if (bank.bankBin !== undefined) { process.env.BANK_BIN = bank.bankBin; updates['BANK_BIN'] = bank.bankBin; }
      if (bank.bankAccountNo !== undefined) { process.env.BANK_ACCOUNT_NO = bank.bankAccountNo; updates['BANK_ACCOUNT_NO'] = bank.bankAccountNo; }
      if (bank.bankAccountName !== undefined) { process.env.BANK_ACCOUNT_NAME = bank.bankAccountName; updates['BANK_ACCOUNT_NAME'] = bank.bankAccountName; }
      if (bank.reservationPrefix !== undefined) { process.env.PAYMENT_PREFIX_RESERVATION = bank.reservationPrefix; updates['PAYMENT_PREFIX_RESERVATION'] = bank.reservationPrefix; }
      if (bank.enrollmentPrefix !== undefined) { process.env.PAYMENT_PREFIX_ENROLLMENT = bank.enrollmentPrefix; updates['PAYMENT_PREFIX_ENROLLMENT'] = bank.enrollmentPrefix; }
      if (bank.crmBaseTuitionFee !== undefined) { process.env.CRM_BASE_TUITION_FEE = bank.crmBaseTuitionFee; updates['CRM_BASE_TUITION_FEE'] = bank.crmBaseTuitionFee; }
      if (bank.crmReservationFee !== undefined) { process.env.CRM_RESERVATION_FEE = bank.crmReservationFee; updates['CRM_RESERVATION_FEE'] = bank.crmReservationFee; }
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

    // 3. Persist to Database settings
    if (Object.keys(updates).length > 0) {
      await db.insert(schema.systemSettings)
        .values(
          Object.entries(updates).map(([key, value]) => ({
            key,
            value,
            updatedAt: new Date()
          }))
        )
        .onConflictDoUpdate({
          target: schema.systemSettings.key,
          set: {
            value: sql`EXCLUDED.value`,
            updatedAt: new Date()
          }
        });

      // Reload configurations in memory
      await loadConfigFromDb(true);
    }

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
