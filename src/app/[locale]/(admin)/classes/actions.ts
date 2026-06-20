"use server";

import { classService } from "@/src/libs/server/class-service";
import { studentService } from "@/src/libs/server/student-service";
import { db, schema } from "@/src/libs/server/db";

async function seedClassesIfEmpty() {
  const existing = await classService.findMany({ limit: 1 });
  if (existing.length > 0) return;

  const classes = [
    { id: "class_1", name: "6A1", code: "6A1", gradeLevel: "6" },
    { id: "class_2", name: "7A1", code: "7A1", gradeLevel: "7" },
    { id: "class_3", name: "8A1", code: "8A1", gradeLevel: "8" },
    { id: "class_4", name: "9A1", code: "9A1", gradeLevel: "9" },
    { id: "class_5", name: "10A1", code: "10A1", gradeLevel: "10" },
    { id: "class_6", name: "11A1", code: "11A1", gradeLevel: "11" },
    { id: "class_7", name: "12A1", code: "12A1", gradeLevel: "12" },
  ];

  await db.insert(schema.classes).values(classes.map(c => ({
    ...c,
    createdAt: new Date(),
    updatedAt: new Date()
  })));
}

export async function getInitialData() {
  try {
    await seedClassesIfEmpty();
    const [classesList, studentsList] = await Promise.all([
      classService.findMany({}),
      studentService.findMany({})
    ]);

    return {
      classes: classesList,
      students: studentsList,
    };
  } catch (e) {
    console.error("Failed to fetch classes data:", e);
    return { classes: [], students: [] };
  }
}
