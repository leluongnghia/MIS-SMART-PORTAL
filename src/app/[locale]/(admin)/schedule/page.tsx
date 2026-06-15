'use client';

import {
  CalendarDays,
  DoorOpen,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  MapPin,
  UserCircle,
  Users,
  Plus,
  SettingsIcon,
  Circle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const roomUsageData = [
  { name: 'Đang dùng', value: 28, color: '#2563eb' },
  { name: 'Trống', value: 12, color: '#10b981' },
  { name: 'Bảo trì', value: 2, color: '#f59e0b' },
];

export default function ScheduleDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Thời khóa biểu & Giáo án
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý thời khóa biểu, lịch dạy và giáo án toàn trường
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <select className="border-0 bg-transparent text-sm font-bold focus:ring-0 w-56">
              <option>Tuần 20 (12/05 - 18/05/2025)</option>
            </select>
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" className="gap-2">
            <SettingsIcon className="h-4 w-4" /> Tùy chỉnh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-100 shadow-sm dark:border-blue-900/30">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Tiết học hôm nay</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-black text-blue-600">142</h3>
                  <span className="text-sm font-medium text-slate-500">/ 156</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-2 border-t border-blue-50 dark:border-blue-900/30 pt-2">
              <span className="text-slate-500">91% kế hoạch</span>
              <a href="#" className="font-bold text-blue-600">Xem chi tiết</a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm dark:border-emerald-900/30">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <DoorOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Phòng đang sử dụng</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-black text-emerald-600">28</h3>
                  <span className="text-sm font-medium text-slate-500">/ 42</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-2 border-t border-emerald-50 dark:border-emerald-900/30 pt-2">
              <span className="text-slate-500">66.7% sử dụng</span>
              <a href="#" className="font-bold text-blue-600">Xem chi tiết</a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm dark:border-orange-900/30">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Xung đột lịch</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-black text-orange-600">3</h3>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-2 border-t border-orange-50 dark:border-orange-900/30 pt-2">
              <span className="text-slate-500">Trong tuần này</span>
              <a href="#" className="font-bold text-orange-600">Xem chi tiết</a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm dark:border-purple-900/30">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Giáo án chờ duyệt</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-black text-purple-600">18</h3>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-2 border-t border-purple-50 dark:border-purple-900/30 pt-2">
              <span className="text-slate-500">Cần xử lý</span>
              <a href="#" className="font-bold text-blue-600">Xem chi tiết</a>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Main Schedule */}
        <Card className="xl:col-span-8 overflow-hidden flex flex-col">
          <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <div className="w-32">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Giáo viên</label>
                  <select className="w-full h-8 rounded border-slate-200 text-xs px-2 focus:ring-blue-600">
                    <option>Tất cả giáo viên</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Lớp</label>
                  <select className="w-full h-8 rounded border-slate-200 text-xs px-2 focus:ring-blue-600">
                    <option>Tất cả lớp</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Phòng học</label>
                  <select className="w-full h-8 rounded border-slate-200 text-xs px-2 focus:ring-blue-600">
                    <option>Tất cả phòng</option>
                  </select>
                </div>
                <div className="w-48">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Cơ sở</label>
                  <select className="w-full h-8 rounded border-slate-200 text-xs px-2 focus:ring-blue-600">
                    <option>Cơ sở 1 - THPT Minh Khai</option>
                  </select>
                </div>
              </div>
              <Button variant="outline" className="h-8 mt-4 text-blue-600 border-blue-200 bg-blue-50 gap-1">
                <Filter className="h-3 w-3" /> Bộ lọc
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[800px] text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 w-16 text-center font-bold">Tiết</th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 2<br/><span className="text-[10px] font-normal">12/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 3<br/><span className="text-[10px] font-normal">13/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold bg-blue-50/50 dark:bg-blue-900/10 text-blue-700">Thứ 4<br/><span className="text-[10px] font-normal">14/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 5<br/><span className="text-[10px] font-normal">15/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 6<br/><span className="text-[10px] font-normal">16/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 7<br/><span className="text-[10px] font-normal">17/05</span></th>
                  <th className="py-3 px-2 text-center font-bold">Chủ nhật<br/><span className="text-[10px] font-normal">18/05</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { time: '07:00 - 07:45', name: 'Tiết 1', 
                    t2: { subject: 'Toán', class: '10A1', room: 'P.201', teacher: 'Trần M. Hùng', color: 'bg-blue-50 text-blue-700' },
                    t3: { subject: 'Vật lý', class: '11A2', room: 'P.301', teacher: 'Lê T. Minh', color: 'bg-sky-50 text-sky-700' },
                    t4: { subject: 'Ngữ văn', class: '10A1', room: 'P.201', teacher: 'Phạm T. Lan', color: 'bg-emerald-50 text-emerald-700 border border-emerald-400 shadow-sm' },
                    t5: { subject: 'Tiếng Anh', class: '10A2', room: 'P.202', teacher: 'Nguyễn T. Hoa', color: 'bg-indigo-50 text-indigo-700' },
                    t6: { subject: 'Hóa học', class: '11A1', room: 'P.302', teacher: 'Đỗ Q. Dũng', color: 'bg-cyan-50 text-cyan-700' },
                    t7: { subject: 'GDCD', class: '10A3', room: 'P.203', teacher: 'Hoàng T. Mai', color: 'bg-teal-50 text-teal-700' }
                  },
                  { time: '07:50 - 08:35', name: 'Tiết 2', 
                    t2: { subject: 'Toán', class: '10A1', room: 'P.201', teacher: 'Trần M. Hùng', color: 'bg-blue-50 text-blue-700' },
                    t3: { subject: 'Vật lý', class: '11A2', room: 'P.301', teacher: 'Lê T. Minh', color: 'bg-sky-50 text-sky-700' },
                    t4: { subject: 'Ngữ văn', class: '10A1', room: 'P.201', teacher: 'Phạm T. Lan', color: 'bg-emerald-50 text-emerald-700' },
                    t5: { subject: 'Tiếng Anh', class: '10A2', room: 'P.202', teacher: 'Nguyễn T. Hoa', color: 'bg-indigo-50 text-indigo-700' },
                    t6: { subject: 'Hóa học', class: '11A1', room: 'P.302', teacher: 'Đỗ Q. Dũng', color: 'bg-cyan-50 text-cyan-700' },
                    t7: { subject: 'Tin học', class: '10A4', room: 'P. Lab 1', teacher: 'Phạm Đ. Khoa', color: 'bg-purple-50 text-purple-700' }
                  },
                  { time: '08:45 - 09:30', name: 'Tiết 3', 
                    t2: { subject: 'Hóa học', class: '11A1', room: 'P.302', teacher: 'Đỗ Q. Dũng', color: 'bg-cyan-50 text-cyan-700' },
                    t3: { subject: 'Toán', class: '11A1', room: 'P.301', teacher: 'Trần M. Hùng', color: 'bg-blue-50 text-blue-700' },
                    t4: { subject: 'Tiếng Anh', class: '10A2', room: 'P.202', teacher: 'Nguyễn T. Hoa', color: 'bg-indigo-50 text-indigo-700' },
                    t5: { subject: 'Vật lý', class: '11A2', room: 'P.301', teacher: 'Lê T. Minh', color: 'bg-sky-50 text-sky-700' },
                    t6: { subject: 'Ngữ văn', class: '10A1', room: 'P.201', teacher: 'Phạm T. Lan', color: 'bg-emerald-50 text-emerald-700' },
                    t7: null
                  },
                  { time: '09:40 - 10:25', name: 'Tiết 4', 
                    t2: { subject: 'Hóa học', class: '11A1', room: 'P.302', teacher: 'Đỗ Q. Dũng', color: 'bg-cyan-50 text-cyan-700' },
                    t3: { subject: 'Toán', class: '11A1', room: 'P.301', teacher: 'Trần M. Hùng', color: 'bg-blue-50 text-blue-700' },
                    t4: { subject: 'Tiếng Anh', class: '10A2', room: 'P.202', teacher: 'Nguyễn T. Hoa', color: 'bg-indigo-50 text-indigo-700' },
                    t5: { subject: 'Vật lý', class: '11A2', room: 'P.301', teacher: 'Lê T. Minh', color: 'bg-sky-50 text-sky-700' },
                    t6: { subject: 'Ngữ văn', class: '10A1', room: 'P.201', teacher: 'Phạm T. Lan', color: 'bg-emerald-50 text-emerald-700' },
                    t7: null
                  },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 px-1 border-r border-slate-100 dark:border-slate-800 text-center">
                      <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
                      <p className="text-[9px] text-slate-500">{row.time}</p>
                    </td>
                    {[row.t2, row.t3, row.t4, row.t5, row.t6, row.t7, null].map((cell, j) => (
                      <td key={j} className={cn("py-1 px-1 border-r border-slate-100 dark:border-slate-800 align-top w-[13%]", j === 2 ? "bg-blue-50/20" : "")}>
                        {cell && (
                          <div className={cn("p-1.5 rounded-md h-full flex flex-col justify-between cursor-pointer hover:opacity-90", cell.color)}>
                            <div className="flex justify-between items-start leading-tight">
                              <span className="font-bold">{cell.subject}</span>
                              <span className="font-bold">{cell.class}</span>
                            </div>
                            <div className="text-[10px] mt-1 space-y-0.5 opacity-90">
                              <p>{cell.room}</p>
                              <p className="truncate" title={cell.teacher}>{cell.teacher}</p>
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="py-2 px-1 border-r border-slate-100 text-center bg-slate-50/50">
                    <p className="font-bold text-slate-900">Nghỉ trưa</p>
                    <p className="text-[9px] text-slate-500">11:20 - 13:00</p>
                  </td>
                  <td colSpan={7} className="py-2 px-1 bg-slate-50/50 text-center text-slate-400">-</td>
                </tr>
                {/* Just some afternoon slots */}
                {[
                  { time: '13:00 - 13:45', name: 'Tiết 6', 
                    t2: { subject: 'Tin học', class: '10A4', room: 'P. Lab 1', teacher: 'Phạm Đ. Khoa', color: 'bg-purple-50 text-purple-700' },
                    t3: { subject: 'Sinh học', class: '10A3', room: 'P.304', teacher: 'Vũ H. Yến', color: 'bg-green-50 text-green-700' },
                    t4: { subject: 'Toán (LT)', class: '10A1', room: 'P.201', teacher: 'Trần M. Hùng', color: 'bg-blue-50 text-blue-700' },
                    t5: { subject: 'Ngoại ngữ', class: '10A2', room: 'P.202', teacher: 'Nguyễn T. Hoa', color: 'bg-indigo-50 text-indigo-700' },
                    t6: { subject: 'Thể dục', class: '10A1', room: 'Sân A', teacher: 'Lê V. Nam', color: 'bg-violet-50 text-violet-700' },
                    t7: null
                  },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 px-1 border-r border-slate-100 dark:border-slate-800 text-center">
                      <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
                      <p className="text-[9px] text-slate-500">{row.time}</p>
                    </td>
                    {[row.t2, row.t3, row.t4, row.t5, row.t6, row.t7, null].map((cell, j) => (
                      <td key={j} className={cn("py-1 px-1 border-r border-slate-100 dark:border-slate-800 align-top w-[13%]", j === 2 ? "bg-blue-50/20" : "")}>
                        {cell && (
                          <div className={cn("p-1.5 rounded-md h-full flex flex-col justify-between cursor-pointer hover:opacity-90", cell.color)}>
                            <div className="flex justify-between items-start leading-tight">
                              <span className="font-bold">{cell.subject}</span>
                              <span className="font-bold">{cell.class}</span>
                            </div>
                            <div className="text-[10px] mt-1 space-y-0.5 opacity-90">
                              <p>{cell.room}</p>
                              <p className="truncate" title={cell.teacher}>{cell.teacher}</p>
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Legend */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-[10px] font-medium text-slate-600 bg-slate-50 dark:bg-slate-900/50">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Toán</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Ngữ văn</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Ngoại ngữ</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500" /> KHTN</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /> KHXH</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> Tin học</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500" /> GDCD</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500" /> Thể chất</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500" /> Hoạt động</span>
              <span className="ml-auto italic text-slate-400">* Nhấp vào ô để xem chi tiết hoặc chỉnh sửa</span>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="xl:col-span-4 space-y-6">
          {/* Detail */}
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Chi tiết tiết học</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[10px]">Đang diễn ra</Badge>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-[11px] text-slate-500 mb-1">Tiết 3 - Thứ 6, 16/05/2025</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ngữ văn 10A1</h3>
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" /> 07:45 - 08:30 (45 phút)</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> Phòng 201</div>
                <div className="flex items-center gap-2"><UserCircle className="h-4 w-4 text-slate-400" /> Phạm Thị Lan</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> Sĩ số: 38 / 40</div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50">Điểm danh</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Vào lớp online</Button>
              </div>
            </CardContent>
          </Card>

          {/* Giáo án */}
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Giáo án</CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs px-2 gap-1">
                <Plus className="h-3 w-3" /> Thêm giáo án
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { title: 'Bài 6: Truyện ngắn hiện đại (Nam Cao, Lão Hạc)', date: '14/05/2025', tag: 'Nháp', tagCol: 'bg-slate-100 text-slate-600 border-slate-200' },
                  { title: 'Bài 7: Thơ mới 1930-1945 (Thế Lữ, Xuân Diệu)', date: '15/05/2025', tag: 'Chờ duyệt', tagCol: 'bg-orange-50 text-orange-600 border-orange-200' },
                  { title: 'Bài 8: Văn nghị luận xã hội', date: '10/05/2025', tag: 'Đã duyệt', tagCol: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                ].map((doc, i) => (
                  <div key={i} className="p-4 flex items-start gap-3 hover:bg-slate-50 cursor-pointer">
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 mt-1"><FileText className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">Cập nhật: {doc.date}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", doc.tagCol)}>{doc.tag}</Badge>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800">
                <Button variant="link" className="text-xs font-bold text-blue-600 p-0 h-auto">Xem tất cả giáo án</Button>
              </div>
            </CardContent>
          </Card>

          {/* Cảnh báo & Hiệu suất */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Cảnh báo xung đột <span className="text-red-500">(3)</span></CardTitle>
                <a href="#" className="text-[10px] font-bold text-blue-600">Xem tất cả</a>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {[
                  { time: 'Thứ 3, 13/05 - Tiết 4', desc: 'Phòng 301 trùng lịch', tag: 'Vật lý 11A2 & Hóa học 11A2' },
                  { time: 'Thứ 5, 15/05 - Tiết 6', desc: 'Giáo viên Lê T. Minh trùng lịch', tag: 'Vật lý 11A2 & CLB Khoa học' },
                  { time: 'Thứ 6, 16/05 - Tiết 7', desc: 'Phòng 202 trùng lịch', tag: 'Ngoại ngữ 2 10A2 & CLB Tiếng Anh' },
                ].map((warn, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <div className="mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /></div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{warn.time}</p>
                      <p className="text-slate-700 dark:text-slate-300">{warn.desc}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">{warn.tag}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Hiệu suất sử dụng phòng</CardTitle>
                <select className="text-[10px] border-slate-200 rounded bg-transparent px-1 py-0.5">
                  <option>Tuần này</option>
                </select>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="w-32 h-32 relative mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roomUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {roomUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{fontSize: '10px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-slate-900 dark:text-white">66.7%</span>
                    <span className="text-[9px] text-slate-500">Sử dụng</span>
                  </div>
                </div>
                <div className="w-full space-y-2 text-xs">
                  {roomUsageData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.value} <span className="text-[10px] text-slate-400 font-normal">({(item.value / 42 * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 w-full border-t border-slate-100 pt-3 text-center">
                  <Button variant="link" className="text-xs font-bold text-blue-600 p-0 h-auto">Xem chi tiết phòng học</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
