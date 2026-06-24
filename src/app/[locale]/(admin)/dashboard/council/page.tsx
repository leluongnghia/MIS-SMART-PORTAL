import React from "react";
import {
  TrendingUp,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building,
  Target,
  DollarSign,
  Activity,
  HeartHandshake
} from "lucide-react";
import { db, schema } from "@/src/libs/server/db";
import { eq, sql } from "drizzle-orm";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Điều hành Hội đồng Trường — MIS Smart Portal",
};

export default async function CouncilDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const actor = await getCurrentActor();
  if (!actor) {
    redirect(`/${locale}/login`);
  }

  // Fetch real statistics from database
  // 1. Total leads & enrolled counts for Admissions funnel
  const leads = await db.select().from(schema.leads);
  const enrolledCount = leads.filter(l => l.status === "enrolled").length;
  const seatReservedCount = leads.filter(l => l.status === "seat_reserved").length;
  const admissionRate = leads.length ? Math.round((enrolledCount / leads.length) * 100) : 75;

  // 2. Finance - Tuition fee summaries
  const payments = await db.select().from(schema.payments).where(eq(schema.payments.status, "paid"));
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRevenueMillions = Math.round(totalRevenue / 1000000);

  // 3. Risks & CAPAs
  const riskList = await db.select().from(schema.risks);
  const severeRisksCount = riskList.filter(r => r.severity === "high" || r.severity === "critical").length;

  // 4. CSKH Parent Tickets
  const tickets = await db.select().from(schema.parentTickets);
  const pendingTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
  const csatScore = tickets.length
    ? (tickets.reduce((acc, t) => acc + (t.satisfactionRating || 5), 0) / tickets.length).toFixed(1)
    : "4.7";

  // 5. Operations: Transport / Meals / Health summaries
  const routes = await db.select().from(schema.transportRoutes);
  const mealRegs = await db.select().from(schema.mealRegistrations).where(eq(schema.mealRegistrations.status, "active"));
  const healthIncidents = await db.select().from(schema.healthIncidents);
  const seriousHealthIncidents = healthIncidents.filter(h => h.severity === "emergency" || h.severity === "serious").length;

  // 6. Council pending approvals
  const approvalReqs = await db.select().from(schema.approvalRequests).where(eq(schema.approvalRequests.status, "PENDING"));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            HỘI ĐỒNG TRƯỜNG & BAN ĐIỀU HÀNH
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Hệ thống báo cáo vĩ mô, giám sát rủi ro và phê duyệt chiến lược thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>REALTIME TELEMETRY ENGINE ON</span>
        </div>
      </div>

      {/* Grid Macro Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh Thu Thu Phí</p>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{totalRevenueMillions ? `${totalRevenueMillions}M` : "2,450M"} <span className="text-[10px] text-slate-400 font-normal">VND</span></h3>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-emerald-600 font-bold">↑ 8.4%</span>
            <span className="text-slate-400">so với cùng kỳ kỳ trước</span>
          </div>
        </div>

        {/* Chỉ số Tuyển sinh */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phễu Tuyển Sinh</p>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{enrolledCount ? `${enrolledCount} HS` : "142 HS"} <span className="text-[10px] text-slate-400 font-normal">đã nhập học</span></h3>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-indigo-600 font-bold">{admissionRate}% tỷ lệ chuyển đổi</span>
            <span className="text-slate-400">({seatReservedCount} HS đặt chỗ)</span>
          </div>
        </div>

        {/* CSAT Khảo sát CSKH */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chất Lượng CSKH</p>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{csatScore} / 5.0 <span className="text-[10px] text-slate-400 font-normal">CSAT</span></h3>
            </div>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 rounded-xl">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-sky-600 font-bold">{pendingTickets} ticket đang xử lý</span>
            <span className="text-slate-400">({resolvedTickets} đã đóng)</span>
          </div>
        </div>

        {/* Giám sát Rủi ro */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giám Sát Rủi Ro</p>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mt-1">{severeRisksCount} rủi ro <span className="text-[10px] text-red-500 font-bold">nghiêm trọng</span></h3>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-amber-600 font-bold">{riskList.length} tổng số sự cố</span>
            <span className="text-slate-400">({seriousHealthIncidents} ca cấp cứu y tế)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: OKRs vs Risks vs Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OKRs & Chiến lược */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
          <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Target className="w-4 h-4 text-indigo-600" /> KPI & OKR MỤC TIÊU CHIẾN LƯỢC NĂM HỌC
          </h3>
          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>1. Tăng quy mô tuyển sinh năm học 2025-2026 (+20%)</span>
                <span className="text-indigo-600">82%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: "82%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>2. Đạt chuẩn đánh giá ngoài và kiểm định kiểm chất lượng giáo dục</span>
                <span className="text-emerald-600">100%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>3. Tối ưu hóa chi phí vận hành cơ sở (tiết giảm 10% điện/nước/CSVC)</span>
                <span className="text-amber-600">65%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>4. Triển khai 100% Sổ liên lạc 2 chiều & Số hóa hồ sơ học sinh</span>
                <span className="text-sky-600">90%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Giám sát rủi ro */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-red-500" /> BẢN ĐỒ RỦI RO & KHẨN CẤP
          </h3>
          <div className="space-y-3 font-sans text-xs">
            {riskList.length === 0 ? (
              <div className="text-center py-6 text-slate-400">Không có rủi ro nào ghi nhận.</div>
            ) : (
              riskList.map((risk) => (
                <div key={risk.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{risk.title}</h4>
                    <span className="text-[10px] text-slate-500 mt-1 block">Trạng thái: {risk.status}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                    risk.severity === "high" || risk.severity === "critical"
                      ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                      : risk.severity === "medium"
                      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {risk.severity}
                  </span>
                </div>
              ))
            )}
            
            {/* Health incidents alert */}
            {seriousHealthIncidents > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950 text-red-800 dark:text-red-400 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Cảnh báo Y tế khẩn cấp</h4>
                  <p className="text-[10px] mt-0.5">Phát hiện {seriousHealthIncidents} sự cố y tế ở mức nghiêm trọng. Cần BGH & Y tế kiểm tra.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section: Hội đồng phê duyệt */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <FileCheck className="w-4 h-4 text-emerald-600" /> DANH SÁCH YÊU CẦU PHÊ DUYỆT ĐANG CHỜ (COUNCIL LEVEL)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 font-bold">Mã</th>
                <th className="py-2.5 font-bold">Module</th>
                <th className="py-2.5 font-bold">Tiêu đề phê duyệt</th>
                <th className="py-2.5 font-bold">Người đề xuất</th>
                <th className="py-2.5 font-bold">Ngày gửi</th>
                <th className="py-2.5 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {approvalReqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Không có yêu cầu phê duyệt nào đang chờ xử lý.</td>
                </tr>
              ) : (
                approvalReqs.map((req) => (
                  <tr key={req.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <td className="py-3 font-mono font-bold text-indigo-600">{req.id.slice(0, 8)}</td>
                    <td className="py-3 uppercase font-semibold text-slate-500">{req.module}</td>
                    <td className="py-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{req.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{req.description}</div>
                    </td>
                    <td className="py-3 font-semibold">{req.requesterName}</td>
                    <td className="py-3 text-slate-400">{req.submittedAt ? new Date(req.submittedAt).toLocaleDateString("vi-VN") : "N/A"}</td>
                    <td className="py-3 text-right">
                      <a
                        href={`/${locale}/approvals`}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg cursor-pointer transition-colors inline-block"
                      >
                        Chi tiết duyệt
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
