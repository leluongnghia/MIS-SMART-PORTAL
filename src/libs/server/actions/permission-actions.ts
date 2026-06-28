"use server";

import { getCurrentActor } from '../auth-helper';
import { getUserModules, getModuleDataScope } from '../module-auth-service';

export async function fetchMyPermissions() {
  try {
    const actor = await getCurrentActor();
    if (!actor) return null;

    const allowedModules = await getUserModules(actor.id);
    
    // Build scopes map for allowed modules
    const scopesMap: Record<string, string> = {};
    for (const slug of allowedModules) {
      scopesMap[slug] = await getModuleDataScope(actor.id, slug);
    }

    return {
      permissions: {}, // Backward compatibility
      allowedModules,
      scopesMap,
    };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return null;
  }
}
