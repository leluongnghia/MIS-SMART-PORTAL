"use server";

import { db, schema } from "@/src/libs/server/db";

export async function getInitialData() {
  try {
    const studentsList = await db.select().from(schema.studentDirectory);
    const gradesList = await db.select().from(schema.sisGrades);
    const tuitionFeesList = await db.select().from(schema.tuitionFees);
    return {
      students: studentsList,
      grades: gradesList,
      tuitionFees: tuitionFeesList,
    };
  } catch (e) {
    console.error("Failed to fetch students data:", e);
    return { students: [], grades: [], tuitionFees: [] };
  }
}
