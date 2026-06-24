'use client';
import { serverStorage } from '../libs/client/server-storage';


import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  BookOpen, 
  Calculator, 
  Shield, 
  RefreshCw
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import { getUnifiedStudents, saveUnifiedStudents, UnifiedStudent } from '../utils/peopleDirectory';
import { firestoreDb } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

// Subcomponents
import LmsAdmissions from './lms/LmsAdmissions';
import LmsOperations from './lms/LmsOperations';
import LmsFinancials from './lms/LmsFinancials';
import LmsSecurityUx from './lms/LmsSecurityUx';

interface LmsStudent {
  id: string;
  name: string;
  className: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  parentName: string;
  parentPhone?: string;
  parentEmail: string;
  parentGender?: string;
  emergencyContact?: string;
  address?: string;
}

interface MisLmsCenterProps {
  currentUser: UserProfile;
  tasks: Task[];
  onAddTask: (taskData: Omit<Task, 'id' | 'comments' | 'history'>) => void;
}

// Multilingual translations dictionary
const TRANSLATIONS = {
  VI: {
    admission: 'Tuyển sinh & Leads',
    operations: 'Vận hành & Đào tạo',
    financials: 'Tài chính & Báo cáo',
    securityUx: 'Bảo mật & Trải nghiệm',
    title: 'Hệ thống Quản trị Giáo dục Toàn diện MIS LMS',
    subtitle: 'Quản lý toàn bộ vòng đời học viên: từ tiếp cận tuyển sinh, đào tạo trực tuyến cho đến báo cáo tài chính.',
    langSelect: 'Ngôn ngữ hệ thống'
  },
  EN: {
    admission: 'Admissions & Leads',
    operations: 'Operations & Training',
    financials: 'Finance & Reporting',
    securityUx: 'Security & UX Tech',
    title: 'MIS LMS Comprehensive Educational Platform',
    subtitle: 'Manage the complete student lifecycle: from lead admission, online training to financial billing.',
    langSelect: 'System Language'
  }
};

