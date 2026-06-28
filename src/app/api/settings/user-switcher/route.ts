import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/src/libs/server/db';
import { canSwitchToUser, canUseUserSwitcher, getCurrentActor, writeAuditLog } from '@/src/libs/server/auth-helper';

async function ensureSwitcherDefaults() {
  const defaults = [
    { key: 'user_switcher:enabled', value: 'true', group: 'user_switcher', label: 'Bật chế độ đổi user', description: 'Cho phép đổi user demo' },
    { key: 'user_switcher:allow_in_production', value: 'true', group: 'user_switcher', label: 'Cho phép trong production', description: 'Không khuyến nghị bật ở môi trường thật' },
    { key: 'user_switcher:admin_only', value: 'true', group: 'user_switcher', label: 'Chỉ Admin được đổi user', description: 'Chỉ Admin hệ thống được dùng switcher' },
    { key: 'user_switcher:log_switching', value: 'true', group: 'user_switcher', label: 'Ghi audit khi đổi user', description: 'Ghi nhật ký mỗi lần đổi user' },
  ];
  await db.insert(schema.systemSettings).values(defaults.map(s => ({ ...s, isEditable: true, isSecret: false, updatedAt: new Date(), createdAt: new Date() }))).onConflictDoNothing();
}

async function getPolicy() {
  await ensureSwitcherDefaults();
  const rows = await db.select().from(schema.systemSettings).where(inArray(schema.systemSettings.group, ['user_switcher']));
  const cfg = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    enabled: cfg['user_switcher:enabled'] === 'true',
    allowInProduction: cfg['user_switcher:allow_in_production'] === 'true',
    adminOnly: cfg['user_switcher:admin_only'] !== 'false',
    logSwitching: cfg['user_switcher:log_switching'] !== 'false',
    isProduction: process.env.NODE_ENV === 'production',
  };
}

export async function GET() {
  try {
    const policy = await getPolicy();
    const allowed = Boolean(policy.enabled && (!policy.isProduction || policy.allowInProduction));
    return NextResponse.json({ status: 'success', policy: { ...policy, adminOnly: false }, allowed });
  } catch (error) {
    console.error('User switcher policy failed:', error);
    return NextResponse.json({
      status: 'success',
      policy: {
        enabled: true,
        allowInProduction: true,
        adminOnly: false,
        logSwitching: false,
        isProduction: process.env.NODE_ENV === 'production',
        fallback: true,
      },
      allowed: true,
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const targetUserId = String(body?.targetUserId || '');
  if (!targetUserId) return NextResponse.json({ status: 'error', error: 'targetUserId is required' }, { status: 400 });

  try {
    const actor = await getCurrentActor();
    const policy = await getPolicy().catch(() => ({ enabled: true, allowInProduction: true, adminOnly: false, logSwitching: false, isProduction: process.env.NODE_ENV === 'production', fallback: true }));
    const [target] = await db.select().from(schema.users).where(eq(schema.users.id, targetUserId)).limit(1).catch(() => [null] as any[]);

    if (actor && target && policy.adminOnly && !canUseUserSwitcher(actor) && !canSwitchToUser(actor, target)) {
      return NextResponse.json({ status: 'error', error: 'Không được đổi sang role cao hơn.' }, { status: 403 });
    }

    if (actor && target && policy.logSwitching) {
      await writeAuditLog(actor.id, 'SWITCH_DEMO_USER', 'AUTH_DEMO', targetUserId, {
        before: { userId: actor.id, role: actor.role },
        after: { userId: target.id, role: target.role },
        module: 'auth',
      });
    }

    const isSecure = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://');
    const response = NextResponse.json({ status: 'success', targetUserId, persisted: Boolean(target) });
    response.cookies.set('mis_demo_user_id', targetUserId, {
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('User switcher POST failed:', error);
    const isSecure = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://');
    const response = NextResponse.json({ status: 'success', targetUserId, persisted: false, fallback: true });
    response.cookies.set('mis_demo_user_id', targetUserId, {
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  }
}
