"use client";

import React, { useState } from "react";
import { createMeetingEvent } from "@/src/libs/server/actions/council-actions";
import { useToast } from "@/src/components/ui/Toast";
import { Loader2 } from "lucide-react";

export function ConveneMeetingForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      department: formData.get("department") as string,
    };

    const res = await createMeetingEvent(data);
    setLoading(false);

    if (res.success) {
      toast({
        variant: "success",
        title: "Triệu tập thành công",
        message: "Lịch họp đã được gửi tới các thành phần liên quan.",
      });
      onSuccess();
    } else {
      toast({
        variant: "error",
        title: "Lỗi",
        message: res.error || "Không thể tạo lịch họp lúc này.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 font-sans text-sm">
      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Chủ đề Cuộc họp</label>
        <input
          type="text"
          name="title"
          required
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
          placeholder="Nhập nội dung họp..."
        />
      </div>

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Thời gian</label>
        <input
          type="datetime-local"
          name="date"
          required
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Thành phần tham dự</label>
        <select
          name="department"
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
        >
          <option value="Hội đồng trường">Hội đồng trường</option>
          <option value="Ban Giám Hiệu">Ban Giám Hiệu</option>
          <option value="Tổ Trưởng Chuyên Môn">Tổ Trưởng Chuyên Môn</option>
          <option value="Toàn thể GVNV">Toàn thể GVNV</option>
        </select>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Lưu Lịch Họp
        </button>
      </div>
    </form>
  );
}