export default function MisLmsCenter({ currentUser, tasks, onAddTask }: MisLmsCenterProps) {
  const [lang, setLang] = useState<'VI' | 'EN'>('VI');
  const [activeTab, setActiveTab] = useState<'ADMISSION' | 'OPERATIONS' | 'FINANCIALS' | 'SECURITY_UX'>('ADMISSION');
  const t = TRANSLATIONS[lang];

  const isFinanceAuthorized = 
    currentUser.title?.toLowerCase().includes('chủ tịch') || 
    currentUser.title?.toLowerCase().includes('ceo') || 
    currentUser.title?.toLowerCase().includes('kế toán') ||
    currentUser.roleName?.toLowerCase().includes('chủ tịch') ||
    currentUser.roleName?.toLowerCase().includes('ceo') ||
    currentUser.roleName?.toLowerCase().includes('kế toán');

  const [lmsStudents, setLmsStudents] = useState<LmsStudent[]>(() => {
    const unified = getUnifiedStudents();
    return unified.filter(s => s.enrollmentStatus === 'ENROLLED') as LmsStudent[];
  });

  // EMIS / vnEdu Integration States
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS'>('IDLE');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncHistory, setSyncHistory] = useState<{ id: string; date: string; operator: string; records: number; status: 'SUCCESS' | 'FAILED' }[]>(() => {
    const defaultHistory = [
      { id: 'SYNC001', date: '2026-06-02 08:30', operator: 'Thầy Trần Hoàng Nam', records: 425, status: 'SUCCESS' as const },
      { id: 'SYNC002', date: '2026-05-15 14:20', operator: 'Cô Lê Thị Thanh Nhàn', records: 418, status: 'SUCCESS' as const }
    ];
    const saved = typeof window !== 'undefined' ? serverStorage.getItem('mis_emis_sync_history') : null;
    return saved ? JSON.parse(saved) : defaultHistory;
  });

  const handleStartSync = () => {
    setSyncStatus('SYNCING');
    setSyncProgress(0);
    setSyncLogs([
      '📡 [0.0s] Đang khởi tạo kết nối bảo mật SSL đến máy chủ cổng EMIS Bộ GD&ĐT...',
      '🔐 [0.2s] Xác thực tài khoản nhà trường (MIS_HN_2026) thành công.'
    ]);
    setShowSyncModal(true);

    const steps = [
      { progress: 15, log: '📦 [0.5s] Quét dữ liệu học vụ: Phát hiện 15 lớp học và 425 hồ sơ học sinh mới/cập nhật.' },
      { progress: 30, log: '🧬 [1.0s] Tiến hành mã hóa dữ liệu đầu ra theo chuẩn XML/JSON của Bộ GD&ĐT...' },
      { progress: 50, log: '📤 [1.5s] Đang truyền tải gói tin mã hóa hồ sơ học sinh lên hệ thống vnEdu...' },
      { progress: 70, log: '📤 [2.2s] Đang đồng bộ sổ điểm học bạ điện tử và điểm danh chuyên cần của học kỳ II...' },
      { progress: 85, log: '📥 [3.0s] Nhận phản hồi đối chiếu từ máy chủ vnEdu: 425/425 bản ghi hợp lệ.' },
      { progress: 95, log: '⚙️ [3.5s] Đang ghi nhận nhật ký đồng bộ cục bộ và cập nhật hệ thống...' },
      { progress: 100, log: '✅ [4.0s] Đồng bộ liên thông dữ liệu hoàn tất thành công 100%! Hệ thống học bạ đã khớp.' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSyncProgress(step.progress);
        setSyncLogs(prev => [...prev, step.log]);

        if (step.progress === 100) {
          setSyncStatus('SUCCESS');
          const newRecord = {
            id: `SYNC${Date.now().toString().slice(-3)}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            operator: currentUser.name || 'Hệ thống',
            records: 425,
            status: 'SUCCESS' as const
          };
          setSyncHistory(prev => {
            const updated = [newRecord, ...prev];
            serverStorage.setItem('mis_emis_sync_history', JSON.stringify(updated));
            return updated;
          });
        }
      }, (idx + 1) * 600);
    });
  };

  // Real-time Firestore Sync for Student Directory
  useEffect(() => {
    const unsub = onSnapshot(collection(firestoreDb, 'mis_student_directory'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UnifiedStudent[];
      if (list.length > 0) {
        const enrolled = list.filter(s => s.enrollmentStatus === 'ENROLLED') as LmsStudent[];
        setLmsStudents(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(enrolled)) {
            return enrolled;
          }
          return prev;
        });

        const mappedLeads = list.map(s => ({
          ...s,
          studentName: s.name,
          stage: s.enrollmentStatus,
          phone: s.parentPhone,
          email: s.parentEmail,
        }));
        setLeads(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(mappedLeads)) {
            return mappedLeads;
          }
          return prev;
        });
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const currentUnified = getUnifiedStudents();
    const nextUnified = currentUnified.map(student => {
      const match = lmsStudents.find(s => s.id === student.id);
      if (match) {
        return {
          ...student,
          ...match,
        };
      }
      return student;
    });

    lmsStudents.forEach(student => {
      const exists = nextUnified.some(s => s.id === student.id);
      if (!exists) {
        nextUnified.push({
          ...student,
          enrollmentStatus: 'ENROLLED',
        } as UnifiedStudent);
      }
    });

    saveUnifiedStudents(nextUnified as UnifiedStudent[]);
  }, [lmsStudents]);

  // Interactive state for CRM Leads
  const [leads, setLeads] = useState<any[]>(() => {
    const unified = getUnifiedStudents();
    return unified.map(s => ({
      ...s,
      studentName: s.name,
      stage: s.enrollmentStatus,
      phone: s.parentPhone,
      email: s.parentEmail,
    }));
  });

  useEffect(() => {
    const currentUnified = getUnifiedStudents();
    const nextUnified = currentUnified.map(student => {
      const match = leads.find(l => l.id === student.id);
      if (match) {
        return {
          ...student,
          name: match.studentName || student.name,
          parentPhone: match.phone || match.parentPhone || student.parentPhone,
          parentEmail: match.email || match.parentEmail || student.parentEmail,
          parentName: match.parentName || student.parentName,
          enrollmentStatus: match.stage || match.enrollmentStatus || student.enrollmentStatus,
          notes: match.notes || student.notes,
          testDate: match.testDate || student.testDate,
          testTime: match.testTime || student.testTime,
          testScore: match.testScore || student.testScore,
          scholarshipInfo: match.scholarshipInfo || student.scholarshipInfo,
          docChecklist: match.docChecklist || student.docChecklist,
        };
      }
      return student;
    });

    leads.forEach(match => {
      const exists = nextUnified.some(s => s.id === match.id);
      if (!exists) {
        nextUnified.push({
          id: match.id,
          name: match.studentName,
          parentName: match.parentName,
          parentPhone: match.phone || match.parentPhone,
          parentEmail: match.email || match.parentEmail,
          enrollmentStatus: match.stage || 'CONSULTING',
          notes: match.notes,
          testDate: match.testDate,
          testTime: match.testTime,
          testScore: match.testScore,
          scholarshipInfo: match.scholarshipInfo,
          docChecklist: match.docChecklist || { hocBa: false, khaiSinh: false, anh3x4: false },
          gender: 'Nam',
          birthDate: '2010-09-05',
        });
      }
    });

    saveUnifiedStudents(nextUnified);
  }, [leads]);

  // Operations States
  const [zoomClasses, setZoomClasses] = useState<any[]>(() => {
    const saved = typeof window !== 'undefined' ? serverStorage.getItem('mis_lms_zoom_classes') : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'ZM101', title: 'Toán học nâng cao 10 - Tích phân & Ma trận', subject: 'Toán', teacher: 'Thầy Nam', time: '14:00 - 15:30', classStatus: 'SCHEDULED', studentsPresent: 24, totalStudents: 28 },
      { id: 'ZM102', title: 'Ngữ văn chuyên đề: Kịch nghệ trong văn học', subject: 'Ngữ văn', teacher: 'Thầy Đạt', time: '16:00 - 17:30', classStatus: 'LIVE', studentsPresent: 0, totalStudents: 32 }
    ];
  });

  const [quizQuestions, setQuizQuestions] = useState<any[]>(() => {
    const saved = typeof window !== 'undefined' ? serverStorage.getItem('mis_lms_quiz_questions') : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 1,
        q: "Tìm mệnh đề đúng về tích phân của hàm số liên tục trên [a, b]:",
        options: [
          { label: 'A', text: "Là diện tích hình phẳng giới hạn bởi đồ thị và trục hoành" },
          { label: 'B', text: "Là giá trị trung bình nhân của các hàm số" },
          { label: 'C', text: "Bằng đạo hàm giới hạn cấp 1" }
        ],
        correct: 'A',
        subject: 'Toán',
        grade: 'Lớp 10',
        topic: 'Tích phân',
        difficulty: 'TH',
        explanation: 'Tích phân xác định thường được diễn giải bằng diện tích đại số dưới đồ thị hàm số.'
      },
      {
        id: 2,
        q: "Cơ cấu triết lý giáo dục Đa Trí Tuệ (Multiple Intelligences) của giáo sư nào?",
        options: [
          { label: 'A', text: "Howard Gardner" },
          { label: 'B', text: "Jean Piaget" },
          { label: 'C', text: "Albert Einstein" }
        ],
        correct: 'A',
        subject: 'Kỹ năng',
        grade: 'Lớp 10',
        topic: 'Đa trí tuệ',
        difficulty: 'NB',
        explanation: 'Howard Gardner là tác giả học thuyết Multiple Intelligences.'
      },
      {
        id: 3,
        q: "Trong bài đọc hiểu, bước nào giúp học sinh xác định luận điểm chính nhanh nhất?",
        options: [
          { label: 'A', text: "Đọc nhan đề, câu chủ đề và từ khóa lặp lại" },
          { label: 'B', text: "Chép lại toàn bộ văn bản" },
          { label: 'C', text: "Chỉ đọc đoạn cuối cùng" }
        ],
        correct: 'A',
        subject: 'Ngữ văn',
        grade: 'Lớp 11',
        topic: 'Đọc hiểu',
        difficulty: 'TH',
        explanation: 'Nhan đề, câu chủ đề và từ khóa lặp lại thường thể hiện trục ý chính của văn bản.'
      }
    ];
  });

  const [reviewAssignments, setReviewAssignments] = useState<any[]>(() => {
    const saved = typeof window !== 'undefined' ? serverStorage.getItem('mis_lms_review_assignments') : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'RV001',
        title: 'Ôn tập Toán 10 - Tích phân và tư duy logic',
        subject: 'Toán',
        className: 'Lớp 10A1',
        teacher: currentUser.name,
        deadline: '2026-06-20',
        durationMinutes: 35,
        questionIds: [1, 2],
        status: 'PUBLISHED',
      },
      {
        id: 'RV002',
        title: 'Ôn tập Ngữ văn 11 - Đọc hiểu nghị luận',
        subject: 'Ngữ văn',
        className: 'Lớp 11A2',
        teacher: currentUser.name,
        deadline: '2026-06-18',
        durationMinutes: 25,
        questionIds: [2, 3],
        status: 'PUBLISHED',
      },
    ];
  });

  const [reviewSubmissions, setReviewSubmissions] = useState<any[]>(() => {
    const saved = typeof window !== 'undefined' ? serverStorage.getItem('mis_lms_review_submissions') : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'SUB001', assignmentId: 'RV001', studentId: 'std1', studentName: 'Nguyễn Minh Quân', submittedAt: '2026-06-11 08:20', score: 100, correctCount: 2, totalQuestions: 2 },
      { id: 'SUB002', assignmentId: 'RV001', studentId: 'std4', studentName: 'Hoàng Thùy Dương', submittedAt: '2026-06-11 09:05', score: 50, correctCount: 1, totalQuestions: 2 },
      { id: 'SUB003', assignmentId: 'RV002', studentId: 'std2', studentName: 'Trần Mỹ Lệ', submittedAt: '2026-06-11 10:15', score: 100, correctCount: 2, totalQuestions: 2 },
    ];
  });

  // Shared state: Tuition fees
  const [tuitionFees, setTuitionFees] = useState<any[]>(() => {
    const saved = typeof window !== 'undefined' ? serverStorage.getItem('mis_lms_tuition_fees') : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'HV001', student: 'Nguyễn Minh Quân', amount: '12,500,000đ', deadline: '2026-06-15', status: 'CHO_DONG', invoiceNo: 'INV-2026-001' },
      { id: 'HV002', student: 'Trần Mỹ Lệ', amount: '14,000,000đ', deadline: '2026-06-10', status: 'DA_DONG', invoiceNo: 'INV-2026-002', paidDate: '2026-06-01' },
      { id: 'HV003', student: 'Phạm Hồng Thái', amount: '12,500,000đ', deadline: '2026-06-05', status: 'QUA_HAN', invoiceNo: 'INV-2026-003' }
    ];
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(firestoreDb, 'mis_lms_tuition_fees'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (list.length > 0) {
        setTuitionFees(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(list)) {
            return list;
          }
          return prev;
        });
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      serverStorage.setItem('mis_lms_tuition_fees', JSON.stringify(tuitionFees));
    }
    const syncInvoices = async () => {
      try {
        for (const t of tuitionFees) {
          await setDoc(doc(firestoreDb, 'mis_lms_tuition_fees', t.id), t);
        }
      } catch (e) {
        console.warn('Failed to sync invoices to Firestore: ', e);
      }
    };
    syncInvoices();
  }, [tuitionFees]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="space-y-1 z-10">
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-100">
            📊 LMS Center 2026
          </span>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900 mt-1.5">{t.title}</h2>
          <p className="text-xs text-slate-500 max-w-xl">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0 self-end md:self-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.langSelect}:</span>
          <button 
            onClick={() => setLang('VI')}
            className={`px-2 py-1 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
              lang === 'VI' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            VI
          </button>
          <button 
            onClick={() => setLang('EN')}
            className={`px-2 py-1 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
              lang === 'EN' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main LMS Tab Selectors */}
      <div className="flex flex-col sm:flex-row border-b border-slate-200 gap-1 bg-white p-1.5 rounded-2xl border shadow-3xs">
        <button
          onClick={() => setActiveTab('ADMISSION')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ADMISSION'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.admission}</span>
        </button>

        <button
          onClick={() => setActiveTab('OPERATIONS')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'OPERATIONS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t.operations}</span>
        </button>

        {isFinanceAuthorized && (
          <button
            onClick={() => setActiveTab('FINANCIALS')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'FINANCIALS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{t.financials}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('SECURITY_UX')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'SECURITY_UX'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t.securityUx}</span>
        </button>
      </div>

      {/* Tab View Container */}
      <div className="transition-all duration-300">
        {activeTab === 'ADMISSION' && (
          <LmsAdmissions
            currentUser={currentUser}
            leads={leads}
            setLeads={setLeads}
            lang={lang}
            t={t}
            lmsStudents={lmsStudents}
            setLmsStudents={setLmsStudents}
            setTuitionFees={setTuitionFees}
          />
        )}

        {activeTab === 'OPERATIONS' && (
          <LmsOperations
            currentUser={currentUser}
            lmsStudents={lmsStudents}
            lang={lang}
            t={t}
            syncHistory={syncHistory}
            reviewAssignments={reviewAssignments}
            setReviewAssignments={setReviewAssignments}
            reviewSubmissions={reviewSubmissions}
            setReviewSubmissions={setReviewSubmissions}
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
            zoomClasses={zoomClasses}
            setZoomClasses={setZoomClasses}
            syncStatus={syncStatus}
            syncProgress={syncProgress}
            syncLogs={syncLogs}
            showSyncModal={showSyncModal}
            setShowSyncModal={setShowSyncModal}
            handleStartSync={handleStartSync}
          />
        )}

        {activeTab === 'FINANCIALS' && isFinanceAuthorized && (
          <LmsFinancials
            currentUser={currentUser}
            t={t}
            isFinanceAuthorized={isFinanceAuthorized}
            lmsStudents={lmsStudents}
            tuitionFees={tuitionFees}
            setTuitionFees={setTuitionFees}
          />
        )}

        {activeTab === 'SECURITY_UX' && (
          <LmsSecurityUx
            t={t}
          />
        )}
      </div>

      {/* EMIS / vnEdu Sync Simulator Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-slate-800 dark:text-slate-100 font-sans">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-emerald-600 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                  Đang đồng bộ cơ sở dữ liệu EMIS / vnEdu
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Tiến trình liên thông dữ liệu trực tuyến với Cổng Bộ Giáo dục &amp; Đào tạo</p>
              </div>
              <button 
                onClick={() => syncStatus !== 'SYNCING' && setShowSyncModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                disabled={syncStatus === 'SYNCING'}
              >
                ✕ Đóng
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className={syncStatus === 'SUCCESS' ? 'text-emerald-600' : 'text-slate-500'}>
                    {syncStatus === 'SYNCING' ? 'Đang truyền dữ liệu học bạ điện tử...' : syncStatus === 'SUCCESS' ? 'Đồng bộ hoàn tất thành công!' : 'Đang chuẩn bị dữ liệu...'}
                  </span>
                  <span className="font-mono text-emerald-600">{syncProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden border border-slate-200/50">
                  <div className={`h-full transition-all duration-300 ${syncStatus === 'SUCCESS' ? 'bg-emerald-500' : 'bg-emerald-600 animate-pulse'}`} style={{ width: `${syncProgress}%` }} />
                </div>
              </div>

              {/* Log Window Console */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block font-mono">Console log kết nối</span>
                <div className="bg-slate-950 text-slate-200 font-mono text-[10.5px] p-4 rounded-xl h-48 overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
                  {syncLogs.map((log, index) => (
                    <div key={index} className={log.includes('✅') ? 'text-emerald-400 font-bold' : log.includes('🔐') || log.includes('📡') ? 'text-teal-400' : 'text-slate-350'}>
                      {log}
                    </div>
                  ))}
                  {syncStatus === 'SYNCING' && (
                    <div className="text-teal-450 animate-pulse">▋ Đang tải tiến trình tiếp theo...</div>
                  )}
                </div>
              </div>

              {/* Sync History Logs */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider block font-mono">Lịch sử đồng bộ gần đây</span>
                <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-24 overflow-y-auto border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                  {syncHistory.map(item => (
                    <div key={item.id} className="p-2.5 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-850 px-1 py-0.2 rounded">{item.id}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-350">{item.operator}</span>
                        </div>
                        <span className="text-[9.5px] text-slate-450">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-slate-500">Đồng bộ {item.records} hồ sơ</span>
                        <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 border border-emerald-105 dark:border-emerald-900/40 text-[9px] font-bold rounded">
                          Thành công
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                disabled={syncStatus === 'SYNCING'}
                onClick={() => setShowSyncModal(false)}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-3xs transition-all cursor-pointer ${
                  syncStatus === 'SYNCING'
                    ? 'bg-slate-200 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-transparent'
                    : 'bg-emerald-650 hover:bg-emerald-700 text-white'
                }`}
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
