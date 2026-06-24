"use client";

import React, { useState } from "react";
import { Users, AlertTriangle, Clock, PhoneCall, CheckCircle2, MoreHorizontal } from "lucide-react";

export function LiveClassStatusWidget() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Trạng thái Lớp học (Tiết 3)
        </h3>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md font-medium">9:45 AM - 10:30 AM</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Đang học</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">42</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Dự giờ</p>
          <p className="text-xl font-black text-amber-700 dark:text-amber-300">02</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 relative overflow-hidden">
          <div className="absolute -right-2 -top-2 bg-rose-500 w-8 h-8 rounded-full opacity-20 animate-pulse"></div>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Trống tiết</p>
          <p className="text-xl font-black text-rose-700 dark:text-rose-300">01</p>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-[11px] font-bold text-slate-500 mb-2">CẢNH BÁO / ĐIỀU CHỈNH</h4>
        <div className="space-y-2">
          <div className="flex items-start justify-between p-2.5 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Lớp 10A1 - Vắng GV Toán</p>
                <p className="text-[10px] text-slate-500">GV Nguyễn Văn A xin nghỉ đột xuất (ốm).</p>
              </div>
            </div>
            <button onClick={() => alert("Chức năng Xếp GV dạy thay đang được phát triển")} className="px-2 py-1 text-[9px] bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold rounded">Xếp GV Dạy thay</button>
          </div>
          <div className="flex items-start justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg">
            <div className="flex gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Lớp 8A4 - GV vào muộn 5p</p>
                <p className="text-[10px] text-slate-500">Giám thị đang hỗ trợ quản lớp.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentInterventionWidget() {
  const [resolved, setResolved] = useState<string[]>([]);

  const handleResolve = (id: string) => {
    setResolved([...resolved, id]);
  };

  const students = [
    { id: "1", name: "Trần Bảo Nam", class: "9A2", reason: "Điểm Toán < 5.0 hai kỳ liên tiếp", type: "academic" },
    { id: "2", name: "Lê Ngọc Hân", class: "11A1", reason: "Nghỉ học không phép 3 ngày", type: "behavior" },
    { id: "3", name: "Nguyễn Minh Đức", class: "7A3", reason: "Giáo viên báo cáo mất tập trung", type: "academic" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" /> DANH SÁCH HỌC SINH CẦN CAN THIỆP
        </h3>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold">{students.length - resolved.length} cases</span>
      </div>

      <div className="space-y-3">
        {students.map((st) => {
          if (resolved.includes(st.id)) return null;
          return (
            <div key={st.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-sm transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{st.name}</p>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">{st.class}</span>
                  </div>
                  <p className={`text-[11px] mt-1 ${st.type === 'behavior' ? 'text-rose-500' : 'text-amber-600'}`}>
                    ⚠️ {st.reason}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => alert(`Đang kết nối gọi điện cho phụ huynh em ${st.name}...`)} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg" title="Gọi Phụ huynh">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleResolve(st.id)}
                    className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg" title="Đã xử lý"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {resolved.length === students.length && (
          <div className="text-center py-6 text-slate-400 text-xs font-medium">
            Tuyệt vời! Không còn học sinh nào cần can thiệp khẩn cấp.
          </div>
        )}
      </div>
    </div>
  );
}
