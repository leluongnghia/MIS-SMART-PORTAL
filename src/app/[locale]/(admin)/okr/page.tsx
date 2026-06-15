'use client';

import {
  Target,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export default function OkrDashboard() {
  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Chiến lược & OKRs
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Theo dõi tiến độ thực hiện chiến lược và các mục tiêu trọng yếu (OKRs)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Quý 2/2025 (01/04 - 30/06/2025)</option>
          </select>
          <select className="hidden md:block w-32 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Cơ sở: Tất cả</option>
          </select>
          <select className="hidden lg:block w-40 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Khối phụ trách: Tất cả</option>
          </select>
          <Button variant="outline" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Tùy chỉnh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-row items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-600" strokeDasharray="72, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white">72%</div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Tiến độ OKR toàn trường</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-slate-500">Hoàn thành: 72%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-slate-500">Đang thực hiện: 22%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-slate-300" /> <span className="text-slate-500">Chưa bắt đầu: 6%</span>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> ↑ 8% so với Quý 1/2025
          </div>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Mục tiêu đúng tiến độ</p>
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">68%</h3>
                  <p className="text-xs font-medium text-slate-500">26 / 38 mục tiêu</p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> ↑ 10% so với Quý 1/2025
          </div>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Mục tiêu có rủi ro</p>
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center dark:bg-orange-900/30 dark:text-orange-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400">18%</h3>
                  <p className="text-xs font-medium text-slate-500">7 / 38 mục tiêu</p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-red-500 font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> ↓ -3% so với Quý 1/2025
          </div>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">KPI liên kết</p>
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center dark:bg-indigo-900/30 dark:text-indigo-400">
                  <GitBranch className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">86</h3>
                  <p className="text-xs font-medium text-slate-500">KPI đang theo dõi</p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> ↑ 12 KPI so với Quý 1/2025
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Core Pillars */}
        <div className="xl:col-span-3 space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold">Tổng quan OKR theo 4 trụ cột chiến lược</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-y border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-bold">Trụ cột chiến lược</th>
                      <th className="px-4 py-3 font-bold text-center">Tiến độ</th>
                      <th className="px-4 py-3 font-bold text-center">Mục tiêu</th>
                      <th className="px-4 py-3 font-bold text-center">Kết quả chính</th>
                      <th className="px-4 py-3 font-bold">Chủ sở hữu</th>
                      <th className="px-4 py-3 font-bold text-center">Mức độ tự tin</th>
                      <th className="px-4 py-3 font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { icon: Users, color: 'bg-blue-600', name: 'Tuyển sinh', desc: 'Mở rộng quy mô - Nâng cao chất lượng đầu vào', prog: 71, obj: '8 / 10', kr: '18 / 28', owner: 'Phạm Thị Lan', ownerRole: 'P. Tuyển sinh', conf: 7.8, status: 'Đúng tiến độ', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                      { icon: GraduationCap, color: 'bg-purple-600', name: 'Đào tạo', desc: 'Nâng cao chất lượng dạy & học', prog: 68, obj: '9 / 12', kr: '21 / 36', owner: 'Trần Văn Hùng', ownerRole: 'P. Đào tạo', conf: 7.2, status: 'Đúng tiến độ', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                      { icon: Target, color: 'bg-sky-500', name: 'Nhân sự', desc: 'Phát triển đội ngũ - Trao quyền - Gắn kết', prog: 75, obj: '7 / 9', kr: '16 / 23', owner: 'Lê Thị Mai', ownerRole: 'P. Nhân sự', conf: 7.6, status: 'Đúng tiến độ', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                      { icon: SettingsIcon, color: 'bg-orange-500', name: 'Vận hành', desc: 'Hiệu quả - Chuẩn hóa - Chuyển đổi số', prog: 63, obj: '6 / 7', kr: '12 / 18', owner: 'Nguyễn Văn Nam', ownerRole: 'Hiệu trưởng', conf: 6.5, status: 'Có rủi ro', statCol: 'text-orange-600 border-orange-200 bg-orange-50' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-lg text-white flex items-center justify-center shrink-0", row.color)}>
                              <row.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-blue-600 dark:text-blue-400">{row.name}</p>
                              <p className="text-[11px] text-slate-500">{row.desc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-center">
                            <span className="font-bold">{row.prog}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${row.prog}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="font-bold">{row.obj}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">mục tiêu</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="font-bold">{row.kr}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">KQ chính</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={`https://i.pravatar.cc/150?u=${row.owner}`} className="w-7 h-7 rounded-full object-cover" alt="" />
                            <div>
                              <p className="text-xs font-bold">{row.owner}</p>
                              <p className="text-[10px] text-slate-500">{row.ownerRole}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center gap-1 font-bold">
                            <span className={row.conf >= 7 ? 'text-emerald-600' : 'text-orange-600'}>{row.conf}</span>
                            <span className="text-xs text-slate-400 font-normal">/10</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={row.statCol}>{row.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <Button variant="link" className="text-sm font-bold text-blue-600">
                  Xem chi tiết OKR theo trụ cột <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alignment Map */}
          <Card>
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Bản đồ liên kết OKR (Alignment Map)</CardTitle>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Mục tiêu</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-purple-500 transform rotate-45" /> Kết quả chính</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Sáng kiến / Dự án</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex gap-2 mb-6">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Tất cả trụ cột</Button>
                <Button size="sm" variant="outline" className="border-slate-200">Tuyển sinh</Button>
                <Button size="sm" variant="outline" className="border-slate-200">Đào tạo</Button>
                <Button size="sm" variant="outline" className="border-slate-200">Nhân sự</Button>
                <Button size="sm" variant="outline" className="border-slate-200">Vận hành</Button>
              </div>

              {/* Simple tree visualization */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[300px] flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-2">Sơ đồ OKR Alignment Map Placeholder</p>
                  <Button variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                    Xem bản đồ đầy đủ <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                {/* Decoration lines to imply a tree */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 150 150 C 250 150 250 50 350 50" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M 150 150 C 250 150 250 150 350 150" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M 150 150 C 250 150 250 250 350 250" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Cảnh báo mục tiêu</CardTitle>
              <a href="#" className="text-xs font-medium text-blue-600">Xem tất cả</a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 flex gap-3">
                  <div className="shrink-0 mt-0.5"><AlertCircle className="h-5 w-5 text-red-500 fill-red-100" /></div>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">2 mục tiêu nguy cơ trễ hạn</p>
                      <span className="text-[10px] text-slate-400">30 phút trước</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Tuyển sinh:</span> Tỷ lệ học sinh đạt học bổng<br/>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Vận hành:</span> Tỷ lệ xử lý sự cố đúng SLA
                    </p>
                  </div>
                </div>
                <div className="p-4 flex gap-3">
                  <div className="shrink-0 mt-0.5"><AlertTriangle className="h-5 w-5 text-orange-500 fill-orange-100" /></div>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">5 mục tiêu có tiến độ thấp</p>
                      <span className="text-[10px] text-slate-400">1 giờ trước</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Đào tạo: 2 mục tiêu<br/>Nhân sự: 2 mục tiêu<br/>Vận hành: 1 mục tiêu
                    </p>
                  </div>
                </div>
                <div className="p-4 flex gap-3">
                  <div className="shrink-0 mt-0.5"><Info className="h-5 w-5 text-blue-500 fill-blue-100" /></div>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">3 mục tiêu chưa cập nhật</p>
                      <span className="text-[10px] text-slate-400">3 giờ trước</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Nhân sự: 2 mục tiêu<br/>Vận hành: 1 mục tiêu
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" className="w-full text-sm text-blue-600">
                  Xem tất cả cảnh báo <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Việc cần theo dõi tuần này</CardTitle>
              <a href="#" className="text-xs font-medium text-blue-600">Xem tất cả</a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { text: 'Rà soát kế hoạch tuyển sinh Hè 2025', user: 'Phạm Thị Lan', date: '18/05/2025', urgent: true },
                  { text: 'Cập nhật tiến độ chương trình GDPT 2018', user: 'Trần Văn Hùng', date: '18/05/2025', urgent: true },
                  { text: 'Hoàn thiện bộ khung năng lực giáo viên', user: 'Lê Thị Mai', date: '20/05/2025' },
                  { text: 'Báo cáo chi phí vận hành Quý 2', user: 'Nguyễn Văn Nam', date: '20/05/2025' },
                  { text: 'Đánh giá hiệu quả phần mềm quản lý', user: 'Phạm Minh Tuấn', date: '21/05/2025' },
                ].map((task, i) => (
                  <div key={i} className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="mt-0.5"><div className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight mb-1 truncate">{task.text}</p>
                      <p className="text-xs text-slate-500">{task.user}</p>
                    </div>
                    <span className={cn("text-xs font-medium shrink-0", task.urgent ? "text-red-500" : "text-slate-500")}>{task.date}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" className="w-full text-sm text-blue-600 gap-2">
                  <Plus className="h-4 w-4" /> Thêm việc theo dõi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
