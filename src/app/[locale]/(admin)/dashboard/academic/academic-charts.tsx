"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export function AcademicCharts() {
  // Fake data for Student Academic Performance
  const studentPerformance = useMemo(() => [
    { name: "Khối 10", gioi: 120, kha: 85, tb: 20 },
    { name: "Khối 11", gioi: 140, kha: 70, tb: 15 },
    { name: "Khối 12", gioi: 180, kha: 50, tb: 5 },
  ], []);

  // Fake data for Teacher Evaluation Radar
  const teacherEvaluation = useMemo(() => [
    { subject: 'Chuyên môn', A: 85, B: 90, fullMark: 100 },
    { subject: 'Sư phạm', A: 90, B: 85, fullMark: 100 },
    { subject: 'Kỷ luật', A: 95, B: 95, fullMark: 100 },
    { subject: 'CSKH (PHHS)', A: 80, B: 88, fullMark: 100 },
    { subject: 'Sáng tạo', A: 75, B: 80, fullMark: 100 },
    { subject: 'Nghiên cứu', A: 70, B: 65, fullMark: 100 },
  ], []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Phân bổ Học lực */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Phân bổ Học lực theo Khối</h3>
          <p className="text-[11px] text-slate-500 mt-1">Tỷ lệ học sinh Giỏi, Khá, Trung bình trong kỳ thi gần nhất.</p>
        </div>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '13px', fontWeight: 500 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
              <Bar name="Giỏi" dataKey="gioi" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar name="Khá" dataKey="kha" stackId="a" fill="#3b82f6" />
              <Bar name="Trung bình" dataKey="tb" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart Đánh giá Giáo viên */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Khung Năng lực Giáo viên (KPI)</h3>
          <p className="text-[11px] text-slate-500 mt-1">Đánh giá bình quân năng lực đội ngũ Tổ chuyên môn.</p>
        </div>
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={teacherEvaluation}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar name="Kỳ này" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
              <Radar name="Kỳ trước" dataKey="B" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
