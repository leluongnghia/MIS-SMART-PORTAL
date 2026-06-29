import { NextResponse } from 'next/server';
import { getCurrentActor } from '../../../../libs/server/auth-helper';
import { getEffectivePermissions } from '../../../../libs/server/rbac';

export async function GET() {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ permissions: [] });
    }

    // Special case for Super Admin, we just return a flag or all perms
    if (actor.role === 'SUPER_ADMIN') {
      return NextResponse.json({ isSuperAdmin: true, permissions: [] });
    }

    const perms = await getEffectivePermissions(actor.id);
    return NextResponse.json({ isSuperAdmin: false, permissions: perms });
  } catch (error: any) {
    console.error('Failed to get my permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
