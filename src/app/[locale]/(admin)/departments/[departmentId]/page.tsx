'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { 
  CheckSquare, 
  AlertTriangle, 
  BookOpen, 
  CalendarDays, 
  Users, 
  ClipboardCheck, 
  TrendingUp
} from 'lucide-react';
import { WORKSPACES } from '@/src/mockData';
import { 
  MOCK_DEPT_TASKS, 
  MOCK_LESSON_PLANS, 
  MOCK_LEAVE_REQUESTS, 
  MOCK_DIRECTIVES, 
  MOCK_DEPT_MEMBERS 
} from '@/src/libs/mock-data/department-mock';
import { use } from 'react';

export default function DepartmentOverviewPage({ params }: { params: Promise<{ departmentId: string }> }) {
  const { departmentId } = use(params);
  const departmentName = WORKSPACES.find(w => w.id === departmentId)?.name || 'Bộ phận';

  const stats = {
    totalTasks: MOCK_DEPT_TASKS.length,
    inProgressTasks: MOCK_DEPT_TASKS.filter(t => t.status === 'IN_PROGRESS').length,
    overdueTasks: MOCK_DEPT_TASKS.filter(t => t.status === 'OVERDUE').length,
    pendingDirectives: MOCK_DIRECTIVES.filter(d => d.status === 'IN_PROGRESS' || d.status === 'NEW').length,
    pendingLessonPlans: MOCK_LESSON_PLANS.filter(lp => lp.status === 'PENDING_REVIEW').length,
    pendingLeaves: MOCK_LEAVE_REQUESTS.filter(l => l.status === 'PENDING_DEPT').length,
    activeMembers: MOCK_DEPT_MEMBERS.filter(m => m.status === 'ONLINE').length,
    totalMembers: MOCK_DEPT_MEMBERS.length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Tổng quan {departmentName}</h1>
        <p className="text-sm text-slate-500 mt-1">Thông tin vận hành và tiến độ công việc nội bộ</p>
      </div>

      {stats.overdueTasks > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Cảnh báo công việc quá hạn</h3>
            <p className="text-sm mt-1">Hiện có {stats.overdueTasks} công việc đã quá hạn. Đề nghị các thành viên cập nhật tiến độ và hoàn thành sớm.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">Công việc</p>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.inProgressTasks}</span>
              <span className="text-sm font-bold text-slate-500 ml-1">/ {stats.totalTasks}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">Đang xử lý</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-amber-600 dark:text-amber-300">Chỉ đạo BGH</p>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                <ClipboardCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.pendingDirectives}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">Chờ phản hồi</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Giáo án</p>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.pendingLessonPlans}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">Chờ phê duyệt</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-950/20 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-purple-600 dark:text-purple-300">Nhân sự</p>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeMembers}</span>
              <span className="text-sm font-bold text-slate-500 ml-1">/ {stats.totalMembers}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">Đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-none border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold">Việc cần xử lý hôm nay</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_DEPT_TASKS.slice(0, 4).map(task => (
                <div key={task.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full shrink-0 bg-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Phụ trách: <span className="font-semibold text-slate-700 dark:text-slate-300">{task.assigneeName}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded">Hạn: {task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium"><span className="font-bold text-slate-900 dark:text-white">Lê Văn C</span> đã nộp giáo án Tin học 11 Tuần 5</p>
                  <p className="text-xs text-slate-500 mt-1">2 giờ trước</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium"><span className="font-bold text-slate-900 dark:text-white">Trần Thị B</span> đã hoàn thành Soạn ma trận đề kiểm tra Giữa kì 1</p>
                  <p className="text-xs text-slate-500 mt-1">5 giờ trước</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium"><span className="font-bold text-slate-900 dark:text-white">BGH</span> đã giao chỉ đạo Triển khai chuyên đề cấp cụm</p>
                  <p className="text-xs text-slate-500 mt-1">1 ngày trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
