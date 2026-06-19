'use client';

import { useState, useMemo } from 'react';
import {
  CalendarDays,
  DoorOpen,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  MapPin,
  UserCircle,
  Users,
  Plus,
  SettingsIcon,
  Circle,
  Search,
  Check,
  Trash2,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Send,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Dialog } from '@/src/components/ui/dialog';

const roomUsageData = [
  { name: 'Đang dùng', value: 28, color: '#2563eb' },
  { name: 'Trống', value: 12, color: '#10b981' },
  { name: 'Bảo trì', value: 2, color: '#f59e0b' },
];

const periodTimes: Record<number, string> = {
  1: '07:00 - 07:45',
  2: '07:50 - 08:35',
  3: '08:45 - 09:30',
  4: '09:40 - 10:25',
  6: '13:00 - 13:45',
  7: '13:50 - 14:35',
  8: '14:45 - 15:30',
  9: '15:40 - 16:25',
};

const getSubjectColor = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes('toán') || s.includes('tích') || s.includes('đại số')) {
    return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
  }
  if (s.includes('văn') || s.includes('ngữ')) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
  }
  if (s.includes('anh') || s.includes('ngoại ngữ')) {
    return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
  }
  if (s.includes('lý') || s.includes('vật lý') || s.includes('hóa') || s.includes('sinh') || s.includes('tự nhiên')) {
    return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800';
  }
  if (s.includes('tin') || s.includes('máy tính') || s.includes('lập trình')) {
    return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
  }
  if (s.includes('gdcd')) {
    return 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800';
  }
  return 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
};

