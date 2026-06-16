'use client';

import {
  Users,
  CalendarCheck,
  FileText,
  Star,
  Search,
  Filter,
  Eye,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Info,
  BookOpen,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const attendanceData = [
  { name: 'Đi làm đầy đủ', value: 72, color: '#2563eb' },
  { name: 'Đi muộn', value: 8, color: '#f59e0b' },
  { name: 'Về sớm', value: 3, color: '#0ea5e9' },
  { name: 'Nghỉ có phép', value: 2, color: '#8b5cf6' },
  { name: 'Nghỉ không phép', value: 1, color: '#ef4444' },
];

export default function HrmDashboard({ initialData }: { initialData?: any }) {
  console.log("DB Data:", initialData);
  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản trị Nhân sự HRM
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý thông tin nhân sự, chấm công, nghỉ phép, đánh giá và phát triển đội ngũ.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="block w-40 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Tất cả phòng ban</option>
          </select>
          <select className="block w-36 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Tất cả vai trò</option>
          </select>
          <select className="hidden sm:block w-44 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Cơ sở 1 - Minh Khai</option>
          </select>
          <select className="block w-36 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 font-medium">
            <option>Tháng 05/2025</option>
          </select>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 dark:bg-blue-900/30 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng nhân sự</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">86</h3>
                <span className="text-sm font-medium text-slate-500">Người</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">↑ 3 so với tháng trước</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Đi làm hôm nay</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">72</h3>
                <span className="text-sm font-medium text-slate-500">Người (83.7%)</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">↑ 4 so với hôm qua</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 dark:bg-orange-900/30 dark:text-orange-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Nghỉ phép chờ duyệt</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">7</h3>
                <span className="text-sm font-medium text-slate-500">Đơn</span>
              </div>
              <p className="text-xs text-red-500 font-medium mt-1">↑ 2 so với ngày hôm qua</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 dark:bg-purple-900/30 dark:text-purple-400">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Đánh giá tháng</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.3</h3>
                <span className="text-sm font-medium text-slate-500">/5 Điểm trung bình</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">↑ 0.2 so với tháng trước</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Employee List */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between border-b border-transparent">
            <CardTitle className="text-base font-bold">Danh sách nhân sự</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhân sự..."
                  className="h-8 w-48 rounded-md border-slate-200 pl-8 text-xs focus:ring-blue-600 dark:bg-slate-900 dark:border-slate-700"
                />
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-y border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nhân sự</th>
                    <th className="px-4 py-3 font-bold">Chức vụ</th>
                    <th className="px-4 py-3 font-bold">Phòng ban</th>
                    <th className="px-4 py-3 font-bold">Vai trò</th>
                    <th className="px-4 py-3 font-bold">Trạng thái</th>
                    <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { id: '1', name: 'Nguyễn Thị Lan', role1: 'GV Toán học', role2: 'GV Toán học', dept: 'Tổ Toán', type: 'Giáo viên', status: 'Đang làm việc', statCol: 'text-emerald-600', sel: true },
                    { id: '2', name: 'Trần Văn Hùng', role1: 'GV Vật lý', role2: 'GV Vật lý', dept: 'Tổ KHTN', type: 'Giáo viên', status: 'Đang làm việc', statCol: 'text-emerald-600' },
                    { id: '3', name: 'Phạm Thu Hà', role1: 'GV Ngữ văn', role2: 'GV Ngữ văn', dept: 'Tổ Ngữ văn', type: 'Giáo viên', status: 'Đang làm việc', statCol: 'text-emerald-600' },
                    { id: '4', name: 'Lê Minh Đức', role1: 'Phó Hiệu trưởng', role2: 'Phó Hiệu trưởng', dept: 'Ban giám hiệu', type: 'Quản lý', status: 'Đang làm việc', statCol: 'text-emerald-600' },
                    { id: '5', name: 'Vũ Thị Hồng', role1: 'Kế toán trưởng', role2: 'Kế toán trưởng', dept: 'Phòng Kế toán', type: 'Nhân viên', status: 'Đang làm việc', statCol: 'text-emerald-600' },
                    { id: '6', name: 'Hoàng Văn Nam', role1: 'Nhân viên IT', role2: 'Nhân viên IT', dept: 'Phòng CNTT', type: 'Nhân viên', status: 'Nghỉ phép', statCol: 'text-orange-500' },
                    { id: '7', name: 'Đỗ Thu Trang', role1: 'Thư ký', role2: 'Văn phòng', dept: 'Văn phòng', type: 'Nhân viên', status: 'Đang làm việc', statCol: 'text-emerald-600' },
                  ].map((user) => (
                    <tr key={user.id} className={cn("hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer", user.sel && "bg-blue-50/50 dark:bg-blue-900/10")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={`https://i.pravatar.cc/150?u=${user.id}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</p>
                            <p className="text-[10px] text-slate-500">{user.role1}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.role2}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.dept}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-2 h-2 rounded-full", user.status === 'Đang làm việc' ? 'bg-emerald-500' : 'bg-orange-500')} />
                          <span className={cn("text-xs font-medium", user.statCol)}>{user.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600"><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Hiển thị 1 - 7 / 86 nhân sự</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" className="h-7 w-7 p-0 bg-blue-600 text-white border-blue-600">1</Button>
                <Button variant="ghost" className="h-7 w-7 p-0 text-slate-600">2</Button>
                <Button variant="ghost" className="h-7 w-7 p-0 text-slate-600">3</Button>
                <span className="text-xs text-slate-400 mx-1">...</span>
                <Button variant="ghost" className="h-7 w-7 p-0 text-slate-600">13</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <select className="text-xs border-slate-200 rounded-md bg-transparent py-1 pl-2 pr-6">
                <option>7 / trang</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Detail Profile */}
        <Card className="lg:col-span-1 border-blue-100 shadow-sm dark:border-blue-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex gap-1.5 items-center pl-1.5 pr-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đang làm việc
            </Badge>
          </div>
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold mb-4">Thông tin nhân sự</CardTitle>
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <img src="https://i.pravatar.cc/150?u=1" className="w-20 h-20 rounded-full object-cover mb-3 ring-4 ring-slate-50 dark:ring-slate-900" alt="" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nguyễn Thị Lan</h3>
              <p className="text-sm text-slate-500 mb-2">Giáo viên Toán học</p>
              <Badge  className="bg-blue-50 text-blue-700 border-blue-200">GV-TOAN-012</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="col-span-1 text-slate-500">Phòng ban</span>
              <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">Tổ Toán</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="col-span-1 text-slate-500">Chức vụ</span>
              <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">Giáo viên</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="col-span-1 text-slate-500">Ngày vào trường</span>
              <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">15/08/2019</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="col-span-1 text-slate-500">Hợp đồng</span>
              <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">Hợp đồng không thời hạn</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="col-span-1 text-slate-500">Email</span>
              <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">lannt@thptminhkhai.edu.vn</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="col-span-1 text-slate-500">Số điện thoại</span>
              <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">0987 654 321</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="col-span-1 text-slate-500">Địa chỉ</span>
              <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">12 Lê Lợi, TP. Vinh, Nghệ An</span>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                Xem hồ sơ
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Chỉnh sửa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Chấm công tháng */}
        <Card>
          <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
            <CardTitle className="text-base font-bold">Chấm công tháng</CardTitle>
            <span className="text-sm font-medium text-slate-500">05/2025</span>
            <Info className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-[120px] h-[120px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">83.7%</span>
                  <span className="text-[9px] text-slate-500">Đi làm đầy đủ</span>
                  <span className="text-[9px] font-medium">72/86 người</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                {attendanceData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {item.value} <span className="text-[10px] text-slate-400 font-normal">({(item.value / 86 * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
              <div className="flex-1 px-2">
                <p className="text-[10px] text-slate-500 uppercase">Tổng công chuẩn</p>
                <p className="text-base font-bold mt-1">1,816</p>
              </div>
              <div className="flex-1 px-2">
                <p className="text-[10px] text-slate-500 uppercase">Công thực tế</p>
                <p className="text-base font-bold mt-1">1,520</p>
              </div>
              <div className="flex-1 px-2">
                <p className="text-[10px] text-slate-500 uppercase">Tỷ lệ hoàn thành</p>
                <p className="text-base font-bold mt-1 text-blue-600">83.7%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danh sách nghỉ phép chờ duyệt */}
        <Card>
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Danh sách nghỉ phép chờ duyệt</CardTitle>
            <a href="#" className="text-xs font-medium text-blue-600">Xem tất cả</a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[220px] overflow-y-auto custom-scrollbar">
              {[
                { user: 'Hoàng Văn Nam', role: 'Nhân viên IT', reason: 'Nghỉ phép năm', time: '2 ngày · 19-20/05' },
                { user: 'Phạm Thu Hà', role: 'Giáo viên Ngữ văn', reason: 'Nghỉ việc riêng', time: '1 ngày · 16/05/2025' },
                { user: 'Vũ Thị Hồng', role: 'Kế toán trưởng', reason: 'Nghỉ phép năm', time: '3 ngày · 26/05 - 28/05' },
                { user: 'Trần Văn Hùng', role: 'Giáo viên Vật lý', reason: 'Nghỉ ốm', time: '1 ngày · 17/05/2025' },
              ].map((leave, i) => (
                <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/150?u=${leave.user}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{leave.user}</p>
                      <p className="text-[10px] text-slate-500">{leave.role}</p>
                    </div>
                  </div>
                  <div className="text-right mr-3">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{leave.reason}</p>
                    <p className="text-[10px] text-slate-500">{leave.time}</p>
                  </div>
                  <Badge  className="text-[10px] font-medium text-orange-600 border-orange-200 bg-orange-50 px-2 shrink-0">
                    Chờ duyệt
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Đánh giá & Phát triển */}
        <Card className="flex flex-col">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Đánh giá & Phát triển</CardTitle>
            <a href="#" className="text-xs font-medium text-blue-600">Xem báo cáo</a>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Đánh giá tháng 05/2025</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <h3 className="text-2xl font-bold text-blue-600">4.3</h3>
                    <span className="text-sm font-medium text-slate-500">/5</span>
                  </div>
                  <p className="text-xs text-slate-500">Điểm trung bình</p>
                </div>
                <div className="space-y-1.5 w-40">
                  {[
                    { label: 'Xuất sắc', val: 18, pct: '21.0%', color: 'bg-blue-600' },
                    { label: 'Tốt', val: 40, pct: '46.5%', color: 'bg-blue-400' },
                    { label: 'Khá', val: 20, pct: '23.3%', color: 'bg-emerald-400' },
                    { label: 'Trung bình', val: 6, pct: '7.0%', color: 'bg-orange-400' },
                    { label: 'Yếu', val: 2, pct: '2.2%', color: 'bg-red-500' },
                  ].map((bar, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <div className="w-16 shrink-0">{bar.label}</div>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color}`} style={{ width: `${(bar.val / 86) * 100}%` }} />
                      </div>
                      <div className="w-12 text-right font-medium">
                        {bar.val} <span className="text-slate-400 font-normal">({bar.pct})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-medium border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>Hoàn thành đánh giá</span>
                <span className="font-bold">86.0% <span className="text-slate-400 font-normal">(74/86)</span></span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold mb-3">Đào tạo & Phát triển</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <BookOpen className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 leading-tight">Khóa học đang diễn ra</p>
                    <p className="text-sm font-bold text-blue-600">5</p>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 leading-tight">Đã hoàn thành</p>
                    <p className="text-sm font-bold text-emerald-600">23</p>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                  <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 leading-tight">Đăng ký sắp tới</p>
                    <p className="text-sm font-bold text-orange-600">8</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
