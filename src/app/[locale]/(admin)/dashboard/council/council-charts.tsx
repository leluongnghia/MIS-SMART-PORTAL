"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
  Bar
} from "recharts";

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6"];

export function CouncilCharts() {
  // Fake data for Revenue & Enrollment trend
  const trendData = useMemo(() => [
    { name: "Tháng 1", revenue: 1200, enrollment: 80 },
    { name: "Tháng 2", revenue: 1350, enrollment: 90 },
    { name: "Tháng 3", revenue: 1500, enrollment: 105 },
    { name: "Tháng 4", revenue: 1800, enrollment: 120 },
    { name: "Tháng 5", revenue: 2100, enrollment: 135 },
    { name: "Tháng 6", revenue: 2450, enrollment: 142 },
  ], []);

  // Fake data for Revenue Distribution
  const revenueDistribution = useMemo(() => [
    { name: "Học phí", value: 1600 },
    { name: "Bán trú", value: 450 },
    { name: "Xe đưa đón", value: 250 },
    { name: "Sự kiện ngoại khóa", value: 150 },
  ], []);

  // Fake data for Cashflow Projection
  const cashflowData = useMemo(() => [
    { week: "Tuần 1", in: 450, out: 320, balance: 130 },
    { week: "Tuần 2", in: 380, out: 410, balance: -30 },
    { week: "Tuần 3", in: 620, out: 280, balance: 340 },
    { week: "Tuần 4", in: 510, out: 450, balance: 60 },
  ], []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Biểu đồ Xu hướng Doanh thu & Tuyển sinh */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Xu hướng Doanh thu & Tuyển sinh</h3>
          <p className="text-[11px] text-slate-500 mt-1">So sánh tăng trưởng doanh thu (M VND) và số học sinh nhập học trong 6 tháng qua.</p>
        </div>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '13px', fontWeight: 500 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} iconType="circle" />
              <Area yAxisId="left" type="monotone" name="Doanh thu (M)" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area yAxisId="right" type="monotone" name="Học sinh mới" dataKey="enrollment" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollment)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ Cơ cấu Nguồn thu */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cơ cấu Nguồn thu</h3>
          <p className="text-[11px] text-slate-500 mt-1">Phân bổ doanh thu theo dịch vụ</p>
        </div>
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={revenueDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {revenueDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                formatter={(value) => [`${value}M VND`, 'Doanh thu']}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ Dự phóng dòng tiền (Cashflow Projection) */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col mt-2">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dự phóng Dòng tiền (30 ngày tới)</h3>
          <p className="text-[11px] text-slate-500 mt-1">Dự báo dòng tiền Thu/Chi thực tế để đảm bảo thanh khoản và vận hành.</p>
        </div>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cashflowData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '13px', fontWeight: 500 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
              <Bar name="Dòng tiền Vào (In)" dataKey="in" barSize={40} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar name="Dòng tiền Ra (Out)" dataKey="out" barSize={40} fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Line type="monotone" name="Số dư (Balance)" dataKey="balance" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
