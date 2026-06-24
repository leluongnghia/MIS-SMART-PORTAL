"use client";

import React, { useState } from "react";
import { createDirective } from "@/src/libs/server/actions/council-actions";
import { useToast } from "@/src/components/ui/Toast";
import { Loader2 } from "lucide-react";

export function CreateDirectiveForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      urgency: formData.get("urgency") as string,
      content: formData.get("content") as string,
    };

    const res = await createDirective(data);
    setLoading(false);

    if (res.success) {
      toast({
        variant: "success",
        title: "Tạo chỉ đạo thành công",
        message: "Chỉ đạo mới đã được ghi nhận vào hệ thống.",
      });
      onSuccess();
    } else {
      toast({
        variant: "error",
        title: "Lỗi",
        message: res.error || "Không thể tạo chỉ đạo lúc này.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 font-sans text-sm">
      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Tiêu đề chỉ đạo</label>
        <input
          type="text"
          name="title"
          required
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Nhập tiêu đề..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Danh mục</label>
          <select
            name="category"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Học vụ">Học vụ</option>
            <option value="Vận hành">Vận hành</option>
            <option value="Nhân sự">Nhân sự</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Mức độ ưu tiên</label>
          <select
            name="urgency"
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Bình thường">Bình thường</option>
            <option value="Khẩn cấp">Khẩn cấp</option>
            <option value="Tối khẩn">Tối khẩn</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Nội dung chi tiết</label>
        <textarea
          name="content"
          required
          rows={4}
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="Nhập nội dung chỉ đạo..."
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Lưu Chỉ Đạo
        </button>
      </div>
    </form>
  );
}
