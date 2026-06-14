'use client';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import {
  Users,
  UserCheck,
  FileText,
  BookmarkCheck,
  GraduationCap,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';

interface DashboardStats {
  kpis: {
    newLeads: number;
    activeLeads: number;
    appsSubmitted: number;
    seatReserved: number;
    enrolled: number;
    seatReservationRevenue: number;
    conversionRate: number;
  };
  recentLeads: Array<{
    id: string;
    leadCode: string;
    fullName: string;
    phone: string;
    grade: string;
    status: string;
    createdAt: Date;
  }>;
}

interface DashboardClientProps {
  locale: string;
  stats: DashboardStats;
}

const statusBadgeStyles: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  contacted: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  consultation_scheduled: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
  application_submitted: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  seat_reserved: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  payment_confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  enrolled: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
  lost: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

const statusLabels: Record<string, string> = {
  new: 'Mới (New)',
  contacted: 'Đã liên hệ',
  consultation_scheduled: 'Hẹn tư vấn',
  application_submitted: 'Nộp đơn học',
  seat_reserved: 'Giữ chỗ',
  payment_confirmed: 'Đóng phí',
  enrolled: 'Nhập học',
  lost: 'Từ chối',
};

export default function DashboardClient({ locale, stats }: DashboardClientProps) {
  const { kpis, recentLeads } = stats;

  const cards = [
    {
      title: 'Mới (New Leads)',
      value: kpis.newLeads,
      icon: Users,
      description: 'Học sinh mới đăng ký',
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/50',
    },
    {
      title: 'Đang chăm sóc (Active Leads)',
      value: kpis.activeLeads,
      icon: UserCheck,
      description: 'Học sinh đang trong quy trình',
      color: 'from-cyan-500/10 to-teal-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100/50 dark:border-cyan-900/50',
    },
    {
      title: 'Đã nộp hồ sơ (Applications)',
      value: kpis.appsSubmitted,
      icon: FileText,
      description: 'Hồ sơ đã được gửi đi',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-900/50',
    },
    {
      title: 'Đã giữ chỗ (Seat Reserved)',
      value: kpis.seatReserved,
      icon: BookmarkCheck,
      description: 'Học sinh đã giữ chỗ nhập học',
      color: 'from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-100/50 dark:border-orange-900/50',
    },
    {
      title: 'Nhập học chính thức (Enrolled)',
      value: kpis.enrolled,
      icon: GraduationCap,
      description: 'Đã hoàn thành nhập học',
      color: 'from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 border-green-100/50 dark:border-green-900/50',
    },
    {
      title: 'Doanh thu giữ chỗ (Revenue)',
      value: `${kpis.seatReservationRevenue.toLocaleString('vi-VN')} đ`,
      icon: DollarSign,
      description: 'Doanh thu từ phí đặt cọc giữ chỗ',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Trang tổng quan tuyển sinh
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Giám sát các chỉ số KPI tuyển sinh, doanh thu và hồ sơ nhập học gần đây của trường.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/leads`}>
            <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 font-bold">
              Quản lý danh sách
            </Button>
          </Link>
          <Link href={`/${locale}/admissions`}>
            <Button size="sm" className="font-bold shadow-md">
              Bảng Pipeline Kanban <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className={`overflow-hidden border bg-gradient-to-br ${card.color} shadow-sm transition-all hover:shadow-md`}>
              <CardContent className="p-5 flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">{card.title}</span>
                  <div className="text-2xl font-black tracking-tight">{card.value}</div>
                  <p className="text-[11px] opacity-70 font-semibold">{card.description}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 shadow-sm border border-white/20">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Conversion Rate Custom Card */}
        <Card className="overflow-hidden border bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/50 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tỷ lệ chuyển đổi (Conversion)</span>
              <div className="text-2xl font-black tracking-tight">
                {stats.kpis.conversionRate.toFixed(2)}%
              </div>
              <p className="text-[11px] opacity-70 font-semibold">Tỷ lệ nhập học / Tổng hồ sơ</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 shadow-sm border border-white/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Split section: Recent Leads and Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 cols: Recent Leads */}
        <Card className="md:col-span-2 border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                Hồ sơ mới đăng ký gần đây
              </CardTitle>
              <CardDescription className="text-xs">
                Danh sách 5 học sinh đăng ký tuyển sinh mới nhất trong hệ thống.
              </CardDescription>
            </div>
            <Link href={`/${locale}/leads`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-blue-600 dark:text-blue-400">
                Xem tất cả <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-900/20 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="p-3 pl-5">Học sinh</th>
                    <th className="p-3">Khối</th>
                    <th className="p-3">SĐT</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {recentLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Chưa có học sinh nào đăng ký.
                      </td>
                    </tr>
                  ) : (
                    recentLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="p-3 pl-5 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex flex-col">
                            <span>{lead.fullName}</span>
                            <span className="font-mono text-[9px] text-slate-400 font-bold">
                              {lead.leadCode}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                          {lead.grade}
                        </td>
                        <td className="p-3 text-xs font-mono text-slate-650 dark:text-slate-400">
                          {lead.phone}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            className={cn(
                              'text-[9px] uppercase font-black tracking-wide border px-1.5 py-0.5',
                              statusBadgeStyles[lead.status]
                            )}
                          >
                            {statusLabels[lead.status] || lead.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Link href={`/${locale}/leads/${lead.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
                              Chi tiết
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 col: Quick Links and Resources */}
        <Card className="border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
              Lối tắt tác vụ nhanh
            </CardTitle>
            <CardDescription className="text-xs">
              Các phím tắt thực hiện tác vụ CRM nhanh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6 flex-1 flex flex-col justify-center">
            <Link href={`/${locale}/leads?create=true`} className="block">
              <Button className="w-full justify-start text-xs font-bold" variant="outline">
                <Plus className="mr-2 h-4 w-4 text-blue-500" /> Tạo hồ sơ ứng viên mới
              </Button>
            </Link>
            <Link href={`/${locale}/admissions`} className="block">
              <Button className="w-full justify-start text-xs font-bold" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" /> Cập nhật bảng Kanban
              </Button>
            </Link>
            <Link href={`/${locale}/payments`} className="block">
              <Button className="w-full justify-start text-xs font-bold" variant="outline">
                <DollarSign className="mr-2 h-4 w-4 text-amber-500" /> Thu học phí & Xác nhận
              </Button>
            </Link>
            <Link href={`/${locale}/reports`} className="block">
              <Button className="w-full justify-start text-xs font-bold" variant="outline">
                <FileText className="mr-2 h-4 w-4 text-indigo-500" /> Xem báo cáo chi tiết
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
