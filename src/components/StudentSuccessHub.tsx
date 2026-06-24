import { serverStorage } from '../libs/client/server-storage';
import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  Lock,
  FileText,
  FileDown,
  FileUp,
  Activity
} from 'lucide-react';
import { exportToCsv } from '../utils/exportUtils';
import { UserProfile, AcademicYearRecord, HealthIncident, VaccinationRecord, SisAuditLog } from '../types';
import { getGradeLevelFromClassName, getSubjectsForClassName } from '../utils/vietnameseCurriculum';
import { encryptData, decryptData, generateBackupSignature } from '../utils/security';
import { normalizeStudentProfile, normalizeStudentProfiles, initializeUnifiedDatabase, getUnifiedStudents, saveUnifiedStudents, UnifiedStudent } from '../utils/peopleDirectory';
import { readCrmLeadsFromStorage, syncEnrolledCrmLeadsToLifecycle } from '../utils/crmStudentSync';
import { firestoreDb as db } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { useToast } from './ui/Toast';

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
  academicHistory?: AcademicYearRecord[];
  healthInsurance?: string;
  allergies?: string[];
  conditions?: string[];
  healthIncidents?: HealthIncident[];
  vaccinations?: VaccinationRecord[];
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

const STUDENT_STORAGE_KEY = 'mis_sis_students_v3';
const GRADE_STORAGE_KEY = 'mis_sis_grades_v3';
const ATTENDANCE_STORAGE_KEY = 'mis_sis_attendance_v3';
const NOTICE_STORAGE_KEY = 'mis_sis_parent_notices_v3';

const todayIso = () => new Date().toISOString().slice(0, 10);

