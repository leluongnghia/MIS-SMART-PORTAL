"use client";

import React, { useState } from "react";
import { approveLessonPlan } from "@/src/app/[locale]/(admin)/dashboard/academic/actions";
import { useToast } from "@/src/components/ui/Toast";
import { Loader2, Check, X, Undo, FileText } from "lucide-react";

// For demo purposes, we accept an array of plans. In a real app, this might fetch data via SWR/React Query.
export function ApproveLessonPlanList({ plans = [], onSuccess }: { plans?: any[], onSuccess: () => void }) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function handleAction(planId: string, action: "approve" | "reject" | "return") {
    setLoadingId(planId);
    try {
      const res = await approveLessonPlan(planId, action, note);
      if (res.success) {
        toast({
          variant: "success",
          title: "Thành công",
          message: `Đã ${action === 'approve' ? 'duyệt' : action === 'reject' ? 'từ chối' : 'trả lại'} giáo án.`,
        });
        setActiveNoteId(null);
        setNote("");
        // In a real app, we'd refetch data here or optimistic update.
        onSuccess(); // Close or refresh
      }
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Lỗi",
        message: error.message || "Đã xảy ra lỗi khi xử lý.",
      });
    } finally {
      setLoadingId(null);
    }
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center">
        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
        <p>Hiện không có giáo án nào đang chờ duyệt.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
      {plans.map(plan => (
        <div key={plan.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{plan.title}</h4>
              <p className="text-sm text-slate-500">Giáo viên: {plan.teacherName || "Chưa rõ"} • Môn: {plan.subject || "Chưa rõ"} • Lớp: {plan.class || "Chưa rõ"}</p>
            </div>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-md font-medium">Đang chờ duyệt</span>
          </div>

          {activeNoteId === plan.id ? (
            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <textarea 
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Nhập nhận xét (bắt buộc nếu từ chối/trả lại)..."
                className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                rows={2}
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setActiveNoteId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => handleAction(plan.id, "return")}
                  disabled={loadingId === plan.id || !note.trim()}
                  className="px-3 py-1.5 text-xs text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors disabled:opacity-50"
                >
                  Giao lại (Yêu cầu sửa)
                </button>
                <button 
                  onClick={() => handleAction(plan.id, "reject")}
                  disabled={loadingId === plan.id || !note.trim()}
                  className="px-3 py-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50"
                >
                  Từ chối
                </button>
                <button 
                  onClick={() => handleAction(plan.id, "approve")}
                  disabled={loadingId === plan.id}
                  className="px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {loadingId === plan.id && <Loader2 className="w-3 h-3 animate-spin" />}
                  Duyệt kèm nhận xét
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 justify-end mt-2">
              <button 
                onClick={() => setActiveNoteId(plan.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Ghi nhận xét...
              </button>
              <button 
                onClick={() => handleAction(plan.id, "approve")}
                disabled={loadingId === plan.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-md transition-colors disabled:opacity-50 font-bold"
              >
                {loadingId === plan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Duyệt nhanh
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
