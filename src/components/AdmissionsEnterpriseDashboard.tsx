import React, { useMemo, useState } from 'react';
import {
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Edit3,
  FileText,
  Mail,
  MoreHorizontal,
  Plus,
  Save,
  Send,
  Settings,
  Target,
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
type ProfileTab = 'overview' | 'info' | 'parent' | 'pipeline' | 'activity' | 'tuition' | 'handover' | 'notes';

interface PipelineCard {
  id: string;
  name: string;
  grade: string;
  gender: string;
  dob: string;
  createdAt: string;
  advisor: string;
  status: PipelineStatus;
  parentName: string;
  phone: string;
  email: string;
  address: string;
  school: string;
  source: string;
  campaign: string;
  note: string;
  tuition: number;
  paid: number;
  needScore: string;
  finance: string;
  interest: string;
  expectedEnroll: string;
  highlights: string[];
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
  {
    id: '1',
    name: 'Nguyễn Hoàng Bảo',
    grade: 'Lớp 10',
    gender: 'Nam',
    dob: '15/06/2010',
    createdAt: '23/05/2025',
    advisor: 'Lê Hồng Nhung',
    status: 'consulted',
    parentName: 'Nguyễn Hoàng Nam',
    phone: '0901 234 567',
    email: 'bao.nguyen@gmail.com',
    address: '123 Lê Văn Lương, Cầu Giấy',
    school: 'THCS Cầu Giấy',
    source: 'Facebook Ads',
    campaign: 'Tuyển sinh trực tuyến',
    note: 'Phụ huynh muốn xem thêm học bổng STEM và lịch tham quan khu nội trú.',
    tuition: 150_000_000,
    paid: 50_000_000,
    needScore: '8.5 / 10',
    finance: 'Cao',
    interest: 'Rất cao',
    expectedEnroll: '08/2025',
    highlights: ['Thích chương trình STEM', 'Quan tâm học bổng 50%', 'Muốn học nội trú', 'Phụ huynh quan tâm cơ sở vật chất'],
  },
  {
    id: '2',
    name: 'Trần Minh Anh',
    grade: 'Lớp 11',
    gender: 'Nữ',
    dob: '02/04/2009',
    createdAt: '22/05/2025',
    advisor: 'Phạm Thu Hằng',
    status: 'new',
    parentName: 'Trần Gia Bảo',
    phone: '0912 778 899',
    email: 'minhanh.family@gmail.com',
    address: 'Hoàn Kiếm, Hà Nội',
    school: 'THCS Trưng Vương',
    source: 'Website',
    campaign: 'Landing Page tháng 5',
    note: 'Cần gọi lại sau 19:00 vì phụ huynh bận giờ hành chính.',
    tuition: 180_000_000,
    paid: 0,
    needScore: '7.4 / 10',
    finance: 'Trung bình',
    interest: 'Cao',
    expectedEnroll: '09/2025',
    highlights: ['Quan tâm chương trình song ngữ', 'Cần lịch test cuối tuần'],
  },
  {
    id: '3',
    name: 'Lê Quang Huy',
    grade: 'Lớp 10',
    gender: 'Nam',
    dob: '12/11/2010',
    createdAt: '19/05/2025',
    advisor: 'Trần Văn Minh',
    status: 'contacted',
    parentName: 'Lê Thanh Tùng',
    phone: '0988 120 456',
    email: 'quanghuy@outlook.com',
    address: 'Tây Hồ, Hà Nội',
    school: 'THCS Chu Văn An',
    source: 'Giới thiệu',
    campaign: 'Referral',
    note: 'Gia đình đã được giới thiệu bởi phụ huynh lớp 10A1.',
    tuition: 150_000_000,
    paid: 0,
    needScore: '7.9 / 10',
    finance: 'Cao',
    interest: 'Cao',
    expectedEnroll: '08/2025',
    highlights: ['Quan tâm lớp chuyên Toán', 'Cần tư vấn học phí theo kỳ'],
  },
  {
    id: '4',
    name: 'Phạm Ngọc Lan',
    grade: 'Lớp 12',
    gender: 'Nữ',
    dob: '08/02/2008',
    createdAt: '18/05/2025',
    advisor: 'Nguyễn Hoàng Nam',
    status: 'contacted',
    parentName: 'Phạm Thu Hằng',
    phone: '0962 114 778',
    email: 'ngoclan.family@gmail.com',
    address: 'Hà Đông, Hà Nội',
    school: 'THPT Lê Quý Đôn',
    source: 'TikTok Ads',
    campaign: 'Video Admissions',
    note: 'Muốn nhận thông tin lộ trình ôn thi và học bổng.',
    tuition: 170_000_000,
    paid: 0,
    needScore: '6.8 / 10',
    finance: 'Trung bình',
    interest: 'Khá',
    expectedEnroll: '08/2025',
    highlights: ['Quan tâm học bổng', 'Cần lịch phỏng vấn online'],
  },
  {
    id: '5',
    name: 'Đỗ Gia Bảo',
    grade: 'Lớp 10',
    gender: 'Nam',
    dob: '21/09/2010',
    createdAt: '16/05/2025',
    advisor: 'Lê Hồng Nhung',
    status: 'consulted',
    parentName: 'Đỗ Quốc Anh',
    phone: '0936 654 221',
    email: 'giabao.parent@gmail.com',
    address: 'Nam Từ Liêm, Hà Nội',
    school: 'THCS Marie Curie',
    source: 'Zalo OA',
    campaign: 'Zalo tư vấn',
    note: 'Đã tư vấn, phụ huynh muốn tham quan campus chính.',
    tuition: 150_000_000,
    paid: 20_000_000,
    needScore: '8.1 / 10',
    finance: 'Cao',
    interest: 'Rất cao',
    expectedEnroll: '08/2025',
    highlights: ['Đã có điểm test tốt', 'Quan tâm STEM'],
  },
  {
    id: '6',
    name: 'Nguyễn Thu Hà',
    grade: 'Lớp 9',
    gender: 'Nữ',
    dob: '01/10/2011',
    createdAt: '15/05/2025',
    advisor: 'Phạm Thu Hằng',
    status: 'consulted',
    parentName: 'Nguyễn Hoàng Nam',
    phone: '0903 881 222',
    email: 'thuha.parent@gmail.com',
    address: 'Cầu Giấy, Hà Nội',
    school: 'THCS Dịch Vọng',
    source: 'Website',
    campaign: 'Search Brand',
    note: 'Cần gửi thêm thông tin học bổng cho khối 9.',
    tuition: 145_000_000,
    paid: 0,
    needScore: '7.6 / 10',
    finance: 'Cao',
    interest: 'Cao',
    expectedEnroll: '09/2025',
    highlights: ['Quan tâm lớp tiếng Anh tăng cường'],
  },
  {
    id: '7',
    name: 'Hoàng Minh Đức',
    grade: 'Lớp 12',
    gender: 'Nam',
    dob: '03/03/2008',
    createdAt: '13/05/2025',
    advisor: 'Trần Văn Minh',
    status: 'submitted',
    parentName: 'Vũ Thị Mai Anh',
    phone: '0977 888 909',
    email: 'minhduc.parent@gmail.com',
    address: 'Thanh Xuân, Hà Nội',
    school: 'THPT Nhân Chính',
    source: 'Sự kiện',
    campaign: 'Open Day',
    note: 'Đã nộp hồ sơ, chờ hội đồng xét duyệt học bổng.',
    tuition: 180_000_000,
    paid: 60_000_000,
    needScore: '8.8 / 10',
    finance: 'Cao',
    interest: 'Rất cao',
    expectedEnroll: '08/2025',
    highlights: ['Hồ sơ đầy đủ', 'Điểm test cao'],
  },
  {
    id: '8',
    name: 'Vũ Mỹ Anh',
    grade: 'Lớp 10',
    gender: 'Nữ',
    dob: '09/12/2010',
    createdAt: '12/05/2025',
    advisor: 'Lê Hồng Nhung',
    status: 'submitted',
    parentName: 'Vũ Minh Quân',
    phone: '0916 455 884',
    email: 'myanh.family@gmail.com',
    address: 'Long Biên, Hà Nội',
    school: 'THCS Ngọc Lâm',
    source: 'Facebook Ads',
    campaign: 'Lead Form',
    note: 'Cần kiểm tra hồ sơ y tế và giấy khai sinh bản sao.',
    tuition: 150_000_000,
    paid: 30_000_000,
    needScore: '7.8 / 10',
    finance: 'Trung bình',
    interest: 'Cao',
    expectedEnroll: '08/2025',
    highlights: ['Cần bổ sung hồ sơ', 'Quan tâm xe bus'],
  },
  {
    id: '9',
    name: 'Bùi Quốc Anh',
    grade: 'Lớp 11',
    gender: 'Nam',
    dob: '17/07/2009',
    createdAt: '10/05/2025',
    advisor: 'Nguyễn Hoàng Nam',
    status: 'reviewing',
    parentName: 'Bùi Quốc Thắng',
    phone: '0915 664 331',
    email: 'quocanh.parent@gmail.com',
    address: 'Ba Đình, Hà Nội',
    school: 'THPT Phan Đình Phùng',
    source: 'Facebook Ads',
    campaign: 'Scholarship',
    note: 'Đang xét duyệt học bổng 40%.',
    tuition: 180_000_000,
    paid: 80_000_000,
    needScore: '8.9 / 10',
    finance: 'Cao',
    interest: 'Rất cao',
    expectedEnroll: '08/2025',
    highlights: ['Đang xét duyệt học bổng', 'Phụ huynh cần quyết định trong tuần'],
  },
  {
    id: '10',
    name: 'Lê Thanh Tùng',
    grade: 'Lớp 10',
    gender: 'Nam',
    dob: '29/01/2010',
    createdAt: '09/05/2025',
    advisor: 'Phạm Thu Hằng',
    status: 'reviewing',
    parentName: 'Lê Thu Trang',
    phone: '0972 100 336',
    email: 'thanhtung.parent@gmail.com',
    address: 'Đống Đa, Hà Nội',
    school: 'THCS Thái Thịnh',
    source: 'Website',
    campaign: 'Admissions SEO',
    note: 'Cần xác nhận lịch phỏng vấn với BGH.',
    tuition: 150_000_000,
    paid: 50_000_000,
    needScore: '8.2 / 10',
    finance: 'Cao',
    interest: 'Cao',
    expectedEnroll: '08/2025',
    highlights: ['Chờ lịch phỏng vấn', 'Cần gửi bảng phí nội trú'],
  },
];

const columns: Array<{ id: PipelineStatus; label: string; tint: string }> = [
  { id: 'new', label: 'Lead mới', tint: 'bg-blue-50 border-blue-100' },
  { id: 'contacted', label: 'Đã liên hệ', tint: 'bg-cyan-50 border-cyan-100' },
  { id: 'consulted', label: 'Đã tư vấn', tint: 'bg-violet-50 border-violet-100' },
  { id: 'submitted', label: 'Đã nộp hồ sơ', tint: 'bg-amber-50 border-amber-100' },
  { id: 'reviewing', label: 'Đang xét duyệt', tint: 'bg-rose-50 border-rose-100' },
];

const profileTabs: Array<{ id: ProfileTab; label: string }> = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'info', label: 'Thông tin' },
  { id: 'parent', label: 'Phụ huynh' },
  { id: 'pipeline', label: 'Phễu tuyển sinh' },
  { id: 'activity', label: 'Hoạt động' },
  { id: 'tuition', label: 'Học phí' },
  { id: 'handover', label: 'Bàn giao' },
  { id: 'notes', label: 'Ghi chú' },
];

