import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  CalendarCheck, 
  CreditCard, 
  HeartPulse, 
  BookOpen, 
  LogOut, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  BookOpenText, 
  ChevronRight, 
  ClipboardList, 
  Menu, 
  X, 
  Bell, 
  FileText,
  LayoutDashboard,
  Printer,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { UserProfile, AcademicYearRecord, HealthIncident, VaccinationRecord, BorrowLog } from '../types';
import { encryptData, decryptData } from '../utils/security';

interface ParentStudentPortalProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

// Secure local storage helpers — data is encrypted at rest
function readStored<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    // Try decrypting first; falls back to plain JSON for backward compatibility
    const decrypted = decryptData(saved);
    if (decrypted !== null) return decrypted as T;
    return fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, data: any): void {
  localStorage.setItem(key, encryptData(data));
}

const calculateDays = (start: string, end: string) => {
  try {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  } catch {
    return 1;
  }
};

const formatDateVN = (dateStr: string) => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return dateStr;
};

const formatDateTimeVN = (dateTimeStr: string) => {
  if (!dateTimeStr) return '';
  // Match YYYY-MM-DD HH:MM
  const match = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
  }
  return dateTimeStr;
};

const DEFAULT_PORTAL_STUDENT = {
  id: 'student_gen_1',
  code: 'MIS-10A1-001',
  name: 'Nguyễn Minh Quân',
  className: '10A1',
  avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
  scholarship: 'Không',
  awards: ['Học sinh tích cực trong hoạt động lớp'],
  healthNote: 'Bình thường',
  academicHistory: [],
};

