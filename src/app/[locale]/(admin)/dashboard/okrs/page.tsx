import { mockOkrs, mockOkrGroups } from "@/src/libs/mock-data/okr-data";
import { OkrTable } from "@/src/components/okrs/OkrTable";
import { OkrCharts } from "@/src/components/okrs/OkrCharts";
import { OkrHeaderActions } from "@/src/components/okrs/OkrHeaderActions";
import { Target, AlertTriangle, Clock, CheckCircle2, TrendingUp, BarChart4 } from "lucide-react";

export const metadata = {
  title: "Quản trị Mục tiêu Chiến lược — MIS Smart Portal",
};

export default function StrategicOkrsPage() {

  const totalOkrs = mockOkrs.length;
  const onTrackOkrs = mockOkrs.filter(o => o.status === "OnTrack").length;
  const delayedOkrs = mockOkrs.filter(o => o.status === "Delayed").length;
  const atRiskOkrs = mockOkrs.filter(o => o.status === "AtRisk" || o.status === "NeedCouncilIntervention").length;
  const avgProgress = Math.round(mockOkrs.reduce((acc, curr) => acc + curr.progressPercent, 0) / totalOkrs);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-indigo-600" />
            KPI & OKR MỤC TIÊU CHIẾN LƯỢC
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            Phân hệ theo dõi và điều hành mục tiêu chiến lược năm học 2025-2026
          </p>
        </div>
        <OkrHeaderActions />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BarChart4 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tiến độ chung</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
              {avgProgress}% 
              <span className="text-[10px] font-bold text-emerald-500 flex items-center"><TrendingUp className="w-3 h-3"/> +2% tuần này</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Đúng tiến độ</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
              {onTrackOkrs} <span className="text-xs font-bold text-slate-400">/ {totalOkrs} OKR</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 relative z-10">
            <Clock className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chậm tiến độ</p>
            <p className="text-2xl font-black text-amber-600 flex items-baseline gap-2">
              {delayedOkrs} <span className="text-xs font-bold text-slate-400">OKR</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400 relative z-10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Có Rủi ro</p>
            <p className="text-2xl font-black text-rose-600 flex items-baseline gap-2">
              {atRiskOkrs} <span className="text-xs font-bold text-slate-400">OKR</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <OkrCharts />

      {/* Main Table */}
      <OkrTable okrs={mockOkrs} />
    </div>
  );
}
