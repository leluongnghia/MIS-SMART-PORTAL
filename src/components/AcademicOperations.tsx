import { serverStorage } from '../libs/client/server-storage';
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateLessonPlan, translateSubject, translateTitle } from '../utils/translations';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Plus, 
  Check, 
  X, 
  FileText, 
  Send, 
  Edit3, 
  AlertTriangle, 
  UserCheck, 
  RefreshCw, 
  Sparkles, 
  ThumbsUp,
  FileSpreadsheet
} from 'lucide-react';
import { UserProfile, Task } from '../types';

interface AcademicOperationsProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onNavigateTab?: (tab: string) => void;
}

interface TimetableSlot {
  id: string;
  day: number; // 2: Thứ 2, ..., 7: Thứ 7
  period: number; // Tiết 1 -> 8 (1-4 Sáng, 5-8 Chiều)
  subject: string;
  className: string;
  room: string;
  teacherId: string;
}

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  teacherId: string;
  teacherName: string;
  status: 'SO_THAO' | 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';
  submittedAt: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  fileDataUrl?: string;
  notes: string;
  feedback?: string;
  reviewedBy?: string;
}

const MAX_LOCAL_LESSON_FILE_SIZE = 2 * 1024 * 1024;

const formatFileSize = (size?: number) => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

// Dữ liệu thời khóa biểu mẫu
const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Cô Nhàn (user_nhan) - Toán
  { id: 'T1', day: 2, period: 1, subject: 'Toán học nâng cao', className: '10A1', room: 'P.302', teacherId: 'user_nhan' },
  { id: 'T2', day: 2, period: 2, subject: 'Toán học nâng cao', className: '10A1', room: 'P.302', teacherId: 'user_nhan' },
  { id: 'T3', day: 3, period: 3, subject: 'Giải tích 12', className: '12A2', room: 'P.405', teacherId: 'user_nhan' },
  { id: 'T4', day: 3, period: 4, subject: 'Giải tích 12', className: '12A2', room: 'P.405', teacherId: 'user_nhan' },
  { id: 'T5', day: 4, period: 5, subject: 'Hình học 11', className: '11B1', room: 'P.201', teacherId: 'user_nhan' },
  { id: 'T6', day: 4, period: 6, subject: 'Hình học 11', className: '11B1', room: 'P.201', teacherId: 'user_nhan' },
  { id: 'T7', day: 5, period: 1, subject: 'Toán học nâng cao', className: '10A1', room: 'P.302', teacherId: 'user_nhan' },
  { id: 'T8', day: 6, period: 3, subject: 'Giải tích 12', className: '12A2', room: 'P.405', teacherId: 'user_nhan' },

  // Thầy Đạt (user_dat) - Văn
  { id: 'V1', day: 2, period: 3, subject: 'Ngữ văn chuyên đề', className: '11A2', room: 'P.105', teacherId: 'user_dat' },
  { id: 'V2', day: 2, period: 4, subject: 'Ngữ văn chuyên đề', className: '11A2', room: 'P.105', teacherId: 'user_dat' },
  { id: 'V3', day: 3, period: 1, subject: 'Văn học VN hiện đại', className: '12A1', room: 'P.401', teacherId: 'user_dat' },
  { id: 'V4', day: 3, period: 2, subject: 'Văn học VN hiện đại', className: '12A1', room: 'P.401', teacherId: 'user_dat' },
  { id: 'V5', day: 5, period: 5, subject: 'Ngữ văn cơ bản', className: '10B2', room: 'P.304', teacherId: 'user_dat' },
  { id: 'V6', day: 5, period: 6, subject: 'Ngữ văn cơ bản', className: '10B2', room: 'P.304', teacherId: 'user_dat' },
  { id: 'V7', day: 6, period: 1, subject: 'Ngữ văn chuyên đề', className: '11A2', room: 'P.105', teacherId: 'user_dat' },
  { id: 'V8', day: 6, period: 2, subject: 'Văn học VN hiện đại', className: '12A1', room: 'P.401', teacherId: 'user_dat' },

  // Thầy Nam (user_nam) - Tin học
  { id: 'N1', day: 2, period: 5, subject: 'Khoa học máy tính', className: '10A1', room: 'Lab AI 1', teacherId: 'user_nam' },
  { id: 'N2', day: 2, period: 6, subject: 'Khoa học máy tính', className: '10A1', room: 'Lab AI 1', teacherId: 'user_nam' },
  { id: 'N3', day: 4, period: 1, subject: 'Lập trình Python', className: '11A1', room: 'Phòng máy 2', teacherId: 'user_nam' },
  { id: 'N4', day: 4, period: 2, subject: 'Lập trình Python', className: '11A1', room: 'Phòng máy 2', teacherId: 'user_nam' },
  { id: 'N5', day: 5, period: 3, subject: 'Cơ sở dữ liệu', className: '12A2', room: 'Phòng máy 1', teacherId: 'user_nam' },
  { id: 'N6', day: 5, period: 4, subject: 'Cơ sở dữ liệu', className: '12A2', room: 'Phòng máy 1', teacherId: 'user_nam' }
];

