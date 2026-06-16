"use server";

import { db, schema } from "@/src/libs/server/db";

export async function getInitialData() {
  try {
    const data = await db.select().from(schema.employeeProfiles || schema.tasks);
    return { data };
  } catch (e) {
    return { data: [] };
  }
}
