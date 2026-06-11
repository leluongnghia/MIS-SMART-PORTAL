import React, { useMemo, useState, useEffect } from 'react';
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileSpreadsheet,
  HeartPulse,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { exportToCsv } from '../utils/exportUtils';

type ConductLevel = 'Tốt' | 'Khá' | 'Trung bình';
type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

interface StudentRecord {
  id: string;
  code: string;
  name: string;
  className: string;
  gender: 'Nam' | 'Nữ';
  birthDate: string;
  avatar: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  address: string;
  healthNote: string;
  conduct: ConductLevel;
  scholarship: string;
  extracurriculars: string[];
  awards: string[];
  disciplineLogs: string[];
  transferHistory?: TransferRecord[];
}

interface TransferRecord {
  id: string;
  date: string;
  fromClass: string;
  toClass: string;
  reason: string;
  approvedBy: string;
}

interface GradeEntry {
  id: string;
  studentId: string;
  subject: string;
  semester: 'HK1' | 'HK2';
  oral: number;
  fifteenMinute: number;
  midterm: number;
  final: number;
}

interface AttendanceEntry {
  id: string;
  studentId: string;
  date: string;
  period?: number;
  status: AttendanceStatus;
  reason?: string;
  note?: string;
  notifiedParent?: boolean;
}

interface ParentNotice {
  id: string;
  studentId: string;
  studentName: string;
  parentEmail: string;
  type: 'ATTENDANCE' | 'GRADE' | 'DISCIPLINE';
  message: string;
  createdAt: string;
}

const STUDENT_STORAGE_KEY = 'mis_sis_students_v2';
const GRADE_STORAGE_KEY = 'mis_sis_grades_v2';
const ATTENDANCE_STORAGE_KEY = 'mis_sis_attendance_v2';
const NOTICE_STORAGE_KEY = 'mis_sis_parent_notices_v2';

const todayIso = () => new Date().toISOString().slice(0, 10);

