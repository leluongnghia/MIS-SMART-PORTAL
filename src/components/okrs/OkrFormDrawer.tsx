"use client";

import React, { useState } from "react";
import Drawer from "@/src/components/ui/Drawer";
import { Plus, Save, Target, LayoutGrid, Calendar, Users, Briefcase } from "lucide-react";

export function OkrFormDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Mục tiêu chiến lược (OKR) mới"
      description="Điền thông tin chi tiết để khởi tạo mục tiêu chiến lược cho năm học."
      side="right"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 font-sans flex flex-col h-full">
        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Thông tin chung */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> 1. Thông tin chung
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên mục tiêu *</label>
                <input required type="text" placeholder="Nhập tên mục tiêu chiến lược..." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mã mục tiêu</label>
                  <input type="text" placeholder="VD: TS-02" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nhóm mục tiêu *</label>
                  <select required className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">-- Chọn nhóm --</option>
                    <option value="G01">Tuyển sinh & Tăng trưởng</option>
                    <option value="G02">Chất lượng giáo dục</option>
                    <option value="G03">Đội ngũ giáo viên</option>
                    <option value="G04">Tài chính vận hành</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mô tả mục tiêu</label>
                <textarea rows={3} placeholder="Mô tả tóm tắt ý nghĩa và kết quả mong muốn..." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Phân công */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> 2. Phân công & Thời hạn
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Người phụ trách *</label>
                  <input required type="text" placeholder="Tên người quản lý..." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng ban chủ trì *</label>
                  <select required className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">-- Chọn phòng ban --</option>
                    <option value="Tuyển sinh">Phòng Tuyển sinh</option>
                    <option value="Đào tạo">Ban Học vụ</option>
                    <option value="Tài chính">Phòng Tài chính</option>
                    <option value="HCNS">Phòng HCNS</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ngày bắt đầu</label>
                  <input type="date" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ngày kết thúc *</label>
                  <input required type="date" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mức độ ưu tiên</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="priority" value="Low" /> Thấp</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="priority" value="Medium" defaultChecked /> Trung bình</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="priority" value="High" /> Cao</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="priority" value="Critical" /> Nghiêm trọng</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mt-4">
            <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
              💡 Lưu ý: Sau khi tạo OKR chiến lược, bạn sẽ được chuyển đến màn hình chi tiết để thêm các Key Results (Kết quả then chốt) tương ứng.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 mt-auto">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : <Save className="w-4 h-4" />}
            {loading ? "Đang lưu..." : "Tạo OKR"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
