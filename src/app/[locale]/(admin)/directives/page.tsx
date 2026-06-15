'use client';

import { ChevronRight, ArrowRight, 
  FileText,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Paperclip,
  Download,
  Users,
  CheckCircle2,
  Circle,
  MessageSquare,
  ThumbsUp,
  CornerDownRight,
  Smile,
  ImageIcon,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export default function DirectivesDashboard() {
  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Chỉ đạo BGH & Phản hồi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý chỉ đạo từ Ban Giám hiệu và theo dõi phản hồi, xử lý từ các đơn vị
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="block w-56 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Tuần này (12/05/2025 - 18/05/2025)</option>
          </select>
          <Button variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 gap-2">
            <Filter className="h-4 w-4" /> Bộ lọc nâng cao
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-100 shadow-sm dark:border-blue-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 dark:bg-blue-900/30 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Chỉ thị mới hôm nay</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">8</h3>
                  <span className="text-xs font-medium text-emerald-600">↑ 2 so với hôm qua</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm dark:border-orange-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 dark:bg-orange-900/30 dark:text-orange-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Đang chờ phản hồi</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">16</h3>
                  <span className="text-xs font-medium text-red-500">↑ 4 so với hôm qua</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm dark:border-red-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quá hạn cần xử lý</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">4</h3>
                  <span className="text-xs font-medium text-red-500">↑ 1 so với hôm qua</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 shadow-sm dark:border-indigo-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tỷ lệ hoàn thành tuần</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">78.6%</h3>
                  <span className="text-xs font-medium text-emerald-600">↑ 5.4% so với tuần trước</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Xem chi tiết</Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            <Button variant="outline" size="sm" className="h-8 rounded-full bg-blue-50 text-blue-700 border-blue-200">
              Tất cả <Badge className="ml-1.5 bg-blue-200 text-blue-700 hover:bg-blue-200">32</Badge>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-600">
              Khẩn cấp <Badge  className="ml-1.5 bg-slate-100 text-slate-500">4</Badge>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-600">
              Chờ phản hồi <Badge  className="ml-1.5 bg-slate-100 text-slate-500">16</Badge>
            </Button>
          </div>

          <Card className="h-[800px] flex flex-col">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-base font-bold">Danh sách chỉ đạo</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Filter className="h-4 w-4" /></Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chỉ đạo..."
                  className="w-full rounded-md border-slate-200 pl-8 pr-4 py-2 text-sm focus:ring-blue-600 dark:bg-slate-900 dark:border-slate-700"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { tag: 'Khẩn cấp', tagColor: 'text-red-600 border-red-200 bg-red-50', title: 'Tăng cường công tác ôn thi tốt nghiệp THPT 2025', dept: 'Phòng Đào tạo', deadline: '20/05/2025', status: 'Chờ phản hồi', statCol: 'text-blue-600', active: true },
                { tag: 'Quan trọng', tagColor: 'text-orange-600 border-orange-200 bg-orange-50', title: 'Rà soát và cập nhật kế hoạch dạy học HKII', dept: 'Tổ chuyên môn', deadline: '18/05/2025', status: 'Đã hoàn thành', statCol: 'text-emerald-600' },
                { tag: 'Trung bình', tagColor: 'text-blue-600 border-blue-200 bg-blue-50', title: 'Báo cáo tình hình cơ sở vật chất tháng 5', dept: 'Phòng Hành chính', deadline: '22/05/2025', status: 'Chờ phản hồi', statCol: 'text-blue-600' },
                { tag: 'Quan trọng', tagColor: 'text-orange-600 border-orange-200 bg-orange-50', title: 'Tổ chức hoạt động trải nghiệm hè cho HS', dept: 'Đoàn TN - GVCN', deadline: '25/05/2025', status: 'Chưa bắt đầu', statCol: 'text-slate-500' },
                { tag: 'Trung bình', tagColor: 'text-yellow-600 border-yellow-200 bg-yellow-50', title: 'Hoàn thiện hồ sơ kiểm định chất lượng', dept: 'Phòng Đảm bảo CL', deadline: '30/05/2025', status: 'Chờ phản hồi', statCol: 'text-blue-600' },
                { tag: 'Thấp', tagColor: 'text-emerald-600 border-emerald-200 bg-emerald-50', title: 'Cập nhật dữ liệu học sinh lên hệ thống', dept: 'Văn phòng', deadline: '16/05/2025', status: 'Đã hoàn thành', statCol: 'text-emerald-600' },
              ].map((item, i) => (
                <div key={i} className={cn("p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors", item.active && "bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-600")}>
                  <Badge  className={cn("text-[10px] mb-2 px-1.5 py-0 border-0", item.tagColor)}>{item.tag}</Badge>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{item.dept}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3" /> Hạn: {item.deadline}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", item.statCol.replace('text-', 'bg-'))} />
                      <span className={cn("text-[11px] font-medium", item.statCol)}>{item.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Detail */}
        <div className="lg:col-span-6 h-[800px]">
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0">Khẩn cấp</Badge>
                  <span className="text-xs text-slate-500 font-medium">Mã chỉ đạo: CD20250516-001</span>
                </div>
                <span className="text-xs text-slate-400">Được giao lúc: 16/05/2025 08:30</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Tăng cường công tác ôn thi tốt nghiệp THPT 2025</h2>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-6">
                
                {/* Nội dung */}
                <div>
                  <h4 className="text-sm font-bold mb-2">Nội dung chỉ đạo</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Yêu cầu Phòng Đào tạo phối hợp với các tổ chuyên môn xây dựng kế hoạch ôn tập chi tiết cho các khối 12, đảm bảo chất lượng và hiệu quả. Báo cáo tiến độ hàng tuần về BGH.
                  </p>
                </div>

                {/* Tệp đính kèm */}
                <div>
                  <h4 className="text-sm font-bold mb-3">Tệp đính kèm (2)</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-64 hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">Ke_hoach_on_thi_TN_THPT_2025.pdf</p>
                        <p className="text-[10px] text-slate-400">1.2 MB</p>
                      </div>
                      <Download className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-64 hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">Huong_dan_on_tap_mon_Toan.docx</p>
                        <p className="text-[10px] text-slate-400">856 KB</p>
                      </div>
                      <Download className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Đơn vị thực hiện */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold mb-3">Đơn vị/Người thực hiện</h4>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-950 z-20">
                          <Users className="h-4 w-4" />
                        </div>
                        <img src="https://i.pravatar.cc/150?u=12" className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-950 z-10" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Phòng Đào tạo</p>
                        <p className="text-xs text-slate-500">Trưởng phòng: Trần Thị Mai</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600">Xem chi tiết</Button>
                  </div>
                </div>

                {/* Checklist */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="text-sm font-bold">Checklist thực hiện (3/5)</h4>
                    <span className="text-sm font-bold text-blue-600">60%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { text: 'Xây dựng kế hoạch ôn tập chi tiết cho từng môn', done: true },
                      { text: 'Phân công giáo viên phụ trách các lớp ôn tập', done: true },
                      { text: 'Tổ chức kiểm tra đánh giá định kỳ', done: false },
                      { text: 'Báo cáo tiến độ hàng tuần về BGH', done: false },
                      { text: 'Tổng kết và rút kinh nghiệm sau kỳ thi', done: false },
                    ].map((cl, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        {cl.done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span className={cn(cl.done ? "text-slate-500 line-through" : "text-slate-700 dark:text-slate-300 font-medium")}>{cl.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status bar */}
                <div className="flex gap-12 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Hạn hoàn thành</p>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span className="font-bold">20/05/2025</span>
                      <span className="text-xs text-red-500 font-medium ml-2">Còn 4 ngày</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                    <Badge  className="text-blue-600 border-blue-200 bg-blue-50 py-0.5">Chờ phản hồi</Badge>
                  </div>
                </div>

                {/* Comments */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      Trao đổi & Phản hồi <Badge  className="bg-blue-100 text-blue-700 hover:bg-blue-100">3</Badge>
                    </h4>
                  </div>
                  <div className="space-y-6">
                    {/* Comment 1 */}
                    <div className="flex gap-3">
                      <img src="https://i.pravatar.cc/150?u=12" className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">Trần Thị Mai</span>
                          <span className="text-xs font-medium text-slate-500">(Phòng Đào tạo)</span>
                          <span className="text-[10px] text-slate-400">16/05/2025 09:15</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Đã nhận chỉ đạo. Phòng Đào tạo sẽ triển khai xây dựng kế hoạch trong ngày hôm nay.</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <button className="flex items-center gap-1 hover:text-blue-600"><ThumbsUp className="h-3.5 w-3.5" /> Thích</button>
                          <button className="flex items-center gap-1 hover:text-blue-600"><CornerDownRight className="h-3.5 w-3.5" /> Trả lời</button>
                        </div>
                      </div>
                    </div>
                    {/* Reply 1 */}
                    <div className="flex gap-3 ml-11">
                      <img src="https://i.pravatar.cc/150?u=15" className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">Lê Văn Hùng</span>
                          <span className="text-xs font-medium text-slate-500">(Tổ Toán)</span>
                          <span className="text-[10px] text-slate-400">16/05/2025 10:02</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Tổ Toán đề xuất bổ sung 2 buổi ôn tập buổi chiều thứ 7 hàng tuần cho khối 12.</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <button className="flex items-center gap-1 hover:text-blue-600"><ThumbsUp className="h-3.5 w-3.5" /> Thích</button>
                          <button className="flex items-center gap-1 hover:text-blue-600"><CornerDownRight className="h-3.5 w-3.5" /> Trả lời</button>
                        </div>
                      </div>
                    </div>
                    {/* Reply 2 */}
                    <div className="flex gap-3 ml-11">
                      <img src="https://i.pravatar.cc/150?u=12" className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">Trần Thị Mai</span>
                          <span className="text-xs font-medium text-slate-500">(Phòng Đào tạo)</span>
                          <span className="text-[10px] text-slate-400">16/05/2025 10:30</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Cảm ơn góp ý. Đã cập nhật vào kế hoạch và sẽ thông báo tới các tổ chuyên môn.</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <button className="flex items-center gap-1 hover:text-blue-600"><ThumbsUp className="h-3.5 w-3.5" /> Thích</button>
                          <button className="flex items-center gap-1 hover:text-blue-600"><CornerDownRight className="h-3.5 w-3.5" /> Trả lời</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="ghost" className="text-sm text-blue-600">Xem thêm 1 phản hồi khác <ChevronRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold">Phản hồi nhanh</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold mb-1 block">Người phản hồi <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900/50">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-medium flex-1">Phòng Đào tạo</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">Nội dung phản hồi <span className="text-red-500">*</span></label>
                <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                  <textarea 
                    className="w-full min-h-[100px] p-3 text-sm border-0 focus:ring-0 resize-none dark:bg-slate-950" 
                    placeholder="Nhập nội dung phản hồi..."
                  ></textarea>
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-blue-600"><Paperclip className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-blue-600"><Smile className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-blue-600"><ImageIcon className="h-4 w-4" /></Button>
                    </div>
                    <span className="text-[10px] text-slate-400">0/1000</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">Đính kèm tệp</label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 border-dashed border-slate-300 dark:border-slate-600">Chọn tệp</Button>
                  <span className="text-xs text-slate-400">Không có tệp nào được chọn</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Gửi phản hồi</Button>
                <Button variant="outline" className="flex-1">Lưu nháp</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Phê duyệt liên quan</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex gap-1.5 items-center pl-1.5 pr-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đã phê duyệt
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-xs font-bold mb-4">Luồng phê duyệt</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight mb-0.5">Hiệu trưởng</p>
                    <p className="text-xs text-slate-500">Nguyễn Văn Nam</p>
                  </div>
                  <div className="text-[10px] text-slate-400">16/05/2025 08:30</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight mb-0.5">Phó Hiệu trưởng</p>
                    <p className="text-xs text-slate-500">Phạm Thị Lan</p>
                  </div>
                  <div className="text-[10px] text-slate-400">16/05/2025 08:35</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight mb-0.5">Phòng KH&ĐT</p>
                    <p className="text-xs text-slate-500">Trần Minh Đức</p>
                  </div>
                  <div className="text-[10px] text-slate-400">16/05/2025 08:40</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold">Lịch sử hoạt động</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-5">
                {[
                  { time: '16/05/2025 08:30', text: 'Nguyễn Văn Nam tạo chỉ đạo' },
                  { time: '16/05/2025 09:15', text: 'Trần Thị Mai đã phản hồi' },
                  { time: '16/05/2025 10:02', text: 'Lê Văn Hùng bình luận' },
                  { time: '16/05/2025 10:30', text: 'Trần Thị Mai bình luận' },
                ].map((act, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-slate-300 border-[2px] border-white dark:border-slate-950 z-10" />
                    {i !== 3 && <div className="absolute left-1 top-3 h-full w-[1px] bg-slate-200 dark:bg-slate-800" />}
                    
                    <div className="text-[10px] text-slate-400 mb-0.5 font-medium">{act.time}</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">{act.text}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="ghost" className="text-sm font-medium text-blue-600 p-0 h-auto">Xem tất cả lịch sử <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function CalendarDays(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}
