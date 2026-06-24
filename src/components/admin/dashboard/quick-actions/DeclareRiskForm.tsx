"use client";

import React, { useState } from "react";
import { createRisk } from "@/src/libs/server/actions/council-actions";
import { useToast } from "@/src/components/ui/Toast";
import { Loader2 } from "lucide-react";

export function DeclareRiskForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      severity: formData.get("severity") as "critical" | "high" | "medium" | "low",
      description: formData.get("description") as string,
    };

    const res = await createRisk(data);
    setLoading(false);

    if (res.success) {
      toast({
        variant: "success",
        title: "Khai báo thành công",
        message: "Rủi ro đã được ghi nhận vào bản đồ giám sát.",
      });
      onSuccess();
    } else {
      toast({
        variant: "error",
        title: "Lỗi",
        message: res.error || "Không thể khai báo rủi ro lúc này.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 font-sans text-sm">
      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Tiêu đề Sự cố / Rủi ro</label>
        <input
          type="text"
          name="title"
          required
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
          placeholder="Ví dụ: Hệ thống PCCC khu B bị lỗi..."
        />
      </div>

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Mức độ Nghiêm trọng</label>
        <select
          name="severity"
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
        >
          <option value="low">Thấp (Theo dõi)</option>
          <option value="medium">Cảnh báo (Medium)</option>
          <option value="high">Cao (Cần xử lý)</option>
          <option value="critical">Nghiêm trọng (Khẩn cấp)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Mô tả tình trạng</label>
        <textarea
          name="description"
          required
          rows={4}
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-rose-500 outline-none resize-none"
          placeholder="Mô tả chi tiết ảnh hưởng và phạm vi..."
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Khai Báo Rủi Ro
        </button>
      </div>
    </form>
  );
}
