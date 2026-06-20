"use server";

import { classService } from "@/src/libs/server/class-service";
import { studentService } from "@/src/libs/server/student-service";
import { db, schema } from "@/src/libs/server/db";

async function seedClassesIfEmpty() {
  const classes = [
    // Tiểu học
    { id: "class_1A1", name: "1A1", code: "1A1", gradeLevel: "1" },
    { id: "class_1A2", name: "1A2", code: "1A2", gradeLevel: "1" },
    { id: "class_1A3", name: "1A3", code: "1A3", gradeLevel: "1" },
    { id: "class_1A4", name: "1A4", code: "1A4", gradeLevel: "1" },
    { id: "class_2A1", name: "2A1", code: "2A1", gradeLevel: "2" },
    { id: "class_2A2", name: "2A2", code: "2A2", gradeLevel: "2" },
    { id: "class_2A3", name: "2A3", code: "2A3", gradeLevel: "2" },
    { id: "class_2A4", name: "2A4", code: "2A4", gradeLevel: "2" },
    { id: "class_3A1", name: "3A1", code: "3A1", gradeLevel: "3" },
    { id: "class_3A2", name: "3A2", code: "3A2", gradeLevel: "3" },
    { id: "class_3A3", name: "3A3", code: "3A3", gradeLevel: "3" },
    { id: "class_3A4", name: "3A4", code: "3A4", gradeLevel: "3" },
    { id: "class_4A1", name: "4A1", code: "4A1", gradeLevel: "4" },
    { id: "class_4A2", name: "4A2", code: "4A2", gradeLevel: "4" },
    { id: "class_4A3", name: "4A3", code: "4A3", gradeLevel: "4" },
    { id: "class_4A4", name: "4A4", code: "4A4", gradeLevel: "4" },
    { id: "class_5A1", name: "5A1", code: "5A1", gradeLevel: "5" },
    { id: "class_5A2", name: "5A2", code: "5A2", gradeLevel: "5" },
    { id: "class_5A3", name: "5A3", code: "5A3", gradeLevel: "5" },
    { id: "class_5A4", name: "5A4", code: "5A4", gradeLevel: "5" },
    // THCS
    { id: "class_6A1", name: "6A1", code: "6A1", gradeLevel: "6" },
    { id: "class_6A2", name: "6A2", code: "6A2", gradeLevel: "6" },
    { id: "class_7A1", name: "7A1", code: "7A1", gradeLevel: "7" },
    { id: "class_7A2", name: "7A2", code: "7A2", gradeLevel: "7" },
    { id: "class_8A1", name: "8A1", code: "8A1", gradeLevel: "8" },
    { id: "class_8A2", name: "8A2", code: "8A2", gradeLevel: "8" },
    { id: "class_9A1", name: "9A1", code: "9A1", gradeLevel: "9" },
    { id: "class_9A2", name: "9A2", code: "9A2", gradeLevel: "9" },
    // THPT
    { id: "class_10A1", name: "10A1", code: "10A1", gradeLevel: "10" },
    { id: "class_10A2", name: "10A2", code: "10A2", gradeLevel: "10" },
    { id: "class_11A1", name: "11A1", code: "11A1", gradeLevel: "11" },
    { id: "class_11A2", name: "11A2", code: "11A2", gradeLevel: "11" },
    { id: "class_12A1", name: "12A1", code: "12A1", gradeLevel: "12" },
    { id: "class_12A2", name: "12A2", code: "12A2", gradeLevel: "12" },
  ];

  await db.insert(schema.classes).values(classes.map(c => ({
    ...c,
    payload: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }))).onConflictDoNothing();
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