export default function AcademicOperations({ currentUser, users, onNavigateTab }: AcademicOperationsProps) {
  const { lang, t } = useLanguage();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(currentUser.id);
  
  // Master Timetable states
  const [activeSubTab, setActiveSubTab] = useState<'MY_SCHEDULE' | 'MASTER_TIMETABLE'>('MY_SCHEDULE');
  const [filterType, setFilterType] = useState<'CLASS' | 'TEACHER' | 'ROOM'>('CLASS');
  const [filterClass, setFilterClass] = useState('10A1');
  const [filterTeacherId, setFilterTeacherId] = useState(currentUser.id);
  const [filterRoom, setFilterRoom] = useState('P.302');

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = serverStorage.getItem('mis_timetable_slots_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_TIMETABLE;
  });

  useEffect(() => {
    serverStorage.setItem('mis_timetable_slots_v3', JSON.stringify(timetable));
  }, [timetable]);

  // Form states for adding slot
  const [newSlotDay, setNewSlotDay] = useState(2);
  const [newSlotPeriod, setNewSlotPeriod] = useState(1);
  const [newSlotSubject, setNewSlotSubject] = useState('Toán học nâng cao');
  const [newSlotClass, setNewSlotClass] = useState('10A1');
  const [newSlotRoom, setNewSlotRoom] = useState('P.302');
  const [newSlotTeacherId, setNewSlotTeacherId] = useState(currentUser.id);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);

  // Derive unique classes and rooms for filters
  const classesList = useMemo(() => {
    const list = new Set(timetable.map(t => t.className));
    return Array.from(list).sort();
  }, [timetable]);

  const roomsList = useMemo(() => {
    const list = new Set(timetable.map(t => t.room));
    return Array.from(list).sort();
  }, [timetable]);

  const handleAddScheduleSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const teacher = users.find(u => u.id === newSlotTeacherId);
    const teacherName = teacher ? teacher.name : 'Giáo viên';

    // 1. Check teacher conflict
    const teacherConflict = timetable.find(slot => 
      slot.day === newSlotDay && 
      slot.period === newSlotPeriod && 
      slot.teacherId === newSlotTeacherId
    );
    if (teacherConflict) {
      setConflictError('Trùng lịch: Giáo viên ' + teacherName + ' đang dạy lớp ' + teacherConflict.className + ' tại phòng ' + teacherConflict.room + ' vào Tiết ' + newSlotPeriod + ' Thứ ' + newSlotDay + '.');
      return;
    }

    // 2. Check room conflict
    const roomConflict = timetable.find(slot => 
      slot.day === newSlotDay && 
      slot.period === newSlotPeriod && 
      slot.room === newSlotRoom
    );
    if (roomConflict) {
      setConflictError('Trùng lịch: Phòng ' + newSlotRoom + ' đã được sử dụng bởi lớp ' + roomConflict.className + ' cho môn ' + roomConflict.subject + ' vào Tiết ' + newSlotPeriod + ' Thứ ' + newSlotDay + '.');
      return;
    }

    // 3. Check class conflict
    const classConflict = timetable.find(slot => 
      slot.day === newSlotDay && 
      slot.period === newSlotPeriod && 
      slot.className === newSlotClass
    );
    if (classConflict) {
      setConflictError('Trùng lịch: Lớp ' + newSlotClass + ' đã có lịch học môn ' + classConflict.subject + ' vào Tiết ' + newSlotPeriod + ' Thứ ' + newSlotDay + '.');
      return;
    }

    const newSlot: TimetableSlot = {
      id: 'TKB_' + Date.now(),
      day: newSlotDay,
      period: newSlotPeriod,
      subject: newSlotSubject,
      className: newSlotClass,
      room: newSlotRoom,
      teacherId: newSlotTeacherId
    };

    setTimetable([...timetable, newSlot]);
    setShowAddSlotForm(false);
    alert('Thêm tiết học vào thời khóa biểu tổng thành công!');
  };

  const getMasterSlot = (day: number, period: number) => {
    if (filterType === 'CLASS') {
      return timetable.find(t => t.day === day && t.period === period && t.className === filterClass);
    }
    if (filterType === 'TEACHER') {
      return timetable.find(t => t.day === day && t.period === period && t.teacherId === filterTeacherId);
    }
    return timetable.find(t => t.day === day && t.period === period && t.room === filterRoom);
  };
  
  // Quản lý Giáo án (Lesson Plans)
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => {
    const saved = serverStorage.getItem('mis_academic_lesson_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'LP001',
        title: 'Kịch nghệ hóa đoạn trích Vĩnh biệt Cửu Trùng Đài',
        subject: 'Ngữ văn',
        grade: '11',
        teacherId: 'user_dat',
        teacherName: 'Thầy Trần Quốc Đạt',
        status: 'DA_DUYET',
        submittedAt: '2026-06-01',
        fileName: 'GiaoAn_KichNgheClass11_Dat.docx',
        notes: 'Tiết học tích hợp phương pháp trải nghiệm sân khấu hóa.',
        feedback: 'Ý tưởng rất xuất sắc, gắn kết được trí tuệ không gian và ngôn ngữ của học sinh. Phê duyệt thực hiện.',
        reviewedBy: 'Thầy PGS.TS. Nguyễn Văn Minh'
      },
      {
        id: 'LP002',
        title: 'Chuyên đề Tích phân ứng dụng tính diện tích thực tế',
        subject: 'Toán',
        grade: '12',
        teacherId: 'user_nhan',
        teacherName: 'Cô Lê Thị Thanh Nhàn',
        status: 'CHO_DUYET',
        submittedAt: '2026-06-05',
        fileName: 'GiaoAn_TichPhanUngDung_Nhan.pdf',
        notes: 'Sử dụng công cụ tính toán mô phỏng cho lớp chuyên 12A2.'
      }
    ];
  });

  const downloadLessonPlan = (plan: LessonPlan) => {
    if (plan.fileDataUrl && plan.fileName) {
      const link = document.createElement('a');
      link.href = plan.fileDataUrl;
      link.download = plan.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    const safeFileName = (plan.fileName || `${plan.id}.txt`).replace(/[\\/:*?"<>|]/g, '-');
    const content = [
      `Tiêu đề: ${plan.title}`,
      `Môn học: ${plan.subject}`,
      `Khối: ${plan.grade}`,
      `Người nộp: ${plan.teacherName}`,
      `Ngày nộp: ${plan.submittedAt}`,
      `Trạng thái: ${plan.status}`,
      '',
      'Ghi chú phương pháp:',
      plan.notes || 'Không có ghi chú.',
      '',
      plan.feedback ? `Phản hồi kiểm duyệt: ${plan.feedback}` : '',
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFileName.endsWith('.txt') ? safeFileName : `${safeFileName}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    serverStorage.setItem('mis_academic_lesson_plans', JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  // Form thêm giáo án mới
  const [newPlanForm, setNewPlanForm] = useState({
    title: '',
    subject: 'Toán',
    grade: '10',
    fileName: '',
    notes: ''
  });
  const [newPlanFile, setNewPlanFile] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);
  const [newPlanFileError, setNewPlanFileError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleLessonFileSelect = (file?: File) => {
    setNewPlanFileError('');
    if (!file) return;

    if (file.size > MAX_LOCAL_LESSON_FILE_SIZE) {
      setNewPlanFile(null);
      setNewPlanForm(prev => ({ ...prev, fileName: '' }));
      setNewPlanFileError(lang === 'vi' ? 'Tệp vượt quá 2MB nên không thể lưu cục bộ.' : 'File exceeds 2MB local storage limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewPlanFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: String(reader.result),
      });
      setNewPlanForm(prev => ({ ...prev, fileName: file.name }));
    };
    reader.onerror = () => {
      setNewPlanFile(null);
      setNewPlanFileError(lang === 'vi' ? 'Không thể đọc tệp giáo án. Vui lòng thử lại.' : 'Could not read the lesson plan file.');
    };
    reader.readAsDataURL(file);
  };

  // Phê duyệt giáo án (dành cho MANAGER / ADMIN)
  const [reviewFeedbacks, setReviewFeedbacks] = useState<Record<string, string>>({});

  // Lấy danh sách giáo viên hợp lệ
  const teacherUsers = users.filter(u => u.role === 'STAFF' || u.role === 'MANAGER');

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.title || !newPlanFile) {
      setNewPlanFileError(lang === 'vi' ? 'Vui lòng chọn tệp giáo án cần tải lên.' : 'Please select a lesson plan file to upload.');
      return;
    }

    const newPlan: LessonPlan = {
      id: `LP${Date.now().toString().slice(-4)}`,
      title: newPlanForm.title,
      subject: newPlanForm.subject,
      grade: newPlanForm.grade,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      status: 'CHO_DUYET',
      submittedAt: new Date().toISOString().substring(0, 10),
      fileName: newPlanFile.name,
      fileType: newPlanFile.type,
      fileSize: newPlanFile.size,
      fileDataUrl: newPlanFile.dataUrl,
      notes: newPlanForm.notes
    };

    setLessonPlans([newPlan, ...lessonPlans]);
    setNewPlanForm({ title: '', subject: 'Toán', grade: '10', fileName: '', notes: '' });
    setNewPlanFile(null);
    setNewPlanFileError('');
    setShowAddForm(false);
  };

  const handleReviewPlan = (planId: string, status: 'DA_DUYET' | 'TU_CHOI') => {
    const feedback = reviewFeedbacks[planId] || '';
    setLessonPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          status,
          feedback: feedback.trim() || (status === 'DA_DUYET' ? (lang === 'vi' ? 'Đạt yêu cầu phê duyệt.' : 'Approved.') : (lang === 'vi' ? 'Cần sửa đổi theo yêu cầu.' : 'Revision required.')),
          reviewedBy: currentUser.name
        };
      }
      return p;
    }));
    setReviewFeedbacks(prev => ({ ...prev, [planId]: '' }));
  };

  // Trả về tiết học theo TKB
  const getSlot = (day: number, period: number) => {
    return timetable.find(t => t.teacherId === selectedTeacherId && t.day === day && t.period === period);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in" id="academic-operations-root">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-blue-600/20 shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            ACADEMIC OPERATIONS PORTAL
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            {lang === 'vi' ? 'Quản lý học vụ và giáo án điện tử' : 'Academics & Lesson Plan Review'}
          </h1>
          <p className="text-xs md:text-sm text-blue-100/80 leading-relaxed font-light font-sans mt-2">
            {lang === 'vi'
              ? 'Phân hệ hỗ trợ giáo viên quản lý Lịch báo giảng (Thời khóa biểu cá nhân), chuẩn hóa giáo án giảng dạy tích hợp và thực hiện quy trình phê duyệt trực tuyến với Tổ trưởng Chuyên môn & BGH.'
              : 'Module assisting teachers in managing teaching schedules, standardizing integrated lesson plans, and conducting online approval processes.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Left - TKB / Right - Giáo án */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* CỘT TRÁI (8/12): LỊCH BÁO GIẢNG (TKB) */}
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Calendar className="text-blue-600 w-4.5 h-4.5" />
                {t('academicHeader')}
              </h3>
              <p className="text-[10.5px] text-slate-500">{lang === 'vi' ? 'Xem phân công tiết dạy chi tiết theo tuần của từng giáo viên.' : 'View weekly teaching schedule details for each teacher.'}</p>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
              >
                {teacherUsers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({translateTitle(t.title, lang)})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid TKB */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-center border-collapse text-xs table-fixed min-w-[600px]">
              <thead>
                <tr className="bg-slate-550/5 text-slate-650 border-b border-slate-200 dark:border-slate-850 font-black">
                  <th className="py-3 w-16 border-r border-slate-200 dark:border-slate-850">{lang === 'vi' ? 'Tiết học' : 'Period'}</th>
                  <th className="py-3 border-r border-slate-200 dark:border-slate-850">{lang === 'vi' ? 'Thứ 2' : 'Mon'}</th>
                  <th className="py-3 border-r border-slate-200 dark:border-slate-850">{lang === 'vi' ? 'Thứ 3' : 'Tue'}</th>
                  <th className="py-3 border-r border-slate-200 dark:border-slate-850">{lang === 'vi' ? 'Thứ 4' : 'Wed'}</th>
                  <th className="py-3 border-r border-slate-200 dark:border-slate-850">{lang === 'vi' ? 'Thứ 5' : 'Thu'}</th>
                  <th className="py-3 border-r border-slate-200 dark:border-slate-850">{lang === 'vi' ? 'Thứ 6' : 'Fri'}</th>
                  <th className="py-3">{lang === 'vi' ? 'Thứ 7' : 'Sat'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {/* Ca Sáng */}
                <tr className="bg-blue-50/20 dark:bg-blue-950/10 border-b border-slate-200 dark:border-slate-850">
                  <td colSpan={7} className="py-1 text-[9px] font-black uppercase text-blue-700 dark:text-blue-400 text-left pl-3 tracking-widest">{lang === 'vi' ? '🌅 Ca Sáng (Tiết 1 - 4)' : '🌅 Morning Shift (Periods 1 - 4)'}</td>
                </tr>
                {[1, 2, 3, 4].map(p => (
                  <tr key={`p-${p}`} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 border-r border-slate-200 dark:border-slate-850 font-bold bg-slate-50/50 dark:bg-slate-850/50 text-slate-700 dark:text-slate-300">
                      {lang === 'vi' ? `Tiết ${p}` : `Period ${p}`}
                    </td>
                    {[2, 3, 4, 5, 6, 7].map(d => {
                      const slot = getSlot(d, p);
                      return (
                        <td key={`slot-${d}-${p}`} className={`border-r border-slate-200 dark:border-slate-850 p-1.5 ${slot ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
                          {slot ? (
                            <div className="flex flex-col gap-0.5 rounded-lg p-1 text-[11px] font-medium leading-tight">
                              <strong className="text-blue-800 dark:text-blue-300 font-bold truncate block">{translateSubject(slot.subject, lang)}</strong>
                              <span className="text-slate-700 dark:text-slate-350 block font-semibold">{lang === 'vi' ? `Lớp ${slot.className}` : `Class ${slot.className}`}</span>
                              <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5">🏢 {slot.room}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-350 font-light block">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Ca Chiều */}
                <tr className="bg-amber-50/15 dark:bg-amber-950/10 border-b border-slate-200 dark:border-slate-850">
                  <td colSpan={7} className="py-1 text-[9px] font-black uppercase text-amber-700 dark:text-amber-400 text-left pl-3 tracking-widest">{lang === 'vi' ? '☀️ Ca Chiều (Tiết 5 - 8)' : '☀️ Afternoon Shift (Periods 5 - 8)'}</td>
                </tr>
                {[5, 6, 7, 8].map(p => (
                  <tr key={`p-${p}`} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 border-r border-slate-200 dark:border-slate-850 font-bold bg-slate-50/50 dark:bg-slate-850/50 text-slate-700 dark:text-slate-300">
                      {lang === 'vi' ? `Tiết ${p}` : `Period ${p}`}
                    </td>
                    {[2, 3, 4, 5, 6, 7].map(d => {
                      const slot = getSlot(d, p);
                      return (
                        <td key={`slot-${d}-${p}`} className={`border-r border-slate-200 dark:border-slate-850 p-1.5 ${slot ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''}`}>
                          {slot ? (
                            <div className="flex flex-col gap-0.5 rounded-lg p-1 text-[11px] font-medium leading-tight">
                              <strong className="text-amber-800 dark:text-amber-350 font-bold truncate block">{translateSubject(slot.subject, lang)}</strong>
                              <span className="text-slate-700 dark:text-slate-350 block font-semibold">{lang === 'vi' ? `Lớp ${slot.className}` : `Class ${slot.className}`}</span>
                              <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5">🏢 {slot.room}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-350 font-light block">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CỘT PHẢI (5/12): DUYỆT GIÁO ÁN ĐIỆN TỬ */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <FileText className="text-blue-600 w-4.5 h-4.5" />
                {lang === 'vi' ? 'Duyệt giáo án điện tử' : 'Lesson Plan Review'}
              </h3>
              <p className="text-[10.5px] text-slate-500">{lang === 'vi' ? 'Ban Giám hiệu và Tổ trưởng duyệt giáo án của giáo viên.' : 'School Board and Department Heads review teacher lesson plans.'}</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-750 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Nộp giáo án' : 'Submit Lesson Plan'}</span>
            </button>
          </div>

          {/* Form Submit Giáo án */}
          {showAddForm && (
            <form onSubmit={handleAddPlan} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{lang === 'vi' ? 'Đăng tải giáo án mới' : 'Submit New Lesson Plan'}</h4>
              
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Tiêu đề bài giảng' : 'Lesson Title'}</label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'vi' ? 'Ví dụ: Rút gọn biểu thức đại số...' : 'e.g. Simplify algebraic expressions...'}
                    value={newPlanForm.title}
                    onChange={(e) => setNewPlanForm({...newPlanForm, title: e.target.value})}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Môn học' : 'Subject'}</label>
                    <select
                      value={newPlanForm.subject}
                      onChange={(e) => setNewPlanForm({...newPlanForm, subject: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350"
                    >
                      <option value="Toán">{lang === 'vi' ? 'Toán học' : 'Mathematics'}</option>
                      <option value="Ngữ văn">{lang === 'vi' ? 'Ngữ văn' : 'Literature'}</option>
                      <option value="Tin học">{lang === 'vi' ? 'Tin học' : 'Computer Science'}</option>
                      <option value="Vật lý">{lang === 'vi' ? 'Vật lý' : 'Physics'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Khối lớp' : 'Grade'}</label>
                    <select
                      value={newPlanForm.grade}
                      onChange={(e) => setNewPlanForm({...newPlanForm, grade: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350"
                    >
                      <option value="10">{lang === 'vi' ? 'Khối 10' : 'Grade 10'}</option>
                      <option value="11">{lang === 'vi' ? 'Khối 11' : 'Grade 11'}</option>
                      <option value="12">{lang === 'vi' ? 'Khối 12' : 'Grade 12'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'File giáo án đính kèm' : 'Lesson Plan File'}</label>
                  <input
                    key={newPlanFile?.name || 'empty-plan-file'}
                    type="file"
                    required={!newPlanFile}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    onChange={(e) => handleLessonFileSelect(e.target.files?.[0])}
                    className="w-full text-xs p-2 border border-slate-205 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 file:mr-3 file:border-0 file:rounded-md file:bg-blue-50 file:px-2.5 file:py-1 file:text-[10px] file:font-bold file:text-blue-700"
                  />
                  {newPlanFile && (
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 text-[10.5px] dark:border-blue-900/50 dark:bg-blue-950/30">
                      <span className="truncate font-mono text-slate-700 dark:text-slate-200">
                        {newPlanFile.name} {formatFileSize(newPlanFile.size) && `(${formatFileSize(newPlanFile.size)})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewPlanFile(null);
                          setNewPlanFileError('');
                          setNewPlanForm(prev => ({ ...prev, fileName: '' }));
                        }}
                        className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-white hover:text-rose-600 dark:hover:bg-slate-900"
                        aria-label={lang === 'vi' ? 'Xóa file đã chọn' : 'Remove selected file'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {newPlanFileError && (
                    <p className="mt-1.5 text-[10.5px] font-semibold text-rose-600">{newPlanFileError}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Ghi chú hướng dẫn bài giảng' : 'Lesson Delivery Notes'}</label>
                  <textarea
                    rows={2}
                    placeholder={lang === 'vi' ? 'Mô tả phương pháp tích hợp công nghệ hoặc đa trí tuệ...' : 'Describe tech integration or multiple intelligence methods...'}
                    value={newPlanForm.notes}
                    onChange={(e) => setNewPlanForm({...newPlanForm, notes: e.target.value})}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewPlanFile(null);
                      setNewPlanFileError('');
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    {lang === 'vi' ? 'Huỷ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {lang === 'vi' ? 'Nộp duyệt' : 'Submit'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Danh sách giáo án */}
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {lessonPlans.map(lp => translateLessonPlan(lp, lang)).map(plan => {
              const canReview = currentUser.role === 'ADMIN' || (currentUser.role === 'MANAGER' && plan.subject === (currentUser.workspaceId === 'TOAN_TIN' ? 'Toán' : plan.subject === 'VAN' ? 'Ngữ văn' : ''));
              
              let statusColors = 'bg-blue-50 border-blue-150 text-blue-700';
              let statusText = lang === 'vi' ? 'Chờ duyệt' : 'Pending';
              if (plan.status === 'DA_DUYET') {
                statusColors = 'bg-emerald-50 border-emerald-150 text-emerald-700';
                statusText = lang === 'vi' ? 'Đã duyệt' : 'Approved';
              } else if (plan.status === 'TU_CHOI') {
                statusColors = 'bg-rose-50 border-rose-150 text-rose-700';
                statusText = lang === 'vi' ? 'Cần sửa đổi' : 'Revision Required';
              }

              return (
                <div key={plan.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 space-y-3 shadow-4xs">
                   <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9.5px] font-bold uppercase tracking-wider">
                        {lang === 'vi' ? `Khối ${plan.grade}` : `Grade ${plan.grade}`} | {translateSubject(plan.subject, lang)}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-1.5 leading-snug">{plan.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{lang === 'vi' ? 'Người nộp' : 'Submitted by'}: <strong>{plan.teacherName}</strong> - {plan.submittedAt}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded border text-[9.5px] font-extrabold uppercase ${statusColors}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 font-mono text-[10.5px]">
                    <span className="truncate text-slate-600 dark:text-slate-350 select-all">
                      {plan.fileName}{plan.fileSize ? ` (${formatFileSize(plan.fileSize)})` : ''}
                    </span>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); downloadLessonPlan(plan); }} 
                      className="text-blue-600 hover:text-blue-800 font-bold shrink-0 no-print"
                    >
                      {lang === 'vi' ? 'Tải về' : 'Download'}
                    </a>
                  </div>

                  {plan.notes && (
                    <p className="text-[11px] text-slate-500 leading-normal bg-slate-50/45 p-2 rounded-lg border border-slate-100/50 dark:border-transparent dark:bg-slate-900/40">
                      <strong className="text-[10px] text-slate-400 uppercase tracking-wide block mb-0.5">{lang === 'vi' ? 'Ghi chú phương pháp:' : 'Methodology Notes:'}</strong>
                      {plan.notes}
                    </p>
                  )}

                  {/* Feedback hiển thị nếu có */}
                  {plan.feedback && (
                    <div className="bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200/50 p-3 rounded-xl space-y-1 font-sans text-xs">
                      <strong className="text-amber-800 dark:text-amber-450 text-[10px] font-bold uppercase tracking-wide block">✍️ {lang === 'vi' ? 'Ghi chú kiểm duyệt' : 'Review Comments'} ({plan.reviewedBy}):</strong>
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">"{plan.feedback}"</p>
                    </div>
                  )}

                  {/* Phê duyệt panel nếu người dùng có quyền và đang chờ duyệt */}
                  {canReview && plan.status === 'CHO_DUYET' && (
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2.5 no-print">
                      <input
                        type="text"
                        placeholder={lang === 'vi' ? 'Nhập ghi chú phản hồi giảng dạy...' : 'Enter teaching feedback notes...'}
                        value={reviewFeedbacks[plan.id] || ''}
                        onChange={(e) => setReviewFeedbacks({ ...reviewFeedbacks, [plan.id]: e.target.value })}
                        className="w-full text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-200"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleReviewPlan(plan.id, 'TU_CHOI')}
                          className="px-2.5 py-1 bg-rose-500 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1 shadow-3xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          {lang === 'vi' ? 'Yêu cầu sửa lại' : 'Request Revision'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewPlan(plan.id, 'DA_DUYET')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1 shadow-3xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Phê duyệt giáo án
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
