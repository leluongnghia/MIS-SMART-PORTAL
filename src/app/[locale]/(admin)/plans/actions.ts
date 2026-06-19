"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  try {
    let data = await db.select().from(schema.tasks).where(and(eq(schema.tasks.tag, 'Kế hoạch'), isNull(schema.tasks.deletedAt)));
    if (data.length === 0) {
      const defaultPlans = [
        {
          id: 'plan_1',
          title: 'Kế hoạch Chiến lược Phát triển Trường học 5 năm (2025-2030)',
          description: 'Quy hoạch lại hệ thống cơ sở vật chất, nâng cao chất lượng giáo viên chuyên môn và hội nhập chương trình song ngữ quốc tế.',
          workspaceId: 'BGH',
          assignedId: 'user_chutich',
          assignedName: 'Thầy PGS.TS. Nguyễn Văn Minh',
          status: 'in_progress',
          priority: 'high',
          deadline: '2030-12-31',
          tag: 'Kế hoạch',
          payload: { progress: 65 },
        },
        {
          id: 'plan_2',
          title: 'Kế hoạch Tuyển sinh năm học mới 2026-2027',
          description: 'Đặt mục tiêu tiếp cận 1200 leads tiềm năng, tổ chức 4 đợt thi thử kiểm tra năng lực đầu vào và tuyển sinh đủ chỉ tiêu 350 học sinh.',
          workspaceId: 'BGH',
          assignedId: 'user_ceo',
          assignedName: 'HVL',
          status: 'in_progress',
          priority: 'high',
          deadline: '2026-08-31',
          tag: 'Kế hoạch',
          payload: { progress: 40 },
        },
        {
          id: 'plan_3',
          title: 'Kế hoạch Xây dựng Thư viện số thông minh',
          description: 'Số hóa kho sách, tích hợp nền tảng thư viện điện tử kết nối tài khoản học tập 360 cho học sinh toàn trường.',
          workspaceId: 'BGH',
          assignedId: 'user_tuan',
          assignedName: 'Thầy Ngô Anh Tuấn',
          status: 'todo',
          priority: 'medium',
          deadline: '2026-10-30',
          tag: 'Kế hoạch',
          payload: { progress: 0 },
        },
        {
          id: 'plan_4',
          title: 'Kế hoạch Triển khai Bồi dưỡng chuyên đề Giáo dục 2018',
          description: 'Tập huấn nâng cao phương pháp giảng dạy tích hợp STEAM cho giáo viên tổ Toán-Tin học và KHTN.',
          workspaceId: 'BGH',
          assignedId: 'user_nam_anh',
          assignedName: 'Thầy Dương Nam Anh',
          status: 'completed',
          priority: 'medium',
          deadline: '2026-05-15',
          tag: 'Kế hoạch',
          payload: { progress: 100 },
        }
      ];
      for (const plan of defaultPlans) {
        await db.insert(schema.tasks).values(plan);
      }
      data = await db.select().from(schema.tasks).where(and(eq(schema.tasks.tag, 'Kế hoạch'), isNull(schema.tasks.deletedAt)));
    }
    return { data };
  } catch (e) {
    console.error("getInitialData failed:", e);
    return { data: [] };
  }
}

export async function createPlan(formData: { title: string; description: string; deadline: string; priority: string; status: string; progress: number }) {
  try {
    const id = 'plan_' + Math.random().toString(36).substring(2, 11);
    await db.insert(schema.tasks).values({
      id,
      title: formData.title,
      description: formData.description,
      workspaceId: 'BGH',
      assignedId: 'user_chutich',
      assignedName: 'Thầy PGS.TS. Nguyễn Văn Minh',
      status: formData.status || 'todo',
      priority: formData.priority || 'medium',
      deadline: formData.deadline,
      tag: 'Kế hoạch',
      payload: { progress: formData.progress || 0 },
    });
    revalidatePath('/[locale]/plans', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Create plan failed:", e);
    return { success: false, error: e.message };
  }
}

export async function updatePlan(id: string, formData: { title: string; description: string; deadline: string; priority: string; status: string; progress: number }) {
  try {
    await db.update(schema.tasks).set({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      deadline: formData.deadline,
      payload: { progress: formData.progress || 0 },
      updatedAt: new Date(),
    }).where(eq(schema.tasks.id, id));
    revalidatePath('/[locale]/plans', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Update plan failed:", e);
    return { success: false, error: e.message };
  }
}

export async function deletePlan(id: string) {
  try {
    await db.update(schema.tasks).set({ deletedAt: new Date(), deletedBy: 'system', updatedAt: new Date() }).where(eq(schema.tasks.id, id));
    revalidatePath('/[locale]/plans', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Delete plan failed:", e);
    return { success: false, error: e.message };
  }
}

