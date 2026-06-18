"use server";

import { db, schema } from "@/src/libs/server/db";
import { MOCK_MASTER_TIMETABLE } from "@/src/mockData";

export async function getInitialData() {
  try {
    const users = await db.select().from(schema.users);
    
    // Resolve teacher name and info from real database users
    const timetable = MOCK_MASTER_TIMETABLE.map(slot => {
      const teacher = users.find(u => u.id === slot.teacherId);
      return {
        ...slot,
        teacherName: teacher ? teacher.name : "Giáo viên ẩn danh",
        teacherRole: teacher ? teacher.title : "Giáo viên",
        avatar: teacher?.avatarUrl || `https://i.pravatar.cc/150?u=${slot.teacherId}`
      };
    });

    // Compute stats
    const todaySlotsCount = timetable.filter(s => s.day === 4).length || 8; 
    const rooms = new Set(timetable.map(s => s.room));
    const roomsInUse = rooms.size || 12;

    const teacherOptions = users
      .filter(u => u.staffType === 'TEACHER' || (u.title || '').toLowerCase().includes('giáo viên'))
      .map(u => ({ id: u.id, name: u.name }));

    const classOptions = Array.from(new Set(timetable.map(s => s.className)));
    const roomOptions = Array.from(rooms);

    return {
      timetable,
      stats: {
        todaySlotsCount,
        totalPlannedSlots: 156,
        roomsInUse,
        totalRooms: 42,
        conflictsCount: 3,
        pendingPlansCount: 18
      },
      teachers: teacherOptions,
      classes: classOptions,
      rooms: roomOptions
    };
  } catch (e) {
    console.error("Error fetching Schedule data:", e);
    return {
      timetable: [],
      stats: { todaySlotsCount: 0, totalPlannedSlots: 156, roomsInUse: 0, totalRooms: 42, conflictsCount: 0, pendingPlansCount: 0 },
      teachers: [],
      classes: [],
      rooms: []
    };
  }
}
