'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TrendingUp, Users, Calendar, Phone, DollarSign, BarChart2, ClipboardList, ArrowRight, Plus, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export default function DashboardTuyenSinh({ data, user }: { data: any; user: any }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';
  const funnel = data?.funnel || [];
  const tiepCan = funnel[0]?.value || 0;
  const nhapHoc = funnel[4]?.value || 0;
  const tuVan = funnel[2]?.value || 0;
  const dangKy = funnel[3]?.value || 0;
  const convRate = tiepCan > 0 ? ((nhapHoc / tiepCan) * 100).toFixed(1) : '0';
  const pendingApprovals = data?.alerts?.pendingApprovalsCount || 0;
  const openTasks = data?.alerts?.openTasksCount || 0;
  const overdueTasks = data?.alerts?.overdueTasksCount || 0;
  const upcomingEvents = data?.alerts?.upcomingEventsCount || 0;

  const kpis = [
    { label: 'Lead mới (tháng)', value: tiepCan, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40', href: `/${locale}/admissions` },
    { label: 'Đang tư vấn', value: tuVan, icon: Phone, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', href: `/${locale}/admissions?tab=pipeline` },
    { label: 'Đã đăng ký', value: dangKy, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', href: `/${locale}/admissions?tab=pipeline` },
    { label: 'Đã nhập học', value: nhapHoc, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', href: `/${locale}/admissions` },
    { label: 'Tỉ lệ chuyển đổi', value: `${convRate}%`, icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40', href: `/${locale}/admissions` },
    { label: 'Sự kiện sắp tới', value: upcomingEvents, icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40', href: `/${locale}/events` },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Tuyển sinh</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Chào, <strong>{user?.name}</strong> · {user?.title || 'Nhân viên Tuyển sinh'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/admissions`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9">
              <Plus className="h-4 w-4" /> Thêm Lead mới
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
                <div className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5 leading-tight">{kpi.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2 cột: Funnel + Công việc */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Funnel tuyển sinh */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 border-b dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Phễu Tuyển sinh
              </CardTitle>
              <Link href={`/${locale}/admissions`}>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                  Chi tiết <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {funnel.map((stage: any, i: number) => {
              const maxVal = funnel[0]?.value || 1;
              const pct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0;
              const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-green-600'];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{stage.label}</span>
                    <span className="font-black text-slate-900 dark:text-white">{stage.value} <span className="font-normal text-slate-400">({stage.pct})</span></span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", colors[i])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Công việc & Cảnh báo */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 border-b dark:border-slate-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-700" />
              Công việc & Nhắc nhở
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{openTasks}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" /> Đang mở
                </div>
              </div>
              <div className="rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-3 text-center">
                <div className="text-2xl font-black text-red-600 dark:text-red-400">{overdueTasks}</div>
                <div className="text-[10px] font-bold text-red-500 uppercase mt-0.5 flex items-center justify-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Quá hạn
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-3.5">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                💡 Gợi ý hôm nay
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Bạn có <strong>{tuVan}</strong> lead đang trong giai đoạn tư vấn. Hãy theo dõi và cập nhật trạng thái để không bỏ lỡ cơ hội chốt nhập học.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Link href={`/${locale}/tasks`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs h-8">Nhiệm vụ của tôi</Button>
              </Link>
              <Link href={`/${locale}/admissions?tab=calendar`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs h-8">Lịch hẹn</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
