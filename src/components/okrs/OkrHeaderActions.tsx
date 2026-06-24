"use client";

import React, { useState } from "react";
import { Filter, Plus } from "lucide-react";
import { OkrFormDrawer } from "./OkrFormDrawer";

export function OkrHeaderActions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex gap-3">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)} 
          className={`px-4 py-2 border rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${isFilterOpen ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}
        >
          <Filter className="w-4 h-4" /> Bộ lọc chuyên sâu
        </button>
        <button 
          onClick={() => setIsFormOpen(true)} 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tạo OKR mới
        </button>
      </div>

      {isFilterOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-fade-in">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">Bộ lọc OKR</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nhóm mục tiêu</label>
              <select className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                <option>Tất cả nhóm</option>
                <option>Tuyển sinh & Tăng trưởng</option>
                <option>Chất lượng giáo dục</option>
                <option>Tài chính vận hành</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mức độ ưu tiên</label>
              <select className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                <option>Tất cả</option>
                <option>High / Critical</option>
                <option>Medium / Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Người phụ trách</label>
              <input type="text" placeholder="Tìm theo tên..." className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button onClick={() => setIsFilterOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Xóa bộ lọc</button>
            <button onClick={() => setIsFilterOpen(false)} className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg">Áp dụng</button>
          </div>
        </div>
      )}

      <OkrFormDrawer isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
