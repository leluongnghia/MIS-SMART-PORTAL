import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Users,
  ClipboardList,
  CheckSquare,
  Plus,
  Clock,
  MapPin,
  Video,
  ChevronRight,
  Bell,
  FileText,
  User,
  Filter,
  Search,
  CheckCircle2,
  Circle,
  AlertCircle,
  X,
  Save,
  ExternalLink,
  Building2,
  Paperclip,
  Edit3,
} from 'lucide-react';

// ─── TYPES ──────────────────────────────────────────────────────────────────

type MeetingType = 'BGH' | 'Phòng ban' | 'Chuyên môn' | 'Toàn trường';
type MeetingStatus = 'Sắp diễn ra' | 'Đang họp' | 'Đã kết thúc' | 'Hủy';
type ActionStatus = 'Chưa làm' | 'Đang làm' | 'Hoàn thành';

interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  isOnline: boolean;
  chair: string;
  attendees: string[];
  agenda: string[];
  status: MeetingStatus;
  hasMinutes: boolean;
}

interface Minutes {
  id: string;
  meetingId: string;
  content: string;
  conclusions: string[];
  signedBy: string[];
  createdAt: string;
}

interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  task: string;
  assignee: string;
  deadline: string;
  status: ActionStatus;
  note: string;
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Ban Giám hiệu',
  'Phòng Đào tạo',
  'Phòng Hành Chính',
  'Tổ Toán',
  'Tổ Ngữ văn',
  'Tổ Anh',
  'Tổ Lý',
  'Tổ Hóa',
  'Tổ Sinh',
  'Tổ Sử',
  'Tổ Địa',
  'Phòng Tài Chính',
];

const initialMeetings: Meeting[] = [
  {
    id: 'MTG001',
    title: 'Họp Ban Giám hiệu Tháng 6/2026',
    type: 'BGH',
    date: '2026-06-13',
    startTime: '08:00',
    endTime: '10:00',
    room: 'Phòng họp BGH - Tầng 3',
    isOnline: false,
    chair: 'Thầy Nguyễn Văn An',
    attendees: ['Ban Giám hiệu', 'Phòng Đào tạo', 'Phòng Hành Chính', 'Phòng Tài Chính'],
    agenda: [
      'Đánh giá kết quả học tập Học kỳ II',
      'Kế hoạch tổ chức thi học kỳ',
      'Phân công giáo viên coi thi',
      'Thảo luận ngân sách cơ sở vật chất',
    ],
    status: 'Sắp diễn ra',
    hasMinutes: false,
  },
  {
    id: 'MTG002',
    title: 'Họp Chuyên Môn Tổ Toán – Kiểm Tra Chéo',
    type: 'Chuyên môn',
    date: '2026-06-14',
    startTime: '14:00',
    endTime: '16:30',
    room: 'Phòng họp 2.01',
    isOnline: false,
    chair: 'Cô Trần Thị Bình',
    attendees: ['Tổ Toán', 'Phòng Đào tạo'],
    agenda: [
      'Rà soát đề cương ôn tập',
      'Thống nhất ma trận đề thi học kỳ',
      'Phân công ra đề và phản biện',
    ],
    status: 'Sắp diễn ra',
    hasMinutes: false,
  },
  {
    id: 'MTG003',
    title: 'Họp Hội đồng Sư Phạm Toàn Trường',
    type: 'Toàn trường',
    date: '2026-06-05',
    startTime: '07:30',
    endTime: '09:30',
    room: 'Hội trường lớn – Tầng 1',
    isOnline: false,
    chair: 'Thầy Nguyễn Văn An',
    attendees: ['Ban Giám hiệu', 'Phòng Đào tạo', 'Tổ Toán', 'Tổ Ngữ văn', 'Tổ Anh', 'Tổ Lý', 'Tổ Hóa'],
    agenda: [
      'Tổng kết học kỳ I năm học 2025-2026',
      'Triển khai kế hoạch học kỳ II',
      'Thông báo chính sách mới của Bộ GD&ĐT',
    ],
    status: 'Đã kết thúc',
    hasMinutes: true,
  },
  {
    id: 'MTG004',
    title: 'Họp Phòng Đào tạo – Cập Nhật Chương Trình',
    type: 'Phòng ban',
    date: '2026-06-03',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Online – MS Teams',
    isOnline: true,
    chair: 'Cô Lê Thị Hương',
    attendees: ['Phòng Đào tạo', 'Tổ Toán', 'Tổ Ngữ văn', 'Tổ Anh'],
    agenda: [
      'Cập nhật chương trình GDPT 2018',
      'Kế hoạch bồi dưỡng giáo viên',
      'Triển khai đánh giá theo năng lực',
    ],
    status: 'Đã kết thúc',
    hasMinutes: true,
  },
  {
    id: 'MTG005',
    title: 'Họp Tổ Ngữ văn – Kế Hoạch Viết Văn Sáng Tạo',
    type: 'Chuyên môn',
    date: '2026-05-28',
    startTime: '14:00',
    endTime: '15:30',
    room: 'Phòng họp 1.02',
    isOnline: false,
    chair: 'Thầy Phạm Minh Tuấn',
    attendees: ['Tổ Ngữ văn'],
    agenda: ['Xây dựng chủ đề viết sáng tạo', 'Phân công hướng dẫn học sinh', 'Tiêu chí chấm điểm'],
    status: 'Đã kết thúc',
    hasMinutes: true,
  },
  {
    id: 'MTG006',
    title: 'Họp BGH – Xét Khen Thưởng Cuối Năm',
    type: 'BGH',
    date: '2026-05-20',
    startTime: '08:30',
    endTime: '10:30',
    room: 'Phòng họp BGH - Tầng 3',
    isOnline: false,
    chair: 'Thầy Nguyễn Văn An',
    attendees: ['Ban Giám hiệu', 'Phòng Hành Chính', 'Phòng Tài Chính'],
    agenda: ['Xét danh hiệu thi đua', 'Phân bổ kinh phí khen thưởng', 'Lên danh sách đề nghị'],
    status: 'Đã kết thúc',
    hasMinutes: false,
  },
];

