"use client";

import React, { useState } from "react";
import { createAcademicTask } from "@/src/app/[locale]/(admin)/dashboard/academic/actions";
import { useToast } from "@/src/components/ui/Toast";
import { Loader2 } from "lucide-react";

export function AssignAcademicTaskForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      assignedName: formData.get("assignedName") as string,
      department: formData.get("department") as string,
      deadline: formData.get("deadline") as string,
      priority: formData.get("priority") as string,
      description: formData.get("description") as string,
    };

    try {
      const res = await createAcademicTask(data);
      if (res.success) {
        toast({
          variant: "success",
          title: "Giao việc thành công",
          message: "Nhiệm vụ đã được chuyển tới người nhận.",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Lỗi",
        message: error.message || "Không thể giao việc lúc này.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 font-sans text-sm">
      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Tiêu đề công việc</label>
        <input
          type="text"
          name="title"
          required
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Nhập tiêu đề..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Loại công việc</label>
          <select
            name="category"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Kiểm tra giáo án">Kiểm tra giáo án</option>
            <option value="Dự giờ">Dự giờ</option>
            <option value="Kiểm tra hồ sơ chuyên môn">Kiểm tra HS chuyên môn</option>
            <option value="Xử lý học sinh">Xử lý học sinh</option>
            <option value="Báo cáo chuyên đề">Báo cáo chuyên đề</option>
            <option value="Phân công chuyên môn">Phân công chuyên môn</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Mức độ ưu tiên</label>
          <select
            name="priority"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Bình thường">Bình thường</option>
            <option value="Quan trọng">Quan trọng</option>
            <option value="Khẩn cấp">Khẩn cấp</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Người / Tổ nhận việc</label>
          <input
            type="text"
            name="assignedName"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Tên người nhận..."
          />
        </div>
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Hạn hoàn thành</label>
          <input
            type="date"
            name="deadline"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Nội dung yêu cầu</label>
        <textarea
          name="description"
          required
          rows={3}
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          placeholder="Mô tả chi tiết công việc..."
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Giao Việc
        </button>
      </div>
    </form>
  );
}
