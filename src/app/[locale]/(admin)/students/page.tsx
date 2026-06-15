'use client';

import {
  UserCircle,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  Trophy,
  Phone,
  MessageSquare,
  Mail,
  Edit3,
  Bell,
  Activity,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  SettingsIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const trendData = [
  { term: 'HK1 2023-2024', student: 7.8, class: 7.2 },
  { term: 'HK2 2023-2024', student: 8.1, class: 7.4 },
  { term: 'HK1 2024-2025', student: 8.0, class: 7.5 },
  { term: 'HK2 2024-2025', student: 8.4, class: 7.6 },
];

export default function Student360Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hồ sơ Học sinh 360°
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Năm học 2024 - 2025</option>
          </select>
          <Button variant="outline" className="gap-2">
            <SettingsIcon className="h-4 w-4" /> Tùy chỉnh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-100 shadow-sm dark:border-blue-900/30">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Điểm trung bình (TB)</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-blue-600">8.4</h3>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">Xếp hạng: 12/42</div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-medium text-emerald-600">Tăng ↑ 0.5 so với HK1</span>
              <div className="w-16 h-6">
                 {/* Sparkline Mock */}
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,15 L20,12 L40,8 L60,14 L80,5 L100,2" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="2" r="3" fill="#10b981" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm dark:border-emerald-900/30">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Chuyên cần</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-emerald-600">96.2%</h3>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">Đi học: 176/183 buổi</div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Tốt</span>
              <div className="w-16 h-6">
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,18 L20,15 L40,10 L60,12 L80,6 L100,4" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="4" r="3" fill="#10b981" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm dark:border-orange-900/30">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Cảnh báo học tập</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-orange-600">1</h3>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">Môn cần cải thiện</div>
            <div className="flex justify-between items-end mt-auto">
              <a href="#" className="text-[10px] font-medium text-blue-600">Xem chi tiết →</a>
              <div className="w-16 h-6">
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,18 L20,18 L40,15 L60,12 L80,6 L100,8" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="8" r="3" fill="#f97316" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm dark:border-purple-900/30">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Hoạt động ngoại khóa</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-purple-600">12</h3>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">Hoạt động đã tham gia</div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Tích cực</span>
              <div className="w-16 h-6">
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,15 L20,5 L40,12 L60,8 L80,14 L100,2" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="2" r="3" fill="#9333ea" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Profile */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="relative overflow-hidden border-blue-100 dark:border-blue-900/30">
            <div className="absolute top-0 right-0 p-3 z-10">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex gap-1.5 items-center px-2 py-0.5 text-[10px]">
                Đang học
              </Badge>
            </div>
            <CardHeader className="p-6 pb-2 text-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <img src="https://i.pravatar.cc/150?u=student" className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-white dark:ring-slate-950 mx-auto" alt="" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Nguyễn Hoàng Anh</h3>
              <p className="text-xs text-slate-500 mt-1">Mã HS: HS20230078</p>
            </CardHeader>
            <CardContent className="p-4 pt-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Lớp</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">11A1</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Khối</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">11</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Cơ sở</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">Cơ sở 1 - Trường THPT Minh Khai</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Ngày sinh</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">14/06/2008</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Giới tính</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">Nam</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Dân tộc</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">Kinh</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Ngày nhập học</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">01/08/2023</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-3 text-xs">Thông tin phụ huynh</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="https://i.pravatar.cc/150?u=mom" className="w-8 h-8 rounded-full object-cover" alt="" />
                      <div>
                        <p className="text-[11px] font-bold leading-tight text-slate-900 dark:text-white">Nguyễn Thị Mai <span className="font-normal text-slate-500">(Mẹ)</span></p>
                        <p className="text-[10px] text-slate-500">0904 123 456</p>
                        <p className="text-[10px] text-slate-500">maint@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600"><Phone className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600"><Mail className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="https://i.pravatar.cc/150?u=dad" className="w-8 h-8 rounded-full object-cover" alt="" />
                      <div>
                        <p className="text-[11px] font-bold leading-tight text-slate-900 dark:text-white">Nguyễn Văn Hùng <span className="font-normal text-slate-500">(Bố)</span></p>
                        <p className="text-[10px] text-slate-500">0912 345 678</p>
                        <p className="text-[10px] text-slate-500">hungnv@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600"><Phone className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2 text-xs">Thao tác nhanh</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors border border-blue-100"><Bell className="h-4 w-4" /></div>
                    <span className="text-[9px] font-medium text-slate-600">Gửi thông báo</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors border border-emerald-100"><MessageSquare className="h-4 w-4" /></div>
                    <span className="text-[9px] font-medium text-slate-600">Nhắn tin PH</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors border border-purple-100"><Phone className="h-4 w-4" /></div>
                    <span className="text-[9px] font-medium text-slate-600">Gọi điện</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100 transition-colors border border-orange-100"><Edit3 className="h-4 w-4" /></div>
                    <span className="text-[9px] font-medium text-slate-600">Tạo ghi chú</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Main Section */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">
            <button className="pb-3 border-b-2 border-blue-600 text-blue-600">Tổng quan</button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700">Học tập</button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700">Chuyên cần</button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700">Hạnh kiểm</button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700">Y tế</button>
          </div>

          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Xu hướng học tập</CardTitle>
              <select className="text-xs border-slate-200 rounded-md bg-transparent">
                <option>4 học kỳ gần nhất</option>
              </select>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-6 mb-4 px-4 text-[11px] font-bold text-slate-600 justify-center">
                <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-blue-600" /> Điểm TB</span>
                <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-sky-500 border border-dashed border-sky-500" /> Điểm TB lớp</span>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="student" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} name="Điểm TB học sinh" />
                    <Line type="monotone" dataKey="class" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#0ea5e9' }} name="Điểm TB lớp" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Học tập HK2 */}
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold">Kết quả học tập học kỳ II <span className="text-[10px] text-slate-400 font-normal">(2024 - 2025)</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 pb-2 flex flex-col justify-between h-[180px]">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-600" strokeDasharray="84, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[9px] text-slate-500 font-medium">Điểm TB</span>
                      <span className="text-xl font-bold text-blue-600 -mt-1">8.4</span>
                      <span className="text-[10px] text-emerald-600 font-bold -mt-0.5">Tốt</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-600">Toán</span><span className="font-bold text-blue-600">8.7</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-600">Ngữ văn</span><span className="font-bold text-blue-600">8.2</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-600">Tiếng Anh</span><span className="font-bold text-blue-600">8.6</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-600">Vật lý</span><span className="font-bold text-emerald-600">8.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Hóa học</span><span className="font-bold text-blue-600">8.1</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <a href="#" className="text-[10px] font-bold text-blue-600">Xem chi tiết →</a>
                </div>
              </CardContent>
            </Card>

            {/* Chuyên cần HK2 */}
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold">Chuyên cần học kỳ II <span className="text-[10px] text-slate-400 font-normal">(2024 - 2025)</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 pb-2 flex flex-col justify-between h-[180px]">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-emerald-500" strokeDasharray="96, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[15px] font-bold text-emerald-600 mt-1">96.2%</span>
                      <span className="text-[9px] text-slate-500 font-medium">176 / 183 buổi</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Đi học</span><span className="font-bold">176 <span className="text-[10px] font-normal text-slate-400">buổi</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Nghỉ phép</span><span className="font-bold">5 <span className="text-[10px] font-normal text-slate-400">buổi</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Nghỉ không phép</span><span className="font-bold text-red-500">2 <span className="text-[10px] font-normal text-slate-400">buổi</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Đi muộn</span><span className="font-bold text-orange-500">3 <span className="text-[10px] font-normal text-slate-400">lần</span></span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <a href="#" className="text-[10px] font-bold text-blue-600">Xem chi tiết →</a>
                </div>
              </CardContent>
            </Card>
            
            {/* Hạnh kiểm HK2 */}
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold">Hạnh kiểm học kỳ II <span className="text-[10px] text-slate-400 font-normal">(2024 - 2025)</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex gap-4 h-[160px]">
                <div className="w-20 h-full bg-emerald-50 rounded-lg border border-emerald-100 flex flex-col justify-center items-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-500 mb-1" />
                  <span className="text-sm font-bold text-emerald-600">Tốt</span>
                </div>
                <div className="flex-1 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Ưu điểm</span>
                    <ul className="text-[11px] text-slate-500 list-disc list-inside ml-3 mt-1 space-y-1">
                      <li>Học tập tiến bộ</li>
                      <li>Tham gia hoạt động tích cực</li>
                      <li>Hòa đồng, trách nhiệm</li>
                    </ul>
                  </div>
                  <div className="pt-1">
                    <span className="font-bold text-slate-700">Nhắc nhở</span>
                    <ul className="text-[11px] text-slate-500 list-disc list-inside ml-3 mt-1">
                      <li>Không có</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thành tích */}
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Thành tích & Giải thưởng</CardTitle>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="p-4 pb-2 flex flex-col justify-between h-[160px]">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5"><Trophy className="h-3 w-3" /></div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400">01/2025</span> <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">Giấy khen Học sinh Giỏi HK1</p></div>
                      <p className="text-[10px] text-slate-500">Trường THPT Minh Khai</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5"><Trophy className="h-3 w-3" /></div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400">12/2024</span> <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">Giải Ba - Kỳ thi HSG Toán cấp Trường</p></div>
                      <p className="text-[10px] text-slate-500">Trường THPT Minh Khai</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-50">
                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5"><Trophy className="h-3 w-3" /></div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400">11/2024</span> <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate w-[160px]">Giấy khen tham gia tích cực...</p></div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-1">
                  <a href="#" className="text-[10px] font-bold text-blue-600">Xem tất cả →</a>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Right Sidebar: Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {/* Y tế (was bottom right in image, putting it here or at bottom) Wait, Y tế is a tab or a card? In image it is a card next to "Thành tích". Let's put it back to grid and Timeline here. */}
          
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold">Dòng thời gian trao đổi với phụ huynh</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                {[
                  { time: '15/05/2025 14:30', title: 'Trao đổi học tập', desc: 'Giáo viên Toán thông báo về tiến bộ trong kiểm tra giữa kỳ.', user: 'Cô Phạm Thu Hương', icon: MessageSquare, color: 'bg-blue-600' },
                  { time: '10/05/2025 09:15', title: 'Gọi điện', desc: 'Trao đổi về kế hoạch ôn thi cuối kỳ.', user: 'Thầy Lê Minh Tuấn', icon: Phone, color: 'bg-emerald-500' },
                  { time: '02/05/2025 16:45', title: 'Thông báo', desc: 'Thông báo lịch thi học kỳ II.', user: 'Phòng Đào tạo', icon: Bell, color: 'bg-orange-500' },
                  { time: '28/04/2025 10:20', title: 'Trao đổi hạnh kiểm', desc: 'Nhắc nhở về việc đi học muộn.', user: 'GVCN - Cô Trần Thị Lan', icon: MessageSquare, color: 'bg-blue-600' },
                  { time: '20/01/2025 11:00', title: 'Gọi điện', desc: 'Trao đổi về kết quả học tập HK1.', user: 'Cô Phạm Thu Hương', icon: Phone, color: 'bg-emerald-500' },
                ].map((act, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={cn("absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-white z-10 ring-4 ring-white dark:ring-slate-950", act.color)}>
                      <act.icon className="h-3 w-3" />
                    </div>
                    {i !== 4 && <div className="absolute left-[11px] top-4 h-[calc(100%+16px)] w-[2px] bg-slate-100 dark:bg-slate-800" />}
                    
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</p>
                      <span className="text-[9px] text-slate-400">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-1">{act.desc}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1"><UserCircle className="h-3 w-3" /> {act.user}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="link" className="text-xs font-bold text-blue-600 h-auto p-0">
                  Xem toàn bộ lịch sử trao đổi <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Y Tế Card moved to sidebar since grid only has 2 cols and is full */}
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold">Y tế & Sức khỏe</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex gap-4">
               <div className="w-16 h-16 bg-blue-50 rounded-lg border border-blue-100 flex flex-col justify-center items-center shrink-0">
                  <HeartPulse className="h-6 w-6 text-blue-500 mb-1" />
                </div>
                <div className="flex-1 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Tình trạng sức khỏe</span><span className="font-bold text-emerald-600">Tốt</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Chiều cao / Cân nặng</span><span className="font-bold text-slate-700">170 cm / 60 kg</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Nhóm máu</span><span className="font-bold text-slate-700">O+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cảnh báo y tế</span><span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Không có</span>
                  </div>
                </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
