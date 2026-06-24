"use client";

import React, { useState } from "react";
import { Loader2, CheckCircle2, Users, Send } from "lucide-react";

export function RiskActionButtons({ riskId }: { riskId: string }) {
  const [status, setStatus] = useState<"idle" | "selecting" | "loading" | "done">("idle");
  const [assignee, setAssignee] = useState<string>("");

  const handleAction = (dept: string, manager: string) => {
    setAssignee(`${manager} (${dept})`);
    setStatus("loading");
    // Giả lập xử lý API
    setTimeout(() => {
      setStatus("done");
    }, 800);
  };

  if (status === "done") {
    return (
      <div className="pt-4 flex gap-3 animate-fade-in">
        <div className="flex-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 className="w-5 h-5" /> 
          <span>Đã giao cho <strong className="text-emerald-700 dark:text-emerald-300">{assignee}</strong> xử lý</span>
        </div>
      </div>
    );
  }

  if (status === "selecting") {
    const depts = [
      { label: "P. Tài chính", manager: "Kế toán trưởng" },
      { label: "P. Vận hành", manager: "Trưởng phòng HC-TH" },
      { label: "Tổ Y tế", manager: "Trưởng trạm Y tế" },
      { label: "Ban Giám hiệu", manager: "Hiệu trưởng" }
    ];

    return (
      <div className="pt-4 animate-fade-in">
        <h5 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Chọn người/phòng ban chịu trách nhiệm:</h5>
        <div className="flex flex-wrap gap-2">
          {depts.map((d) => (
            <button
              key={d.label}
              onClick={() => handleAction(d.label, d.manager)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 group"
            >
              <Send className="w-3 h-3 text-indigo-500 opacity-50 group-hover:opacity-100" /> 
              <span>{d.label}</span>
              <span className="text-[9px] text-slate-400 font-normal hidden sm:inline-block ml-1">({d.manager})</span>
            </button>
          ))}
          <button 
            onClick={() => setStatus("idle")}
            className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-auto"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 flex gap-3 animate-fade-in">
      <button 
        onClick={() => setStatus("selecting")}
        disabled={status === "loading"}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Giao việc xử lý ngay
      </button>
      <button 
        onClick={() => handleAction("Ban Giám hiệu", "Ban Giám hiệu")}
        disabled={status === "loading"}
        className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-70"
      >
        Đánh dấu đã xem
      </button>
    </div>
  );
}
