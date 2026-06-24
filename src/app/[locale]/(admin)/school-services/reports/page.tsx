'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { FileBarChart, Download, Calendar, Filter } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

export default function ReportsPage() {
  const expenseData = [
    { name: 'Tháng 1', thucPham: 120, vanHanhXe: 45, yTe: 12, csvc: 30 },
    { name: 'Tháng 2', thucPham: 110, vanHanhXe: 40, yTe: 10, csvc: 20 },
    { name: 'Tháng 3', thucPham: 125, vanHanhXe: 48, yTe: 15, csvc: 35 },
    { name: 'Tháng 4', thucPham: 130, vanHanhXe: 50, yTe: 18, csvc: 40 },
    { name: 'Tháng 5', thucPham: 128, vanHanhXe: 47, yTe: 14, csvc: 25 },
    { name: 'Tháng 6', thucPham: 135, vanHanhXe: 52, yTe: 20, csvc: 45 },
  ];

  const qualityData = [
    { name: 'T1', csat: 85, ticketClosed: 90 },
    { name: 'T2', csat: 88, ticketClosed: 92 },
    { name: 'T3', csat: 86, ticketClosed: 88 },
    { name: 'T4', csat: 90, ticketClosed: 95 },
    { name: 'T5', csat: 92, ticketClosed: 96 },
    { name: 'T6', csat: 94, ticketClosed: 98 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Báo Cáo Vận Hành</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thống kê chi phí, đo lường chất lượng dịch vụ (CSAT) và hiệu suất xử lý Ticket.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => alert('Tính năng đang được phát triển')}  variant="outline" className="shadow-sm">
            <Filter className="mr-2 h-4 w-4" /> Lọc
          </Button>
          <Button onClick={() => alert('Tính năng đang được phát triển')}  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất Báo Cáo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chi phí Vận hành Dịch vụ (Triệu VNĐ)</CardTitle>
            <CardDescription>Xu hướng chi phí 6 tháng đầu năm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="thucPham" stackId="a" name="Thực phẩm" fill="#10b981" />
                  <Bar dataKey="vanHanhXe" stackId="a" name="Vận hành xe" fill="#3b82f6" />
                  <Bar dataKey="csvc" stackId="a" name="Cơ sở vật chất" fill="#f59e0b" />
                  <Bar dataKey="yTe" stackId="a" name="Y tế & Hỗ trợ" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chất lượng Dịch vụ (CSAT) & Xử lý Ticket</CardTitle>
            <CardDescription>Điểm hài lòng Phụ huynh và Tỷ lệ đóng Ticket đúng hạn (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="#888888" tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="csat" name="CSAT (%)" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="ticketClosed" name="Ticket đóng hạn (%)" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
