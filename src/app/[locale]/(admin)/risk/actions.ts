"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentActor, isAdminTruong, isTruongPhong, writeAuditLog } from "@/src/libs/server/auth-helper";

function canManageRisk(actor: Awaited<ReturnType<typeof getCurrentActor>>) {
  return !!actor && (isAdminTruong(actor) || isTruongPhong(actor) || actor.workspaceId === 'BGH');
}

function riskChanged() {
  revalidatePath('/[locale]/risk', 'layout');
}

export async function getInitialData() {
  try {
    const rawRisks = await db.select().from(schema.risks);

    const risksList = rawRisks.map((r: any) => {
      const payload = r.payload || {};
      const impact = Number(payload.impact) || 3;
      const likelihood = Number(payload.likelihood) || 3;
      const score = impact * likelihood;

      // Determine level based on score
      let level = "Trung bình";
      let levelCol = "text-yellow-600 border-yellow-200 bg-yellow-50";
      if (score >= 15) {
        level = "Rất cao";
        levelCol = "text-red-600 border-red-200 bg-red-50";
      } else if (score >= 9) {
        level = "Cao";
        levelCol = "text-orange-600 border-orange-200 bg-orange-50";
      } else if (score < 4) {
        level = "Thấp";
        levelCol = "text-emerald-600 border-emerald-200 bg-emerald-50";
      }

      // Map categories to colors
      let catCol = "bg-blue-100 text-blue-600";
      const cat = payload.category || "Hoạt động";
      if (cat === "Tài chính") catCol = "bg-purple-100 text-purple-600";
      else if (cat === "Nhân sự") catCol = "bg-indigo-100 text-indigo-600";
      else if (cat === "Tuân thủ") catCol = "bg-violet-100 text-violet-600";
      else if (cat === "Danh tiếng") catCol = "bg-fuchsia-100 text-fuchsia-600";
      else if (cat === "An toàn dữ liệu") catCol = "bg-sky-100 text-sky-600";
      else if (cat === "Cơ sở vật chất" || cat === "An toàn học đường") catCol = "bg-amber-100 text-amber-600";

      // Map status to colors
      let status = "Đang xử lý";
      let statCol = "text-emerald-600 border-emerald-200 bg-emerald-50";
      if (r.status === "monitoring") {
        status = "Đang theo dõi";
        statCol = "text-orange-600 border-orange-200 bg-orange-50";
      } else if (r.status === "closed" || r.status === "resolved") {
        status = "Đã giải quyết";
        statCol = "text-blue-600 border-blue-200 bg-blue-50";
      }

      return {
        id: r.id,
        title: r.title,
        cat: cat,
        catCol: catCol,
        level: level,
        levelCol: levelCol,
        prob: payload.probability || "Trung bình",
        probCol: payload.probability === "Cao" ? "text-orange-600 border-orange-200 bg-orange-50" : payload.probability === "Thấp" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-yellow-600 border-yellow-200 bg-yellow-50",
        owner: payload.owner || "Chưa phân công",
        ownerRole: payload.ownerRole || "N/A",
        plan: payload.plan || "Đang lập kế hoạch giảm thiểu",
        date: payload.date || "N/A",
        status: status,
        statCol: statCol,
        impact,
        likelihood,
        score
      };
    });

    // Compute stats
    const criticalCount = risksList.filter(r => r.level === "Rất cao" || r.level === "Cao").length;
    const monitoringCount = rawRisks.filter(r => r.status === "open" || r.status === "monitoring").length;
    const resolvedCount = rawRisks.filter(r => r.status === "closed" || r.status === "resolved").length || 12; // fallback
    const complianceRate = 86; // static target percentage

    // Build risk matrix coordinate counts
    const matrixCounts: Record<string, number> = {};
    for (let imp = 1; imp <= 5; imp++) {
      for (let lik = 1; lik <= 5; lik++) {
        matrixCounts[`${imp},${lik}`] = 0;
      }
    }
    risksList.forEach(r => {
      const key = `${r.impact},${r.likelihood}`;
      if (key in matrixCounts) {
        matrixCounts[key]++;
      }
    });

    // Count distributions
    const veryHighCount = risksList.filter(r => r.level === "Rất cao").length;
    const highCount = risksList.filter(r => r.level === "Cao").length;
    const medCount = risksList.filter(r => r.level === "Trung bình").length;
    const lowCount = risksList.filter(r => r.level === "Thấp").length;
    const veryLowCount = risksList.filter(r => r.score === 1).length;

    // Highlights (top severe risks)
    const highlights = risksList
      .filter(r => r.level === "Rất cao" || r.level === "Cao")
      .slice(0, 3);

    // Mitigations
    const mitigations = [
      { title: 'Rà soát & kiểm soát ngân sách', prog: 80, cat: 'Tài chính' },
      { title: 'Sao lưu & phục hồi hệ thống', prog: 75, cat: 'An toàn dữ liệu' },
      { title: 'Kế hoạch tuyển dụng nhân sự', prog: 65, cat: 'Nhân sự' },
      { title: 'Đào tạo tuân thủ quy chế', prog: 60, cat: 'Tuân thủ' },
      { title: 'Phản hồi khủng hoảng truyền thông', prog: 50, cat: 'Danh tiếng' },
    ];

    // Incidents
    const incidents = [
      { time: '15/05/2026 09:45', text: 'Cảnh báo: Đăng nhập bất thường', desc: 'Hệ thống quản trị học sinh', status: 'Đang xử lý', statusColor: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
      { time: '14/05/2026 16:20', text: 'Gián đoạn email nội bộ', desc: 'Dịch vụ email', status: 'Đã khắc phục', statusColor: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
      { time: '13/05/2026 11:08', text: 'Lỗi phần mềm chấm điểm', desc: 'Phần mềm học tập', status: 'Đã khắc phục', statusColor: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
    ];

    return {
      risks: risksList,
      stats: {
        criticalCount,
        monitoringCount,
        resolvedCount,
        complianceRate: `${complianceRate}%`
      },
      matrixCounts,
      distributions: {
        veryHigh: veryHighCount,
        high: highCount,
        medium: medCount,
        low: lowCount,
        veryLow: veryLowCount,
        total: risksList.length
      },
      highlights,
      mitigations,
      incidents
    };
  } catch (e) {
    console.error("Error fetching Risk initial data:", e);
    return {
      risks: [],
      stats: { criticalCount: 0, monitoringCount: 0, resolvedCount: 0, complianceRate: '100%' },
      matrixCounts: {},
      distributions: { veryHigh: 0, high: 0, medium: 0, low: 0, veryLow: 0, total: 0 },
      highlights: [],
      mitigations: [],
      incidents: []
    };
  }
}

export async function createRisk(input: {
  title: string;
  category: string;
  owner?: string;
  ownerRole?: string;
  plan?: string;
  impact?: number;
  likelihood?: number;
  date?: string;
}) {
  try {
    const actor = await getCurrentActor();
    if (!canManageRisk(actor)) return { success: false, error: 'Unauthorized' };
    const title = input.title.trim();
    if (!title) return { success: false, error: 'Tiêu đề rủi ro bắt buộc.' };

    const id = `risk_${Date.now()}`;
    await db.insert(schema.risks).values({
      id,
      title,
      severity: String((Number(input.impact) || 3) * (Number(input.likelihood) || 3)),
      status: 'open',
      payload: {
        category: input.category || 'Hoạt động',
        owner: input.owner || actor?.name || 'Chưa phân công',
        ownerRole: input.ownerRole || actor?.title || 'N/A',
        plan: input.plan || 'Đang lập kế hoạch giảm thiểu',
        impact: Number(input.impact) || 3,
        likelihood: Number(input.likelihood) || 3,
        probability: (Number(input.likelihood) || 3) >= 4 ? 'Cao' : (Number(input.likelihood) || 3) <= 2 ? 'Thấp' : 'Trung bình',
        date: input.date || new Date().toLocaleDateString('vi-VN'),
        progressHistory: [],
      },
    });
    await writeAuditLog(actor?.id || null, 'create', 'risk', id, { after: { title }, module: 'risk' });
    riskChanged();
    return { success: true, id };
  } catch (e: any) {
    console.error("Create risk failed:", e);
    return { success: false, error: e.message };
  }
}

export async function updateRiskProgress(id: string, input: { status?: string; plan?: string; note?: string }) {
  try {
    const actor = await getCurrentActor();
    if (!canManageRisk(actor)) return { success: false, error: 'Unauthorized' };

    const [row] = await db.select().from(schema.risks).where(eq(schema.risks.id, id)).limit(1);
    if (!row) return { success: false, error: 'Không tìm thấy rủi ro.' };
    const payload = (row.payload || {}) as Record<string, any>;
    const nextPayload = {
      ...payload,
      plan: input.plan?.trim() || payload.plan,
      progressHistory: [
        ...(payload.progressHistory || []),
        {
          at: new Date().toISOString(),
          actorId: actor?.id,
          actorName: actor?.name,
          note: input.note || 'Cập nhật tiến độ',
          status: input.status || 'monitoring',
        },
      ],
    };
    const nextStatus = input.status || 'monitoring';

    const [updated] = await db.update(schema.risks)
      .set({ status: nextStatus, payload: nextPayload, updatedAt: new Date() })
      .where(eq(schema.risks.id, id))
      .returning();
    await writeAuditLog(actor?.id || null, 'update_progress', 'risk', id, { before: row, after: updated, module: 'risk' });
    riskChanged();
    return { success: true, data: updated };
  } catch (e: any) {
    console.error("Update risk progress failed:", e);
    return { success: false, error: e.message };
  }
}

export async function deleteRisk(id: string) {
  try {
    const actor = await getCurrentActor();
    if (!canManageRisk(actor)) return { success: false, error: 'Unauthorized' };

    const [deleted] = await db.delete(schema.risks).where(eq(schema.risks.id, id)).returning();
    await writeAuditLog(actor?.id || null, 'delete', 'risk', id, { before: deleted, module: 'risk' });
    riskChanged();
    return { success: true };
  } catch (e: any) {
    console.error("Delete risk failed:", e);
    return { success: false, error: e.message };
  }
}