const initialMinutes: Minutes[] = [
  {
    id: 'MIN001',
    meetingId: 'MTG003',
    content:
      'Cuộc họp Hội đồng Sư Phạm toàn trường diễn ra vào ngày 05/06/2026 tại Hội trường lớn. Thầy Hiệu trưởng Nguyễn Văn An chủ trì. Tham dự đầy đủ 87/92 cán bộ giáo viên nhân viên.\n\nThầy Hiệu trưởng báo cáo tổng kết kết quả học kỳ I: tỷ lệ học sinh hoàn thành đạt 97,2%, tỷ lệ giỏi tăng 3,1% so với cùng kỳ. Biểu dương 12 tập thể và 38 cá nhân xuất sắc.\n\nPhòng Đào tạo triển khai kế hoạch học kỳ II với các điểm nhấn: tăng cường ôn luyện thi THPT, kiểm tra chéo giữa các tổ chuyên môn, áp dụng đánh giá năng lực theo GDPT 2018.',
    conclusions: [
      'Hoàn thành lịch thi học kỳ II trước ngày 15/06/2026',
      'Các tổ chuyên môn nộp đề cương ôn tập trước 20/06/2026',
      'Phòng Hành Chính chuẩn bị cơ sở vật chất phòng thi trước 01/07/2026',
      'Triển khai phần mềm đánh giá năng lực từ tuần 3 tháng 7',
    ],
    signedBy: ['Thầy Nguyễn Văn An', 'Cô Lê Thị Hương', 'Thầy Phạm Minh Tuấn'],
    createdAt: '2026-06-05',
  },
  {
    id: 'MIN002',
    meetingId: 'MTG004',
    content:
      'Cuộc họp Phòng Đào tạo diễn ra trực tuyến qua MS Teams vào ngày 03/06/2026. Cô Lê Thị Hương – Trưởng Phòng Đào tạo chủ trì. Tham dự đầy đủ 18 thành viên.\n\nNội dung chính: Rà soát và cập nhật tiến độ thực hiện Chương trình GDPT 2018 theo từng khối lớp. Các tổ trưởng báo cáo tiến độ: Toán 95%, Văn 92%, Anh 88%. Cần đẩy nhanh tiến độ tổ Anh trong tháng 6.\n\nKế hoạch bồi dưỡng giáo viên: đề xuất tổ chức 2 đợt tập huấn vào tháng 7 và tháng 8 năm 2026.',
    conclusions: [
      'Tổ Anh tăng tốc hoàn thành 100% chương trình trước 30/06/2026',
      'Lên kế hoạch tập huấn giáo viên tháng 7: mỗi tổ cử ít nhất 2 đại diện',
      'Chuẩn bị báo cáo tiến độ GDPT 2018 gửi Sở GD&ĐT trước 10/07/2026',
    ],
    signedBy: ['Cô Lê Thị Hương', 'Thầy Trần Văn Đức'],
    createdAt: '2026-06-03',
  },
  {
    id: 'MIN003',
    meetingId: 'MTG005',
    content:
      'Cuộc họp Tổ Ngữ văn diễn ra ngày 28/05/2026 tại Phòng họp 1.02. Thầy Phạm Minh Tuấn chủ trì. Tất cả 9 thành viên tổ Văn tham dự.\n\nThảo luận về kế hoạch tổ chức Ngày hội Viết Văn Sáng Tạo cho học sinh khối 10, 11, 12 dự kiến vào tháng 9/2026. Thống nhất chủ đề năm nay: "Quê hương trong trái tim tôi".\n\nPhân công: mỗi giáo viên phụ trách hướng dẫn 2-3 nhóm học sinh. Thang điểm chấm gồm 5 tiêu chí: Ý tưởng, Cảm xúc, Ngôn ngữ, Cấu trúc, Trình bày.',
    conclusions: [
      'Công bố kế hoạch Ngày hội Viết Văn cho học sinh trước 05/06/2026',
      'Hoàn thiện tiêu chí chấm điểm và gửi cho ban giám khảo trước 15/06/2026',
      'Liên hệ phụ huynh học sinh tham gia trong tháng 7',
    ],
    signedBy: ['Thầy Phạm Minh Tuấn', 'Cô Nguyễn Thu Hà'],
    createdAt: '2026-05-28',
  },
];

