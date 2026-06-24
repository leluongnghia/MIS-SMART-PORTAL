"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { CheckCircle2, Clock, AlertTriangle, UserMinus, FileClock, ClipboardList, ArrowRight } from "lucide-react";
import { EmptyState } from "@/src/components/ui/EmptyState";

const opsData = [
  { name: "Thứ 2", value: 2 },
  { name: "Thứ 3", value: 5 },
  { name: "Thứ 4", value: 1 },
  { name: "Thứ 5", value: 0 },
  { name: "Thứ 6", value: 3 },
];

export function AcademicOperationsWidget() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
          <UserMinus className="w-4 h-4 text-rose-600" /> GV NGHỈ & TIẾT TRỐNG (TUẦN NÀY)
        </h3>
      </div>
      <div className="flex flex-col h-64 justify-between">
        <div className="flex gap-4">
          <div className="flex-1 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800/50">
            <span className="text-[10px] uppercase font-bold text-rose-500">GV Báo Nghỉ</span>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400">11 <span className="text-sm font-medium">lượt</span></div>
          </div>
          <div className="flex-1 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50">
            <span className="text-[10px] uppercase font-bold text-amber-500">Đã Dạy Thay</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">9 <span className="text-sm font-medium">tiết</span></div>
          </div>
        </div>
        <div className="h-40 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={opsData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" name="Lượt nghỉ" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={20}>
                {opsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 3 ? '#e11d48' : '#fb7185'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function PriorityTasksWidget() {
  const tasks = [
    { id: 1, title: "Duyệt giáo án Khối 10", deadline: "15:00 Hôm nay", status: "urgent", icon: ClipboardList },
    { id: 2, title: "Phản hồi PH Lớp 10A2", deadline: "17:00 Hôm nay", status: "urgent", icon: AlertTriangle },
    { id: 3, title: "Xếp lịch thi giữa kỳ", deadline: "Ngày mai", status: "pending", icon: Clock },
    { id: 4, title: "Dự giờ cô Hương (Hóa)", deadline: "Thứ 5", status: "pending", icon: CheckCircle2 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 lg:col-span-2">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> CÔNG VIỆC ƯU TIÊN (FOCUS TO-DO)
        </h3>
        <button onClick={() => alert("Đang chuyển sang danh sách tất cả công việc...")} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Xem tất cả</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-64 overflow-y-auto custom-scrollbar">
        {tasks.map(task => {
          const Icon = task.icon;
          const isUrgent = task.status === "urgent";
          return (
            <div key={task.id} onClick={() => alert(`Đang mở công việc: ${task.title}`)} className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${isUrgent ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30 hover:border-rose-300' : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 hover:border-slate-300'}`}>
              <div className={`p-2 rounded-lg ${isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-white border border-slate-200 text-slate-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{task.title}</h4>
                <span className={`text-[10px] font-bold mt-1 inline-block ${isUrgent ? 'text-rose-500' : 'text-slate-500'}`}>Hạn chót: {task.deadline}</span>
              </div>
            </div>
          );
        })}
        {/* Placeholder for adding new task */}
        <div onClick={() => alert("Chức năng Thêm công việc đang được phát triển")} className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
            <span className="text-xl">+</span>
          </div>
          <span className="text-xs font-bold">Thêm công việc</span>
        </div>
      </div>
    </div>
  );
}

export function LateReportsWidget() {
  const reports = [
    { teacher: "Lê Hoàng C.", target: "Báo cáo điểm Hóa 12", delay: "Trễ 2 ngày" },
    { teacher: "Trần Thị B.", target: "Sổ đầu bài Vật lý 11", delay: "Trễ 1 ngày" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
          <FileClock className="w-4 h-4 text-amber-600" /> BÁO CÁO TRỄ HẠN
        </h3>
      </div>
      
      {reports.length > 0 ? (
        <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
          {reports.map((r, i) => (
            <div key={i} className="p-3 border-l-2 border-amber-400 bg-slate-50 dark:bg-slate-800 rounded-r-lg">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{r.teacher}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{r.target}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">{r.delay}</span>
                <button onClick={() => alert(`Đã gửi thông báo nhắc nhở đến: ${r.teacher}`)} className="text-[10px] font-bold text-indigo-600 hover:underline">Nhắc nhở</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          title="Tuyệt vời!" 
          description="Không có giáo viên nào nộp báo cáo trễ hạn."
        />
      )}
    </div>
  );
}