// Generate 1000 mock students sorted from Grade 1 to 12
const generateMockData = () => {
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const middleNames = ['Văn', 'Thị', 'Minh', 'Anh', 'Gia', 'Đức', 'Quang', 'Xuân', 'Khánh', 'Phương', 'Thanh', 'Tiến', 'Thu', 'Ngọc', 'Hải'];
  const lastNames = ['Lâm', 'Hằng', 'Đạt', 'Linh', 'Hải', 'Huy', 'Tuấn', 'Nam', 'Bình', 'Chi', 'Sơn', 'Trang', 'Vinh', 'Yến', 'Anh', 'Thảo'];

  const studentsList: StudentRecord[] = [];
  const gradesList: GradeEntry[] = [];
  const attendanceList: AttendanceEntry[] = [];
  
  let studentCount = 1;
  const subjects = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Tin học'];
  
  for (let grade = 1; grade <= 12; grade++) {
    const countForGrade = grade <= 8 ? 83 : 84;
    
    for (let s = 1; s <= countForGrade; s++) {
      const classNum = ((s % 2) === 1) ? 1 : 2;
      const className = `${grade}A${classNum}`;
      
      const gender = (studentCount % 2 === 0) ? 'Nữ' : 'Nam';
      const fn = firstNames[(studentCount + s) % firstNames.length];
      const mn = middleNames[(studentCount * 3 + s) % middleNames.length];
      const ln = lastNames[(studentCount * 7 + s) % lastNames.length];
      const name = `${fn} ${mn} ${ln}`;
      
      const birthYear = 2026 - (grade + 5);
      const birthDate = `${birthYear}-09-05`;
      const studentId = `student_gen_${studentCount}`;
      
      const avatarIndex = (studentCount % 70) + 1;
      const avatar = `https://xsgames.co/randomusers/assets/avatars/${gender === 'Nữ' ? 'female' : 'male'}/${avatarIndex}.jpg`;

      studentsList.push({
        id: studentId,
        code: `MIS-${String(grade).padStart(2, '0')}A${classNum}-${String(s).padStart(3, '0')}`,
        name: name,
        className: className,
        gender: gender,
        birthDate: birthDate,
        avatar: avatar,
        parentName: `${fn} ${lastNames[(studentCount + 2) % lastNames.length]}`,
        parentPhone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        parentEmail: `parent.${studentCount}@parent.mis.edu.vn`,
        emergencyContact: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: 'Cầu Giấy, Hà Nội',
        healthNote: 'Bình thường',
        conduct: studentCount % 15 === 0 ? 'Trung bình' : studentCount % 8 === 0 ? 'Khá' : 'Tốt',
        scholarship: studentCount % 25 === 0 ? 'Học bổng 30% Đa Trí Tuệ' : 'Không',
        extracurriculars: studentCount % 5 === 0 ? ['CLB Âm nhạc', 'CLB Bóng rổ'] : [],
        awards: studentCount % 12 === 0 ? ['Học sinh giỏi cấp trường'] : [],
        disciplineLogs: studentCount % 15 === 0 ? ['Đi học muộn nhiều lần'] : [],
      });
      
      // Generate 2 random grades for this student
      const sub1 = subjects[studentCount % subjects.length];
      const sub2 = subjects[(studentCount + 1) % subjects.length];
      
      const randGrade = (min: number, max: number) => Number((min + Math.random() * (max - min)).toFixed(1));
      
      gradesList.push({
        id: `gr_gen_${studentCount}_1`,
        studentId: studentId,
        subject: sub1,
        semester: 'HK1',
        oral: randGrade(6, 10),
        fifteenMinute: randGrade(5, 10),
        midterm: randGrade(5, 10),
        final: randGrade(5, 10)
      });
      
      gradesList.push({
        id: `gr_gen_${studentCount}_2`,
        studentId: studentId,
        subject: sub2,
        semester: 'HK1',
        oral: randGrade(4, 9),
        fifteenMinute: randGrade(4, 9),
        midterm: randGrade(4, 9),
        final: randGrade(4, 9)
      });

      // Generate 2 random attendance records
      const statuses: AttendanceStatus[] = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT', 'ABSENT', 'EXCUSED'];
      attendanceList.push({
        id: `att_gen_${studentCount}_1`,
        studentId: studentId,
        date: '2026-06-08',
        status: statuses[studentCount % statuses.length],
        reason: 'Lý do cá nhân'
      });
      attendanceList.push({
        id: `att_gen_${studentCount}_2`,
        studentId: studentId,
        date: '2026-06-09',
        status: statuses[(studentCount + 2) % statuses.length],
        reason: 'Lý do cá nhân'
      });

      studentCount++;
    }
  }

  return { studentsList, gradesList, attendanceList };
};

const generatedData = generateMockData();
const initialStudents = generatedData.studentsList;
const initialGrades = generatedData.gradesList;
const initialAttendance = generatedData.attendanceList;

function readStored<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function gradeAverage(grade: GradeEntry) {
  return Number(((grade.oral + grade.fifteenMinute + grade.midterm * 2 + grade.final * 3) / 7).toFixed(1));
}

function academicRank(gpa: number) {
  if (gpa >= 8) return 'Giỏi';
  if (gpa >= 6.5) return 'Khá';
  if (gpa >= 5) return 'Trung bình';
  return 'Cần hỗ trợ';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function attendanceLabel(status: AttendanceStatus) {
  if (status === 'PRESENT') return 'Có mặt';
  if (status === 'LATE') return 'Đi muộn';
  if (status === 'ABSENT') return 'Vắng';
  return 'Có phép';
}

function statusColor(status: AttendanceStatus) {
  if (status === 'PRESENT') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'LATE') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (status === 'ABSENT') return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-sky-100 text-sky-700 border-sky-200';
}