// Generate mock students: 12 grades, 3 classes per grade, 30 students per class
const generateMockData = () => {
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];

  const studentsList: StudentRecord[] = [];
  const gradesList: GradeEntry[] = [];
  const attendanceList: AttendanceEntry[] = [];
  
  let studentCount = 1;
  for (let grade = 1; grade <= 12; grade++) {
    for (let c = 1; c <= 3; c++) {
      const className = `${grade}A${c}`;
      const classSubjects = getSubjectsForClassName(className)
        .filter(subject => subject.type !== 'Hoạt động giáo dục')
        .map(subject => subject.name);
      
      for (let s = 1; s <= 30; s++) {
        const gender = (studentCount % 2 === 0) ? 'Nữ' : 'Nam';
        const fn = firstNames[(studentCount + s) % firstNames.length];
        
        let mn = '';
        let ln = '';
        if (gender === 'Nữ') {
          const femaleMiddle = ['Thị', 'Ngọc', 'Thu', 'Phương', 'Khánh', 'Minh', 'Thanh', 'Tuyết', 'Hồng', 'Kiều'];
          const femaleLast = ['Hằng', 'Linh', 'Chi', 'Trang', 'Yến', 'Thảo', 'Vy', 'Mai', 'Lan', 'Hương', 'Hạnh', 'Oanh', 'Ngọc', 'Anh'];
          mn = femaleMiddle[(studentCount * 3 + s) % femaleMiddle.length];
          ln = femaleLast[(studentCount * 7 + s) % femaleLast.length];
        } else {
          const maleMiddle = ['Văn', 'Minh', 'Gia', 'Đức', 'Quang', 'Anh', 'Tiến', 'Hải', 'Thành', 'Hoàng'];
          const maleLast = ['Lâm', 'Đạt', 'Hải', 'Huy', 'Tuấn', 'Nam', 'Bình', 'Sơn', 'Vinh', 'Phong', 'Hùng', 'Dũng', 'Quân', 'Khánh'];
          mn = maleMiddle[(studentCount * 3 + s) % maleMiddle.length];
          ln = maleLast[(studentCount * 7 + s) % maleLast.length];
        }
        const name = `${fn} ${mn} ${ln}`;
        
        const birthYear = 2026 - (grade + 5);
        const birthDate = `${birthYear}-09-05`;
        const studentId = `student_gen_${studentCount}`;
        
        const avatarIndex = (studentCount % 70) + 1;
        const avatar = `https://xsgames.co/randomusers/assets/avatars/${gender === 'Nữ' ? 'female' : 'male'}/${avatarIndex}.jpg`;

        const baseStudent: StudentRecord = {
          id: studentId,
          code: `MIS-${String(grade).padStart(2, '0')}A${c}-${String(s).padStart(3, '0')}`,
          name: name,
          className: className,
          gender: gender,
          birthDate: birthDate,
          avatar: avatar,
          parentName: `${fn} ${gender === 'Nữ' ? 'Thị' : 'Văn'} ${ln}`,
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
          healthInsurance: `DN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          allergies: studentCount % 10 === 0 ? ['Hải sản'] : studentCount % 18 === 0 ? ['Đậu phộng'] : [],
          conditions: studentCount % 15 === 0 ? ['Tim bẩm sinh'] : studentCount % 22 === 0 ? ['Hen suyễn'] : [],
          healthIncidents: studentCount % 15 === 0 ? [
            { id: `inc_${studentCount}`, date: '2026-05-15', symptoms: 'Đau đầu, sốt nhẹ', treatment: 'Nghỉ ngơi tại phòng y tế, uống Paracetamol', nurseName: 'Cô Mai Phương Dũng', status: 'DA_XU_LY' }
          ] : [],
          vaccinations: [
            { id: `vac_${studentCount}_1`, vaccineName: 'Uốn ván', date: '2025-10-12', dose: 'Mũi 1' },
            { id: `vac_${studentCount}_2`, vaccineName: 'Cúm mùa', date: '2026-01-20', dose: 'Mũi 1' }
          ],
          academicHistory: [
            { id: `hist_${studentCount}_1`, schoolYear: '2024-2025', className: `${grade - 1 > 0 ? grade - 1 : 1}A${c}`, gpa: Number((6.5 + Math.random() * 3).toFixed(1)), conduct: 'Tốt', teacherName: 'Cô Nguyễn Thanh Lan' }
          ]
        };
        const normalizedStudent = normalizeStudentProfile(baseStudent, studentCount, { refreshContact: true }) as StudentRecord;
        normalizedStudent.avatar = `https://xsgames.co/randomusers/assets/avatars/${normalizedStudent.gender === 'Nữ' ? 'female' : 'male'}/${avatarIndex}.jpg`;
        studentsList.push(normalizedStudent);
        
        // Generate 2 random grades for this student
        const sub1 = classSubjects[studentCount % classSubjects.length] || 'Toán';
        const sub2 = classSubjects[(studentCount + 1) % classSubjects.length] || 'Ngữ văn';
        
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
  }

  return { studentsList, gradesList, attendanceList };
};

const generatedData = generateMockData();
const initialStudents = generatedData.studentsList;
const initialGrades = generatedData.gradesList;
const initialAttendance = generatedData.attendanceList;

// Secure local storage helpers — data is encrypted at rest
function readStored<T>(key: string, fallback: T): T {
  try {
    const saved = serverStorage.getItem(key);
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
  serverStorage.setItem(key, encryptData(data));
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

export default function StudentSuccessHub({ currentUser }: { currentUser: UserProfile }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const unified = initializeUnifiedDatabase(initialStudents, []);
    return unified.filter(s => s.enrollmentStatus === 'ENROLLED') as StudentRecord[];
  });
  const [grades, setGrades] = useState<GradeEntry[]>(() => readStored(GRADE_STORAGE_KEY, initialGrades));
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(() => readStored(ATTENDANCE_STORAGE_KEY, initialAttendance));
  const [notices, setNotices] = useState<ParentNotice[]>(() => readStored(NOTICE_STORAGE_KEY, []));
  const [auditLogs, setAuditLogs] = useState<SisAuditLog[]>(() => readStored('mis_sis_audit_logs_v3', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('Tất cả');
  const [selectedStudentId, setSelectedStudentId] = useState('student_gen_1');
  const [profileTab, setProfileTab] = useState<'PROFILE' | 'HISTORY' | 'ATTENDANCE' | 'GRADEBOOK' | 'PARENT' | 'SECURITY'>('PROFILE');
  const [newStudentName, setNewStudentName] = useState('');
  const [newGrade, setNewGrade] = useState({ subject: 'Toán', oral: 8, fifteenMinute: 8, midterm: 8, final: 8 });
  const [newDisciplineText, setNewDisciplineText] = useState('');

  // Main module tab
  const [mainTab, setMainTab] = useState<'STUDENTS' | 'PARENT_PORTAL' | 'EARLY_WARNING'>('STUDENTS');

  // Parent Portal / Early Warning state
  const [parentMessages] = useState([
    { id: 'pm1', student: 'Nguyễn Văn An', class: '10A1', parent: 'Nguyễn Văn Hùng', phone: '0912345678', email: 'hung@email.com', subject: 'Hỏi về kết quả học tập HK2', date: '2026-06-12', read: false, type: 'INQUIRY' as const },
    { id: 'pm2', student: 'Trần Thị Bích', class: '11B2', parent: 'Trần Minh Thái', phone: '0987654321', email: 'thai@email.com', subject: 'Thông báo học sinh nghỉ ốm 3 ngày', date: '2026-06-11', read: true, type: 'LEAVE' as const },
    { id: 'pm3', student: 'Lê Hoàng Nam', class: '9C1', parent: 'Lê Văn Phúc', phone: '0901234567', email: 'phuc@email.com', subject: 'Xin tư vấn hướng nghề nghiệp', date: '2026-06-10', read: false, type: 'INQUIRY' as const },
    { id: 'pm4', student: 'Phạm Thu Hà', class: '12A3', parent: 'Phạm Ngọc Lan', phone: '0976543210', email: 'lan@email.com', subject: 'Phản ánh về điều kiện cơ sở vật chất', date: '2026-06-09', read: true, type: 'FEEDBACK' as const },
  ]);

  const earlyWarnings = useMemo(() => {
    return students.slice(0, 30).map(s => {
      const stuGrades = grades.filter(g => g.studentId === s.id);
      const avgGpa = stuGrades.length ? stuGrades.reduce((sum, g) => sum + ((g.oral + g.fifteenMinute + g.midterm + g.final * 2) / 5), 0) / stuGrades.length : 8;
      const stuAtt = attendance.filter(a => a.studentId === s.id);
      const absentDays = stuAtt.filter(a => a.status === 'ABSENT').length;
      const alerts: string[] = [];
      if (avgGpa < 5) alerts.push('📉 GPA thấp');
      if (absentDays >= 3) alerts.push('📅 Vắng nhiều');
      if (s.disciplineLogs.length >= 2) alerts.push('⚠ Kỷ luật');
      if (s.conduct === 'Trung bình') alerts.push('🔶 Hạnh kiểm TB');
      return { ...s, gpa: Math.round(avgGpa * 10) / 10, absentDays, alerts, needSupport: alerts.length > 0 };
    }).filter(s => s.needSupport);
  }, [students, grades, attendance]);

  // Academic History form states
  const [newHistYear, setNewHistYear] = useState('2025-2026');
  const [newHistClass, setNewHistClass] = useState('9A1');
  const [newHistGpa, setNewHistGpa] = useState(8.0);
  const [newHistConduct, setNewHistConduct] = useState<'Tốt' | 'Khá' | 'Trung bình'>('Tốt');
  const [newHistTeacher, setNewHistTeacher] = useState('Cô Lê Thị Thanh Nhàn');

  // Health editing states
  const [editingHealth, setEditingHealth] = useState(false);
  const [healthInsuranceVal, setHealthInsuranceVal] = useState('');
  const [allergiesVal, setAllergiesVal] = useState('');
  const [conditionsVal, setConditionsVal] = useState('');
  const [healthNoteVal, setHealthNoteVal] = useState('');

  // Profile editing states
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileNameVal, setProfileNameVal] = useState('');
  const [profileGenderVal, setProfileGenderVal] = useState('');
  const [profileBirthDateVal, setProfileBirthDateVal] = useState('');
  const [profileAddressVal, setProfileAddressVal] = useState('');
  const [profileParentNameVal, setProfileParentNameVal] = useState('');
  const [profileParentPhoneVal, setProfileParentPhoneVal] = useState('');
  const [profileParentEmailVal, setProfileParentEmailVal] = useState('');
  const [profileEmergencyContactVal, setProfileEmergencyContactVal] = useState('');

  // Health Incident form states
  const [newIncDate, setNewIncDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newIncSymptoms, setNewIncSymptoms] = useState('');
  const [newIncTreatment, setNewIncTreatment] = useState('');
  const [newIncStatus, setNewIncStatus] = useState<'DA_XU_LY' | 'THEO_DOI'>('DA_XU_LY');

  // Vaccine form states
  const [newVacName, setNewVacName] = useState('');
  const [newVacDate, setNewVacDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newVacDose, setNewVacDose] = useState('Mũi 1');

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newVacName.trim()) return;
    const isNurse = currentUser.workspaceId === 'HANH_CHINH' && currentUser.title.includes('Y tế');
    const canEdit = currentUser.role === 'ADMIN' || isNurse;
    if (!canEdit) {
      toastError('Lỗi quyền hạn', 'Bạn không có quyền ghi nhận tiêm chủng.');
      return;
    }
    const record: VaccinationRecord = {
      id: `vac_${Date.now()}`,
      vaccineName: newVacName.trim(),
      date: newVacDate,
      dose: newVacDose
    };
    setStudents(prev => prev.map(student => (
      student.id === selectedStudent.id
        ? { ...student, vaccinations: [record, ...(student.vaccinations || [])] }
        : student
    )));
    logSisAction('Ghi nhận tiêm chủng', selectedStudent.name, `Vaccine: ${newVacName.trim()}, Liều: ${newVacDose}`);
    setNewVacName('');
  };

  // Logging function
  const logSisAction = (action: string, targetStudentName: string, details: string) => {
    const newLog: SisAuditLog = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN', { hour12: false }),
      operatorName: currentUser?.name || 'Ẩn danh',
      operatorRole: currentUser?.roleName || currentUser?.role || 'Khách',
      action,
      targetStudentName,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };
  const [attendanceDate, setAttendanceDate] = useState(todayIso());
  const [attendancePeriod, setAttendancePeriod] = useState(1);
  const [attendanceReason, setAttendanceReason] = useState('');
  const [transferForm, setTransferForm] = useState({
    date: todayIso(),
    toClass: '10A1',
    reason: '',
  });

  // Real-time Firestore Sync Listeners
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'mis_student_directory'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UnifiedStudent[];
      if (list.length > 0) {
        const enrolled = list.filter(s => s.enrollmentStatus === 'ENROLLED') as StudentRecord[];
        setStudents(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(enrolled)) {
            return enrolled;
          }
          return prev;
        });
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, GRADE_STORAGE_KEY), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GradeEntry[];
      if (list.length > 0) {
        setGrades(prev => {
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
    const currentUnified = getUnifiedStudents();
    const nextUnified = currentUnified.map(student => {
      const match = students.find(s => s.id === student.id);
      if (match) {
        return {
          ...student,
          ...match,
        };
      }
      return student;
    });

    students.forEach(student => {
      const exists = nextUnified.some(s => s.id === student.id);
      if (!exists) {
        nextUnified.push({
          ...student,
          enrollmentStatus: 'ENROLLED',
        } as UnifiedStudent);
      }
    });

    saveUnifiedStudents(nextUnified);
  }, [students]);

  useEffect(() => {
    writeStored(GRADE_STORAGE_KEY, grades);
    const syncGrades = async () => {
      try {
        for (const g of grades) {
          await setDoc(doc(db, GRADE_STORAGE_KEY, g.id), g);
        }
      } catch (e) {
        console.warn('Failed to sync grades to Firestore: ', e);
      }
    };
    syncGrades();
  }, [grades]);

  useEffect(() => writeStored(ATTENDANCE_STORAGE_KEY, attendance), [attendance]);
  useEffect(() => writeStored(NOTICE_STORAGE_KEY, notices), [notices]);
  useEffect(() => writeStored('mis_sis_audit_logs_v3', auditLogs), [auditLogs]);

  const lastLoggedStudentRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedStudent && lastLoggedStudentRef.current !== selectedStudent.id) {
      logSisAction('Xem hồ sơ', selectedStudent.name, 'Xem chi tiết thông tin học sinh');
      lastLoggedStudentRef.current = selectedStudent.id;
    }
  }, [selectedStudentId]);

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
  const selectedGradeLevel = selectedStudent ? getGradeLevelFromClassName(selectedStudent.className) : null;
  const selectedClassSubjects = selectedStudent ? getSubjectsForClassName(selectedStudent.className) : [];

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
    // Permission check
    const canEdit = currentUser.role === 'ADMIN' || 
                    (currentUser.role === 'MANAGER' && currentUser.workspaceId === 'CTHS_TAM_LY') ||
                    (currentUser.role === 'STAFF' && (currentUser.workspaceId === 'TOAN_TIN' || currentUser.workspaceId === 'VAN'));
    if (!canEdit) {
      toastError('Lỗi quyền hạn', 'Bạn không có quyền điểm danh học vụ.');
      return;
    }

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

    logSisAction('Điểm danh', student.name, `Ghi nhận trạng thái ${attendanceLabel(status)} tiết ${attendancePeriod} ngày ${attendanceDate}`);

    if (status === 'ABSENT' || status === 'LATE') {
      addNotice(student, 'ATTENDANCE', `${student.name} được ghi nhận trạng thái ${attendanceLabel(status)} tiết ${attendancePeriod}, ngày ${attendanceDate}${attendanceReason.trim() ? `: ${attendanceReason.trim()}` : '.'}`);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'ADMIN') {
      toastError('Lỗi quyền hạn', 'Chỉ Ban Giám hiệu mới có quyền thêm học sinh mới.');
      return;
    }
    if (!newStudentName.trim()) return;
    const nextId = `student_${Date.now()}`;
    const newStudent = normalizeStudentProfile({
      id: nextId,
      code: `MIS-10A1-${String(students.length + 1).padStart(3, '0')}`,
      name: newStudentName.trim(),
      className: '10A1',
      gender: 'Nam',
      birthDate: '2010-01-01',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
      parentName: 'Phụ huynh chưa cập nhật',
      parentPhone: 'Chưa cập nhật',
      parentEmail: 'parent@misvn.edu.vn',
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
      academicHistory: [],
      healthIncidents: [],
      vaccinations: []
    }, students.length + 1, { refreshContact: true }) as StudentRecord;
    setStudents(prev => [newStudent, ...prev]);
    logSisAction('Thêm học sinh', newStudent.name, 'Thêm mới hồ sơ học sinh');
    setSelectedStudentId(nextId);
    setNewStudentName('');
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    // Check permission
    const isToanTinTeacher = currentUser.workspaceId === 'TOAN_TIN' && ['Toán', 'Tin học', 'Tin học và Công nghệ', 'Vật lí', 'Vật lý', 'Hóa học', 'Khoa học tự nhiên', 'Khoa học', 'Công nghệ'].includes(newGrade.subject);
    const isVanTeacher = currentUser.workspaceId === 'VAN' && newGrade.subject === 'Ngữ văn';
    const isEngTeacher = currentUser.workspaceId === 'QUOC_TE' && ['Tiếng Anh', 'Ngoại ngữ 1', 'Ngoại ngữ 2', 'Tiếng Trung'].includes(newGrade.subject);
    const canEdit = currentUser.role === 'ADMIN' || isToanTinTeacher || isVanTeacher || isEngTeacher;

    if (!canEdit) {
      toastError('Lỗi quyền hạn', `Bạn không có quyền nhập điểm môn ${newGrade.subject} (quyền hạn thuộc Tổ chuyên môn).`);
      return;
    }

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
    logSisAction('Nhập điểm', selectedStudent.name, `Nhập điểm môn ${entry.subject}: miệng ${entry.oral}, 15p ${entry.fifteenMinute}, giữa kỳ ${entry.midterm}, cuối kỳ ${entry.final}`);
    addNotice(selectedStudent, 'GRADE', `Nhà trường đã cập nhật điểm môn ${entry.subject}: trung bình ${gradeAverage(entry)}/10.`);
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'ADMIN') {
      toastError('Lỗi quyền hạn', 'Chỉ Ban Giám hiệu mới có quyền điều chuyển lớp học sinh.');
      return;
    }
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
    logSisAction('Chuyển lớp', selectedStudent.name, `Chuyển lớp từ ${selectedStudent.className} sang ${record.toClass}. Lý do: ${record.reason}`);
    setTransferForm({ date: todayIso(), toClass: record.toClass, reason: '' });
  };

  const handleAddDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newDisciplineText.trim()) return;
    const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER' || currentUser.workspaceId === 'CTHS_TAM_LY';
    if (!canEdit) {
      toastError('Lỗi quyền hạn', 'Bạn không có quyền ghi nhận nề nếp học sinh.');
      return;
    }

    setStudents(prev => prev.map(student => (
      student.id === selectedStudent.id
        ? { ...student, disciplineLogs: [newDisciplineText.trim(), ...student.disciplineLogs], conduct: 'Khá' }
        : student
    )));
    logSisAction('Ghi nhận nề nếp', selectedStudent.name, `Vi phạm: ${newDisciplineText.trim()}`);
    addNotice(selectedStudent, 'DISCIPLINE', `Ghi nhận nề nếp: ${newDisciplineText.trim()}`);
    setNewDisciplineText('');
  };

  const handleExportStudents = () => {
    if (currentUser.role !== 'ADMIN') {
      toastError('An ninh SIS', 'Chỉ Ban Giám hiệu mới có quyền xuất dữ liệu học sinh ra file CSV.');
      return;
    }
    const headers = ['Mã học sinh', 'Họ tên', 'Lớp', 'GPA', 'Chuyên cần', 'Phụ huynh', 'SĐT', 'Email phụ huynh', 'Cảnh báo'];
    const rows = studentMetrics.map(({ student, gpa, attendanceRate, needSupport }) => [
      student.code,
      student.name,
      student.className,
      String(gpa),
      `${attendanceRate}%`,
      student.parentName,
      student.parentPhone,
      student.parentEmail,
      needSupport ? 'Cần hỗ trợ' : 'Bình thường',
    ]);
    exportToCsv('MIS_SIS_Ho_so_hoc_sinh.csv', headers, rows);
    logSisAction('Xuất dữ liệu', 'Tất cả học sinh', 'Tải danh sách hồ sơ CSV toàn trường');
  };



  const handleAddAcademicHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (currentUser.role !== 'ADMIN') {
      toastError('Lỗi quyền hạn', 'Chỉ Ban Giám hiệu mới có quyền thêm lịch sử năm học.');
      return;
    }
    const record: AcademicYearRecord = {
      id: `hist_${Date.now()}`,
      schoolYear: newHistYear,
      className: newHistClass,
      gpa: Number(newHistGpa),
      conduct: newHistConduct,
      teacherName: newHistTeacher
    };
    setStudents(prev => prev.map(student => (
      student.id === selectedStudent.id
        ? { ...student, academicHistory: [record, ...(student.academicHistory || [])] }
        : student
    )));
    logSisAction('Thêm lịch sử học tập', selectedStudent.name, `Năm học ${newHistYear}: lớp ${newHistClass}, GPA ${newHistGpa}, Hạnh kiểm ${newHistConduct}`);
  };

  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const isNurse = currentUser.workspaceId === 'HANH_CHINH' && currentUser.title.includes('Y tế');
    const canEdit = currentUser.role === 'ADMIN' || isNurse;
    if (!canEdit) {
      toastError('Lỗi quyền hạn', 'Bạn không có quyền chỉnh sửa hồ sơ y tế học sinh.');
      return;
    }
    setStudents(prev => prev.map(student => (
      student.id === selectedStudent.id
        ? {
            ...student,
            healthInsurance: healthInsuranceVal,
            allergies: allergiesVal.split(',').map(s => s.trim()).filter(Boolean),
            conditions: conditionsVal.split(',').map(s => s.trim()).filter(Boolean),
            healthNote: healthNoteVal
          }
        : student
    )));
    logSisAction('Cập nhật y tế', selectedStudent.name, `Cập nhật BHYT: ${healthInsuranceVal}, Dị ứng: ${allergiesVal}, Bệnh nền: ${conditionsVal}`);
    setEditingHealth(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (currentUser.role !== 'ADMIN') {
      toastError('Lỗi quyền hạn', 'Bạn không có quyền chỉnh sửa hồ sơ học sinh.');
      return;
    }
    setStudents(prev => prev.map(student => (
      student.id === selectedStudent.id
        ? {
            ...student,
            name: profileNameVal.trim(),
            gender: profileGenderVal as StudentRecord['gender'],
            birthDate: profileBirthDateVal,
            address: profileAddressVal.trim(),
            parentName: profileParentNameVal.trim(),
            parentPhone: profileParentPhoneVal.trim(),
            parentEmail: profileParentEmailVal.trim(),
            emergencyContact: profileEmergencyContactVal.trim(),
          }
        : student
    )));
    logSisAction('Sửa hồ sơ', selectedStudent.name, `Cập nhật thông tin cơ bản: ${profileNameVal}, Giới tính: ${profileGenderVal}, SĐT phụ huynh: ${profileParentPhoneVal}`);
    setEditingProfile(false);
  };

  const handleAddHealthIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newIncSymptoms.trim()) return;
    const isNurse = currentUser.workspaceId === 'HANH_CHINH' && currentUser.title.includes('Y tế');
    const canEdit = currentUser.role === 'ADMIN' || isNurse;
    if (!canEdit) {
      toastError('Lỗi quyền hạn', 'Bạn không có quyền ghi nhận sự cố y tế học đường.');
      return;
    }
    const record: HealthIncident = {
      id: `inc_${Date.now()}`,
      date: newIncDate,
      symptoms: newIncSymptoms.trim(),
      treatment: newIncTreatment.trim() || 'Sơ cứu tại chỗ',
      nurseName: currentUser.name,
      status: newIncStatus
    };
    setStudents(prev => prev.map(student => (
      student.id === selectedStudent.id
        ? { ...student, healthIncidents: [record, ...(student.healthIncidents || [])] }
        : student
    )));
    logSisAction('Ghi sự cố y tế', selectedStudent.name, `Triệu chứng: ${newIncSymptoms.trim()}, Hướng xử lý: ${record.treatment}`);
    setNewIncSymptoms('');
    setNewIncTreatment('');
  };

  const handlePrintClassReportCard = () => {
    if (classFilter === 'Tất cả') {
      toastError('Lỗi nhập liệu', 'Vui lòng chọn một lớp cụ thể để xuất bảng điểm cả lớp.');
      return;
    }
    const classStudents = studentMetrics.filter(({ student }) => student.className === classFilter);
    const rows = classStudents.map(({ student, gpa, attendanceRate, absences, needSupport }, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(student.code)}</td>
        <td><strong>${escapeHtml(student.name)}</strong></td>
        <td>${student.gender}</td>
        <td>${student.birthDate}</td>
        <td>${gpa}</td>
        <td>${attendanceRate}%</td>
        <td>${absences}</td>
        <td>${student.conduct}</td>
        <td>${needSupport ? '<span style="color:red">Cần hỗ trợ</span>' : 'Bình thường'}</td>
      </tr>
    `).join('');

    const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Bảng điểm lớp ${classFilter}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; }
    h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #eef2ff; }
    .sign { margin-top: 42px; display: flex; justify-content: space-between; text-align: center; font-size: 13px; }
    @media print { button { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <button onclick="window.print()">In bảng điểm</button>
  <h1>Bảng tổng hợp học lực & chuyên cần</h1>
  <p>Trường Phổ thông Liên cấp Đa Trí Tuệ MIS | Lớp: <strong>${classFilter}</strong></p>
  <p>Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}</p>
  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Mã HS</th>
        <th>Họ tên</th>
        <th>Giới tính</th>
        <th>Ngày sinh</th>
        <th>GPA TB</th>
        <th>Chuyên cần</th>
        <th>Số ngày vắng</th>
        <th>Hạnh kiểm</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="10">Không có dữ liệu học sinh.</td></tr>'}</tbody>
  </table>
  <div class="sign">
    <div><strong>Giáo viên chủ nhiệm lớp ${classFilter}</strong><br/><br/><br/>________________</div>
    <div><strong>Ban Giám hiệu</strong><br/><br/><br/>________________</div>
  </div>
</body>
</html>`;

    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
    }
    logSisAction('Xuất bảng điểm lớp', `Lớp ${classFilter}`, `In bảng điểm tổng hợp ${classStudents.length} học sinh`);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser.role !== 'ADMIN') {
      toastError('Lỗi quyền hạn', 'Chỉ Ban Giám hiệu mới có quyền khôi phục cơ sở dữ liệu.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;

        // 🛡️ XSS Guard: reject files containing HTML/script tags
        if (/<\s*script|<\s*iframe|<\s*img|on\w+\s*=/i.test(rawText)) {
          toastError('An ninh SIS', 'File backup bị từ chối: Phát hiện mã HTML/JavaScript nguy hiểm (XSS). Vui lòng sử dụng file backup gốc từ hệ thống.');
          return;
        }

        const data = JSON.parse(rawText);

        // 🛡️ Signature Verification: verify backup was not tampered with
        if (data.signature !== undefined) {
          const { signature, ...payloadWithoutSig } = data;
          const expectedSig = generateBackupSignature(JSON.stringify(payloadWithoutSig));
          if (signature !== expectedSig) {
            toastError('An ninh SIS', 'Xác thực thất bại: Chữ ký số không hợp lệ. File backup có thể đã bị chỉnh sửa hoặc giả mạo. Hủy khôi phục.');
            return;
          }
        }

        if (data.students && data.grades && data.attendance) {
          setStudents(data.students);
          setGrades(data.grades);
          setAttendance(data.attendance);
          if (data.auditLogs) setAuditLogs(data.auditLogs);
          toastSuccess('Khôi phục dữ liệu', 'Khôi phục dữ liệu SIS thành công! Chữ ký số đã được xác thực.');
          logSisAction('Khôi phục dữ liệu', 'Hệ thống SIS', 'Nhập file backup JSON khôi phục dữ liệu thành công — chữ ký hợp lệ');
        } else {
          toastError('Lỗi khôi phục', 'File backup không hợp lệ hoặc thiếu dữ liệu.');
        }
      } catch (err) {
        toastError('Lỗi khôi phục', 'Không thể đọc file backup. Lỗi định dạng JSON.');
      }
    };
    reader.readAsText(file);
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
    logSisAction('Xuất học bạ PDF', selectedStudent.name, 'In phiếu điểm & học bạ tóm tắt');
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrintClassReportCard}
              className="w-fit px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              In bảng điểm cả lớp ({classFilter})
            </button>
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
      </div>

      {/* Main Tab Navigation */}
      <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl w-fit">
        {([
          { key: 'STUDENTS', label: 'Hồ sơ Học sinh', icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'PARENT_PORTAL', label: 'Cổng Phụ huynh', icon: <Mail className="w-3.5 h-3.5" /> },
          { key: 'EARLY_WARNING', label: 'Cảnh báo sớm', icon: <Bell className="w-3.5 h-3.5" /> },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setMainTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${mainTab === tab.key ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.icon} {tab.label}
            {tab.key === 'PARENT_PORTAL' && parentMessages.filter(m => !m.read).length > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">{parentMessages.filter(m => !m.read).length}</span>
            )}
            {tab.key === 'EARLY_WARNING' && earlyWarnings.length > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">{earlyWarnings.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* PARENT PORTAL TAB */}
      {mainTab === 'PARENT_PORTAL' && (
        <div className="space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tổng tin nhắn', count: parentMessages.length, cls: 'text-indigo-600', bg: 'from-indigo-500/10 to-indigo-500/5 border-indigo-200/60' },
              { label: 'Chưa đọc', count: parentMessages.filter(m => !m.read).length, cls: 'text-rose-600', bg: 'from-rose-500/10 to-rose-500/5 border-rose-200/60' },
              { label: 'Xin nghỉ', count: parentMessages.filter(m => m.type === 'LEAVE').length, cls: 'text-amber-600', bg: 'from-amber-500/10 to-amber-500/5 border-amber-200/60' },
              { label: 'Phản ánh', count: parentMessages.filter(m => m.type === 'FEEDBACK').length, cls: 'text-emerald-600', bg: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200/60' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} border rounded-2xl p-4`}>
                <p className={`text-2xl font-black ${s.cls}`}>{s.count}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Message list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Tin nhắn từ phụ huynh</h3>
              <span className="text-[10px] font-mono text-slate-400">{parentMessages.length} tin nhắn</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {parentMessages.map(msg => {
                const typeCls = msg.type === 'LEAVE' ? 'bg-amber-50 text-amber-700' : msg.type === 'FEEDBACK' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700';
                const typeLabel = msg.type === 'LEAVE' ? '📋 Xin nghỉ' : msg.type === 'FEEDBACK' ? '💬 Phản ánh' : '❓ Hỏi đáp';
                return (
                  <div key={msg.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!msg.read ? 'bg-blue-50/30 dark:bg-indigo-950/10' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                      {msg.parent.charAt(msg.parent.lastIndexOf(' ') + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-black text-slate-900 dark:text-white ${!msg.read ? '' : 'font-bold'}`}>{msg.subject}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span>PH: <strong className="text-slate-600 dark:text-slate-300">{msg.parent}</strong></span>
                            <span>•</span>
                            <span>HS: <strong className="text-slate-600 dark:text-slate-300">{msg.student} ({msg.class})</strong></span>
                            <span>•</span>
                            <span>{msg.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!msg.read && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${typeCls}`}>{typeLabel}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
                        <a href={`tel:${msg.phone}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">📞 {msg.phone}</a>
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">✉ {msg.email}</a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick send notice */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3">
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Gửi thông báo hàng loạt tới phụ huynh</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Tiêu đề thông báo" className="text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white col-span-2" />
              <select className="text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                <option>Tất cả lớp</option>
                <option>Khối 10</option>
                <option>Khối 11</option>
                <option>Khối 12</option>
              </select>
              <textarea rows={3} placeholder="Nội dung thông báo..." className="text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white resize-none col-span-2" />
              <div className="flex flex-col gap-2">
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">📧 Gửi Email</button>
                <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">📱 SMS</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EARLY WARNING TAB */}
      {mainTab === 'EARLY_WARNING' && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cần hỗ trợ', count: earlyWarnings.length, cls: 'text-rose-600', bg: 'from-rose-500/10 to-rose-500/5 border-rose-200/60' },
              { label: 'GPA thấp', count: earlyWarnings.filter(s => s.alerts.some(a => a.includes('GPA'))).length, cls: 'text-orange-600', bg: 'from-orange-500/10 to-orange-500/5 border-orange-200/60' },
              { label: 'Vắng nhiều', count: earlyWarnings.filter(s => s.alerts.some(a => a.includes('Vắng'))).length, cls: 'text-amber-600', bg: 'from-amber-500/10 to-amber-500/5 border-amber-200/60' },
              { label: 'Kỷ luật', count: earlyWarnings.filter(s => s.alerts.some(a => a.includes('Kỷ'))).length, cls: 'text-violet-600', bg: 'from-violet-500/10 to-violet-500/5 border-violet-200/60' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} border rounded-2xl p-4`}>
                <p className={`text-2xl font-black ${s.cls}`}>{s.count}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {earlyWarnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
              <p className="font-bold text-slate-600">Không có học sinh cần cảnh báo</p>
              <p className="text-sm mt-1">Tất cả học sinh đều đang trong ngưỡng an toàn 👏</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                    {['Học sinh','Lớp','GPA','Vắng (ngày)','Cảnh báo','Phụ huynh','SĐT','Hành động'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {earlyWarnings.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{s.className}</td>
                      <td className="px-3 py-3">
                        <span className={`font-mono font-black ${s.gpa < 5 ? 'text-rose-600' : s.gpa < 6.5 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>{s.gpa}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`font-mono ${s.absentDays >= 3 ? 'text-rose-600 font-black' : 'text-slate-500'}`}>{s.absentDays}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.alerts.map(a => (
                            <span key={a} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 rounded text-[9px] font-black">{a}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{s.parentName}</td>
                      <td className="px-3 py-3 font-mono text-slate-500">{s.parentPhone}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setSelectedStudentId(s.id); setMainTab('STUDENTS'); }}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black"
                          >
                            Hồ sơ
                          </button>
                          <a href={`tel:${s.parentPhone}`} className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black">Gọi</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STUDENTS TAB — existing content wrapped */}
      {mainTab === 'STUDENTS' && (<>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard label="Sĩ số" value={`${stats.total}`} note="Hồ sơ học sinh" icon={Users} color="text-indigo-600" accent="from-indigo-500/10 to-indigo-500/5 border-indigo-200/60" />
        <MetricCard label="GPA trung bình" value={`${stats.avgGpa}`} note="Theo sổ điểm" icon={BookOpen} color="text-sky-600" accent="from-sky-500/10 to-sky-500/5 border-sky-200/60" />
        <MetricCard label="Chuyên cần" value={`${stats.avgAttendance}%`} note="Theo điểm danh" icon={CalendarCheck} color="text-emerald-600" accent="from-emerald-500/10 to-emerald-500/5 border-emerald-200/60" />
        <MetricCard label="Vắng hôm nay" value={`${stats.absentToday}`} note="Cần theo dõi" icon={AlertTriangle} color="text-rose-600" accent="from-rose-500/10 to-rose-500/5 border-rose-200/60" />
        <MetricCard label="Cảnh báo" value={`${stats.supportCount}`} note="Cần hỗ trợ" icon={Bell} color="text-amber-600" accent="from-amber-500/10 to-amber-500/5 border-amber-200/60" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm space-y-4">
          {/* Quick Add Form */}
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
              placeholder="Thêm nhanh học sinh mới..."
            />
            <button type="submit" className="px-4 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all">
              <Plus className="w-3.5 h-3.5" />
              Thêm
            </button>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                placeholder="Tìm học sinh..."
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none"
            >
              {classOptions.map(item => <option key={item}>{item}</option>)}
            </select>
          </div>

          {/* Student List */}
          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1 -mr-1">
            {filteredStudents.map(({ student, gpa, attendanceRate, needSupport }) => (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 group ${
                  selectedStudentId === student.id
                    ? 'border-indigo-400/60 bg-gradient-to-r from-indigo-50 to-indigo-50/40 shadow-sm'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full object-cover" />
                  {needSupport && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{student.name}</h4>
                  <span className="text-[10px] text-slate-400 block font-mono">{student.code} · {student.className}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">GPA <strong className="text-slate-700 dark:text-slate-300">{gpa}</strong></span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500">chuyên cần <strong className={attendanceRate < 85 ? 'text-rose-600' : 'text-emerald-600'}>{attendanceRate}%</strong></span>
                  </div>
                </div>
                {needSupport && (
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black rounded-md uppercase font-mono border border-rose-200/60 shrink-0">
                    ⚠ Cảnh báo
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="xl:col-span-8">
          {selectedStudent ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
              {/* Student Profile Header */}
              <div className="relative p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-b border-white/5 flex items-center gap-4 overflow-hidden">
                {/* Decorative background circles */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-6 right-24 w-24 h-24 rounded-full bg-sky-500/10 blur-xl pointer-events-none" />

                <div className="relative shrink-0">
                  <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-white leading-tight">{selectedStudent.name}</h3>
                    <span className="px-2 py-0.5 bg-white/10 text-slate-200 text-[10px] font-bold rounded-lg font-mono border border-white/15">{selectedStudent.code}</span>
                    <span className="px-2 py-0.5 bg-indigo-500/25 text-indigo-300 text-[10px] font-bold rounded-lg border border-indigo-400/30">Lớp {selectedStudent.className}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-1.5">
                    Phụ huynh: <strong className="text-slate-200">{selectedStudent.parentName}</strong> · <span className="text-slate-400">{selectedStudent.parentPhone}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                      GPA <strong className="text-sky-300">{selectedMetric.gpa}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Chuyên cần <strong className="text-emerald-300">{selectedMetric.attendanceRate}%</strong>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                      {selectedStudent.conduct}
                    </span>
                  </div>
                </div>
                {selectedMetric.needSupport && (
                  <span className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30 shrink-0 animate-pulse">
                    ⚠ Cần hỗ trợ
                  </span>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex overflow-x-auto bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 px-2 py-2 gap-1">
                {[
                  ['PROFILE', 'Hồ sơ'],
                  ['HISTORY', 'Quá trình'],
                  ['ATTENDANCE', 'Điểm danh'],
                  ['GRADEBOOK', 'Sổ điểm'],
                  ['PARENT', 'Phụ huynh'],
                  ...(currentUser.role === 'ADMIN' ? [['SECURITY', 'Bảo mật']] : [])
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setProfileTab(id as typeof profileTab)}
                    className={`min-w-max px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                      profileTab === id
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60'
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
                  <div className="space-y-6 text-xs animate-fade-in">
                    {editingProfile && (
                      <form onSubmit={handleSaveProfile} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                        <h4 className="font-bold text-slate-800">Chỉnh sửa thông tin cơ bản học sinh</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Họ và tên</label>
                            <input 
                              value={profileNameVal} 
                              onChange={(e) => setProfileNameVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Giới tính</label>
                            <select 
                              value={profileGenderVal} 
                              onChange={(e) => setProfileGenderVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                            >
                              <option value="Nam">Nam</option>
                              <option value="Nữ">Nữ</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Ngày sinh</label>
                            <input 
                              type="date"
                              value={profileBirthDateVal} 
                              onChange={(e) => setProfileBirthDateVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Địa chỉ</label>
                            <input 
                              value={profileAddressVal} 
                              onChange={(e) => setProfileAddressVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Họ tên phụ huynh</label>
                            <input 
                              value={profileParentNameVal} 
                              onChange={(e) => setProfileParentNameVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">SĐT phụ huynh</label>
                            <input 
                              value={profileParentPhoneVal} 
                              onChange={(e) => setProfileParentPhoneVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Email phụ huynh</label>
                            <input 
                              type="email"
                              value={profileParentEmailVal} 
                              onChange={(e) => setProfileParentEmailVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Liên hệ khẩn cấp</label>
                            <input 
                              value={profileEmergencyContactVal} 
                              onChange={(e) => setProfileEmergencyContactVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingProfile(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100">
                            Hủy
                          </button>
                          <button type="submit" className="px-3.5 py-1.5 bg-indigo-650 text-white font-bold text-xs rounded-lg">
                            Cập nhật hồ sơ
                          </button>
                        </div>
                      </form>
                    )}

                    {editingHealth && (
                      <form onSubmit={handleSaveHealth} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                        <h4 className="font-bold text-slate-800">Chỉnh sửa hồ sơ y tế học sinh</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Mã thẻ BHYT</label>
                            <input 
                              value={healthInsuranceVal} 
                              onChange={(e) => setHealthInsuranceVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              placeholder="DN12345..."
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Dị ứng (ngăn cách bởi dấu phẩy)</label>
                            <input 
                              value={allergiesVal} 
                              onChange={(e) => setAllergiesVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              placeholder="Hải sản, Đậu phộng..."
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Bệnh nền (ngăn cách bởi dấu phẩy)</label>
                            <input 
                              value={conditionsVal} 
                              onChange={(e) => setConditionsVal(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white" 
                              placeholder="Hen suyễn, Tim bẩm sinh..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Ghi chú lâm sàng / Chỉ thị sức khỏe</label>
                          <textarea 
                            value={healthNoteVal} 
                            onChange={(e) => setHealthNoteVal(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white resize-none" 
                            rows={2}
                            placeholder="Mô tả hiện trạng sức khỏe hoặc chỉ thị thuốc uống..."
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingHealth(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100">
                            Hủy
                          </button>
                          <button type="submit" className="px-3.5 py-1.5 bg-indigo-650 text-white font-bold text-xs rounded-lg">
                            Cập nhật y tế
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard 
                        icon={User} 
                        label="Thông tin cá nhân" 
                        action={currentUser.role === 'ADMIN' && !editingProfile && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileNameVal(selectedStudent.name);
                              setProfileGenderVal(selectedStudent.gender || 'Nam');
                              setProfileBirthDateVal(selectedStudent.birthDate || '');
                              setProfileAddressVal(selectedStudent.address || '');
                              setProfileParentNameVal(selectedStudent.parentName || '');
                              setProfileParentPhoneVal(selectedStudent.parentPhone || '');
                              setProfileParentEmailVal(selectedStudent.parentEmail || '');
                              setProfileEmergencyContactVal(selectedStudent.emergencyContact || '');
                              setEditingProfile(true);
                            }}
                            className="px-2 py-0.5 border border-indigo-200 hover:bg-indigo-100 rounded text-[10px] text-indigo-700 font-bold transition-all"
                          >
                            Sửa hồ sơ
                          </button>
                        )}
                        lines={[
                          <p><strong>Họ và tên:</strong> {selectedStudent.name}</p>,
                          <p><strong>Giới tính:</strong> {selectedStudent.gender}</p>,
                          <p><strong>Ngày sinh:</strong> {selectedStudent.birthDate}</p>,
                          <p><strong>Địa chỉ:</strong> {selectedStudent.address}</p>,
                        ]} 
                      />
                      
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 relative">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <HeartPulse className="w-4 h-4 text-rose-500" />
                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wide font-sans">Y tế học đường &amp; Sức khỏe</span>
                          </div>
                          {(currentUser.role === 'ADMIN' || (currentUser.workspaceId === 'HANH_CHINH' && currentUser.title.includes('Y tế'))) && !editingHealth && (
                            <button
                              type="button"
                              onClick={() => {
                                setHealthInsuranceVal(selectedStudent.healthInsurance || '');
                                setAllergiesVal((selectedStudent.allergies || []).join(', '));
                                setConditionsVal((selectedStudent.conditions || []).join(', '));
                                setHealthNoteVal(selectedStudent.healthNote || '');
                                setEditingHealth(true);
                              }}
                              className="px-2 py-0.5 border border-indigo-200 hover:bg-indigo-100 rounded text-[10px] text-indigo-700 font-bold transition-all"
                            >
                              Sửa y tế
                            </button>
                          )}
                        </div>
                        <div className="space-y-1 text-slate-650 leading-relaxed font-sans">
                          <p><strong>BHYT:</strong> {selectedStudent.healthInsurance || 'Chưa cập nhật'}</p>
                          <p><strong>Dị ứng:</strong> {(selectedStudent.allergies || []).join(', ') || 'Không phát hiện'}</p>
                          <p><strong>Bệnh nền:</strong> {(selectedStudent.conditions || []).join(', ') || 'Không ghi nhận'}</p>
                          <p><strong>Chỉ thị y tế:</strong> {selectedStudent.healthNote || 'Bình thường'}</p>
                          <p><strong>Liên hệ khẩn cấp:</strong> {selectedStudent.emergencyContact}</p>
                        </div>
                      </div>

                      <InfoCard icon={Award} label="Thành tích & học bổng" lines={[
                        `Học bổng: ${selectedStudent.scholarship}`,
                        ...selectedStudent.awards,
                      ]} />
                      
                      <InfoCard icon={CheckCircle2} label="Hoạt động & hạnh kiểm" lines={[
                        `Hạnh kiểm: ${selectedStudent.conduct}`,
                        selectedStudent.extracurriculars.length ? selectedStudent.extracurriculars.join(', ') : 'Chưa ghi nhận hoạt động ngoại khóa.',
                      ]} />
                    </div>

                    {/* Advanced Health: incidents & vaccinations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Incidents logs */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                          <HeartPulse className="w-4 h-4 text-rose-500" />
                          Nhật ký sự cố y tế tại trường
                        </h4>
                        
                        {(currentUser.role === 'ADMIN' || (currentUser.workspaceId === 'HANH_CHINH' && currentUser.title.includes('Y tế'))) && (
                          <form onSubmit={handleAddHealthIncident} className="grid grid-cols-1 md:grid-cols-3 gap-1.5 p-2 border border-slate-200 rounded-lg bg-white">
                            <input 
                              value={newIncSymptoms} 
                              onChange={(e) => setNewIncSymptoms(e.target.value)}
                              className="text-[10.5px] border rounded p-1" 
                              placeholder="Triệu chứng" 
                              required 
                            />
                            <input 
                              value={newIncTreatment} 
                              onChange={(e) => setNewIncTreatment(e.target.value)}
                              className="text-[10.5px] border rounded p-1" 
                              placeholder="Cách xử lý" 
                            />
                            <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10.5px] rounded p-1">
                              Ghi sự cố
                            </button>
                          </form>
                        )}

                        <div className="max-h-48 overflow-y-auto space-y-1.5">
                          {(selectedStudent.healthIncidents || []).map((inc) => (
                            <div key={inc.id} className="p-2 border border-slate-200 rounded bg-white space-y-0.5 font-sans">
                              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                                <span>{inc.date} · Y tá: {inc.nurseName}</span>
                                <span className={`px-1 rounded ${inc.status === 'DA_XU_LY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {inc.status === 'DA_XU_LY' ? 'Đã xử lý' : 'Theo dõi'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-800"><strong>Triệu chứng:</strong> {inc.symptoms}</p>
                              <p className="text-[10px] text-slate-500"><strong>Xử lý:</strong> {inc.treatment}</p>
                            </div>
                          ))}
                          {(selectedStudent.healthIncidents || []).length === 0 && (
                            <p className="text-center py-4 text-slate-405 italic text-[11px]">Chưa ghi nhận sự cố y tế nào.</p>
                          )}
                        </div>
                      </div>

                      {/* Vaccinations */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Lịch sử tiêm chủng vaccine
                        </h4>

                        {(currentUser.role === 'ADMIN' || (currentUser.workspaceId === 'HANH_CHINH' && currentUser.title.includes('Y tế'))) && (
                          <form onSubmit={handleAddVaccine} className="grid grid-cols-1 md:grid-cols-4 gap-1.5 p-2 border border-slate-200 rounded-lg bg-white">
                            <input 
                              value={newVacName} 
                              onChange={(e) => setNewVacName(e.target.value)}
                              className="text-[10.5px] border rounded p-1 col-span-2" 
                              placeholder="Tên Vaccine" 
                              required 
                            />
                            <select 
                              value={newVacDose} 
                              onChange={(e) => setNewVacDose(e.target.value)}
                              className="text-[10.5px] border rounded p-1 bg-white"
                            >
                              <option>Mũi 1</option>
                              <option>Mũi 2</option>
                              <option>Mũi 3</option>
                              <option>Mũi nhắc</option>
                            </select>
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] rounded p-1">
                              Thêm mũi
                            </button>
                          </form>
                        )}

                        <div className="max-h-48 overflow-y-auto space-y-1.5">
                          {(selectedStudent.vaccinations || []).map((vac) => (
                            <div key={vac.id} className="p-2 border border-slate-200 rounded bg-white flex justify-between items-center text-[11px] font-sans">
                              <div>
                                <strong className="text-slate-800">{vac.vaccineName}</strong>
                                <span className="text-slate-400 block text-[9.5px] font-mono">Ngày tiêm: {vac.date}</span>
                              </div>
                              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded text-[9.5px] font-mono font-bold">
                                {vac.dose}
                              </span>
                            </div>
                          ))}
                          {(selectedStudent.vaccinations || []).length === 0 && (
                            <p className="text-center py-4 text-slate-405 italic text-[11px]">Chưa có lịch sử tiêm chủng.</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {profileTab === 'HISTORY' && (
                  <div className="space-y-6 animate-fade-in text-xs">
                    {/* Academic History (Liên năm học) */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <h4 className="font-bold text-slate-850 font-sans">Quá trình học tập học vụ liên năm học</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Dữ liệu kết quả GPA qua từng năm học</span>
                      </div>
                      
                      {currentUser.role === 'ADMIN' && (
                        <form onSubmit={handleAddAcademicHistory} className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 rounded-lg border border-slate-200 bg-white">
                          <input 
                            value={newHistYear} 
                            onChange={(e) => setNewHistYear(e.target.value)} 
                            className="text-xs border rounded p-1" 
                            placeholder="Năm học (2025-2026)" 
                            required 
                          />
                          <input 
                            value={newHistClass} 
                            onChange={(e) => setNewHistClass(e.target.value)} 
                            className="text-xs border rounded p-1" 
                            placeholder="Lớp (9A1)" 
                            required 
                          />
                          <input 
                            type="number" 
                            min={0} 
                            max={10} 
                            step={0.1}
                            value={newHistGpa} 
                            onChange={(e) => setNewHistGpa(Number(e.target.value))} 
                            className="text-xs border rounded p-1" 
                            placeholder="GPA cả năm" 
                            required 
                          />
                          <select 
                            value={newHistConduct} 
                            onChange={(e: any) => setNewHistConduct(e.target.value)} 
                            className="text-xs border rounded p-1 bg-white"
                          >
                            <option>Tốt</option>
                            <option>Khá</option>
                            <option>Trung bình</option>
                          </select>
                          <input 
                            value={newHistTeacher} 
                            onChange={(e) => setNewHistTeacher(e.target.value)} 
                            className="text-xs border rounded p-1" 
                            placeholder="GVCN" 
                            required 
                          />
                          <button type="submit" className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded p-1 text-[11px]">
                            Thêm lịch sử
                          </button>
                        </form>
                      )}

                      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-500">
                            <tr>
                              <th className="px-4 py-2">Năm học</th>
                              <th className="px-4 py-2">Lớp học</th>
                              <th className="text-center px-4 py-2">GPA</th>
                              <th className="text-center px-4 py-2">Hạnh kiểm</th>
                              <th className="px-4 py-2">Giáo viên chủ nhiệm</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(selectedStudent.academicHistory || []).map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/30">
                                <td className="px-4 py-2 font-bold text-slate-700">{item.schoolYear}</td>
                                <td className="px-4 py-2 font-semibold text-slate-650">{item.className}</td>
                                <td className="px-4 py-2 text-center text-indigo-750 font-bold">{item.gpa}</td>
                                <td className="px-4 py-2 text-center">
                                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-150 text-emerald-700 text-[10px] rounded font-bold">
                                    {item.conduct}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-slate-600">{item.teacherName}</td>
                              </tr>
                            ))}
                            {(selectedStudent.academicHistory || []).length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Chưa ghi nhận lịch sử học tập.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Transfer History (Chuyển lớp/chuyển trường) */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <h4 className="font-bold text-slate-850 font-sans">Lịch sử điều chuyển lớp học hành chính</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Duyệt chuyển từ Phòng Đào tạo</span>
                      </div>
                      
                      {currentUser.role === 'ADMIN' && (
                        <form onSubmit={handleAddTransfer} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 rounded-lg border border-slate-200 bg-white">
                          <input
                            type="date"
                            value={transferForm.date}
                            onChange={(e) => setTransferForm({ ...transferForm, date: e.target.value })}
                            className="text-xs border rounded-lg px-2 py-1.5 bg-white"
                          />
                          <input
                            value={transferForm.toClass}
                            onChange={(e) => setTransferForm({ ...transferForm, toClass: e.target.value })}
                            className="text-xs border rounded-lg px-2 py-1.5 bg-white"
                            placeholder="Lớp mới"
                          />
                          <input
                            value={transferForm.reason}
                            onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                            className="text-xs border rounded-lg px-2 py-1.5 bg-white"
                            placeholder="Lý do chuyển lớp/chuyển trường"
                          />
                          <button type="submit" className="text-xs font-bold rounded-lg bg-indigo-650 text-white px-3 py-1.5">
                            Ghi nhận chuyển lớp
                          </button>
                        </form>
                      )}

                      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-500">
                            <tr>
                              <th className="px-4 py-2">Ngày</th>
                              <th className="px-4 py-2">Từ lớp</th>
                              <th className="px-4 py-2">Đến lớp</th>
                              <th className="px-4 py-2">Lý do</th>
                              <th className="px-4 py-2">Phê duyệt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(selectedStudent.transferHistory || []).map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/30">
                                <td className="px-4 py-2 font-mono">{item.date}</td>
                                <td className="px-4 py-2">{item.fromClass}</td>
                                <td className="px-4 py-2 font-bold text-indigo-700">{item.toClass}</td>
                                <td className="px-4 py-2 text-slate-600">{item.reason}</td>
                                <td className="px-4 py-2 text-slate-500">{item.approvedBy}</td>
                              </tr>
                            ))}
                            {(selectedStudent.transferHistory || []).length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Chưa có lịch sử chuyển lớp/chuyển trường.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'ATTENDANCE' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="text-xs border rounded-lg px-2 py-2 bg-white"
                      />
                      <select
                        value={attendancePeriod}
                        onChange={(e) => setAttendancePeriod(Number(e.target.value))}
                        className="text-xs border rounded-lg px-2 py-2 bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                          <option key={period} value={period}>Tiết {period}</option>
                        ))}
                      </select>
                      <input
                        value={attendanceReason}
                        onChange={(e) => setAttendanceReason(e.target.value)}
                        className="text-xs border rounded-lg px-2 py-2 bg-white"
                        placeholder="Lý do nghỉ/muộn hoặc ghi chú"
                      />
                    </div>
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
                            <th className="text-left px-4 py-2">Tiết</th>
                            <th className="text-left px-4 py-2">Trạng thái</th>
                            <th className="text-left px-4 py-2">Lý do / Ghi chú</th>
                            <th className="text-center px-4 py-2">Phụ huynh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedAttendance.map(item => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 font-mono">{item.date}</td>
                              <td className="px-4 py-2 font-mono">Tiết {item.period || 1}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusColor(item.status)}`}>
                                  {attendanceLabel(item.status)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-slate-500">{item.reason || item.note || '-'}</td>
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
                    <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                      <div>
                        <p className="text-xs font-black text-slate-900">Phiếu điểm / học bạ tóm tắt</p>
                        <p className="text-[10.5px] text-slate-500">Tự tổng hợp điểm, chuyên cần và quá trình chuyển lớp để in hoặc lưu thành PDF.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handlePrintReportCard}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                      >
                        In / Lưu PDF
                      </button>
                    </div>
                    <form onSubmit={handleAddGrade} className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <select value={newGrade.subject} onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })} className="text-xs border rounded-lg px-2 py-2 bg-white">
                        {selectedClassSubjects.map(subject => (
                          <option key={`${subject.name}-${subject.type}`} value={subject.name}>
                            {subject.name} ({subject.type})
                          </option>
                        ))}
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
                  <div className="space-y-4 animate-fade-in">
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

                {profileTab === 'SECURITY' && currentUser.role === 'ADMIN' && (
                  <div className="space-y-6 text-xs animate-fade-in">
                    
                    {/* Backup & Restore control panel */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                        <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                        Trung tâm Sao lưu &amp; Khôi phục cơ sở dữ liệu SIS
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        Chức năng an ninh hệ thống cho phép tải toàn bộ dữ liệu SIS hiện tại về máy tính dưới định dạng tệp JSON bảo mật hoặc tải tệp JSON lên để ghi đè trạng thái.
                      </p>
                      <div className="flex items-center gap-3 flex-wrap pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const backupPayload = {
                              students,
                              grades,
                              attendance,
                              auditLogs
                            };
                            // 🛡️ Append cryptographic signature to backup file
                            const signature = generateBackupSignature(JSON.stringify(backupPayload));
                            const backupData = { ...backupPayload, signature };
                            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `MIS_SIS_Backup_${Date.now()}.json`;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            URL.revokeObjectURL(url);
                            logSisAction('Sao lưu dữ liệu', 'Hệ thống SIS', 'Tải file backup JSON có chữ ký số');
                          }}
                          className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs"
                        >
                          <FileDown className="w-4 h-4" />
                          Tải File Sao lưu (.json)
                        </button>

                        <div className="relative">
                          <label className="px-3.5 py-2 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs">
                            <FileUp className="w-4 h-4 text-emerald-600" />
                            Khôi phục từ File JSON
                            <input 
                              type="file" 
                              accept=".json" 
                              onChange={handleImportBackup} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Audit Logs table */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                          <Lock className="w-4 h-4 text-indigo-600" />
                          Nhật ký kiểm toán an ninh học vụ (Audit Logs)
                        </h4>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-mono rounded font-bold">
                          {auditLogs.length} sự kiện
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                        <div className="max-h-72 overflow-y-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-500 sticky top-0">
                              <tr>
                                <th className="px-4 py-2">Thời gian</th>
                                <th className="px-4 py-2">Cán bộ thực hiện</th>
                                <th className="px-4 py-2">Hành động</th>
                                <th className="px-4 py-2">Học sinh đích</th>
                                <th className="px-4 py-2">Chi tiết</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/40">
                                  <td className="px-4 py-2 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <strong>{log.operatorName}</strong> 
                                    <span className="text-[10px] text-slate-400 block font-mono">{log.operatorRole}</span>
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[9.5px] font-bold rounded-md uppercase font-mono">
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 font-semibold text-slate-700 whitespace-nowrap">{log.targetStudentName}</td>
                                  <td className="px-4 py-2 text-slate-500 max-w-xs truncate" title={log.details}>{log.details}</td>
                                </tr>
                              ))}
                              {auditLogs.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Chưa có nhật ký ghi lại.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
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
    </>) } {/* end STUDENTS tab */}
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon, color, accent }: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accent?: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${accent || 'from-slate-50 to-white border-slate-200/80'} border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/70 shadow-xs border border-white/80`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <strong className={`text-2xl font-display font-black block ${color}`}>{value}</strong>
      <span className="text-[10.5px] text-slate-500 mt-1 block">{note}</span>
    </div>
  );
}

function InfoCard({ icon: Icon, label, lines, action }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  lines: (string | React.ReactNode)[];
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-800/30 p-4 relative hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wide">{label}</span>
        </div>
        {action}
      </div>
      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {lines.map((line, index) => (
          <div key={`${label}-${index}`}>{line}</div>
        ))}
      </div>
    </div>
  );
}
