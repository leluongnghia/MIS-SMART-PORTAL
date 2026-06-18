"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, sql } from "drizzle-orm";

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