export default function ScheduleDashboard({ initialData }: { initialData?: any }) {
  const timetable = initialData?.timetable || [];
  const stats = initialData?.stats || {
    todaySlotsCount: 142,
    totalPlannedSlots: 156,
    roomsInUse: 28,
    totalRooms: 42,
    conflictsCount: 3,
    pendingPlansCount: 18
  };
  const teachers = initialData?.teachers || [];
  const classes = initialData?.classes || [];
  const rooms = initialData?.rooms || [];

  // Local States to allow interactive edits
  const [timetableData, setTimetableData] = useState<any[]>(timetable);
  const [statsData, setStatsData] = useState(stats);

  const [lessonPlans, setLessonPlans] = useState([
    { id: 'lp1', title: 'Bài 6: Truyện ngắn hiện đại (Lão Hạc - Nam Cao)', date: '14/05/2026', subject: 'Ngữ văn', targetClass: '11A2', tag: 'Nháp', tagCol: 'bg-slate-100 text-slate-600 border-slate-200' },
    { id: 'lp2', title: 'Bài 7: Thơ mới 1930-1945 (Vội vàng - Xuân Diệu)', date: '15/05/2026', subject: 'Ngữ văn', targetClass: '12A1', tag: 'Chờ duyệt', tagCol: 'bg-orange-50 text-orange-600 border-orange-200' },
    { id: 'lp3', title: 'Bài 8: Văn nghị luận xã hội nâng cao', date: '10/05/2026', subject: 'Ngữ văn', targetClass: '10A1', tag: 'Đã duyệt', tagCol: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { id: 'lp4', title: 'Bài 9: Khảo sát hàm số nâng cao', date: '16/05/2026', subject: 'Toán học', targetClass: '12A1', tag: 'Chờ duyệt', tagCol: 'bg-orange-50 text-orange-600 border-orange-200' },
    { id: 'lp5', title: 'Bài 10: Tích phân và ứng dụng thực tiễn', date: '17/05/2026', subject: 'Toán học', targetClass: '12A2', tag: 'Chờ duyệt', tagCol: 'bg-orange-50 text-orange-600 border-orange-200' },
  ]);

  const [conflicts, setConflicts] = useState([
    { id: 'conf_1', day: 3, period: 4, room: 'P.301', title: 'Phòng 301 trùng lịch', desc: 'Vật lý 11A2 & Hóa học 11A2', detail: 'Hai lớp khác nhau cùng đăng ký sử dụng phòng 301 vào tiết 4 thứ 3.', resolved: false },
    { id: 'conf_2', day: 5, period: 6, teacher: 'Cô Lê Thị Thanh Nhàn', title: 'Giáo viên Lê T. Nhàn trùng lịch', desc: 'Toán học 10A1 & CLB Khoa học nâng cao', detail: 'Giáo viên được xếp dạy đồng thời hai lớp tại Phòng 302 và Phòng Kỹ thuật.', resolved: false },
    { id: 'conf_3', day: 6, period: 7, room: 'P.202', title: 'Phòng 202 trùng lịch', desc: 'Ngoại ngữ 2 10A2 & CLB Tiếng Anh', detail: 'Hai nhóm học ngoại ngữ tự chọn đăng ký cùng phòng 202.', resolved: false },
  ]);

  // Dialog States
  const [isTodaySlotsOpen, setIsTodaySlotsOpen] = useState(false);
  const [isRoomsInUseOpen, setIsRoomsInUseOpen] = useState(false);
  const [isConflictsOpen, setIsConflictsOpen] = useState(false);
  const [isPendingPlansOpen, setIsPendingPlansOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isOnlineClassOpen, setIsOnlineClassOpen] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isAllPlansOpen, setIsAllPlansOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Form input states for adding lesson plan
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanSubject, setNewPlanSubject] = useState('Toán học');
  const [newPlanClass, setNewPlanClass] = useState('10A1');
  const [newPlanStatus, setNewPlanStatus] = useState('Chờ duyệt');

  // Search/filter for all lesson plans
  const [searchPlanQuery, setSearchPlanQuery] = useState('');
  const [allPlansTab, setAllPlansTab] = useState<'all' | 'draft' | 'pending' | 'approved'>('all');

  // Room view tab
  const [roomTab, setRoomTab] = useState<'all' | 'in_use' | 'vacant' | 'maintenance'>('all');

  // Attendance state
  const [attendanceList, setAttendanceList] = useState([
    { id: 'st_1', name: 'Nguyễn Minh Anh', status: 'present', note: '' },
    { id: 'st_2', name: 'Trần Hoàng Bảo', status: 'present', note: '' },
    { id: 'st_3', name: 'Lê Khánh Chi', status: 'excused', note: 'Khám răng' },
    { id: 'st_4', name: 'Phạm Hải Đăng', status: 'present', note: '' },
    { id: 'st_5', name: 'Vũ Thùy Dương', status: 'present', note: '' },
    { id: 'st_6', name: 'Đỗ Tiến Đạt', status: 'present', note: '' },
    { id: 'st_7', name: 'Hoàng Minh Hà', status: 'unexcused', note: 'Không phép' },
    { id: 'st_8', name: 'Nguyễn Thu Hương', status: 'present', note: '' },
    { id: 'st_9', name: 'Phan Quốc Khánh', status: 'present', note: '' },
    { id: 'st_10', name: 'Lâm Khánh Linh', status: 'present', note: '' },
  ]);

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Filter States
  const [selectedTeacher, setSelectedTeacher] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState('ALL');

  // Selected cell state for right sidebar
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Filtered timetable slots
  const filteredTimetable = useMemo(() => {
    return timetableData.filter((s: any) => {
      const matchesTeacher = selectedTeacher === 'ALL' || s.teacherId === selectedTeacher;
      const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
      const matchesRoom = selectedRoom === 'ALL' || s.room === selectedRoom;
      return matchesTeacher && matchesClass && matchesRoom;
    });
  }, [timetableData, selectedTeacher, selectedClass, selectedRoom]);

  // Selected Slot details
  const selectedSlot = useMemo(() => {
    if (selectedSlotId) {
      return timetableData.find((s: any) => s.id === selectedSlotId) || null;
    }
    // Fallback to first filtered slot or null
    return filteredTimetable[0] || null;
  }, [timetableData, filteredTimetable, selectedSlotId]);

  // Helper to find slot in cell
  const getSlot = (day: number, period: number) => {
    return filteredTimetable.find((s: any) => s.day === day && s.period === period);
  };

  // Conflict Resolver
  const handleResolveConflict = (id: string) => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c));
    
    // Decrement conflicts count in statsData
    setStatsData(prev => ({
      ...prev,
      conflictsCount: Math.max(0, prev.conflictsCount - 1)
    }));

    // Perform specific edits to timetableData based on conflict type
    if (id === 'conf_1') {
      // Reassign room for one of the classes
      setTimetableData(prev => prev.map(slot => {
        if (slot.subject === 'Hóa học' && slot.className === '11A2') {
          return { ...slot, room: 'P.303' };
        }
        return slot;
      }));
      triggerToast("Đã xếp lại Lớp Hóa học 11A2 sang Phòng 303 để giải quyết trùng lịch P.301!", "success");
    } else if (id === 'conf_2') {
      // Reassign teacher for CLB Khoa học
      setTimetableData(prev => prev.map(slot => {
        if (slot.subject === 'CLB Khoa học') {
          return { ...slot, teacherId: 'user_nam', teacherName: 'Thầy Trần Hoàng Nam' };
        }
        return slot;
      }));
      triggerToast("Đã phân công Thầy Trần Hoàng Nam dạy CLB Khoa học để tránh trùng lịch giáo viên Lê T. Minh!", "success");
    } else if (id === 'conf_3') {
      // Reassign room for CLB Tiếng Anh
      setTimetableData(prev => prev.map(slot => {
        if (slot.subject === 'CLB Tiếng Anh') {
          return { ...slot, room: 'P.203' };
        }
        return slot;
      }));
      triggerToast("Đã đổi CLB Tiếng Anh sang Phòng 203 tránh trùng phòng 202!", "success");
    }
  };

  // Lesson Plan Approver
  const handleApprovePlan = (id: string) => {
    setLessonPlans(prev => prev.map(p => p.id === id ? { ...p, tag: 'Đã duyệt', tagCol: 'bg-emerald-50 text-emerald-600 border-emerald-200' } : p));
    setStatsData(prev => ({ ...prev, pendingPlansCount: Math.max(0, prev.pendingPlansCount - 1) }));
    triggerToast("Phê duyệt giáo án thành công!", "success");
  };

  const handleRejectPlan = (id: string) => {
    setLessonPlans(prev => prev.map(p => p.id === id ? { ...p, tag: 'Từ chối', tagCol: 'bg-rose-50 text-rose-600 border-rose-200' } : p));
    setStatsData(prev => ({ ...prev, pendingPlansCount: Math.max(0, prev.pendingPlansCount - 1) }));
    triggerToast("Đã từ chối giáo án đề xuất.", "error");
  };

  // Attendance Saver
  const handleSaveAttendance = () => {
    if (!selectedSlot) return;
    triggerToast(`Đã lưu dữ liệu điểm danh lớp ${selectedSlot.className} môn ${selectedSlot.subject}!`, "success");
    setIsAttendanceOpen(false);
  };

  // Add Lesson Plan Submitter
  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) {
      triggerToast("Vui lòng nhập tiêu đề giáo án!", "error");
      return;
    }
    const newPlan = {
      id: 'lp_' + Date.now(),
      title: newPlanTitle,
      date: new Date().toLocaleDateString('vi-VN'),
      subject: newPlanSubject,
      targetClass: newPlanClass,
      tag: newPlanStatus,
      tagCol: newPlanStatus === 'Đã duyệt' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
             newPlanStatus === 'Chờ duyệt' ? 'bg-orange-50 text-orange-600 border-orange-200' :
             'bg-slate-100 text-slate-600 border-slate-200'
    };
    setLessonPlans(prev => [newPlan, ...prev]);
    if (newPlanStatus === 'Chờ duyệt') {
      setStatsData(prev => ({ ...prev, pendingPlansCount: prev.pendingPlansCount + 1 }));
    }
    triggerToast(`Đã thêm mới giáo án: ${newPlanTitle}`, "success");
    setIsAddPlanOpen(false);
    // Reset fields
    setNewPlanTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Thời khóa biểu & Giáo án
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý thời khóa biểu, lịch dạy và giáo án toàn trường
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <select className="border-0 bg-transparent text-sm font-bold focus:ring-0 w-56">
              <option>Tuần 20 (12/05 - 18/05/2026)</option>
            </select>
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setIsCustomizeOpen(true)}>
            <SettingsIcon className="h-4 w-4" /> Tùy chỉnh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-100 shadow-sm dark:border-blue-900/30">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Tiết học hôm nay</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-black text-blue-600">{statsData.todaySlotsCount}</h3>
                  <span className="text-sm font-medium text-slate-500">/ {statsData.totalPlannedSlots}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-2 border-t border-blue-50 dark:border-blue-900/30 pt-2">
              <span className="text-slate-500">{Math.round((statsData.todaySlotsCount / statsData.totalPlannedSlots) * 100)}% kế hoạch</span>
              <Button variant="ghost" className="font-bold text-blue-600 p-0 h-auto text-[10px] hover:underline" onClick={() => setIsTodaySlotsOpen(true)}>Xem chi tiết</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm dark:border-emerald-900/30">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <DoorOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Phòng đang sử dụng</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-black text-emerald-600">{statsData.roomsInUse}</h3>
                  <span className="text-sm font-medium text-slate-500">/ {statsData.totalRooms}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-2 border-t border-emerald-50 dark:border-emerald-900/30 pt-2">
              <span className="text-slate-500">{((statsData.roomsInUse / statsData.totalRooms) * 100).toFixed(1)}% sử dụng</span>
              <Button variant="ghost" className="font-bold text-blue-600 p-0 h-auto text-[10px] hover:underline" onClick={() => setIsRoomsInUseOpen(true)}>Xem chi tiết</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm dark:border-orange-900/30">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Xung đột lịch</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-black text-orange-600">{statsData.conflictsCount}</h3>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-2 border-t border-orange-50 dark:border-orange-900/30 pt-2">
              <span className="text-slate-500">Cần xử lý xung đột</span>
              <Button variant="ghost" className="font-bold text-orange-600 p-0 h-auto text-[10px] hover:underline" onClick={() => setIsConflictsOpen(true)}>Xem chi tiết</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm dark:border-purple-900/30">
          <CardContent className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Giáo án chờ duyệt</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-2xl font-black text-purple-600">{statsData.pendingPlansCount}</h3>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-2 border-t border-purple-50 dark:border-purple-900/30 pt-2">
              <span className="text-slate-500">Học kỳ hiện tại</span>
              <Button variant="ghost" className="font-bold text-blue-600 p-0 h-auto text-[10px] hover:underline" onClick={() => setIsPendingPlansOpen(true)}>Xem chi tiết</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Main Schedule */}
        <Card className="xl:col-span-8 overflow-hidden flex flex-col">
          <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <div className="w-36">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Giáo viên</label>
                  <select 
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full h-8 rounded border-slate-200 text-xs px-2 focus:ring-blue-600 dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="ALL">Tất cả giáo viên</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Lớp</label>
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full h-8 rounded border-slate-200 text-xs px-2 focus:ring-blue-600 dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="ALL">Tất cả lớp</option>
                    {classes.map((c: any) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Phòng học</label>
                  <select 
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full h-8 rounded border-slate-200 text-xs px-2 focus:ring-blue-600 dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="ALL">Tất cả phòng</option>
                    {rooms.map((r: any) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="w-48">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Cơ sở</label>
                  <select className="w-full h-8 rounded border-slate-200 text-xs px-2 focus:ring-blue-600 dark:bg-slate-900 dark:border-slate-700">
                    <option>Cơ sở Cầu Giấy</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[800px] text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 w-16 text-center font-bold">Tiết</th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 2<br/><span className="text-[10px] font-normal">12/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 3<br/><span className="text-[10px] font-normal">13/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold bg-blue-50/50 dark:bg-blue-900/10 text-blue-700">Thứ 4<br/><span className="text-[10px] font-normal">14/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 5<br/><span className="text-[10px] font-normal">15/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 6<br/><span className="text-[10px] font-normal">16/05</span></th>
                  <th className="py-3 px-2 border-r border-slate-100 dark:border-slate-800 text-center font-bold">Thứ 7<br/><span className="text-[10px] font-normal">17/05</span></th>
                  <th className="py-3 px-2 text-center font-bold">Chủ nhật<br/><span className="text-[10px] font-normal">18/05</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Morning Periods (1 to 4) */}
                {[1, 2, 3, 4].map((pNum) => (
                  <tr key={pNum}>
                    <td className="py-2 px-1 border-r border-slate-100 dark:border-slate-800 text-center bg-slate-50/20">
                      <p className="font-bold text-slate-900 dark:text-white">Tiết {pNum}</p>
                      <p className="text-[9px] text-slate-500">{periodTimes[pNum]}</p>
                    </td>
                    {/* Days 2 to 8 */}
                    {[2, 3, 4, 5, 6, 7, 8].map((dayNum) => {
                      const cell = getSlot(dayNum, pNum);
                      const isSelected = selectedSlot?.id === cell?.id;
                      return (
                        <td 
                          key={dayNum} 
                          className={cn("py-1 px-1 border-r border-slate-100 dark:border-slate-800 align-top w-[13%]", dayNum === 4 ? "bg-blue-50/10" : "")}
                        >
                          {cell ? (
                            <div 
                              onClick={() => setSelectedSlotId(cell.id)}
                              className={cn(
                                "p-1.5 rounded-md h-full flex flex-col justify-between cursor-pointer hover:opacity-90 transition-all",
                                getSubjectColor(cell.subject),
                                isSelected && "ring-2 ring-blue-600 shadow-md scale-105"
                              )}
                            >
                              <div className="flex justify-between items-start leading-tight">
                                <span className="font-bold truncate max-w-[50px]">{cell.subject}</span>
                                <span className="font-bold">{cell.className}</span>
                              </div>
                              <div className="text-[9px] mt-1 space-y-0.5 opacity-90">
                                <p className="font-semibold">{cell.room}</p>
                                <p className="truncate" title={cell.teacherName}>{cell.teacherName}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="h-12 flex items-center justify-center text-slate-300 dark:text-slate-800 font-light">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {/* Lunch break */}
                <tr>
                  <td className="py-2 px-1 border-r border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="font-bold text-slate-900 dark:text-white">Nghỉ trưa</p>
                    <p className="text-[9px] text-slate-500">11:20 - 13:00</p>
                  </td>
                  <td colSpan={7} className="py-2 px-1 bg-slate-50/30 dark:bg-slate-900/20 text-center text-slate-400">-</td>
                </tr>

                {/* Afternoon Periods (6 to 9) */}
                {[6, 7, 8, 9].map((pNum) => (
                  <tr key={pNum}>
                    <td className="py-2 px-1 border-r border-slate-100 dark:border-slate-800 text-center bg-slate-50/20">
                      <p className="font-bold text-slate-900 dark:text-white">Tiết {pNum}</p>
                      <p className="text-[9px] text-slate-500">{periodTimes[pNum]}</p>
                    </td>
                    {[2, 3, 4, 5, 6, 7, 8].map((dayNum) => {
                      const cell = getSlot(dayNum, pNum);
                      const isSelected = selectedSlot?.id === cell?.id;
                      return (
                        <td 
                          key={dayNum} 
                          className={cn("py-1 px-1 border-r border-slate-100 dark:border-slate-800 align-top w-[13%]", dayNum === 4 ? "bg-blue-50/10" : "")}
                        >
                          {cell ? (
                            <div 
                              onClick={() => setSelectedSlotId(cell.id)}
                              className={cn(
                                "p-1.5 rounded-md h-full flex flex-col justify-between cursor-pointer hover:opacity-90 transition-all",
                                getSubjectColor(cell.subject),
                                isSelected && "ring-2 ring-blue-600 shadow-md scale-105"
                              )}
                            >
                              <div className="flex justify-between items-start leading-tight">
                                <span className="font-bold truncate max-w-[50px]">{cell.subject}</span>
                                <span className="font-bold">{cell.className}</span>
                              </div>
                              <div className="text-[9px] mt-1 space-y-0.5 opacity-90">
                                <p className="font-semibold">{cell.room}</p>
                                <p className="truncate" title={cell.teacherName}>{cell.teacherName}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="h-12 flex items-center justify-center text-slate-300 dark:text-slate-800 font-light">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Legend */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-[10px] font-medium text-slate-600 bg-slate-50 dark:bg-slate-900/50">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Toán</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Ngữ văn</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Ngoại ngữ</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500" /> KHTN</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /> KHXH</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> Tin học</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500" /> GDCD</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500" /> Thể chất</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500" /> Hoạt động</span>
              <span className="ml-auto italic text-slate-400">* Nhấp vào tiết học để xem chi tiết ở khung bên phải</span>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="xl:col-span-4 space-y-6">
          {/* Detail */}
          <Card className="border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/20">
              <CardTitle className="text-base font-bold">Chi tiết tiết học</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[10px]">Lịch giảng dạy</Badge>
            </CardHeader>
            <CardContent className="p-4">
              {selectedSlot ? (
                <>
                  <p className="text-[11px] text-slate-500 mb-1">Tiết {selectedSlot.period} · Thứ {selectedSlot.day} (Tuần 20)</p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{selectedSlot.subject} - Lớp {selectedSlot.className}</h3>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" /> {periodTimes[selectedSlot.period] || "N/A"}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {selectedSlot.room}</div>
                    <div className="flex items-center gap-2"><UserCircle className="h-4 w-4 text-slate-400" /> {selectedSlot.teacherName} ({selectedSlot.teacherRole})</div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> Sĩ số dự kiến: 40 học sinh</div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAttendanceOpen(true)}>Điểm danh</Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1.5"
                      onClick={() => setIsOnlineClassOpen(true)}
                    >
                      <Video className="w-4 h-4" /> Vào lớp online
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  Hãy chọn một tiết học trong lịch biểu để xem chi tiết.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Giáo án */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Giáo án</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs px-2 gap-1 font-bold"
                onClick={() => setIsAddPlanOpen(true)}
              >
                <Plus className="h-3 w-3" /> Thêm giáo án
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lessonPlans.slice(0, 3).map((doc, i) => (
                  <div key={i} className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 mt-1"><FileText className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">Môn: {doc.subject || "Văn học"} · Cập nhật: {doc.date}</p>
                    </div>
                    <Badge className={cn("text-[10px] px-1.5 py-0 border-0 font-medium", doc.tagCol)}>{doc.tag}</Badge>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/30">
                <Button variant="ghost" className="text-xs font-bold text-blue-600 p-0 h-auto hover:underline" onClick={() => setIsAllPlansOpen(true)}>Xem tất cả giáo án</Button>
              </div>
            </CardContent>
          </Card>

          {/* Cảnh báo & Hiệu suất */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="shadow-sm border-orange-50 dark:border-orange-950/30">
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-orange-50/10">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Cảnh báo trùng lịch 
                  <span className="text-red-500">({conflicts.filter(c => !c.resolved).length})</span>
                </CardTitle>
                <Button variant="ghost" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 p-0 h-auto hover:underline" onClick={() => setIsConflictsOpen(true)}>Xem tất cả</Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {conflicts.filter(c => !c.resolved).map((warn, i) => (
                  <div key={i} className="flex gap-2.5 text-xs border-b border-slate-50 dark:border-slate-900/50 pb-2.5 last:border-0 last:pb-0">
                    <div className="mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {warn.day === 3 ? 'Thứ 3' : warn.day === 5 ? 'Thứ 5' : 'Thứ 6'}, 1{warn.day}/05 - Tiết {warn.period}
                      </p>
                      <p className="text-slate-700 dark:text-slate-350 font-medium">{warn.title}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">{warn.desc}</p>
                    </div>
                  </div>
                ))}
                {conflicts.filter(c => !c.resolved).length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-xs italic">
                    🎉 Không có xung đột lịch nào cần xử lý.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Hiệu suất sử dụng phòng</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="w-32 h-32 relative mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roomUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {roomUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{fontSize: '10px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {((statsData.roomsInUse / statsData.totalRooms) * 100).toFixed(0)}%
                    </span>
                    <span className="text-[9px] text-slate-500">Sử dụng</span>
                  </div>
                </div>
                <div className="w-full space-y-2 text-xs">
                  {roomUsageData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 dark:text-slate-350">{item.name}</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.name === 'Đang dùng' ? statsData.roomsInUse : item.name === 'Trống' ? (statsData.totalRooms - statsData.roomsInUse - 2) : 2}
                        <span className="text-slate-400 font-normal ml-1">
                          ({((item.name === 'Đang dùng' ? statsData.roomsInUse : item.name === 'Trống' ? (statsData.totalRooms - statsData.roomsInUse - 2) : 2) / statsData.totalRooms * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      {/* ==================== DIALOG MODALS ==================== */}

      <Dialog 
        open={isCustomizeOpen} 
        onOpenChange={setIsCustomizeOpen} 
        title="Tùy chỉnh Thời khóa biểu"
        description="Bật/tắt các hiển thị trên giao diện Thời khóa biểu"
      >
        <div className="space-y-4 text-sm">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <span>
              <span className="block font-bold text-slate-900 dark:text-white">Ẩn phòng học</span>
              <span className="text-xs text-slate-500">Thu gọn giao diện, không hiển thị tên phòng học</span>
            </span>
            <input type="checkbox" className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <span>
              <span className="block font-bold text-slate-900 dark:text-white">Chế độ xem gọn</span>
              <span className="text-xs text-slate-500">Chỉ hiển thị môn học, bỏ qua tên giáo viên</span>
            </span>
            <input type="checkbox" className="h-4 w-4" />
          </label>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCustomizeOpen(false)}>Hủy</Button>
            <Button onClick={() => {
              setIsCustomizeOpen(false);
              triggerToast('Đã lưu tùy chỉnh hiển thị thời khóa biểu', 'success');
            }} className="bg-blue-600">Lưu thay đổi</Button>
          </div>
        </div>
      </Dialog>

      {/* 1. Tiết học hôm nay Dialog */}
      <Dialog 
        open={isTodaySlotsOpen} 
        onOpenChange={setIsTodaySlotsOpen} 
        title="Danh sách tiết học hôm nay (Thứ 4)"
        description="Các lớp học và phân công giảng dạy thực tế trong ngày hôm nay"
      >
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {timetableData.filter(s => s.day === 4).sort((a,b) => a.period - b.period).map((slot) => (
            <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100/30">
                  T{slot.period}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{slot.subject} - Lớp {slot.className}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" /> {periodTimes[slot.period] || "N/A"} · <MapPin className="w-3 h-3 text-slate-400" /> Phòng {slot.room}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-350">{slot.teacherName}</p>
                  <p className="text-[10px] text-slate-400">{slot.teacherRole}</p>
                </div>
                <Badge className={cn(
                  "text-[10px] px-2 py-0.5 border-0 font-medium",
                  slot.period <= 2 ? "bg-slate-100 text-slate-600" :
                  slot.period === 3 ? "bg-blue-500 text-white animate-pulse" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                )}>
                  {slot.period <= 2 ? "Đã dạy" : slot.period === 3 ? "Đang diễn ra" : "Sắp dạy"}
                </Badge>
              </div>
            </div>
          ))}
          {timetableData.filter(s => s.day === 4).length === 0 && (
            <p className="text-center py-6 text-slate-400 italic text-sm">Không có tiết dạy học nào trong hôm nay.</p>
          )}
        </div>
      </Dialog>

      {/* 2. Phòng đang sử dụng Dialog */}
      <Dialog
        open={isRoomsInUseOpen}
        onOpenChange={setIsRoomsInUseOpen}
        title="Quản lý và Khai thác Phòng học"
        description="Theo dõi thời gian thực trạng thái sử dụng phòng học trên toàn trường"
      >
        <div className="space-y-4">
          <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2 text-xs font-bold gap-3">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'in_use', label: 'Đang dùng' },
              { key: 'vacant', label: 'Phòng trống' },
              { key: 'maintenance', label: 'Bảo trì' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRoomTab(tab.key as any)}
                className={cn(
                  "pb-1 border-b-2 transition-colors px-1",
                  roomTab === tab.key
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-1">
            {[
              { name: 'P.301', block: 'Nhà A', type: 'Phòng học thường', status: timetableData.some(s => s.room === 'P.301' && s.day === 4 && s.period === 3) ? 'in_use' : 'vacant' },
              { name: 'P.302', block: 'Nhà A', type: 'Phòng học thường', status: 'in_use', subject: 'Toán học nâng cao', teacher: 'Cô Lê Thị Thanh Nhàn', class: '10A1' },
              { name: 'P.105', block: 'Nhà B', type: 'Phòng học thường', status: 'in_use', subject: 'Ngữ văn chuyên đề', teacher: 'Thầy Vũ Tiến Đạt', class: '11A2' },
              { name: 'P.401', block: 'Nhà A', type: 'Phòng học thường', status: 'vacant' },
              { name: 'P.405', block: 'Nhà A', type: 'Phòng học thường', status: 'vacant' },
              { name: 'Lab AI 1', block: 'Nhà C', type: 'Phòng Lab công nghệ', status: 'in_use', subject: 'Khoa học máy tính', teacher: 'Thầy Trần Hoàng Nam', class: '10A1' },
              { name: 'Lab AI 2', block: 'Nhà C', type: 'Phòng Lab công nghệ', status: 'vacant' },
              { name: 'P.201', block: 'Nhà B', type: 'Phòng học thường', status: 'maintenance', note: 'Bảo trì điều hòa' },
              { name: 'P.202', block: 'Nhà B', type: 'Phòng học thường', status: 'vacant' },
              { name: 'P.102', block: 'Nhà B', type: 'Phòng học thường', status: 'vacant' },
              { name: 'Robotics Lab', block: 'Nhà C', type: 'Phòng thực nghiệm', status: 'maintenance', note: 'Nâng cấp kit Arduino' },
              { name: 'Gymnasium', block: 'Nhà Thể chất', type: 'Nhà đa năng', status: 'vacant' },
            ]
              .filter(r => {
                if (roomTab === 'all') return true;
                if (roomTab === 'in_use') return r.status === 'in_use';
                if (roomTab === 'vacant') return r.status === 'vacant';
                if (roomTab === 'maintenance') return r.status === 'maintenance';
                return true;
              })
              .map((roomItem, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-3 rounded-lg border text-xs flex flex-col justify-between h-24 hover:shadow-sm transition-all",
                    roomItem.status === 'in_use' ? "bg-blue-50/30 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40" :
                    roomItem.status === 'maintenance' ? "bg-orange-50/30 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/40" :
                    "bg-emerald-50/20 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{roomItem.name}</p>
                      <p className="text-[10px] text-slate-400">{roomItem.block} · {roomItem.type}</p>
                    </div>
                    <Badge className={cn(
                      "text-[9px] px-1.5 py-0 border-0 font-bold",
                      roomItem.status === 'in_use' ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                      roomItem.status === 'maintenance' ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" :
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    )}>
                      {roomItem.status === 'in_use' ? "Đang dùng" : roomItem.status === 'maintenance' ? "Bảo trì" : "Trống"}
                    </Badge>
                  </div>
                  {roomItem.status === 'in_use' && (
                    <div className="text-[10px] text-slate-600 dark:text-slate-350 leading-tight truncate">
                      <p className="font-semibold">{roomItem.subject}</p>
                      <p className="text-[9px] text-slate-400">{roomItem.class} · {roomItem.teacher}</p>
                    </div>
                  )}
                  {roomItem.status === 'maintenance' && (
                    <p className="text-[10px] text-orange-600 dark:text-orange-400 italic truncate">{roomItem.note}</p>
                  )}
                  {roomItem.status === 'vacant' && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Có sẵn cho đặt lịch</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </Dialog>

      {/* 3. Xung đột lịch Dialog */}
      <Dialog
        open={isConflictsOpen}
        onOpenChange={setIsConflictsOpen}
        title="Xử lý xung đột thời khóa biểu"
        description="Rà soát các điểm trùng lịch học, giáo viên hoặc phòng học để giải quyết tức thời"
      >
        <div className="space-y-4">
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {conflicts.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "p-4 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all",
                  item.resolved 
                    ? "bg-slate-50/50 border-slate-200 opacity-60 text-slate-400" 
                    : "bg-orange-50/30 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900"
                )}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-[9px] px-1.5 py-0 border-0 font-bold", item.resolved ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-700")}>
                      {item.resolved ? "Đã giải quyết" : "Cảnh báo trùng"}
                    </Badge>
                    <span className="font-bold text-slate-800 dark:text-slate-300">
                      Thứ {item.day}, 1{item.day}/05 · Tiết {item.period}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{item.title}</p>
                  <p className="text-slate-600 dark:text-slate-350">{item.desc}</p>
                  <p className="text-[10px] text-slate-400 italic">{item.detail}</p>
                </div>
                {!item.resolved && (
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] h-8 shrink-0 self-end sm:self-center border-0 gap-1"
                    onClick={() => handleResolveConflict(item.id)}
                  >
                    <Check className="w-3.5 h-3.5" /> Giải quyết nhanh
                  </Button>
                )}
              </div>
            ))}
            {conflicts.length === 0 && (
              <p className="text-center py-6 text-slate-400 italic text-sm">Chưa phát hiện điểm xung đột thời khóa biểu nào.</p>
            )}
          </div>
        </div>
      </Dialog>

      {/* 4. Giáo án chờ duyệt Dialog */}
      <Dialog
        open={isPendingPlansOpen}
        onOpenChange={setIsPendingPlansOpen}
        title="Giáo án chờ phê duyệt"
        description="Xem xét phê duyệt hoặc phản hồi điều chỉnh các giáo án học thuật"
      >
        <div className="space-y-4">
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {lessonPlans.filter(p => p.tag === 'Chờ duyệt').map((plan) => (
              <div 
                key={plan.id}
                className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-0 text-[9px] font-bold">Chờ duyệt</Badge>
                    <span className="text-[10px] text-slate-400">Cập nhật: {plan.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white leading-tight text-sm truncate">{plan.title}</h4>
                  <p className="text-xs text-slate-500">Môn học: {plan.subject} · Lớp học: {plan.targetClass}</p>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 px-2.5 font-bold border-0"
                    onClick={() => handleApprovePlan(plan.id)}
                  >
                    Duyệt
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-rose-50 text-[11px] h-8 px-2.5 font-bold"
                    onClick={() => handleRejectPlan(plan.id)}
                  >
                    Từ chối
                  </Button>
                </div>
              </div>
            ))}
            {lessonPlans.filter(p => p.tag === 'Chờ duyệt').length === 0 && (
              <div className="text-center py-8 text-slate-400 italic text-sm">
                🎉 Toàn bộ giáo án đã được duyệt hoàn tất!
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* 5. Điểm danh Dialog */}
      <Dialog
        open={isAttendanceOpen}
        onOpenChange={setIsAttendanceOpen}
        title={selectedSlot ? `Điểm danh chuyên cần: Lớp ${selectedSlot.className}` : "Điểm danh học vụ"}
        description={selectedSlot ? `${selectedSlot.subject} · Tiết ${selectedSlot.period} · Thứ ${selectedSlot.day}` : ""}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2">Học sinh</th>
                  <th className="px-4 py-2 text-center">Có mặt</th>
                  <th className="px-4 py-2 text-center">Vắng phép</th>
                  <th className="px-4 py-2 text-center">Không phép</th>
                  <th className="px-4 py-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceList.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-300">{idx + 1}. {st.name}</td>
                    <td className="px-4 py-2 text-center">
                      <input 
                        type="radio" 
                        name={`att_${st.id}`} 
                        checked={st.status === 'present'} 
                        onChange={() => {
                          setAttendanceList(prev => prev.map(item => item.id === st.id ? { ...item, status: 'present' } : item));
                        }}
                        className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300" 
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input 
                        type="radio" 
                        name={`att_${st.id}`} 
                        checked={st.status === 'excused'} 
                        onChange={() => {
                          setAttendanceList(prev => prev.map(item => item.id === st.id ? { ...item, status: 'excused' } : item));
                        }}
                        className="h-3.5 w-3.5 text-orange-600 focus:ring-orange-500 border-slate-300" 
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input 
                        type="radio" 
                        name={`att_${st.id}`} 
                        checked={st.status === 'unexcused'} 
                        onChange={() => {
                          setAttendanceList(prev => prev.map(item => item.id === st.id ? { ...item, status: 'unexcused' } : item));
                        }}
                        className="h-3.5 w-3.5 text-red-600 focus:ring-red-500 border-slate-300" 
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        value={st.note} 
                        placeholder="Lý do..." 
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttendanceList(prev => prev.map(item => item.id === st.id ? { ...item, note: val } : item));
                        }}
                        className="w-full text-[11px] h-6 px-1.5 border border-slate-200 dark:border-slate-850 rounded focus:ring-blue-600 bg-transparent"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsAttendanceOpen(false)} className="text-xs h-9">Hủy</Button>
            <Button size="sm" onClick={handleSaveAttendance} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 border-0 px-4 font-bold shadow-sm">Lưu ghi nhận</Button>
          </div>
        </div>
      </Dialog>

      {/* 6. Vào lớp online Dialog */}
      <Dialog
        open={isOnlineClassOpen}
        onOpenChange={setIsOnlineClassOpen}
        title={selectedSlot ? `Phòng học trực tuyến: ${selectedSlot.subject}` : "Phòng học trực tuyến"}
        description={selectedSlot ? `Đang kết nối tới lớp ${selectedSlot.className} qua cổng Zoom Pro` : ""}
        className="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 h-[400px]">
            {/* Main Video Area */}
            <div className="col-span-12 md:col-span-9 bg-slate-900 rounded-xl relative flex flex-col items-center justify-center border border-slate-850 shadow-inner overflow-hidden">
              {/* Pulse Animated Cam Off View */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 relative animate-pulse">
                  <div className="absolute inset-0 rounded-full border border-blue-500/30 scale-125 animate-ping opacity-30" />
                  <Video className="w-10 h-10 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="text-slate-200 text-sm font-bold">Thầy PGS.TS. Nguyễn Văn Minh (Host)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Hệ thống đang phát trực tuyến và ghi nhận lớp học...</p>
                </div>
              </div>

              {/* Status bar */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-slate-300 font-bold flex items-center gap-1.5 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>REC LIVE · 00:24:15</span>
              </div>

              {/* Tool Control Bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 border-0">
                  <Mic className="h-4.5 w-4.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 border-0">
                  <Video className="h-4.5 w-4.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 border-0">
                  <Volume2 className="h-4.5 w-4.5" />
                </Button>
                <div className="w-px h-5 bg-slate-800" />
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-3.5 h-8 border-0 gap-1"
                  onClick={() => {
                    triggerToast("Đã rời phòng học trực tuyến.", "error");
                    setIsOnlineClassOpen(false);
                  }}
                >
                  <PhoneOff className="h-3.5 w-3.5" /> Rời lớp
                </Button>
              </div>
            </div>

            {/* Sidebar Participants */}
            <div className="hidden md:flex md:col-span-3 flex-col border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/20 dark:bg-slate-900/10 min-h-0">
              <p className="font-bold text-xs text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 flex justify-between items-center">
                <span>Học sinh (10)</span>
                <span className="text-[10px] text-blue-600">Mute All</span>
              </p>
              <div className="flex-1 overflow-y-auto space-y-2 text-[11px] pr-0.5">
                {[
                  { name: 'Nguyễn Minh Anh', active: true },
                  { name: 'Trần Hoàng Bảo', active: true },
                  { name: 'Lê Khánh Chi', active: false },
                  { name: 'Phạm Hải Đăng', active: true },
                  { name: 'Vũ Thùy Dương', active: true },
                  { name: 'Đỗ Tiến Đạt', active: true },
                  { name: 'Hoàng Minh Hà', active: false },
                  { name: 'Nguyễn Thu Hương', active: true },
                  { name: 'Phan Quốc Khánh', active: true },
                  { name: 'Lâm Khánh Linh', active: true }
                ].map((std, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="font-medium truncate max-w-[100px] text-slate-700 dark:text-slate-300">{std.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className={cn("w-1.5 h-1.5 rounded-full", std.active ? "bg-emerald-500" : "bg-slate-350")} />
                      <Mic className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* 7. Thêm giáo án Dialog */}
      <Dialog
        open={isAddPlanOpen}
        onOpenChange={setIsAddPlanOpen}
        title="Biên soạn và nộp giáo án mới"
        description="Điền thông tin và tải lên tài liệu bài giảng cho bộ môn"
      >
        <form onSubmit={handleAddPlanSubmit} className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tiêu đề bài giảng / giáo án</label>
            <input 
              type="text" 
              placeholder="Ví dụ: Bài 9: Tích phân lượng giác nâng cao..." 
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
              className="w-full text-xs h-9 px-3 rounded border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Môn học</label>
              <select 
                value={newPlanSubject} 
                onChange={(e) => setNewPlanSubject(e.target.value)}
                className="w-full text-xs h-9 px-2 rounded border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-blue-600 dark:bg-slate-950"
              >
                <option value="Toán học">Toán học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Ngoại ngữ">Ngoại ngữ</option>
                <option value="Vật lý">Vật lý</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Tin học">Tin học</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lớp giảng dạy</label>
              <select 
                value={newPlanClass} 
                onChange={(e) => setNewPlanClass(e.target.value)}
                className="w-full text-xs h-9 px-2 rounded border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-blue-600 dark:bg-slate-950"
              >
                <option value="10A1">10A1</option>
                <option value="11A2">11A2</option>
                <option value="12A1">12A1</option>
                <option value="12A2">12A2</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Trạng thái ban đầu</label>
              <select 
                value={newPlanStatus} 
                onChange={(e) => setNewPlanStatus(e.target.value)}
                className="w-full text-xs h-9 px-2 rounded border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-blue-600 dark:bg-slate-950"
              >
                <option value="Nháp">Nháp (Lưu trữ cá nhân)</option>
                <option value="Chờ duyệt">Chờ duyệt (Gửi Ban Giám Hiệu)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tệp giáo án đính kèm</label>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded h-9 flex items-center justify-between px-3 text-slate-400 text-[10px] cursor-pointer hover:bg-slate-50/50">
                <span>Chọn tệp PDF, DOCX (Tối đa 15MB)</span>
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddPlanOpen(false)} className="text-xs h-9">Hủy</Button>
            <Button size="sm" type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 border-0 px-4 font-bold shadow-sm">Lưu giáo án</Button>
          </div>
        </form>
      </Dialog>

      {/* 8. Xem tất cả giáo án Dialog */}
      <Dialog
        open={isAllPlansOpen}
        onOpenChange={setIsAllPlansOpen}
        title="Quản lý kho giáo án toàn diện"
        description="Tra cứu, rà soát và kiểm duyệt kho giáo án giảng dạy học thuật toàn trường"
        className="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Left search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm giáo án hoặc môn học..." 
                value={searchPlanQuery}
                onChange={(e) => setSearchPlanQuery(e.target.value)}
                className="w-full text-xs h-8 pl-8 pr-3 rounded border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            {/* Tabs */}
            <div className="flex border border-slate-100 dark:border-slate-800 rounded p-0.5 text-[11px] font-bold bg-slate-50/30">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'draft', label: 'Nháp' },
                { key: 'pending', label: 'Chờ duyệt' },
                { key: 'approved', label: 'Đã duyệt' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setAllPlansTab(tab.key as any)}
                  className={cn(
                    "px-2.5 py-1 rounded transition-colors",
                    allPlansTab === tab.key 
                      ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-slate-200/40" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table list */}
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Tên giáo án / bài giảng</th>
                  <th className="px-4 py-2.5">Môn</th>
                  <th className="px-4 py-2.5">Lớp</th>
                  <th className="px-4 py-2.5">Cập nhật</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lessonPlans
                  .filter(p => {
                    const matchesSearch = p.title.toLowerCase().includes(searchPlanQuery.toLowerCase()) || p.subject.toLowerCase().includes(searchPlanQuery.toLowerCase());
                    const matchesTab = allPlansTab === 'all' ||
                      (allPlansTab === 'draft' && p.tag === 'Nháp') ||
                      (allPlansTab === 'pending' && p.tag === 'Chờ duyệt') ||
                      (allPlansTab === 'approved' && p.tag === 'Đã duyệt');
                    return matchesSearch && matchesTab;
                  })
                  .map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[250px]">{plan.title}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-450">{plan.subject}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-450">{plan.targetClass || "10A1"}</td>
                      <td className="px-4 py-3 text-slate-500">{plan.date}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn("text-[9px] px-1.5 py-0 border-0 font-medium", plan.tagCol)}>{plan.tag}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {plan.tag === 'Chờ duyệt' && (
                            <Button 
                              size="sm" 
                              className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-0"
                              onClick={() => handleApprovePlan(plan.id)}
                            >
                              Duyệt
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500 hover:bg-rose-50"
                            onClick={() => {
                              setLessonPlans(prev => prev.filter(p => p.id !== plan.id));
                              triggerToast("Đã xóa giáo án thành công.", "success");
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {lessonPlans.filter(p => {
                  const matchesSearch = p.title.toLowerCase().includes(searchPlanQuery.toLowerCase()) || p.subject.toLowerCase().includes(searchPlanQuery.toLowerCase());
                  const matchesTab = allPlansTab === 'all' ||
                    (allPlansTab === 'draft' && p.tag === 'Nháp') ||
                    (allPlansTab === 'pending' && p.tag === 'Chờ duyệt') ||
                    (allPlansTab === 'approved' && p.tag === 'Đã duyệt');
                  return matchesSearch && matchesTab;
                }).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                      Không tìm thấy giáo án nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>

      {/* Global Toast component */}
      {toast.show && (
        <div className={cn(
          "fixed bottom-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-xs font-bold animate-in fade-in duration-300",
          toast.type === 'success' 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-850" 
            : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-850"
        )}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
