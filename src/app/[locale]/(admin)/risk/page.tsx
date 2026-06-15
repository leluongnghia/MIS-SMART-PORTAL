'use client';

import {
  ShieldAlert,
  Eye,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  SettingsIcon,
  Users,
  Scale,
  Megaphone,
  Lock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export default function RiskDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản trị rủi ro
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nhận diện, đánh giá và kiểm soát rủi ro để đảm bảo mục tiêu chiến lược và tuân thủ quy định.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Thứ Sáu, 16/05/2025</option>
          </select>
          <Button variant="outline" className="gap-2">
            <SettingsIcon className="h-4 w-4" /> Tùy chỉnh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-100 shadow-sm dark:border-red-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rủi ro nghiêm trọng</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">7</h3>
                  <span className="text-xs font-medium text-red-500">↑ 2 so với tháng trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm dark:border-orange-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Đang theo dõi</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">18</h3>
                  <span className="text-xs font-medium text-orange-500">↑ 3 so với tháng trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm dark:border-emerald-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Đã xử lý tháng này</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">12</h3>
                  <span className="text-xs font-medium text-emerald-500">↑ 4 so với tháng trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm dark:border-blue-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Mức độ tuân thủ</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">86%</h3>
                  <span className="text-xs font-medium text-emerald-500">↑ 6% so với tháng trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Xem chi tiết</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Heatmap */}
          <Card>
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">Ma trận rủi ro <AlertCircle className="h-4 w-4 text-slate-400" /></CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 relative flex">
                  {/* Y Axis Label */}
                  <div className="w-8 flex flex-col justify-center items-center">
                    <span className="transform -rotate-90 text-xs font-bold text-slate-500 whitespace-nowrap -translate-x-4">Mức độ ảnh hưởng</span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="grid grid-cols-6 gap-1 h-[250px]">
                      {/* Grid Labels Left */}
                      <div className="col-span-1 flex flex-col justify-between py-2 text-right pr-2 text-xs font-medium text-slate-500">
                        <div>Rất cao <span className="text-[10px] ml-1">5</span></div>
                        <div>Cao <span className="text-[10px] ml-1">4</span></div>
                        <div>Trung bình <span className="text-[10px] ml-1">3</span></div>
                        <div>Thấp <span className="text-[10px] ml-1">2</span></div>
                        <div>Rất thấp <span className="text-[10px] ml-1">1</span></div>
                      </div>
                      
                      {/* Grid Matrix (5x5) */}
                      <div className="col-span-5 grid grid-cols-5 grid-rows-5 gap-1">
                        {/* Row 5 */}
                        <div className="bg-emerald-200/50 rounded-sm"></div>
                        <div className="bg-emerald-200/50 rounded-sm"></div>
                        <div className="bg-yellow-300 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-yellow-600">1</div></div>
                        <div className="bg-orange-400 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-orange-600">2</div></div>
                        <div className="bg-red-500 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-red-600">1</div></div>
                        
                        {/* Row 4 */}
                        <div className="bg-emerald-300 rounded-sm"></div>
                        <div className="bg-emerald-300 rounded-sm"></div>
                        <div className="bg-yellow-300 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-yellow-600">2</div></div>
                        <div className="bg-orange-400 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-orange-600">3</div></div>
                        <div className="bg-orange-400 rounded-sm"></div>

                        {/* Row 3 */}
                        <div className="bg-emerald-400 rounded-sm"></div>
                        <div className="bg-emerald-300 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-emerald-600">3</div></div>
                        <div className="bg-yellow-300 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-yellow-600">2</div></div>
                        <div className="bg-yellow-300 rounded-sm"></div>
                        <div className="bg-orange-400 rounded-sm"></div>

                        {/* Row 2 */}
                        <div className="bg-emerald-400 rounded-sm"></div>
                        <div className="bg-emerald-400 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-emerald-600">4</div></div>
                        <div className="bg-emerald-300 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-emerald-600">1</div></div>
                        <div className="bg-yellow-300 rounded-sm"></div>
                        <div className="bg-yellow-300 rounded-sm"></div>

                        {/* Row 1 */}
                        <div className="bg-emerald-500 rounded-sm flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm text-emerald-600">2</div></div>
                        <div className="bg-emerald-400 rounded-sm"></div>
                        <div className="bg-emerald-400 rounded-sm"></div>
                        <div className="bg-emerald-300 rounded-sm"></div>
                        <div className="bg-emerald-300 rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* X Axis Label */}
                    <div className="grid grid-cols-6 gap-1 mt-2 text-center text-xs font-medium text-slate-500">
                      <div className="col-span-1"></div>
                      <div className="col-span-1">Rất thấp<br/><span className="text-[10px]">1</span></div>
                      <div className="col-span-1">Thấp<br/><span className="text-[10px]">2</span></div>
                      <div className="col-span-1">Trung bình<br/><span className="text-[10px]">3</span></div>
                      <div className="col-span-1">Cao<br/><span className="text-[10px]">4</span></div>
                      <div className="col-span-1">Rất cao<br/><span className="text-[10px]">5</span></div>
                    </div>
                    <div className="text-center text-xs font-bold text-slate-500 mt-2 pl-[16.66%]">
                      Khả năng xảy ra
                    </div>
                  </div>
                </div>

                {/* Risk Distribution Summary */}
                <div className="w-full md:w-64 shrink-0 flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> <span className="font-medium text-slate-700">Rủi ro rất cao</span></div>
                    <span className="font-bold">4</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400" /> <span className="font-medium text-slate-700">Rủi ro cao</span></div>
                    <span className="font-bold">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400" /> <span className="font-medium text-slate-700">Rủi ro trung bình</span></div>
                    <span className="font-bold">7</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-300" /> <span className="font-medium text-slate-700">Rủi ro thấp</span></div>
                    <span className="font-bold">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="font-medium text-slate-700">Rủi ro rất thấp</span></div>
                    <span className="font-bold">2</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Tổng số rủi ro</span>
                    <span className="font-black text-lg">23</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Priority List */}
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">Danh mục rủi ro ưu tiên <AlertCircle className="h-4 w-4 text-slate-400" /></CardTitle>
                <div className="flex items-center gap-2">
                  <select className="h-8 rounded-md border border-slate-200 px-2 text-xs bg-transparent">
                    <option>Tất cả danh mục</option>
                  </select>
                  <select className="h-8 rounded-md border border-slate-200 px-2 text-xs bg-transparent">
                    <option>Tất cả mức độ</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Tìm kiếm rủi ro..." className="h-8 w-48 rounded-md border border-slate-200 pl-8 pr-3 text-xs bg-transparent" />
                  </div>
                  <Button variant="outline" size="icon" className="h-8 w-8"><Filter className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-bold">#</th>
                    <th className="px-4 py-3 font-bold">Rủi ro</th>
                    <th className="px-4 py-3 font-bold">Danh mục</th>
                    <th className="px-4 py-3 font-bold text-center">Mức độ</th>
                    <th className="px-4 py-3 font-bold text-center">Khả năng xảy ra</th>
                    <th className="px-4 py-3 font-bold">Chủ sở hữu</th>
                    <th className="px-4 py-3 font-bold">Kế hoạch giảm thiểu</th>
                    <th className="px-4 py-3 font-bold">Hạn xử lý</th>
                    <th className="px-4 py-3 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { id: '1', title: 'Thâm hụt ngân sách vượt kế hoạch', cat: 'Tài chính', catIcon: DollarSign, catCol: 'bg-purple-100 text-purple-600', level: 'Rất cao', levelCol: 'text-red-600 border-red-200 bg-red-50', prob: 'Cao', probCol: 'text-orange-600 border-orange-200 bg-orange-50', owner: 'Phạm Thị Lan', ownerRole: 'Phó hiệu trưởng', plan: 'Rà soát chi phí, kiểm soát ngân sách theo tháng', date: '31/05/2025', status: 'Đang xử lý', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { id: 'R02', title: 'Gián đoạn hoạt động do sự cố hệ thống', cat: 'Hoạt động', catIcon: SettingsIcon, catCol: 'bg-blue-100 text-blue-600', level: 'Cao', levelCol: 'text-orange-600 border-orange-200 bg-orange-50', prob: 'Trung bình', probCol: 'text-yellow-600 border-yellow-200 bg-yellow-50', owner: 'Trần Văn Hùng', ownerRole: 'Trưởng phòng CNTT', plan: 'Sao lưu dữ liệu, kiểm thử DR định kỳ', date: '15/06/2025', status: 'Đang theo dõi', statCol: 'text-orange-600 border-orange-200 bg-orange-50' },
                    { id: 'R03', title: 'Thiếu giáo viên cốt lõi', cat: 'Nhân sự', catIcon: Users, catCol: 'bg-indigo-100 text-indigo-600', level: 'Cao', levelCol: 'text-orange-600 border-orange-200 bg-orange-50', prob: 'Cao', probCol: 'text-orange-600 border-orange-200 bg-orange-50', owner: 'Lê Thị Mai', ownerRole: 'Trưởng phòng TC-HC', plan: 'Kế hoạch tuyển dụng, phát triển nguồn thay thế', date: '30/06/2025', status: 'Đang xử lý', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { id: 'R04', title: 'Không tuân thủ quy định tài chính', cat: 'Tuân thủ', catIcon: Scale, catCol: 'bg-violet-100 text-violet-600', level: 'Cao', levelCol: 'text-orange-600 border-orange-200 bg-orange-50', prob: 'Trung bình', probCol: 'text-yellow-600 border-yellow-200 bg-yellow-50', owner: 'Nguyễn Văn Nam', ownerRole: 'Hiệu trưởng', plan: 'Đào tạo, kiểm tra tuân thủ định kỳ', date: '20/06/2025', status: 'Đang theo dõi', statCol: 'text-orange-600 border-orange-200 bg-orange-50' },
                    { id: 'R05', title: 'Suy giảm uy tín do phản hồi tiêu cực', cat: 'Danh tiếng', catIcon: Megaphone, catCol: 'bg-fuchsia-100 text-fuchsia-600', level: 'Trung bình', levelCol: 'text-yellow-600 border-yellow-200 bg-yellow-50', prob: 'Trung bình', probCol: 'text-yellow-600 border-yellow-200 bg-yellow-50', owner: 'Vũ Thị Hạnh', ownerRole: 'Trưởng phòng Tuyển thông', plan: 'Theo dõi truyền thông, phản hồi kịp thời', date: '30/06/2025', status: 'Kế hoạch', statCol: 'text-blue-600 border-blue-200 bg-blue-50' },
                    { id: 'R06', title: 'Rò rỉ dữ liệu học sinh', cat: 'An toàn dữ liệu', catIcon: Lock, catCol: 'bg-sky-100 text-sky-600', level: 'Rất cao', levelCol: 'text-red-600 border-red-200 bg-red-50', prob: 'Trung bình', probCol: 'text-yellow-600 border-yellow-200 bg-yellow-50', owner: 'Trần Văn Hùng', ownerRole: 'Trưởng phòng CNTT', plan: 'Mã hóa dữ liệu, phân quyền truy cập', date: '25/05/2025', status: 'Đang xử lý', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 text-[11px] text-slate-500 font-medium">{row.id}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-slate-900 dark:text-white max-w-[200px] truncate" title={row.title}>{row.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", row.catCol)}><row.catIcon className="h-3 w-3" /></div>
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{row.cat}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center"><Badge  className={cn("text-[10px] py-0 border-0", row.levelCol)}>{row.level}</Badge></td>
                      <td className="px-4 py-3 text-center"><Badge  className={cn("text-[10px] py-0 border-0", row.probCol)}>{row.prob}</Badge></td>
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">{row.owner}</p>
                        <p className="text-[10px] text-slate-500">{row.ownerRole}</p>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={row.plan}>{row.plan}</td>
                      <td className="px-4 py-3 text-[11px] text-slate-900 dark:text-slate-100">{row.date}</td>
                      <td className="px-4 py-3"><Badge  className={cn("text-[10px] py-0 border-0", row.statCol)}>{row.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 pl-1">Hiển thị 1 - 6 / 23 rủi ro</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" className="h-7 w-7 p-0 bg-blue-600 text-white border-blue-600">1</Button>
                  <Button variant="ghost" className="h-7 w-7 p-0 text-slate-600">2</Button>
                  <Button variant="ghost" className="h-7 w-7 p-0 text-slate-600">3</Button>
                  <Button variant="ghost" className="h-7 w-7 p-0 text-slate-600">4</Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
                  <select className="text-xs border-slate-200 rounded-md bg-transparent py-1 pl-2 pr-6 ml-2">
                    <option>10 / trang</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Rủi ro nổi bật</CardTitle>
              <a href="#" className="text-xs font-medium text-blue-600">Xem tất cả</a>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5"><DollarSign className="h-3 w-3" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">Thâm hụt ngân sách vượt kế hoạch</h4>
                  <p className="text-[10px] text-slate-500 mb-2">Tài chính</p>
                  <div className="flex items-center gap-2">
                    <Badge  className="text-[10px] py-0 border-0 bg-red-50 text-red-600">Rất cao</Badge>
                    <span className="text-[10px] text-slate-400">Hạn xử lý: 31/05/2025</span>
                  </div>
                </div>
              </div>
              <div className="p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5"><Lock className="h-3 w-3" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">Rò rỉ dữ liệu học sinh</h4>
                  <p className="text-[10px] text-slate-500 mb-2">An toàn dữ liệu</p>
                  <div className="flex items-center gap-2">
                    <Badge  className="text-[10px] py-0 border-0 bg-red-50 text-red-600">Rất cao</Badge>
                    <span className="text-[10px] text-slate-400">Hạn xử lý: 25/05/2025</span>
                  </div>
                </div>
              </div>
              <div className="p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5"><SettingsIcon className="h-3 w-3" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">Gián đoạn hoạt động do sự cố hệ thống</h4>
                  <p className="text-[10px] text-slate-500 mb-2">Hoạt động</p>
                  <div className="flex items-center gap-2">
                    <Badge  className="text-[10px] py-0 border-0 bg-orange-50 text-orange-600">Cao</Badge>
                    <span className="text-[10px] text-slate-400">Hạn xử lý: 15/06/2025</span>
                  </div>
                </div>
              </div>
              <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50">
                <Button variant="ghost" className="text-sm font-medium text-blue-600 p-0 h-auto">Xem tất cả rủi ro nổi bật</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Biện pháp giảm thiểu</CardTitle>
              <a href="#" className="text-xs font-medium text-blue-600">Xem tất cả</a>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {[
                { title: 'Rà soát & kiểm soát ngân sách', prog: 80, icon: FileText },
                { title: 'Sao lưu & phục hồi hệ thống', prog: 70, icon: SettingsIcon },
                { title: 'Kế hoạch tuyển dụng', prog: 65, icon: Users },
                { title: 'Đào tạo tuân thủ', prog: 60, icon: ShieldCheck },
                { title: 'Phản hồi truyền thông', prog: 50, icon: Megaphone },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate mb-1">{item.title}</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.prog}%` }} />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold w-6 text-right">{item.prog}%</div>
                </div>
              ))}
              <div className="mt-4 pt-2 border-t border-slate-100 text-center">
                <Button variant="ghost" className="text-sm font-medium text-blue-600 p-0 h-auto">Xem tất cả biện pháp</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold">Sự cố gần đây</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                {[
                  { time: '15/05/2025 09:45', text: 'Cảnh báo: Đăng nhập bất thường', desc: 'Hệ thống quản trị học sinh', status: 'Đang xử lý', statusColor: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
                  { time: '14/05/2025 16:20', text: 'Gián đoạn email nội bộ', desc: 'Dịch vụ email', status: 'Đã khắc phục', statusColor: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
                  { time: '13/05/2025 11:08', text: 'Lỗi phần mềm chấm điểm', desc: 'Phần mềm học tập', status: 'Đã khắc phục', statusColor: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
                ].map((act, i) => (
                  <div key={i} className="relative pl-6">
                    <div className={cn("absolute left-0 top-1 h-2.5 w-2.5 rounded-full border-[2px] border-white dark:border-slate-950 z-10", act.dot)} />
                    {i !== 2 && <div className="absolute left-1 top-3 h-full w-[1px] bg-slate-200 dark:bg-slate-800" />}
                    
                    <div className="text-[10px] text-slate-400 mb-1 font-medium">{act.time}</div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1">{act.text}</div>
                        <div className="text-[11px] text-slate-500">{act.desc}</div>
                      </div>
                      <Badge  className={cn("border-0 shrink-0 text-[10px] px-1.5 py-0.5", act.statusColor)}>{act.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-100 pt-3 text-center">
                <Button variant="ghost" className="text-sm font-medium text-blue-600 p-0 h-auto">Xem tất cả sự cố</Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
