'use client';

import { useMemo, useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  AreaChart,
  Bell,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Edit3,
  FileBarChart,
  FileText,
  Filter,
  GripVertical,
  Hexagon,
  Home,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  MousePointer2,
  PanelRightOpen,
  PieChart as PieChartIcon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  ToggleRight,
  TrendingUp,
  Users,
  WalletCards,
  type LucideIcon,
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
import { updateLeadStatusKanban } from './actions';
import { type LeadStatus } from '../leads/actions';
import { cn } from '@/src/lib/utils';

interface DbUser {
  id: string;
  name: string;
}

interface Lead {
  id: string;
  leadCode: string;
  fullName: string;
  parentName: string | null;
  phone: string;
  email: string | null;
  source: string;
  grade: string;
  status: LeadStatus;
  assignedUserId: string | null;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  address: string | null;
  testDate: Date | string | null;
  testTime: string | null;
  mathScore: number | null;
  englishScore: number | null;
  scholarshipPercent: number | null;
  periodDiscountPercent: number | null;
}

interface Activity {
  id: string;
  leadId: string;
  type: string;
  title: string;
  description: string | null;
  activityAt: Date | string;
}

interface DocumentItem {
  id: string;
  leadId: string | null;
  type: string;
  name: string;
  status: string;
  uploadedAt: Date | string | null;
}

interface KanbanClientProps {
  locale: string;
  initialLeads: Lead[];
  users: DbUser[];
  activities: Activity[];
  documents: DocumentItem[];
}

const fallbackLeads: Lead[] = [
  {
    id: 'sample-nguyen-hoang-bao',
    leadCode: 'LĐ-10-001',
    fullName: 'Nguyễn Hoàng Bảo',
    parentName: 'Nguyễn Hoàng Nam',
    phone: '0901 234 567',
    email: 'bao.nguyen@gmail.com',
    source: 'Facebook Ads',
    grade: 'Lớp 10',
    status: 'received',
    assignedUserId: 'sample-user-1',
    notes: 'Thích STEM, quan tâm học bổng 50%',
    createdAt: '2025-05-23T08:30:00',
    updatedAt: '2025-05-24T10:15:00',
    address: '123 Lê Văn Lương, Cầu Giấy, Hà Nội',
    testDate: '2025-05-25',
    testTime: '09:00',
    mathScore: 8.5,
    englishScore: 8.2,
    scholarshipPercent: 50,
    periodDiscountPercent: 10,
  },
  {
    id: 'sample-tran-minh-anh',
    leadCode: 'LĐ-11-008',
    fullName: 'Trần Minh Anh',
    parentName: 'Phạm Thu Hằng',
    phone: '0912 778 899',
    email: 'minhanh.family@gmail.com',
    source: 'Website',
    grade: 'Lớp 11',
    status: 'consulting',
    assignedUserId: 'sample-user-2',
    notes: 'Phụ huynh muốn tham quan khu nội trú',
    createdAt: '2025-05-22T09:15:00',
    updatedAt: '2025-05-24T09:30:00',
    address: 'Hoàn Kiếm, Hà Nội',
    testDate: null,
    testTime: null,
    mathScore: null,
    englishScore: null,
    scholarshipPercent: null,
    periodDiscountPercent: null,
  },
  {
    id: 'sample-le-quang-huy',
    leadCode: 'LĐ-09-014',
    fullName: 'Lê Quang Huy',
    parentName: 'Lê Thanh Tùng',
    phone: '0988 120 456',
    email: 'quanghuy@outlook.com',
    source: 'Giới thiệu',
    grade: 'Lớp 9',
    status: 'test_scheduled',
    assignedUserId: 'sample-user-3',
    notes: 'Đã đặt lịch tư vấn chương trình song ngữ',
    createdAt: '2025-05-20T10:00:00',
    updatedAt: '2025-05-24T11:00:00',
    address: 'Tây Hồ, Hà Nội',
    testDate: '2025-05-26',
    testTime: '14:00',
    mathScore: null,
    englishScore: null,
    scholarshipPercent: 20,
    periodDiscountPercent: null,
  },
  {
    id: 'sample-do-gia-bao',
    leadCode: 'LĐ-10-022',
    fullName: 'Đỗ Gia Bảo',
    parentName: 'Đỗ Quốc Anh',
    phone: '0936 654 221',
    email: 'giabao.parent@gmail.com',
    source: 'Zalo OA',
    grade: 'Lớp 10',
    status: 'docs_submitted',
    assignedUserId: 'sample-user-1',
    notes: 'Đã nộp hồ sơ online',
    createdAt: '2025-05-18T13:30:00',
    updatedAt: '2025-05-24T15:30:00',
    address: 'Nam Từ Liêm, Hà Nội',
    testDate: '2025-05-22',
    testTime: '08:30',
    mathScore: 8.8,
    englishScore: 8.1,
    scholarshipPercent: 30,
    periodDiscountPercent: 5,
  },
  {
    id: 'sample-ha-minh-duc',
    leadCode: 'LĐ-12-031',
    fullName: 'Hoàng Minh Đức',
    parentName: 'Vũ Thị Mai Anh',
    phone: '0977 888 909',
    email: 'minhduc.parent@gmail.com',
    source: 'Sự kiện',
    grade: 'Lớp 12',
    status: 'seat_reserved',
    assignedUserId: 'sample-user-2',
    notes: 'Quan tâm chương trình STEM',
    createdAt: '2025-05-17T16:00:00',
    updatedAt: '2025-05-23T10:45:00',
    address: 'Thanh Xuân, Hà Nội',
    testDate: '2025-05-21',
    testTime: '10:30',
    mathScore: 9.1,
    englishScore: 8.9,
    scholarshipPercent: 50,
    periodDiscountPercent: 10,
  },
  {
    id: 'sample-pham-ngoc-lan',
    leadCode: 'LĐ-10-044',
    fullName: 'Phạm Ngọc Lan',
    parentName: 'Nguyễn Hoàng Nam',
    phone: '0962 114 778',
    email: 'ngoclan.family@gmail.com',
    source: 'TikTok Ads',
    grade: 'Lớp 10',
    status: 'consulting',
    assignedUserId: 'sample-user-3',
    notes: 'Muốn học nội trú',
    createdAt: '2025-05-24T07:30:00',
    updatedAt: '2025-05-24T07:45:00',
    address: 'Hà Đông, Hà Nội',
    testDate: null,
    testTime: null,
    mathScore: null,
    englishScore: null,
    scholarshipPercent: null,
    periodDiscountPercent: null,
  },
  {
    id: 'sample-nguyen-thu-ha',
    leadCode: 'LĐ-11-052',
    fullName: 'Nguyễn Thu Hà',
    parentName: 'Phạm Thu Hằng',
    phone: '0903 881 222',
    email: 'thuha.parent@gmail.com',
    source: 'Website',
    grade: 'Lớp 11',
    status: 'test_scheduled',
    assignedUserId: 'sample-user-2',
    notes: 'Cần gửi thêm thông tin học bổng',
    createdAt: '2025-05-19T11:20:00',
    updatedAt: '2025-05-24T08:15:00',
    address: 'Cầu Giấy, Hà Nội',
    testDate: '2025-05-27',
    testTime: '09:30',
    mathScore: null,
    englishScore: null,
    scholarshipPercent: 30,
    periodDiscountPercent: null,
  },
  {
    id: 'sample-bui-quoc-anh',
    leadCode: 'LĐ-11-063',
    fullName: 'Bùi Quốc Anh',
    parentName: 'Nguyễn Hoàng Nam',
    phone: '0915 664 331',
    email: 'quocanh.parent@gmail.com',
    source: 'Facebook Ads',
    grade: 'Lớp 11',
    status: 'seat_reserved',
    assignedUserId: 'sample-user-1',
    notes: 'Đang xét duyệt học bổng',
    createdAt: '2025-05-16T10:10:00',
    updatedAt: '2025-05-24T13:10:00',
    address: 'Ba Đình, Hà Nội',
    testDate: '2025-05-20',
    testTime: '15:00',
    mathScore: 8.7,
    englishScore: 8.4,
    scholarshipPercent: 40,
    periodDiscountPercent: 5,
  },
];

const fallbackUsers: DbUser[] = [
  { id: 'sample-user-1', name: 'Lê Hồng Nhung' },
  { id: 'sample-user-2', name: 'Trần Văn Minh' },
  { id: 'sample-user-3', name: 'Phạm Thu Hằng' },
];

const sidebarGroups = [
  {
    title: 'Tổng quan',
    items: [{ label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Quản lý tuyển sinh',
    items: [
      { label: 'Lead & Thí sinh', icon: Users },
      { label: 'Hồ sơ tuyển sinh', icon: FileText },
      { label: 'Phỏng vấn & Tư vấn', icon: MessageSquareText },
      { label: 'Ghi danh & Nhập học', icon: BookOpenCheck },
      { label: 'Danh sách lớp dự kiến', icon: ClipboardCheck },
      { label: 'Học bổng & Ưu đãi', icon: Sparkles },
      { label: 'Thanh toán', icon: CreditCard },
    ],
  },
  {
    title: 'Marketing & Chiến dịch',
    items: [
      { label: 'Chiến dịch', icon: Megaphone },
      { label: 'Kênh & Nguồn', icon: MousePointer2 },
      { label: 'Mẫu biểu Landing Page', icon: PanelRightOpen },
    ],
  },
  {
    title: 'Báo cáo',
    items: [
      { label: 'Báo cáo tuyển sinh', icon: FileBarChart },
      { label: 'Hiệu suất chiến dịch', icon: TrendingUp },
      { label: 'Phân tích chuyển đổi', icon: PieChartIcon },
      { label: 'Dự báo tuyển sinh', icon: AreaChart },
    ],
  },
  {
    title: 'Cài đặt',
    items: [
      { label: 'Cấu hình', icon: Settings },
      { label: 'Vai trò & Phân quyền', icon: ShieldCheck },
    ],
  },
];

const pipelineColumns: { status: LeadStatus; title: string; tint: string }[] = [
  { status: 'received', title: 'Lead mới', tint: 'bg-blue-50 border-blue-100' },
  { status: 'consulting', title: 'Đã liên hệ', tint: 'bg-cyan-50 border-cyan-100' },
  { status: 'test_scheduled', title: 'Đã tư vấn', tint: 'bg-violet-50 border-violet-100' },
  { status: 'docs_submitted', title: 'Đã nộp hồ sơ', tint: 'bg-amber-50 border-amber-100' },
  { status: 'seat_reserved', title: 'Đang xét duyệt', tint: 'bg-rose-50 border-rose-100' },
];

const funnelData = [
  { label: 'Lead mới', value: 1248, percent: '100%', color: '#7C3AED', width: 100 },
  { label: 'Đã liên hệ', value: 956, percent: '76.6%', color: '#4F46E5', width: 88 },
  { label: 'Đã tư vấn', value: 588, percent: '47.2%', color: '#0EA5E9', width: 76 },
  { label: 'Đã nộp hồ sơ', value: 432, percent: '34.6%', color: '#14B8A6', width: 64 },
  { label: 'Đang xét duyệt', value: 265, percent: '21.2%', color: '#F59E0B', width: 52 },
  { label: 'Đã đóng học phí', value: 189, percent: '15.1%', color: '#F97316', width: 40 },
  { label: 'Đã nhập học', value: 128, percent: '10.3%', color: '#EF4444', width: 30 },
];

const conversionTrend = [
  { date: '01/05', lead: 720, consult: 430, enrolled: 120 },
  { date: '06/05', lead: 1080, consult: 760, enrolled: 260 },
  { date: '11/05', lead: 980, consult: 620, enrolled: 210 },
  { date: '16/05', lead: 1190, consult: 700, enrolled: 180 },
  { date: '21/05', lead: 1110, consult: 790, enrolled: 280 },
  { date: '26/05', lead: 1240, consult: 730, enrolled: 230 },
  { date: '31/05', lead: 1350, consult: 820, enrolled: 260 },
];

const sourceData = [
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

const pipelineSteps = [
  'Lead mới',
  'Đã liên hệ',
  'Đã tư vấn',
  'Đã tham quan trường',
  'Đã nộp hồ sơ',
  'Đang xét duyệt',
  'Đã đóng học phí',
  'Đã nhập học',
];

export default function KanbanClient({
  locale,
  initialLeads,
  users,
}: KanbanClientProps) {
  const seededUsers = users.length ? users : fallbackUsers;
  const [leads, setLeads] = useState<Lead[]>(() => normalizeLeads(initialLeads.length ? initialLeads : fallbackLeads));
  const [selectedLeadId, setSelectedLeadId] = useState('sample-nguyen-hoang-bao');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const userMap = useMemo(() => new Map(seededUsers.map(user => [user.id, user.name])), [seededUsers]);
  const selectedLead = leads.find(lead => lead.id === selectedLeadId) || leads[0] || fallbackLeads[0];
  const activeLead = leads.find(lead => lead.id === activeDragId) || null;

  const groupedLeads = useMemo(() => {
    return pipelineColumns.map(column => ({
      ...column,
      leads: leads.filter(lead => lead.status === column.status).slice(0, 5),
    }));
  }, [leads]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const leadId = String(event.active.id);
    const targetStatus = event.over?.id as LeadStatus | undefined;
    setActiveDragId(null);
    if (!targetStatus || !pipelineColumns.some(column => column.status === targetStatus)) return;

    const lead = leads.find(item => item.id === leadId);
    if (!lead || lead.status === targetStatus) return;

    setLeads(prev => prev.map(item => (item.id === leadId ? { ...item, status: targetStatus, updatedAt: new Date() } : item)));
    if (!leadId.startsWith('sample-')) {
      startTransition(async () => {
        await updateLeadStatusKanban(leadId, targetStatus, `Cập nhật từ Kanban tuyển sinh 2026 sang ${targetStatus}`);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-950" style={{ letterSpacing: 0 }}>
      <div className="flex min-h-screen">
        <AdmissionsSidebar locale={locale} />
        <div className="min-w-0 flex-1">
          <AdmissionsHeader />
          <main className="space-y-4 p-4 lg:p-5 2xl:p-6">
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_40%]">
              <div className="min-w-0 space-y-4">
                <DashboardOverview />
                <section className="grid gap-4 lg:grid-cols-[40%_1fr]">
                  <FunnelPanel />
                  <TrendPanel />
                </section>
                <section className="grid gap-4 lg:grid-cols-[40%_1fr]">
                  <LeadSourcePanel />
                  <AdvisorPanel />
                </section>
                <section className="grid gap-4 lg:grid-cols-[44%_1fr]">
                  <RecentActivity />
                  <TodoPanel />
                </section>
              </div>
              <LeadProfilePanel selectedLead={selectedLead} advisor={getAdvisor(selectedLead, userMap)} />
            </section>

            <KanbanBoard
              groupedLeads={groupedLeads}
              selectedLeadId={selectedLead.id}
              userMap={userMap}
              sensors={sensors}
              activeLead={activeLead}
              onSelectLead={setSelectedLeadId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />

            <section className="grid gap-4 xl:grid-cols-[1fr_42%]">
              <EmailTemplatePanel />
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <PaymentsPanel />
                <PipelineSettingsPanel />
              </div>
            </section>
          </main>
        </div>
      </div>

      <FloatingAdmissionsAction open={fabOpen} onOpenChange={setFabOpen} />
    </div>
  );
}

function AdmissionsSidebar({ locale }: { locale: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white lg:flex">
      <div className="flex h-[72px] items-center gap-3 border-b border-[#E5E7EB] px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
          <Hexagon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[13px] font-black leading-tight text-slate-950">MIS SMART PORTAL</div>
          <div className="text-xs font-semibold text-slate-500">Tuyển sinh</div>
        </div>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {sidebarGroups.map(group => (
          <div key={group.title} className="mb-5">
            <div className="mb-2 px-2 text-[10px] font-bold uppercase text-slate-400">{group.title}</div>
            <div className="space-y-1">
              {group.items.map((item, index) => {
                const Icon = item.icon;
                const active = group.title === 'Tổng quan' && index === 0;
                return (
                  <Link
                    key={item.label}
                    href={active ? `/${locale}/admissions` : '#'}
                    className={cn(
                      'flex h-9 items-center gap-2 rounded-lg px-2.5 text-[13px] font-semibold',
                      active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-[#E5E7EB] p-4">
        <div className="mb-3 text-[11px] font-bold text-slate-500">Hoạt động gần đây</div>
        <div className="space-y-3">
          {['Lead mới từ Facebook Ads', 'Đã gửi email học phí', 'Hồ sơ chờ xác nhận'].map((item, index) => (
            <div key={item} className="flex gap-2">
              <span className={cn('mt-1.5 h-2 w-2 rounded-full', ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500'][index])} />
              <div>
                <p className="text-xs font-semibold text-slate-700">{item}</p>
                <p className="text-[11px] text-slate-400">{index === 0 ? '10:15 AM' : index === 1 ? '10:02 AM' : '09:45 AM'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AdmissionsHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[#E5E7EB] bg-white/95 px-4 backdrop-blur md:px-5">
      <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#E5E7EB] text-slate-600 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <button type="button" className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-50 lg:grid" title="Menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative min-w-[220px] flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-4 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          placeholder="Tìm kiếm hồ sơ, lead, chiến dịch... (Ctrl + K)"
        />
      </div>
      <HeaderSelect label="Năm học 2025 - 2026" />
      <HeaderSelect label="Campus chính" icon={Home} />
      <button type="button" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#E5E7EB] bg-white text-slate-600">
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">13</span>
      </button>
      <div className="hidden items-center gap-3 border-l border-[#E5E7EB] pl-3 md:flex">
        <Avatar initials="MA" />
        <div className="hidden xl:block">
          <div className="text-sm font-bold text-slate-950">Nguyễn Thị Minh Anh</div>
          <div className="text-xs font-semibold text-slate-500">Trưởng phòng Tuyển sinh</div>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
    </header>
  );
}

function HeaderSelect({ label, icon: Icon }: { label: string; icon?: LucideIcon }) {
  return (
    <button type="button" className="hidden h-10 shrink-0 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-bold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] xl:flex">
      {Icon && <Icon className="h-4 w-4 text-blue-600" />}
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
    </button>
  );
}

function DashboardOverview() {
  const cards = [
    { label: 'Lead mới', value: '56', change: '18%', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Hồ sơ đang xử lý', value: '342', change: '12%', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Đã nhập học', value: '128', change: '8%', icon: BookOpenCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tỷ lệ chuyển đổi', value: '18.45%', change: '2.6%', icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Doanh thu dự kiến', value: '12,450,000,000', sub: 'VNĐ', change: '15%', icon: WalletCards, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Chỉ tiêu hoàn thành', value: '82%', change: 'Kế hoạch', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', progress: 82 },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Tổng quan tuyển sinh</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-slate-700">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              01/05/2025 - 31/05/2025
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <span>Dữ liệu cập nhật: 10:30 AM hôm nay</span>
          </div>
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-bold text-slate-700">
          <SlidersHorizontal className="h-4 w-4" />
          Tùy chỉnh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Panel key={card.label} className="min-h-[112px] min-w-0 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500">{card.label}</p>
                  <p
                    className={cn(
                      'mt-2 whitespace-nowrap font-black leading-none text-slate-950',
                      card.label === 'Doanh thu dự kiến' ? 'text-[13px]' : card.value.length > 5 ? 'text-[20px]' : 'text-[26px]'
                    )}
                  >
                    {card.value}
                  </p>
                  {card.sub && <p className="mt-1 text-[11px] font-bold text-slate-500">{card.sub}</p>}
                </div>
                <div className={cn('grid h-9 w-9 place-items-center rounded-xl', card.bg, card.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              {card.progress ? (
                <div className="mt-4">
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${card.progress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {card.change} <span className="font-semibold text-slate-400">so với tháng trước</span>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </section>
  );
}

function FunnelPanel() {
  return (
    <Panel className="p-4">
      <PanelTitle title="Phễu tuyển sinh" />
      <div className="mt-4 grid gap-4 md:grid-cols-[44%_1fr] lg:grid-cols-1 2xl:grid-cols-[44%_1fr]">
        <div className="flex min-h-[230px] flex-col items-center justify-center gap-1">
          {funnelData.map(row => (
            <div
              key={row.label}
              className="h-7 rounded-sm"
              style={{ width: `${row.width}%`, backgroundColor: row.color, clipPath: 'polygon(8% 0, 92% 0, 82% 100%, 18% 100%)' }}
            />
          ))}
        </div>
        <div className="space-y-2">
          {funnelData.map(row => (
            <div key={row.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs">
              <span className="font-semibold text-slate-700">{row.label}</span>
              <span className="font-bold text-slate-950">{row.value.toLocaleString('vi-VN')}</span>
              <span className="w-12 text-right font-semibold text-slate-500">{row.percent}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function TrendPanel() {
  return (
    <Panel className="p-4">
      <PanelTitle title="Xu hướng chuyển đổi" />
      <div className="mt-3 h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={conversionTrend} margin={{ left: -12, right: 10, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 16px 40px rgba(15,23,42,0.08)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
            <Line type="monotone" dataKey="lead" name="Lead mới" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="consult" name="Đã tư vấn" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="enrolled" name="Đã nhập học" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function LeadSourcePanel() {
  return (
    <Panel className="p-4">
      <PanelTitle title="Nguồn Lead hiệu quả" />
      <div className="mt-3 grid gap-4 md:grid-cols-[42%_1fr] lg:grid-cols-1 2xl:grid-cols-[42%_1fr]">
        <div className="relative h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sourceData} dataKey="value" innerRadius={54} outerRadius={86} paddingAngle={2} isAnimationActive={false}>
                {sourceData.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-950">1,248</div>
              <div className="text-xs font-bold text-slate-500">Tổng lead</div>
            </div>
          </div>
        </div>
        <div className="space-y-2 self-center">
          {sourceData.map(item => (
            <div key={item.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-slate-700">{item.name}</span>
              <span className="font-bold text-slate-950">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function AdvisorPanel() {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <PanelTitle title="Bảng xếp hạng tư vấn viên" />
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E7EB] px-2 text-xs font-bold text-slate-600">
          Tuần này <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {advisors.map(advisor => (
          <div key={advisor.name} className="grid grid-cols-[auto_120px_1fr_auto] items-center gap-3 text-xs">
            <Avatar initials={advisor.avatar} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-950">{advisor.name}</p>
              <p className="font-semibold text-slate-500">{advisor.leads} lead</p>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-slate-700" style={{ width: `${advisor.percent * 2.1}%` }} />
            </div>
            <span className="font-bold text-slate-600">{advisor.percent}%</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RecentActivity() {
  const rows = [
    ['10:15', 'Lê Hồng Nhung đã tạo Lead mới.', 'Nguyễn Hoàng Bảo - Lớp 10', 'bg-blue-500'],
    ['10:02', 'Phạm Thu Hằng cập nhật trạng thái.', 'Trần Gia Bảo - Đã tư vấn', 'bg-emerald-500'],
    ['09:45', 'Trần Văn Minh đã gửi Email.', 'Gửi thông tin chương trình học bổng', 'bg-amber-500'],
    ['09:30', 'Nguyễn Hoàng Nam tạo lịch hẹn.', 'Hẹn tư vấn trực tiếp', 'bg-violet-500'],
  ];
  return (
    <Panel className="p-4">
      <PanelTitle title="Hoạt động gần đây" />
      <div className="mt-4 space-y-4">
        {rows.map(row => (
          <div key={row[0]} className="grid grid-cols-[44px_auto_1fr] gap-3">
            <div className="text-xs font-bold text-slate-500">{row[0]}</div>
            <span className={cn('mt-1 h-2.5 w-2.5 rounded-full', row[3])} />
            <div>
              <p className="text-sm font-bold text-slate-950">{row[1]}</p>
              <p className="text-xs font-semibold text-slate-500">{row[2]}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TodoPanel() {
  const todos = [
    ['Gọi điện tư vấn 12 Lead', 'Ưu tiên cao', 'bg-rose-50 text-rose-700'],
    ['Theo dõi 8 hồ sơ quá hạn', 'Ưu tiên cao', 'bg-rose-50 text-rose-700'],
    ['Gửi thông tin học bổng', 'Ưu tiên trung bình', 'bg-amber-50 text-amber-700'],
    ['Xác nhận lịch phỏng vấn', 'Ưu tiên trung bình', 'bg-amber-50 text-amber-700'],
    ['Báo cáo tuần', 'Ưu tiên thấp', 'bg-blue-50 text-blue-700'],
  ];
  return (
    <Panel className="p-4">
      <PanelTitle title="Việc cần làm" />
      <div className="mt-4 space-y-3">
        {todos.map(todo => (
          <label key={todo[0]} className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">{todo[0]}</span>
            <span className={cn('rounded-full px-2 py-1 text-[11px] font-bold', todo[2])}>{todo[1]}</span>
          </label>
        ))}
      </div>
    </Panel>
  );
}

function LeadProfilePanel({ selectedLead, advisor }: { selectedLead: Lead; advisor: string }) {
  return (
    <aside className="min-w-0 space-y-4">
      <Panel className="overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-4 py-3">
          <div className="mb-3 text-xs font-black text-slate-500">2. Chi tiết hồ sơ</div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar initials="NB" size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-slate-950">Nguyễn Hoàng Bảo</h2>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">Đã tư vấn</span>
                </div>
                <p className="text-xs font-semibold text-slate-500">Lớp 10 · Nam · 15/06/2010 (15 tuổi)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <IconButton icon={Edit3} label="Chỉnh sửa" />
              <IconButton icon={Mail} label="Gửi Email" primary />
              <IconButton icon={MoreHorizontal} label="Khác" />
            </div>
          </div>
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {['Tổng quan', 'Thông tin', 'Phụ huynh', 'Phễu tuyển sinh', 'Hoạt động', 'Học phí', 'Bàn giao', 'Ghi chú'].map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={cn('shrink-0 border-b-2 px-3 py-2 text-xs font-bold', index === 0 ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500')}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 p-4 2xl:grid-cols-[38%_1fr_32%]">
          <ProfileInfo selectedLead={selectedLead} advisor={advisor} />
          <PipelineChecklist />
          <AttentionPanel />
        </div>

        <div className="grid border-t border-[#E5E7EB] sm:grid-cols-4">
          {[
            ['Need Score', '8.5/10'],
            ['Khả năng tài chính', 'Cao'],
            ['Mức độ quan tâm', 'Rất cao'],
            ['Dự kiến nhập học', '08/2025'],
          ].map((item, index) => (
            <div key={item[0]} className="border-r border-[#E5E7EB] p-4 last:border-r-0">
              <p className="text-[11px] font-bold text-slate-500">{item[0]}</p>
              <p className={cn('mt-1 text-sm font-black', index === 0 ? 'text-slate-950' : 'text-emerald-700')}>{item[1]}</p>
            </div>
          ))}
        </div>
      </Panel>
    </aside>
  );
}

function ProfileInfo({ selectedLead, advisor }: { selectedLead: Lead; advisor: string }) {
  const fields = [
    ['SĐT', selectedLead.phone || '0901 234 567'],
    ['Email', selectedLead.email || 'bao.nguyen@gmail.com'],
    ['Địa chỉ', selectedLead.address || '123 Lê Văn Lương, Cầu Giấy, Hà Nội'],
    ['Trường', 'THCS Cầu Giấy'],
    ['Nguồn', selectedLead.source || 'Facebook Ads'],
    ['Ngày tạo', '23/05/2025 10:15'],
    ['Tư vấn viên', advisor || 'Lê Hồng Nhung'],
  ];
  return (
    <section>
      <h3 className="text-sm font-black text-slate-950">Thông tin chung</h3>
      <div className="mt-3 space-y-3">
        {fields.map(field => (
          <div key={field[0]} className="grid grid-cols-[82px_1fr] gap-3 text-xs">
            <span className="font-bold text-slate-500">{field[0]}</span>
            <span className="font-semibold text-slate-800">{field[1]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PipelineChecklist() {
  return (
    <section>
      <h3 className="text-sm font-black text-slate-950">Pipeline tuyển sinh</h3>
      <div className="mt-3 space-y-2">
        {pipelineSteps.map((step, index) => (
          <div key={step} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-xs">
            <span className={cn('grid h-5 w-5 place-items-center rounded-md border', index < 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-400')}>
              {index < 3 ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <span className={cn('font-bold', index < 3 ? 'text-slate-950' : 'text-slate-500')}>{step}</span>
            <span className="text-[11px] font-semibold text-slate-400">{index < 3 ? '23/05/2025' : '...'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AttentionPanel() {
  const notes = [
    ['Thích chương trình STEM', 'bg-amber-50 text-amber-700'],
    ['Quan tâm học bổng 50%', 'bg-cyan-50 text-cyan-700'],
    ['Muốn học nội trú', 'bg-violet-50 text-violet-700'],
    ['Phụ huynh quan tâm cơ sở vật chất', 'bg-rose-50 text-rose-700'],
  ];
  return (
    <section>
      <h3 className="text-sm font-black text-slate-950">Thông tin cần chú ý</h3>
      <div className="mt-3 space-y-2">
        {notes.map(note => (
          <div key={note[0]} className={cn('rounded-lg px-3 py-2 text-xs font-bold', note[1])}>{note[0]}</div>
        ))}
      </div>
      <h3 className="mt-5 text-sm font-black text-slate-950">Ghi chú gần đây</h3>
      <div className="mt-3 space-y-3 text-xs">
        <div>
          <p className="font-bold text-slate-800">Đã tư vấn chương trình và học phí</p>
          <p className="font-semibold text-slate-400">24/05/2025 09:30</p>
        </div>
        <div>
          <p className="font-bold text-slate-800">Lead mới từ Facebook Ads</p>
          <p className="font-semibold text-slate-400">23/05/2025 15:20</p>
        </div>
      </div>
    </section>
  );
}

function KanbanBoard({
  groupedLeads,
  selectedLeadId,
  userMap,
  sensors,
  activeLead,
  onSelectLead,
  onDragStart,
  onDragEnd,
}: {
  groupedLeads: Array<{ status: LeadStatus; title: string; tint: string; leads: Lead[] }>;
  selectedLeadId: string;
  userMap: Map<string, string>;
  sensors: ReturnType<typeof useSensors>;
  activeLead: Lead | null;
  onSelectLead: (id: string) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PanelTitle title="4. Pipeline tuyển sinh" />
        <div className="flex flex-wrap items-center gap-2">
          <SmallFilter label="Lọc nhanh" />
          <SmallFilter label="Tư vấn viên: Tất cả" />
          <SmallFilter label="Khối lớp: Tất cả" />
          <IconButton icon={Filter} label="Bộ lọc" />
        </div>
      </div>
      <DndContext id="admissions-pipeline-dnd" sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="mt-4 grid gap-3 overflow-x-auto pb-1 xl:grid-cols-5">
          {groupedLeads.map(column => (
            <KanbanColumn
              key={column.status}
              column={column}
              selectedLeadId={selectedLeadId}
              userMap={userMap}
              onSelectLead={onSelectLead}
            />
          ))}
        </div>
        <DragOverlay>{activeLead ? <KanbanCard lead={activeLead} userMap={userMap} overlay /> : null}</DragOverlay>
      </DndContext>
    </Panel>
  );
}

function KanbanColumn({
  column,
  selectedLeadId,
  userMap,
  onSelectLead,
}: {
  column: { status: LeadStatus; title: string; tint: string; leads: Lead[] };
  selectedLeadId: string;
  userMap: Map<string, string>;
  onSelectLead: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });
  return (
    <section ref={setNodeRef} className={cn('min-h-[260px] min-w-[220px] rounded-xl border p-2', column.tint, isOver && 'ring-2 ring-blue-400')}>
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-slate-800">{column.title} ({column.leads.length})</h3>
        <MoreHorizontal className="h-4 w-4 text-slate-400" />
      </div>
      <div className="space-y-2">
        {column.leads.map(lead => (
          <button key={lead.id} type="button" onClick={() => onSelectLead(lead.id)} className="block w-full text-left">
            <KanbanCard lead={lead} userMap={userMap} active={lead.id === selectedLeadId} />
          </button>
        ))}
      </div>
      <button type="button" className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white/70 text-xs font-bold text-slate-500">
        <Plus className="h-3.5 w-3.5" />
        Thêm lead
      </button>
    </section>
  );
}

function KanbanCard({ lead, userMap, active, overlay }: { lead: Lead; userMap: Map<string, string>; active?: boolean; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  const advisor = getAdvisor(lead, userMap);
  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition',
        active && 'border-blue-300 ring-2 ring-blue-100',
        isDragging && 'opacity-50',
        overlay && 'w-[220px] rotate-1 shadow-xl'
      )}
    >
      <div className="flex items-start gap-2">
        <Avatar initials={initials(lead.fullName)} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black text-slate-950">{lead.fullName}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{lead.grade} · {lead.leadCode}</p>
        </div>
        <GripVertical className="h-4 w-4 text-slate-300" />
      </div>
      <div className="mt-3 space-y-1 text-[11px] font-semibold text-slate-500">
        <p className="truncate">Ngày tạo: {formatShortDate(lead.createdAt)}</p>
        <p className="truncate">Tư vấn viên: {advisor}</p>
      </div>
    </article>
  );
}

function EmailTemplatePanel() {
  const vars = ['{{student_name}}', '{{parent_name}}', '{{grade}}', '{{program}}', '{{tuition_fee}}'];
  return (
    <Panel className="p-4">
      <PanelTitle title="6. Email Template" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl border border-[#E5E7EB] bg-white">
          <div className="border-b border-[#E5E7EB] p-3">
            <label className="text-xs font-bold text-slate-500">Mẫu email: Thông tin chương trình</label>
            <input className="mt-2 h-10 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm font-semibold" defaultValue="Thông tin chương trình học năm học 2025 - 2026" />
          </div>
          <div className="flex flex-wrap gap-1 border-b border-[#E5E7EB] p-2">
            {['B', 'I', 'U', '•', '1.', '🔗', '@', '{ }', '...'].map(tool => (
              <button key={tool} type="button" className="grid h-8 w-8 place-items-center rounded-md text-xs font-black text-slate-600 hover:bg-slate-50">{tool}</button>
            ))}
          </div>
          <div className="min-h-[170px] p-4 text-sm leading-7 text-slate-700">
            <p>Kính gửi Anh/Chị <span className="rounded bg-blue-50 px-1 font-bold text-blue-700">{'{{parent_name}}'}</span>,</p>
            <p className="mt-3">Cảm ơn Anh/Chị đã quan tâm đến chương trình học tại MIS Smart School.</p>
            <p>Dưới đây là thông tin chi tiết về chương trình học và học phí cho <span className="rounded bg-blue-50 px-1 font-bold text-blue-700">{'{{student_name}}'}</span>.</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] p-3">
            <button type="button" className="h-9 rounded-lg border border-[#E5E7EB] px-3 text-xs font-bold text-slate-700">Xem trước</button>
            <button type="button" className="h-9 rounded-lg border border-[#E5E7EB] px-3 text-xs font-bold text-slate-700">Lưu mẫu</button>
            <button type="button" className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white">Gửi email</button>
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] p-3">
          <div className="mb-3 text-xs font-black text-slate-700">Biến động (Variables)</div>
          <div className="space-y-2">
            {vars.map(variable => (
              <div key={variable} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs font-bold text-slate-700">{variable}</div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PaymentsPanel() {
  return (
    <Panel className="p-4">
      <PanelTitle title="9. Học phí & Thanh toán" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          ['Tổng học phí', '15,800,000,000'],
          ['Đã thu', '3,350,000,000'],
          ['Còn lại', '12,450,000,000'],
          ['Tỷ lệ thu', '21.2%'],
        ].map(item => (
          <div key={item[0]} className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-3">
            <p className="text-[11px] font-bold text-slate-500">{item[0]}</p>
            <p className="mt-1 text-sm font-black text-slate-950">{item[1]}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB]">
        {['Nguyễn Hoàng Bảo', 'Trần Gia Bảo', 'Lê Minh Anh'].map((name, index) => (
          <div key={name} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-[#E5E7EB] p-3 text-xs last:border-b-0">
            <span className="font-bold text-slate-800">{name}</span>
            <span className="font-semibold text-slate-500">{index === 2 ? 'Chưa thu' : 'Đã đóng'}</span>
            <span className={cn('rounded-full px-2 py-0.5 font-bold', index === 2 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>{index === 2 ? 'Chờ' : 'OK'}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PipelineSettingsPanel() {
  return (
    <Panel className="p-4">
      <PanelTitle title="10. Cài đặt tuyển sinh" />
      <div className="mt-4 space-y-2">
        {pipelineSteps.map((step, index) => (
          <div key={step} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg border border-[#E5E7EB] px-3 py-2">
            <GripVertical className="h-4 w-4 text-slate-300" />
            <span className="text-xs font-bold text-slate-700">{step}</span>
            <ToggleRight className={cn('h-5 w-5', index < 7 ? 'text-blue-600' : 'text-slate-300')} />
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FloatingAdmissionsAction({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const actions = [
    ['Tạo Lead', Users],
    ['Tạo Hồ sơ', FileText],
    ['Tạo Lịch hẹn', CalendarDays],
    ['Tạo Email', Mail],
    ['Tạo Công việc', ClipboardCheck],
  ] as const;
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 space-y-2">
          {actions.map(([label, Icon]) => (
            <button key={label} type="button" className="flex h-10 w-44 items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-bold text-slate-700 shadow-lg">
              {label}
              <Icon className="h-4 w-4 text-blue-600" />
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.35)] hover:bg-blue-700"
        aria-label="Mở menu tạo nhanh"
      >
        <Plus className={cn('h-6 w-6 transition', open && 'rotate-45')} />
      </button>
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]', className)}>{children}</div>;
}

function PanelTitle({ title }: { title: string }) {
  return <h2 className="text-sm font-black text-slate-950">{title}</h2>;
}

function IconButton({ icon: Icon, label, primary }: { icon: LucideIcon; label: string; primary?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold',
        primary ? 'border-blue-600 bg-blue-600 text-white' : 'border-[#E5E7EB] bg-white text-slate-700'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SmallFilter({ label }: { label: string }) {
  return (
    <button type="button" className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs font-bold text-slate-600">
      {label}
      <ChevronDown className="h-3 w-3 text-slate-400" />
    </button>
  );
}

function Avatar({ initials: value, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-900 to-blue-700 font-black text-white shadow-sm',
        size === 'sm' && 'h-8 w-8 text-[11px]',
        size === 'md' && 'h-10 w-10 text-xs',
        size === 'lg' && 'h-14 w-14 text-sm'
      )}
    >
      {value}
    </div>
  );
}

function normalizeLeads(leads: Lead[]) {
  if (!leads.length) return fallbackLeads;
  const allowed = new Set<LeadStatus>(pipelineColumns.map(column => column.status));
  return leads.slice(0, 18).map((lead, index) => ({
    ...lead,
    status: allowed.has(lead.status) ? lead.status : pipelineColumns[index % pipelineColumns.length].status,
    fullName: lead.fullName || fallbackLeads[index % fallbackLeads.length].fullName,
    leadCode: lead.leadCode || `LĐ-${index + 1}`.padStart(6, '0'),
  }));
}

function getAdvisor(lead: Lead, userMap: Map<string, string>) {
  return (lead.assignedUserId && userMap.get(lead.assignedUserId)) || advisors[Math.abs(hashCode(lead.id)) % advisors.length].name;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatShortDate(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '24/05';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function hashCode(value: string) {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
