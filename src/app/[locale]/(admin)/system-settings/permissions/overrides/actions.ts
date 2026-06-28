"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, like, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkAccess } from "@/src/app/[locale]/(admin)/users/actions";

export async function getUserOverridesList(search?: string) {
  const check = await checkAccess();
  if (!check.authorized || check.actor?.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  // Get users who have overrides
  let conditions: any[] = [];
  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(
        like(schema.users.name, searchPattern),
        like(schema.users.email, searchPattern)
      )
    );
  }

  // Left join to get overrides
  const result = await db.select({
    user: schema.users,
    overrides: schema.userOverrides.overrides
  }).from(schema.users)
  .leftJoin(schema.userOverrides, eq(schema.users.id, schema.userOverrides.id))
  // For UI: if no search, maybe show only users WITH overrides? Or all users?
  // Let's just return all users so admin can search and add overrides
  .limit(100);
  
  // Actually, we should filter in JS if no search to only show users with overrides, to keep the list clean
  let filtered = result;
  if (!search) {
    filtered = result.filter(r => r.overrides && Object.keys(r.overrides).length > 0);
  }

  return filtered.map(r => {
    let overrideCount = 0;
    let hasDeny = false;
    if (r.overrides) {
      Object.values(r.overrides).forEach((mod: any) => {
        if (mod) {
          Object.values(mod).forEach((val: any) => {
            if (val === true || val === false) overrideCount++;
            if (val === false) hasDeny = true;
          });
        }
      });
    }

    return {
      id: r.user.id,
      name: r.user.name,
      email: r.user.email,
      role: r.user.role,
      overrides: overrideCount,
      hasDeny,
      rawOverrides: r.overrides || {}
    };
  });
}

export async function saveUserOverride(userId: string, overrides: any) {
  const check = await checkAccess();
  if (!check.authorized || check.actor?.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  // Upsert user_overrides
  const existing = await db.select().from(schema.userOverrides).where(eq(schema.userOverrides.id, userId));
  if (existing.length > 0) {
    await db.update(schema.userOverrides).set({ overrides }).where(eq(schema.userOverrides.id, userId));
  } else {
    await db.insert(schema.userOverrides).values({ id: userId, overrides });
  }

  revalidatePath("/vi/system-settings/permissions/overrides");
  return { success: true };
}
