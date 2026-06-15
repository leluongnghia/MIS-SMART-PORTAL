import React, { useMemo, useState } from 'react';
import {
  Award,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Edit3,
  FileText,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../lib/utils';

type PipelineStatus = 'new' | 'contacted' | 'consulted' | 'submitted' | 'reviewing';

interface PipelineCard {
  id: string;
  name: string;
  grade: string;
  createdAt: string;
  advisor: string;
  status: PipelineStatus;
}

const kpis = [
  { label: 'Lead mới', value: '56', delta: '+18%', icon: Users, tint: 'text-violet-600 bg-violet-50' },
  { label: 'Hồ sơ đang xử lý', value: '342', delta: '+12%', icon: FileText, tint: 'text-blue-600 bg-blue-50' },
  { label: 'Đã nhập học', value: '128', delta: '+8%', icon: CheckCircle2, tint: 'text-emerald-600 bg-emerald-50' },
  { label: 'Tỷ lệ chuyển đổi', value: '18.45%', delta: '+2.6%', icon: Target, tint: 'text-rose-600 bg-rose-50' },
  { label: 'Doanh thu dự kiến', value: '12.45 tỷ', delta: '+15%', icon: WalletCards, tint: 'text-amber-600 bg-amber-50' },
  { label: 'Chỉ tiêu hoàn thành', value: '82%', delta: '1,248 / 1,520', icon: Award, tint: 'text-cyan-600 bg-cyan-50', progress: 82 },
];

const funnel = [
  { label: 'Lead mới', value: 1248, percent: '100%', width: 100, color: '#2563EB' },
  { label: 'Đã liên hệ', value: 956, percent: '76.6%', width: 88, color: '#4F46E5' },
  { label: 'Đã tư vấn', value: 588, percent: '47.2%', width: 76, color: '#0EA5E9' },
  { label: 'Đã nộp hồ sơ', value: 432, percent: '34.6%', width: 64, color: '#14B8A6' },
  { label: 'Đang xét duyệt', value: 265, percent: '21.2%', width: 52, color: '#F59E0B' },
  { label: 'Đã đóng học phí', value: 189, percent: '15.1%', width: 42, color: '#F97316' },
  { label: 'Đã nhập học', value: 128, percent: '10.3%', width: 32, color: '#EF4444' },
];

const conversionTrend = [
  { date: '01/05', leads: 720, consulted: 430, enrolled: 120 },
  { date: '06/05', leads: 1080, consulted: 760, enrolled: 260 },
  { date: '11/05', leads: 980, consulted: 620, enrolled: 210 },
  { date: '16/05', leads: 1190, consulted: 700, enrolled: 180 },
  { date: '21/05', leads: 1110, consulted: 790, enrolled: 280 },
  { date: '26/05', leads: 1240, consulted: 730, enrolled: 230 },
  { date: '31/05', leads: 1350, consulted: 820, enrolled: 260 },
];

const sources = [
  { name: 'Facebook Ads', value: 489, color: '#2563EB' },
  { name: 'Website', value: 276, color: '#22C55E' },
  { name: 'Zalo OA', value: 191, color: '#06B6D4' },
  { name: 'Giới thiệu', value: 155, color: '#F59E0B' },
  { name: 'TikTok Ads', value: 84, color: '#F97316' },
  { name: 'Sự kiện', value: 53, color: '#8B5CF6' },
];

const advisors = [
  { name: 'Lê Hồng Nhung', leads: 128, percent: 36.5, avatar: 'LN' },
  { name: 'Phạm Thu Hằng', leads: 96, percent: 28.3, avatar: 'PH' },
  { name: 'Trần Văn Minh', leads: 76, percent: 21.1, avatar: 'TM' },
  { name: 'Nguyễn Hoàng Nam', leads: 52, percent: 14.1, avatar: 'NN' },
  { name: 'Khác', leads: 12, percent: 3.5, avatar: 'K' },
];

const initialCards: PipelineCard[] = [
  { id: '1', name: 'Nguyễn Hoàng Bảo', grade: 'Lớp 10', createdAt: '23/05/2025', advisor: 'Lê Hồng Nhung', status: 'new' },
  { id: '2', name: 'Trần Minh Anh', grade: 'Lớp 11', createdAt: '22/05/2025', advisor: 'Phạm Thu Hằng', status: 'new' },
  { id: '3', name: 'Lê Quang Huy', grade: 'Lớp 10', createdAt: '19/05/2025', advisor: 'Trần Văn Minh', status: 'contacted' },
  { id: '4', name: 'Phạm Ngọc Lan', grade: 'Lớp 12', createdAt: '18/05/2025', advisor: 'Nguyễn Hoàng Nam', status: 'contacted' },
  { id: '5', name: 'Đỗ Gia Bảo', grade: 'Lớp 10', createdAt: '16/05/2025', advisor: 'Lê Hồng Nhung', status: 'consulted' },
  { id: '6', name: 'Nguyễn Thu Hà', grade: 'Lớp 9', createdAt: '15/05/2025', advisor: 'Phạm Thu Hằng', status: 'consulted' },
  { id: '7', name: 'Hoàng Minh Đức', grade: 'Lớp 12', createdAt: '13/05/2025', advisor: 'Trần Văn Minh', status: 'submitted' },
  { id: '8', name: 'Vũ Mỹ Anh', grade: 'Lớp 10', createdAt: '12/05/2025', advisor: 'Lê Hồng Nhung', status: 'submitted' },
  { id: '9', name: 'Bùi Quốc Anh', grade: 'Lớp 11', createdAt: '10/05/2025', advisor: 'Nguyễn Hoàng Nam', status: 'reviewing' },
  { id: '10', name: 'Lê Thanh Tùng', grade: 'Lớp 10', createdAt: '09/05/2025', advisor: 'Phạm Thu Hằng', status: 'reviewing' },
];

const columns: Array<{ id: PipelineStatus; label: string; tint: string }> = [
  { id: 'new', label: 'Lead mới', tint: 'bg-blue-50 border-blue-100' },
  { id: 'contacted', label: 'Đã liên hệ', tint: 'bg-cyan-50 border-cyan-100' },
  { id: 'consulted', label: 'Đã tư vấn', tint: 'bg-violet-50 border-violet-100' },
  { id: 'submitted', label: 'Đã nộp hồ sơ', tint: 'bg-amber-50 border-amber-100' },
  { id: 'reviewing', label: 'Đang xét duyệt', tint: 'bg-rose-50 border-rose-100' },
];

const todos = [
  ['Gọi điện tư vấn 12 Lead', 'Ưu tiên cao', 'bg-rose-50 text-rose-700 border-rose-100'],
  ['Theo dõi 8 hồ sơ quá hạn', 'Ưu tiên cao', 'bg-rose-50 text-rose-700 border-rose-100'],
  ['Gửi thông tin học bổng', 'Ưu tiên trung bình', 'bg-amber-50 text-amber-700 border-amber-100'],
  ['Xác nhận lịch phỏng vấn', 'Ưu tiên trung bình', 'bg-amber-50 text-amber-700 border-amber-100'],
  ['Báo cáo tuần', 'Ưu tiên thấp', 'bg-slate-50 text-slate-600 border-slate-100'],
];

const recentActivities = [
  ['10:15', 'Lê Hồng Nhung tạo Lead mới', 'Nguyễn Hoàng Bảo - Lớp 10'],
  ['10:02', 'Phạm Thu Hằng cập nhật trạng thái', 'Trần Gia Bảo - Đã tư vấn'],
  ['09:45', 'Trần Văn Minh gửi Email', 'Gửi thông tin chương trình học bổng'],
  ['09:30', 'Nguyễn Hoàng Nam tạo lịch hẹn', 'Hẹn tư vấn trực tiếp 16:00'],
];

const paymentRows = [
  ['Nguyễn Hoàng Bảo', 'Lớp 10', '150,000,000', '50,000,000', '100,000,000', 'Đã cọc'],
  ['Trần Gia Bảo', 'Lớp 10', '150,000,000', '150,000,000', '0', 'Đã đóng'],
  ['Lê Minh Anh', 'Lớp 11', '180,000,000', '0', '180,000,000', 'Chưa thu'],
];

export default function AdmissionsEnterpriseDashboard() {
  const [cards, setCards] = useState(initialCards);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const selectedLead = cards[0];

  const cardsByStatus = useMemo(() => {
    return columns.map(column => ({
      ...column,
      items: cards.filter(card => card.status === column.id),
    }));
  }, [cards]);

  const moveCard = (status: PipelineStatus) => {
    if (!draggingId) return;
    setCards(current => current.map(card => card.id === draggingId ? { ...card, status } : card));
    setDraggingId(null);
  };

  return (
    <div className="relative min-h-screen bg-[#F7F8FA] text-slate-950">
      <div className="mx-auto max-w-[1800px] space-y-5 p-1 md:p-2">
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                <span>ADMISSIONS CRM SAAS</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>Dữ liệu cập nhật: 10:30 AM hôm nay</span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Tổng quan tuyển sinh</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <ControlButton label="01/05/2025 - 31/05/2025" icon={CalendarDays} />
              <ControlButton label="Năm học 2025 - 2026" icon={ChevronDown} />
              <ControlButton label="Campus chính" icon={ChevronDown} />
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
                <Settings className="h-4 w-4" />
                Tùy chỉnh
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {kpis.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.03)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500">{item.label}</p>
                      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{item.value}</p>
                    </div>
                    <div className={cn('grid h-9 w-9 place-items-center rounded-xl', item.tint)}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  {item.progress ? (
                    <div className="mt-4">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.progress}%` }} />
                      </div>
                      <p className="mt-2 text-[11px] font-bold text-slate-500">{item.delta}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs font-bold text-emerald-600">↑ {item.delta} so với tuần trước</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,40%)]">
          <main className="space-y-5">
            <div className="grid gap-5 2xl:grid-cols-2">
              <Panel title="Phễu tuyển sinh">
                <div className="space-y-3">
                  {funnel.map(item => (
                    <div key={item.label} className="grid grid-cols-[1fr_132px] items-center gap-4">
                      <div className="flex justify-center">
                        <div
                          className="h-9 rounded-md shadow-sm"
                          style={{ width: `${item.width}%`, background: item.color }}
                          title={`${item.label}: ${item.value}`}
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-black text-slate-800">{item.label}</p>
                        <p className="font-bold text-slate-500">{item.value.toLocaleString('vi-VN')} ({item.percent})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Xu hướng chuyển đổi">
                <div className="h-[294px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB', boxShadow: '0 12px 30px rgba(15,23,42,.08)' }} />
                      <Legend />
                      <Line name="Lead mới" type="monotone" dataKey="leads" stroke="#2563EB" strokeWidth={3} dot={false} />
                      <Line name="Đã tư vấn" type="monotone" dataKey="consulted" stroke="#14B8A6" strokeWidth={3} dot={false} />
                      <Line name="Đã nhập học" type="monotone" dataKey="enrolled" stroke="#F59E0B" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <div className="grid gap-5 2xl:grid-cols-2">
              <Panel title="Nguồn Lead hiệu quả">
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <div className="relative h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sources} dataKey="value" innerRadius={62} outerRadius={94} paddingAngle={2}>
                          {sources.map(item => <Cell key={item.name} fill={item.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <p className="text-2xl font-black text-slate-950">1,248</p>
                        <p className="text-xs font-bold text-slate-500">Tổng Lead</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 self-center">
                    {sources.map(item => (
                      <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2 font-bold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                          {item.name}
                        </span>
                        <span className="font-black text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel title="Bảng xếp hạng tư vấn viên" action="Tuần này">
                <div className="space-y-4">
                  {advisors.map(item => (
                    <div key={item.name} className="grid grid-cols-[40px_1fr_auto] items-center gap-3">
                      <Avatar initials={item.avatar} />
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-black text-slate-900">{item.name}</p>
                          <p className="text-xs font-black text-slate-700">{item.leads}</p>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                      <span className="w-12 text-right text-xs font-black text-slate-500">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="grid gap-5 2xl:grid-cols-2">
              <Panel title="Hoạt động gần đây">
                <div className="space-y-4">
                  {recentActivities.map(([time, title, desc], index) => (
                    <div key={time} className="grid grid-cols-[48px_18px_1fr] gap-3">
                      <span className="text-xs font-black text-slate-500">{time}</span>
                      <span className={cn('mt-1 h-3 w-3 rounded-full ring-4', index === 0 ? 'bg-blue-500 ring-blue-50' : 'bg-slate-300 ring-slate-50')} />
                      <div>
                        <p className="text-sm font-black text-slate-900">{title}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Việc cần làm">
                <div className="space-y-3">
                  {todos.map(([label, badge, color]) => (
                    <label key={label} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                      <span className="min-w-0 flex-1 text-sm font-bold text-slate-800">{label}</span>
                      <span className={cn('rounded-full border px-2 py-1 text-[11px] font-black', color)}>{badge}</span>
                    </label>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel title="Kanban Pipeline">
              <div className="grid gap-3 xl:grid-cols-5">
                {cardsByStatus.map(column => (
                  <div
                    key={column.id}
                    onDragOver={event => event.preventDefault()}
                    onDrop={() => moveCard(column.id)}
                    className={cn('min-h-[280px] rounded-2xl border p-3', column.tint)}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900">{column.label}</h3>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-slate-500">{column.items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {column.items.map(card => (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={() => setDraggingId(card.id)}
                          onDragEnd={() => setDraggingId(null)}
                          className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] active:cursor-grabbing"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar initials={initials(card.name)} small />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-900">{card.name}</p>
                              <p className="text-xs font-bold text-slate-500">{card.grade}</p>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-1 text-[11px] font-semibold text-slate-500">
                            <span>Ngày tạo: {card.createdAt}</span>
                            <span>Tư vấn viên: {card.advisor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid gap-5 2xl:grid-cols-[1.3fr_.7fr]">
              <Panel title="Email Template">
                <div className="space-y-3">
                  <input value="Thông tin chương trình học năm học 2025 - 2026" readOnly className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-800" />
                  <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {['B', 'I', 'U', '•', '1.', '@', 'Link', 'Ảnh'].map(item => (
                      <button key={item} type="button" className="h-8 rounded-lg bg-white px-3 text-xs font-black text-slate-600 shadow-sm">{item}</button>
                    ))}
                  </div>
                  <textarea
                    readOnly
                    rows={8}
                    value={'Kính gửi {{parent_name}},\n\nCảm ơn Anh/Chị đã quan tâm đến chương trình học của {{student_name}} tại MIS.\n\nDưới đây là thông tin chi tiết về chương trình {{program}}, học phí {{tuition_fee}} và lộ trình tuyển sinh.'}
                    className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm font-medium leading-relaxed text-slate-700"
                  />
                </div>
              </Panel>

              <Panel title="Biến động">
                <div className="space-y-2">
                  {['{{student_name}}', '{{parent_name}}', '{{grade}}', '{{program}}', '{{tuition_fee}}'].map(item => (
                    <button key={item} type="button" className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left text-xs font-black text-slate-700">
                      {item}
                      <Plus className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="grid gap-5 2xl:grid-cols-[1.2fr_.8fr]">
              <Panel title="Học phí & Thanh toán">
                <div className="mb-4 grid gap-3 md:grid-cols-4">
                  {[
                    ['Tổng học phí', '15.8 tỷ'],
                    ['Đã thu', '3.35 tỷ'],
                    ['Còn lại', '12.45 tỷ'],
                    ['Tỷ lệ thu', '21.2%'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] font-bold text-slate-500">{label}</p>
                      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-xs">
                    <thead className="text-slate-500">
                      <tr>
                        {['Học sinh', 'Khối', 'Học phí', 'Đã thu', 'Còn lại', 'Trạng thái'].map(head => <th key={head} className="border-b border-slate-100 py-2 font-black">{head}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {paymentRows.map(row => (
                        <tr key={row[0]} className="border-b border-slate-50 last:border-0">
                          {row.map((cell, index) => (
                            <td key={cell} className={cn('py-3 font-bold', index === 0 ? 'text-slate-900' : 'text-slate-600')}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Cài đặt Pipeline">
                <div className="space-y-2">
                  {funnel.map((step, index) => (
                    <div key={step.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-slate-500">{index + 1}</span>
                      <span className="min-w-0 flex-1 text-sm font-black text-slate-800">{step.label}</span>
                      <span className="h-5 w-9 rounded-full bg-blue-600 p-0.5">
                        <span className="block h-4 w-4 translate-x-4 rounded-full bg-white" />
                      </span>
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </main>

          <aside className="space-y-5">
            <Panel title="Chi tiết hồ sơ">
              <div className="flex items-start gap-4">
                <Avatar initials="NB" large />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-950">Nguyễn Hoàng Bảo</h2>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">Đã tư vấn</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-500">Lớp 10 · Nam · 15/06/2010</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton label="Chỉnh sửa" icon={Edit3} />
                <ActionButton label="Gửi Email" icon={Mail} primary />
                <ActionButton label="Khác" icon={MoreHorizontal} />
              </div>
              <div className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-100">
                {['Tổng quan', 'Thông tin', 'Phụ huynh', 'Phễu tuyển sinh', 'Hoạt động', 'Học phí', 'Bàn giao', 'Ghi chú'].map((tab, index) => (
                  <button key={tab} type="button" className={cn('shrink-0 border-b-2 px-3 py-2 text-xs font-black', index === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500')}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-5 2xl:grid-cols-2">
                <InfoBlock title="Thông tin chung" rows={[
                  ['SĐT', '0901 234 567'],
                  ['Email', 'bao.nguyen@gmail.com'],
                  ['Địa chỉ', '123 Lê Văn Lương, Cầu Giấy'],
                  ['Trường', 'THCS Cầu Giấy'],
                  ['Nguồn', 'Facebook Ads'],
                  ['Ngày tạo', '23/05/2025'],
                  ['Tư vấn viên', 'Lê Hồng Nhung'],
                ]} />
                <PipelineChecklist />
              </div>
            </Panel>

            <Panel title="Thông tin cần chú ý">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {[
                  ['Thích chương trình STEM', 'bg-amber-50 text-amber-700'],
                  ['Quan tâm học bổng 50%', 'bg-cyan-50 text-cyan-700'],
                  ['Muốn học nội trú', 'bg-violet-50 text-violet-700'],
                  ['Phụ huynh quan tâm cơ sở vật chất', 'bg-rose-50 text-rose-700'],
                ].map(([label, color]) => (
                  <div key={label} className={cn('rounded-xl px-3 py-2 text-xs font-black', color)}>{label}</div>
                ))}
              </div>
            </Panel>

            <Panel title="Ghi chú gần đây">
              <div className="space-y-3">
                {[
                  ['24/05/2025 09:30', 'Đã tư vấn chương trình và học phí'],
                  ['23/05/2025 15:20', 'Lead mới từ Facebook Ads'],
                ].map(([time, note]) => (
                  <div key={time} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-black text-slate-900">{note}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">{time}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Điểm đánh giá">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Need Score', '8.5 / 10', 'text-blue-600'],
                  ['Khả năng tài chính', 'Cao', 'text-emerald-600'],
                  ['Mức độ quan tâm', 'Rất cao', 'text-cyan-600'],
                  ['Dự kiến nhập học', '08/2025', 'text-violet-600'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold text-slate-500">{label}</p>
                    <p className={cn('mt-1 text-lg font-black', color)}>{value}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <button type="button" className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.35)] hover:bg-blue-700" aria-label="Tạo nhanh">
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-950">{title}</h2>
        {action && <button type="button" className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500">{action}</button>}
      </div>
      {children}
    </section>
  );
}

function ControlButton({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </button>
  );
}

function ActionButton({ label, icon: Icon, primary }: { label: string; icon: React.ComponentType<{ className?: string }>; primary?: boolean }) {
  return (
    <button type="button" className={cn('inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black', primary ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700')}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Avatar({ initials: value, small, large }: { initials: string; small?: boolean; large?: boolean }) {
  return (
    <div className={cn('grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-900 to-blue-700 font-black text-white shadow-sm', small ? 'h-8 w-8 text-[11px]' : large ? 'h-14 w-14 text-sm' : 'h-10 w-10 text-xs')}>
      {value}
    </div>
  );
}

function InfoBlock({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[100px_1fr] gap-3 text-xs">
            <span className="font-bold text-slate-500">{label}</span>
            <span className="font-black text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineChecklist() {
  const steps = ['Lead mới', 'Đã liên hệ', 'Đã tư vấn', 'Đã tham quan trường', 'Đã nộp hồ sơ', 'Đang xét duyệt', 'Đã đóng học phí', 'Đã nhập học'];
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">Pipeline tuyển sinh</h3>
      <div className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2 text-xs">
            <span className={cn('grid h-5 w-5 place-items-center rounded-full border', index < 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-300')}>
              {index < 3 ? <Check className="h-3 w-3" /> : null}
            </span>
            <span className={cn('font-bold', index < 3 ? 'text-slate-900' : 'text-slate-500')}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
