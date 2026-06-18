'use client';

import { useState, useMemo, useEffect } from 'react';
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

export default function HrmDashboard({ initialData }: { initialData?: any }) {
  const employees = initialData?.employees || [];
  const stats = initialData?.stats || {
    totalEmployees: 0,
    workingToday: 0,
    pendingLeaveCount: 0,
    avgRating: 0
  };
  const attendanceData = initialData?.attendanceData || [];
  const pendingLeaves = initialData?.pendingLeaves || [];
  const ratingDistribution = initialData?.ratingDistribution || [];

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Selected employee ID state
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  // Extract unique departments and roles for filters
  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((emp: any) => {
      if (emp.dept) depts.add(emp.dept);
    });
    return Array.from(depts);
  }, [employees]);

  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    employees.forEach((emp: any) => {
      if (emp.type) roles.add(emp.type);
    });
    return Array.from(roles);
  }, [employees]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedRole]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: any) => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role1.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'ALL' || emp.dept === selectedDept;
      const matchesRole = selectedRole === 'ALL' || emp.type === selectedRole;
      return matchesSearch && matchesDept && matchesRole;
    });
  }, [employees, searchQuery, selectedDept, selectedRole]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  // Currently selected employee object
  const selectedEmployee = useMemo(() => {
    if (selectedEmpId) {
      return employees.find((e: any) => e.id === selectedEmpId) || employees[0];
    }
    return employees[0] || null;
  }, [employees, selectedEmpId]);

  const workingTodayPercent = stats.totalEmployees > 0 
    ? ((stats.workingToday / stats.totalEmployees) * 100).toFixed(1) 
    : '0';

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
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="block w-40 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
          >
            <option value="ALL">Tất cả phòng ban</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="block w-36 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
          >
            <option value="ALL">Tất cả vai trò</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select className="hidden sm:block w-44 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Cơ sở Cầu Giấy</option>
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
                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalEmployees}</h3>
                <span className="text-sm font-medium text-slate-500">Người</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">↑ Hoạt động thực tế</p>
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
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.workingToday}</h3>
                <span className="text-sm font-medium text-slate-500">Người ({workingTodayPercent}%)</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">↑ Theo chấm công</p>
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
                <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingLeaveCount}</h3>
                <span className="text-sm font-medium text-slate-500">Đơn</span>
              </div>
              <p className="text-xs text-red-500 font-medium mt-1">Cần phê duyệt sớm</p>
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
                <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgRating}</h3>
                <span className="text-sm font-medium text-slate-500">/5 Điểm trung bình</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">Đạt mức Khá / Tốt</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Employee List */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between border-b border-transparent">
            <CardTitle className="text-base font-bold">Danh sách nhân sự ({filteredEmployees.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhân sự..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-48 rounded-md border-slate-200 pl-8 text-xs focus:ring-blue-600 dark:bg-slate-900 dark:border-slate-700"
                />
              </div>
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
                  {paginatedEmployees.map((user: any) => {
                    const isSelected = selectedEmployee?.id === user.id;
                    return (
                      <tr 
                        key={user.id} 
                        onClick={() => setSelectedEmpId(user.id)}
                        className={cn("hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer", isSelected && "bg-blue-50/50 dark:bg-blue-900/10")}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-500">{user.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.role1}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.dept}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.type}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={cn("w-2 h-2 rounded-full", user.status === 'Đang làm việc' ? 'bg-emerald-500' : 'bg-orange-500')} />
                            <span className={cn("text-xs font-medium", user.statCol)}>{user.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setSelectedEmpId(user.id)}
                              className="h-7 w-7 text-slate-400 hover:text-blue-600"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400"><MoreVertical className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Không tìm thấy nhân sự nào khớp với bộ lọc
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Hiển thị {filteredEmployees.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} / {filteredEmployees.length} nhân sự
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <Button 
                      key={page}
                      variant={currentPage === page ? "outline" : "ghost"}
                      onClick={() => setCurrentPage(page)}
                      className={cn("h-7 w-7 p-0", currentPage === page ? "bg-blue-600 text-white border-blue-600" : "text-slate-600")}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-slate-400">
                {itemsPerPage} / trang
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Detail Profile */}
        <Card className="lg:col-span-1 border-blue-100 shadow-sm dark:border-blue-900/30 relative overflow-hidden">
          {selectedEmployee ? (
            <>
              <div className="absolute top-0 right-0 p-4">
                <Badge className={cn("border-0 flex gap-1.5 items-center pl-1.5 pr-2.5", 
                  selectedEmployee.status === 'Đang làm việc' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", selectedEmployee.status === 'Đang làm việc' ? 'bg-emerald-500' : 'bg-orange-500')} /> {selectedEmployee.status}
                </Badge>
              </div>
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-base font-bold mb-4">Thông tin nhân sự</CardTitle>
                <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <img src={selectedEmployee.avatar} className="w-20 h-20 rounded-full object-cover mb-3 ring-4 ring-slate-50 dark:ring-slate-900" alt="" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">{selectedEmployee.role1}</p>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">{selectedEmployee.employeeCode}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-1 text-slate-500">Phòng ban</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">{selectedEmployee.dept}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-1 text-slate-500">Chức vụ</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">{selectedEmployee.role2}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-1 text-slate-500">Ngày vào</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">{selectedEmployee.joinedAt}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-1 text-slate-500">Hợp đồng</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">{selectedEmployee.contractType}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-1 text-slate-500">Email</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right break-all">{selectedEmployee.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-1 text-slate-500">Số điện thoại</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">{selectedEmployee.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-1 text-slate-500">Địa chỉ</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">{selectedEmployee.address}</span>
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
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">
              Vui lòng chọn một nhân sự trong danh sách để xem chi tiết.
            </div>
          )}
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
                      {attendanceData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">{workingTodayPercent}%</span>
                  <span className="text-[9px] text-slate-500">Đi làm đầy đủ</span>
                  <span className="text-[9px] font-medium">{stats.workingToday}/{stats.totalEmployees} người</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                {attendanceData.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {item.value} <span className="text-[10px] text-slate-400 font-normal">({stats.totalEmployees > 0 ? ((item.value / stats.totalEmployees) * 100).toFixed(0) : 0}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
              <div className="flex-1 px-2">
                <p className="text-[10px] text-slate-500 uppercase">Tổng công chuẩn</p>
                <p className="text-base font-bold mt-1">{stats.totalEmployees * 22}</p>
              </div>
              <div className="flex-1 px-2">
                <p className="text-[10px] text-slate-500 uppercase">Công thực tế</p>
                <p className="text-base font-bold mt-1">{Math.round(stats.totalEmployees * 22 * (stats.workingToday / (stats.totalEmployees || 1)))}</p>
              </div>
              <div className="flex-1 px-2">
                <p className="text-[10px] text-slate-500 uppercase">Tỷ lệ hoàn thành</p>
                <p className="text-base font-bold mt-1 text-blue-600">{workingTodayPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danh sách nghỉ phép chờ duyệt */}
        <Card>
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Nghỉ phép chờ duyệt ({pendingLeaves.length})</CardTitle>
            <Button variant="ghost" className="text-xs font-medium text-blue-600 p-0 h-auto hover:bg-transparent">Xem tất cả</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[220px] overflow-y-auto custom-scrollbar">
              {pendingLeaves.map((leave: any, i: number) => (
                <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img src={leave.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{leave.user}</p>
                      <p className="text-[10px] text-slate-500">{leave.role}</p>
                    </div>
                  </div>
                  <div className="text-right mr-3">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{leave.reason}</p>
                    <p className="text-[10px] text-slate-500">{leave.time}</p>
                  </div>
                  <Badge className="text-[10px] font-medium text-orange-600 border-orange-200 bg-orange-50 px-2 shrink-0">
                    Chờ duyệt
                  </Badge>
                </div>
              ))}
              {pendingLeaves.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Không có đơn nghỉ phép nào đang chờ duyệt
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Đánh giá & Phát triển */}
        <Card className="flex flex-col">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Đánh giá & Phát triển</CardTitle>
            <Button variant="ghost" className="text-xs font-medium text-blue-600 p-0 h-auto hover:bg-transparent">Xem báo cáo</Button>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Đánh giá tháng 05/2025</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <h3 className="text-2xl font-bold text-blue-600">{stats.avgRating}</h3>
                    <span className="text-sm font-medium text-slate-500">/5</span>
                  </div>
                  <p className="text-xs text-slate-500">Điểm trung bình</p>
                </div>
                <div className="space-y-1.5 w-40">
                  {ratingDistribution.map((bar: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <div className="w-16 shrink-0">{bar.label}</div>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full", bar.color)} style={{ width: `${stats.totalEmployees > 0 ? (bar.val / stats.totalEmployees) * 100 : 0}%` }} />
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
                <span className="font-bold">100.0% <span className="text-slate-400 font-normal">({stats.totalEmployees}/{stats.totalEmployees})</span></span>
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
                    <p className="text-[9px] text-slate-500 leading-tight">Đang diễn ra</p>
                    <p className="text-sm font-bold text-blue-600">5</p>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 leading-tight">Đã học xong</p>
                    <p className="text-sm font-bold text-emerald-600">23</p>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                  <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 leading-tight">Sắp tới</p>
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
