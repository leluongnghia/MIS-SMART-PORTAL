"use client";

import React, { useState } from "react";
import { StrategicOkr } from "@/src/types/okr";
import { 
  Target, AlertCircle, AlertTriangle, CheckCircle2, Clock, PlayCircle, StopCircle, User, Calendar
} from "lucide-react";
import Drawer from "@/src/components/ui/Drawer";
import { OkrDetailDrawer } from "./OkrDetailDrawer";

export function OkrTable({ okrs }: { okrs: StrategicOkr[] }) {
  const [filter, setFilter] = useState("all");
  const [selectedOkr, setSelectedOkr] = useState<StrategicOkr | null>(null);

  const filteredOkrs = okrs.filter(okr => {
    if (filter === "delayed") return okr.status === "Delayed";
    if (filter === "atRisk") return okr.status === "AtRisk" || okr.status === "NeedCouncilIntervention";
    if (filter === "onTrack") return okr.status === "OnTrack";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OnTrack": return <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Đúng tiến độ</span>;
      case "Delayed": return <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Chậm tiến độ</span>;
      case "AtRisk": return <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Rủi ro cao</span>;
      case "NeedCouncilIntervention": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1"><AlertCircle className="w-3 h-3"/> BGH Cần can thiệp</span>;
      case "InProgress": return <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1"><PlayCircle className="w-3 h-3"/> Đang triển khai</span>;
      default: return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1"><StopCircle className="w-3 h-3"/> {status}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden font-sans">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" /> DANH SÁCH MỤC TIÊU CHIẾN LƯỢC
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "all" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"}`}>Tất cả</button>
          <button onClick={() => setFilter("onTrack")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "onTrack" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"}`}>Đúng tiến độ</button>
          <button onClick={() => setFilter("delayed")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "delayed" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400"}`}>Chậm tiến độ</button>
          <button onClick={() => setFilter("atRisk")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "atRisk" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400"}`}>Có rủi ro</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="p-4 w-10">Mã</th>
              <th className="p-4">Mục tiêu</th>
              <th className="p-4 w-48">Tiến độ</th>
              <th className="p-4 w-32">Trạng thái</th>
              <th className="p-4 w-40">Phụ trách</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredOkrs.map(okr => (
              <tr 
                key={okr.id} 
                onClick={() => setSelectedOkr(okr)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <td className="p-4 font-mono text-xs font-bold text-slate-500">{okr.code}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate max-w-sm group-hover:text-indigo-600 transition-colors">{okr.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Deadline: {okr.endDate}</span>
                    <span className="flex items-center gap-1 text-rose-500 font-bold"><AlertCircle className="w-3 h-3"/> Mức độ: {okr.priority}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">{okr.progressPercent}%</span>
                    <span className="text-[10px] text-slate-400">{okr.currentValue}/{okr.targetValue} {okr.unit}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${okr.status === 'AtRisk' || okr.status === 'NeedCouncilIntervention' ? 'bg-rose-500' : okr.status === 'Delayed' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${okr.progressPercent}%` }} 
                    />
                  </div>
                </td>
                <td className="p-4">
                  {getStatusBadge(okr.status)}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <User className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-700 dark:text-slate-300">{okr.ownerName}</div>
                      <div className="text-[9px] text-slate-400">{okr.ownerRole}</div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOkrs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                  Không tìm thấy mục tiêu chiến lược nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        isOpen={!!selectedOkr}
        onClose={() => setSelectedOkr(null)}
        title={`Mục tiêu chiến lược: ${selectedOkr?.code}`}
        side="right"
        width="lg"
      >
        <div className="p-6">
          {selectedOkr && <OkrDetailDrawer okr={selectedOkr} />}
        </div>
      </Drawer>
    </div>
  );
}
