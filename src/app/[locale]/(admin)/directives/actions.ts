"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type DirectivePayload = {
  description?: string;
  deadline?: string;
  status?: string;
  assignee?: string;
  comments?: Array<{ id: string; user: string; dept: string; text: string; date: string }>;
  checklist?: Array<{ text: string; done: boolean }>;
  attachments?: Array<{ name: string; size: string }>;
};

const nowText = () => new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh'
}).format(new Date());

async function writeAudit(entityId: string, action: string, actorId: string | null, metadata: Record<string, unknown>) {
  const safeActorId = actorId
    ? (await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, actorId)).limit(1))[0]?.id || null
    : null;
  await db.insert(schema.auditLogs).values({
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    entityType: 'directive',
    entityId,
    action,
    actorId: safeActorId,
    metadata,
  });
}

export async function getInitialData() {
  try {
    let data = await db.select().from(schema.directives).where(isNull(schema.directives.deletedAt));
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
            assignee: 'Phòng Đào tạo',
            attachments: [{ name: 'Ke_hoach_on_thi_TN_THPT_2025.pdf', size: '1.2 MB' }],
            checklist: [
              { text: 'Xây dựng kế hoạch ôn tập chi tiết cho từng môn', done: true },
              { text: 'Phân công giáo viên phụ trách các lớp ôn tập', done: true },
              { text: 'Tổ chức kiểm tra đánh giá định kỳ', done: false },
              { text: 'Báo cáo tiến độ hàng tuần về BGH', done: false },
            ],
            comments: [
              { id: 'c_1', user: 'Trần Thị Mai', dept: 'Phòng Đào tạo', text: 'Đã nhận chỉ đạo. Phòng Đào tạo sẽ triển khai xây dựng kế hoạch trong ngày hôm nay.', date: '16/05/2025 09:15' }
            ]
          } satisfies DirectivePayload
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
            assignee: 'Tổ chuyên môn',
            comments: []
          } satisfies DirectivePayload
        }
      ];
      for (const dir of defaultDirectives) {
        await db.insert(schema.directives).values(dir);
        await writeAudit(dir.id, 'seed', dir.senderId, { title: dir.title });
      }
      data = await db.select().from(schema.directives).where(isNull(schema.directives.deletedAt));
    }
    const audits = await db.select().from(schema.auditLogs);
    return { data, audits: audits.filter(log => log.entityType === 'directive') };
  } catch (e) {
    console.error("Directives getInitialData failed:", e);
    return { data: [], audits: [] };
  }
}

export async function addDirectiveResponse(input: { directiveId: string; userId: string; userName: string; userDept: string; text: string }) {
  try {
    const text = input.text.trim();
    if (!text) return { success: false, error: 'Nội dung phản hồi bắt buộc.' };
    const [row] = await db.select().from(schema.directives).where(eq(schema.directives.id, input.directiveId));
    if (!row) return { success: false, error: 'Không tìm thấy chỉ đạo.' };

    const payload = (row.payload || {}) as DirectivePayload;
    const nextComment = {
      id: `c_${Date.now()}`,
      user: input.userName,
      dept: input.userDept,
      text,
      date: nowText(),
    };
    const nextPayload: DirectivePayload = {
      ...payload,
      status: payload.status === 'Đã hoàn thành' ? payload.status : 'Đã phản hồi',
      comments: [...(payload.comments || []), nextComment],
    };

    await db.update(schema.directives)
      .set({ payload: nextPayload, updatedAt: new Date() })
      .where(eq(schema.directives.id, input.directiveId));
    await writeAudit(input.directiveId, 'add_response', input.userId, { commentId: nextComment.id, userName: input.userName });
    revalidatePath('/[locale]/directives', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Add directive response failed:", e);
    return { success: false, error: e.message };
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
        assignee: formData.category,
        comments: []
      } satisfies DirectivePayload
    });
    await writeAudit(id, 'create', 'user_triet', { title: formData.title });
    revalidatePath('/[locale]/directives', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Create directive failed:", e);
    return { success: false, error: e.message };
  }
}

export async function deleteDirective(id: string) {
  try {
    await db.update(schema.directives).set({ deletedAt: new Date(), deletedBy: 'user_triet', updatedAt: new Date() }).where(eq(schema.directives.id, id));
    await writeAudit(id, 'soft_delete', 'user_triet', {});
    revalidatePath('/[locale]/directives', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Delete directive failed:", e);
    return { success: false, error: e.message };
  }
}
