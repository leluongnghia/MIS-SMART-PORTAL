"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "./db";

export async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  const [row] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, key)).limit(1);
  if (!row?.value) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export async function setJsonSetting(key: string, value: unknown, meta: { group: string; label: string; description?: string; updatedBy?: string | null }) {
  const now = new Date();
  await db.insert(schema.systemSettings).values({
    key,
    value: JSON.stringify(value),
    group: meta.group,
    label: meta.label,
    description: meta.description,
    isSecret: false,
    isEditable: true,
    updatedBy: meta.updatedBy || null,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: schema.systemSettings.key,
    set: {
      value: JSON.stringify(value),
      group: meta.group,
      label: meta.label,
      description: meta.description,
      isSecret: false,
      isEditable: true,
      updatedBy: meta.updatedBy || null,
      updatedAt: now,
    },
  });
}
