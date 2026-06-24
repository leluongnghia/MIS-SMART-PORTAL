'use server';

import { getTimetable, addTimetableSlot } from '@/src/libs/server/academic';

export async function fetchTimetable(filters?: { classId?: string; teacherId?: string; schoolYear?: string; term?: string }) {
  return await getTimetable(filters);
}

export async function createTimetableSlot(data: {
  classId: string;
  subjectId?: string;
  teacherId?: string;
  dayOfWeek: number;
  period: number;
  startTime?: string;
  endTime?: string;
  room?: string;
  schoolYear?: string;
  term?: string;
}) {
  return await addTimetableSlot(data);
}
