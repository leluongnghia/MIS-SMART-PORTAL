import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  MapPin,
  Users,
  CheckSquare,
  Plus,
  Clock,
  TrendingUp,
  Award,
  Star,
  Activity,
  ChevronDown,
  ChevronUp,
  Trash2,
  DollarSign,
  CheckCircle2,
  ListTodo,
  Calendar,
  X,
  PlusCircle,
} from 'lucide-react';

// ─── TYPES ──────────────────────────────────────────────────────────────────

type EventType =
  | 'Open Day'
  | 'STEM Day'
  | 'Hội thảo'
  | 'Khai giảng'
  | 'Tốt nghiệp'
  | 'Thể thao'
  | 'Chương trình từ thiện';

type EventStatus = 'Chưa bắt đầu' | 'Đang chuẩn bị' | 'Đã hoàn thành';

interface Task {
  id: string;
  name: string;
  assignee: string;
  completed: boolean;
}

interface EventItem {
  id: string;
  name: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  expectedParticipants: number;
  budget: number;
  description: string;
  status: EventStatus;
  progress: number; // 0–100
  checklist: Task[];
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const initialEvents: EventItem[] = [
  {
    id: 'evt-001',
    name: 'Open Day 2026 – Trải nghiệm không gian sáng tạo',
    type: 'Open Day',
    date: '2026-06-25',
    time: '08:00 – 12:00',
    location: 'Sân trường & Hội trường lớn',
    expectedParticipants: 500,
    budget: 50000000,
    description: 'Ngày hội tuyển sinh trải nghiệm dành cho phụ huynh và học sinh chuẩn bị bước vào cấp THPT. Tổ chức lớp học thử nghiệm, tour tham quan và tư vấn chuyên sâu.',
    status: 'Đang chuẩn bị',
    progress: 65,
    checklist: [
      { id: 't1', name: 'Thiết kế ấn phẩm truyền thông & Standee', assignee: 'Nguyễn Thị Mai', completed: true },
      { id: 't2', name: 'Gửi thư mời và SMS cho phụ huynh đăng ký', assignee: 'Trần Văn Đức', completed: true },
      { id: 't3', name: 'Setup các gian hàng trải nghiệm câu lạc bộ', assignee: 'Lê Quang Hải', completed: false },
      { id: 't4', name: 'Chuẩn bị tea-break và quà lưu niệm', assignee: 'Phạm Minh Tuấn', completed: false },
      { id: 't5', name: 'Phân công học sinh tình nguyện viên hỗ trợ', assignee: 'Cô Lê Thị Hương', completed: true },
    ],
  },
  {
    id: 'evt-002',
    name: 'STEM Day 2026 – Khởi nguồn đam mê khoa học',
    type: 'STEM Day',
    date: '2026-07-10',
    time: '08:00 – 16:30',
    location: 'Khu liên hợp thể thao & Nhà đa năng',
    expectedParticipants: 800,
    budget: 75000000,
    description: 'Triển lãm sản phẩm STEM, robotics và các dự án khoa học kỹ thuật xuất sắc của học sinh toàn trường, kết hợp thi đấu giải đua xe tự chế và bắn tên lửa nước.',
    status: 'Đang chuẩn bị',
    progress: 20,
    checklist: [
      { id: 't11', name: 'Duyệt danh sách sản phẩm STEM trưng bày', assignee: 'Cô Trần Thị Bình', completed: true },
      { id: 't12', name: 'Mua sắm nguyên vật liệu lắp đặt kỹ thuật', assignee: 'Nguyễn Thị Mai', completed: false },
      { id: 't13', name: 'Liên hệ ban giám khảo bên ngoài', assignee: 'Thầy Nguyễn Văn An', completed: false },
      { id: 't14', name: 'Setup hệ thống âm thanh, ánh sáng gian trưng bày', assignee: 'Phòng CNTT', completed: false },
    ],
  },
  {
    id: 'evt-003',
    name: 'Workshop AI trong Giáo dục – Xu hướng và Thách thức',
    type: 'Hội thảo',
    date: '2026-06-12',
    time: '14:00 – 17:00',
    location: 'Phòng đa năng - Tầng 2',
    expectedParticipants: 120,
    budget: 15000000,
    description: 'Hội thảo chuyên đề dành cho giáo viên toàn trường và khách mời từ các trường bạn về việc ứng dụng hiệu quả ChatGPT, Gemini trong soạn giảng và quản lý giáo dục.',
    status: 'Đang chuẩn bị',
    progress: 90,
    checklist: [
      { id: 't21', name: 'Hoàn thiện slide thuyết trình của diễn giả', assignee: 'Cô Lê Thị Hương', completed: true },
      { id: 't22', name: 'Test máy chiếu, hệ thống mic và đường truyền internet', assignee: 'Phòng CNTT', completed: true },
      { id: 't23', name: 'In tài liệu hướng dẫn và check-in list', assignee: 'Lê Quang Hải', completed: true },
      { id: 't24', name: 'Chuẩn bị nước uống, hoa tươi tặng diễn giả', assignee: 'Nguyễn Thị Mai', completed: false },
    ],
  },
  {
    id: 'evt-004',
    name: 'Lễ Khai Giảng năm học mới 2026 – 2027',
    type: 'Khai giảng',
    date: '2026-09-05',
    time: '07:30 – 09:30',
    location: 'Sân trường chính',
    expectedParticipants: 1200,
    budget: 120000000,
    description: 'Buổi lễ trang trọng chào đón hơn 1200 học sinh bước vào năm học mới, đặc biệt là chào đón các em học sinh đầu cấp khối 10 gia nhập trường.',
    status: 'Chưa bắt đầu',
    progress: 5,
    checklist: [
      { id: 't31', name: 'Thông qua kế hoạch kịch bản tổng thể', assignee: 'Thầy Nguyễn Văn An', completed: true },
      { id: 't32', name: 'Duyệt chương trình văn nghệ chào mừng', assignee: 'Cô Nguyễn Thu Hà', completed: false },
      { id: 't33', name: 'Thuê bàn ghế, dù bạt che nắng', assignee: 'Lê Quang Hải', completed: false },
      { id: 't34', name: 'Liên hệ đại biểu sở và quận tham dự', assignee: 'Trần Văn Đức', completed: false },
    ],
  },
  {
    id: 'evt-005',
    name: 'Lễ Tốt Nghiệp và Trưởng Thành niên khóa 2023 – 2026',
    type: 'Tốt nghiệp',
    date: '2026-05-28',
    time: '18:00 – 22:00',
    location: 'Trung tâm Hội nghị Quốc gia',
    expectedParticipants: 600,
    budget: 200000000,
    description: 'Đêm vinh danh ấm áp và trang trọng dành cho toàn thể học sinh khối 12 tốt nghiệp cấp 3. Trao bằng danh dự, tri ân thầy cô và chương trình Prom Party.',
    status: 'Đã hoàn thành',
    progress: 100,
    checklist: [
      { id: 't41', name: 'Đặt địa điểm hội trường và duyệt menu', assignee: 'Trần Văn Đức', completed: true },
      { id: 't42', name: 'Gửi thiệp mời giấy tới phụ huynh khối 12', assignee: 'Nguyễn Thị Mai', completed: true },
      { id: 't43', name: 'Chuẩn bị lễ phục tốt nghiệp cho học sinh', assignee: 'Lê Quang Hải', completed: true },
      { id: 't44', name: 'Thiết kế kỷ yếu và clip phóng sự 3 năm học', assignee: 'Phòng CNTT', completed: true },
      { id: 't45', name: 'Tổ chức duyệt tổng thể chương trình', assignee: 'Cô Trần Thị Bình', completed: true },
    ],
  },
  {
    id: 'evt-006',
    name: 'Hội Khỏe Phù Đổng cấp trường lần thứ XV',
    type: 'Thể thao',
    date: '2026-04-15',
    time: '08:00 – 17:00',
    location: 'Sân vận động trường',
    expectedParticipants: 1000,
    budget: 40000000,
    description: 'Giải thi đấu thể thao học sinh toàn trường các bộ môn: bóng đá nam/nữ, cầu lông, điền kinh, bóng rổ và kéo co nhằm nâng cao thể lực và tinh thần đồng đội.',
    status: 'Đã hoàn thành',
    progress: 100,
    checklist: [
      { id: 't51', name: 'Ban hành điều lệ giải đấu và nhận đăng ký', assignee: 'Thầy Phạm Minh Tuấn', completed: true },
      { id: 't52', name: 'Mua sắm huy chương, cờ lưu niệm và giải thưởng', assignee: 'Nguyễn Thị Mai', completed: true },
      { id: 't53', name: 'Chuẩn bị sân bãi, lưới, bóng thi đấu', assignee: 'Lê Quang Hải', completed: true },
      { id: 't54', name: 'Bố trí tổ y tế trực sơ cứu chấn thương', assignee: 'Y tế học đường', completed: true },
    ],
  },
  {
    id: 'evt-007',
    name: 'Đêm nhạc thiện nguyện "Nâng bước em tới trường"',
    type: 'Chương trình từ thiện',
    date: '2026-05-18',
    time: '19:30 – 22:00',
    location: 'Nhà hát lớn Thành phố',
    expectedParticipants: 400,
    budget: 90000000,
    description: 'Chương trình ca nhạc gây quỹ học bổng dành cho các em học sinh có hoàn cảnh đặc biệt khó khăn vươn lên học tốt tại các điểm trường vùng sâu vùng xa.',
    status: 'Đã hoàn thành',
    progress: 100,
    checklist: [
      { id: 't61', name: 'Liên hệ xin cấp phép biểu diễn nghệ thuật', assignee: 'Thầy Nguyễn Văn An', completed: true },
      { id: 't62', name: 'Mời các ca sĩ, nghệ sĩ khách mời tham gia', assignee: 'Cô Nguyễn Thu Hà', completed: true },
      { id: 't63', name: 'Phát hành vé quyên góp ủng hộ', assignee: 'Ban Đại diện Cha mẹ HS', completed: true },
      { id: 't64', name: 'Tổng hợp quỹ nhận đóng góp và công khai tài chính', assignee: 'Phòng Kế toán', completed: true },
    ],
  },
  {
    id: 'evt-008',
    name: 'Workshop Hướng nghiệp: Khám phá bản thân - Chọn đúng ngành',
    type: 'Hội thảo',
    date: '2026-06-18',
    time: '08:30 – 11:30',
    location: 'Phòng hội trường 1',
    expectedParticipants: 300,
    budget: 25000000,
    description: 'Buổi chia sẻ kinh nghiệm hướng nghiệp từ các cựu học sinh thành đạt và các chuyên gia nhân sự giúp học sinh lớp 12 xác định hướng đi và chọn ngành phù hợp.',
    status: 'Đang chuẩn bị',
    progress: 45,
    checklist: [
      { id: 't71', name: 'Liên hệ 5 diễn giả khách mời', assignee: 'Cô Nguyễn Thu Hà', completed: true },
      { id: 't72', name: 'Tổng hợp các câu hỏi khảo sát từ học sinh', assignee: 'Cô Lê Thị Hương', completed: true },
      { id: 't73', name: 'Chuẩn bị phông nền chụp hình và quà tặng lưu niệm', assignee: 'Nguyễn Thị Mai', completed: false },
      { id: 't74', name: 'Truyền thông sự kiện qua bảng tin khối 12', assignee: 'Phòng Công nghệ', completed: false },
    ],
  },
];

const eventTypes: EventType[] = [
  'Open Day',
  'STEM Day',
  'Hội thảo',
  'Khai giảng',
  'Tốt nghiệp',
  'Thể thao',
  'Chương trình từ thiện',
];

const eventStatuses: EventStatus[] = ['Chưa bắt đầu', 'Đang chuẩn bị', 'Đã hoàn thành'];

const statusColors: Record<EventStatus, string> = {
  'Chưa bắt đầu': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
  'Đang chuẩn bị': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-350',
  'Đã hoàn thành': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-350',
};

const typeColors: Record<EventType, string> = {
  'Open Day': 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  'STEM Day': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
  'Hội thảo': 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  'Khai giảng': 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  'Tốt nghiệp': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  'Thể thao': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  'Chương trình từ thiện': 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300',
};

// Helper format date
function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function EventManagement() {
  const [activeTab, setActiveTab] = useState<'events' | 'create' | 'dashboard'>('events');
  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  // Filters state
  const [typeFilter, setTypeFilter] = useState<string>('Tất cả');
  const [statusFilter, setStatusFilter] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  // Expand collapse state for checklists
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  // Create form state
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('Open Day');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [expectedParticipants, setExpectedParticipants] = useState(100);
  const [budget, setBudget] = useState(10000000);
  const [description, setDescription] = useState('');
  const [checklistInput, setChecklistInput] = useState('');
  const [tempChecklist, setTempChecklist] = useState<Omit<Task, 'id' | 'completed'>[]>([]);
  const [formSuccess, setFormSuccess] = useState(false);

  // Handlers for Checklist expansion
  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle task complete status
  const handleToggleTask = (eventId: string, taskId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updatedChecklist = e.checklist.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          const completedCount = updatedChecklist.filter((t) => t.completed).length;
          const newProgress =
            updatedChecklist.length > 0
              ? Math.round((completedCount / updatedChecklist.length) * 100)
              : 0;
          return {
            ...e,
            checklist: updatedChecklist,
            progress: newProgress,
            status: newProgress === 100 ? 'Đã hoàn thành' : e.status === 'Chưa bắt đầu' ? 'Đang chuẩn bị' : e.status,
          };
        }
        return e;
      })
    );
  };

  // Add checklist item in create form
  const handleAddTempTask = () => {
    if (!checklistInput.trim()) return;
    setTempChecklist((prev) => [
      ...prev,
      { name: checklistInput.trim(), assignee: 'Chưa phân công' },
    ]);
    setChecklistInput('');
  };

  const handleRemoveTempTask = (index: number) => {
    setTempChecklist((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Create Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !location) return;

    const newChecklist: Task[] = tempChecklist.map((task, idx) => ({
      id: `task-${idx}-${Date.now()}`,
      name: task.name,
      assignee: task.assignee,
      completed: false,
    }));

    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      name,
      type,
      date,
      time: time || '08:00 - 11:30',
      location,
      expectedParticipants: Number(expectedParticipants),
      budget: Number(budget),
      description,
      status: 'Chưa bắt đầu',
      progress: 0,
      checklist: newChecklist,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setFormSuccess(true);
    setName('');
    setType('Open Day');
    setDate('');
    setTime('');
    setLocation('');
    setExpectedParticipants(100);
    setBudget(10000000);
    setDescription('');
    setTempChecklist([]);

    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('events');
    }, 2000);
  };

  // Computed Values
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchType = typeFilter === 'Tất cả' || e.type === typeFilter;
      const matchStatus = statusFilter === 'Tất cả' || e.status === statusFilter;
      const matchSearch =
        !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [events, typeFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter((e) => e.status !== 'Đã hoàn thành' && new Date(e.date) >= new Date('2026-06-10')).length;
    const preparing = events.filter((e) => e.status === 'Đang chuẩn bị').length;
    const completed = events.filter((e) => e.status === 'Đã hoàn thành').length;
    const totalBudget = events.reduce((sum, e) => sum + e.budget, 0);
    return { total, upcoming, preparing, completed, totalBudget };
  }, [events]);

  const countdownEvent = useMemo(() => {
    // Find next upcoming event
    const upcomingList = events
      .filter((e) => e.status !== 'Đã hoàn thành' && new Date(e.date) >= new Date('2026-06-10'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcomingList[0] || null;
  }, [events]);

  const daysToNextEvent = useMemo(() => {
    if (!countdownEvent) return null;
    const eventTime = new Date(countdownEvent.date).getTime();
    const nowTime = new Date('2026-06-10').getTime();
    const diff = eventTime - nowTime;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [countdownEvent]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 font-sans">
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 p-6 md:p-8 mb-6 shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white/90 border border-white/30 tracking-widest animate-pulse">
                MODULE 20
              </span>
              <span className="text-white/60 text-sm">MIS SMART PORTAL 2.0</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white mb-1">
              Trung Tâm Quản Lý Sự Kiện
            </h1>
            <p className="text-indigo-200 text-sm md:text-base max-w-xl font-light">
              Lập kế hoạch, quản lý ngân sách, xây dựng checklist chuẩn bị và điều hành các sự kiện lớn nhỏ trong nhà trường.
            </p>
          </div>
          {/* Stats quick count */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: 'Sự kiện năm nay', value: stats.total, color: 'border-violet-400/30 text-violet-100' },
              { label: 'Sắp diễn ra', value: stats.upcoming, color: 'border-indigo-400/30 text-indigo-100' },
              { label: 'Đang chuẩn bị', value: stats.preparing, color: 'border-amber-400/30 text-amber-100' },
              { label: 'Hoàn thành', value: stats.completed, color: 'border-emerald-400/30 text-emerald-100' },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-xl border backdrop-blur-xs px-4 py-2 text-center min-w-[100px] ${s.color}`}
              >
                <div className="text-xl font-bold font-mono">{s.value}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-6 shadow-xs overflow-x-auto">
        {(['events', 'create', 'dashboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab === 'events' ? (
              <>
                <ListTodo className="w-4 h-4" /> Danh Sách Sự Kiện
              </>
            ) : tab === 'create' ? (
              <>
                <Plus className="w-4 h-4" /> Lập Sự Kiện Mới
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" /> Dashboard Điều Hành
              </>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB: EVENTS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
            <div className="flex flex-1 min-w-[240px] items-center gap-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 px-3 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
                <span>Lọc:</span>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Tất cả">Tất cả các loại</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                {eventStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map((event) => {
              const isExpanded = !!expandedEvents[event.id];
              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${typeColors[event.type]}`}>
                          {event.type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColors[event.status]}`}>
                          {event.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {event.name}
                      </h3>
                    </div>
                    {/* Progress Circle bar */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tiến độ chuẩn bị</div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">{event.progress}%</div>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-850 flex items-center justify-center relative bg-slate-50 dark:bg-slate-800/20">
                        <div
                          className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent border-r-transparent transition-transform"
                          style={{ transform: `rotate(${(event.progress / 100) * 360 - 45}deg)` }}
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{event.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-2">
                      <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-300">Thời gian</div>
                        <div className="text-xs mt-0.5">{formatDate(event.date)}</div>
                        <div className="text-xs text-slate-400">{event.time}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-300">Địa điểm</div>
                        <div className="text-xs mt-0.5 truncate max-w-[180px]">{event.location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-300">Quy mô</div>
                        <div className="text-xs mt-0.5">{event.expectedParticipants} người tham dự</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-300">Dự chi ngân sách</div>
                        <div className="text-xs mt-0.5 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                          {event.budget.toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Paragraph */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-xl mb-4 border border-slate-100 dark:border-slate-800/80">
                    {event.description}
                  </p>

                  {/* Checklist Header Collapse Toggle */}
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Checklist chuẩn bị ({event.checklist.filter((t) => t.completed).length}/{event.checklist.length})
                    </button>
                    <span className="text-[11px] text-slate-400">
                      ID: {event.id}
                    </span>
                  </div>

                  {/* Checklist Details Drawer */}
                  {isExpanded && (
                    <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800/80 rounded-xl space-y-2.5 animate-fadeIn">
                      {event.checklist.length === 0 ? (
                        <div className="text-center text-xs text-slate-400 py-4">Chưa tạo checklist cho sự kiện này.</div>
                      ) : (
                        event.checklist.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(event.id, task.id)}
                            className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all select-none"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={task.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}>
                                {task.completed ? <CheckCircle2 className="w-4.5 h-4.5" /> : <CheckSquare className="w-4.5 h-4.5" />}
                              </div>
                              <span
                                className={`text-xs truncate ${
                                  task.completed
                                    ? 'line-through text-slate-400 dark:text-slate-550'
                                    : 'font-medium text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {task.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                              {task.assignee}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Không tìm thấy sự kiện nào thỏa mãn điều kiện lọc</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB: CREATE */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'create' && (
        <div className="max-w-3xl mx-auto">
          {formSuccess && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
              Sự kiện mới đã được tạo và thêm vào danh sách!
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Lập Kế Hoạch Sự Kiện Mới
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thiết kế thông tin và xây dựng checklist chuẩn bị ban đầu.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên sự kiện <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lễ trao giải học sinh xuất sắc Học kỳ II"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Grid 1: Type & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Loại sự kiện <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {eventTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ngày tổ chức <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Grid 2: Time & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Khung giờ
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 08:00 – 11:30"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Địa điểm tổ chức <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hội trường lớn tòa nhà A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Grid 3: Participants & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Số người dự kiến
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={expectedParticipants}
                    onChange={(e) => setExpectedParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dự trù kinh phí (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô tả sự kiện
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả nội dung chính, kế hoạch chung hoặc các lưu ý đặc biệt..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Checklist Builder */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Thiết kế checklist chuẩn bị
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên đầu việc cần chuẩn bị..."
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTempTask}
                    className="px-3 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shrink-0"
                  >
                    Thêm việc
                  </button>
                </div>

                {/* Render temp checklist items */}
                {tempChecklist.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                    {tempChecklist.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-350">{task.name}</span>
                        <div className="flex items-center gap-3">
                          <select
                            value={task.assignee}
                            onChange={(e) =>
                              setTempChecklist((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, assignee: e.target.value } : t
                                )
                              )
                            }
                            className="bg-transparent text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold focus:outline-none border-0"
                          >
                            <option value="Chưa phân công">Chưa phân công</option>
                            <option value="Nguyễn Thị Mai">Nguyễn Thị Mai</option>
                            <option value="Trần Văn Đức">Trần Văn Đức</option>
                            <option value="Lê Quang Hải">Lê Quang Hải</option>
                            <option value="Phòng CNTT">Phòng CNTT</option>
                            <option value="Thầy Nguyễn Văn An">Thầy Nguyễn Văn An</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveTempTask(idx)}
                            className="text-rose-500 hover:text-rose-700 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Lập Sự Kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB: DASHBOARD */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Row 1: Countdown Widget + Quick Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Countdown widget */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-slate-850 rounded-2xl p-5 text-white flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-400 tracking-wider mb-2">
                  <Activity className="w-3.5 h-3.5" /> Đồng Hồ Đếm Ngược
                </div>
                {countdownEvent ? (
                  <>
                    <h4 className="text-sm font-bold truncate mb-3">{countdownEvent.name}</h4>
                    <div className="flex justify-center items-center gap-3 my-2">
                      <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[70px]">
                        <div className="text-3xl font-black font-mono text-white leading-none">
                          {daysToNextEvent}
                        </div>
                        <div className="text-[9px] text-indigo-300 mt-1 uppercase font-bold">Ngày</div>
                      </div>
                      <div className="text-xl font-black text-white">:</div>
                      <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[60px]">
                        <div className="text-xl font-bold font-mono text-white leading-none">
                          {countdownEvent.time.split(' ')[0]}
                        </div>
                        <div className="text-[9px] text-indigo-300 mt-1 uppercase font-bold">Bắt đầu</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300 justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{countdownEvent.location}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">Không có sự kiện sắp diễn ra.</p>
                )}
              </div>
            </div>

            {/* Total Budget Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng ngân sách dự chi</div>
                  <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-4.5 h-4.5" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white font-mono mt-1">
                  {stats.totalBudget.toLocaleString('vi-VN')} VNĐ
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tích lũy từ tất cả {stats.total} sự kiện đã và đang được lập kế hoạch trong năm học.
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Chi nhiều nhất: Prom Tốt nghiệp</span>
                <span className="font-bold text-indigo-650">200M</span>
              </div>
            </div>

            {/* Preparation Rate widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hiệu suất chuẩn bị</div>
                  <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {events.length > 0
                      ? Math.round(events.reduce((sum, e) => sum + e.progress, 0) / events.length)
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-slate-400">Tỷ lệ hoàn thành task trung bình</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Phản ánh năng lực phân phối công việc và chuẩn bị của các tổ chuyên môn.
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Task đã hoàn thành: 28 đầu việc</span>
                <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                  <Award className="w-3.5 h-3.5" /> Tốt
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Event Timeline (Year view with month markers) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wide font-mono mb-4 flex items-center gap-1.5">
              <CalendarDays className="w-4.5 h-4.5 text-indigo-500" />
              Dòng Thời Gian Sự Kiện (Event Timeline 2026)
            </h4>
            <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">
              Trực quan hóa lộ trình tổ chức các sự kiện lớn trong năm học.
            </p>

            <div className="relative pl-6 border-l-2 border-indigo-100 dark:border-slate-800/80 space-y-6 ml-4">
              {events
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => (
                  <div key={event.id} className="relative group">
                    {/* Circle marker */}
                    <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-indigo-650 bg-white dark:bg-slate-900 group-hover:scale-125 transition-transform" />
                    <div>
                      <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        Tháng {new Date(event.date).getMonth() + 1}/2026 ({formatDate(event.date)})
                      </span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {event.name}
                        </h5>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${typeColors[event.type]}`}>
                          {event.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xl font-light">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
