// Additional function to evaluate dynamic matrix permissions
import { db, schema } from "./db";
import { eq } from "drizzle-orm";
import { Actor } from "./auth-helper";

let matrixCache: any = null;
let lastCacheTime = 0;

export async function getSystemMatrix() {
  const now = Date.now();
  if (matrixCache && now - lastCacheTime < 60000) {
    return matrixCache;
  }
  const row = await db.select().from(schema.rbacConfig).where(eq(schema.rbacConfig.id, "system_matrix")).limit(1);
  matrixCache = row.length > 0 ? row[0].config : {};
  lastCacheTime = now;
  return matrixCache;
}

export async function hasPermission(actor: Actor, moduleKey: string, actionKey: string): Promise<boolean> {
  // 1. Check user overrides first (highest priority)
  const overrideRow = await db.select().from(schema.userOverrides).where(eq(schema.userOverrides.id, actor.id)).limit(1);
  if (overrideRow.length > 0) {
    const overrides = overrideRow[0].overrides as any;
    if (overrides && overrides[moduleKey] && typeof overrides[moduleKey][actionKey] === "boolean") {
      return overrides[moduleKey][actionKey]; // Return exact override (true/false)
    }
  }

  // 2. Admin always has full access if no explicit deny
  if (actor.role === "ADMIN") return true;

  // 3. Check system matrix
  const matrix = await getSystemMatrix();

  // 3a. Check department level
  if (actor.departmentId && matrix[actor.departmentId]) {
    const deptPerms = matrix[actor.departmentId];
    if (deptPerms[moduleKey] && deptPerms[moduleKey][actionKey] === true) {
      return true;
    }
  }

  // 3b. Check role level
  if (actor.role && matrix[actor.role]) {
    const rolePerms = matrix[actor.role];
    if (rolePerms[moduleKey] && rolePerms[moduleKey][actionKey] === true) {
      return true;
    }
  }

  return false;
}
