"use client";

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";

const groupData = [
  { name: "Tuyển sinh", progress: 65, fill: "#6366f1" },
  { name: "Chất lượng GD", progress: 85, fill: "#10b981" },
  { name: "Tài chính", progress: 40, fill: "#f59e0b" },
  { name: "Hành chính", progress: 90, fill: "#8b5cf6" },
  { name: "Mở rộng cơ sở", progress: 20, fill: "#f43f5e" }
];

const statusData = [
  { name: "Đúng tiến độ", value: 3, fill: "#10b981" },
  { name: "Chậm tiến độ", value: 1, fill: "#f59e0b" },
  { name: "Có Rủi ro", value: 1, fill: "#f43f5e" }
];

export function OkrCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Tiến độ OKR theo Nhóm mục tiêu</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value}%`, 'Tiến độ']}
              />
              <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={20}>
                {groupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Tỷ lệ Trạng thái OKR</h3>
        <div className="h-[250px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [value, 'Số lượng OKR']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
