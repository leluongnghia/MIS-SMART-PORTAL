import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Plus, 
  Phone, 
  ArrowRight, 
  BookOpen, 
  Video, 
  Award, 
  DollarSign, 
  Calculator, 
  Settings, 
  Shield, 
  Globe, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Send, 
  BookOpenCheck, 
  Bookmark, 
  Calendar, 
  UserCheck, 
  XCircle, 
  Tv, 
  Lock, 
  RefreshCw,
  Search,
  Check,
  Download,
  Printer,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import { exportToCsv } from '../utils/exportUtils';
import { ALL_VIETNAM_SUBJECT_NAMES, VIETNAM_GRADE_LEVELS, getSubjectsForClassName } from '../utils/vietnameseCurriculum';

interface MisLmsCenterProps {
  currentUser: UserProfile;
  tasks: Task[];
  onAddTask: (taskData: Omit<Task, 'id' | 'comments' | 'history'>) => void;
}

interface LmsStudent {
  id: string;
  name: string;
  className: string;
  parentName: string;
  parentEmail: string;
}

interface ReviewAssignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  teacher: string;
  deadline: string;
  durationMinutes: number;
  questionIds: number[];
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

interface ReviewSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
}

interface QuizQuestionOption {
  label: string;
  text: string;
}

interface QuizQuestion {
  id: number;
  q: string;
  options: QuizQuestionOption[];
  correct: string;
  subject?: string;
  grade?: string;
  topic?: string;
  difficulty?: 'NB' | 'TH' | 'VD';
  explanation?: string;
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
    leadManager: 'Quản lý leads khách hàng tiềm năng',
    massEmail: 'Chiến dịch email hàng loạt',
    eLearning: 'E-learning & Zoom trực tuyến',
    mcqTest: 'Thi trắc nghiệm & Chấm điểm tự động',
    mathEditor: 'Bộ soạn công thức Toán-Lý-Hóa chuyên sâu',
    attendance: 'Điểm danh học viên lớp trực tuyến',
    personnel: 'Tính lương & Chấm công giảng dạy',
    tuition: 'Theo dõi Học phí & Xuất hóa đơn',
    analytics: 'Báo cáo doanh số & Hiệu suất chi nhánh',
    certs: 'Cấp chứng nhận hoàn thành khóa học',
    videoSecurity: 'Thiết lập máy chủ chặn Download',
    antiDownload: 'Bảo vệ bài giảng độc quyền',
    langSelect: 'Ngôn ngữ hệ thống'
  },
  EN: {
    admission: 'Admissions & Leads',
    operations: 'Operations & Training',
    financials: 'Finance & Reporting',
    securityUx: 'Security & UX Tech',
    title: 'MIS LMS Comprehensive Educational Platform',
    subtitle: 'Manage the complete student lifecycle: from lead admission, online training to financial billing.',
    leadManager: 'CRM Lead Management',
    massEmail: 'Mass Mass Email Campaign',
    eLearning: 'E-learning & Zoom Virtual Class',
    mcqTest: 'Online MCQ Exam & Auto-Grading',
    mathEditor: 'Math-Physics-Chemistry Equation Editor',
    attendance: 'Student Live Attendance Sync',
    personnel: 'Payroll & Teaching Load Computations',
    tuition: 'Tuition Fee Tracking & Invoicing',
    analytics: 'Revenue Performance & Branch Ratings',
    certs: 'Certificate Granting & Diploma Issuance',
    videoSecurity: 'Anti-Download Video Server Guard',
    antiDownload: 'Copyright Protection Engine',
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
    const saved = localStorage.getItem('mis_lms_students');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'std1', name: 'Nguyễn Minh Quân', className: 'Lớp 10A1', parentName: 'Nguyễn Văn Hải', parentEmail: 'hai.nguyen@parent.mis.edu.vn' },
      { id: 'std2', name: 'Trần Mỹ Lệ', className: 'Lớp 11A2', parentName: 'Lê Thị Thu Trà', parentEmail: 'tra.le@parent.mis.edu.vn' },
      { id: 'std3', name: 'Phạm Hồng Thái', className: 'Lớp 12A1', parentName: 'Phạm Hồng Sơn', parentEmail: 'son.pham@parent.mis.edu.vn' },
      { id: 'std4', name: 'Hoàng Thùy Dương', className: 'Lớp 10A1', parentName: 'Hoàng Văn Thắng', parentEmail: 'thang.hoang@parent.mis.edu.vn' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_lms_students', JSON.stringify(lmsStudents));
  }, [lmsStudents]);

  // Helper to export Leads list to CSV
  const handleExportLeadsCsv = () => {
    const headers = ['Ma Lead', 'Hoc sinh', 'Phu huynh', 'So dien thoai', 'Khoi', 'Nguon', 'Tu van vien', 'Trang thai', 'Ghi chu'];
    const rows = leads.map(l => [
      l.id,
      l.studentName || l.name,
      l.parentName,
      l.phone,
      l.grade,
      l.source,
      l.consultant || 'Hệ thống',
      l.stage === 'CONSULTING' ? 'Consulting' : l.stage === 'TESTING' ? 'Testing' : l.stage === 'RESERVED' ? 'Reserved' : 'Enrolled',
      l.notes
    ]);
    exportToCsv('MIS_CRM_Leads_Report.csv', headers, rows);
  };

  // Helper to export Financial Invoices to CSV
  const handleExportInvoicesCsv = () => {
    const headers = ['Ma hoa don', 'Hoc vien', 'Dinh muc hoc phi', 'Han thanh toan', 'Trang thai', 'Ngay thanh toan'];
    const rows = tuitionFees.map(t => [
      t.invoiceNo,
      t.student,
      t.amount,
      t.deadline,
      t.status === 'DA_DONG' ? 'Da dong' : t.status === 'CHO_DONG' ? 'Cho dong' : 'Qua han',
      t.paidDate || 'Chua dong'
    ]);
    exportToCsv('MIS_Financial_Invoices.csv', headers, rows);
  };

  // Interactive state for CRM Leads (Persistent and synced with CRM key)
  const [leads, setLeads] = useState<any[]>(() => {
    const saved = localStorage.getItem('school_crm_leads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'lead_1',
        studentName: 'Nguyễn Minh Anh',
        parentName: 'Nguyễn Văn Hải',
        phone: '0912345678',
        email: 'hai.nguyen@gmail.com',
        stage: 'CONSULTING',
        source: 'Social',
        grade: 'Lớp 10',
        notes: 'Đăng ký tìm hiểu lớp 10 chất lượng cao chuyên Anh.',
        docChecklist: { hocBa: false, khaiSinh: false, anh3x4: false },
        interactions: [
          { date: '2026-06-09', type: 'Đăng ký Form', content: 'Quan tâm chính sách học bổng đầu vào' }
        ]
      },
      {
        id: 'lead_2',
        studentName: 'Trần Bảo Nam',
        parentName: 'Lê Thị Thu',
        phone: '0987654321',
        email: 'thu.le@gmail.com',
        stage: 'CONSULTING',
        source: 'Website',
        grade: 'Lớp 10',
        notes: 'Đăng ký tìm hiểu lớp 10 song bằng.',
        docChecklist: { hocBa: false, khaiSinh: true, anh3x4: false },
        interactions: [
          { date: '2026-06-08', type: 'Gọi điện', content: 'Tư vấn biểu phí học tập' }
        ]
      },
      {
        id: 'lead_3',
        studentName: 'Phạm Tiến Dũng',
        parentName: 'Phạm Văn Thành',
        phone: '0905123456',
        email: 'thanh.pham@gmail.com',
        stage: 'TESTING',
        source: 'Referral',
        grade: 'Lớp 10',
        notes: 'Đăng ký kiểm tra năng lực môn Toán.',
        docChecklist: { hocBa: false, khaiSinh: true, anh3x4: true },
        testDate: '2026-06-15',
        testTime: '09:00',
        interactions: [
          { date: '2026-06-07', type: 'Ghi nhận lịch', content: 'Sắp xếp lịch test đầu vào ngày 15/06' }
        ]
      },
      {
        id: 'lead_4',
        studentName: 'Hoàng Thùy Dương',
        parentName: 'Hoàng Văn Thắng',
        phone: '0932112233',
        email: 'thang.hoang@gmail.com',
        stage: 'ENROLLED',
        source: 'Website',
        grade: 'Lớp 10',
        notes: 'Học sinh đạt học bổng 30% và đã hoàn thành thủ tục nhập học.',
        docChecklist: { hocBa: true, khaiSinh: true, anh3x4: true },
        testScore: '9.0/10',
        scholarshipInfo: 'Học bổng 30%',
        baseTuitionFee: 15000000,
        scholarshipDiscount: 4500000,
        interactions: [
          { date: '2026-06-06', type: 'Nhập học', content: 'Đã đóng học phí và phê duyệt nhập học' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('school_crm_leads', JSON.stringify(leads));
  }, [leads]);

  // Filter and search active state for Leads
  const [searchLeadQuery, setSearchLeadQuery] = useState('');
  const [statusLeadFilter, setStatusLeadFilter] = useState<'ALL' | 'CONSULTING' | 'TESTING' | 'RESERVED' | 'ENROLLED'>('ALL');
  const [activeLeadId, setActiveLeadId] = useState<string>('lead_1');
  const [newLeadForm, setNewLeadForm] = useState({ name: '', parentName: '', phone: '', email: '', grade: 'Lớp 10', source: 'Facebook Ads', notes: '' });
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  // Email Campaign States
  const [emailTemplate, setEmailTemplate] = useState('OPEN_DAY');
  const [emailSubject, setEmailSubject] = useState('MIS Hà Nội: Thư mời tham dự Open Day - Khơi dậy tiềm năng cùng Đa Trí Tuệ');
  const [emailProgress, setEmailProgress] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');
  const [sentCount, setSentCount] = useState<number>(0);

  // Operations/E-Learning States (Persistent)
  const [zoomClasses, setZoomClasses] = useState<any[]>(() => {
    const saved = localStorage.getItem('mis_lms_zoom_classes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'ZM101', title: 'Toán học nâng cao 10 - Tích phân & Ma trận', subject: 'Toán', teacher: 'Thầy Nam', time: '14:00 - 15:30', classStatus: 'SCHEDULED', studentsPresent: 24, totalStudents: 28 },
      { id: 'ZM102', title: 'Ngữ văn chuyên đề: Kịch nghệ trong văn học', subject: 'Ngữ văn', teacher: 'Thầy Đạt', time: '16:00 - 17:30', classStatus: 'LIVE', studentsPresent: 0, totalStudents: 32 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_lms_zoom_classes', JSON.stringify(zoomClasses));
  }, [zoomClasses]);

  // Handle adding new classes form
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [newClassData, setNewClassData] = useState({ title: '', subject: 'Toán', teacher: '', time: '08:00 - 09:30', classStatus: 'SCHEDULED' });

  // Attendance Logs State (Persistent)
  const [attendanceLogs, setAttendanceLogs] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('mis_lms_attendance_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { 'std1': true, 'std2': true, 'std3': false, 'std4': true };
  });

  useEffect(() => {
    localStorage.setItem('mis_lms_attendance_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  const [zoomActiveId, setZoomActiveId] = useState<string | null>(null);

  // MCQ questions state (Persistent)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => {
    const saved = localStorage.getItem('mis_lms_quiz_questions');
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

  useEffect(() => {
    localStorage.setItem('mis_lms_quiz_questions', JSON.stringify(quizQuestions));
  }, [quizQuestions]);

  const [showAddMcqForm, setShowAddMcqForm] = useState(false);
  const [newMcqData, setNewMcqData] = useState({
    q: '',
    A: '',
    B: '',
    C: '',
    correct: 'A',
    subject: 'Toán',
    grade: 'Lớp 10',
    topic: '',
    difficulty: 'NB' as 'NB' | 'TH' | 'VD',
    explanation: '',
  });

  // MCQ Quiz state
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const [reviewAssignments, setReviewAssignments] = useState<ReviewAssignment[]>(() => {
    const saved = localStorage.getItem('mis_lms_review_assignments');
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

  useEffect(() => {
    localStorage.setItem('mis_lms_review_assignments', JSON.stringify(reviewAssignments));
  }, [reviewAssignments]);

  const [reviewSubmissions, setReviewSubmissions] = useState<ReviewSubmission[]>(() => {
    const saved = localStorage.getItem('mis_lms_review_submissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'SUB001', assignmentId: 'RV001', studentId: 'std1', studentName: 'Nguyễn Minh Quân', submittedAt: '2026-06-11 08:20', score: 100, correctCount: 2, totalQuestions: 2 },
      { id: 'SUB002', assignmentId: 'RV001', studentId: 'std4', studentName: 'Hoàng Thùy Dương', submittedAt: '2026-06-11 09:05', score: 50, correctCount: 1, totalQuestions: 2 },
      { id: 'SUB003', assignmentId: 'RV002', studentId: 'std2', studentName: 'Trần Mỹ Lệ', submittedAt: '2026-06-11 10:15', score: 100, correctCount: 2, totalQuestions: 2 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_lms_review_submissions', JSON.stringify(reviewSubmissions));
  }, [reviewSubmissions]);

  const [showCreateReviewForm, setShowCreateReviewForm] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState('RV001');
  const [newReviewData, setNewReviewData] = useState({
    title: '',
    subject: 'Toán',
    className: 'Lớp 10A1',
    deadline: '2026-06-20',
    durationMinutes: 30,
    selectedQuestionIds: [] as number[],
  });
  const reviewSubjectOptions = getSubjectsForClassName(newReviewData.className);

  // Mathematical equation editor state
  const [equationCode, setEquationCode] = useState<string>('f(x) = \\int_{a}^{b} \\frac{x^2 + \\sin(x)}{\\sqrt{3y}} dx');
  const insertMathSnippet = (snippet: string) => {
    setEquationCode(prev => prev + ' ' + snippet);
  };

  // Finance states (Persistent)
  const [tuitionFees, setTuitionFees] = useState<any[]>(() => {
    const saved = localStorage.getItem('mis_lms_tuition_fees');
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
    localStorage.setItem('mis_lms_tuition_fees', JSON.stringify(tuitionFees));
  }, [tuitionFees]);

  const [showAddInvoiceForm, setShowAddInvoiceForm] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({ student: '', amount: '12,500,000đ', deadline: '2026-06-20', status: 'CHO_DONG' });
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Personnel Payroll states
  const [baseSalaryRate, setBaseSalaryRate] = useState<number>(300000); // 300k VND per hour
  const [teachersPayroll, setTeachersPayroll] = useState([
    { id: 'T001', name: 'Cô Thanh Nhàn', basePay: 12000000, teachingHours: 42, overtimeHours: 8, substitutionHours: 4 },
    { id: 'T002', name: 'Thầy Đức Nam', basePay: 15000000, teachingHours: 50, overtimeHours: 12, substitutionHours: 6 },
    { id: 'T003', name: 'Thầy Quốc Đạt', basePay: 11000000, teachingHours: 38, overtimeHours: 5, substitutionHours: 2 }
  ]);

  // Certificate Issuance list (Persistent)
  const [certStudents, setCertStudents] = useState<any[]>(() => {
    const saved = localStorage.getItem('mis_lms_cert_students');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'C101', name: 'Trần Mỹ Lệ', courseName: 'Chuyên đề Kịch nghệ Văn học 11', grade: '9.2', status: 'ISSUED', certCode: 'MIS-CERT-11204' },
      { id: 'C102', name: 'Hoàng Thùy Dương', courseName: 'Học phần Lập luận Logic toán 10', grade: '8.8', status: 'PENDING', certCode: '' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_lms_cert_students', JSON.stringify(certStudents));
  }, [certStudents]);

  const [activeCert, setActiveCert] = useState<any>(null);

  const downloadCertificate = (cert: any) => {
    const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${cert.certCode || 'MIS-CERT'} - ${cert.name}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; padding: 48px; color: #1f2937; }
    .cert { border: 10px solid #78350f; border-radius: 24px; padding: 48px; text-align: center; }
    .eyebrow { letter-spacing: 0.2em; font-size: 12px; color: #92400e; font-weight: 800; text-transform: uppercase; }
    h1 { margin: 20px 0 8px; font-size: 34px; color: #451a03; }
    h2 { margin: 0 0 24px; font-size: 24px; }
    p { font-size: 16px; line-height: 1.7; }
    .footer { display: flex; justify-content: space-between; gap: 24px; margin-top: 42px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="eyebrow">Giấy chứng nhận Đa Trí Tuệ MIS</div>
    <h1>${cert.name}</h1>
    <h2>${cert.courseName}</h2>
    <p>Đã hoàn thành xuất sắc học phần chuyên sâu, đạt điểm khóa ${cert.grade}/10 và được hệ thống MIS LMS xác thực.</p>
    <div class="footer">
      <div>Số chứng nhận: <strong>${cert.certCode || 'Đang cập nhật'}</strong></div>
      <div><strong>Chủ tịch Hội đồng MIS Hà Nội</strong><br/>[Đã đóng dấu điện tử]</div>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cert.certCode || cert.id || 'MIS-CERT'}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const printSelectedInvoice = () => {
    window.print();
  };

  // Security variables
  const [disableMainDownload, setDisableMainDownload] = useState(true);
  const [tokenExpirationTime, setTokenExpirationTime] = useState(15); // minutes
  const [securityStatus, setSecurityStatus] = useState<'ACTIVE' | 'UPDATING'>('ACTIVE');

  // Interactive Security Logs State
  const [securityLogs, setSecurityLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('mis_lms_security_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    const timeStr = new Date().toISOString().substring(11, 16);
    return [
      `[${timeStr}] SafeVideo DRM Server Engine initialized successfully.`,
      `[${timeStr}] Segment chunking enabled: AES-128 dynamic payload encryption active.`,
      `[${timeStr}] Browser debugger blocker running in background.`
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_lms_security_logs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  // Helper to append security logs dynamically
  const addSecurityLog = (msg: string) => {
    const timeStr = new Date().toISOString().substring(11, 16);
    setSecurityLogs(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 8)]);
  };

  // Add a new lead
  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim() || !newLeadForm.phone.trim()) return;

    const isPhoneDup = leads.some(l => l.phone === newLeadForm.phone.trim());
    const isEmailDup = newLeadForm.email.trim() && leads.some(l => l.email && l.email.toLowerCase() === newLeadForm.email.trim().toLowerCase());

    if (isPhoneDup || isEmailDup) {
      const confirmMsg = `Phát hiện thông tin học sinh trùng lặp:\n${isPhoneDup ? '- Số điện thoại đã tồn tại\n' : ''}${isEmailDup ? '- Email đã tồn tại\n' : ''}\nBạn có chắc chắn vẫn muốn thêm học sinh này?`;
      if (!window.confirm(confirmMsg)) return;
    }

    const newL = {
      id: `lead_${Date.now()}`,
      studentName: newLeadForm.name.trim(),
      parentName: newLeadForm.parentName.trim() || 'Người liên hệ',
      phone: newLeadForm.phone.trim(),
      email: newLeadForm.email.trim(),
      stage: 'CONSULTING',
      source: newLeadForm.source,
      consultant: currentUser.name,
      grade: newLeadForm.grade || 'Lớp 10',
      notes: newLeadForm.notes.trim() || 'Chưa ghi chú cụ thể.',
      interactions: [
        {
          date: new Date().toISOString().split('T')[0],
          type: 'Tạo mới',
          content: 'Được phân bổ lead qua cổng tuyển sinh LMS'
        }
      ]
    };
    setLeads([newL, ...leads]);
    setNewLeadForm({ name: '', parentName: '', phone: '', email: '', grade: 'Lớp 10', source: 'Facebook Ads', notes: '' });
  };

  // Add notes to a lead
  const handleAddNote = (leadId: string) => {
    const text = noteInputs[leadId];
    if (!text?.trim()) return;
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const currentInteractions = l.interactions || [];
        return { 
          ...l, 
          notes: `${l.notes}\n[Ghi chú mới]: ${text.trim()}`,
          interactions: [
            ...currentInteractions,
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Ghi chú',
              content: text.trim()
            }
          ]
        };
      }
      return l;
    }));
    setNoteInputs(prev => ({ ...prev, [leadId]: '' }));
  };

  // Update lead status
  const updateLeadStatus = (leadId: string, stage: 'CONSULTING' | 'TESTING' | 'RESERVED' | 'ENROLLED') => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const currentInteractions = l.interactions || [];
        return { 
          ...l, 
          stage,
          interactions: [
            ...currentInteractions,
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Chuyển trạng thái',
              content: `Thay đổi trạng thái sang ${stage}`
            }
          ]
        };
      }
      return l;
    }));
  };

  // Sync ENROLLED leads to LMS students and generate tuition invoices
  useEffect(() => {
    const enrolledLeads = leads.filter(l => l.stage === 'ENROLLED');
    if (enrolledLeads.length === 0) return;

    enrolledLeads.forEach(lead => {
      setLmsStudents(prevStudents => {
        const studentExists = prevStudents.some(s => (s as any).crmLeadId === lead.id || s.name === lead.studentName);
        if (studentExists) return prevStudents;

        let className = '10A1';
        if (lead.grade) {
          if (lead.grade.includes('11')) className = '11A1';
          else if (lead.grade.includes('12')) className = '12A1';
        }

        const newStudent: LmsStudent = {
          id: 'std_crm_' + lead.id,
          name: lead.studentName,
          className: className,
          parentName: lead.parentName || 'Người liên hệ',
          parentEmail: lead.email || `parent_${lead.phone}@parent.mis.edu.vn`
        };
        // Store crmLeadId dynamically
        (newStudent as any).crmLeadId = lead.id;
        return [...prevStudents, newStudent];
      });

      setTuitionFees(prevTuition => {
        const invoiceNo = 'INV-CRM-' + lead.id;
        const invoiceExists = prevTuition.some(t => t.invoiceNo === invoiceNo);
        if (invoiceExists) return prevTuition;

        const base = lead.baseTuitionFee || 15000000;
        const tDisc = lead.tuitionDiscount || 0;
        const sDisc = lead.scholarshipDiscount || 0;
        const pDisc = lead.phaseEnrollmentDiscount || 0;
        const oDisc = lead.otherDiscount || 0;
        const adv = lead.advancedFee || 0;
        const payable = base - (tDisc + sDisc + pDisc + oDisc) + adv;

        const newInvoice = {
          id: 'inv_crm_' + lead.id,
          student: lead.studentName,
          amount: payable.toLocaleString('vi-VN') + 'đ',
          deadline: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: 'CHO_DONG',
          invoiceNo: invoiceNo
        };
        return [...prevTuition, newInvoice];
      });
    });
  }, [leads]);

  // Start sending emails simulation
  const handleSendMassEmail = () => {
    setEmailProgress('SENDING');
    setSentCount(0);
    const interval = setInterval(() => {
      setSentCount(prev => {
        if (prev >= 120) {
          clearInterval(interval);
          setEmailProgress('SENT');
          return 120;
        }
        return prev + 15;
      });
    }, 200);
  };

  // Quiz evaluation
  const handleEvaluateQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach(q => {
      if (userQuizAnswers[q.id] === q.correct) {
        correctCount += 1;
      }
    });
    const finalScore = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;
    setQuizScore(finalScore);
  };

  const activeReview = reviewAssignments.find(item => item.id === activeReviewId) || reviewAssignments[0];
  const activeReviewQuestions = activeReview
    ? quizQuestions.filter(question => activeReview.questionIds.includes(question.id))
    : [];
  const activeReviewStudents = activeReview
    ? lmsStudents.filter(student => student.className === activeReview.className)
    : [];
  const activeReviewSubmissions = activeReview
    ? reviewSubmissions.filter(submission => submission.assignmentId === activeReview.id)
    : [];
  const completionRate = activeReviewStudents.length > 0
    ? Math.round((activeReviewSubmissions.length / activeReviewStudents.length) * 100)
    : 0;
  const averageScore = activeReviewSubmissions.length > 0
    ? Math.round(activeReviewSubmissions.reduce((sum, item) => sum + item.score, 0) / activeReviewSubmissions.length)
    : 0;
  const topicSummary = activeReviewQuestions.reduce<Record<string, number>>((acc, question) => {
    const topic = question.topic || 'Chưa phân loại';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});

  const handleCreateReviewAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewData.title.trim() || newReviewData.selectedQuestionIds.length === 0) return;

    const nextNumber = reviewAssignments.length + 1;
    const assignment: ReviewAssignment = {
      id: `RV${String(nextNumber).padStart(3, '0')}`,
      title: newReviewData.title.trim(),
      subject: newReviewData.subject,
      className: newReviewData.className,
      teacher: currentUser.name,
      deadline: newReviewData.deadline,
      durationMinutes: Number(newReviewData.durationMinutes) || 30,
      questionIds: newReviewData.selectedQuestionIds,
      status: 'PUBLISHED',
    };

    setReviewAssignments(prev => [assignment, ...prev]);
    setActiveReviewId(assignment.id);
    setNewReviewData({
      title: '',
      subject: 'Toán',
      className: 'Lớp 10A1',
      deadline: '2026-06-20',
      durationMinutes: 30,
      selectedQuestionIds: [],
    });
    setShowCreateReviewForm(false);
  };

  const toggleReviewQuestion = (questionId: number) => {
    setNewReviewData(prev => ({
      ...prev,
      selectedQuestionIds: prev.selectedQuestionIds.includes(questionId)
        ? prev.selectedQuestionIds.filter(id => id !== questionId)
        : [...prev.selectedQuestionIds, questionId],
    }));
  };

  const handleSimulateSubmission = (student: LmsStudent) => {
    if (!activeReview || activeReviewQuestions.length === 0) return;
    const alreadySubmitted = reviewSubmissions.some(
      submission => submission.assignmentId === activeReview.id && submission.studentId === student.id
    );
    if (alreadySubmitted) return;

    const seed = student.id.charCodeAt(student.id.length - 1) + activeReview.id.charCodeAt(activeReview.id.length - 1);
    const totalQuestions = activeReviewQuestions.length;
    const correctCount = Math.max(1, Math.min(totalQuestions, seed % (totalQuestions + 1)));
    const submission: ReviewSubmission = {
      id: `SUB${Date.now()}`,
      assignmentId: activeReview.id,
      studentId: student.id,
      studentName: student.name,
      submittedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
      score: Math.round((correctCount / totalQuestions) * 100),
      correctCount,
      totalQuestions,
    };

    setReviewSubmissions(prev => [submission, ...prev]);
  };

  const handleExportReviewReport = () => {
    if (!activeReview) return;
    const headers = ['Bài ôn tập', 'Học sinh', 'Lớp', 'Trạng thái', 'Điểm', 'Số câu đúng', 'Thời gian nộp', 'Email phụ huynh'];
    const rows = activeReviewStudents.map(student => {
      const submission = activeReviewSubmissions.find(item => item.studentId === student.id);
      return [
        activeReview.title,
        student.name,
        student.className,
        submission ? 'Đã nộp' : 'Chưa nộp',
        submission?.score ?? '',
        submission ? `${submission.correctCount}/${submission.totalQuestions}` : '',
        submission?.submittedAt ?? '',
        student.parentEmail,
      ];
    });
    exportToCsv(`Bao_cao_on_tap_${activeReview.id}.csv`, headers, rows);
  };

  // Formula generation display
  const renderMathPreview = () => {
    // Return a styled visual layout for formula text
    return (
      <div className="bg-slate-900 border border-slate-800 text-emerald-400 p-4 rounded-xl min-h-[70px] flex items-center justify-center font-mono text-xs overflow-auto">
        <div className="text-center">
          <span className="text-[10px] text-slate-500 block mb-1">LaTeX Compiled Output (Khôi Công Thức):</span>
          <span className="text-sm tracking-wide font-sans text-white border-b border-indigo-500/30 pb-0.5 select-all font-mono">
            {equationCode}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 animate-fade-in" id="mis-lms-hub-root">
      
      {/* Dynamic Header with Integrated Language Switcher */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-emerald-500/20 shadow-lg">
        <div className="absolute top-0 right-0 w-[420px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 max-w-3xl">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-100 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
              <BookOpenCheck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              MIS LMS ACADEMIC ENGINE
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
              {t.title}
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed font-light">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Stats Panel Header / Language switcher */}
          <div className="shrink-0 flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10">
            <Globe className="w-3.5 h-3.5 text-emerald-200" />
            <span className="text-[10px] font-bold text-slate-200 block uppercase tracking-wide">{t.langSelect}:</span>
            <div className="flex gap-1 bg-white/10 p-0.5 rounded-lg">
              <button 
                onClick={() => setLang('VI')}
                className={`px-2 py-0.5 text-[9px] font-black rounded cursor-pointer ${lang === 'VI' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                VI
              </button>
              <button 
                onClick={() => setLang('EN')}
                className={`px-2 py-0.5 text-[9px] font-black rounded cursor-pointer ${lang === 'EN' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>
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

        {/* TAB 1: ADMISSIONS CRM & LEADS CAMPAIGN */}
        {activeTab === 'ADMISSION' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* CRM Leads Table List */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
                      <Users className="text-emerald-600 w-4.5 h-4.5" />
                      {t.leadManager}
                    </h3>
                  </div>
                  <button
                    onClick={handleExportLeadsCsv}
                    className="px-2.5 py-1 text-[10.5px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 no-print"
                    title="Xuất danh sách Leads ra Excel/CSV"
                    type="button"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Xuất Excel Leads
                  </button>
                </div>

                {/* Search and Filters Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm tên hoặc số điện thoại..."
                      value={searchLeadQuery}
                      onChange={(e) => setSearchLeadQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <select
                      value={statusLeadFilter}
                      onChange={(e: any) => setStatusLeadFilter(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-650"
                    >
                      <option value="ALL">Tất cả trạng thái lead</option>
                      <option value="CONSULTING">Đang tư vấn & Lead</option>
                      <option value="TESTING">Thi test & Đặt lịch</option>
                      <option value="RESERVED">Giữ chỗ & Hồ sơ</option>
                      <option value="ENROLLED">Đã nhập học</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-150">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                        <th className="px-4 py-2.5">Học sinh</th>
                        <th className="px-4 py-2.5">Khối</th>
                        <th className="px-4 py-2.5">Số điện thoại</th>
                        <th className="px-4 py-2.5">Tư vấn viên</th>
                        <th className="px-4 py-2.5">Nguồn</th>
                        <th className="px-4 py-2.5 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const filteredLeads = leads.filter(l => {
                          const nameVal = l.studentName || l.name || '';
                          const matchesQuery = nameVal.toLowerCase().includes(searchLeadQuery.toLowerCase()) || l.phone.includes(searchLeadQuery);
                          const matchesStatus = statusLeadFilter === 'ALL' || l.stage === statusLeadFilter;
                          return matchesQuery && matchesStatus;
                        });

                        if (filteredLeads.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-xs text-slate-400 font-medium bg-slate-50/20">
                                Không tìm thấy Leads nào phù hợp với bộ lọc tìm kiếm.
                              </td>
                            </tr>
                          );
                        }

                        return filteredLeads.map(lead => {
                          const isActive = lead.id === activeLeadId;
                          const statusColors = lead.stage === 'CONSULTING' ? 'bg-blue-105/90 text-blue-800'
                            : lead.stage === 'TESTING' ? 'bg-amber-105/90 text-amber-800'
                            : lead.stage === 'RESERVED' ? 'bg-purple-105/90 text-purple-800'
                            : lead.stage === 'ENROLLED' ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800';

                          return (
                            <tr 
                              key={lead.id}
                              onClick={() => setActiveLeadId(lead.id)}
                              className={`hover:bg-emerald-50/20 transition-colors cursor-pointer ${isActive ? 'bg-emerald-50/50' : ''}`}
                            >
                              <td className="px-4 py-3 font-bold text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px]">👤</span>
                                  <div>
                                    <span className="block">{lead.studentName || lead.name}</span>
                                    <span className="text-[9px] text-slate-450 block font-normal">PH: {lead.parentName}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">{lead.grade}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-mono">{lead.phone}</td>
                              <td className="px-4 py-3 font-sans whitespace-nowrap">
                                <select 
                                  value={lead.consultant || 'Cô Thanh Nhàn'}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const val = e.target.value;
                                    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, consultant: val } : l));
                                  }}
                                  className="border border-slate-200 rounded px-1.5 py-0.5 text-[11px] bg-white font-medium text-slate-700 focus:outline-none"
                                >
                                  <option value="Cô Thanh Nhàn">Cô Thanh Nhàn</option>
                                  <option value="Thầy Đức Nam">Thầy Đức Nam</option>
                                  <option value="Thầy Quốc Đạt">Thầy Quốc Đạt</option>
                                  <option value="Cô Minh Tuyết">Cô Minh Tuyết</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-medium text-[11px]">🎈 {lead.source}</td>
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${statusColors}`}>
                                  {lead.stage === 'CONSULTING' ? 'Tư vấn & Lead' 
                                    : lead.stage === 'TESTING' ? 'Thi test' 
                                    : lead.stage === 'RESERVED' ? 'Giữ chỗ' 
                                    : 'Nhập học'}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Lead Action details & Counsel logging per lead */}
                {leads.find(l => l.id === activeLeadId) && (
                  (() => {
                    const activeLead = leads.find(l => l.id === activeLeadId)!;
                    return (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-2 flex-wrap gap-2">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <span>📝</span> Bản lưu tư vấn cho: <strong className="text-emerald-700">{activeLead.studentName || activeLead.name}</strong>
                          </h4>
                          <div className="flex gap-1 flex-wrap">
                            <button 
                              onClick={() => updateLeadStatus(activeLead.id, 'CONSULTING')}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeLead.stage === 'CONSULTING' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                            >
                              Đang tư vấn
                            </button>
                            <button 
                              onClick={() => updateLeadStatus(activeLead.id, 'TESTING')}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeLead.stage === 'TESTING' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                            >
                              Thi test
                            </button>
                            <button 
                              onClick={() => updateLeadStatus(activeLead.id, 'RESERVED')}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeLead.stage === 'RESERVED' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                            >
                              Giữ chỗ
                            </button>
                            <button 
                              onClick={() => updateLeadStatus(activeLead.id, 'ENROLLED')}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeLead.stage === 'ENROLLED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                            >
                              Nhập học
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-650 whitespace-pre-wrap leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-100">
                          {activeLead.notes}
                        </p>

                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Nhập ghi chú phản hồi cuộc gọi, tư vấn học bổng, mối quan tâm..."
                            value={noteInputs[activeLead.id] || ''}
                            onChange={(e) => setNoteInputs({ ...noteInputs, [activeLead.id]: e.target.value })}
                            className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                          <button
                            onClick={() => handleAddNote(activeLead.id)}
                            className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            Ghi chú
                          </button>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Sidebar Quick adding leads UI */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* Add New CRM Lead */}
                <form onSubmit={handleAddLeadSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    Báo cáo Nhận Leads Độc quyền Mới
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Họ tên học sinh</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Hoàng Anh Thư"
                        value={newLeadForm.name}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Họ tên phụ huynh</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ví dụ: Nguyễn Văn Hải"
                        value={newLeadForm.parentName}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, parentName: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Số điện thoại liên hệ</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="Số điện thoại phụ huynh"
                        value={newLeadForm.phone}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                      />
                      {newLeadForm.phone.trim() && leads.some(l => l.phone === newLeadForm.phone.trim()) && (
                        <p className="text-[10px] text-rose-650 font-bold mt-1 animate-pulse">⚠️ Số điện thoại đã tồn tại trên CRM</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Email liên hệ</label>
                      <input 
                        type="email" 
                        placeholder="Ví dụ: parent.email@gmail.com"
                        value={newLeadForm.email}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                      />
                      {newLeadForm.email.trim() && leads.some(l => l.email && l.email.toLowerCase() === newLeadForm.email.trim().toLowerCase()) && (
                        <p className="text-[10px] text-rose-650 font-bold mt-1 animate-pulse">⚠️ Email đã tồn tại trên CRM</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Khối dự tuyển</label>
                        <select
                          value={newLeadForm.grade}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, grade: e.target.value })}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50/50"
                        >
                          {VIETNAM_GRADE_LEVELS.map(level => (
                            <option key={level} value={level}>{level.replace('Lớp', 'Khối')}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Kênh tiếp cận</label>
                        <select
                          value={newLeadForm.source}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50/50"
                        >
                          <option value="Facebook Ads">Facebook Ads</option>
                          <option value="Web Form">Web Form</option>
                          <option value="Hotline">Hotline</option>
                          <option value="Giới thiệu">Giới thiệu</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ghi chú nhu cầu ban đầu</label>
                      <textarea 
                        rows={2}
                        placeholder="Ghi nhận mối quan tâm chuyên sâu..."
                        value={newLeadForm.notes}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Phân bổ Lead vào Hệ thống
                    </button>
                  </div>
                </form>

              </div>
            </div>

            {/* Mass Emailing Campaigns Hub */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-black text-slate-900 text-см flex items-center gap-2">
                  <Mail className="text-emerald-600 w-5 h-5 animate-bounce" />
                  {t.massEmail}
                </h3>
                <p className="text-xs text-slate-500">Tích hợp API email hàng loại, kích hoạt chương trình truyền thông Open Day tới 1000+ phụ huynh.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Form setups on left */}
                <div className="md:col-span-5 space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Chọn mẫu Email chiến dịch</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailTemplate('OPEN_DAY');
                          setEmailSubject('MIS Hà Nội: Thư mời tham dự Open Day - Khơi dậy tiềm năng cùng Đa Trí Tuệ');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between ${
                          emailTemplate === 'OPEN_DAY' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-900' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <strong className="block font-bold">Thư mời Open Day</strong>
                        <span className="text-[9.5px] text-slate-500 block mt-0.5">Xúc tiến tuyển sinh</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEmailTemplate('SCHOLARSHIP');
                          setEmailSubject('MIS School: Chương trình học bổng tìm kiếm tài năng Đa Trí Tuệ (Tinh hoa Toán học & Ngữ văn)');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between ${
                          emailTemplate === 'SCHOLARSHIP' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-900' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <strong className="block font-bold">Học bổng Ươm mầm</strong>
                        <span className="text-[9.5px] text-slate-500 block mt-0.5">Khuyến tài định kỳ 2026</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tiêu đề email (Cầm tay soạn thảo)</label>
                    <input 
                      type="text" 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </div>

                  {emailProgress === 'SENDING' ? (
                    <div className="bg-slate-550/5 border p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                          API Đang đẩy thư hàng loạt...
                        </span>
                        <strong className="font-mono text-emerald-700">{sentCount} / 120 Leads</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(sentCount / 120) * 100}%` }} />
                      </div>
                    </div>
                  ) : emailProgress === 'SENT' ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-2 text-emerald-900">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold">Gửi chiến dịch thư thành công!</p>
                        <p className="text-[10px] text-emerald-700 mt-1">Tổng cộng 120 email tiềm năng đã được gửi thông qua các đối tác liên kết của MIS LMS.</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendMassEmail}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Kích hoạt mass-email qua SMTP API
                    </button>
                  )}
                </div>

                {/* Email template preview inside right */}
                <div className="md:col-span-7 bg-slate-50 rounded-xl p-4.5 border border-slate-150 relative">
                  <span className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 uppercase">Preview</span>
                  <div className="bg-white border p-4 rounded-lg space-y-3 shadow-6xs text-xs text-slate-705">
                    <p className="font-bold text-slate-800">Kính gửi Quý Phụ huynh học sinh,</p>
                    {emailTemplate === 'OPEN_DAY' ? (
                      <div className="space-y-2 leading-relaxed">
                        <p>Trường Phổ thông Liên cấp Đa Trí Tuệ (MIS) hân hoan kính mời quý phụ huynh tới tham dự ngày hội <strong>Open Day 2026</strong> để tiếp cận chương trình giáo dục định hướng cá nhân hóa năng lực học tập thông qua 8 loại hình đa thông thái.</p>
                        <p className="p-2 border-l-2 border-emerald-500 bg-emerald-50 text-[11px] font-medium italic">Thời gian: Thứ bảy, ngày 15 tháng 6 năm 2026 tại khuôn viên nhà trường.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 leading-relaxed">
                        <p>Nhằm phát huy tối đa tư duy Toán, Ngôn ngữ, Nghệ thuật cho học viên năng khiếu, MIS ban hành quỹ học bổng trị giá lên tới <strong>70% học phí</strong> trọn năm học quý báu.</p>
                        <p className="p-2 border-l-2 border-amber-500 bg-amber-50 text-[11px] font-medium italic">Áp dụng cho học sinh có điểm trung bình học thuật đạt từ Khá trở lên.</p>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 mt-4 text-[10.5px] text-slate-400">
                      <p className="font-semibold text-slate-500">Ban Tuyển sinh & Gắn kết Cộng đồng MIS Hà Nội</p>
                      <p>Hệ thống hỗ trợ bởi MIS LMS</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: OPERATIONS, ZOOM CLASSROOM, MCQ & MATH/CHEMISTRY FORMULA EDITOR */}
        {activeTab === 'OPERATIONS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* E-Learning, Scheduled Class hours & Attendance Tracker */}
              <div className="xl:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <BookOpenCheck className="text-emerald-600 w-4.5 h-4.5" />
                        Trung tâm Ôn tập trực tuyến
                      </h3>
                      <p className="text-[10.5px] text-slate-500">
                        Giao bài ôn tập theo lớp, tự chấm trắc nghiệm, theo dõi học sinh chưa nộp và xuất báo cáo gửi giáo viên/phụ huynh.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportReviewReport}
                        className="px-2.5 py-1 text-[10.5px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        Xuất báo cáo
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateReviewForm(prev => !prev)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1 shadow-3xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {showCreateReviewForm ? 'Đóng' : 'Tạo bài ôn tập'}
                      </button>
                    </div>
                  </div>

                  {showCreateReviewForm && (
                    <form onSubmit={handleCreateReviewAssignment} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Tên bài ôn tập</label>
                          <input
                            required
                            value={newReviewData.title}
                            onChange={(e) => setNewReviewData({ ...newReviewData, title: e.target.value })}
                            placeholder="Ví dụ: Ôn tập Toán 10 - Hàm số bậc hai"
                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Môn học</label>
                            <select
                              value={newReviewData.subject}
                              onChange={(e) => setNewReviewData({ ...newReviewData, subject: e.target.value })}
                              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                            >
                              {reviewSubjectOptions.map(subject => (
                                <option key={`${subject.name}-${subject.type}`} value={subject.name}>
                                  {subject.name} ({subject.type})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Lớp</label>
                            <select
                              value={newReviewData.className}
                              onChange={(e) => {
                                const nextSubjects = getSubjectsForClassName(e.target.value);
                                setNewReviewData({
                                  ...newReviewData,
                                  className: e.target.value,
                                  subject: nextSubjects.some(subject => subject.name === newReviewData.subject)
                                    ? newReviewData.subject
                                    : nextSubjects[0]?.name || 'Toán',
                                });
                              }}
                              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                            >
                              {VIETNAM_GRADE_LEVELS.map(level => (
                                <option key={level}>{level}A1</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Deadline</label>
                          <input
                            type="date"
                            value={newReviewData.deadline}
                            onChange={(e) => setNewReviewData({ ...newReviewData, deadline: e.target.value })}
                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Thời gian làm bài</label>
                          <input
                            type="number"
                            min={5}
                            value={newReviewData.durationMinutes}
                            onChange={(e) => setNewReviewData({ ...newReviewData, durationMinutes: Number(e.target.value) })}
                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-2">Chọn câu hỏi từ ngân hàng</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                          {quizQuestions.map(question => {
                            const selected = newReviewData.selectedQuestionIds.includes(question.id);
                            return (
                              <button
                                key={question.id}
                                type="button"
                                onClick={() => toggleReviewQuestion(question.id)}
                                className={`text-left p-2 rounded-lg border text-[11px] transition-all ${
                                  selected
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                                }`}
                              >
                                <span className="block font-bold line-clamp-1">{question.q}</span>
                                <span className="text-[9.5px] text-slate-400">{question.subject || 'Chưa phân môn'} · {question.topic || 'Chưa phân loại'} · {question.difficulty || 'NB'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateReviewForm(false)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Giao bài
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1 space-y-2">
                      {reviewAssignments.map(assignment => {
                        const isActive = assignment.id === activeReview?.id;
                        const submissionCount = reviewSubmissions.filter(item => item.assignmentId === assignment.id).length;
                        return (
                          <button
                            key={assignment.id}
                            type="button"
                            onClick={() => setActiveReviewId(assignment.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                              isActive ? 'border-emerald-500 bg-emerald-50 shadow-3xs' : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                            }`}
                          >
                            <span className="block text-xs font-black text-slate-850 line-clamp-2">{assignment.title}</span>
                            <span className="mt-1 block text-[10px] text-slate-500">{assignment.className} · {assignment.subject} · hạn {assignment.deadline}</span>
                            <span className="mt-2 inline-flex text-[9px] font-bold rounded-full bg-white border border-slate-200 px-2 py-0.5 text-slate-600">
                              {submissionCount} bài đã nộp
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-4">
                      {activeReview && (
                        <>
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <h4 className="text-sm font-black text-slate-900">{activeReview.title}</h4>
                              <p className="text-[10.5px] text-slate-500">
                                {activeReview.className} · {activeReview.subject} · {activeReview.durationMinutes} phút · {activeReviewQuestions.length} câu hỏi
                              </p>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                              activeReview.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {activeReview.status === 'PUBLISHED' ? 'Đang giao' : activeReview.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl bg-white border border-slate-200 p-3">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Hoàn thành</span>
                              <strong className="block text-xl text-emerald-700">{completionRate}%</strong>
                            </div>
                            <div className="rounded-xl bg-white border border-slate-200 p-3">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Điểm TB</span>
                              <strong className="block text-xl text-indigo-700">{averageScore}</strong>
                            </div>
                            <div className="rounded-xl bg-white border border-slate-200 p-3">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Chưa nộp</span>
                              <strong className="block text-xl text-rose-700">{Math.max(activeReviewStudents.length - activeReviewSubmissions.length, 0)}</strong>
                            </div>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                            <table className="w-full text-xs">
                              <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                  <th className="text-left px-3 py-2">Học sinh</th>
                                  <th className="text-left px-3 py-2">Phụ huynh</th>
                                  <th className="text-center px-3 py-2">Trạng thái</th>
                                  <th className="text-center px-3 py-2">Điểm</th>
                                  <th className="text-right px-3 py-2">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {activeReviewStudents.map(student => {
                                  const submission = activeReviewSubmissions.find(item => item.studentId === student.id);
                                  return (
                                    <tr key={student.id}>
                                      <td className="px-3 py-2 font-bold text-slate-800">{student.name}</td>
                                      <td className="px-3 py-2 text-slate-500">{student.parentName}</td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${submission ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                                          {submission ? 'Đã nộp' : 'Chưa nộp'}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center font-mono font-bold text-slate-700">
                                        {submission ? `${submission.score}/100` : '-'}
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        {submission ? (
                                          <span className="text-[10px] text-slate-400">{submission.submittedAt}</span>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleSimulateSubmission(student)}
                                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                                          >
                                            Ghi nhận nộp
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10.5px] text-amber-900">
                            <strong className="block mb-1">Phân tích năng lực:</strong>
                            {Object.keys(topicSummary).length > 0
                              ? `Bài này đang kiểm tra các chủ đề: ${Object.entries(topicSummary).map(([topic, count]) => `${topic} (${count} câu)`).join(', ')}. Hệ thống nên nhắc phụ huynh/học sinh chưa nộp trước deadline và gợi ý ôn lại các chủ đề điểm thấp.`
                              : 'Chưa có câu hỏi để phân tích.'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Visual classrooms list */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <BookOpen className="text-emerald-600 w-4.5 h-4.5" />
                        {t.eLearning}
                      </h3>
                      <p className="text-[10px] text-slate-500">Mở phòng Online Zoom, xuất dữ liệu điểm danh, theo sát giờ dạy giáo viên liên tục.</p>
                    </div>
                    <button
                      onClick={() => setShowAddClassForm(!showAddClassForm)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1 shadow-3xs cursor-pointer"
                    >
                      <span>➕ {showAddClassForm ? "Đóng bản đăng ký" : "Lên lịch Zoom mới"}</span>
                    </button>
                  </div>

                  {/* Add Class Form */}
                  {showAddClassForm && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newClassData.title || !newClassData.teacher) return;
                        const newCls = {
                          id: `ZM10${zoomClasses.length + 3}`,
                          title: newClassData.title,
                          subject: newClassData.subject,
                          teacher: newClassData.teacher,
                          time: newClassData.time,
                          classStatus: newClassData.classStatus,
                          studentsPresent: 0,
                          totalStudents: 30
                        };
                        setZoomClasses([...zoomClasses, newCls]);
                        setNewClassData({ title: '', subject: 'Toán', teacher: '', time: '08:00 - 09:30', classStatus: 'SCHEDULED' });
                        setShowAddClassForm(false);
                      }}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-205 space-y-3 font-sans"
                    >
                      <h4 className="text-xs font-bold text-slate-800">Lên lịch phòng học trực tuyến mới</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Tên phòng học / Chuyên đề</label>
                          <input 
                            type="text" 
                            placeholder="Toán Chuyên sâu hình giải tích..." 
                            value={newClassData.title}
                            onChange={(e) => setNewClassData({...newClassData, title: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Môn học</label>
                            <select 
                              value={newClassData.subject}
                              onChange={(e) => setNewClassData({...newClassData, subject: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            >
                              {ALL_VIETNAM_SUBJECT_NAMES.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block font-sans">Trạng thái</label>
                            <select 
                              value={newClassData.classStatus}
                              onChange={(e) => setNewClassData({...newClassData, classStatus: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                            >
                              <option value="SCHEDULED">Đã Lên lịch</option>
                              <option value="LIVE">Phát trực tiếp</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Tên giảng viên phụ trách</label>
                          <input 
                            type="text" 
                            placeholder="Cô Thanh Nhàn..." 
                            value={newClassData.teacher}
                            onChange={(e) => setNewClassData({...newClassData, teacher: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Giờ dạy dự kiến</label>
                          <input 
                            type="text" 
                            placeholder="08:00 - 09:30" 
                            value={newClassData.time}
                            onChange={(e) => setNewClassData({...newClassData, time: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button 
                          type="button" 
                          onClick={() => setShowAddClassForm(false)}
                          className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Huỷ bỏ
                        </button>
                        <button 
                          type="submit" 
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs font-bold cursor-pointer shadow-3xs"
                        >
                          Tạo buổi học
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {zoomClasses.map(cls => {
                      const isLive = cls.classStatus === 'LIVE';
                      const isActiveView = zoomActiveId === cls.id;

                      return (
                        <div 
                          key={cls.id}
                          className={`p-4 border rounded-2xl transition-all ${
                            isActiveView 
                              ? 'border-emerald-600 bg-emerald-500/5 shadow-2xs' 
                              : 'border-slate-150 hover:border-slate-250 bg-slate-50/25'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <div className="space-y-1">
                              <span className={`text-[8.5px] px-2 py-0.5 font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                                isLive ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                              }`}>
                                <Video className="w-2.5 h-2.5" />
                                {isLive ? 'Trực tiếp lớp học' : 'Lên lịch học'}
                              </span>

                              <h4 className="font-bold text-xs text-slate-800">{cls.title}</h4>
                              <p className="text-[10.5px] text-slate-500 font-sans">
                                Giảng viên: <strong className="text-slate-700">{cls.teacher}</strong> | Giờ dạy: {cls.time}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {isLive ? (
                                <button
                                  onClick={() => setZoomActiveId(isActiveView ? null : cls.id)}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  Vào học Zoom trực tuyến
                                </button>
                              ) : (
                                <button
                                  onClick={() => alert("Phòng học chưa mở. Bạn chỉ có thể kích hoạt khi tới thời gian chỉ định.")}
                                  className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-bold rounded-xl transition-colors"
                                >
                                  Mở Link lịch học
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Student Attendance tracker list below class drawer */}
                          {isActiveView && (
                            <div className="mt-4 pt-3 border-t border-slate-200/60 animate-scale-up space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">📝 Bảng điểm danh tự động kết nối API Zoom:</span>
                                <span className="text-[10px] text-emerald-700 font-semibold">Tích hợp AI nhận diện gương mặt</span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                                {[
                                  { id: 'std1', name: 'Nguyễn Minh Quân' },
                                  { id: 'std2', name: 'Trần Mỹ Lệ' },
                                  { id: 'std3', name: 'Phạm Hồng Thái' },
                                  { id: 'std4', name: 'Hoàng Thùy Dương' }
                                ].map(std => {
                                  const isPresent = attendanceLogs[std.id] ?? false;
                                  return (
                                    <div 
                                      key={std.id}
                                      onClick={() => setAttendanceLogs({ ...attendanceLogs, [std.id]: !isPresent })}
                                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                        isPresent ? 'bg-emerald-500/5 border-emerald-200 text-slate-800 font-semibold' : 'bg-rose-500/5 border-rose-200 text-slate-600'
                                      }`}
                                    >
                                      <span>{std.name}</span>
                                      <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-rose-550'}`} />
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-200 text-[10px] text-emerald-800 leading-snug">
                                <strong>✓ Điểm danh hoàn tất:</strong> Đã ghi nhận 3/4 học viên có mặt trong luồng Zoom học thuật. Báo cáo chấm công dạy học tự động cộng 1.5 giờ công cho {cls.teacher}.
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Teachers load hours metrics substitute system */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <Calendar className="text-emerald-600 w-4.5 h-4.5" />
                      Lịch dạy & Đăng ký dạy bù học kỳ II
                    </h3>
                    <p className="text-[10.5px] text-slate-500">Giám sát tải công việc, phân vai nghỉ phép hoặc bù tiết kịp thời.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-150 rounded-xl space-y-2">
                      <span className="text-[9px] uppercase tracking-wide font-bold text-amber-600">Đơn xin nghỉ - dạy thế</span>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">Cô Thanh Nhàn đề nghị nghỉ thứ 6 (05/6) nghỉ phép cá nhân.</p>
                      <p className="text-[10.5px] text-slate-500">Người dạy thế đề xuất: <strong>Thầy Đức Nam</strong></p>
                      <div className="flex gap-1.5 pt-1">
                        <button 
                          onClick={() => alert("Đã duyệt bàn giao lịch phân tổ thành công.")}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded"
                        >
                          Phê duyệt
                        </button>
                        <button 
                          onClick={() => alert("Vui lòng nhập lý do từ chối.")}
                          className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-300"
                        >
                          Khước từ
                        </button>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-150 rounded-xl space-y-2">
                      <span className="text-[9px] uppercase tracking-wide font-bold text-emerald-600">Hàng tuần: Định mức dạy</span>
                      <div className="space-y-1.5 text-[11px] font-sans">
                        <div className="flex justify-between text-slate-700">
                          <span>Cô Thanh Nhàn:</span>
                          <strong>42 / 40 giờ dạy chuẩn ✓</strong>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Thầy Đức Nam:</span>
                          <strong>50 / 40 giờ dạy (Over 10h) ⏰</strong>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Thầy Quốc Đạt:</span>
                          <strong>38 / 40 giờ dạy (-2h) ⚠️</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Online MCQ grading exam & Math components */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Math/Physics/Chemistry visual editor */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <Calculator className="text-emerald-600 w-4.5 h-4.5" />
                      {t.mathEditor}
                    </h3>
                    <p className="text-[10px] text-slate-500">Người dạy có thể nhấp chọn nhanh ký hiệu để chèn công thức chuyên khoa vào ngân hàng câu hỏi đề thi.</p>
                  </div>

                  {/* Math buttons grid */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Tích phân', code: '\\int_{a}^{b} f(x) dx' },
                        { label: 'Tổng x', code: '\\sum_{i=1}^{n}' },
                        { label: 'Căn thức', code: '\\sqrt{x}' },
                        { label: 'Phân số', code: '\\frac{a}{b}' },
                        { label: 'Lim', code: '\\lim_{x \\to \\infty}' },
                        { label: 'Đạo hàm', code: '\\frac{dy}{dx}' },
                        { label: 'Mũ', code: 'x^{2}' },
                        { label: 'Phương trình', code: 'H_2O + CO_2' }
                      ].map((btn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertMathSnippet(btn.code)}
                          className="p-1 px-1.5 border border-slate-200 hover:border-indigo-400 bg-slate-50 text-[10px] hover:text-indigo-700 font-mono rounded text-center transition-all truncate"
                          title={btn.code}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mã cấu trúc công thức soạn thảo:</span>
                      <textarea
                        rows={2}
                        value={equationCode}
                        onChange={(e) => setEquationCode(e.target.value)}
                        className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 resize-none"
                      />
                    </div>

                    {/* Math Render Output */}
                    {renderMathPreview()}
                  </div>
                </div>

                {/* MCQ test interactive preview */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <Bookmark className="text-emerald-600 w-4.5 h-4.5" />
                        {t.mcqTest}
                      </h3>
                      <p className="text-[10px] text-slate-500">Mô phỏng bài thi thử năng lực Đa Trí Tuệ trực tuyến - Chấm điểm trực tiếp.</p>
                    </div>
                    <button
                      onClick={() => setShowAddMcqForm(!showAddMcqForm)}
                      className="px-2 py-0.5 border border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-[10.5px] font-bold rounded-lg cursor-pointer"
                    >
                      <span>{showAddMcqForm ? "Đóng ẩn" : "➕ Thêm câu hỏi"}</span>
                    </button>
                  </div>

                  {/* Add MCQ Form */}
                  {showAddMcqForm && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newMcqData.q || !newMcqData.A || !newMcqData.B || !newMcqData.C) return;
                        const newQ = {
                          id: quizQuestions.length + 1,
                          q: newMcqData.q,
                          options: [
                            { label: 'A', text: newMcqData.A },
                            { label: 'B', text: newMcqData.B },
                            { label: 'C', text: newMcqData.C }
                          ],
                          correct: newMcqData.correct,
                          subject: newMcqData.subject,
                          grade: newMcqData.grade,
                          topic: newMcqData.topic || 'Chưa phân loại',
                          difficulty: newMcqData.difficulty,
                          explanation: newMcqData.explanation
                        };
                        setQuizQuestions([...quizQuestions, newQ]);
                        setNewMcqData({
                          q: '',
                          A: '',
                          B: '',
                          C: '',
                          correct: 'A',
                          subject: 'Toán',
                          grade: 'Lớp 10',
                          topic: '',
                          difficulty: 'NB',
                          explanation: '',
                        });
                        setShowAddMcqForm(false);
                      }}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 space-y-3 font-sans"
                    >
                      <h4 className="text-xs font-bold text-slate-850">Biên soạn câu hỏi mới</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-450 block">Nội dung câu hỏi</label>
                        <input
                          type="text"
                          placeholder="Nhập câu hỏi (Ví dụ: 8% của 200 bằng bao nhiêu?)..."
                          value={newMcqData.q}
                          onChange={(e) => setNewMcqData({...newMcqData, q: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450">Môn học</label>
                          <select
                            value={newMcqData.subject}
                            onChange={(e) => setNewMcqData({...newMcqData, subject: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          >
                            {ALL_VIETNAM_SUBJECT_NAMES.map(subject => (
                              <option key={subject}>{subject}</option>
                            ))}
                            <option>Kỹ năng sống</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450">Khối lớp</label>
                          <select
                            value={newMcqData.grade}
                            onChange={(e) => setNewMcqData({...newMcqData, grade: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          >
                            {VIETNAM_GRADE_LEVELS.map(level => (
                              <option key={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450">Mức độ</label>
                          <select
                            value={newMcqData.difficulty}
                            onChange={(e) => setNewMcqData({...newMcqData, difficulty: e.target.value as 'NB' | 'TH' | 'VD'})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          >
                            <option value="NB">Nhận biết</option>
                            <option value="TH">Thông hiểu</option>
                            <option value="VD">Vận dụng</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450">Chủ đề</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Đọc hiểu, Hàm số, Từ vựng..."
                            value={newMcqData.topic}
                            onChange={(e) => setNewMcqData({...newMcqData, topic: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450">Lời giải ngắn</label>
                          <input
                            type="text"
                            placeholder="Giải thích đáp án để học sinh xem lại"
                            value={newMcqData.explanation}
                            onChange={(e) => setNewMcqData({...newMcqData, explanation: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450">Lịch chọn A</label>
                          <input
                            type="text"
                            placeholder="Giá trị A"
                            value={newMcqData.A}
                            onChange={(e) => setNewMcqData({...newMcqData, A: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450">Lịch chọn B</label>
                          <input
                            type="text"
                            placeholder="Giá trị B"
                            value={newMcqData.B}
                            onChange={(e) => setNewMcqData({...newMcqData, B: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450">Lịch chọn C</label>
                          <input
                            type="text"
                            placeholder="Giá trị C"
                            value={newMcqData.C}
                            onChange={(e) => setNewMcqData({...newMcqData, C: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-500">Kích hoạt đáp án đúng:</span>
                          <select
                            value={newMcqData.correct}
                            onChange={(e) => setNewMcqData({...newMcqData, correct: e.target.value})}
                            className="bg-white border rounded text-xs px-2 py-0.5"
                          >
                            <option value="A">Đáp án A</option>
                            <option value="B">Đáp án B</option>
                            <option value="C">Đáp án C</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddMcqForm(false)}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Huỷ bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs font-bold cursor-pointer"
                          >
                            Nạp câu hỏi
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {quizQuestions.map((q) => (
                      <div key={q.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 space-y-2">
                        <span className="text-[9.5px] uppercase font-bold bg-indigo-50 border text-indigo-700 px-1.5 py-0.5 rounded">
                          Câu hỏi {q.id}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">{q.subject || 'Chưa phân môn'}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">{q.grade || 'Chưa khối'}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">{q.topic || 'Chưa chủ đề'}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{q.difficulty || 'NB'}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed font-sans">{q.q}</p>
                        
                        <div className="space-y-1.5">
                          {q.options.map(o => (
                            <label 
                              key={o.label} 
                              className={`flex items-start gap-2 p-1.5 px-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                userQuizAnswers[q.id] === o.label 
                                  ? 'border-emerald-600 bg-emerald-50/20 font-medium text-emerald-900' 
                                  : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-705'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                checked={userQuizAnswers[q.id] === o.label}
                                onChange={() => setUserQuizAnswers({ ...userQuizAnswers, [q.id]: o.label })}
                                className="mt-1 accent-emerald-600"
                              />
                              <span><strong>{o.label}.</strong> {o.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      {quizScore !== null ? (
                        <div className="text-xs space-y-0.5">
                          <p className="font-bold text-slate-800">
                            Kết quả thi: {quizScore}/100 Điểm
                          </p>
                          <p className="text-[10px] text-slate-450 italic">
                            {quizScore >= 100 ? 'Chúc mừng! Đạt chuẩn khen thưởng Đa Trí Tuệ.' : 'Đề nghị liên hệ hỗ trợ nâng điểm học thuật.'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Chọn phương án và bấm chấm điểm...</span>
                      )}

                      <button
                        type="button"
                        onClick={handleEvaluateQuiz}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-sm cursor-pointer"
                      >
                        Chấm Điểm Tự Động
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: FINANCIALS, TUITION INVOICE, PAYROLL CALCULATION & GRAD CERTIFICATE */}
        {activeTab === 'FINANCIALS' && isFinanceAuthorized && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              
              {/* Tuition Tracking Table */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Student Tuitions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <DollarSign className="text-emerald-600 w-4.5 h-4.5 animate-pulse" />
                        {t.tuition}
                      </h3>
                      <p className="text-[10.5px] text-slate-500">Mã hóa hóa đơn tài chính tự động cho từng đối tượng học viên liên cấp.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportInvoicesCsv}
                        className="px-2.5 py-1 text-[10.5px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 no-print"
                        title="Xuất danh sách hóa đơn ra Excel/CSV"
                        type="button"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Xuất Excel</span>
                      </button>

                      <button
                        onClick={() => setShowAddInvoiceForm(!showAddInvoiceForm)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1 shadow-3xs cursor-pointer no-print"
                        type="button"
                      >
                        <span>➕ {showAddInvoiceForm ? "Đóng ẩn" : "Lập Hóa Đơn"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Invoice Form */}
                  {showAddInvoiceForm && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newInvoiceData.student || !newInvoiceData.amount) return;
                        const nextId = tuitionFees.length + 1;
                        const newInv = {
                          id: `HV00${nextId}`,
                          student: newInvoiceData.student,
                          amount: newInvoiceData.amount,
                          deadline: newInvoiceData.deadline,
                          status: newInvoiceData.status,
                          invoiceNo: `INV-2026-00${nextId}`,
                          paidDate: newInvoiceData.status === 'DA_DONG' ? new Date().toISOString().substring(0, 10) : undefined
                        };
                        setTuitionFees([...tuitionFees, newInv]);
                        setNewInvoiceData({ student: '', amount: '12,500,000đ', deadline: '2026-06-20', status: 'CHO_DONG' });
                        setShowAddInvoiceForm(false);
                      }}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 space-y-3 font-sans"
                    >
                      <h4 className="text-xs font-bold text-slate-850">Lập phiếu yêu cầu học phí mới</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450 block">Tên học sinh thụ hưởng</label>
                          <input
                            type="text"
                            placeholder="Tống Khánh Đăng..."
                            value={newInvoiceData.student}
                            onChange={(e) => setNewInvoiceData({...newInvoiceData, student: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-850 font-medium"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-450 block font-sans">Định mức thu</label>
                            <input
                              type="text"
                              value={newInvoiceData.amount}
                              onChange={(e) => setNewInvoiceData({...newInvoiceData, amount: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-850 font-semibold"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-450 block">Hạn nộp</label>
                            <input
                              type="date"
                              value={newInvoiceData.deadline}
                              onChange={(e) => setNewInvoiceData({...newInvoiceData, deadline: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-850"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-500">Trạng thái phiếu:</span>
                          <select
                            value={newInvoiceData.status}
                            onChange={(e) => setNewInvoiceData({...newInvoiceData, status: e.target.value})}
                            className="bg-white border rounded text-xs px-2 py-0.5"
                          >
                            <option value="CHO_DONG">Chưa thu (CHO_DONG)</option>
                            <option value="DA_DONG">Đã đóng (DA_DONG)</option>
                            <option value="QUA_HAN">Quá hạn (QUA_HAN)</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddInvoiceForm(false)}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Huỷ bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs font-bold cursor-pointer shadow-3xs"
                          >
                            Lập phiếu học phí
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto rounded-xl border border-slate-150">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                          <th className="px-4 py-2.5">Học viên</th>
                          <th className="px-4 py-2.5">Số hóa đơn</th>
                          <th className="px-4 py-2.5">Định mức học phí</th>
                          <th className="px-4 py-2.5">Hạn thanh toán</th>
                          <th className="px-4 py-2.5">Trạng thái</th>
                          <th className="px-4 py-2.5 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tuitionFees.map(item => {
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-800">👤 {item.student}</td>
                              <td className="px-4 py-3 font-mono text-slate-600 font-medium">{item.invoiceNo}</td>
                              <td className="px-4 py-3 font-semibold text-slate-700">{item.amount}</td>
                              <td className="px-4 py-3 font-mono text-slate-500">{item.deadline}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={item.status}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value;
                                    setTuitionFees(prev => prev.map(t => t.id === item.id ? { ...t, status: nextStatus } : t));
                                  }}
                                  className={`text-[10.5px] px-1.5 py-0.5 rounded font-bold uppercase cursor-pointer border ${
                                    item.status === 'DA_DONG' ? 'bg-emerald-100 text-emerald-800 border-emerald-305'
                                      : item.status === 'CHO_DONG' ? 'bg-amber-100 text-amber-805 border-amber-305'
                                      : 'bg-rose-100 text-rose-800 border-rose-305'
                                  }`}
                                >
                                  <option value="CHO_DONG">Chưa thu</option>
                                  <option value="DA_DONG">Đã nộp</option>
                                  <option value="QUA_HAN">Quá hạn</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-right text-slate-700 font-sans">
                                <button
                                  type="button"
                                  onClick={() => setSelectedInvoice(item)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-700 rounded text-[10px] text-slate-650 font-bold transition-all cursor-pointer"
                                >
                                  In Phiếu
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Visual printed invoice mock modal preview */}
                  {selectedInvoice && (
                    <div className="bg-slate-50 border-2 border-dashed border-emerald-500/30 p-5 rounded-xl space-y-4 animate-scale-up relative">
                      <button 
                        onClick={() => setSelectedInvoice(null)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
                      >
                        ✕ Đóng
                      </button>

                      <div className="text-center font-sans">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">HÓA ĐƠN THU TIỀN HỌC PHÍ MẪU</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Mã kiểm duyệt: {selectedInvoice.invoiceNo}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-b border-slate-200 py-3 font-sans">
                        <div>
                          <span className="text-slate-400">Đơn vị nhận tiền:</span>
                          <strong className="block text-slate-800">Trường phổ thông liên cấp MIS</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Học sinh thụ hưởng:</span>
                          <strong className="block text-slate-800">{selectedInvoice.student}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Loại khoản thu:</span>
                          <strong className="block text-slate-800">Học bổng & Học phí học kỳ II</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Số tiền:</span>
                          <strong className="block text-emerald-700 font-bold">{selectedInvoice.amount}</strong>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-450">✓ Hệ thống hóa đơn điện tử tự động kết nối chi cục thuế.</span>
                        <button 
                          onClick={printSelectedInvoice}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          Gửi Đi & In Ấn
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Regional revenue reports overview KPI ratings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <TrendingUp className="text-emerald-600 w-4.5 h-4.5" />
                      Doanh thu & Đánh giá thành tích các chi nhánh tuyển sinh
                    </h3>
                    <p className="text-[10px] text-slate-500">Giúp chủ quản phân tích hiệu năng đóng góp thực của các tổ, ban trực thuộc.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Tổng Doanh Thu Quý II</span>
                      <strong className="text-base text-emerald-700 font-bold block mt-1">1.82 tỷ VND</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Mục tiêu: 2.00 tỷ VNĐ (91%)</span>
                    </div>

                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Xếp hạng Chi nhánh MIS</span>
                      <strong className="text-sm text-indigo-700 font-bold block mt-1">🥇 Tổ Toán - Tin (Đầu bảng)</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Học phí thu khớp: 840 triệu</span>
                    </div>

                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Chi phí chuyên môn</span>
                      <strong className="text-base text-slate-700 font-bold block mt-1">456 triệu VND</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Bao gồm lương bổ sung & Zoom</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Personnel payroll calculation & certificates on right */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* Automated HR Payroll calculation */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <Calculator className="text-emerald-600 w-4.1 h-4.1" />
                      {t.personnel}
                    </h3>
                    <p className="text-[10px] text-slate-500">Thuế thu nhập, bảo hiểm xã hội tính tự động tích hợp từ biểu giảng viên.</p>
                  </div>

                  {/* Interactive salary slider tweak */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-700 uppercase">Đơn giá/giờ dạy:</span>
                      <strong className="font-mono text-emerald-700">{(baseSalaryRate).toLocaleString()} VNĐ/Giờ</strong>
                    </div>
                    <input 
                      type="range"
                      min={150000}
                      max={600000}
                      step={50000}
                      value={baseSalaryRate}
                      onChange={(e) => setBaseSalaryRate(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3">
                    {teachersPayroll.map(teacher => {
                      // Wage math: Base pay + hours*rate + substitute_hours*rate*1.2
                      const calculatedBonus = (teacher.teachingHours * baseSalaryRate) + (teacher.substitutionHours * baseSalaryRate * 1.2);
                      const grossSalary = teacher.basePay + calculatedBonus;
                      
                      // Ins / tax deduction math
                      const insuranceDeduction = grossSalary * 0.105; // 10.5% BHXH, BHYT
                      const calculatedTax = Math.max(0, (grossSalary - 11000000) * 0.05); // Simplify PIT 5% above 11m
                      const netSalary = grossSalary - insuranceDeduction - calculatedTax;

                      return (
                        <div key={teacher.id} className="p-3 border border-slate-150 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <strong className="text-xs text-slate-800 block">👤 {teacher.name}</strong>
                            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-800 px-1.5 py-0.5 rounded">
                              Thực nhận: {Math.round(netSalary / 1000).toLocaleString()}k
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 leading-snug">
                            <div>Lương cứng: <span className="font-semibold text-slate-700">{(teacher.basePay/1000).toLocaleString()}k</span></div>
                            <div>Giờ giảng bù: <span className="font-semibold text-indigo-700">+{Math.round(calculatedBonus/1000).toLocaleString()}k</span></div>
                            <div>Dành cho thuế: <span className="font-semibold text-rose-500">-{Math.round(calculatedTax/1000).toLocaleString()}k</span></div>
                            <div>Đóng bảo hiểm: <span className="font-semibold text-indigo-900">-{Math.round(insuranceDeduction/1000).toLocaleString()}k</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Graduation Certificate Granting */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <Award className="text-emerald-600 w-4.5 h-4.5" />
                      {t.certs}
                    </h3>
                    <p className="text-[10px] text-slate-500">Cấp pháp chứng chỉ liên cấp sau khi học sinh xuất sắc vượt kỳ khảo thí trắc nghiệm tự động.</p>
                  </div>

                  <div className="space-y-2.5">
                    {certStudents.map(c => {
                      const isPending = c.status === 'PENDING';

                      return (
                        <div key={c.id} className="p-3 bg-slate-50/80 border border-slate-150 rounded-xl space-y-1.5 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-slate-800 font-semibold">{c.name}</strong>
                              <span className="text-[10px] text-slate-500 block truncate mt-0.5 max-w-[150px]">{c.courseName}</span>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded ${
                              isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isPending ? 'Đang duyệt' : 'Đã Cấp'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                            <span className="text-[10px] text-slate-450 font-mono">Điểm khóa: {c.grade}/10</span>
                            {isPending ? (
                              <button
                                onClick={() => {
                                  const code = `MIS-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
                                  setCertStudents(prev => prev.map(item => item.id === c.id ? { ...item, status: 'ISSUED', certCode: code } : item));
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded text-[9.5px] font-bold transition-all cursor-pointer"
                              >
                                Phê duyệt Cấp
                              </button>
                            ) : (
                              <button
                                onClick={() => setActiveCert(c)}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[9.5px] font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                Xem Bằng
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Certificate high-fidelity layout display box */}
                  {activeCert && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
                      <div className="bg-white border-8 border-amber-900 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative">
                        <button 
                          onClick={() => setActiveCert(null)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
                        >
                          ✕ Đóng
                        </button>

                        <div className="border border-amber-100/30 p-4 space-y-4">
                          <span className="text-[10px] text-amber-900 font-extrabold uppercase tracking-widest block">GIẤY CHỨNG NHẬN ĐA TRÍ TUỆ</span>
                          
                          <div className="py-2">
                            <h4 className="text-slate-500 font-normal italic text-xs">Chứng nhận học viên:</h4>
                            <h2 className="text-xl font-display font-black text-amber-950 mt-1">{activeCert.name}</h2>
                          </div>

                          <div className="text-xs leading-relaxed text-slate-755 font-serif px-4">
                            Đã hoàn thành xuất sắc học phần chuyên sâu <strong className="text-slate-800 block mt-1">"{activeCert.courseName}"</strong>
                            Đạt xếp loại vượt bậc trong kỳ thi kết thúc học trình liên cấp của MIS.
                          </div>

                          <div className="flex justify-between items-center text-[9.5px] border-t border-amber-950/10 pt-4 font-sans text-slate-450">
                            <div>
                              <span>Được chứng thực từ MIS LMS</span>
                              <span className="block font-mono font-bold mt-0.5">Số: {activeCert.certCode}</span>
                            </div>
                            <div className="text-center font-bold text-amber-900">
                              <span>CHỦ TỊCH HỘI ĐỒNG MIS HÀ NỘI</span>
                              <span className="block italic font-serif text-slate-600 mt-2">[Đã đóng dấu điện tử]</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => downloadCertificate(activeCert)}
                          className="w-full py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          Tải Bằng Tốt Nghiệp PDF
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 4: ANTI-DOWNLOAD VIDEO GUARD & TECHNOLOGY INFRASTRUCTURE */}
        {activeTab === 'SECURITY_UX' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            
            {/* Anti-Download Guard controls container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <span className="px-2 py-0.5 bg-rose-150 text-rose-800 text-[9px] font-extrabold rounded uppercase tracking-wider mb-1.5 inline-block">
                  🛡️ BẢO MẬT ĐỘC QUYỀN TRUYỀN THÔNG BÀI GIẢNG VIDEO
                </span>
                <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
                  <Lock className="text-emerald-600 w-4.5 h-4.5 animate-bounce" />
                  {t.antiDownload}
                </h3>
                <p className="text-xs text-slate-500">
                  Cơ chế thiết lập máy chủ ngăn chặn mọi hành vi cài đặt các chương trình tải lậu video học liệu độc quyền của giáo viên Trường MIS Hà Nội.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="space-y-0.5">
                    <strong className="text-xs text-slate-800 block">Kích hoạt Chặn Download Trực Tiếp (Secure DRM Video Server)</strong>
                    <span className="text-[10px] text-slate-500 font-normal">Sử dụng phương thức phân dải segment tệp HLS/Encrypted TS chặn các extension Cốc Cốc, IDM tự chụp.</span>
                  </div>
                  
                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !disableMainDownload;
                      setDisableMainDownload(nextVal);
                      addSecurityLog(nextVal ? "Secure DRM Shield KÍCH HOẠT - Tự động băm tệp .ts tránh extension tải trộm." : "Secure DRM Shield VÔ HIỆU HÓA - Tệp học liệu mất bảo mật trực tiếp.");
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      disableMainDownload ? 'bg-emerald-600' : 'bg-slate-250'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      disableMainDownload ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Thời gian hết hạn URL tạm thời (Expires token link):</span>
                    <span className="text-emerald-700 font-mono font-bold">{tokenExpirationTime} Phút</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={tokenExpirationTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTokenExpirationTime(val);
                      addSecurityLog(`Cập nhật thời hạn bắt tay token sang: ${val} phút.`);
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    Sau thời gian hết hạn này, token bảo mật gán kèm tệp .m3u8 bài giảng sẽ vô hiệu hóa hoàn toàn, bắt buộc trình duyệt của phụ huynh / học sinh kéo yêu cầu bắt tay mới.
                  </p>
                </div>

                <div className="bg-slate-900 text-white font-mono p-4 rounded-xl text-[10.5px] leading-relaxed relative border border-slate-800">
                  <span className="absolute top-2 right-2 text-[8px] bg-emerald-600 text-white font-black px-1 rounded animate-pulse">PROTECTED API</span>
                  <div className="space-y-1 text-emerald-400">
                    <p className="text-slate-500"># MIS SafeVideo HTTP Headers Security Config:</p>
                    <p>HTTP/1.1 200 OK</p>
                    <p>Content-Type: application/vnd.apple.mpegurl</p>
                    <p>X-Content-Type-Options: nosniff</p>
                    <p>Content-Security-Policy: media-src 'self' blob:;</p>
                    <p>X-Mis-DRM-Shield: BlockedDownloadRequests={disableMainDownload ? "true" : "false"}</p>
                  </div>
                </div>

                {/* Live Security Audit Logs Terminal */}
                <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl text-[10.5px] leading-relaxed font-mono text-emerald-400/95 space-y-1 mt-2.5">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5 text-[9px] text-slate-500 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                      NHẬT KÝ KIỂM TOÁN AN NINH MẠNG (LIVE AUDIT TRAIL)
                    </span>
                    <span>UTC+7 PROD SHIELD</span>
                  </div>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                    {securityLogs.map((log, index) => {
                      const isAlert = log.includes("VÔ HIỆU HÓA");
                      const isSuccess = log.includes("KÍCH HOẠT");
                      return (
                        <p 
                          key={index} 
                          className={isAlert ? 'text-rose-400' : isSuccess ? 'text-emerald-400 font-bold' : 'text-emerald-500/80'}
                        >
                          {log}
                        </p>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSecurityStatus('UPDATING');
                      addSecurityLog("Đang kết nối để đẩy chính sách bảo mật lên cơ sở dữ liệu học liệu...");
                      setTimeout(() => {
                        setSecurityStatus('ACTIVE');
                        addSecurityLog("Đồng bộ chính sách an ninh thành công tới các cụm máy chủ phân phối tệp.");
                      }, 800);
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-center"
                  >
                    {securityStatus === 'UPDATING' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Đang áp dụng chính sách...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Cập nhật Máy chủ Độc quyền
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Cross-platform UX & Infrastructure summaries */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-extrabold rounded uppercase tracking-wider mb-1.5 inline-block">
                  📱 CÔNG NGHỆ ĐA NỀN TẢNG HYBRID NATIVE APP
                </span>
                <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
                  <Tv className="text-emerald-600 w-4.5 h-4.5" />
                  Môi trường Khám phá dành cho Phụ huynh & Giáo viên
                </h3>
                <p className="text-xs text-slate-500">
                  Đồng bộ tức thời dữ liệu học thuật từ cổng Web-app chính nhiệm tới các thiết bị ứng dụng di động iOS/Android nhanh chóng.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1 text-xs">
                  <strong className="text-indigo-900 font-bold block flex items-center gap-1">
                    <span>📱</span> App di động cho Giáo viên (iOS & Android)
                  </strong>
                  <p className="text-indigo-800 font-normal leading-relaxed text-[11px]">
                    Giúp giáo viên nhanh chóng điểm danh tức thời khi bước vào lớp Zoom trực tiếp, chụp ảnh sổ đầu bài đưa lên đám mây, nhận chỉ đạo hành chính khẩn từ Ban Giám hiệu MIS.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1 text-xs">
                  <strong className="text-emerald-900 font-bold block flex items-center gap-1 flex-wrap">
                    <span>👪</span> App di động cho Phụ huynh học sinh (Gắn kết Gia đình)
                  </strong>
                  <p className="text-emerald-800 font-normal leading-relaxed text-[11px]">
                    Xem nhanh tiền đóng học phí định kỳ, nhận hóa đơn in sẵn từ phân hệ Tài chính, theo dõi bảng chấm điểm trắc nghiệm trực tuyến tự động và lịch sử điểm danh của con nhỏ.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <div className="p-1 bg-white rounded shadow-4xs shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-[10px] leading-relaxed text-slate-600 font-sans">
                    <strong>Hệ thống sẵn dùng tiếng Anh & tiếng Việt:</strong> Giao diện ngôn ngữ tự động thay đổi các thẻ hiển thị tại góc trên cùng bên phải. Điều này hoàn hảo cho các trường học có cán bộ quốc tế cộng tác, hướng tới định vị trường học liên cấp MIS toàn cầu hóa.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
