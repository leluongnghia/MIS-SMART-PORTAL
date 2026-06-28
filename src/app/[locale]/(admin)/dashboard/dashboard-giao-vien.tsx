'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  ClipboardList, 
  FileCheck,
  Award,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';

export default function DashboardGiaoVien({ data, user }: { data: any; user: any }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  // Extract from user / data or fall back to high-fidelity mocks for educational workflow
  const openTasks = data?.alerts?.openTasksCount || 4;
  const overdueTasks = data?.alerts?.overdueTasksCount || 0;
  const docsToReview = data?.alerts?.documentsToReviewCount || 1;

  // Let's customize details based on subject
  const subjectName = user?.subject || user?.title?.replace('Giáo viên ', '') || 'Toán học';
  const homeroomClass = user?.homeroomClassId || '10A1';

  // Mock educational stats
  const classesTaught = ['10A1', '10A2', '11D1', '12A1'];
  const studentCount = 152;
  const lessonPlansThisWeek = 3;
  const periodsToday = 3;

  const kpis = [
    { 
      label: 'Lớp phụ trách', 
      value: classesTaught.length, 
      icon: GraduationCap, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      desc: classesTaught.join(', ')
    },
    { 
      label: 'Tổng học sinh', 
      value: studentCount, 
      icon: UserCheck, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      desc: 'Quản lý chuyên môn'
    },
    { 
      label: 'Tiết dạy hôm nay', 
      value: periodsToday, 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      desc: 'Hôm nay: Tiết 1, 2, 4'
    },
    { 
      label: 'Giáo án tuần này', 
      value: lessonPlansThisWeek, 
      icon: BookOpen, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      desc: 'Tất cả đã duyệt'
    },
    { 
      label: 'Nhiệm vụ đang mở', 
      value: openTasks, 
      icon: ClipboardList, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      desc: `${overdueTasks} việc quá hạn`
    },
    { 
      label: 'Kiểm tra & Rà soát', 
      value: docsToReview, 
      icon: FileCheck, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      desc: 'Học liệu cần kiểm định'
    },
  ];

  // Schedule for today
  const todaySchedule = [
    { period: 'Tiết 1 (7:30 - 8:15)', class: '10A1', room: 'Phòng 201', subject: subjectName, topic: 'Khảo sát hàm số (Luyện tập)' },
    { period: 'Tiết 2 (8:25 - 9:10)', class: '10A1', room: 'Phòng 201', subject: subjectName, topic: 'Hàm số bậc nhất và bậc hai' },
    { period: 'Tiết 4 (10:05 - 10:50)', class: '11D1', room: 'Phòng 304', subject: subjectName, topic: 'Hình học không gian - Vectơ' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Không gian chuyên môn Giáo viên</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Chào Thầy/Cô, <strong>{user?.name}</strong> · Tổ chuyên môn: {user?.roleName || 'Toán - Tin học'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => alert('Chức năng Soạn giáo án trực tuyến đang phát triển')} className="bg-indigo-650 hover:bg-indigo-750 text-white gap-2 h-9">
            <BookOpen className="h-4 w-4" /> Soạn giáo án mới
          </Button>
          <Button onClick={() => alert('Chức năng Nhập điểm nhanh đang phát triển')} variant="outline" className="gap-2 h-9 border-indigo-200 text-indigo-700 dark:border-slate-800 dark:text-slate-350">
            <Award className="h-4 w-4" /> Nhập điểm nhanh
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-3xs transition-all duration-200 hover:-translate-y-0.5">
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>
                <Icon className={cn("h-4.5 w-4.5", kpi.color)} />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{kpi.value}</div>
              <div className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{kpi.label}</div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{kpi.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Layout details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Lịch dạy hôm nay */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 xl:col-span-2 shadow-xs">
          <CardHeader className="pb-3 border-b dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-650" />
              Lịch giảng dạy hôm nay
            </CardTitle>
            <Badge className="bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {todaySchedule.map((slot, idx) => (
                <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md shrink-0 mt-0.5">
                      {slot.period.split(' ')[0]} {slot.period.split(' ')[1]}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Lớp: {slot.class} ({slot.room})</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Nội dung: {slot.topic}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      {slot.subject}
                    </Badge>
                    <Button onClick={() => alert('Chức năng Điểm danh lớp học đang phát triển')} size="sm" className="h-6.5 text-[10px] bg-slate-900 hover:bg-slate-800 text-white rounded-md">
                      Điểm danh
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Học homeroom & Lớp của tôi */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b dark:border-slate-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              Lớp chủ nhiệm {homeroomClass}
            </CardTitle>
            <CardDescription className="text-[11px]">Sĩ số: 38 học sinh · 2 cán sự lớp</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Chưa đóng học phí tháng:</span>
                <span className="font-bold text-red-600">3 học sinh</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Nghỉ học hôm nay:</span>
                <span className="font-bold text-amber-600">1 học sinh (có phép)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Đánh giá rèn luyện tuần:</span>
                <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">Tốt (Hạng A)</Badge>
              </div>
            </div>

            <div className="bg-emerald-50/20 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-950/20 space-y-1.5">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-350 block">Nhắc nhở nề nếp</span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Cuối tuần này cần hoàn tất cập nhật học bạ số và nhận xét nề nếp tuần cho 38 học sinh lớp chủ nhiệm {homeroomClass}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
