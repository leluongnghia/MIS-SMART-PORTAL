"use client";

import React, { useState } from "react";
import { StrategicOkr } from "@/src/types/okr";
import { 
  CheckCircle2, Clock, AlertTriangle, AlertCircle, FileText, 
  Calendar, User, Target, PlayCircle, BarChart3, Activity 
} from "lucide-react";

export function OkrDetailDrawer({ okr }: { okr: StrategicOkr }) {
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "audit">("overview");

  return (
    <div className="font-sans">
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded">{okr.code}</span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${okr.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
              Priority: {okr.priority}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-2">{okr.title}</h2>
          <p className="text-sm text-slate-500 mt-2">{okr.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button onClick={() => setActiveTab("overview")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "overview" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>Key Results</button>
        <button onClick={() => setActiveTab("tasks")} className={`pb-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "tasks" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>Việc cần làm <span className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded-full text-[10px]">{okr.actionItems.length}</span></button>
        <button onClick={() => setActiveTab("audit")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "audit" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>Lịch sử (Logs)</button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Warning Box if delayed */}
            {(okr.status === "Delayed" || okr.status === "AtRisk") && (
              <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/40">
                <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" /> Cảnh báo tiến độ
                </h4>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                  {okr.notes || "Mục tiêu đang có nguy cơ không hoàn thành đúng hạn. Đề nghị BGH hoặc người phụ trách cập nhật báo cáo giải trình."}
                </p>
                <button className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors">Yêu cầu báo cáo giải trình</button>
              </div>
            )}

            {/* Key Results List */}
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" /> Danh sách Key Results
              </h3>
              {okr.keyResults.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm">
                  Chưa có Key Result nào được định nghĩa.
                </div>
              ) : (
                <div className="space-y-3">
                  {okr.keyResults.map(kr => (
                    <div key={kr.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{kr.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kr.status === 'OnTrack' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{kr.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><User className="w-3 h-3"/> {kr.ownerName}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {kr.deadline}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Tiến độ: {kr.progressPercent}%</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{kr.currentValue} / {kr.targetValue} {kr.unit}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${kr.status === 'OnTrack' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${kr.progressPercent}%` }}></div>
                        </div>
                      </div>
                      {kr.evidenceNote && (
                        <div className="mt-3 p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex items-start gap-1.5">
                          <FileText className="w-3 h-3 mt-0.5 shrink-0 text-slate-400"/>
                          <span>Ghi chú: {kr.evidenceNote}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Việc cần làm (Action Items)</h3>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">+ Thêm việc mới</button>
            </div>
            {okr.actionItems.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm">
                Không có công việc nào đang xử lý.
              </div>
            ) : (
              <div className="space-y-2">
                {okr.actionItems.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex shrink-0 ${task.status === 'Done' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}></div>
                      <div>
                        <p className={`text-sm font-bold ${task.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{task.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>👤 {task.ownerName}</span>
                          <span>⏳ {task.deadline}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${task.priority === 'Critical' || task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>{task.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="animate-fade-in space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">Lịch sử hoạt động</h3>
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
              {[
                { time: "2 giờ trước", action: "Cập nhật tiến độ", user: "Nguyễn Văn Tuyển", desc: "Tăng từ 30% lên 45%", type: "update" },
                { time: "Hôm qua", action: "Thêm Key Result mới", user: "Lê Thị Thu", desc: "KR-02: Đạt 350 HS tham gia test", type: "add" },
                { time: "Tuần trước", action: "Tạo Mục tiêu chiến lược", user: "Admin", desc: "Khởi tạo OKR trên hệ thống", type: "create" }
              ].map((log, i) => (
                <div key={i} className="pl-6 relative">
                  <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${log.type === 'create' ? 'bg-indigo-500' : log.type === 'update' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.action}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{log.desc}</p>
                  <p className="text-[9px] text-slate-400 mt-1.5 flex items-center gap-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{log.user}</span> • <span>{log.time}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
          Cập nhật tiến độ
        </button>
        <button className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-lg text-sm transition-colors">
          Trình Hội đồng
        </button>
      </div>
    </div>
  );
}
