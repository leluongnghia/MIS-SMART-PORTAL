'use client';

import { useState } from 'react';
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
import { Dialog } from '@/src/components/ui/dialog';
import { cn } from '@/src/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const APPROVAL_DETAILS = {
  'Đề xuất mua sắm thiết bị CNTT': {
    code: 'DXMS-2025-0007',
    dept: 'Tin học',
    user: 'Trần Thị Mai',
    deadline: '16/05/2025 17:00',
    purpose: 'Trang bị bổ sung máy tính phục vụ giảng dạy và học tập thực hành môn Tin học theo chương trình mới GDPT 2018.',
    budget: '180,000,000đ',
    items: [
      { name: 'Máy tính để bàn Dell Inspiron 3020', qty: 10, price: '15,000,000đ', total: '150,000,000đ' },
      { name: 'Máy tính bảng Apple iPad Gen 9 WiFi', qty: 5, price: '6,000,000đ', total: '30,000,000đ' }
    ],
    attachments: ['De_xuat_mua_sam_CNTT.pdf', 'Bao_gia_thiet_bi.pdf', 'Cau_hinh_ky_thuat.xlsx'],
    timeline: [
      { step: 1, role: 'Lập đề xuất', user: 'Trần Thị Mai', date: '15/05/2025 09:12', done: true },
      { step: 2, role: 'Trưởng bộ phận', user: 'Phạm Quang Minh', date: '15/05/2025 14:20', done: true },
      { step: 3, role: 'Ban Giám hiệu', user: 'Chờ duyệt', date: '', active: true }
    ]
  },
  'Kế hoạch tổ chức Ngày hội STEM': {
    code: 'KH-STEM-2025-002',
    dept: 'Đoàn trường',
    user: 'Trần Thị Mai',
    deadline: '17/05/2025 17:00',
    purpose: 'Tổ chức ngày hội trải nghiệm khoa học STEM nhằm nâng cao tinh thần tự học, nghiên cứu và sáng tạo kỹ thuật cho học sinh toàn trường.',
    budget: '25,000,000đ',
    items: [
      { name: 'Kinh phí vật tư mô hình trưng bày', qty: 1, price: '8,000,000đ', total: '8,000,000đ' },
      { name: 'Giải thưởng cuộc thi chế tạo Robotics', qty: 1, price: '5,000,000đ', total: '5,000,000đ' },
      { name: 'Thuê âm thanh, ánh sáng, backdrop sân khấu', qty: 1, price: '12,000,000đ', total: '12,000,000đ' }
    ],
    attachments: ['Ke_hoach_ngay_hoi_STEM_2025.docx', 'Du_tru_chi_tiet_STEM.xlsx'],
    timeline: [
      { step: 1, role: 'Lập đề xuất', user: 'Trần Thị Mai', date: '16/05/2025 08:30', done: true },
      { step: 2, role: 'Ban Giám hiệu', user: 'Chờ duyệt', date: '', active: true }
    ]
  },
  'Quy chế chi tiêu nội bộ 2025-2026': {
    code: 'QCCT-2025-001',
    dept: 'Kế toán',
    user: 'Nguyễn Văn Nam',
    deadline: '18/05/2025 17:00',
    purpose: 'Cập nhật định mức thanh toán chi tiêu nội bộ, tiền làm thêm giờ (overtime) của giáo viên chuyên môn và cán bộ văn phòng phù hợp với ngân sách năm học mới.',
    budget: 'Theo định mức chi tiêu thực tế',
    items: [
      { name: 'Định mức thanh toán công tác phí', qty: 1, price: 'Tăng 10%', total: 'Theo thực chi' },
      { name: 'Định mức phụ cấp ngoài giờ giáo viên', qty: 1, price: '45,000đ/tiết', total: 'Theo thực dạy' }
    ],
    attachments: ['Quy_che_chi_tieu_noi_bo_2025_2026_Trinh_Ky.pdf'],
    timeline: [
      { step: 1, role: 'Lập đề xuất', user: 'Nguyễn Văn Nam', date: '16/05/2025 11:15', done: true },
      { step: 2, role: 'Ban Giám hiệu', user: 'Chờ duyệt', date: '', active: true }
    ]
  }
};

type TaskRow = {
  id?: string;
  title?: string;
  assignedName?: string | null;
  assignedId?: string | null;
  deadline?: string | null;
  status?: string;
  priority?: string;
  tag?: string | null;
};

const STATUS_COLUMNS = [
  { title: 'Cần làm', statuses: ['todo', 'received', 'open', 'new'] },
  { title: 'Đang xử lý', statuses: ['in_progress', 'doing', 'processing'] },
  { title: 'Chờ duyệt', statuses: ['pending_approval', 'pending', 'review'] },
  { title: 'Hoàn thành', statuses: ['completed', 'done', 'closed'] },
];