export default function ParentStudentPortal({ currentUser, onLogout }: ParentStudentPortalProps) {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TIMETABLE' | 'TRANSCRIPTS' | 'ATTENDANCE' | 'BILLING' | 'HEALTH' | 'LIBRARY' | 'LMS' | 'LEAVE' | 'FEEDBACK'>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read data synced with SIS
  const students = useMemo(() => readStored<any[]>('mis_sis_students_v3', []), []);
  const [grades, setGrades] = useState<any[]>(() => readStored<any[]>('mis_sis_grades_v3', []));
  const attendance = useMemo(() => readStored<any[]>('mis_sis_attendance_v3', []), []);
  const notices = useMemo(() => readStored<any[]>('mis_sis_parent_notices_v3', []), []);
  const borrowLogs = useMemo(() => readStored<BorrowLog[]>('mis_borrow_logs_v3', []), []);
  
  // Find associated student
  const student = useMemo(() => {
    if (currentUser.role === 'STUDENT') {
      return students.find(s => s.code === currentUser.studentCode) || students[0];
    }
    if (currentUser.role === 'PARENT') {
      return students.find(s => s.parentEmail === currentUser.parentEmail) || students[0];
    }
    return students[0] || DEFAULT_PORTAL_STUDENT;
  }, [students, currentUser]);

  // Automatically populate rich, realistic grades if the student has fewer than 5 subjects
  useEffect(() => {
    if (!student) return;
    const currentStudentGrades = grades.filter(g => g.studentId === student.id);
    if (currentStudentGrades.length < 5) {
      const richSubjectGrades = [
        { subject: 'Toán', oral: 8.5, fifteenMinute: 9.0, midterm: 8.5, final: 9.0 },
        { subject: 'Ngữ văn', oral: 8.0, fifteenMinute: 7.5, midterm: 8.0, final: 8.5 },
        { subject: 'Vật lí', oral: 9.0, fifteenMinute: 8.5, midterm: 9.0, final: 8.5 },
        { subject: 'Hóa học', oral: 7.5, fifteenMinute: 8.0, midterm: 7.5, final: 8.0 },
        { subject: 'Sinh học', oral: 8.0, fifteenMinute: 8.5, midterm: 8.0, final: 9.0 },
        { subject: 'Lịch sử', oral: 9.0, fifteenMinute: 9.0, midterm: 8.5, final: 9.0 },
        { subject: 'Địa lí', oral: 8.5, fifteenMinute: 8.0, midterm: 8.5, final: 8.0 },
        { subject: 'Ngoại ngữ 1', oral: 9.5, fifteenMinute: 9.0, midterm: 9.5, final: 9.5 },
        { subject: 'Tin học', oral: 9.0, fifteenMinute: 9.5, midterm: 9.0, final: 9.5 },
        { subject: 'GD Kinh tế & Pháp luật', oral: 8.0, fifteenMinute: 8.5, midterm: 8.0, final: 8.0 },
        { subject: 'Tiếng Trung', oral: 8.8, fifteenMinute: 9.0, midterm: 8.5, final: 9.0 }
      ];

      const newGrades = richSubjectGrades.map((sg, idx) => ({
        id: `gr_rich_${student.id}_${idx}_${Date.now()}`,
        studentId: student.id,
        subject: sg.subject,
        semester: 'HK1',
        oral: sg.oral,
        fifteenMinute: sg.fifteenMinute,
        midterm: sg.midterm,
        final: sg.final
      }));

      const otherGrades = grades.filter(g => g.studentId !== student.id);
      const updatedGrades = [...otherGrades, ...newGrades];
      
      writeStored('mis_sis_grades_v3', updatedGrades);
      setGrades(updatedGrades);
    }
  }, [student, grades]);

  // Read tuition fees
  const [tuitionFees, setTuitionFees] = useState<any[]>(() => {
    const defaultTuitions = [
      { id: 'HV001', student: 'Nguyễn Minh Quân', amount: '12,500,000đ', deadline: '2026-06-15', status: 'CHO_DONG', invoiceNo: 'INV-2026-001' },
      { id: 'HV002', student: 'Trần Mỹ Lệ', amount: '14,000,000đ', deadline: '2026-06-10', status: 'DA_DONG', invoiceNo: 'INV-2026-002', paidDate: '2026-06-01' },
      { id: 'HV003', student: 'Phạm Hồng Thái', amount: '12,500,000đ', deadline: '2026-06-05', status: 'QUA_HAN', invoiceNo: 'INV-2026-003' }
    ];
    return readStored<any[]>('mis_lms_tuition_fees', defaultTuitions);
  });

  // New features states: Leave request
  const [leaveRequests, setLeaveRequests] = useState<any[]>(() => {
    const defaultLeaves = [
      { id: 'lv_1', studentId: student?.id || 'std1', studentName: student?.name || 'Học sinh', className: student?.className || '10A1', startDate: '2026-05-12', endDate: '2026-05-13', reason: 'Nghỉ khám răng hàm mặt định kỳ', status: 'APPROVED', createdAt: '2026-05-11 08:30', teacherNote: 'Đã chấp thuận. Phụ huynh lưu ý nhắc con chép bài đầy đủ.' },
      { id: 'lv_2', studentId: student?.id || 'std1', studentName: student?.name || 'Học sinh', className: student?.className || '10A1', startDate: '2026-06-02', endDate: '2026-06-02', reason: 'Gia đình có việc hiếu đột xuất', status: 'APPROVED', createdAt: '2026-06-01 19:45', teacherNote: 'Đã thông qua và báo cho giáo viên bộ môn.' }
    ];
    return readStored<any[]>('mis_portal_leave_requests_v3', defaultLeaves);
  });
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState('');
  const [leaveFilter, setLeaveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [leaveSearch, setLeaveSearch] = useState('');

  // Payment simulator states
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD'>('QR');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Surveys & Feedback states
  const [surveys, setSurveys] = useState<any[]>(() => {
    const defaultSurveys = [
      { id: 'sv_1', title: 'Khảo sát chất lượng bữa ăn bán trú học kỳ II', description: 'Đánh giá mức độ hài lòng về thực đơn, dinh dưỡng và vệ sinh thực phẩm bếp ăn nhà trường.', deadline: '2026-06-20', status: 'PENDING' },
      { id: 'sv_2', title: 'Đánh giá chất lượng dịch vụ xe đưa đón học sinh (MIS Bus)', description: 'Khảo sát về thái độ của lái xe/phụ xe và mức độ đúng giờ của các tuyến xe đưa đón.', deadline: '2026-06-15', status: 'PENDING' }
    ];
    return readStored<any[]>('mis_portal_surveys_v3', defaultSurveys);
  });
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [surveyRating, setSurveyRating] = useState<number>(5);
  const [surveyComment, setSurveyComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Homeroom teacher comments data
  const teacherComments = useMemo(() => {
    return [
      { month: 'Tháng 5/2026', comment: 'Học sinh tiếp thu bài nhanh, năng nổ phát biểu xây dựng bài. Trí thông minh logic-toán học rất nổi trội. Cần rèn luyện thêm tính kiên nhẫn khi làm bài trắc nghiệm dài.', conduct: 'Tốt', teacher: 'Cô Lê Thị Thanh Nhàn' },
      { month: 'Tháng 4/2026', comment: 'Hoàn thành tốt các nhiệm vụ học tập trên lớp. Có tinh thần tự giác cao, tích cực tham gia các dự án ngoại khóa và hoạt động đa trí tuệ nhóm.', conduct: 'Tốt', teacher: 'Cô Lê Thị Thanh Nhàn' }
    ];
  }, []);

  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) return;
    const newRequest = {
      id: `lv_${Date.now()}`,
      studentId: student?.id || 'std1',
      studentName: student?.name || 'Học sinh',
      className: student?.className || '10A1',
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason,
      createdAt: new Date().toLocaleString('vi-VN', { hour12: false }),
      status: 'PENDING'
    };
    const updated = [newRequest, ...leaveRequests];
    setLeaveRequests(updated);
    writeStored('mis_portal_leave_requests_v3', updated);
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
    setLeaveSuccess('🎉 Gửi đơn xin nghỉ học thành công! Đang chờ Giáo viên chủ nhiệm duyệt.');
    setTimeout(() => setLeaveSuccess(''), 5000);
  };

  const handleWithdrawLeaveRequest = (requestId: string) => {
    if (window.confirm("Quý phụ huynh có chắc chắn muốn thu hồi đơn xin nghỉ phép này không?")) {
      const updated = leaveRequests.filter((r: any) => r.id !== requestId);
      setLeaveRequests(updated);
      writeStored('mis_portal_leave_requests_v3', updated);
    }
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    const updatedTuition = tuitionFees.map(t => {
      if (t.id === selectedInvoice.id) {
        return {
          ...t,
          status: 'DA_DONG',
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    setTuitionFees(updatedTuition);
    writeStored('mis_lms_tuition_fees', updatedTuition);
    setPaymentSuccess('🎉 Thanh toán học phí trực tuyến thành công!');
    setTimeout(() => {
      setPaymentSuccess('');
      setSelectedInvoice(null);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }, 2000);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;

    const updatedSurveys = surveys.map(s => {
      if (s.id === selectedSurvey.id) {
        return { ...s, status: 'SUBMITTED' };
      }
      return s;
    });

    setSurveys(updatedSurveys);
    writeStored('mis_portal_surveys_v3', updatedSurveys);
    
    // Save feedback details
    const savedFeedbacks = readStored<any[]>('mis_portal_surveys_feedback_v3', []);
    const newFeedback = {
      id: `fb_${Date.now()}`,
      surveyId: selectedSurvey.id,
      surveyTitle: selectedSurvey.title,
      studentName: student?.name,
      rating: surveyRating,
      comment: surveyComment,
      submittedAt: new Date().toLocaleString('vi-VN', { hour12: false })
    };
    writeStored('mis_portal_surveys_feedback_v3', [newFeedback, ...savedFeedbacks]);

    setFeedbackSuccess('🎉 Cảm ơn ý kiến góp ý quý báu của quý Phụ huynh!');
    setTimeout(() => {
      setFeedbackSuccess('');
      setSelectedSurvey(null);
      setSurveyRating(5);
      setSurveyComment('');
    }, 2000);
  };

  // Derive metrics
  const studentGrades = useMemo(() => {
    if (!student) return [];
    return grades.filter(g => g.studentId === student.id);
  }, [grades, student]);

  const studentAttendance = useMemo(() => {
    if (!student) return [];
    return attendance.filter(a => a.studentId === student.id);
  }, [attendance, student]);

  const studentNotices = useMemo(() => {
    if (!student) return [];
    return notices.filter(n => n.studentId === student.id);
  }, [notices, student]);

  const studentBorrowLogs = useMemo(() => {
    if (!student) return [];
    // Match by borrower name or role
    return borrowLogs.filter(b => b.borrowerName === student.name);
  }, [borrowLogs, student]);

  const studentTuition = useMemo(() => {
    if (!student) return [];
    return tuitionFees.filter(t => t.student.toLowerCase().includes(student.name.toLowerCase()) || student.name.toLowerCase().includes(t.student.toLowerCase()));
  }, [tuitionFees, student]);

  // Calculate GPA
  const gradeAverage = (grade: any) => {
    return Number(((grade.oral + grade.fifteenMinute + grade.midterm * 2 + grade.final * 3) / 7).toFixed(1));
  };

  const gpa = useMemo(() => {
    if (!studentGrades.length) return 0;
    return Number((studentGrades.reduce((sum, g) => sum + gradeAverage(g), 0) / studentGrades.length).toFixed(1));
  }, [studentGrades]);

  const attendanceRate = useMemo(() => {
    if (!studentAttendance.length) return 100;
    const presentCount = studentAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  }, [studentAttendance]);

  const unpaidInvoicesCount = useMemo(() => {
    return studentTuition.filter(t => t.status !== 'DA_DONG').length;
  }, [studentTuition]);

  // Leave request statistics
  const leaveStats = useMemo(() => {
    let totalApprovedDays = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    leaveRequests.forEach((req: any) => {
      if (req.status === 'APPROVED') {
        approvedCount++;
        totalApprovedDays += calculateDays(req.startDate, req.endDate);
      } else if (req.status === 'PENDING') {
        pendingCount++;
      } else if (req.status === 'REJECTED') {
        rejectedCount++;
      }
    });

    return { totalApprovedDays, pendingCount, approvedCount, rejectedCount };
  }, [leaveRequests]);

  // Filtered leave requests
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter((req: any) => {
      const matchesStatus = leaveFilter === 'ALL' || req.status === leaveFilter;
      const matchesSearch = req.reason.toLowerCase().includes(leaveSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [leaveRequests, leaveFilter, leaveSearch]);

  const weeklyTimetable = useMemo(() => {
    const className = student?.className || '10A1';
    return [
      { day: 'Thứ 2', periods: 'Tiết 1-2', subject: 'Toán', teacher: 'Cô Lê Thị Thanh Nhàn', room: 'P.302', note: 'Chuẩn bị bài tập hàm số' },
      { day: 'Thứ 2', periods: 'Tiết 3-4', subject: 'Ngữ văn', teacher: 'Thầy Trần Quốc Đạt', room: 'P.105', note: 'Đọc trước văn bản nghị luận' },
      { day: 'Thứ 3', periods: 'Tiết 1-2', subject: 'Ngoại ngữ 1', teacher: 'Cô Minh Tuyết', room: 'P.204', note: 'Kiểm tra từ vựng Unit 6' },
      { day: 'Thứ 3', periods: 'Tiết 5-6', subject: 'Tin học', teacher: 'Thầy Trần Hoàng Nam', room: 'Phòng máy 1', note: 'Thực hành dự án nhóm' },
      { day: 'Thứ 4', periods: 'Tiết 1-2', subject: 'Lịch sử', teacher: 'Cô Nguyễn Thanh Lan', room: 'P.301', note: 'Ôn tập theo phiếu học tập' },
      { day: 'Thứ 4', periods: 'Tiết 3-4', subject: 'Giáo dục thể chất', teacher: 'Thầy Phạm Đức Hải', room: 'Sân đa năng', note: 'Mang đồng phục thể thao' },
      { day: 'Thứ 5', periods: 'Tiết 1-2', subject: 'Vật lí', teacher: 'Thầy Vũ Minh Khang', room: 'Lab Khoa học', note: 'Thí nghiệm theo nhóm' },
      { day: 'Thứ 6', periods: 'Tiết 3-4', subject: 'Hoạt động trải nghiệm, hướng nghiệp', teacher: 'GVCN', room: `Lớp ${className}`, note: 'Sinh hoạt định hướng tuần' },
    ];
  }, [student]);

  // LMS interactive quiz state
  const [activeQuiz, setActiveQuiz] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const quizQuestions = [
    {
      id: 1,
      question: "Một lớp học có 30 học sinh. Để chia đều các nhóm thảo luận có số thành viên bằng nhau (nhiều hơn 1 người), lớp học đó có tối đa bao nhiêu cách chia nhóm?",
      options: ["3 cách", "4 cách", "6 cách", "8 cách"],
      correct: 2 // 6 cách: nhóm 2, 3, 5, 6, 10, 15 người
    },
    {
      id: 2,
      question: "Đâu là yếu tố cốt lõi được mô tả trong triết lý giáo dục Đa Trí Tuệ (Multiple Intelligences) của Howard Gardner?",
      options: [
        "Học sinh chỉ học tập thông qua điểm số bài thi viết.",
        "Trí thông minh không cố định và tồn tại dưới nhiều dạng khác nhau.",
        "Tất cả học sinh đều có năng lực giải toán xuất sắc như nhau.",
        "Chương trình học chỉ tập trung vào rèn luyện thể thao dã ngoại."
      ],
      correct: 1
    },
    {
      id: 3,
      question: "Trong hệ thống MIS Smart Portal, chỉ số GPA của học sinh được tính toán dựa trên hệ số nào cho điểm thi Học kỳ (Cuối kỳ)?",
      options: ["Hệ số 1", "Hệ số 2", "Hệ số 3", "Hệ số 4"],
      correct: 2 // Hệ số 3 (final * 3)
    }
  ];

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });
    const finalScore = Math.round((correctCount / quizQuestions.length) * 100);
    setQuizScore(finalScore);
    setQuizSubmitted(true);

    // Save submission to local storage
    const currentSubs = readStored<any[]>('mis_lms_review_submissions', []);
    const newSub = {
      id: `SUB_PORTAL_${Date.now()}`,
      assignmentId: 'RV_PORTAL_001',
      studentId: student?.id || 'std1',
      studentName: student?.name || 'Học sinh Portal',
      submittedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
      score: finalScore,
      correctCount,
      totalQuestions: quizQuestions.length
    };
    writeStored('mis_lms_review_submissions', [newSub, ...currentSubs]);
  };

  const resetQuiz = () => {
    setActiveQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // Billing receipt printing
  const handlePrintReceipt = (invoice: any) => {
    if (!student) return;
    const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Biên lai thu tiền - ${invoice.invoiceNo}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 40px; line-height: 1.5; }
    .header { text-align: center; margin-bottom: 30px; }
    .title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 5px 0; }
    .subtitle { font-size: 12px; color: #475569; }
    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
    th { background: #f1f5f9; }
    .total { text-align: right; font-weight: bold; font-size: 15px; margin-top: 20px; }
    .sign { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; text-align: center; font-size: 13px; }
    .btn-print { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 20px; }
    @media print { .btn-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <button class="btn-print" onclick="window.print()">In Biên lai</button>
  <div class="header">
    <div style="font-weight: bold; font-size: 14px;">TRƯỜNG PHỔ THÔNG LIÊN CẤP ĐA TRÍ TUỆ MIS</div>
    <div class="subtitle">Đường Tôn Thất Thuyết, Cầu Giấy, Hà Nội</div>
    <div class="title">BIÊN LAI THU TIỀN HỌC PHÍ</div>
    <div class="subtitle">Mã kiểm duyệt: ${invoice.invoiceNo}</div>
  </div>
  <div class="invoice-info">
    <div>
      <div><strong>Học sinh:</strong> ${student.name}</div>
      <div><strong>Mã học sinh:</strong> ${student.code}</div>
      <div><strong>Lớp:</strong> ${student.className}</div>
    </div>
    <div>
      <div><strong>Ngày phát hành:</strong> ${invoice.deadline}</div>
      <div><strong>Trạng thái:</strong> ${invoice.status === 'DA_DONG' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}</div>
      <div><strong>Ngày nộp:</strong> ${invoice.paidDate || 'Chưa nộp'}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Nội dung thu</th>
        <th>Học kỳ</th>
        <th>Số tiền</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Học phí chính quy liên cấp (Khối ${parseInt(student.className) || 10})</td>
        <td>Học kỳ I (Niên khóa 2026-2027)</td>
        <td>${invoice.amount}</td>
      </tr>
    </tbody>
  </table>
  <div class="total">Tổng tiền đã thu: ${invoice.amount}</div>
  <div class="sign">
    <div><strong>Người nộp tiền</strong><br/><br/><br/>(Ký, ghi rõ họ tên)</div>
    <div><strong>Thủ quỹ nhà trường</strong><br/><br/><br/>(Ký, đóng dấu)</div>
  </div>
</body>
</html>`;

    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
      popup.focus();
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">Không tìm thấy hồ sơ học sinh liên kết!</h2>
        <p className="text-sm text-slate-400 mt-2">Vui lòng đăng xuất và đăng nhập lại bằng tài khoản hợp lệ.</p>
        <button onClick={onLogout} className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all">
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-100/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 flex items-center justify-between px-4 z-40 text-slate-800 shadow-3xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl lg:hidden text-slate-500"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5 border border-slate-200 shrink-0">
            <img src="https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png" alt="MIS Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wide text-slate-900 uppercase leading-none">MIS SMART PORTAL</h1>
            <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block mt-0.5">
              {currentUser.role === 'PARENT' ? '👪 Cổng Phụ Huynh' : '🎓 Cổng Học Sinh'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100/80 border border-slate-250/65 rounded-full text-[10.5px]">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-5 h-5 rounded-full object-cover" />
            <span className="font-bold text-slate-700">{currentUser.name}</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 border border-slate-250/65 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 rounded-xl text-slate-500 transition-all flex items-center justify-center cursor-pointer"
            title="Đăng xuất an toàn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex-1 flex relative">
        
        {/* Sidebar Navigation */}
        <aside className={`w-64 bg-white border-r border-slate-200/85 p-4 shrink-0 flex flex-col justify-between fixed lg:static inset-y-0 left-0 z-30 transform lg:transform-none lg:translate-x-0 transition-transform duration-200 shadow-3xs ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="space-y-6">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
              <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-3xs" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">{student.name}</p>
                <span className="text-[9.5px] text-slate-500 block font-mono mt-0.5">{student.code} · Lớp {student.className}</span>
              </div>
            </div>

            <div className="space-y-1 select-none">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block px-3 mb-2 font-mono">Chức năng</span>
              {[
                { id: 'DASHBOARD', label: 'Bảng điều khiển', icon: LayoutDashboard },
                { id: 'TIMETABLE', label: 'Thời khóa biểu học tập', icon: Clock },
                { id: 'TRANSCRIPTS', label: 'Kết quả học tập', icon: GraduationCap },
                { id: 'ATTENDANCE', label: 'Điểm danh chuyên cần', icon: CalendarCheck },
                { id: 'BILLING', label: 'Học phí & Hóa đơn', icon: CreditCard },
                { id: 'LEAVE', label: 'Xin nghỉ phép', icon: FileText },
                { id: 'HEALTH', label: 'Sức khỏe & Y tế', icon: HeartPulse },
                { id: 'LIBRARY', label: 'Mượn trả sách', icon: BookOpen },
                { id: 'FEEDBACK', label: 'Ý kiến & Khảo sát', icon: ClipboardList },
                ...(currentUser.role === 'STUDENT' ? [{ id: 'LMS', label: 'Luyện tập LMS', icon: BookOpenText }] : [])
              ].map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border border-indigo-500 text-white shadow-md'
                        : 'border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-[9.5px] text-slate-550 font-mono leading-relaxed mt-8">
            <div>MIS Smart Portal v3.2</div>
            <div>Học sinh & Phụ huynh SSO</div>
          </div>
        </aside>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-20 lg:hidden"
          ></div>
        )}

        {/* Content Pane */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto z-10 max-w-7xl mx-auto w-full">
          
          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* Personalized Banner */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="space-y-2 relative z-10">
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-[9.5px] font-black uppercase tracking-wider font-mono border border-indigo-550/25">
                    Hệ thống giáo dục Đa Trí Tuệ
                  </span>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold leading-tight">
                    {currentUser.role === 'PARENT' 
                      ? `Kính chào Phụ huynh ${currentUser.name}!` 
                      : `Chào mừng ${student.name}!`
                    }
                  </h2>
                  <p className="text-xs text-indigo-100 font-light leading-relaxed max-w-2xl">
                    {currentUser.role === 'PARENT'
                      ? `Cổng thông tin hỗ trợ xem trực tuyến quá trình học tập, chuyên cần, hóa đơn tài chính và cập nhật y tế học đường của con em ${student.name} (Lớp ${student.className}).`
                      : `Không gian ôn tập bài kiểm tra (LMS), tra cứu sổ điểm học kỳ, theo dõi chuyên cần lớp học và công nợ học phí tiện lợi.`
                    }
                  </p>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-3xs hover:border-slate-350 transition-colors">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">GPA học tập</span>
                    <GraduationCap className="w-4.5 h-4.5 text-indigo-400" />
                  </div>
                  <strong className="text-2xl font-black text-slate-850 mt-2 block">{gpa}/10</strong>
                  <span className="text-[10.5px] text-slate-550 block mt-1">Xếp loại: {gpa >= 8 ? 'Giỏi' : gpa >= 6.5 ? 'Khá' : 'Đạt'}</span>
                </div>

                <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-3xs hover:border-slate-350 transition-colors">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Tỷ lệ chuyên cần</span>
                    <CalendarCheck className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <strong className="text-2xl font-black text-slate-850 mt-2 block">{attendanceRate}%</strong>
                  <span className="text-[10.5px] text-slate-550 block mt-1">Số tiết vắng: {studentAttendance.filter(a => a.status === 'ABSENT').length} tiết</span>
                </div>

                <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-3xs hover:border-slate-350 transition-colors">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Hóa đơn cần đóng</span>
                    <CreditCard className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <strong className={`text-2xl font-black mt-2 block ${unpaidInvoicesCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                    {unpaidInvoicesCount} HĐ
                  </strong>
                  <span className="text-[10.5px] text-slate-550 block mt-1">
                    {unpaidInvoicesCount > 0 ? 'Có học phí chưa thanh toán' : 'Đã đóng đủ học phí'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-3xs hover:border-slate-350 transition-colors">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Thư viện & Sách</span>
                    <BookOpen className="w-4.5 h-4.5 text-teal-400" />
                  </div>
                  <strong className="text-2xl font-black text-slate-850 mt-2 block">
                    {studentBorrowLogs.filter(b => b.status === 'DANG_MUON' || b.status === 'QUA_HAN').length} cuốn
                  </strong>
                  <span className="text-[10.5px] text-slate-550 block mt-1">Đang mượn trong kỳ</span>
                </div>
              </div>

              {/* Bottom section: Notices & Discipline Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Notices from school */}
                <div className="lg:col-span-8 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    Thông báo & Ghi nhận nề nếp gần nhất
                  </h3>

                  <div className="space-y-2.5">
                    {studentNotices.slice(0, 5).map(notice => (
                      <div key={notice.id} className="p-3 bg-slate-50/70 border border-slate-150/60 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                          <span>LOẠI: {notice.type}</span>
                          <span>{notice.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">{notice.message}</p>
                      </div>
                    ))}
                    {studentNotices.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-xs italic">
                        Chưa có thông báo nào dành cho hồ sơ học sinh này.
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info & Health Note */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Danh hiệu & Thành tích
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50/70 border border-slate-150/60 rounded-xl space-y-1 text-xs">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Học bổng</span>
                      <p className="font-bold text-slate-800 leading-tight mt-0.5">{student.scholarship || 'Không'}</p>
                    </div>

                    <div className="p-3 bg-slate-50/70 border border-slate-150/60 rounded-xl space-y-2 text-xs">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block font-mono">Khen thưởng & giải thưởng</span>
                      <div className="space-y-1">
                        {student.awards?.map((award: string, index: number) => (
                          <div key={index} className="text-xs text-slate-700 font-medium">• {award}</div>
                        ))}
                        {(!student.awards || student.awards.length === 0) && (
                          <p className="text-slate-500 italic text-[11px]">Chưa ghi nhận khen thưởng.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Teacher Comments Section */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-violet-500" />
                  Nhận xét định kỳ của Giáo viên chủ nhiệm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherComments.map((comment, index) => (
                    <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 relative overflow-hidden group hover:border-violet-300 transition-colors">
                      <div className="flex justify-between items-center text-[9.5px] font-mono text-slate-400">
                        <span className="font-bold text-violet-600 uppercase">{comment.month}</span>
                        <span>GVCN: {comment.teacher}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">"{comment.comment}"</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[9px] font-bold text-slate-450 uppercase font-mono">Hạnh kiểm:</span>
                        <span className="px-2 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-250 text-[9px] font-bold rounded">
                          {comment.conduct}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 1.5. TIMETABLE VIEW */}
          {activeTab === 'TIMETABLE' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                      <Clock className="w-4.5 h-4.5 text-indigo-400" />
                      Thời khóa biểu học tập tuần này
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Lịch học chi tiết được cập nhật theo tuần học chính quy.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-650 text-[9.5px] font-mono rounded font-bold">
                    Lớp {student.className}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="text-left px-4 py-2.5">Thứ / Ngày</th>
                        <th className="text-left px-4 py-2.5">Thời gian / Tiết học</th>
                        <th className="text-left px-4 py-2.5">Môn học</th>
                        <th className="text-left px-4 py-2.5">Giáo viên phụ trách</th>
                        <th className="text-left px-4 py-2.5">Phòng học</th>
                        <th className="text-left px-4 py-2.5">Yêu cầu / Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {weeklyTimetable.map((slot, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40">
                          <td className="px-4 py-2.5 font-bold text-slate-700">{slot.day}</td>
                          <td className="px-4 py-2.5 text-slate-600 font-medium font-mono">{slot.periods}</td>
                          <td className="px-4 py-2.5 font-bold text-indigo-400">{slot.subject}</td>
                          <td className="px-4 py-2.5 text-slate-700">{slot.teacher}</td>
                          <td className="px-4 py-2.5 text-slate-500 font-mono">🏢 {slot.room}</td>
                          <td className="px-4 py-2.5 text-slate-500 italic">{slot.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. TRANSCRIPTS VIEW */}
          {activeTab === 'TRANSCRIPTS' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                      <GraduationCap className="w-4.5 h-4.5 text-indigo-400" />
                      Sổ điểm học kỳ hiện tại
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Dữ liệu được cập nhật trực tiếp từ hệ thống quản trị chuyên môn.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-650 text-[9.5px] font-mono rounded font-bold">
                    Học kỳ I
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="text-left px-4 py-2.5">Môn học</th>
                        <th className="text-center px-4 py-2.5">Điểm miệng</th>
                        <th className="text-center px-4 py-2.5">Điểm 15 phút</th>
                        <th className="text-center px-4 py-2.5">Điểm giữa kỳ (HS2)</th>
                        <th className="text-center px-4 py-2.5">Điểm cuối kỳ (HS3)</th>
                        <th className="text-center px-4 py-2.5">TB Môn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentGrades.map(grade => (
                        <tr key={grade.id} className="hover:bg-slate-50/40">
                          <td className="px-4 py-2.5 font-bold text-slate-700">{grade.subject}</td>
                          <td className="px-4 py-2.5 text-center text-slate-700">{grade.oral}</td>
                          <td className="px-4 py-2.5 text-center text-slate-700">{grade.fifteenMinute}</td>
                          <td className="px-4 py-2.5 text-center text-slate-700 font-medium">{grade.midterm}</td>
                          <td className="px-4 py-2.5 text-center text-slate-700 font-medium">{grade.final}</td>
                          <td className="px-4 py-2.5 text-center font-black text-indigo-400 bg-indigo-55/40">{gradeAverage(grade)}</td>
                        </tr>
                      ))}
                      {studentGrades.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">Chưa nhập dữ liệu điểm môn nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Year-over-Year History */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-indigo-400" />
                  Quá trình học tập liên năm học cũ
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="text-left px-4 py-2.5">Năm học</th>
                        <th className="text-left px-4 py-2.5">Lớp học</th>
                        <th className="text-center px-4 py-2.5">GPA cả năm</th>
                        <th className="text-center px-4 py-2.5">Hạnh kiểm</th>
                        <th className="text-left px-4 py-2.5">Giáo viên chủ nhiệm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {student.academicHistory?.map((item: AcademicYearRecord) => (
                        <tr key={item.id} className="hover:bg-slate-50/40">
                          <td className="px-4 py-2.5 font-bold text-slate-700">{item.schoolYear}</td>
                          <td className="px-4 py-2.5 text-slate-700 font-semibold">{item.className}</td>
                          <td className="px-4 py-2.5 text-center text-indigo-400 font-bold">{item.gpa}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg">
                              {item.conduct}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">{item.teacherName}</td>
                        </tr>
                      ))}
                      {(!student.academicHistory || student.academicHistory.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">Chưa có lịch sử học tập năm học cũ.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. ATTENDANCE VIEW */}
          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                      <CalendarCheck className="w-4.5 h-4.5 text-indigo-400" />
                      Nhật ký chuyên cần chi tiết
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Thống kê tất cả các buổi điểm danh và vắng học của học sinh.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-bold rounded-full">
                      Tỷ lệ: {attendanceRate}%
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="text-left px-4 py-2.5">Ngày điểm danh</th>
                        <th className="text-left px-4 py-2.5">Tiết học</th>
                        <th className="text-left px-4 py-2.5">Trạng thái</th>
                        <th className="text-left px-4 py-2.5">Lý do nghỉ / ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentAttendance.map(item => {
                        const statusLabel = item.status === 'PRESENT' ? 'Có mặt' : item.status === 'LATE' ? 'Đi muộn' : item.status === 'ABSENT' ? 'Vắng học' : 'Có phép';
                        const badgeStyle = item.status === 'PRESENT' 
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-700' 
                          : item.status === 'LATE' 
                          ? 'bg-amber-50 border-amber-250 text-amber-700' 
                          : 'bg-rose-50 border-rose-250 text-rose-700';
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/40">
                            <td className="px-4 py-2.5 font-bold font-mono text-slate-800">{item.date}</td>
                            <td className="px-4 py-2.5 text-slate-350 font-medium">Tiết {item.period || 1}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badgeStyle}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-400">{item.reason || item.note || '-'}</td>
                          </tr>
                        );
                      })}
                      {studentAttendance.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">Chưa có bản ghi điểm danh học vụ nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. BILLING VIEW */}
          {activeTab === 'BILLING' && (
            <div className="space-y-6">
              
              {/* Classes rates notice card */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Định mức học phí các khối lớp (Cấp THPT)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-800 block">Khối lớp 10:</span>
                    12,500,000đ / tháng
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-800 block">Khối lớp 11:</span>
                    14,000,000đ / tháng
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-800 block">Khối lớp 12:</span>
                    15,000,000đ / tháng
                  </div>
                </div>
              </div>

              {/* Bills List */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                  <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                  Danh sách hóa đơn tài vụ học sinh
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="text-left px-4 py-2.5">Số HĐ</th>
                        <th className="text-left px-4 py-2.5">Số tiền</th>
                        <th className="text-left px-4 py-2.5">Hạn đóng học phí</th>
                        <th className="text-left px-4 py-2.5">Ngày đóng</th>
                        <th className="text-left px-4 py-2.5">Trạng thái</th>
                        <th className="text-center px-4 py-2.5">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentTuition.map(invoice => {
                        const isPaid = invoice.status === 'DA_DONG';
                        const badgeStyle = isPaid 
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-700' 
                          : invoice.status === 'QUA_HAN' 
                          ? 'bg-rose-50 border-rose-250 text-rose-750 animate-pulse'
                          : 'bg-amber-50 border-amber-250 text-amber-700';
                        const statusText = isPaid ? 'Đã đóng' : invoice.status === 'QUA_HAN' ? 'Quá hạn' : 'Chờ đóng';

                        return (
                          <tr key={invoice.id} className="hover:bg-slate-50/40">
                            <td className="px-4 py-2.5 font-bold font-mono text-slate-800">{invoice.invoiceNo}</td>
                            <td className="px-4 py-2.5 font-bold text-slate-800">{invoice.amount}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-500">{invoice.deadline}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-500">{invoice.paidDate || '-'}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badgeStyle}`}>
                                {statusText}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {!isPaid && (
                                  <button 
                                    onClick={() => { setSelectedInvoice(invoice); setPaymentMethod('QR'); }}
                                    className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-3xs"
                                  >
                                    Thanh toán
                                  </button>
                                )}
                                <button 
                                  onClick={() => handlePrintReceipt(invoice)}
                                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 hover:text-slate-900 rounded-lg flex items-center gap-1"
                                >
                                  <Printer className="w-3 h-3" />
                                  Biên lai
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {studentTuition.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">Chưa có hóa đơn học phí nào được tạo.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. HEALTH VIEW */}
          {activeTab === 'HEALTH' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Insurance card */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-3">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-550">Bảo hiểm y tế</h4>
                  <div className="p-3 bg-indigo-50/40 border border-indigo-150 rounded-xl">
                    <span className="text-[9.5px] text-indigo-650 font-mono block">SỐ THẺ BHYT:</span>
                    <strong className="text-sm font-mono text-white mt-1 block">{student.healthInsurance || 'DN-Chưa cập nhật'}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed font-light mt-1">
                    Bảo hiểm y tế học sinh bắt buộc được đồng bộ trực tuyến với cơ sở dữ liệu BHXH quốc gia.
                  </div>
                </div>

                {/* Allergies card */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-3">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-550">Dị ứng &amp; Bệnh nền</h4>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs">
                      <span className="text-[9px] text-rose-600 font-mono font-bold block">DỊ ỨNG:</span>
                      <p className="font-bold text-white mt-0.5">{student.allergies?.length ? student.allergies.join(', ') : 'Không phát hiện'}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs">
                      <span className="text-[9px] text-amber-600 font-mono font-bold block">BỆNH NỀN:</span>
                      <p className="font-bold text-white mt-0.5">{student.conditions?.length ? student.conditions.join(', ') : 'Không ghi nhận'}</p>
                    </div>
                  </div>
                </div>

                {/* Health Notes card */}
                <div className="bg-slate-950 border border-slate-855 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-550">Ghi chú lâm sàng</h4>
                    <p className="text-xs text-slate-800 mt-2 bg-slate-900 border border-slate-850 p-3 rounded-xl italic">
                      "{student.healthNote || 'Sức khỏe tốt, không có yêu cầu đặc biệt.'}"
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-500 block font-mono">Bởi Cán bộ Y tế Trường học</span>
                </div>
              </div>

              {/* Health incidents table */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                  <HeartPulse className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                  Nhật ký sự cố y tế học đường
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="text-left px-4 py-2.5">Ngày</th>
                        <th className="text-left px-4 py-2.5">Triệu chứng lâm sàng</th>
                        <th className="text-left px-4 py-2.5">Hướng xử lý sơ cứu</th>
                        <th className="text-left px-4 py-2.5">Nhân viên y tế trực</th>
                        <th className="text-left px-4 py-2.5">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {student.healthIncidents?.map((inc: HealthIncident) => (
                        <tr key={inc.id} className="hover:bg-slate-50/40">
                          <td className="px-4 py-2.5 font-bold font-mono text-slate-800">{inc.date}</td>
                          <td className="px-4 py-2.5 text-slate-700 font-semibold">{inc.symptoms}</td>
                          <td className="px-4 py-2.5 text-slate-350">{inc.treatment}</td>
                          <td className="px-4 py-2.5 text-slate-350">{inc.nurseName}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                              inc.status === 'DA_XU_LY' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-amber-50 border-amber-250 text-amber-700'
                            }`}>
                              {inc.status === 'DA_XU_LY' ? 'Đã xử lý' : 'Theo dõi'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!student.healthIncidents || student.healthIncidents.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">Không có sự cố y tế nào được ghi nhận.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vaccine record */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Nhật ký tiêm chủng phòng dịch bệnh</h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="text-left px-4 py-2.5">Tên Vaccine</th>
                        <th className="text-left px-4 py-2.5">Ngày tiêm chủng</th>
                        <th className="text-left px-4 py-2.5">Liều mũi tiêm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {student.vaccinations?.map((vac: VaccinationRecord) => (
                        <tr key={vac.id} className="hover:bg-slate-50/40">
                          <td className="px-4 py-2.5 font-bold text-slate-700">{vac.vaccineName}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-350">{vac.date}</td>
                          <td className="px-4 py-2.5 font-mono text-indigo-400 font-bold">{vac.dose}</td>
                        </tr>
                      ))}
                      {(!student.vaccinations || student.vaccinations.length === 0) && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-slate-500 italic">Chưa có lịch sử tiêm chủng vaccine.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 6. LIBRARY VIEW */}
          {activeTab === 'LIBRARY' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                      <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                      Lịch sử mượn sách &amp; thiết bị thư viện
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Tra cứu các đầu sách giáo khoa và thiết bị đang được mượn trả.</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="text-left px-4 py-2.5">Mã tài sản</th>
                        <th className="text-left px-4 py-2.5">Tên sách / Thiết bị</th>
                        <th className="text-left px-4 py-2.5">Phân loại</th>
                        <th className="text-left px-4 py-2.5">Ngày mượn</th>
                        <th className="text-left px-4 py-2.5">Hạn trả</th>
                        <th className="text-left px-4 py-2.5">Ngày thực trả</th>
                        <th className="text-left px-4 py-2.5">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentBorrowLogs.map(log => {
                        const isOverdue = log.status === 'QUA_HAN';
                        const isReturned = log.status === 'DA_TRA';
                        const badgeStyle = isReturned
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-700' 
                          : isOverdue 
                          ? 'bg-rose-50 border-rose-250 text-rose-700 animate-pulse'
                          : 'bg-amber-50 border-amber-250 text-amber-700';
                        const statusLabel = isReturned ? 'Đã trả' : isOverdue ? 'Quá hạn' : 'Đang mượn';

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/40">
                            <td className="px-4 py-2.5 font-bold font-mono text-slate-800">{log.itemCode}</td>
                            <td className="px-4 py-2.5 text-white font-semibold">{log.itemName}</td>
                            <td className="px-4 py-2.5 text-slate-400">{log.category === 'SACH' ? 'Sách học vụ' : 'Thiết bị'}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-400">{log.borrowDate}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-550">{log.dueDate}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-400">{log.returnDate || '-'}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badgeStyle}`}>
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {studentBorrowLogs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">Học sinh chưa từng mượn sách hay thiết bị nào từ kho thư viện.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6.5. LEAVE REQUEST VIEW */}
          {activeTab === 'LEAVE' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form to submit request */}
                <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-4.5 h-4.5 text-indigo-500" />
                      Gửi đơn xin nghỉ phép trực tuyến
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Đơn xin nghỉ phép sẽ được gửi trực tiếp đến Giáo viên chủ nhiệm duyệt.</p>
                  </div>

                  {leaveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{leaveSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateLeaveRequest} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Nghỉ từ ngày</label>
                        <input 
                          type="date" 
                          required
                          value={leaveStartDate}
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Đến ngày (Hết ngày)</label>
                        <input 
                          type="date" 
                          required
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Lý do xin nghỉ phép</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Quý phụ huynh vui lòng nêu rõ lý do xin nghỉ phép (Ví dụ: Cháu bị sốt cao cần đi khám, gia đình có việc hiếu hỉ...)"
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 leading-relaxed placeholder:text-slate-400"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer hover:shadow-lg active:translate-y-0.2"
                    >
                      Gửi đơn xin nghỉ phép
                    </button>
                  </form>
                </div>

                {/* History list with filters and stats */}
                <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-4.5 h-4.5 text-indigo-500" />
                        Lịch sử xin nghỉ phép của con em
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1">Danh sách đơn xin nghỉ phép đã nộp và tình trạng phản hồi.</p>
                    </div>
                  </div>

                  {/* Leave Stats Summary */}
                  <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-center bg-white border border-slate-200/80 p-2 rounded-lg shadow-3xs">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tổng ngày nghỉ</span>
                      <strong className="text-base font-black text-indigo-600 block mt-0.5 font-mono">{leaveStats.totalApprovedDays} ngày</strong>
                    </div>
                    <div className="text-center bg-white border border-slate-200/80 p-2 rounded-lg shadow-3xs">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Đang chờ duyệt</span>
                      <strong className="text-base font-black text-amber-500 block mt-0.5 font-mono">{leaveStats.pendingCount} đơn</strong>
                    </div>
                    <div className="text-center bg-white border border-slate-200/80 p-2 rounded-lg shadow-3xs">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Đã duyệt</span>
                      <strong className="text-base font-black text-emerald-600 block mt-0.5 font-mono">{leaveStats.approvedCount} đơn</strong>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="space-y-3 pt-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm lý do xin nghỉ phép..."
                        value={leaveSearch}
                        onChange={(e) => setLeaveSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
                      />
                      {leaveSearch && (
                        <button
                          type="button"
                          onClick={() => setLeaveSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
                      {[
                        { key: 'ALL', label: 'Tất cả' },
                        { key: 'PENDING', label: 'Chờ duyệt' },
                        { key: 'APPROVED', label: 'Đã duyệt' },
                        { key: 'REJECTED', label: 'Từ chối' },
                      ].map((tab) => {
                        const isSelected = leaveFilter === tab.key;
                        let activeTabStyle = 'bg-indigo-600 border-indigo-500 text-white shadow-3xs';
                        if (tab.key === 'PENDING' && isSelected) activeTabStyle = 'bg-amber-500 border-amber-400 text-white shadow-3xs';
                        if (tab.key === 'APPROVED' && isSelected) activeTabStyle = 'bg-emerald-600 border-emerald-500 text-white shadow-3xs';
                        if (tab.key === 'REJECTED' && isSelected) activeTabStyle = 'bg-rose-600 border-rose-500 text-white shadow-3xs';

                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setLeaveFilter(tab.key as any)}
                            className={`px-3 py-1 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer ${
                              isSelected
                                ? activeTabStyle
                                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {filteredLeaveRequests.map((req: any) => {
                      const statusLabel = req.status === 'APPROVED' ? 'Đã duyệt' : req.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt';
                      const badgeStyle = req.status === 'APPROVED' 
                        ? 'bg-emerald-500/10 border-emerald-200 text-emerald-700' 
                        : req.status === 'REJECTED' 
                        ? 'bg-rose-500/10 border-rose-200 text-rose-700' 
                        : 'bg-sky-500/10 border-sky-200 text-sky-700';
                      
                      const duration = calculateDays(req.startDate, req.endDate);

                      return (
                        <div key={req.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3 relative hover:border-slate-300 hover:bg-slate-50 transition-all shadow-3xs">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-[10px] font-mono text-slate-400 font-medium flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Nộp lúc: {formatDateTimeVN(req.createdAt)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 ${badgeStyle}`}>
                                {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {req.status === 'PENDING' && <Clock className="w-3 h-3 text-sky-600" />}
                                {req.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
                                {statusLabel}
                              </span>
                              {req.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => handleWithdrawLeaveRequest(req.id)}
                                  className="px-2 py-0.5 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-3xs"
                                >
                                  Thu hồi đơn
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="text-xs space-y-2">
                            <div className="flex items-center gap-2 text-slate-700 flex-wrap">
                              <span className="font-bold font-sans">Thời gian nghỉ:</span>
                              <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg text-[10.5px] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                {req.startDate === req.endDate ? formatDateVN(req.startDate) : `${formatDateVN(req.startDate)} → ${formatDateVN(req.endDate)}`}
                              </span>
                              <span className="text-[10px] bg-slate-200 border border-slate-300 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                                {duration} ngày
                              </span>
                            </div>

                            <div className="text-slate-650 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl shadow-3xs">
                              <strong className="text-slate-800 font-bold block mb-0.5 text-[10.5px]">Lý do nghỉ phép:</strong>
                              <p className="text-slate-600 leading-relaxed font-sans">{req.reason}</p>
                            </div>
                          </div>

                          {req.teacherNote && (
                            <div className="pl-3.5 border-l-2 border-indigo-400 bg-indigo-50/30 p-2.5 rounded-r-xl text-[11px] text-slate-600 space-y-1">
                              <strong className="text-indigo-900 font-bold block">💬 Giáo viên chủ nhiệm phản hồi:</strong>
                              <p className="italic font-medium text-slate-600 leading-relaxed">"{req.teacherNote}"</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {filteredLeaveRequests.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs italic bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        Không tìm thấy đơn xin nghỉ phép nào phù hợp.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6.6. FEEDBACK & SURVEYS VIEW */}
          {activeTab === 'FEEDBACK' && (
            <div className="space-y-6 animate-fade-in">
              {selectedSurvey ? (
                <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-3xs max-w-2xl mx-auto space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                      <ClipboardList className="w-4.5 h-4.5 text-indigo-400" />
                      Điền phiếu ý kiến &amp; Khảo sát
                    </h3>
                    <button 
                      type="button"
                      onClick={() => { setSelectedSurvey(null); setFeedbackSuccess(''); }}
                      className="text-xs text-slate-450 hover:text-slate-755 font-bold cursor-pointer"
                    >
                      Quay lại danh sách
                    </button>
                  </div>

                  {feedbackSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feedbackSuccess}</span>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                    <h4 className="text-sm font-bold text-slate-800 leading-snug">{selectedSurvey.title}</h4>
                    <p className="text-xs text-slate-550 leading-relaxed">{selectedSurvey.description}</p>
                    <div className="text-[10px] font-mono text-slate-450 mt-1">Hạn chót: {selectedSurvey.deadline}</div>
                  </div>

                  <form onSubmit={handleSurveySubmit} className="space-y-5 text-xs">
                    <div className="space-y-2">
                      <label className="font-bold text-slate-700 block">Đánh giá độ hài lòng</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSurveyRating(star)}
                            className="p-1 hover:scale-115 transition-all cursor-pointer"
                          >
                            <svg 
                              className={`w-8 h-8 ${star <= surveyRating ? 'text-amber-400' : 'text-slate-200'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-500 ml-2 font-mono">
                          {surveyRating === 5 ? 'Rất hài lòng' : surveyRating === 4 ? 'Hài lòng' : surveyRating === 3 ? 'Bình thường' : surveyRating === 2 ? 'Không hài lòng' : 'Rất không hài lòng'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Ý kiến góp ý chi tiết</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Quý phụ huynh vui lòng chia sẻ thêm ý kiến đóng góp chi tiết để nhà trường nâng cao chất lượng phục vụ..."
                        value={surveyComment}
                        onChange={(e) => setSurveyComment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 leading-relaxed placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSurvey(null)}
                        className="w-1/3 py-2.5 bg-slate-55/60 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold transition-all text-center cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:translate-y-0.2 cursor-pointer"
                      >
                        Gửi khảo sát
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                      <ClipboardList className="w-4.5 h-4.5 text-indigo-400" />
                      Danh sách ý kiến &amp; Khảo sát từ nhà trường
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Đóng góp ý kiến giúp trường cải thiện và hoàn thiện các dịch vụ bán trú, xe đưa đón.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {surveys.map((sv: any) => {
                      const isSubmitted = sv.status === 'SUBMITTED';
                      return (
                        <div 
                          key={sv.id} 
                          className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${
                                isSubmitted 
                                  ? 'bg-emerald-55/15 border-emerald-250 text-emerald-700' 
                                  : 'bg-indigo-55/15 border-indigo-250 text-indigo-750'
                              }`}>
                                {isSubmitted ? 'Đã hoàn thành' : 'Chưa thực hiện'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">Hạn chót: {sv.deadline}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">{sv.title}</h4>
                            <p className="text-[11px] text-slate-550 leading-relaxed">{sv.description}</p>
                          </div>

                          {!isSubmitted ? (
                            <button
                              onClick={() => { setSelectedSurvey(sv); setSurveyRating(5); setSurveyComment(''); }}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-3xs text-center cursor-pointer font-sans"
                            >
                              Thực hiện khảo sát
                            </button>
                          ) : (
                            <div className="text-center py-2 text-[11px] text-slate-400 italic">
                              Cảm ơn quý phụ huynh đã hoàn thành khảo sát này.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. LMS HOMEWORK VIEW (STUDENT ONLY) */}
          {activeTab === 'LMS' && currentUser.role === 'STUDENT' && (
            <div className="space-y-6">
              
              {!activeQuiz ? (
                <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-3xs space-y-4 max-w-2xl mx-auto">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-150">
                    <ClipboardList className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight">Bài ôn tập trắc nghiệm số học & triết lý</h3>
                    <p className="text-xs text-slate-550 mt-1 leading-relaxed">
                      Nội dung ôn luyện gồm 3 câu hỏi trắc nghiệm rà soát nhanh kiến thức liên lớp. Điểm số sẽ được chấm tự động và cập nhật trực tuyến vào hệ thống LMS.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-400">
                    <span>Thời gian làm bài: 10 phút</span>
                    <span>Số câu hỏi: 3 câu</span>
                  </div>
                  <button 
                    onClick={() => setActiveQuiz(true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:translate-y-0.2"
                  >
                    Bắt đầu làm bài thi
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-3xs max-w-2xl mx-auto space-y-6">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                    <span className="text-xs font-black uppercase text-indigo-400 font-mono">Bài kiểm tra trực tuyến</span>
                    <button 
                      onClick={resetQuiz}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  {!quizSubmitted ? (
                    <form onSubmit={handleQuizSubmit} className="space-y-6 text-xs">
                      {quizQuestions.map((q, qIdx) => (
                        <div key={q.id} className="space-y-3 p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                          <p className="font-bold text-slate-850 leading-relaxed">
                            {qIdx + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => (
                              <label 
                                key={optIdx} 
                                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  quizAnswers[q.id] === optIdx
                                    ? 'bg-indigo-50/60 border-indigo-650 text-indigo-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                <input 
                                  type="radio" 
                                  required
                                  name={`q-${q.id}`} 
                                  checked={quizAnswers[q.id] === optIdx}
                                  onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                                  className="mt-0.5"
                                />
                                <span className="leading-snug">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl active:translate-y-0.2 cursor-pointer shadow-md"
                      >
                        Nộp bài chấm điểm tự động
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6 space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-full border border-indigo-650/20 text-indigo-400 mb-2">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Nộp bài thành công!</h4>
                      <p className="text-xs text-slate-400">Hệ thống đã chấm điểm tự động bài thi của học sinh {student.name}:</p>
                      
                      <div className="text-3xl font-black text-indigo-600 bg-indigo-50/80 w-fit mx-auto px-6 py-2 rounded-2xl border border-indigo-150">
                        {quizScore} / 100 điểm
                      </div>

                      <p className="text-[10px] text-slate-500 font-mono">Dữ liệu nộp bài đã được ghi nhận trên sổ điểm số hóa LMS.</p>
                      
                      <button 
                        onClick={resetQuiz}
                        className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold transition-all text-slate-350 hover:text-white"
                      >
                        Quay lại trang đề thi
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* 8. PAYMENT SIMULATOR MODAL */}
          {selectedInvoice && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in text-slate-800">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-805">Thanh toán học phí trực tuyến</h3>
                    <p className="text-[10px] text-slate-405 font-mono mt-0.5">Mã HĐ: {selectedInvoice.invoiceNo} · Số tiền: {selectedInvoice.amount}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content area */}
                <div className="p-5 space-y-4">
                  
                  {paymentSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-55/15 rounded-full border border-emerald-250 text-emerald-600 mb-2 animate-bounce">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{paymentSuccess}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                        Hóa đơn đã được cập nhật trạng thái "ĐÃ THANH TOÁN" thành công trong cơ sở dữ liệu.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Payment Method Switcher */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('QR')}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            paymentMethod === 'QR'
                              ? 'bg-white text-indigo-900 shadow-3xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Chuyển khoản VietQR
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CARD')}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            paymentMethod === 'CARD'
                              ? 'bg-white text-indigo-900 shadow-3xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Thẻ tín dụng / Ghi nợ
                        </button>
                      </div>

                      {/* Payment Details */}
                      {paymentMethod === 'QR' ? (
                        <div className="space-y-4 text-xs">
                          <div className="flex flex-col items-center p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                            {/* VietQR Mock Code */}
                            <div className="w-36 h-36 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center shadow-3xs relative overflow-hidden group">
                              {/* Stylized QR representation */}
                              <div className="w-full h-full flex flex-col justify-between p-1">
                                <div className="flex justify-between">
                                  <div className="w-8 h-8 border-3 border-slate-800 rounded-xs"></div>
                                  <div className="w-8 h-8 border-3 border-slate-800 rounded-xs"></div>
                                </div>
                                <div className="flex justify-between items-end">
                                  <div className="w-8 h-8 border-3 border-slate-800 rounded-xs"></div>
                                  <div className="w-8 h-8 flex flex-wrap gap-0.5 justify-end items-end">
                                    <div className="w-1.5 h-1.5 bg-slate-800"></div>
                                    <div className="w-3 h-1.5 bg-slate-800"></div>
                                    <div className="w-1.5 h-3 bg-slate-800"></div>
                                    <div className="w-3 h-3 bg-slate-800"></div>
                                  </div>
                                </div>
                              </div>
                              {/* Inner small logo icon representation */}
                              <div className="absolute inset-0 m-auto w-8 h-8 bg-white border border-slate-100 rounded-md shadow-3xs flex items-center justify-center p-0.5">
                                <img src="https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png" alt="QR logo" className="w-full h-full object-contain" />
                              </div>
                            </div>

                            <span className="px-2 py-0.5 bg-indigo-55/15 border border-indigo-250 text-indigo-750 text-[10px] font-bold rounded-sm">
                              Quét mã để tự động điền thông tin chuyển khoản
                            </span>
                          </div>

                          {/* Bank info */}
                          <div className="space-y-2.5">
                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                              <span className="text-[9px] text-slate-400 font-mono block">NGÂN HÀNG THỤ HƯỞNG:</span>
                              <p className="font-bold text-slate-700">Vietcombank - CN Hà Nội</p>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center">
                              <div>
                                <span className="text-[9px] text-slate-400 font-mono block">SỐ TÀI KHOẢN TRƯỜNG:</span>
                                <p className="font-bold text-slate-700 font-mono">10099887766</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => navigator.clipboard.writeText('10099887766')}
                                className="text-[10px] text-indigo-600 hover:text-indigo-850 font-bold cursor-pointer"
                              >
                                Sao chép
                              </button>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center">
                              <div>
                                <span className="text-[9px] text-slate-400 font-mono block">NỘI DUNG CHUYỂN KHOẢN:</span>
                                <p className="font-bold text-slate-700 font-mono">THANH TOAN {selectedInvoice.invoiceNo}</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => navigator.clipboard.writeText(`THANH TOAN ${selectedInvoice.invoiceNo}`)}
                                className="text-[10px] text-indigo-600 hover:text-indigo-850 font-bold cursor-pointer"
                              >
                                Sao chép
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleSimulatePayment}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md text-center cursor-pointer"
                          >
                            Tôi đã chuyển khoản thành công
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSimulatePayment} className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">Số thẻ tín dụng</label>
                            <input
                              type="text"
                              required
                              placeholder="4111 2222 3333 4444"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 block">Ngày hết hạn (MM/YY)</label>
                              <input
                                type="text"
                                required
                                placeholder="12/28"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 block">Mã bảo mật CVV</label>
                              <input
                                type="password"
                                required
                                placeholder="***"
                                maxLength={3}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                              />
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-[10px] text-slate-450 font-mono leading-relaxed">
                            Hệ thống sử dụng cổng thanh toán giả lập sandbox. Mọi thông tin thẻ nhập vào sẽ không bị tính phí thực tế.
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md text-center cursor-pointer"
                          >
                            Xác nhận Thanh toán {selectedInvoice.amount}
                          </button>
                        </form>
                      )}
                    </>
                  )}

                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
