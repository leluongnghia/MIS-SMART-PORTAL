'use client';

import React, { useMemo } from 'react';
import {
  Calendar,
  CheckSquare,
  ClipboardCheck,
  Database,
  FileText,
  LineChart,
  Users,
  TrendingUp,
  Award,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Search,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  RefreshCw,
  MoreVertical,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function KhaoThiDashboard() {
  // Chart data for grading progress
  const progressData = [
    { name: '14/05', 'Đã chấm': 700, 'Chưa chấm': 3800, 'Mục tiêu': 4500 },
    { name: '15/05', 'Đã chấm': 1500, 'Chưa chấm': 3000, 'Mục tiêu': 4500 },
    { name: '16/05', 'Đã chấm': 2000, 'Chưa chấm': 2500, 'Mục tiêu': 4500 },
    { name: '17/05', 'Đã chấm': 2600, 'Chưa chấm': 1900, 'Mục tiêu': 4500 },
    { name: '18/05', 'Đã chấm': 3200, 'Chưa chấm': 1300, 'Mục tiêu': 4500 },
    { name: '19/05', 'Đã chấm': 3842, 'Chưa chấm': 658, 'Mục tiêu': 4500 },
    { name: '20/05', 'Đã chấm': 4100, 'Chưa chấm': 400, 'Mục tiêu': 4500 }
  ];

  // Pie chart data for academic results
  const pieData = [
    { name: 'Xuất sắc (>= 9.0)', value: 612, percentage: '15.9%', color: '#3b82f6' },
    { name: 'Giỏi (8.0 - 8.9)', value: 1026, percentage: '26.7%', color: '#10b981' },
    { name: 'Khá (6.5 - 7.9)', value: 1458, percentage: '37.9%', color: '#f59e0b' },
    { name: 'Trung bình (5.0 - 6.4)', value: 512, percentage: '13.3%', color: '#6366f1' },
    { name: 'Yếu (< 5.0)', value: 234, percentage: '6.1%', color: '#ef4444' }
  ];

  const totalExams = useMemo(() => pieData.reduce((acc, curr) => acc + curr.value, 0), []);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Kỳ kiểm tra', val: '24', change: '+ 14% so với cùng kỳ', color: 'bg-blue-500/10 text-blue-600', icon: Calendar },
          { title: 'Bài thi đã chấm', val: '3,842', change: '+ 18% so với cùng kỳ', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckSquare },
          { title: 'Tỷ lệ hoàn thành chấm thi', val: '92.5%', change: '+ 8.2% so với cùng kỳ', color: 'bg-amber-500/10 text-amber-600', icon: TrendingUp },
          { title: 'Khảo sát đã thực hiện', val: '12', change: '+ 20% so với cùng kỳ', color: 'bg-indigo-500/10 text-indigo-600', icon: Users },
          { title: 'Báo cáo ĐBCL', val: '8', change: '+ 33% so với cùng kỳ', color: 'bg-cyan-500/10 text-cyan-600', icon: FileText },
          { title: 'Tiêu chí đạt chuẩn', val: '78.4%', change: '+ 6.1% so với cùng kỳ', color: 'bg-rose-500/10 text-rose-600', icon: Award }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="border border-slate-100 hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.title}</p>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{item.val}</h3>
                  <p className="text-[10px] text-emerald-650 font-bold mt-1 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {item.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Row 1: Upcoming exams, Chart, Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Lịch kiểm tra sắp tới (4 cols) */}
        <Card className="lg:col-span-4 border border-slate-150 bg-white dark:bg-slate-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Lịch kiểm tra sắp tới
            </CardTitle>
            <Button variant="ghost" className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 h-auto">Xem tất cả</Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { day: '22', month: 'Th05', title: 'Kiểm tra giữa kỳ II - Toán 10', details: 'Khối 10   07:30 - 09:00   Phòng A101 - A120' },
              { day: '23', month: 'Th05', title: 'Kiểm tra giữa kỳ II - Ngữ văn 11', details: 'Khối 11   07:30 - 09:30   Phòng B201 - B220' },
              { day: '24', month: 'Th05', title: 'Kiểm tra giữa kỳ II - Tiếng Anh 12', details: 'Khối 12   07:30 - 09:00   Phòng C301 - C320' },
              { day: '26', month: 'Th05', title: 'Kiểm tra giữa kỳ II - Vật lý 10', details: 'Khối 10   07:30 - 09:00   Phòng A121 - A140' },
              { day: '27', month: 'Th05', title: 'Kiểm tra giữa kỳ II - Hóa học 11', details: 'Khối 11   07:30 - 09:00   Phòng B221 - B240' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-12 h-12 shrink-0">
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{item.day}</span>
                  <span className="text-[9px] font-extrabold text-slate-400 mt-1 uppercase tracking-wider">{item.month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.details}</p>
                </div>
                <Badge className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 shrink-0">Sắp diễn ra</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Column 2: Tiến độ chấm thi (5 cols) */}
        <Card className="lg:col-span-5 border border-slate-150 bg-white dark:bg-slate-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-emerald-600" />
              Tiến độ chấm thi
            </CardTitle>
            <select className="text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-350">
              <option>7 ngày qua</option>
            </select>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={progressData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                    labelStyle={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}
                    itemStyle={{ fontSize: '10px', padding: '2px 0' }}
                  />
                  <Area type="monotone" dataKey="Đã chấm" fill="#dbeafe" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Chưa chấm" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="Mục tiêu" stroke="#94a3b8" strokeWidth={1} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-650">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                Đã chấm
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-650">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
                Chưa chấm
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-650">
                <span className="w-3 h-3 rounded bg-slate-400 inline-block"></span>
                Mục tiêu
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column 3: Hoạt động gần đây (3 cols) */}
        <Card className="lg:col-span-3 border border-slate-150 bg-white dark:bg-slate-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-650" />
              Hoạt động gần đây
            </CardTitle>
            <Button variant="ghost" className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 h-auto">Xem tất cả</Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[
              { name: 'Lê Hồng Nhung', action: 'đã tạo kỳ thi mới', detail: 'Kiểm tra cuối học kỳ II - Lớp 12', time: '15 phút trước', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
              { name: 'Trần Minh Đức', action: 'đã hoàn thành chấm thi', detail: 'Kiểm tra giữa kỳ II - Toán 10', time: '45 phút trước', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
              { name: 'Phạm Thu Hằng', action: 'đã phê duyệt đề thi', detail: 'Đề thi giữa kỳ II - Ngữ văn 11', time: '1 giờ trước', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
              { name: 'Nguyễn Hoàng Nam', action: 'đã cập nhật minh chứng', detail: 'Tiêu chuẩn 2.3 - Cơ sở vật chất', time: '2 giờ trước', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
              { name: 'Vũ Thanh Tùng', action: 'đã gửi báo cáo ĐBCL', detail: 'Báo cáo tự đánh giá năm học 2024-2025', time: '3 giờ trước', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' }
            ].map((act, idx) => (
              <div key={idx} className="flex gap-3 text-xs leading-normal">
                <img src={act.avatar} alt={act.name} className="w-7 h-7 rounded-full object-cover shrink-0 animate-fade-in" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    <span className="font-black text-slate-900 dark:text-white">{act.name}</span> {act.action}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{act.detail}</p>
                  <span className="text-[9px] text-slate-400 font-bold mt-1 block">{act.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Surveys, Results, DBCL Standards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Khảo sát đang diễn ra */}
        <Card className="border border-slate-150 bg-white dark:bg-slate-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Khảo sát đang diễn ra</CardTitle>
            <Button variant="ghost" className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 h-auto">Xem tất cả</Button>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {[
              { label: 'Khảo sát hài lòng của sinh viên', progress: 72 },
              { label: 'Khảo sát giảng dạy của giảng viên', progress: 65 },
              { label: 'Khảo sát chương trình đào tạo', progress: 40 }
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="truncate pr-4">{item.label}</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.progress}%` }}></div>
                </div>
                <div className="text-[10px] text-slate-450 font-bold">Tỷ lệ hoàn thành</div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Tổng số khảo sát: 5</span>
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Kết quả học tập tổng quan */}
        <Card className="border border-slate-150 bg-white dark:bg-slate-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Kết quả học tập tổng quan</CardTitle>
            <Button variant="ghost" className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 h-auto">Xem báo cáo</Button>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-between w-full gap-4">
              {/* Donut chart */}
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-black text-slate-800 dark:text-slate-100">3,842</span>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Tổng bài thi</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="flex-1 space-y-1.5">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-650 dark:text-slate-350">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                      <span className="truncate max-w-[100px]">{item.name.split(' (')[0]}</span>
                    </div>
                    <span className="font-extrabold text-slate-850 dark:text-white">{item.value} ({item.percentage})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column 3: Tiêu chí ĐBCL */}
        <Card className="border border-slate-150 bg-white dark:bg-slate-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Tiêu chí ĐBCL</CardTitle>
            <Button variant="ghost" className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 h-auto">Xem chi tiết</Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { label: '1. Chiến lược & Quản trị', val: 85 },
              { label: '2. Chương trình đào tạo', val: 78 },
              { label: '3. Giảng viên', val: 82 },
              { label: '4. Người học', val: 75 },
              { label: '5. Cơ sở vật chất', val: 70 }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  <span>{item.label}</span>
                  <span>{item.val}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-indigo-50 h-1.5 rounded-full" style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-extrabold text-slate-600 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
              <span className="text-emerald-700 dark:text-emerald-450">Tổng mức đạt:</span>
              <span className="text-emerald-800 dark:text-emerald-400 text-sm">78.4%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Table Kỳ thi gần đây */}
      <Card className="border border-slate-150 bg-white dark:bg-slate-950">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800">
          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Kỳ thi gần đây</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="w-7 h-7 rounded-lg"><Plus className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider text-[9px] border-b border-slate-100 dark:border-slate-800">
                <th className="p-3 pl-4">Tên kỳ thi</th>
                <th className="p-3">Khối/Lớp</th>
                <th className="p-3">Môn thi</th>
                <th className="p-3">Ngày thi</th>
                <th className="p-3 text-right">Số bài thi</th>
                <th className="p-3 text-right">Đã chấm</th>
                <th className="p-3 text-right">Chưa chấm</th>
                <th className="p-3 w-40">Tiến độ</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
              {[
                { title: 'Kiểm tra giữa kỳ II', grade: 'Khối 10', subject: 'Toán', date: '15/05/2025', total: '1,120', graded: '1,020', remaining: '100', progress: 91, status: 'Đang chấm', statusColor: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' },
                { title: 'Kiểm tra giữa kỳ II', grade: 'Khối 11', subject: 'Ngữ văn', date: '16/05/2025', total: '1,050', graded: '945', remaining: '105', progress: 90, status: 'Đang chấm', statusColor: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' },
                { title: 'Kiểm tra giữa kỳ II', grade: 'Khối 12', subject: 'Tiếng Anh', date: '17/05/2025', total: '980', graded: '875', remaining: '105', progress: 89, status: 'Đang chấm', statusColor: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' }
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors text-slate-700 dark:text-slate-300">
                  <td className="p-3 pl-4 font-bold text-slate-800 dark:text-slate-200">{item.title}</td>
                  <td className="p-3 font-medium">{item.grade}</td>
                  <td className="p-3 font-semibold text-slate-650 dark:text-slate-400">{item.subject}</td>
                  <td className="p-3 font-medium">{item.date}</td>
                  <td className="p-3 text-right font-bold">{item.total}</td>
                  <td className="p-3 text-right font-bold text-emerald-600">{item.graded}</td>
                  <td className="p-3 text-right font-bold text-rose-500">{item.remaining}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.progress}%` }}></div>
                      </div>
                      <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400 shrink-0">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-slate-400 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-slate-400 hover:text-amber-600"><Edit2 className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-slate-400 hover:text-red-650"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
