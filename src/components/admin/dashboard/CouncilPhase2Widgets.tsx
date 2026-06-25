"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { AreaChart, Area } from "recharts";
import { PieChart, Pie } from "recharts";
import { TrendingUp, Users, Calendar, Briefcase, FileText, ArrowRight } from "lucide-react";
import { EmptyState } from "@/src/components/ui/EmptyState";

const financeData = [
  { name: "30 ngày tới", in: 1200, out: 800, balance: 400 },
  { name: "60 ngày tới", in: 3500, out: 1200, balance: 2300 },
  { name: "90 ngày tới", in: 1500, out: 1800, balance: -300 },
];

const hrData = [
  { name: "Tuyển mới", value: 12, color: "#10b981" },
  { name: "Nghỉ việc", value: 3, color: "#e11d48" },
  { name: "Thuyên chuyển", value: 2, color: "#f59e0b" },
];

const funnelData = [
  { name: "Leads", value: 1200 },
  { name: "Tư vấn", value: 850 },
  { name: "Test đầu vào", value: 600 },
  { name: "Đặt chỗ", value: 450 },
  { name: "Nhập học", value: 320 },
];

export function FinanceForecastWidget() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> DỰ BÁO DÒNG TIỀN (90 NGÀY)
        </h3>
      </div>
      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="in" name="Dòng tiền vào (Triệu)" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="out" name="Dòng tiền ra (Triệu)" fill="#e11d48" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AdmissionsFunnelWidget() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" /> PHỄU TUYỂN SINH CHI TIẾT
        </h3>
      </div>
      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={funnelData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={95} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#bfdbfe" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HRTurnoverWidget() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-purple-600" /> BIẾN ĐỘNG NHÂN SỰ
        </h3>
      </div>
      <div className="flex items-center gap-1 h-64 flex-1">
        <div className="w-[45%] h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={hrData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5}>
                {hrData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-[55%] flex flex-col justify-center space-y-3 pl-1">
          {hrData.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white shrink-0 ml-1">{item.value}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            <button onClick={() => alert("Đang chuyển sang trang Báo cáo Nhân sự...")} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 whitespace-nowrap">
              Xem báo cáo chi tiết <ArrowRight className="w-3 h-3 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CouncilMeetingsWidget() {
  // Demo empty state or mock data
  const meetings = [
    { id: 1, title: "Họp giao ban tháng 10", date: "24/10/2026", status: "pending_resolution" },
    { id: 2, title: "Họp rà soát ngân sách HKI", date: "15/10/2026", status: "resolved" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
        <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" /> NGHỊ QUYẾT & CUỘC HỌP HĐT
        </h3>
      </div>
      
      {meetings.length > 0 ? (
        <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:border-amber-200 transition-colors">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{meeting.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meeting.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {meeting.status === 'resolved' ? 'Đã ban hành' : 'Chờ NQ'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {meeting.date}
              </p>
            </div>
          ))}
          <button onClick={() => alert("Chức năng Lên lịch họp HĐT đang được phát triển")} className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Lên lịch họp mới
          </button>
        </div>
      ) : (
        <EmptyState 
          icon={<FileText />} 
          title="Chưa có cuộc họp nào" 
          description="Lên lịch cuộc họp Hội đồng trường để theo dõi nghị quyết"
          actionLabel="Tạo cuộc họp mới"
          onAction={() => alert("Chức năng Tạo cuộc họp đang được phát triển")}
        />
      )}
    </div>
  );
}
