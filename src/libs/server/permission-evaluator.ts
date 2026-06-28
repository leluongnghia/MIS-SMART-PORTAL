import { Actor } from "./auth-helper";
import { getUserModules } from "./module-auth-service";

export async function getSystemMatrix() {
  return {};
}

export async function hasPermission(actor: Actor, moduleKey: string, actionKey: string): Promise<boolean> {
  if (!actor) return false;
  if (actor.role === "ADMIN" || (actor as any).userType === "SUPER_ADMIN") return true;

  const slug = moduleKey.toLowerCase();
  let targetSlug = slug;
  if (slug === "users" || slug === "role" || slug === "permissions") targetSlug = "system";
  else if (slug === "leads" || slug === "admissions") targetSlug = "crm";

  const allowedModules = await getUserModules(actor.id);
  return allowedModules.includes(targetSlug) || allowedModules.includes(slug);
}
