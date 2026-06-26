"use server";

import { getEffectivePermissions, UserEffectivePermissions } from '../permission-service';
import { getCurrentActor } from '../auth-helper';

export async function fetchMyPermissions(): Promise<UserEffectivePermissions | null> {
  try {
    const actor = await getCurrentActor();
    if (!actor) return null;

    const effective = await getEffectivePermissions(actor.id);
    
    // Convert Map to Array format for client-side serialization
    const serializedPermissions: any = {};
    effective.permissions.forEach((val, key) => {
      serializedPermissions[key] = val;
    });

    return {
      permissions: serializedPermissions as any, // Client side Map will be reconstructed or we just send an object
      allowedModules: effective.allowedModules,
      deniedPermissions: effective.deniedPermissions,
    };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return null;
  }
}
