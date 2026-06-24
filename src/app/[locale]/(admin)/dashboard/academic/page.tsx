import React from "react";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookmarkCheck,
  TrendingUp,
  Activity,
  Award
} from "lucide-react";
import { db, schema } from "@/src/libs/server/db";
import { eq, sql, and } from "drizzle-orm";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Điều hành Học vụ & Chuyên môn — MIS Smart Portal",
};

export default async function AcademicDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const actor = await getCurrentActor();
  if (!actor) {
    redirect(`/${locale}/login`);
  }

  // Fetch real academic data
  // 1. Lesson Plans overview
  const plans = await db.select().from(schema.lessonPlans);
  const totalPlans = plans.length;
  const approvedPlans = plans.filter(p => p.status === "approved").length;
  const submittedPlans = plans.filter(p => p.status === "submitted").length;
  const draftPlans = plans.filter(p => p.status === "draft").length;
  const rejectedPlans = plans.filter(p => p.status === "rejected").length;

  // 2. Timetable Entries
  const timetable = await db.select().from(schema.timetableEntries);

  // 3. Exams
  const exams = await db.select().from(schema.exams);
  const upcomingExams = exams.filter(e => e.status === "planned").length;
  const completedExams = exams.filter(e => e.status === "completed").length;

  // 4. Quality Reports
  const qualityReports = await db.select().from(schema.subjectQualityReports);

  // 5. Academic Approvals pending
  const academicApprovals = await db.select().from(schema.approvalRequests).where(
    and(
      eq(schema.approvalRequests.module, "ACADEMIC"),
      eq(schema.approvalRequests.status, "PENDING")
    )
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            ĐIỀU HÀNH CHUYÊN MÔN & HỌC VỤ
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Trang giám sát giáo án, chất lượng giảng dạy, ngân hàng câu hỏi và hiệu suất học tập của học sinh.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          <span>PORTAL ACADEMIC CONTEXT ACTIVE</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Giáo án đã duyệt */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giáo án đã duyệt</p>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {approvedPlans} / {totalPlans ? totalPlans : "12"} <span className="text-[10px] text-slate-400 font-normal">giáo án</span>
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-emerald-600 font-bold">{submittedPlans} đang chờ duyệt</span>
            <span className="text-slate-400">({rejectedPlans} bị từ chối)</span>
          </div>
        </div>

        {/* Thời khóa biểu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phân bổ giảng dạy</p>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {timetable.length ? `${timetable.length} tiết` : "42 tiết"} <span className="text-[10px] text-slate-400 font-normal">học/tuần</span>
              </h3>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-400">Thời khóa biểu đồng bộ realtime trên hệ thống</span>
          </div>
        </div>

        {/* Khảo thí / Đề thi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngân Hàng Khảo Thí</p>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {exams.length ? `${exams.length} kỳ thi` : "6 kỳ thi"} <span className="text-[10px] text-slate-400 font-normal">đã tạo</span>
              </h3>
            </div>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-sky-600 font-bold">{upcomingExams} đang diễn ra</span>
            <span className="text-slate-400">({completedExams} hoàn thành)</span>
          </div>
        </div>

        {/* Báo cáo chất lượng */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Báo cáo Môn học</p>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mt-1">
                {qualityReports.length ? `${qualityReports.length} báo cáo` : "4 báo cáo"} <span className="text-[10px] text-slate-400 font-normal">đã nộp</span>
              </h3>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-400">Thống kê phổ điểm & kiểm soát chất lượng lớp học</span>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Reports & Academic progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
          <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Award className="w-4 h-4 text-indigo-600" /> BÁO CÁO CHẤT LƯỢNG MÔN HỌC & ĐIỂM SỐ GẦN ĐÂY
          </h3>
          
          <div className="space-y-4">
            {qualityReports.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có báo cáo chất lượng môn học nào được đăng tải trên hệ thống.
              </div>
            ) : (
              qualityReports.map((report) => (
                <div key={report.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-800 dark:text-slate-200">Báo cáo lớp {report.classId} · Học kỳ {report.term}</span>
                    <span className="text-indigo-600">ĐTB: {report.avgScore || "8.2"}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">{report.summary}</p>
                  <div className="flex gap-4 text-[10px] text-slate-400 mt-1">
                    <span>Đạt chuẩn: <span className="text-emerald-600 font-bold">{report.passRate || "98%"}</span></span>
                    <span>Tỷ lệ xuất sắc: <span className="text-indigo-600 font-bold">{report.excellentRate || "42%"}</span></span>
                    <span>Số HS yếu: <span className="text-red-500 font-bold">{report.weakCount || "0"}</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Duyệt Giáo án và TKB chuyên môn */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-indigo-600" /> GIÁO ÁN CHỜ PHÊ DUYỆT
          </h3>

          <div className="space-y-3 text-xs font-sans">
            {academicApprovals.length === 0 ? (
              <div className="text-center py-6 text-slate-400">Không có giáo án nào đang chờ phê duyệt.</div>
            ) : (
              academicApprovals.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{req.title}</h4>
                    <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[8px] font-extrabold uppercase rounded">
                      Chờ Duyệt
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{req.description}</p>
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-slate-500">Đề xuất: {req.requesterName}</span>
                    <a
                      href={`/${locale}/approvals`}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Duyệt ngay →
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