const todoSeed = [
  { id: 'call', label: 'Gọi điện tư vấn 12 Lead', priority: 'Ưu tiên cao', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  { id: 'overdue', label: 'Theo dõi 8 hồ sơ quá hạn', priority: 'Ưu tiên cao', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  { id: 'scholarship', label: 'Gửi thông tin học bổng', priority: 'Ưu tiên trung bình', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { id: 'interview', label: 'Xác nhận lịch phỏng vấn', priority: 'Ưu tiên trung bình', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { id: 'weekly', label: 'Báo cáo tuần', priority: 'Ưu tiên thấp', color: 'bg-slate-50 text-slate-600 border-slate-100' },
];

const activitySeed = [
  { time: '10:15', title: 'Lê Hồng Nhung tạo Lead mới', desc: 'Nguyễn Hoàng Bảo - Lớp 10' },
  { time: '10:02', title: 'Phạm Thu Hằng cập nhật trạng thái', desc: 'Trần Gia Bảo - Đã tư vấn' },
  { time: '09:45', title: 'Trần Văn Minh gửi Email', desc: 'Gửi thông tin chương trình học bổng' },
  { time: '09:30', title: 'Nguyễn Hoàng Nam tạo lịch hẹn', desc: 'Hẹn tư vấn trực tiếp 16:00' },
];

const pipelineSteps = ['Lead mới', 'Đã liên hệ', 'Đã tư vấn', 'Đã tham quan trường', 'Đã nộp hồ sơ', 'Đang xét duyệt', 'Đã đóng học phí', 'Đã nhập học'];
const statusStepIndex: Record<PipelineStatus, number> = { new: 0, contacted: 1, consulted: 2, submitted: 4, reviewing: 5 };
const variableList = ['{{student_name}}', '{{parent_name}}', '{{grade}}', '{{program}}', '{{tuition_fee}}'];

export default function AdmissionsEnterpriseDashboard() {
  const [cards, setCards] = useState(initialCards);
  const [selectedLeadId, setSelectedLeadId] = useState(initialCards[0].id);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [editing, setEditing] = useState(false);
  const [doneTodos, setDoneTodos] = useState<Set<string>>(new Set());
  const [activityLog, setActivityLog] = useState(activitySeed);
  const [activityInput, setActivityInput] = useState('');
  const [emailSubject, setEmailSubject] = useState('Thông tin chương trình học năm học 2025 - 2026');
  const [emailBody, setEmailBody] = useState('Kính gửi {{parent_name}},\n\nCảm ơn Anh/Chị đã quan tâm đến chương trình học của {{student_name}} tại MIS.\n\nDưới đây là thông tin chi tiết về chương trình {{program}}, học phí {{tuition_fee}} và lộ trình tuyển sinh.');
  const [sentMessage, setSentMessage] = useState('');
  const [pipelineEnabled, setPipelineEnabled] = useState<Record<string, boolean>>(() => Object.fromEntries(pipelineSteps.map(step => [step, true])));
  const [handoverDone, setHandoverDone] = useState<Set<string>>(new Set(['academic']));
  const [fabOpen, setFabOpen] = useState(false);

  const selectedLead = cards.find(card => card.id === selectedLeadId) || cards[0];
  const selectedStageLabel = columns.find(column => column.id === selectedLead.status)?.label || 'Lead mới';
  const selectedStep = statusStepIndex[selectedLead.status];

  const cardsByStatus = useMemo(() => {
    return columns.map(column => ({
      ...column,
      items: cards.filter(card => card.status === column.id),
    }));
  }, [cards]);

  const paymentRows = useMemo(() => cards.slice(0, 5).map(card => ({
    id: card.id,
    name: card.name,
    grade: card.grade,
    tuition: card.tuition,
    paid: card.paid,
    remaining: Math.max(0, card.tuition - card.paid),
    status: card.paid >= card.tuition ? 'Đã đóng' : card.paid > 0 ? 'Đã cọc' : 'Chưa thu',
  })), [cards]);

  const updateSelectedLead = (patch: Partial<PipelineCard>) => {
    setCards(current => current.map(card => card.id === selectedLead.id ? { ...card, ...patch } : card));
  };

  const moveCard = (status: PipelineStatus) => {
    if (!draggingId) return;
    setCards(current => current.map(card => card.id === draggingId ? { ...card, status } : card));
    setSelectedLeadId(draggingId);
    setDraggingId(null);
  };

  const toggleTodo = (id: string) => {
    setDoneTodos(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addActivity = () => {
    const value = activityInput.trim();
    if (!value) return;
    setActivityLog(current => [{ time: 'Vừa xong', title: `${selectedLead.advisor} cập nhật hồ sơ`, desc: value }, ...current]);
    updateSelectedLead({ note: value });
    setActivityInput('');
  };

  const insertVariable = (variable: string) => {
    setEmailBody(current => `${current}${current.endsWith('\n') ? '' : '\n'}${variable}`);
  };

  const sendEmail = () => {
    setSentMessage(`Đã tạo email "${emailSubject}" cho ${selectedLead.parentName}`);
    setActivityLog(current => [{ time: 'Vừa xong', title: `${selectedLead.advisor} gửi Email`, desc: `Email cho ${selectedLead.parentName}` }, ...current]);
  };

  const markPayment = (leadId: string) => {
    setCards(current => current.map(card => card.id === leadId ? { ...card, paid: card.tuition } : card));
  };

  const togglePipeline = (step: string) => {
    setPipelineEnabled(current => ({ ...current, [step]: !current[step] }));
  };

  const toggleHandover = (id: string) => {
    setHandoverDone(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
                <button key={item.label} type="button" className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.07)]">
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
                </button>
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
                    <button key={item.label} type="button" className="grid w-full grid-cols-[1fr_132px] items-center gap-4 rounded-xl px-2 py-1 text-left transition hover:bg-slate-50">
                      <div className="flex justify-center">
                        <div className="h-9 rounded-md shadow-sm" style={{ width: `${item.width}%`, background: item.color }} />
                      </div>
                      <div className="text-xs">
                        <p className="font-black text-slate-800">{item.label}</p>
                        <p className="font-bold text-slate-500">{item.value.toLocaleString('vi-VN')} ({item.percent})</p>
                      </div>
                    </button>
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
                      <button key={item.name} type="button" className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1 text-left text-sm transition hover:bg-slate-50">
                        <span className="flex min-w-0 items-center gap-2 font-bold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                          {item.name}
                        </span>
                        <span className="font-black text-slate-900">{item.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel title="Bảng xếp hạng tư vấn viên" action="Tuần này">
                <div className="space-y-4">
                  {advisors.map(item => (
                    <button key={item.name} type="button" className="grid w-full grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl p-1 text-left transition hover:bg-slate-50">
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
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="grid gap-5 2xl:grid-cols-2">
              <Panel title="Hoạt động gần đây">
                <ActivityList items={activityLog.slice(0, 4)} />
              </Panel>

              <Panel title="Việc cần làm">
                <div className="space-y-3">
                  {todoSeed.map(todo => {
                    const done = doneTodos.has(todo.id);
                    return (
                      <label key={todo.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                        <input type="checkbox" checked={done} onChange={() => toggleTodo(todo.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                        <span className={cn('min-w-0 flex-1 text-sm font-bold', done ? 'text-slate-400 line-through' : 'text-slate-800')}>{todo.label}</span>
                        <span className={cn('rounded-full border px-2 py-1 text-[11px] font-black', todo.color)}>{todo.priority}</span>
                      </label>
                    );
                  })}
                </div>
              </Panel>
            </div>

            <Panel title="Kanban Pipeline" action="Kéo thả để đổi trạng thái">
              <div className="grid gap-3 xl:grid-cols-5">
                {cardsByStatus.map(column => (
                  <div key={column.id} onDragOver={event => event.preventDefault()} onDrop={() => moveCard(column.id)} className={cn('min-h-[280px] rounded-2xl border p-3', column.tint)}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900">{column.label}</h3>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-slate-500">{column.items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {column.items.map(card => (
                        <button
                          key={card.id}
                          type="button"
                          draggable
                          onClick={() => setSelectedLeadId(card.id)}
                          onDragStart={() => setDraggingId(card.id)}
                          onDragEnd={() => setDraggingId(null)}
                          className={cn('w-full cursor-grab rounded-xl border bg-white p-3 text-left shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition active:cursor-grabbing', selectedLead.id === card.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200')}
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
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid gap-5 2xl:grid-cols-[1.3fr_.7fr]">
              <Panel title="Email Template">
                <div className="space-y-3">
                  <input value={emailSubject} onChange={event => setEmailSubject(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-800" />
                  <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {['B', 'I', 'U', '•', '1.', '@', 'Link', 'Ảnh'].map(item => (
                      <button key={item} type="button" onClick={() => setEmailBody(current => `${current}${item === 'Link' ? '\nhttps://mis.edu.vn/admissions' : ''}`)} className="h-8 rounded-lg bg-white px-3 text-xs font-black text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700">{item}</button>
                    ))}
                  </div>
                  <textarea value={emailBody} onChange={event => setEmailBody(event.target.value)} rows={8} className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm font-medium leading-relaxed text-slate-700" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-600">{sentMessage}</span>
                    <button type="button" onClick={sendEmail} className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-black text-white hover:bg-blue-700">
                      <Send className="h-3.5 w-3.5" />
                      Gửi email
                    </button>
                  </div>
                </div>
              </Panel>

              <Panel title="Biến động">
                <div className="space-y-2">
                  {variableList.map(item => (
                    <button key={item} type="button" onClick={() => insertVariable(item)} className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left text-xs font-black text-slate-700 hover:border-blue-200 hover:bg-blue-50">
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
                    ['Tổng học phí', compactMoney(paymentRows.reduce((sum, row) => sum + row.tuition, 0))],
                    ['Đã thu', compactMoney(paymentRows.reduce((sum, row) => sum + row.paid, 0))],
                    ['Còn lại', compactMoney(paymentRows.reduce((sum, row) => sum + row.remaining, 0))],
                    ['Tỷ lệ thu', `${Math.round(paymentRows.reduce((sum, row) => sum + row.paid, 0) / paymentRows.reduce((sum, row) => sum + row.tuition, 0) * 100)}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] font-bold text-slate-500">{label}</p>
                      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
                <PaymentTable rows={paymentRows} onMarkPaid={markPayment} />
              </Panel>

              <Panel title="Cài đặt Pipeline">
                <div className="space-y-2">
                  {pipelineSteps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-slate-500">{index + 1}</span>
                      <span className="min-w-0 flex-1 text-sm font-black text-slate-800">{step}</span>
                      <button type="button" onClick={() => togglePipeline(step)} className={cn('h-5 w-9 rounded-full p-0.5 transition', pipelineEnabled[step] ? 'bg-blue-600' : 'bg-slate-300')}>
                        <span className={cn('block h-4 w-4 rounded-full bg-white transition', pipelineEnabled[step] && 'translate-x-4')} />
                      </button>
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
                <Avatar initials={initials(selectedLead.name)} large />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-950">{selectedLead.name}</h2>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">{selectedStageLabel}</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-500">{selectedLead.grade} · {selectedLead.gender} · {selectedLead.dob}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton label={editing ? 'Lưu' : 'Chỉnh sửa'} icon={editing ? Save : Edit3} onClick={() => setEditing(value => !value)} />
                <ActionButton label="Gửi Email" icon={Mail} primary onClick={() => {
                  setEmailBody(current => current.replaceAll('{{student_name}}', selectedLead.name).replaceAll('{{parent_name}}', selectedLead.parentName).replaceAll('{{grade}}', selectedLead.grade));
                  sendEmail();
                }} />
                <ActionButton label="Khác" icon={MoreHorizontal} onClick={() => setActiveTab('notes')} />
              </div>
              <div className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-100">
                {profileTabs.map(tab => (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cn('shrink-0 border-b-2 px-3 py-2 text-xs font-black', activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800')}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <ProfileTabContent
                  tab={activeTab}
                  lead={selectedLead}
                  editing={editing}
                  selectedStep={selectedStep}
                  handoverDone={handoverDone}
                  onPatch={updateSelectedLead}
                  onSetStatus={status => updateSelectedLead({ status })}
                  onToggleHandover={toggleHandover}
                  activityInput={activityInput}
                  setActivityInput={setActivityInput}
                  addActivity={addActivity}
                  activityLog={activityLog}
                  onMarkPaid={() => markPayment(selectedLead.id)}
                />
              </div>
            </Panel>

            <Panel title="Thông tin cần chú ý">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {selectedLead.highlights.map((label, index) => (
                  <div key={label} className={cn('rounded-xl px-3 py-2 text-xs font-black', ['bg-amber-50 text-amber-700', 'bg-cyan-50 text-cyan-700', 'bg-violet-50 text-violet-700', 'bg-rose-50 text-rose-700'][index % 4])}>{label}</div>
                ))}
              </div>
            </Panel>

            <Panel title="Ghi chú gần đây">
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-black text-slate-900">{selectedLead.note}</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">{selectedLead.createdAt} 09:30</p>
                </div>
                {activityLog.slice(0, 1).map(item => (
                  <div key={`${item.time}-${item.title}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-black text-slate-900">{item.desc}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">{item.time}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Điểm đánh giá">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Need Score', selectedLead.needScore, 'text-blue-600'],
                  ['Khả năng tài chính', selectedLead.finance, 'text-emerald-600'],
                  ['Mức độ quan tâm', selectedLead.interest, 'text-cyan-600'],
                  ['Dự kiến nhập học', selectedLead.expectedEnroll, 'text-violet-600'],
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
        {fabOpen && (
          <div className="mb-3 space-y-2">
            {['Tạo Lead', 'Tạo Hồ sơ', 'Tạo Lịch hẹn', 'Tạo Email', 'Tạo Công việc'].map(action => (
              <button key={action} type="button" onClick={() => {
                setActivityLog(current => [{ time: 'Vừa xong', title: action, desc: `${action} cho ${selectedLead.name}` }, ...current]);
                setFabOpen(false);
              }} className="flex h-10 w-44 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-lg hover:border-blue-200 hover:bg-blue-50">
                {action}
                <Plus className="h-4 w-4 text-blue-600" />
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setFabOpen(value => !value)} className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.35)] hover:bg-blue-700" aria-label="Tạo nhanh">
          <Plus className={cn('h-6 w-6 transition', fabOpen && 'rotate-45')} />
        </button>
      </div>
    </div>
  );
}

function ProfileTabContent({
  tab,
  lead,
  editing,
  selectedStep,
  handoverDone,
  onPatch,
  onSetStatus,
  onToggleHandover,
  activityInput,
  setActivityInput,
  addActivity,
  activityLog,
  onMarkPaid,
}: {
  tab: ProfileTab;
  lead: PipelineCard;
  editing: boolean;
  selectedStep: number;
  handoverDone: Set<string>;
  onPatch: (patch: Partial<PipelineCard>) => void;
  onSetStatus: (status: PipelineStatus) => void;
  onToggleHandover: (id: string) => void;
  activityInput: string;
  setActivityInput: (value: string) => void;
  addActivity: () => void;
  activityLog: typeof activitySeed;
  onMarkPaid: () => void;
}) {
  if (tab === 'info') {
    return (
      <div className="grid gap-3 2xl:grid-cols-2">
        <EditableInfo label="SĐT" value={lead.phone} disabled={!editing} onChange={value => onPatch({ phone: value })} />
        <EditableInfo label="Email" value={lead.email} disabled={!editing} onChange={value => onPatch({ email: value })} />
        <EditableInfo label="Địa chỉ" value={lead.address} disabled={!editing} onChange={value => onPatch({ address: value })} />
        <EditableInfo label="Trường" value={lead.school} disabled={!editing} onChange={value => onPatch({ school: value })} />
        <EditableInfo label="Nguồn" value={lead.source} disabled={!editing} onChange={value => onPatch({ source: value })} />
        <EditableInfo label="Tư vấn viên" value={lead.advisor} disabled={!editing} onChange={value => onPatch({ advisor: value })} />
      </div>
    );
  }

  if (tab === 'parent') {
    return (
      <div className="grid gap-3 2xl:grid-cols-2">
        <EditableInfo label="Phụ huynh" value={lead.parentName} disabled={!editing} onChange={value => onPatch({ parentName: value })} />
        <EditableInfo label="SĐT phụ huynh" value={lead.phone} disabled={!editing} onChange={value => onPatch({ phone: value })} />
        <EditableInfo label="Email phụ huynh" value={lead.email} disabled={!editing} onChange={value => onPatch({ email: value })} />
        <EditableInfo label="Chiến dịch" value={lead.campaign} disabled={!editing} onChange={value => onPatch({ campaign: value })} />
      </div>
    );
  }

  if (tab === 'pipeline') {
    return (
      <div className="space-y-3">
        <PipelineChecklist selectedStep={selectedStep} />
        <div className="grid gap-2 sm:grid-cols-2">
          {columns.map(column => (
            <button key={column.id} type="button" onClick={() => onSetStatus(column.id)} className={cn('rounded-xl border px-3 py-2 text-left text-xs font-black transition hover:border-blue-300', lead.status === column.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-700')}>
              Chuyển sang: {column.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'activity') {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <input value={activityInput} onChange={event => setActivityInput(event.target.value)} placeholder="Nhập ghi chú cuộc gọi/tư vấn..." className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button type="button" onClick={addActivity} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-black text-white">
            <Send className="h-4 w-4" />
            Lưu
          </button>
        </div>
        <ActivityList items={activityLog} />
      </div>
    );
  }

  if (tab === 'tuition') {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricBox label="Tổng học phí" value={money(lead.tuition)} />
        <MetricBox label="Đã thu" value={money(lead.paid)} />
        <MetricBox label="Còn lại" value={money(Math.max(0, lead.tuition - lead.paid))} />
        <button type="button" onClick={onMarkPaid} className="sm:col-span-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white hover:bg-emerald-700">
          <CreditCard className="h-4 w-4" />
          Đánh dấu đã thu đủ
        </button>
      </div>
    );
  }

  if (tab === 'handover') {
    const items = [
      ['academic', 'Bàn giao học vụ', 'Danh sách lớp dự kiến, khối, chương trình'],
      ['finance', 'Bàn giao tài chính', 'Học phí, ưu đãi, khoản còn lại'],
      ['homeroom', 'Bàn giao GVCN', 'Thông tin học sinh và lưu ý chăm sóc'],
      ['student360', 'Đồng bộ Student 360', 'Hồ sơ học sinh, phụ huynh, học phí'],
    ];
    return (
      <div className="space-y-2">
        {items.map(([id, title, desc]) => (
          <label key={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <input type="checkbox" checked={handoverDone.has(id)} onChange={() => onToggleHandover(id)} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600" />
            <span>
              <span className="block text-sm font-black text-slate-900">{title}</span>
              <span className="text-xs font-semibold text-slate-500">{desc}</span>
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (tab === 'notes') {
    return (
      <textarea value={lead.note} onChange={event => onPatch({ note: event.target.value })} rows={6} className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm font-medium leading-relaxed text-slate-700" />
    );
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-2">
      <InfoBlock title="Thông tin chung" rows={[
        ['SĐT', lead.phone],
        ['Email', lead.email],
        ['Địa chỉ', lead.address],
        ['Trường', lead.school],
        ['Nguồn', lead.source],
        ['Ngày tạo', lead.createdAt],
        ['Tư vấn viên', lead.advisor],
      ]} />
      <PipelineChecklist selectedStep={selectedStep} />
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-950">{title}</h2>
        {action && <span className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500">{action}</span>}
      </div>
      {children}
    </section>
  );
}

function ControlButton({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </button>
  );
}

function ActionButton({ label, icon: Icon, primary, onClick }: { label: string; icon: React.ComponentType<{ className?: string }>; primary?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn('inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black', primary ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}>
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

function PipelineChecklist({ selectedStep }: { selectedStep: number }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">Pipeline tuyển sinh</h3>
      <div className="mt-3 space-y-2">
        {pipelineSteps.map((step, index) => (
          <div key={step} className="flex items-center gap-2 text-xs">
            <span className={cn('grid h-5 w-5 place-items-center rounded-full border', index <= selectedStep ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-300')}>
              {index <= selectedStep ? <Check className="h-3 w-3" /> : null}
            </span>
            <span className={cn('font-bold', index <= selectedStep ? 'text-slate-900' : 'text-slate-500')}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditableInfo({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      <input value={value} disabled={disabled} onChange={event => onChange(event.target.value)} className={cn('mt-1 h-10 w-full rounded-xl border px-3 text-sm font-bold', disabled ? 'border-slate-100 bg-slate-50 text-slate-600' : 'border-blue-200 bg-white text-slate-900 outline-none ring-2 ring-blue-50')} />
    </label>
  );
}

function ActivityList({ items }: { items: typeof activitySeed }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.time}-${item.title}-${index}`} className="grid grid-cols-[58px_18px_1fr] gap-3">
          <span className="text-xs font-black text-slate-500">{item.time}</span>
          <span className={cn('mt-1 h-3 w-3 rounded-full ring-4', index === 0 ? 'bg-blue-500 ring-blue-50' : 'bg-slate-300 ring-slate-50')} />
          <div>
            <p className="text-sm font-black text-slate-900">{item.title}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentTable({ rows, onMarkPaid }: { rows: Array<{ id: string; name: string; grade: string; tuition: number; paid: number; remaining: number; status: string }>; onMarkPaid: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-xs">
        <thead className="text-slate-500">
          <tr>
            {['Học sinh', 'Khối', 'Học phí', 'Đã thu', 'Còn lại', 'Trạng thái', 'Thao tác'].map(head => <th key={head} className="border-b border-slate-100 py-2 font-black">{head}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-b border-slate-50 last:border-0">
              <td className="py-3 font-black text-slate-900">{row.name}</td>
              <td className="py-3 font-bold text-slate-600">{row.grade}</td>
              <td className="py-3 font-bold text-slate-600">{money(row.tuition)}</td>
              <td className="py-3 font-bold text-slate-600">{money(row.paid)}</td>
              <td className="py-3 font-bold text-slate-600">{money(row.remaining)}</td>
              <td className="py-3">
                <span className={cn('rounded-full px-2 py-1 font-black', row.status === 'Đã đóng' ? 'bg-emerald-50 text-emerald-700' : row.status === 'Đã cọc' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700')}>{row.status}</span>
              </td>
              <td className="py-3">
                <button type="button" onClick={() => onMarkPaid(row.id)} className="rounded-lg border border-slate-200 px-2 py-1 font-black text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">Thu đủ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function compactMoney(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(value % 1_000_000_000 === 0 ? 0 : 2)} tỷ`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)} triệu`;
  return money(value);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
