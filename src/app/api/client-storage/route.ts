import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { canConfigure } from '@/src/libs/security/permissions';

const keyFromRequest = (request: Request) => new URL(request.url).searchParams.get('key') || '';
const rowKey = (key: string) => `client:${key}`;
const SENSITIVE_CLIENT_KEYS = /logged_in_user_id|role|permission|backup|restore|settings|admin/i;

async function denySensitiveClientWrite(key: string) {
  if (key === 'mis_edutask_logged_in_user_id') return true;
  if (!SENSITIVE_CLIENT_KEYS.test(key)) return false;
  const actor = await getCurrentActor();
  return !actor || !canConfigure(actor, 'SETTINGS');
}

export async function GET(request: Request) {
  const key = keyFromRequest(request);
  if (!key) return NextResponse.json({ value: null });

  try {
    const [setting] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, rowKey(key))).limit(1);
    return NextResponse.json({ key, value: setting?.value ?? null });
  } catch (error) {
    console.error('Client storage GET failed:', error);
    return NextResponse.json({ key, value: null });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const key = String(body?.key || '');
  const value = String(body?.value ?? '');
  if (!key) return NextResponse.json({ status: 'error', error: 'key is required' }, { status: 400 });
  if (await denySensitiveClientWrite(key)) return NextResponse.json({ status: 'error', error: 'Forbidden client storage key' }, { status: 403 });

  try {
    await db.insert(schema.systemSettings).values({
      key: rowKey(key),
      value,
      group: 'client',
      label: `Client storage: ${key}`,
      isEditable: true,
      isSecret: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: schema.systemSettings.key,
      set: { value, updatedAt: new Date() },
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Client storage POST failed:', error);
    return NextResponse.json({ status: 'success', persisted: false });
  }
}

export async function DELETE(request: Request) {
  const key = keyFromRequest(request);
  if (!key) return NextResponse.json({ status: 'success' });
  if (await denySensitiveClientWrite(key)) return NextResponse.json({ status: 'error', error: 'Forbidden client storage key' }, { status: 403 });

  try {
    await db.delete(schema.systemSettings).where(eq(schema.systemSettings.key, rowKey(key)));
  } catch (error) {
    console.error('Client storage DELETE failed:', error);
  }

  return NextResponse.json({ status: 'success' });
}
