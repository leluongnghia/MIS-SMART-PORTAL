'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  Filter,
  Plus,
  MoreVertical,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Paperclip
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const taskStatsData = [
  { name: 'Cần làm', value: 12, color: '#3b82f6' },
  { name: 'Đang xử lý', value: 22, color: '#f59e0b' },
  { name: 'Chờ duyệt', value: 14, color: '#8b5cf6' },
  { name: 'Hoàn thành', value: 21, color: '#10b981' },
];

export default function TasksDashboard() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'vi';

  useEffect(() => {
    const userId = localStorage.getItem('mis_edutask_logged_in_user_id');
    const loggedIn = localStorage.getItem('mis_edutask_logged_in') === 'true';
    if (!loggedIn || !userId) return;
    // Dynamically import to avoid server-side issues
    import('@/src/mockData').then(({ MOCK_USERS }) => {
      const user = MOCK_USERS.find(u => u.id === userId);
      if (user && user.workspaceId && user.workspaceId !== 'BGH' && user.workspaceId !== 'KHAO_THI' && user.workspaceId !== 'TUYEN_SINH_PR' && user.role !== 'ADMIN') {
        router.replace(`/${locale}/dashboard?tab=tasks`);
      }
    });
  }, [locale, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Công việc & Quy trình phê duyệt
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý công việc, theo dõi tiến độ và các quy trình phê duyệt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Tất cả quy trình</option>
          </select>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:bg-slate-900 dark:border-slate-700">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>12/05/2025 - 16/05/2025</span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-100 shadow-sm dark:border-blue-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Việc đang thực hiện</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">38</h3>
                  <span className="text-xs font-medium text-emerald-600">↑ 8 so với tuần trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm dark:border-orange-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quá hạn</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">9</h3>
                  <span className="text-xs font-medium text-red-500">↑ 3 so với tuần trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm dark:border-purple-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Chờ phê duyệt</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">14</h3>
                  <span className="text-xs font-medium text-emerald-600">↑ 4 so với tuần trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm dark:border-emerald-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tỷ lệ hoàn thành</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">78%</h3>
                  <span className="text-xs font-medium text-emerald-600">↑ 6% so với tuần trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50">Xem chi tiết</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Kanban Board */}
        <Card className="xl:col-span-5 flex flex-col h-[700px]">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base font-bold">Bảng công việc</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Nhóm theo:</span>
              <select className="bg-transparent font-medium border-0 focus:ring-0 p-0">
                <option>Trạng thái</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-x-auto custom-scrollbar flex gap-4 bg-slate-50/50 dark:bg-slate-900/30">
            {/* Columns */}
            {[
              { 
                title: 'Cần làm', count: 12, colBg: 'bg-slate-100 dark:bg-slate-800', 
                cards: [
                  { title: 'Xây dựng kế hoạch ôn thi học kỳ II', user: 'Trần Thị Mai', date: '20/05/2025', tag: 'Cao', tagCol: 'bg-red-50 text-red-600' },
                  { title: 'Chuẩn bị tài liệu tập huấn Giáo viên', user: 'Lê Văn Hùng', date: '22/05/2025', tag: 'Trung bình', tagCol: 'bg-orange-50 text-orange-600' },
                  { title: 'Kiểm tra CSVC định kỳ TS/2025', user: 'Phạm Quang Minh', date: '25/05/2025', tag: '', tagCol: '' },
                ] 
              },
              { 
                title: 'Đang xử lý', count: 11, colBg: 'bg-blue-50 dark:bg-blue-900/20', 
                cards: [
                  { title: 'Tổng hợp kết quả học tập HKII', user: 'Nguyễn Thị Lan', date: '19/05/2025', tag: 'Cao', tagCol: 'bg-red-50 text-red-600' },
                  { title: 'Triển khai khảo sát hài lòng PHHS', user: 'Đỗ Mạnh Cường', date: '21/05/2025', tag: 'Trung bình', tagCol: 'bg-orange-50 text-orange-600' },
                  { title: 'Báo cáo chuyên đề STEM 2025', user: 'Hoàng Thị Ngọc', date: '23/05/2025', tag: 'Trung bình', tagCol: 'bg-orange-50 text-orange-600' },
                ] 
              },
              { 
                title: 'Chờ duyệt', count: 7, colBg: 'bg-purple-50 dark:bg-purple-900/20', 
                cards: [
                  { title: 'Đề xuất mua sắm thiết bị CNTT', user: 'Phạm Quang Minh', date: '16/05/2025', tag: 'Cao', tagCol: 'bg-red-50 text-red-600' },
                  { title: 'Kế hoạch tổ chức Ngày hội STEM', user: 'Trần Thị Mai', date: '17/05/2025', tag: 'Trung bình', tagCol: 'bg-orange-50 text-orange-600' },
                  { title: 'Quy chế chi tiêu nội bộ năm học 2025-2026', user: 'Nguyễn Văn Nam', date: '18/05/2025', tag: 'Cao', tagCol: 'bg-red-50 text-red-600' },
                ] 
              },
              { 
                title: 'Hoàn thành', count: 28, colBg: 'bg-emerald-50 dark:bg-emerald-900/20', 
                cards: [
                  { title: 'Báo cáo công tác tháng 4/2025', user: 'Lê Văn Hùng', date: '12/05/2025', tag: 'Thấp', tagCol: 'bg-emerald-50 text-emerald-600' },
                  { title: 'Tập huấn PCCC cho CB-GV-NV', user: 'Phạm Quang Minh', date: '10/05/2025', tag: 'Thấp', tagCol: 'bg-emerald-50 text-emerald-600' },
                  { title: 'Cập nhật dữ liệu học sinh lớp 10', user: 'Đỗ Mạnh Cường', date: '09/05/2025', tag: 'Thấp', tagCol: 'bg-emerald-50 text-emerald-600' },
                ] 
              },
            ].map((col, i) => (
              <div key={i} className="min-w-[240px] w-[240px] flex flex-col gap-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {col.title} <Badge  className={cn("px-1.5 py-0", col.title === 'Cần làm' ? 'bg-blue-100 text-blue-700' : col.title === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' : col.title === 'Chờ duyệt' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>{col.count}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {col.cards.map((card, j) => (
                    <div key={j} className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative group cursor-grab">
                      <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100"><MoreVertical className="h-3 w-3" /></Button>
                      <h4 className="text-xs font-bold leading-snug pr-6 mb-2">{card.title}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                        <UserCircle className="h-3 w-3" /> {card.user}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-3">
                        <CalendarIcon className="h-3 w-3" /> {card.date}
                      </div>
                      <div className="flex justify-between items-end">
                        {card.tag ? <Badge  className={cn("text-[9px] py-0 border-0", card.tagCol)}>{card.tag}</Badge> : <div />}
                        <div className="flex -space-x-1">
                          <img src={`https://i.pravatar.cc/150?u=${i}${j}1`} className="w-5 h-5 rounded-full border border-white dark:border-slate-950 object-cover" />
                          <img src={`https://i.pravatar.cc/150?u=${i}${j}2`} className="w-5 h-5 rounded-full border border-white dark:border-slate-950 object-cover" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-xs text-blue-600 gap-1 mt-2 bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800">
                    <Plus className="h-3 w-3" /> Thêm công việc
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Middle: Process Detail */}
        <Card className="xl:col-span-4 h-[700px] flex flex-col">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Quy trình phê duyệt</CardTitle>
            <a href="#" className="text-xs font-medium text-blue-600">Xem tất cả</a>
          </CardHeader>
          <CardContent className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-bold text-sm">Quy trình: Đề xuất mua sắm thiết bị CNTT</h3>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[10px] px-1.5 py-0">Đang thực hiện</Badge>
            </div>
            
            {/* Timeline Graphic */}
            <div className="relative flex justify-between mb-8 px-4">
              <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800" />
              <div className="absolute top-4 left-6 h-1 bg-blue-600" style={{ width: '50%' }} />
              
              {[
                { step: 1, name: 'Lập đề xuất', user: 'Trần Thị Mai', date: '15/05/2025 09:12', active: false, done: true, sla: 'SLA 1 ngày' },
                { step: 2, name: 'Trưởng bộ phận', user: 'Phạm Quang Minh', date: '15/05/2025 14:20', active: false, done: true, sla: 'SLA 2 ngày' },
                { step: 3, name: 'Phó Hiệu trưởng', user: 'Nguyễn Văn Nam', date: 'Hạn: 16/05/2025 17:00', active: true, done: false, sla: 'SLA 1 ngày' },
                { step: 4, name: 'Hiệu trưởng', user: 'Chờ xử lý', date: '', active: false, done: false },
                { step: 5, name: 'Hoàn tất', user: 'Chờ xử lý', date: '', active: false, done: false },
              ].map((s, i) => (
                <div key={i} className="relative flex flex-col items-center z-10 w-16">
                  {s.sla && <div className="absolute -top-6 text-[9px] text-slate-400 whitespace-nowrap">{s.sla}</div>}
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ring-4 ring-white dark:ring-slate-950", 
                    s.done ? "bg-blue-600 border-blue-600 text-white" : 
                    s.active ? "bg-orange-500 border-orange-500 text-white" : 
                    "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                  )}>
                    {s.done ? <FileText className="h-4 w-4" /> : s.step}
                  </div>
                  <div className="text-center mt-2">
                    <p className={cn("text-[10px] font-bold leading-tight", s.active ? "text-orange-600" : "text-slate-700 dark:text-slate-300")}>{s.name}</p>
                    <p className="text-[9px] text-slate-500 truncate w-20">{s.user}</p>
                    {s.date && <p className={cn("text-[9px]", s.active ? "text-orange-600 font-medium" : "text-slate-400")}>{s.date}</p>}
                    {s.done && <CheckCircle2 className="h-3 w-3 text-emerald-500 mx-auto mt-1" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-4">
                <h4 className="text-xs font-bold">Thông tin đề xuất</h4>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Mã đề xuất</span><span className="font-medium">DXMS-2025-0007</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Người đề xuất</span><span className="font-medium">Trần Thị Mai</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Phòng/Bộ phận</span><span className="font-medium">Tin học</span></div>
                  <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Ngày tạo</span><span className="font-medium">15/05/2025 09:12</span></div>
                  <div className="grid grid-cols-1 gap-1"><span className="text-slate-500">Mục đích</span><p className="text-slate-700 dark:text-slate-300">Trang bị bổ sung máy tính phục vụ giảng dạy và học tập.</p></div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold">Tệp đính kèm</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/50">
                    <FileText className="h-4 w-4 text-red-500 shrink-0" />
                    <div className="min-w-0 flex-1"><p className="text-[10px] font-medium truncate">De_xuat_mua_sam_CNTT.pdf</p><p className="text-[9px] text-slate-400">(1.2 MB)</p></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/50">
                    <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1"><p className="text-[10px] font-medium truncate">Bao_gia_thiet_bi.pdf</p><p className="text-[9px] text-slate-400">(812 KB)</p></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/50">
                    <Paperclip className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="min-w-0 flex-1"><p className="text-[10px] font-medium truncate">Cau_hinh_ky_thuat.xlsx</p><p className="text-[9px] text-slate-400">(256 KB)</p></div>
                  </div>
                  <a href="#" className="text-[10px] font-bold text-blue-600 block pt-1">Xem tất cả (3)</a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="xl:col-span-3 space-y-6 h-[700px] flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="p-4 pb-0 border-b border-transparent">
              <CardTitle className="text-base font-bold">Danh sách chờ phê duyệt</CardTitle>
            </CardHeader>
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 font-bold text-xs gap-4">
              <button className="pb-2 border-b-2 border-blue-600 text-blue-600">Của tôi (6)</button>
              <button className="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700">Tất cả (14)</button>
            </div>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { title: 'Đề xuất mua sắm thiết bị CNTT', code: 'DXMS-2025-0007 · Tin học', user: 'Trần Thị Mai', deadline: 'Hạn: 16/05/2025 17:00' },
                { title: 'Kế hoạch tổ chức Ngày hội STEM', code: 'KH-STEM-2025-002 · Đoàn trường', user: 'Trần Thị Mai', deadline: 'Hạn: 17/05/2025 17:00' },
                { title: 'Quy chế chi tiêu nội bộ 2025-2026', code: 'QCCT-2025-001 · Kế toán', user: 'Nguyễn Văn Nam', deadline: 'Hạn: 18/05/2025 17:00' },
              ].map((appr, i) => (
                <div key={i} className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{appr.title}</h4>
                    <p className="text-[10px] text-slate-500">{appr.code}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><UserCircle className="h-3 w-3" /> {appr.user}</span>
                    <span className="text-red-500 font-medium">{appr.deadline}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-xs">Duyệt</Button>
                    <Button variant="outline" className="flex-1 h-7 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs">Từ chối</Button>
                  </div>
                </div>
              ))}
              <div className="p-3 text-center">
                <Button variant="ghost" className="text-xs font-bold text-blue-600 h-auto p-0">Xem thêm (3) <ChevronRight className="h-3 w-3 ml-1" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Lịch</CardTitle>
            <div className="text-xs font-bold">Tháng 5, 2025</div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center text-slate-500 text-sm py-8 border border-dashed rounded-lg">Calendar Placeholder</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Hạn chót sắp tới</CardTitle>
            <a href="#" className="text-xs font-medium text-blue-600">Xem tất cả</a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { title: 'Đề xuất mua sắm thiết bị CNTT', user: 'Phê duyệt bởi: Nguyễn Văn Nam', deadline: 'Hạn: Hôm nay 17:00', tag: 'Quá hạn', tagCol: 'text-red-600 bg-red-50' },
                { title: 'Kế hoạch tổ chức Ngày hội STEM', user: 'Phê duyệt bởi: Nguyễn Văn Nam', deadline: 'Hạn: 1 ngày nữa', tag: 'Sắp đến hạn', tagCol: 'text-orange-600 bg-orange-50' },
                { title: 'Quy chế chi tiêu nội bộ 2025-2026', user: 'Phê duyệt bởi: Nguyễn Văn Nam', deadline: 'Hạn: 2 ngày nữa', tag: 'Sắp đến hạn', tagCol: 'text-orange-600 bg-orange-50' },
              ].map((item, i) => (
                <div key={i} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0">D</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.user}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <span className={cn("text-[10px] font-medium", item.deadline.includes('Hôm nay') ? "text-red-500" : "text-orange-500")}>{item.deadline}</span>
                    <Badge  className={cn("border-0 text-[9px] px-1.5 py-0 mt-0.5", item.tagCol)}>{item.tag}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Thống kê theo trạng thái</CardTitle>
            <a href="#" className="text-xs font-medium text-blue-600">Xem báo cáo</a>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {taskStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{fontSize: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900 dark:text-white">69</span>
                <span className="text-[9px] text-slate-500">Tổng công việc</span>
              </div>
            </div>
            <div className="space-y-3 text-xs w-32">
              {taskStatsData.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {item.value} <span className="text-[9px] text-slate-400 font-normal">({Math.round((item.value / 69) * 100)}%)</span>
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