export default function StudentSuccessHub() {
  const [students, setStudents] = useState<StudentRecord[]>(() => readStored(STUDENT_STORAGE_KEY, initialStudents));
  const [grades, setGrades] = useState<GradeEntry[]>(() => readStored(GRADE_STORAGE_KEY, initialGrades));
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(() => readStored(ATTENDANCE_STORAGE_KEY, initialAttendance));
  const [notices, setNotices] = useState<ParentNotice[]>(() => readStored(NOTICE_STORAGE_KEY, []));
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('Tất cả');
  const [selectedStudentId, setSelectedStudentId] = useState('student_gen_1');
  const [profileTab, setProfileTab] = useState<'PROFILE' | 'HISTORY' | 'ATTENDANCE' | 'GRADEBOOK' | 'PARENT'>('PROFILE');
  const [newStudentName, setNewStudentName] = useState('');
  const [newGrade, setNewGrade] = useState({ subject: 'Toán', oral: 8, fifteenMinute: 8, midterm: 8, final: 8 });
  const [newDisciplineText, setNewDisciplineText] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(todayIso());
  const [attendancePeriod, setAttendancePeriod] = useState(1);
  const [attendanceReason, setAttendanceReason] = useState('');
  const [transferForm, setTransferForm] = useState({
    date: todayIso(),
    toClass: '10A1',
    reason: '',
  });

  useEffect(() => localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem(GRADE_STORAGE_KEY, JSON.stringify(grades)), [grades]);
  useEffect(() => localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendance)), [attendance]);
  useEffect(() => localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(notices)), [notices]);

  const classOptions = useMemo(() => {
    const uniqueClasses = Array.from(new Set(students.map(student => student.className))) as string[];
    uniqueClasses.sort((a, b) => {
      const gradeA = parseInt(a, 10) || 0;
      const gradeB = parseInt(b, 10) || 0;
      if (gradeA !== gradeB) return gradeA - gradeB;
      return a.localeCompare(b);
    });
    return ['Tất cả', ...uniqueClasses];
  }, [students]);

  const studentMetrics = useMemo(() => {
    return students.map(student => {
      const studentGrades = grades.filter(grade => grade.studentId === student.id);
      const gpa = studentGrades.length
        ? Number((studentGrades.reduce((sum, grade) => sum + gradeAverage(grade), 0) / studentGrades.length).toFixed(1))
        : 0;
      const studentAttendance = attendance.filter(item => item.studentId === student.id);
      const presentCount = studentAttendance.filter(item => item.status === 'PRESENT' || item.status === 'LATE').length;
      const attendanceRate = studentAttendance.length ? Math.round((presentCount / studentAttendance.length) * 100) : 100;
      const absences = studentAttendance.filter(item => item.status === 'ABSENT').length;
      const needSupport = gpa < 5 || attendanceRate < 85 || absences >= 3 || student.disciplineLogs.length > 0;
      return { student, gpa, attendanceRate, absences, needSupport };
    });
  }, [attendance, grades, students]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = studentMetrics.filter(({ student }) => {
      const matchesClass = classFilter === 'Tất cả' || student.className === classFilter;
      const matchesQuery = !query || `${student.name} ${student.code} ${student.className}`.toLowerCase().includes(query);
      return matchesClass && matchesQuery;
    });
    // Sort by Grade level (1 to 12) and then class name, and then student name
    return filtered.sort((a, b) => {
      const gradeA = parseInt(a.student.className, 10) || 0;
      const gradeB = parseInt(b.student.className, 10) || 0;
      if (gradeA !== gradeB) return gradeA - gradeB;
      const classComp = a.student.className.localeCompare(b.student.className);
      if (classComp !== 0) return classComp;
      return a.student.name.localeCompare(b.student.name);
    });
  }, [classFilter, searchQuery, studentMetrics]);

  const selectedMetric = studentMetrics.find(({ student }) => student.id === selectedStudentId) || studentMetrics[0];
  const selectedStudent = selectedMetric?.student;
  const selectedGrades = selectedStudent ? grades.filter(grade => grade.studentId === selectedStudent.id) : [];
  const selectedAttendance = selectedStudent ? attendance.filter(item => item.studentId === selectedStudent.id) : [];

  const stats = useMemo(() => {
    const total = students.length || 1;
    const avgGpa = Number((studentMetrics.reduce((sum, item) => sum + item.gpa, 0) / total).toFixed(1));
    const avgAttendance = Math.round(studentMetrics.reduce((sum, item) => sum + item.attendanceRate, 0) / total);
    const supportCount = studentMetrics.filter(item => item.needSupport).length;
    const absentToday = attendance.filter(item => item.date === todayIso() && item.status === 'ABSENT').length;
    return { total: students.length, avgGpa, avgAttendance, supportCount, absentToday };
  }, [attendance, studentMetrics, students.length]);

  const addNotice = (student: StudentRecord, type: ParentNotice['type'], message: string) => {
    setNotices(prev => [{
      id: `notice_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      parentEmail: student.parentEmail,
      type,
      message,
      createdAt: new Date().toLocaleString('vi-VN', { hour12: false }),
    }, ...prev]);
  };

  const handleAttendanceChange = (student: StudentRecord, status: AttendanceStatus) => {
    setAttendance(prev => {
      const existing = prev.find(item => item.studentId === student.id && item.date === attendanceDate && (item.period || 1) === attendancePeriod);
      if (existing) {
        return prev.map(item => item.id === existing.id ? {
          ...item,
          status,
          period: attendancePeriod,
          reason: attendanceReason.trim() || undefined,
          note: attendanceReason.trim() || item.note,
          notifiedParent: status !== 'PRESENT',
        } : item);
      }
      return [{
        id: `att_${Date.now()}`,
        studentId: student.id,
        date: attendanceDate,
        period: attendancePeriod,
        status,
        reason: attendanceReason.trim() || undefined,
        note: attendanceReason.trim() || undefined,
        notifiedParent: status !== 'PRESENT',
      }, ...prev];
    });

    if (status === 'ABSENT' || status === 'LATE') {
      addNotice(student, 'ATTENDANCE', `${student.name} được ghi nhận trạng thái ${attendanceLabel(status)} tiết ${attendancePeriod}, ngày ${attendanceDate}${attendanceReason.trim() ? `: ${attendanceReason.trim()}` : '.'}`);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const nextId = `student_${Date.now()}`;
    const newStudent: StudentRecord = {
      id: nextId,
      code: `MIS-10A1-${String(students.length + 1).padStart(3, '0')}`,
      name: newStudentName.trim(),
      className: '10A1',
      gender: 'Nam',
      birthDate: '2010-01-01',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
      parentName: 'Phụ huynh chưa cập nhật',
      parentPhone: 'Chưa cập nhật',
      parentEmail: 'parent@mis.edu.vn',
      emergencyContact: 'Chưa cập nhật',
      address: 'Chưa cập nhật',
      healthNote: 'Chưa cập nhật hồ sơ y tế.',
      conduct: 'Tốt',
      scholarship: 'Không',
      extracurriculars: [],
      awards: [],
      disciplineLogs: [],
      transferHistory: [
        { id: `tr_${Date.now()}`, date: todayIso(), fromClass: '-', toClass: '10A1', reason: 'Khởi tạo hồ sơ học sinh mới', approvedBy: 'Hệ thống SIS' },
      ],
    };
    setStudents(prev => [newStudent, ...prev]);
    setSelectedStudentId(nextId);
    setNewStudentName('');
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const entry: GradeEntry = {
      id: `gr_${Date.now()}`,
      studentId: selectedStudent.id,
      subject: newGrade.subject,
      semester: 'HK1',
      oral: Number(newGrade.oral),
      fifteenMinute: Number(newGrade.fifteenMinute),
      midterm: Number(newGrade.midterm),
      final: Number(newGrade.final),
    };
    setGrades(prev => [entry, ...prev]);
    addNotice(selectedStudent, 'GRADE', `Nhà trường đã cập nhật điểm môn ${entry.subject}: trung bình ${gradeAverage(entry)}/10.`);
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !transferForm.toClass.trim()) return;
    const record: TransferRecord = {
      id: `tr_${Date.now()}`,
      date: transferForm.date,
      fromClass: selectedStudent.className,
      toClass: transferForm.toClass.trim(),
      reason: transferForm.reason.trim() || 'Điều chỉnh lớp theo quyết định của nhà trường',
      approvedBy: 'Ban Giám hiệu / Phòng Đào tạo',
    };

    setStudents(prev => prev.map(student => (
      student.id === selectedStudent.id
        ? {
          ...student,
          className: record.toClass,
          transferHistory: [record, ...(student.transferHistory || [])],
        }
        : student
    )));
    setTransferForm({ date: todayIso(), toClass: record.toClass, reason: '' });
  };

  const handleAddDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newDisciplineText.trim()) return;
    setStudents(prev => prev.map(student => (
      student.id === selectedStudent.id
        ? { ...student, disciplineLogs: [newDisciplineText.trim(), ...student.disciplineLogs], conduct: 'Khá' }
        : student
    )));
    addNotice(selectedStudent, 'DISCIPLINE', `Ghi nhận nề nếp: ${newDisciplineText.trim()}`);
    setNewDisciplineText('');
  };

  const handleExportStudents = () => {
    const headers = ['Mã học sinh', 'Họ tên', 'Lớp', 'GPA', 'Chuyên cần', 'Phụ huynh', 'SĐT', 'Email phụ huynh', 'Cảnh báo'];
    const rows = studentMetrics.map(({ student, gpa, attendanceRate, needSupport }) => [
      student.code,
      student.name,
      student.className,
      gpa,
      `${attendanceRate}%`,
      student.parentName,
      student.parentPhone,
      student.parentEmail,
      needSupport ? 'Cần hỗ trợ' : 'Bình thường',
    ]);
    exportToCsv('MIS_SIS_Ho_so_hoc_sinh.csv', headers, rows);
  };

  const handlePrintReportCard = () => {
    if (!selectedStudent) return;
    const studentGrades = selectedGrades;
    const gpa = selectedMetric.gpa;
    const rows = studentGrades.map(grade => `
      <tr>
        <td>${escapeHtml(grade.subject)}</td>
        <td>${grade.oral}</td>
        <td>${grade.fifteenMinute}</td>
        <td>${grade.midterm}</td>
        <td>${grade.final}</td>
        <td><strong>${gradeAverage(grade)}</strong></td>
      </tr>
    `).join('');
    const attendanceRows = selectedAttendance.slice(0, 12).map(item => `
      <tr>
        <td>${item.date}</td>
        <td>Tiết ${item.period || 1}</td>
        <td>${escapeHtml(attendanceLabel(item.status))}</td>
        <td>${escapeHtml(item.reason || item.note || '-')}</td>
      </tr>
    `).join('');
    const historyRows = (selectedStudent.transferHistory || []).map(item => `
      <tr>
        <td>${item.date}</td>
        <td>${escapeHtml(item.fromClass)}</td>
        <td>${escapeHtml(item.toClass)}</td>
        <td>${escapeHtml(item.reason)}</td>
      </tr>
    `).join('');

    const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Hoc ba - ${escapeHtml(selectedStudent.name)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; }
    h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
    h2 { margin: 24px 0 8px; font-size: 15px; color: #1d4ed8; }
    .meta { margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 13px; }
    .summary { margin: 18px 0; padding: 12px; border: 1px solid #cbd5e1; background: #f8fafc; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #eef2ff; }
    .sign { margin-top: 42px; display: flex; justify-content: space-between; text-align: center; font-size: 13px; }
    @media print { button { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <button onclick="window.print()">In / Lưu PDF</button>
  <h1>Phiếu điểm và học bạ tóm tắt</h1>
  <p>Trường Phổ thông Liên cấp Đa Trí Tuệ MIS</p>
  <div class="meta">
    <div><strong>Học sinh:</strong> ${escapeHtml(selectedStudent.name)}</div>
    <div><strong>Mã học sinh:</strong> ${escapeHtml(selectedStudent.code)}</div>
    <div><strong>Lớp:</strong> ${escapeHtml(selectedStudent.className)}</div>
    <div><strong>Phụ huynh:</strong> ${escapeHtml(selectedStudent.parentName)}</div>
    <div><strong>Hạnh kiểm:</strong> ${escapeHtml(selectedStudent.conduct)}</div>
    <div><strong>Chuyên cần:</strong> ${selectedMetric.attendanceRate}%</div>
  </div>
  <div class="summary">
    <strong>GPA:</strong> ${gpa}/10 &nbsp; | &nbsp;
    <strong>Xếp loại học lực:</strong> ${academicRank(gpa)} &nbsp; | &nbsp;
    <strong>Cảnh báo:</strong> ${selectedMetric.needSupport ? 'Cần hỗ trợ' : 'Bình thường'}
  </div>
  <h2>Sổ điểm học kỳ</h2>
  <table>
    <thead><tr><th>Môn</th><th>Miệng</th><th>15 phút</th><th>Giữa kỳ</th><th>Cuối kỳ</th><th>TB môn</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6">Chưa có điểm.</td></tr>'}</tbody>
  </table>
  <h2>Chuyên cần gần nhất</h2>
  <table>
    <thead><tr><th>Ngày</th><th>Tiết</th><th>Trạng thái</th><th>Lý do/Ghi chú</th></tr></thead>
    <tbody>${attendanceRows || '<tr><td colspan="4">Chưa có dữ liệu chuyên cần.</td></tr>'}</tbody>
  </table>
  <h2>Quá trình học tập / chuyển lớp</h2>
  <table>
    <thead><tr><th>Ngày</th><th>Từ lớp</th><th>Đến lớp</th><th>Lý do</th></tr></thead>
    <tbody>${historyRows || '<tr><td colspan="4">Chưa có lịch sử chuyển lớp.</td></tr>'}</tbody>
  </table>
  <div class="sign">
    <div><strong>Giáo viên chủ nhiệm</strong><br/><br/><br/>________________</div>
    <div><strong>Ban Giám hiệu</strong><br/><br/><br/>________________</div>
  </div>
</body>
</html>`;

    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
      popup.focus();
    } else {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Hoc_ba_${selectedStudent.code}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2.5">
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              Student Information System
            </span>
            <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Hồ sơ Học sinh 360° & SIS lõi</h2>
            <p className="text-xs text-slate-300 max-w-3xl font-light leading-relaxed">
              Quản lý hồ sơ học sinh, lớp học, phụ huynh, chuyên cần, sổ điểm, y tế học đường và cảnh báo sớm theo mô hình SIS.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportStudents}
            className="w-fit px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất hồ sơ CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard label="Sĩ số" value={`${stats.total}`} note="Hồ sơ học sinh" icon={Users} color="text-indigo-600" />
        <MetricCard label="GPA trung bình" value={`${stats.avgGpa}`} note="Theo sổ điểm" icon={BookOpen} color="text-sky-600" />
        <MetricCard label="Chuyên cần" value={`${stats.avgAttendance}%`} note="Theo điểm danh" icon={CalendarCheck} color="text-emerald-600" />
        <MetricCard label="Vắng hôm nay" value={`${stats.absentToday}`} note="Cần theo dõi" icon={AlertTriangle} color="text-rose-600" />
        <MetricCard label="Cảnh báo" value={`${stats.supportCount}`} note="Cần hỗ trợ" icon={Bell} color="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-4 bg-white border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs space-y-4">
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Thêm nhanh học sinh mới..."
            />
            <button type="submit" className="px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              Thêm
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
                placeholder="Tìm học sinh..."
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
            >
              {classOptions.map(item => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {filteredStudents.map(({ student, gpa, attendanceRate, needSupport }) => (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedStudentId === student.id ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{student.name}</h4>
                  <span className="text-[10px] text-slate-400 block font-mono">{student.code} · {student.className}</span>
                  <span className="text-[10px] text-slate-500">GPA {gpa} · chuyên cần {attendanceRate}%</span>
                </div>
                {needSupport && (
                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8.5px] font-black rounded-md uppercase font-mono">
                    Cảnh báo
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="xl:col-span-8">
          {selectedStudent ? (
            <div className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-200/60 flex items-center gap-4">
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">{selectedStudent.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-650 text-[10px] font-bold rounded-lg font-mono">{selectedStudent.code}</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg">{selectedStudent.className}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    Phụ huynh: <strong>{selectedStudent.parentName}</strong> · {selectedStudent.parentPhone} · {selectedStudent.parentEmail}
                  </p>
                </div>
                {selectedMetric.needSupport && (
                  <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200">
                    Cần hỗ trợ
                  </span>
                )}
              </div>

              <div className="flex overflow-x-auto border-b border-slate-100 text-xs font-bold text-slate-500 bg-white">
                {[
                  ['PROFILE', 'Hồ sơ'],
                  ['HISTORY', 'Quá trình'],
                  ['ATTENDANCE', 'Điểm danh'],
                  ['GRADEBOOK', 'Sổ điểm'],
                  ['PARENT', 'Phụ huynh'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setProfileTab(id as typeof profileTab)}
                    className={`min-w-28 flex-1 py-3 text-center border-b-2 transition-all ${
                      profileTab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {selectedMetric.needSupport && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-black uppercase tracking-wider text-[9px] mb-1">Cảnh báo sớm:</strong>
                      Học sinh có điểm thấp, chuyên cần thấp hoặc ghi nhận nề nếp. GVCN cần liên hệ phụ huynh và lập kế hoạch hỗ trợ.
                    </div>
                  </div>
                )}

                {profileTab === 'PROFILE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <InfoCard icon={User} label="Thông tin cá nhân" lines={[
                      `Giới tính: ${selectedStudent.gender}`,
                      `Ngày sinh: ${selectedStudent.birthDate}`,
                      `Địa chỉ: ${selectedStudent.address}`,
                    ]} />
                    <InfoCard icon={HeartPulse} label="Y tế học đường" lines={[
                      selectedStudent.healthNote,
                      `Liên hệ khẩn cấp: ${selectedStudent.emergencyContact}`,
                    ]} />
                    <InfoCard icon={Award} label="Thành tích & học bổng" lines={[
                      `Học bổng: ${selectedStudent.scholarship}`,
                      ...selectedStudent.awards,
                    ]} />
                    <InfoCard icon={CheckCircle2} label="Hoạt động & hạnh kiểm" lines={[
                      `Hạnh kiểm: ${selectedStudent.conduct}`,
                      selectedStudent.extracurriculars.length ? selectedStudent.extracurriculars.join(', ') : 'Chưa ghi nhận hoạt động ngoại khóa.',
                    ]} />
                  </div>
                )}

                {profileTab === 'ATTENDANCE' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as AttendanceStatus[]).map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleAttendanceChange(selectedStudent, status)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border ${statusColor(status)}`}
                        >
                          {attendanceLabel(status)}
                        </button>
                      ))}
                    </div>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="text-left px-4 py-2">Ngày</th>
                            <th className="text-left px-4 py-2">Trạng thái</th>
                            <th className="text-left px-4 py-2">Ghi chú</th>
                            <th className="text-center px-4 py-2">Phụ huynh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedAttendance.map(item => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 font-mono">{item.date}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusColor(item.status)}`}>
                                  {attendanceLabel(item.status)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-slate-500">{item.note || '-'}</td>
                              <td className="px-4 py-2 text-center">{item.notifiedParent ? 'Đã báo' : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {profileTab === 'GRADEBOOK' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddGrade} className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <select value={newGrade.subject} onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })} className="text-xs border rounded-lg px-2 py-2 bg-white">
                        <option>Toán</option>
                        <option>Ngữ văn</option>
                        <option>Tiếng Anh</option>
                        <option>Vật lý</option>
                        <option>Hóa học</option>
                        <option>Tin học</option>
                      </select>
                      {(['oral', 'fifteenMinute', 'midterm', 'final'] as const).map(field => (
                        <input
                          key={field}
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          value={newGrade[field]}
                          onChange={(e) => setNewGrade({ ...newGrade, [field]: Number(e.target.value) })}
                          className="text-xs border rounded-lg px-2 py-2 bg-white"
                        />
                      ))}
                      <button type="submit" className="text-xs font-bold rounded-lg bg-indigo-600 text-white px-3 py-2">Thêm điểm</button>
                    </form>

                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="text-left px-4 py-2">Môn</th>
                            <th className="text-center px-4 py-2">Miệng</th>
                            <th className="text-center px-4 py-2">15 phút</th>
                            <th className="text-center px-4 py-2">Giữa kỳ</th>
                            <th className="text-center px-4 py-2">Cuối kỳ</th>
                            <th className="text-center px-4 py-2">TB</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedGrades.map(grade => (
                            <tr key={grade.id}>
                              <td className="px-4 py-2 font-bold text-slate-800">{grade.subject}</td>
                              <td className="px-4 py-2 text-center">{grade.oral}</td>
                              <td className="px-4 py-2 text-center">{grade.fifteenMinute}</td>
                              <td className="px-4 py-2 text-center">{grade.midterm}</td>
                              <td className="px-4 py-2 text-center">{grade.final}</td>
                              <td className="px-4 py-2 text-center font-black text-indigo-700">{gradeAverage(grade)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {profileTab === 'PARENT' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard icon={Mail} label="Kênh liên lạc phụ huynh" lines={[
                        `Phụ huynh: ${selectedStudent.parentName}`,
                        `Điện thoại: ${selectedStudent.parentPhone}`,
                        `Email: ${selectedStudent.parentEmail}`,
                      ]} />
                      <form onSubmit={handleAddDiscipline} className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-500">Ghi nhận nề nếp và báo phụ huynh</label>
                        <textarea
                          value={newDisciplineText}
                          onChange={(e) => setNewDisciplineText(e.target.value)}
                          rows={3}
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none"
                          placeholder="Ví dụ: Không hoàn thành bài tập, đi học muộn nhiều lần..."
                        />
                        <button type="submit" className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold">Ghi nhận & tạo thông báo</button>
                      </form>
                    </div>

                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="text-left px-4 py-2">Thời gian</th>
                            <th className="text-left px-4 py-2">Loại</th>
                            <th className="text-left px-4 py-2">Nội dung</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {notices.filter(notice => notice.studentId === selectedStudent.id).map(notice => (
                            <tr key={notice.id}>
                              <td className="px-4 py-2 font-mono text-slate-500">{notice.createdAt}</td>
                              <td className="px-4 py-2 font-bold text-slate-700">{notice.type}</td>
                              <td className="px-4 py-2 text-slate-600">{notice.message}</td>
                            </tr>
                          ))}
                          {notices.filter(notice => notice.studentId === selectedStudent.id).length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-slate-400">Chưa có thông báo phụ huynh.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-450 italic">
              Vui lòng chọn một học sinh trong danh sách để xem hồ sơ.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon, color }: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <strong className={`text-2xl font-display font-black mt-1.5 block ${color}`}>{value}</strong>
      <span className="text-[10.5px] text-slate-500 mt-1 block">{note}</span>
    </div>
  );
}

function InfoCard({ icon: Icon, label, lines }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-indigo-600" />
        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wide">{label}</span>
      </div>
      <div className="space-y-1">
        {lines.map((line, index) => (
          <p key={`${label}-${index}`} className="text-xs text-slate-650 leading-relaxed">{line}</p>
        ))}
      </div>
    </div>
  );
}
