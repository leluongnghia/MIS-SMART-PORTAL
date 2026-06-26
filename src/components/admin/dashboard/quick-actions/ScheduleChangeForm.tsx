"use client";

import React, { useState } from "react";
import { createScheduleChangeRequest } from "@/src/app/[locale]/(admin)/dashboard/academic/actions";
import { useToast } from "@/src/components/ui/Toast";
import { Loader2 } from "lucide-react";

export function ScheduleChangeForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [changeType, setChangeType] = useState("Đổi tiết");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      className: formData.get("className") as string,
      subject: formData.get("subject") as string,
      currentPeriod: formData.get("currentPeriod") as string,
      currentDate: formData.get("currentDate") as string,
      reason: formData.get("reason") as string,
      changeType: formData.get("changeType") as string,
      newTime: formData.get("newTime") as string,
      substituteTeacher: formData.get("substituteTeacher") as string,
    };

    try {
      const res = await createScheduleChangeRequest(data);
      if (res.success) {
        toast({
          variant: "success",
          title: "Gửi yêu cầu thành công",
          message: "Yêu cầu đổi lịch đã được gửi đến Học vụ/BGH duyệt.",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Lỗi",
        message: error.message || "Không thể gửi yêu cầu lúc này.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 font-sans text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Lớp</label>
          <input
            type="text"
            name="className"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
            placeholder="VD: 10A1"
          />
        </div>
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Môn học</label>
          <input
            type="text"
            name="subject"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
            placeholder="VD: Toán"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Ngày hiện tại</label>
          <input
            type="date"
            name="currentDate"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="font-bold text-slate-700 dark:text-slate-200">Tiết hiện tại</label>
          <input
            type="text"
            name="currentPeriod"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
            placeholder="VD: Tiết 3"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Hình thức đổi</label>
        <select
          name="changeType"
          value={changeType}
          onChange={(e) => setChangeType(e.target.value)}
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
        >
          <option value="Đổi tiết">Đổi tiết (dạy vào lúc khác)</option>
          <option value="Dạy thay">Nhờ người dạy thay</option>
          <option value="Đổi phòng học">Chỉ đổi phòng học</option>
          <option value="Nghỉ tiết">Nghỉ tiết (sẽ bù sau)</option>
        </select>
      </div>

      {changeType === "Đổi tiết" && (
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <label className="font-bold text-slate-700 dark:text-slate-200">Thời gian đề xuất mới</label>
          <input
            type="text"
            name="newTime"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
            placeholder="VD: Thứ 6, Tiết 4"
          />
        </div>
      )}

      {changeType === "Dạy thay" && (
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <label className="font-bold text-slate-700 dark:text-slate-200">Giáo viên thay thế</label>
          <input
            type="text"
            name="substituteTeacher"
            required
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none"
            placeholder="Tên giáo viên dạy thay..."
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-200">Lý do</label>
        <textarea
          name="reason"
          required
          rows={3}
          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 outline-none resize-none"
          placeholder="Lý do đổi lịch..."
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Gửi Yêu Cầu
        </button>
      </div>
    </form>
  );
}