const formatTaskDate = (deadline?: string | null) => {
  if (!deadline) return 'Không có hạn';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return String(deadline);
  return date.toLocaleDateString('vi-VN');
};

const isOverdueTask = (task: TaskRow) => {
  if (!task.deadline || task.status === 'completed' || task.status === 'done') return false;
  const date = new Date(task.deadline);
  return !Number.isNaN(date.getTime()) && date < new Date();
};


export default function TasksDashboard({ initialData }: { initialData?: { data?: TaskRow[] } }) {
  const tasksList = initialData?.data || [];
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const getCardsByStatus = (statuses: string[]) => tasksList
    .filter(task => statuses.includes(String(task.status || '')))
    .map(task => ({
      title: task.title || 'Công việc chưa đặt tên',
      user: task.assignedName || task.assignedId || 'Chưa phân công',
      date: formatTaskDate(task.deadline),
      tag: task.priority === 'high' || isOverdueTask(task) ? (isOverdueTask(task) ? 'Quá hạn' : 'Ưu tiên') : task.tag || undefined,
      tagCol: isOverdueTask(task) ? 'bg-orange-100 text-orange-700' : task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700',
    }));
  const kanbanColumns = STATUS_COLUMNS.map(column => {
    const cards = getCardsByStatus(column.statuses);
    return { ...column, count: cards.length, cards };
  });
  const totalTasks = tasksList.length;
  const inProgressCount = tasksList.filter(task => ['in_progress', 'doing', 'processing'].includes(String(task.status))).length;
  const overdueCount = tasksList.filter(isOverdueTask).length;
  const pendingCount = tasksList.filter(task => ['pending_approval', 'pending', 'review'].includes(String(task.status))).length;
  const completedCount = tasksList.filter(task => ['completed', 'done', 'closed'].includes(String(task.status))).length;
  const completionRate = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;
  const taskStatsData = [
    { name: 'Cần làm', value: kanbanColumns[0]?.count || 0, color: '#3b82f6' },
    { name: 'Đang xử lý', value: inProgressCount, color: '#f59e0b' },
    { name: 'Chờ duyệt', value: pendingCount, color: '#8b5cf6' },
    { name: 'Hoàn thành', value: completedCount, color: '#10b981' },
  ];
  const chartTotal = Math.max(totalTasks, 1);
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
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</h3>
                  <span className="text-xs font-medium text-emerald-600">Từ dữ liệu DB</span>
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
                  <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">{overdueCount}</h3>
                  <span className="text-xs font-medium text-red-500">Đang quá hạn</span>
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
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{pendingCount}</h3>
                  <span className="text-xs font-medium text-emerald-600">Chờ xử lý</span>
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
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completionRate}%</h3>
                  <span className="text-xs font-medium text-emerald-600">{completedCount}/{totalTasks || 0} việc</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50">Xem chi tiết</Button>
          </CardContent>
        </Card>
      </div>

      {/* Standalone full-width Kanban Row */}
      <div className="w-full">
        <Card className="flex flex-col h-[650px] w-full">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base font-bold">Bảng công việc (Kanban)</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Nhóm theo:</span>
              <select className="bg-transparent font-medium border-0 focus:ring-0 p-0">
                <option>Trạng thái</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-x-auto custom-scrollbar flex gap-4 bg-slate-50/50 dark:bg-slate-900/30">
            {/* Columns */}
            {kanbanColumns.map((col, i) => (
              <div key={i} className="min-w-[220px] flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {col.title} <Badge  className={cn("px-1.5 py-0", col.title === 'Cần làm' ? 'bg-blue-100 text-blue-700' : col.title === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' : col.title === 'Chờ duyệt' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>{col.count}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {col.cards.map((card, j) => (
                    <div 
                      key={j} 
                      onClick={() => {
                        setSelectedTask({ ...card, status: col.title });
                        setIsTaskOpen(true);
                      }}
                      className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative group cursor-pointer hover:border-blue-400 dark:hover:border-blue-800 transition-colors"
                    >
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
      </div>

      {/* Row 2: Grid containing Process Detail and Pending Approvals side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">
        
        {/* Left Card: Process Detail */}
        <Card className="xl:col-span-7 h-[650px] flex flex-col">
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

        {/* Right Panel: Pending Approvals in the sidebar */}
        <div className="xl:col-span-5 space-y-6 h-[650px] flex flex-col">
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
                <div 
                  key={i} 
                  onClick={() => {
                    const matchedDetail = APPROVAL_DETAILS[appr.title as keyof typeof APPROVAL_DETAILS];
                    setSelectedApproval({ title: appr.title, ...matchedDetail });
                    setIsApprovalOpen(true);
                  }}
                  className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{appr.title}</h4>
                    <p className="text-[10px] text-slate-500">{appr.code}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><UserCircle className="h-3 w-3" /> {appr.user}</span>
                    <span className="text-red-500 font-medium">{appr.deadline}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-xs">Xem & Duyệt</Button>
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

      {/* Pending Approval Details Dialog */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen} title="Phê duyệt yêu cầu">
        {selectedApproval && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{selectedApproval.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedApproval.code} · Bộ phận: {selectedApproval.dept}</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0">Chờ phê duyệt</Badge>
            </div>
            
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Mục đích đề xuất:</p>
              <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                {selectedApproval.purpose}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Kinh phí đề xuất:</p>
              <p className="font-black text-blue-600 text-sm">{selectedApproval.budget}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Chi tiết hạng mục:</p>
              <table className="w-full text-left border border-slate-200 dark:border-slate-850 rounded overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500">
                  <tr>
                    <th className="p-2">Hạng mục</th>
                    <th className="p-2 text-center">SL</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {selectedApproval.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium">{item.name}</td>
                      <td className="p-2 text-center">{item.qty}</td>
                      <td className="p-2 text-right">{item.price}</td>
                      <td className="p-2 text-right font-bold text-slate-800 dark:text-slate-200">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Tệp đính kèm:</p>
              <div className="flex flex-wrap gap-2">
                {selectedApproval.attachments?.map((file: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[10px]">
                    <FileText className="h-3.5 w-3.5 text-red-500" />
                    <span className="font-medium truncate max-w-[150px]">{file}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Luồng phê duyệt:</p>
              <div className="space-y-2 pl-2 border-l-2 border-blue-500 dark:border-l-blue-900">
                {selectedApproval.timeline?.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="font-medium">{step.role}: <span className="font-bold">{step.user}</span></span>
                    <span className="text-slate-400">{step.date || 'Chờ xử lý'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Ý kiến phê duyệt:</label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Nhập phản hồi/lý do..."
                rows={2}
                className="w-full text-xs p-2 rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-850 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <Button 
                onClick={() => {
                  alert('Phê duyệt thành công đề xuất ' + selectedApproval.code);
                  setIsApprovalOpen(false);
                  setApprovalNote('');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-9"
              >
                Duyệt thông qua
              </Button>
              <Button 
                onClick={() => {
                  alert('Đã từ chối đề xuất ' + selectedApproval.code);
                  setIsApprovalOpen(false);
                  setApprovalNote('');
                }}
                variant="outline"
                className="flex-1 text-red-600 border-red-200 hover:bg-rose-50 hover:text-red-700 text-xs h-9"
              >
                Từ chối đề xuất
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Kanban Task Details Dialog */}
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen} title="Chi tiết công việc">
        {selectedTask && (
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{selectedTask.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5">Người phụ trách: {selectedTask.user}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 block">Thời hạn:</span>
                <span className="font-bold flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-slate-400" /> {selectedTask.date}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Trạng thái hiện tại:</span>
                <Badge className={cn("px-2 py-0 border-0 font-bold text-[10px]", 
                  selectedTask.status === 'Cần làm' ? 'bg-blue-100 text-blue-700' :
                  selectedTask.status === 'Đang xử lý' ? 'bg-amber-100 text-amber-700' :
                  selectedTask.status === 'Chờ duyệt' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                )}>{selectedTask.status}</Badge>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-500 block">Mô tả công việc:</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed">
                Nhiệm vụ thuộc kế hoạch chiến lược phát triển chuyên môn học kỳ. Cần rà soát số liệu thực tế, phối hợp cùng các thành viên tổ bộ phận liên quan để hoàn thiện đúng hạn chót BGH đề ra.
              </p>
            </div>

            {/* If the task is pending approval ('Chờ duyệt'), show approve buttons */}
            {selectedTask.status === 'Chờ duyệt' ? (
              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  onClick={() => {
                    alert('Đã duyệt hoàn thành công việc: ' + selectedTask.title);
                    setIsTaskOpen(false);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-9"
                >
                  Duyệt hoàn thành
                </Button>
                <Button 
                  onClick={() => {
                    alert('Đã yêu cầu chỉnh sửa lại công việc: ' + selectedTask.title);
                    setIsTaskOpen(false);
                  }}
                  variant="outline"
                  className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 text-xs h-9"
                >
                  Yêu cầu chỉnh sửa
                </Button>
              </div>
            ) : (
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button onClick={() => setIsTaskOpen(false)} className="text-xs h-9">
                  Đóng
                </Button>
              </div>
            )}
          </div>
        )}
      </Dialog>

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
                <span className="text-xl font-bold text-slate-900 dark:text-white">{totalTasks}</span>
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
                    {item.value} <span className="text-[9px] text-slate-400 font-normal">({Math.round((item.value / chartTotal) * 100)}%)</span>
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