const initialActions: ActionItem[] = [
  {
    id: 'ACT001',
    meetingId: 'MTG003',
    meetingTitle: 'Họp Hội đồng Sư Phạm Toàn Trường',
    task: 'Hoàn thành lịch thi học kỳ II và gửi toàn trường',
    assignee: 'Cô Lê Thị Hương',
    deadline: '2026-06-15',
    status: 'Đang làm',
    note: 'Đang phối hợp với các tổ trưởng',
  },
  {
    id: 'ACT002',
    meetingId: 'MTG003',
    meetingTitle: 'Họp Hội đồng Sư Phạm Toàn Trường',
    task: 'Các tổ chuyên môn nộp đề cương ôn tập',
    assignee: 'Thầy Phạm Minh Tuấn',
    deadline: '2026-06-20',
    status: 'Chưa làm',
    note: '',
  },
  {
    id: 'ACT003',
    meetingId: 'MTG003',
    meetingTitle: 'Họp Hội đồng Sư Phạm Toàn Trường',
    task: 'Phòng Hành Chính chuẩn bị cơ sở vật chất phòng thi',
    assignee: 'Thầy Trần Văn Đức',
    deadline: '2026-07-01',
    status: 'Chưa làm',
    note: '',
  },
  {
    id: 'ACT004',
    meetingId: 'MTG004',
    meetingTitle: 'Họp Phòng Đào tạo – Cập Nhật Chương Trình',
    task: 'Tổ Anh hoàn thành 100% chương trình GDPT 2018',
    assignee: 'Cô Nguyễn Thu Hà',
    deadline: '2026-06-30',
    status: 'Đang làm',
    note: 'Còn khoảng 12% nội dung cần bổ sung',
  },
  {
    id: 'ACT005',
    meetingId: 'MTG004',
    meetingTitle: 'Họp Phòng Đào tạo – Cập Nhật Chương Trình',
    task: 'Chuẩn bị báo cáo tiến độ GDPT 2018 gửi Sở GD&ĐT',
    assignee: 'Cô Lê Thị Hương',
    deadline: '2026-07-10',
    status: 'Chưa làm',
    note: '',
  },
  {
    id: 'ACT006',
    meetingId: 'MTG005',
    meetingTitle: 'Họp Tổ Ngữ văn – Kế Hoạch Viết Văn Sáng Tạo',
    task: 'Công bố kế hoạch Ngày hội Viết Văn cho học sinh',
    assignee: 'Thầy Phạm Minh Tuấn',
    deadline: '2026-06-05',
    status: 'Hoàn thành',
    note: 'Đã gửi thông báo qua hệ thống và bảng tin',
  },
  {
    id: 'ACT007',
    meetingId: 'MTG005',
    meetingTitle: 'Họp Tổ Ngữ văn – Kế Hoạch Viết Văn Sáng Tạo',
    task: 'Hoàn thiện tiêu chí chấm điểm gửi ban giám khảo',
    assignee: 'Cô Nguyễn Thu Hà',
    deadline: '2026-06-15',
    status: 'Hoàn thành',
    note: 'Đã gửi cho 5 thành viên ban giám khảo',
  },
  {
    id: 'ACT008',
    meetingId: 'MTG006',
    meetingTitle: 'Họp BGH – Xét Khen Thưởng Cuối Năm',
    task: 'Tổng hợp danh sách đề nghị khen thưởng toàn trường',
    assignee: 'Thầy Trần Văn Đức',
    deadline: '2026-06-10',
    status: 'Đang làm',
    note: 'Đang chờ báo cáo từ các tổ',
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const typeColors: Record<MeetingType, string> = {
  BGH: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Phòng ban': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Chuyên môn': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Toàn trường': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const statusColors: Record<MeetingStatus, string> = {
  'Sắp diễn ra': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Đang họp': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Đã kết thúc': 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
  Hủy: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const actionStatusConfig: Record<ActionStatus, { color: string; icon: React.ReactNode }> = {
  'Chưa làm': {
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
    icon: <Circle className="w-3.5 h-3.5" />,
  },
  'Đang làm': {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  'Hoàn thành': {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date('2026-06-10');
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function MeetingCard({
  meeting,
  onViewMinutes,
}: {
  key?: any;
  meeting: Meeting;
  onViewMinutes: (id: string) => void;
}) {
  const upcoming = isUpcoming(meeting.date);
  return (
    <div
      className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
        upcoming
          ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200 dark:from-indigo-950/40 dark:to-violet-950/40 dark:border-indigo-800'
          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[meeting.type]}`}>
              {meeting.type}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[meeting.status]}`}>
              {meeting.status}
            </span>
            {meeting.isOnline && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                <Video className="w-3 h-3" /> Online
              </span>
            )}
            {meeting.hasMinutes && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <FileText className="w-3 h-3" /> Có biên bản
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base leading-snug mb-3">
            {meeting.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{formatDate(meeting.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                {meeting.startTime} – {meeting.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{meeting.room}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{meeting.chair}</span>
            </div>
            <div className="flex items-center gap-2 col-span-full">
              <Users className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{meeting.attendees.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agenda preview */}
      <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/50">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Nội dung họp
        </p>
        <ul className="space-y-1">
          {meeting.agenda.slice(0, 3).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
          {meeting.agenda.length > 3 && (
            <li className="text-xs text-slate-400 pl-6">+{meeting.agenda.length - 3} mục khác…</li>
          )}
        </ul>
      </div>

      {meeting.hasMinutes && (
        <button
          onClick={() => onViewMinutes(meeting.id)}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Xem biên bản họp
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function MeetingCenter() {
  const [activeTab, setActiveTab] = useState<'meetings' | 'create' | 'minutes' | 'actions'>('meetings');
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [minutes] = useState<Minutes[]>(initialMinutes);
  const [actions, setActions] = useState<ActionItem[]>(initialActions);

  // ── Meetings tab state ──
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<string>('Tất cả');
  const [meetingSearch, setMeetingSearch] = useState('');

  // ── Create form state ──
  const [form, setForm] = useState({
    title: '',
    type: 'BGH' as MeetingType,
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    chair: '',
    attendees: [] as string[],
    agenda: ['', '', ''],
    isOnline: false,
  });
  const [createSuccess, setCreateSuccess] = useState(false);

  // ── Minutes tab state ──
  const [selectedMinutesId, setSelectedMinutesId] = useState<string | null>(null);
  const [showCreateMinutesFor, setShowCreateMinutesFor] = useState<string | null>(null);
  const [minutesForm, setMinutesForm] = useState({ content: '', conclusions: '', signedBy: '' });
  const [minutesSaved, setMinutesSaved] = useState(false);

  // ── Actions tab state ──
  const [actionStatusFilter, setActionStatusFilter] = useState<string>('Tất cả');
  const [actionPersonFilter, setActionPersonFilter] = useState<string>('Tất cả');

  // ── Computed ──
  const upcomingMeetings = useMemo(
    () => meetings.filter((m) => isUpcoming(m.date)),
    [meetings]
  );
  const pastMeetings = useMemo(
    () => meetings.filter((m) => !isUpcoming(m.date)),
    [meetings]
  );

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const matchType = meetingTypeFilter === 'Tất cả' || m.type === meetingTypeFilter;
      const matchSearch =
        !meetingSearch ||
        m.title.toLowerCase().includes(meetingSearch.toLowerCase()) ||
        m.chair.toLowerCase().includes(meetingSearch.toLowerCase());
      return matchType && matchSearch;
    });
  }, [meetings, meetingTypeFilter, meetingSearch]);

  const filteredUpcoming = filteredMeetings.filter((m) => isUpcoming(m.date));
  const filteredPast = filteredMeetings.filter((m) => !isUpcoming(m.date));

  const uniqueAssignees = useMemo(() => {
    const s = new Set(actions.map((a) => a.assignee));
    return ['Tất cả', ...Array.from(s)];
  }, [actions]);

  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      const matchStatus = actionStatusFilter === 'Tất cả' || a.status === actionStatusFilter;
      const matchPerson = actionPersonFilter === 'Tất cả' || a.assignee === actionPersonFilter;
      return matchStatus && matchPerson;
    });
  }, [actions, actionStatusFilter, actionPersonFilter]);

  const statsThisMonth = meetings.filter((m) => m.date.startsWith('2026-06')).length;
  const statsUpcoming = upcomingMeetings.length;
  const statsNoMinutes = pastMeetings.filter((m) => !m.hasMinutes).length;
  const statsPendingActions = actions.filter((a) => a.status !== 'Hoàn thành').length;

  // ── Handlers ──

  function handleViewMinutes(meetingId: string) {
    const min = minutes.find((m) => m.meetingId === meetingId);
    if (min) {
      setSelectedMinutesId(min.id);
      setActiveTab('minutes');
    }
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newMeeting: Meeting = {
      id: `MTG${String(meetings.length + 1).padStart(3, '0')}`,
      title: form.title,
      type: form.type,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room,
      isOnline: form.isOnline,
      chair: form.chair,
      attendees: form.attendees,
      agenda: form.agenda.filter(Boolean),
      status: 'Sắp diễn ra',
      hasMinutes: false,
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    setCreateSuccess(true);
    setForm({
      title: '',
      type: 'BGH',
      date: '',
      startTime: '',
      endTime: '',
      room: '',
      chair: '',
      attendees: [],
      agenda: ['', '', ''],
      isOnline: false,
    });
    setTimeout(() => setCreateSuccess(false), 3000);
  }

  function toggleAttendee(dept: string) {
    setForm((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(dept)
        ? prev.attendees.filter((d) => d !== dept)
        : [...prev.attendees, dept],
    }));
  }

  function updateAgendaItem(index: number, value: string) {
    setForm((prev) => {
      const agenda = [...prev.agenda];
      agenda[index] = value;
      return { ...prev, agenda };
    });
  }

  function addAgendaItem() {
    setForm((prev) => ({ ...prev, agenda: [...prev.agenda, ''] }));
  }

  function removeAgendaItem(index: number) {
    setForm((prev) => ({ ...prev, agenda: prev.agenda.filter((_, i) => i !== index) }));
  }

  function handleSaveMinutes(e: React.FormEvent) {
    e.preventDefault();
    setMinutesSaved(true);
    setShowCreateMinutesFor(null);
    setTimeout(() => setMinutesSaved(false), 3000);
  }

  function handleUpdateActionStatus(id: string, status: ActionStatus) {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'meetings' as const, label: 'Cuộc Họp', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'create' as const, label: 'Tạo Mới', icon: <Plus className="w-4 h-4" /> },
    { id: 'minutes' as const, label: 'Biên Bản', icon: <FileText className="w-4 h-4" /> },
    { id: 'actions' as const, label: 'Action Items', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 font-sans">
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-violet-900 to-purple-900 p-6 md:p-8 mb-6 shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white/90 border border-white/30 tracking-widest">
              MODULE 09
            </span>
            <span className="text-white/60 text-sm">MIS SMART PORTAL 2.0</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">
            Trung tâm Quản lý Cuộc Họp
          </h1>
          <p className="text-indigo-200 text-sm md:text-base">
            Lên lịch, biên bản và theo dõi action items từ tất cả các cuộc họp nhà trường
          </p>
          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Tháng này', value: statsThisMonth, icon: <CalendarDays className="w-4 h-4" />, color: 'from-indigo-500/30 to-indigo-600/20' },
              { label: 'Sắp diễn ra', value: statsUpcoming, icon: <Bell className="w-4 h-4" />, color: 'from-violet-500/30 to-violet-600/20' },
              { label: 'Chờ biên bản', value: statsNoMinutes, icon: <ClipboardList className="w-4 h-4" />, color: 'from-amber-500/30 to-amber-600/20' },
              { label: 'Action Items', value: statsPendingActions, icon: <CheckSquare className="w-4 h-4" />, color: 'from-emerald-500/30 to-emerald-600/20' },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/10 p-3 flex items-center gap-3`}
              >
                <div className="text-white/80">{s.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-white leading-none">{s.value}</div>
                  <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 p-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl mb-6 shadow-xs overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: MEETINGS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc họp, người chủ trì…"
                value={meetingSearch}
                onChange={(e) => setMeetingSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {(['Tất cả', 'BGH', 'Phòng ban', 'Chuyên môn', 'Toàn trường'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMeetingTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    meetingTypeFilter === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          {filteredUpcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Sắp diễn ra</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  {filteredUpcoming.length}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredUpcoming.map((m) => (
                  <MeetingCard key={m.id} meeting={m} onViewMinutes={handleViewMinutes} />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {filteredPast.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Đã qua</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold">
                  {filteredPast.length}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPast.map((m) => (
                  <MeetingCard key={m.id} meeting={m} onViewMinutes={handleViewMinutes} />
                ))}
              </div>
            </section>
          )}

          {filteredMeetings.length === 0 && (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy cuộc họp nào</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: CREATE */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'create' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Tạo Cuộc Họp Mới
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Điền đầy đủ thông tin để lên lịch cuộc họp
              </p>
            </div>

            {createSuccess && (
              <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Cuộc họp đã được tạo thành công!
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tiêu đề cuộc họp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="VD: Họp Ban Giám hiệu Tháng 7/2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Type + Online */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Loại cuộc họp
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as MeetingType }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BGH">BGH</option>
                    <option value="Phòng ban">Phòng ban</option>
                    <option value="Chuyên môn">Chuyên môn</option>
                    <option value="Toàn trường">Toàn trường</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      onClick={() => setForm((p) => ({ ...p, isOnline: !p.isOnline }))}
                      className={`w-10 h-5 rounded-full transition-colors ${form.isOnline ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} flex items-center`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.isOnline ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Video className="w-4 h-4 text-teal-500" /> Họp online
                    </span>
                  </label>
                </div>
              </div>

              {/* Date + Times */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ngày họp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Room + Chair */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                    Phòng họp
                  </label>
                  <input
                    type="text"
                    value={form.room}
                    onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
                    placeholder="VD: Phòng họp BGH - Tầng 3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <User className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                    Người chủ trì
                  </label>
                  <input
                    type="text"
                    value={form.chair}
                    onChange={(e) => setForm((p) => ({ ...p, chair: e.target.value }))}
                    placeholder="Tên người chủ trì"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                  Thành phần tham dự
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <label
                      key={dept}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm ${
                        form.attendees.includes(dept)
                          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 dark:border-indigo-600'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.attendees.includes(dept)}
                        onChange={() => toggleAttendee(dept)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          form.attendees.includes(dept)
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {form.attendees.includes(dept) && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="truncate">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Agenda */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <ClipboardList className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                  Nội dung chương trình họp
                </label>
                <div className="space-y-2">
                  {form.agenda.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateAgendaItem(i, e.target.value)}
                        placeholder={`Mục ${i + 1}…`}
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {form.agenda.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAgendaItem}
                    className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 transition-colors mt-1"
                  >
                    <Plus className="w-4 h-4" /> Thêm mục
                  </button>
                </div>
              </div>

              {/* Attachments UI */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Paperclip className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                  Tài liệu đính kèm
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-400 dark:text-slate-500 text-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer">
                  <Paperclip className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p>Kéo thả hoặc click để tải tài liệu</p>
                  <p className="text-xs mt-1">.pdf, .docx, .xlsx — tối đa 20MB</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Tạo Cuộc Họp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('meetings')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 3: MINUTES */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'minutes' && (
        <div className="space-y-4">
          {minutesSaved && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Biên bản đã được lưu thành công!
            </div>
          )}

          {/* Meetings with minutes */}
          <section>
            <h2 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100 mb-3">
              <FileText className="w-4 h-4 text-violet-500" /> Biên Bản Đã Hoàn Thành
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                {minutes.length}
              </span>
            </h2>
            <div className="space-y-3">
              {minutes.map((min) => {
                const mtg = meetings.find((m) => m.id === min.meetingId);
                const isSelected = selectedMinutesId === min.id;
                return (
                  <div
                    key={min.id}
                    className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs"
                  >
                    <button
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      onClick={() => setSelectedMinutesId(isSelected ? null : min.id)}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mtg ? typeColors[mtg.type] : ''}`}>
                            {mtg?.type}
                          </span>
                          <span className="font-mono text-xs text-slate-400">{min.id}</span>
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{mtg?.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          Ngày họp: {mtg ? formatDate(mtg.date) : ''} · Lập biên bản: {formatDate(min.createdAt)}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                      />
                    </button>

                    {isSelected && (
                      <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700/50 pt-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Nội dung biên bản
                          </p>
                          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {min.content}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Kết luận &amp; nhiệm vụ
                          </p>
                          <ul className="space-y-2">
                            {min.conclusions.map((c, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Chữ ký xác nhận
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {min.signedBy.map((name) => (
                              <span
                                key={name}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-sm font-medium"
                              >
                                <User className="w-3.5 h-3.5" />
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Meetings without minutes */}
          <section>
            <h2 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-6">
              <Edit3 className="w-4 h-4 text-amber-500" /> Cuộc Họp Chưa Có Biên Bản
            </h2>
            <div className="space-y-3">
              {pastMeetings
                .filter((m) => !m.hasMinutes)
                .map((mtg) => (
                  <div
                    key={mtg.id}
                    className="bg-white dark:bg-slate-800/80 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[mtg.type]}`}>
                          {mtg.type}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(mtg.date)}</span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{mtg.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Chủ trì: {mtg.chair}</p>
                    </div>
                    <button
                      onClick={() =>
                        setShowCreateMinutesFor(
                          showCreateMinutesFor === mtg.id ? null : mtg.id
                        )
                      }
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Lập biên bản
                    </button>
                  </div>
                ))}

              {showCreateMinutesFor && (
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-5 shadow-xs">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Lập Biên Bản Họp
                  </h3>
                  <form onSubmit={handleSaveMinutes} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nội dung biên bản
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={minutesForm.content}
                        onChange={(e) => setMinutesForm((p) => ({ ...p, content: e.target.value }))}
                        placeholder="Ghi chép nội dung diễn biến cuộc họp…"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Kết luận &amp; nhiệm vụ (mỗi dòng một kết luận)
                      </label>
                      <textarea
                        rows={3}
                        value={minutesForm.conclusions}
                        onChange={(e) => setMinutesForm((p) => ({ ...p, conclusions: e.target.value }))}
                        placeholder="Kết luận 1&#10;Kết luận 2…"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Người ký xác nhận (cách nhau bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={minutesForm.signedBy}
                        onChange={(e) => setMinutesForm((p) => ({ ...p, signedBy: e.target.value }))}
                        placeholder="Thầy A, Cô B…"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all"
                      >
                        <Save className="w-4 h-4" /> Lưu Biên Bản
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateMinutesFor(null)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 4: ACTIONS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Trạng thái:</span>
              {(['Tất cả', 'Chưa làm', 'Đang làm', 'Hoàn thành'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setActionStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    actionStatusFilter === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <User className="w-4 h-4 text-slate-400" />
              <select
                value={actionPersonFilter}
                onChange={(e) => setActionPersonFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {uniqueAssignees.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex gap-3 flex-wrap">
            {(
              [
                { label: 'Chưa làm', status: 'Chưa làm' as ActionStatus, color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
                { label: 'Đang làm', status: 'Đang làm' as ActionStatus, color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
                { label: 'Hoàn thành', status: 'Hoàn thành' as ActionStatus, color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
              ] as const
            ).map((s) => (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${s.color}`}>
                {actionStatusConfig[s.status].icon}
                {actions.filter((a) => a.status === s.status).length} {s.label}
              </div>
            ))}
          </div>

          {/* Action items list */}
          <div className="space-y-3">
            {filteredActions.map((action) => {
              const isOverdue =
                action.status !== 'Hoàn thành' && new Date(action.deadline) < new Date('2026-06-10');
              return (
                <div
                  key={action.id}
                  className={`bg-white dark:bg-slate-800/80 rounded-2xl border p-4 shadow-xs transition-all ${
                    isOverdue
                      ? 'border-rose-200 dark:border-rose-800/50'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${actionStatusConfig[action.status].color}`}
                        >
                          {actionStatusConfig[action.status].icon}
                          {action.status}
                        </span>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                            <AlertCircle className="w-3 h-3" /> Quá hạn
                          </span>
                        )}
                        <span className="font-mono text-xs text-slate-400">{action.id}</span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{action.task}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          {action.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                          Hạn: {formatDate(action.deadline)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          {action.meetingTitle}
                        </span>
                      </div>
                      {action.note && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/30 rounded-lg px-3 py-1.5">
                          💬 {action.note}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {(['Chưa làm', 'Đang làm', 'Hoàn thành'] as ActionStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateActionStatus(action.id, s)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            action.status === s
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                      <button className="mt-1 flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-all">
                        <ExternalLink className="w-3 h-3" />
                        Tạo Task
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActions.length === 0 && (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không có action items nào phù hợp</p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400 dark:text-slate-500">
            <Building2 className="w-3.5 h-3.5" />
            <span>Nút "Tạo công việc" sẽ liên kết tới phân hệ Quản lý công việc</span>
          </div>
        </div>
      )}
    </div>
  );
}
