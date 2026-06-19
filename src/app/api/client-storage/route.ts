import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/src/libs/server/db';

const keyFromRequest = (request: Request) => new URL(request.url).searchParams.get('key') || '';
const rowKey = (key: string) => `client:${key}`;

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

  try {
    await db.insert(schema.systemSettings).values({
      key: rowKey(key),
      value,
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

  try {
    await db.delete(schema.systemSettings).where(eq(schema.systemSettings.key, rowKey(key)));
  } catch (error) {
    console.error('Client storage DELETE failed:', error);
  }

  return NextResponse.json({ status: 'success' });
}
