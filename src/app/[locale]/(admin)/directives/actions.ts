"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  try {
    let data = await db.select().from(schema.directives);
    if (data.length === 0) {
      const defaultDirectives = [
        {
          id: 'dir_1',
          title: 'Tăng cường công tác ôn thi tốt nghiệp THPT 2025',
          category: 'Phòng Đào tạo',
          urgency: 'Khẩn cấp',
          senderId: 'user_chutich',
          payload: {
            description: 'Yêu cầu Phòng Đào tạo phối hợp với các tổ chuyên môn xây dựng kế hoạch ôn tập chi tiết cho các khối 12, đảm bảo chất lượng và hiệu quả. Báo cáo tiến độ hàng tuần về BGH.',
            deadline: '2026-06-25',
            status: 'Chờ phản hồi',
            comments: [
              { user: 'Trần Thị Mai', dept: 'Phòng Đào tạo', text: 'Đã nhận chỉ đạo. Phòng Đào tạo sẽ triển khai xây dựng kế hoạch trong ngày hôm nay.', date: '16/05/2025 09:15' }
            ]
          }
        },
        {
          id: 'dir_2',
          title: 'Rà soát và cập nhật kế hoạch dạy học HKII',
          category: 'Tổ chuyên môn',
          urgency: 'Quan trọng',
          senderId: 'user_triet',
          payload: {
            description: 'Rà soát tiến độ chương trình học tập học kỳ II, đặc biệt đối với các môn học liên kết song ngữ. Báo cáo các nội dung chậm muộn.',
            deadline: '2026-06-28',
            status: 'Đã hoàn thành',
            comments: []
          }
        }
      ];
      for (const dir of defaultDirectives) {
        await db.insert(schema.directives).values(dir);
      }
      data = await db.select().from(schema.directives);
    }
    return { data };
  } catch (e) {
    console.error("Directives getInitialData failed:", e);
    return { data: [] };
  }
}

export async function createDirective(formData: { title: string; category: string; urgency: string; description: string; deadline: string }) {
  try {
    const id = 'dir_' + Math.random().toString(36).substring(2, 11);
    await db.insert(schema.directives).values({
      id,
      title: formData.title,
      category: formData.category,
      urgency: formData.urgency,
      senderId: 'user_triet',
      payload: {
        description: formData.description,
        deadline: formData.deadline,
        status: 'Chờ phản hồi',
        comments: []
      }
    });
    revalidatePath('/[locale]/directives', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Create directive failed:", e);
    return { success: false, error: e.message };
  }
}

export async function deleteDirective(id: string) {
  try {
    await db.delete(schema.directives).where(eq(schema.directives.id, id));
    revalidatePath('/[locale]/directives', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Delete directive failed:", e);
    return { success: false, error: e.message };
  }
}

