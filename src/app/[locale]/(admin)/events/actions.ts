"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  try {
    let data = await db.select().from(schema.events);
    if (data.length === 0) {
      const defaultEvents = [
        {
          id: 'event_1',
          title: 'Hội nghị sơ kết học kỳ và Đánh giá chất lượng chuyên môn',
          date: new Date('2026-06-22T08:30:00Z'),
          department: 'Ban Giám hiệu',
          payload: { desc: 'Họp toàn bộ cán bộ tổ trưởng chuyên môn rà soát kết quả dạy học học kỳ vừa qua.', location: 'Phòng họp tầng 3' }
        },
        {
          id: 'event_2',
          title: 'Ngày hội Trải nghiệm Khoa học & Công nghệ STEM 2026',
          date: new Date('2026-06-25T07:30:00Z'),
          department: 'Tổ Toán - Tin học',
          payload: { desc: 'Trưng bày các gian hàng mô hình kỹ thuật, robot tự chế và thí nghiệm hóa lý lý thú.', location: 'Sân trường cơ sở 1' }
        },
        {
          id: 'event_3',
          title: 'Tập huấn nâng cao năng lực ứng dụng AI trong giảng dạy',
          date: new Date('2026-06-28T14:00:00Z'),
          department: 'Tổ Văn phòng - CNTT',
          payload: { desc: 'Hướng dẫn sử dụng các công cụ AI hỗ trợ soạn giáo án và lập kế hoạch bài dạy thông minh.', location: 'Phòng máy số 2' }
        }
      ];
      for (const ev of defaultEvents) {
        await db.insert(schema.events).values(ev);
      }
      data = await db.select().from(schema.events);
    }
    return { data };
  } catch (e) {
    console.error("Events getInitialData failed:", e);
    return { data: [] };
  }
}

export async function createEvent(formData: { title: string; date: string; department: string; desc: string; location: string }) {
  try {
    const id = 'event_' + Math.random().toString(36).substring(2, 11);
    await db.insert(schema.events).values({
      id,
      title: formData.title,
      date: new Date(formData.date),
      department: formData.department,
      payload: { desc: formData.desc, location: formData.location }
    });
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Create event failed:", e);
    return { success: false, error: e.message };
  }
}

export async function deleteEvent(id: string) {
  try {
    await db.delete(schema.events).where(eq(schema.events.id, id));
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Delete event failed:", e);
    return { success: false, error: e.message };
  }
}

