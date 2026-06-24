'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Bus, Utensils, HeartPulse, MessageSquare, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { SERVICE_TICKETS, HEALTH_INCIDENTS, TRANSPORT_ROUTES } from '@/src/mockData/schoolServices';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardServicesPage() {
  const openTickets = SERVICE_TICKETS.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const recentIncidents = HEALTH_INCIDENTS.filter(h => h.status === 'monitoring' || h.status === 'resolved').length;
  const activeRoutes = TRANSPORT_ROUTES.filter(r => r.status === 'active').length;

  const ticketStats = [
    { name: 'Ăn uống', value: SERVICE_TICKETS.filter(t => t.category === 'Ăn uống').length },
    { name: 'Xe đưa đón', value: SERVICE_TICKETS.filter(t => t.category === 'Xe đưa đón').length },
    { name: 'CSVC', value: SERVICE_TICKETS.filter(t => t.category === 'Cơ sở vật chất').length },
    { name: 'Hỗ trợ HS', value: SERVICE_TICKETS.filter(t => t.category === 'Hỗ trợ học sinh').length },
    { name: 'Khác', value: SERVICE_TICKETS.filter(t => !['Ăn uống', 'Xe đưa đón', 'Cơ sở vật chất', 'Hỗ trợ học sinh'].includes(t.category)).length },
  ];

  const weeklyUsage = [
    { name: 'T2', meals: 450, transport: 120 },
    { name: 'T3', meals: 460, transport: 125 },
    { name: 'T4', meals: 440, transport: 122 },
    { name: 'T5', meals: 455, transport: 120 },
    { name: 'T6', meals: 430, transport: 118 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tổng Quan Dịch Vụ Học Đường</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Theo dõi trạng thái các dịch vụ, sự cố y tế và ticket phản ánh từ Phụ huynh & Học sinh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30 dark:text-amber-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Ticket cần xử lý</p>
              <h3 className="text-2xl font-bold">{openTickets}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-lg dark:bg-rose-900/30 dark:text-rose-400">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sự cố y tế (Tuần)</p>
              <h3 className="text-2xl font-bold">{recentIncidents}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tuyến xe hoạt động</p>
              <h3 className="text-2xl font-bold">{activeRoutes}/{TRANSPORT_ROUTES.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Suất ăn trung bình</p>
              <h3 className="text-2xl font-bold">447</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lưu lượng sử dụng dịch vụ trong tuần</CardTitle>
            <CardDescription>So sánh số lượng suất ăn và học sinh đi xe đưa đón</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyUsage}>
                  <XAxis dataKey="name" fontSize={12} stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="meals" name="Suất ăn" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="transport" name="Xe đưa đón" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân loại Ticket Dịch vụ</CardTitle>
            <CardDescription>Tỷ lệ các mảng dịch vụ nhận được yêu cầu hỗ trợ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ticketStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Ticket mới nhất</CardTitle>
              <CardDescription>Các yêu cầu cần hỗ trợ từ Phụ huynh / Học sinh</CardDescription>
            </div>
            <a href="/vi/school-services/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả</a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {SERVICE_TICKETS.slice(0, 4).map(ticket => (
                <div key={ticket.id} className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
                  <div className="flex gap-3">
                    <div className={`mt-0.5 h-2 w-2 rounded-full ${ticket.status === 'open' ? 'bg-amber-500' : ticket.status === 'in_progress' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{ticket.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-medium bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-800">{ticket.category}</span>
                        <span>•</span>
                        <span>{ticket.createdBy}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${ticket.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : ticket.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {ticket.priority === 'urgent' ? 'Khẩn cấp' : ticket.priority === 'high' ? 'Cao' : 'Bình thường'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Sự cố Y tế gần đây</CardTitle>
              <CardDescription>Các trường hợp cần chăm sóc y tế</CardDescription>
            </div>
            <a href="/vi/school-services/health" className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả</a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {HEALTH_INCIDENTS.slice(0, 4).map(incident => (
                <div key={incident.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{incident.type}</p>
                      {incident.severity === 'Khẩn cấp' && <AlertTriangle className="h-4 w-4 text-rose-500" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{incident.student} ({incident.class}) • {new Date(incident.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    {incident.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full dark:bg-emerald-900/30">
                        <CheckCircle2 className="h-3 w-3" /> Đã xử lý
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full dark:bg-amber-900/30">
                        <AlertCircle className="h-3 w-3" /> Đang theo dõi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
