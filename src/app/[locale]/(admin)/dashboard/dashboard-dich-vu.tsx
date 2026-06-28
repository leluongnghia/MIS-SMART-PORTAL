'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Bus, 
  Utensils, 
  Calendar, 
  Users, 
  Clock, 
  AlertTriangle,
  ClipboardList, 
  ArrowRight, 
  Plus, 
  ShieldAlert,
  HelpCircle,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/src/components/ui/badge';

export default function DashboardDichVu({ data, user }: { data: any; user: any }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  const openTickets = data?.alerts?.openParentTicketsCount || 0;
  const overdueTickets = data?.alerts?.overdueParentTicketsCount || 0;
  const upcomingEvents = data?.alerts?.upcomingEventsCount || 0;
  
  // School services specifics
  const busRunning = 18;
  const boardingMeals = 845;
  const openRepairs = data?.alerts?.openRepairRequestsCount || 0;

  const kpis = [
    { 
      label: 'Ticket phụ huynh', 
      value: openTickets, 
      icon: Users, 
      color: 'text-sky-600', 
      bg: 'bg-sky-50 dark:bg-sky-950/40', 
      href: `/${locale}/events`,
      desc: `${overdueTickets} quá hạn SLA`
    },
    { 
      label: 'Sự kiện sắp tới', 
      value: upcomingEvents, 
      icon: Calendar, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/40', 
      href: `/${locale}/events`,
      desc: 'Tuần này & tuần tới'
    },
    { 
      label: 'Xe đang vận hành', 
      value: busRunning, 
      icon: Bus, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 dark:bg-blue-950/40', 
      href: `/${locale}/facilities`,
      desc: '100% tài xế điểm danh'
    },
    { 
      label: 'Suất ăn hôm nay', 
      value: boardingMeals, 
      icon: Utensils, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 dark:bg-amber-950/40', 
      href: `/${locale}/facilities`,
      desc: 'Bếp ăn bán trú MIS'
    },
    { 
      label: 'Yêu cầu sửa chữa', 
      value: openRepairs, 
      icon: Activity, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50 dark:bg-indigo-950/40', 
      href: `/${locale}/facilities`,
      desc: 'CSVC cơ sở'
    },
    { 
      label: 'Sự vụ khẩn cấp', 
      value: 0, 
      icon: AlertTriangle, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50 dark:bg-rose-950/40', 
      href: `/${locale}/risk`,
      desc: 'Không có cảnh báo mới'
    },
  ];

  // Bus routes mock
  const hotBusRoutes = [
    { route: 'Tuyến số 02', driver: 'Nguyễn Văn Hùng', phone: '0912345678', students: 16, status: 'Đã hoàn thành', time: '07:20 AM' },
    { route: 'Tuyến số 05', driver: 'Trần Minh Quân', phone: '0987654321', students: 22, status: 'Đang vận hành', time: '07:45 AM' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bảng điều hành Dịch vụ Học đường</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Chào, <strong>{user?.name}</strong> · Bộ phận: {user?.title || 'Trưởng nhóm Dịch vụ vận hành'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/events`}>
            <Button className="bg-sky-600 hover:bg-sky-700 text-white gap-2 h-9">
              <ClipboardList className="h-4 w-4" /> Quản lý phản ánh
            </Button>
          </Link>
          <Link href={`/${locale}/facilities`}>
            <Button variant="outline" className="gap-2 h-9 border-sky-200 text-sky-700 dark:border-slate-800 dark:text-slate-350">
              <Bus className="h-4 w-4" /> Xe đưa đón & CSVC
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Link key={i} href={kpi.href} className="block group">
              <div className={cn(
                "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              )}>
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>
                  <Icon className={cn("h-4.5 w-4.5", kpi.color)} />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{kpi.value}</div>
                <div className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{kpi.label}</div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{kpi.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2 columns: Vận hành xe + Chăm sóc phụ huynh & Sự vụ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Xe đưa đón đưa đón */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bus className="h-4 w-4 text-blue-600" />
              Tuyến xe đưa đón hôm nay
            </CardTitle>
            <Link href={`/${locale}/facilities`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                Xem tất cả <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {hotBusRoutes.map((bus, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{bus.route}</span>
                      <Badge className={cn(
                        "text-[9px] font-bold border-0",
                        bus.status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      )}>
                        {bus.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Tài xế: {bus.driver} ({bus.phone})</div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{bus.students} HS</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{bus.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chăm sóc phụ huynh & Phản ánh */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b dark:border-slate-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-sky-600" />
              Phản ánh & Khảo sát ý kiến Phụ huynh
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b dark:border-slate-800">
                <span className="text-slate-500">Số phản ánh chưa giải quyết (Tickets):</span>
                <span className="font-bold text-sky-700">{openTickets} sự vụ</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b dark:border-slate-800">
                <span className="text-slate-500">Chỉ số vi phạm cam kết SLA dịch vụ:</span>
                <span className="font-bold text-rose-600">{overdueTickets} tickets trễ hạn</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Chỉ số hài lòng phụ huynh tuần qua:</span>
                <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">92.5% rất hài lòng</Badge>
              </div>
            </div>

            <div className="bg-sky-50/30 dark:bg-sky-950/10 p-3.5 rounded-xl border border-sky-100 dark:border-sky-900/30">
              <p className="text-xs font-bold text-sky-850 dark:text-sky-300">
                📢 Quy chế phản hồi SLA
              </p>
              <p className="text-[11px] text-sky-750 dark:text-sky-400 mt-1 leading-relaxed">
                Mọi phản ánh về dịch vụ xe bus hay bán trú cần được phản hồi lần đầu trong vòng 2 giờ và giải quyết dứt điểm dưới 24 giờ.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
