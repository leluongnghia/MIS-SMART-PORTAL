import { NextResponse } from 'next/server';
import { getCurrentActor, writeAuditLog, type Actor } from '@/src/libs/server/auth-helper';
import { canAccessData, hasPermission, type PermissionAction, type PermissionModule, type ScopedEntity } from './permissions';

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ status: 'error', error: message }, { status: 403 });
}

export async function requirePermission(module: PermissionModule, action: PermissionAction): Promise<{ actor: Actor; errorResponse: null } | { actor: null; errorResponse: NextResponse }> {
  const actor = await getCurrentActor();
  if (!actor) return { actor: null, errorResponse: forbidden('Unauthorized') };
  if (!hasPermission(actor, module, action)) {
    await writeAuditLog(actor.id, `DENIED_${action}_${module}`, module, 'unknown', { success: false, module: module.toLowerCase() });
    return { actor: null, errorResponse: forbidden(`Missing permission: ${module}.${action}`) };
  }
  return { actor, errorResponse: null };
}

export async function requireDataAccess(entity: ScopedEntity | null | undefined): Promise<{ actor: Actor; errorResponse: null } | { actor: null; errorResponse: NextResponse }> {
  const actor = await getCurrentActor();
  if (!actor) return { actor: null, errorResponse: forbidden('Unauthorized') };
  if (!canAccessData(actor, entity)) {
    await writeAuditLog(actor.id, 'DENIED_DATA_ACCESS', 'DATA_SCOPE', String(entity?.id || 'unknown'), { success: false, module: 'security' });
    return { actor: null, errorResponse: forbidden('Data is outside your scope') };
  }
  return { actor, errorResponse: null };
}
