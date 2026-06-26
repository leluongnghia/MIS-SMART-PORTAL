"use client";

import React, { useState } from "react";
import { createAcademicReport } from "@/src/app/[locale]/(admin)/dashboard/academic/actions";
import { useToast } from "@/src/components/ui/Toast";
import { Loader2 } from "lucide-react";

export function QuickAcademicReportForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      reportType: formData.get("reportType") as string,
      reportTime: formData.get("reportTime") as string,
      relatedClass: formData.get("relatedClass") as string,
      level: formData.get("level") as string,
      handler: formData.get("handler") as string,
      content: formData.get("content") as string,
    };

    try {
      const res = await createAcademicReport(data);
      if (res.success) {
        toast({
          variant: "success",
          title: "Gửi báo cáo thành công",
          message: "Báo cáo của bạn đã được ghi nhận trên hệ thống.",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Lỗi",
        message: error.message || "Không thể gửi báo cáo lúc này.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 font-sans text-sm">
      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Loại báo cáo</label>
        <select
          name="reportType"
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
        >
          <option value="Báo cáo sĩ số">Báo cáo sĩ số</option>
          <option value="Báo cáo tiết dạy">Báo cáo tiết dạy</option>
          <option value="Báo cáo giáo viên vắng">Báo cáo giáo viên vắng</option>
          <option value="Báo cáo học sinh vi phạm">Báo cáo học sinh vi phạm</option>
          <option value="Báo cáo sự cố lớp học">Báo cáo sự cố lớp học</option>
          <option value="Báo cáo chuyên môn">Báo cáo chuyên môn</option>
          <option value="Báo cáo cuối ngày">Báo cáo tổng kết cuối ngày</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Thời gian sự việc</label>
          <input
            type="datetime-local"
            name="reportTime"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Mức độ nghiêm trọng</label>
          <select
            name="level"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
          >
            <option value="Bình thường">Bình thường</option>
            <option value="Cần theo dõi">Cần theo dõi</option>
            <option value="Khẩn cấp">Khẩn cấp</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Lớp / Khối liên quan</label>
          <input
            type="text"
            name="relatedClass"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
            placeholder="VD: 10A1 hoặc Khối 10..."
          />
        </div>
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Người phụ trách xử lý</label>
          <input
            type="text"
            name="handler"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
            placeholder="Để trống nếu BGH phân công..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Nội dung báo cáo</label>
        <textarea
          name="content"
          required
          rows={3}
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none resize-none"
          placeholder="Mô tả sự việc chi tiết..."
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Gửi Báo Cáo
        </button>
      </div>
    </form>
  );
}
