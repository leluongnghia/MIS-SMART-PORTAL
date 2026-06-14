import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateLeave, translateUser, translateTitle } from '../utils/translations';
import { 
  Users, 
  Award, 
  Clock, 
  Calendar, 
  Plus, 
  Check, 
  X, 
  HelpCircle, 
  UserCheck, 
  Search, 
  FileText, 
  CheckCircle2, 
  UserX,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Briefcase,
  Target,
  ShieldAlert,
  Lock,
  ArrowRightLeft,
  BookOpen
} from 'lucide-react';
import { UserProfile, MIProfile } from '../types';
import { MI_KEY_DETAILS } from '../miAndOkrUtils';

interface HrmCenterProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
  hasCapability: (capability: string, action?: string, resourceOwnerId?: string) => boolean;
}

interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  departmentId: string;
  leaveDate: string;
  slots: number[]; // Tiết xin nghỉ
  reason: string;
  status: 'PENDING' | 'APPROVED_DEPT' | 'APPROVED' | 'REJECTED';
  substituteTeacherId?: string;
  substituteTeacherName?: string;
  createdAt: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  staffName: string;
  role: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE';
}

interface SalaryRecord {
  id: string;
  userId: string;
  staffName: string;
  role: string;
  department: string;
  baseSalary: number;
  teachingBonus: number;
  kpiBonus: number;
  deductions: number;
  totalSalary: number;
  month: string;
  paid: boolean;
}

// Lưới thời khóa biểu tĩnh để quét tìm giáo viên rảnh dạy thay
const MOCK_TKB_SLOTS = [
  { teacherId: 'user_nhan', day: 2, period: 1 }, { teacherId: 'user_nhan', day: 2, period: 2 },
  { teacherId: 'user_nhan', day: 3, period: 3 }, { teacherId: 'user_nhan', day: 3, period: 4 },
  { teacherId: 'user_nhan', day: 4, period: 5 }, { teacherId: 'user_nhan', day: 4, period: 6 },
  { teacherId: 'user_nhan', day: 5, period: 1 }, { teacherId: 'user_nhan', day: 6, period: 3 },

  { teacherId: 'user_dat', day: 2, period: 3 }, { teacherId: 'user_dat', day: 2, period: 4 },
  { teacherId: 'user_dat', day: 3, period: 1 }, { teacherId: 'user_dat', day: 3, period: 2 },
  { teacherId: 'user_dat', day: 5, period: 5 }, { teacherId: 'user_dat', day: 5, period: 6 },
  { teacherId: 'user_dat', day: 6, period: 1 }, { teacherId: 'user_dat', day: 6, period: 2 },

  { teacherId: 'user_nam', day: 2, period: 5 }, { teacherId: 'user_nam', day: 2, period: 6 },
  { teacherId: 'user_nam', day: 4, period: 1 }, { teacherId: 'user_nam', day: 4, period: 2 },
  { teacherId: 'user_nam', day: 5, period: 3 }, { teacherId: 'user_nam', day: 5, period: 4 }
];

export default function HrmCenter({ currentUser, users, onUpdateUsers, hasCapability }: HrmCenterProps) {
  const { lang, t } = useLanguage();

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.workspaceId === 'BGH' || currentUser.workspaceId === 'HANH_CHINH';
  const isManager = currentUser.role === 'MANAGER' && currentUser.workspaceId !== 'HANH_CHINH' && currentUser.workspaceId !== 'BGH';
  const isStaff = currentUser.role === 'STAFF';

  // State: Quyết định Tab hiển thị
  const tabs = useMemo(() => {
    if (isStaff) {
      return [
        { id: 'MY_PROFILE', label: lang === 'vi' ? 'Hồ sơ cá nhân (Self-Service)' : 'My Profile (Self-Service)' },
        { id: 'MY_LEAVE', label: lang === 'vi' ? 'Xin nghỉ & Dạy thay' : 'My Leaves & Substitutes' },
        { id: 'MY_SALARY', label: lang === 'vi' ? 'Chấm công & Lương' : 'Attendance & Salary' },
        { id: 'MY_KPI', label: lang === 'vi' ? 'KPIs & Lịch dạy' : 'KPI & CPD Hours' }
      ];
    }
    if (isManager) {
      return [
        { id: 'ORG_CHART', label: lang === 'vi' ? 'Sơ đồ Tổ chức' : 'Org Chart' },
        { id: 'DIRECTORY', label: lang === 'vi' ? 'Thành viên trong Tổ' : 'Department Staff' },
        { id: 'LEAVE_REQUESTS', label: lang === 'vi' ? 'Duyệt nghỉ phép' : 'Approve Leaves' },
        { id: 'KPI_WORKLOAD', label: lang === 'vi' ? 'KPI & Khối lượng' : 'Department KPIs' }
      ];
    }
    return [
      { id: 'ORG_CHART', label: lang === 'vi' ? 'Sơ đồ Tổ chức' : 'Org Chart' },
      { id: 'DIRECTORY', label: lang === 'vi' ? 'Danh bạ Nhân sự (Toàn trường)' : 'Staff Directory' },
      { id: 'ATTENDANCE_SALARY', label: lang === 'vi' ? 'Chấm công & Lương' : 'Attendance & Payroll' },
      { id: 'LEAVE_REQUESTS', label: lang === 'vi' ? 'Duyệt nghỉ phép' : 'Approve Leaves' },
      { id: 'KPI_WORKLOAD', label: lang === 'vi' ? 'KPI & Khối lượng giảng dạy' : 'KPIs & Workload' }
    ];
  }, [isStaff, isManager, lang]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (isStaff) return 'MY_PROFILE';
    return 'ORG_CHART';
  });

  useEffect(() => {
    if (isStaff) {
      setActiveTab('MY_PROFILE');
    } else {
      setActiveTab('ORG_CHART');
    }
  }, [currentUser.id, isStaff]);

  // State: Nghỉ phép
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('mis_hrm_leaves');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'LV001',
        teacherId: 'user_dat',
        teacherName: 'Thầy Vũ Tiến Đạt',
        departmentId: 'VAN',
        leaveDate: '2026-06-15',
        slots: [3, 4],
        reason: 'Đi khám bệnh định kỳ tại bệnh viện Trung ương',
        status: 'APPROVED',
        substituteTeacherId: 'user_nhung',
        substituteTeacherName: 'Cô Phạm Hồng Nhung',
        createdAt: '2026-06-05'
      },
      {
        id: 'LV002',
        teacherId: 'user_nhan',
        teacherName: 'Cô Lê Thị Thanh Nhàn',
        departmentId: 'TOAN_TIN',
        leaveDate: '2026-06-16',
        slots: [1, 2],
        reason: 'Tham dự sự kiện gia đình đột xuất',
        status: 'PENDING',
        createdAt: '2026-06-06'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_hrm_leaves', JSON.stringify(leaves));
  }, [leaves]);

  // State: Chấm công
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('mis_hrm_attendance');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    return [
      { id: 'a1', userId: 'user_mai', staffName: 'Cô Nguyễn Thị Mai', role: 'GV Toán', date: todayStr, checkIn: '07:25', checkOut: '17:00', status: 'PRESENT' },
      { id: 'a2', userId: 'user_dat', staffName: 'Thầy Trần Văn Dũng', role: 'GV Văn', date: todayStr, checkIn: '07:45', checkOut: '16:55', status: 'LATE' },
      { id: 'a3', userId: 'user_hoa', staffName: 'Cô Lê Thị Hoa', role: 'GV Anh', date: todayStr, checkIn: '', checkOut: '', status: 'ABSENT' },
      { id: 'a4', userId: 'user_tuan', staffName: 'Thầy Phạm Minh Tuấn', role: 'GV Lý', date: todayStr, checkIn: '07:20', checkOut: '16:45', status: 'PRESENT' },
      { id: 'a5', userId: 'user_hang', staffName: 'Cô Hoàng Thu Hằng', role: 'GV Hóa', date: todayStr, checkIn: '', checkOut: '', status: 'LEAVE' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_hrm_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // State: Lương
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => {
    const saved = localStorage.getItem('mis_hrm_salary');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 's1', userId: 'user_mai', staffName: 'Cô Nguyễn Thị Mai', role: 'GV Toán', department: 'Tổ Toán-Tin', baseSalary: 12000000, teachingBonus: 3500000, kpiBonus: 1200000, deductions: 800000, totalSalary: 15900000, month: '2026-06', paid: true },
      { id: 's2', userId: 'user_dat', staffName: 'Thầy Trần Văn Dũng', role: 'GV Văn', department: 'Tổ Ngữ Văn', baseSalary: 11000000, teachingBonus: 2800000, kpiBonus: 900000, deductions: 750000, totalSalary: 13950000, month: '2026-06', paid: true },
      { id: 's3', userId: 'user_hoa', staffName: 'Cô Lê Thị Hoa', role: 'GV Anh', department: 'Tổ Ngoại Ngữ', baseSalary: 13000000, teachingBonus: 4000000, kpiBonus: 1500000, deductions: 900000, totalSalary: 17600000, month: '2026-06', paid: false },
      { id: 's4', userId: 'user_tuan', staffName: 'Thầy Phạm Minh Tuấn', role: 'GV Lý', department: 'Tổ KH Tự nhiên', baseSalary: 10500000, teachingBonus: 2500000, kpiBonus: 800000, deductions: 700000, totalSalary: 13100000, month: '2026-06', paid: false },
      { id: 's5', userId: 'user_hang', staffName: 'Cô Hoàng Thu Hằng', role: 'GV Hóa', department: 'Tổ KH Tự nhiên', baseSalary: 11500000, teachingBonus: 3000000, kpiBonus: 1000000, deductions: 800000, totalSalary: 14700000, month: '2026-06', paid: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_hrm_salary', JSON.stringify(salaryRecords));
  }, [salaryRecords]);

  // Form states
  const [newLeave, setNewLeave] = useState({
    leaveDate: new Date().toISOString().substring(0, 10),
    slots: '3, 4',
    reason: ''
  });
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCertTitle, setNewCertTitle] = useState('');
  const [selectedStaffForCert, setSelectedStaffForCert] = useState<string>(currentUser.id);
  const [newCpdTitle, setNewCpdTitle] = useState('');
  const [newCpdHours, setNewCpdHours] = useState('4');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [targetWorkspaceId, setTargetWorkspaceId] = useState('TOAN_TIN');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);

  const getWorkspaceName = (workspaceId: string) => {
    const workspaceNames: Record<string, string> = {
      BGH: 'Ban Giám hiệu & Hội đồng Trường',
      TUYEN_SINH_PR: 'Phòng Tuyển sinh & Truyền thông',
      QUOC_TE: 'Ban Chương trình Quốc tế',
      KHAO_THI: 'Phòng Khảo thí & ĐBCL',
      CTHS_TAM_LY: 'Tổ Công tác Học sinh & Tham vấn',
      DICH_VU_HOC_DUONG: 'Phòng Dịch vụ & Vận hành Học đường',
      TOAN_TIN: 'Tổ Chuyên môn Toán - Tin học',
      VAN: 'Tổ Chuyên môn Ngữ văn',
      NGOAI_NGU: 'Tổ Chuyên môn Ngoại ngữ',
      KHTN: 'Tổ Chuyên môn Khoa học Tự nhiên',
      LS_DL: 'Tổ Chuyên môn Lịch sử - Địa lí',
      GDCD_KTPL: 'Tổ GDCD & Giáo dục Kinh tế - Pháp luật',
      NT_TC_QPAN: 'Tổ Nghệ thuật - Thể chất - QP-AN',
      CN_TRAI_NGHIEM: 'Tổ Công nghệ & Hoạt động trải nghiệm',
      HANH_CHINH: 'Tổ Văn phòng & Kế toán - Tài chính',
    };
    return workspaceNames[workspaceId] || workspaceId;
  };

  const inferVietnameseGender = (name: string): string => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes(' thi ') || lowercase.includes(' thị ') || lowercase.includes(' cô ')) return 'Nữ';
    if (lowercase.includes(' văn ') || lowercase.includes(' thầy ')) return 'Nam';
    return 'Khác';
  };

  const getPersonnelDetails = (user: UserProfile) => {
    const seed = Array.from(user.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const normalizedId = user.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `ns${seed}`;
    const addressAreas = [
      'Cầu Giấy, Hà Nội',
      'Nam Từ Liêm, Hà Nội',
      'Thanh Xuân, Hà Nội',
      'Hà Đông, Hà Nội',
      'Hoàng Mai, Hà Nội',
      'Long Biên, Hà Nội',
      'Bắc Từ Liêm, Hà Nội',
      'Đống Đa, Hà Nội'
    ];
    const startYears = [2018, 2019, 2020, 2021, 2022, 2023];
    const month = String((seed % 9) + 1).padStart(2, '0');
    const day = String((seed % 20) + 5).padStart(2, '0');
    const roleTitle = `${user.roleName} - ${user.title}`;
    const isTeacher = /giao vien|to truong|teacher/i.test(roleTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    const isManagerUser = user.role === 'ADMIN' || user.role === 'MANAGER';

    return {
      employeeCode: user.employeeCode || `MIS-HR-${String(seed).padStart(4, '0')}`,
      email: user.email || `${normalizedId}@mis.edu.vn`,
      personalEmail: user.personalEmail || `${normalizedId}.personal@gmail.com`,
      phone: user.phone || `09${String(10000000 + (seed * 7919) % 90000000).padStart(8, '0')}`,
      address: user.address || `Số ${(seed % 88) + 10}, ngõ ${(seed % 45) + 1}, ${addressAreas[seed % addressAreas.length]}`,
      dateOfBirth: user.dateOfBirth || `${1978 + (seed % 20)}-${month}-${day}`,
      gender: user.gender || inferVietnameseGender(user.name),
      startDate: user.startDate || `${startYears[seed % startYears.length]}-08-${String((seed % 15) + 1).padStart(2, '0')}`,
      contractType: user.contractType || (isManagerUser ? 'Hợp đồng quản lý toàn thời gian' : 'Hợp đồng lao động toàn thời gian'),
      qualification: user.qualification || (isManagerUser ? 'Thạc sĩ Quản trị giáo dục' : isTeacher ? 'Cử nhân/Thạc sĩ Sư phạm' : 'Cử nhân chuyên ngành phù hợp'),
      specialization: user.specialization || user.title,
      emergencyContact: user.emergencyContact || `Người thân - 08${String(10000000 + (seed * 3571) % 90000000).padStart(8, '0')}`,
      nationalId: user.nationalId || `0${String(10000000000 + (seed * 15485863) % 90000000000).padStart(11, '0')}`,
      insuranceCode: user.insuranceCode || `BHXH-${String(seed * 97).padStart(6, '0')}`
    };
  };

  const maskString = (str: string) => {
    if (!str) return 'N/A';
    if (str.length <= 4) return '****';
    return str.slice(0, 2) + '*'.repeat(str.length - 4) + str.slice(-2);
  };

  const getProfileKpi = (user: UserProfile) => {
    return Math.min(99, 82 + ((user.cpdHours || 8) % 18));
  };

  // Submit đơn nghỉ phép
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.reason) return;

    const parsedSlots = newLeave.slots.split(',').map(s => Number(s.trim())).filter(s => !isNaN(s) && s >= 1 && s <= 8);
    if (parsedSlots.length === 0) {
      alert(lang === 'vi' 
        ? "Vui lòng nhập các tiết nghỉ hợp lệ (từ 1 đến 8, phân tách bằng dấu phẩy)." 
        : "Please enter valid slots (from 1 to 8, separated by commas).");
      return;
    }

    const request: LeaveRequest = {
      id: `LV${Date.now().toString().slice(-4)}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      departmentId: currentUser.workspaceId,
      leaveDate: newLeave.leaveDate,
      slots: parsedSlots,
      reason: newLeave.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString().substring(0, 10)
    };

    setLeaves([request, ...leaves]);
    setNewLeave({ leaveDate: new Date().toISOString().substring(0, 10), slots: '3, 4', reason: '' });
    setShowLeaveForm(false);
  };

  // Phê duyệt nghỉ phép theo vai trò & ma trận
  const handleApproveLeave = (leaveId: string, action: 'APPROVE' | 'REJECT') => {
    setLeaves(prev => prev.map(l => {
      if (l.id !== leaveId) return l;
      if (action === 'REJECT') return { ...l, status: 'REJECTED' };

      // Quyết định trạng thái tiếp theo dựa trên vai trò duyệt
      if (isManager && l.status === 'PENDING') {
        return { ...l, status: 'APPROVED_DEPT' }; // Tổ trưởng duyệt bước 1
      }
      if (isAdmin) {
        return { ...l, status: 'APPROVED' }; // Hành chính / BGH phê duyệt cuối cùng
      }
      return l;
    }));
  };

  // Gán giáo viên dạy thay
  const handleAssignSubstitute = (leaveId: string, subId: string, subName: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        return {
          ...l,
          substituteTeacherId: subId,
          substituteTeacherName: subName
        };
      }
      return l;
    }));
  };

  // Thêm chứng chỉ
  const handleAddCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertTitle.trim()) return;

    const updated = users.map(u => {
      if (u.id === selectedStaffForCert) {
        const badges = u.badges || [];
        return {
          ...u,
          badges: [...badges, `🏅 ${newCertTitle.trim()}`]
        };
      }
      return u;
    });

    onUpdateUsers(updated);
    setNewCertTitle('');
    setShowCertForm(false);
  };

  // Thêm chứng chỉ cho chính mình (Self-service)
  const handleAddMyCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertTitle.trim()) return;

    const updated = users.map(u => {
      if (u.id === currentUser.id) {
        const badges = u.badges || [];
        return {
          ...u,
          badges: [...badges, `🏅 ${newCertTitle.trim()}`]
        };
      }
      return u;
    });

    onUpdateUsers(updated);
    setNewCertTitle('');
    alert(lang === 'vi' ? 'Cập nhật bằng cấp mới thành công!' : 'Certificate added successfully!');
  };

  // Thêm CPD log cho bản thân
  const handleAddMyCpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCpdTitle.trim() || !newCpdHours) return;

    const hours = Number(newCpdHours);
    const updated = users.map(u => {
      if (u.id === currentUser.id) {
        const currentLog = u.cpdLog || [];
        const newLogItem = {
          id: `cpd_${Date.now()}`,
          date: new Date().toISOString().substring(0, 10),
          title: newCpdTitle.trim(),
          hours: hours
        };
        return {
          ...u,
          cpdHours: (u.cpdHours || 0) + hours,
          cpdLog: [...currentLog, newLogItem]
        };
      }
      return u;
    });

    onUpdateUsers(updated);
    setNewCpdTitle('');
    setNewCpdHours('4');
    alert(lang === 'vi' ? 'Đã ghi nhận bồi dưỡng chuyên môn!' : 'CPD hours logged successfully!');
  };

  // Điều chuyển nhân sự (Admin)
  const handleTransferStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    const staff = users.find(u => u.id === selectedStaffId);
    if (!staff) return;

    const updatedUsers = users.map(u => {
      if (u.id === selectedStaffId) {
        return {
          ...u,
          workspaceId: targetWorkspaceId,
          badges: [...(u.badges || []), `🔄 Điều chuyển sang ${targetWorkspaceId}`]
        };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    setTransferSuccess(`🎉 Điều chuyển thành công ${staff.name} sang bộ phận ${getWorkspaceName(targetWorkspaceId)}!`);
    setTimeout(() => setTransferSuccess(''), 5000);
  };

  // AI tìm giáo viên rảnh dạy thay cùng tổ chuyên môn
  const getAvailableSubstitutes = (leaveRequest: LeaveRequest) => {
    const deptTeachers = users.filter(u => u.workspaceId === leaveRequest.departmentId && u.id !== leaveRequest.teacherId);
    const dateObj = new Date(leaveRequest.leaveDate);
    let dayOfWeek = dateObj.getDay() + 1; // 0 -> Chủ nhật (1), 1 -> Thứ 2 (2)
    if (dayOfWeek === 1) dayOfWeek = 2;

    return deptTeachers.map(teacher => {
      const busySlots = MOCK_TKB_SLOTS.filter(s => s.teacherId === teacher.id && s.day === dayOfWeek);
      const isBusy = leaveRequest.slots.some(slot => busySlots.some(b => b.period === slot));
      return {
        teacher,
        isAvailable: !isBusy
      };
    });
  };

  // Lọc danh bạ nhân viên hiển thị theo phân quyền
  const filteredStaff = useMemo(() => {
    let result = users;
    if (isManager) {
      // Chỉ xem nhân sự trong tổ
      result = users.filter(u => u.workspaceId === currentUser.workspaceId);
    }
    return result.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.title && u.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, isManager, currentUser.workspaceId, searchQuery]);

  // Lọc lịch sử nghỉ phép hiển thị
  const visibleLeaves = useMemo(() => {
    if (isStaff) {
      return leaves.filter(l => l.teacherId === currentUser.id);
    }
    if (isManager) {
      // Quản lý chỉ thấy đơn từ của các thành viên trong tổ
      return leaves.filter(l => l.departmentId === currentUser.workspaceId);
    }
    return leaves; // Admin thấy tất cả
  }, [leaves, isStaff, isManager, currentUser.id, currentUser.workspaceId]);

  // Top giáo viên tiêu biểu
  const topTeachers = useMemo(() => {
    return [...users]
      .filter(u => u.role === 'STAFF')
      .sort((a, b) => (b.cpdHours || 0) - (a.cpdHours || 0))
      .slice(0, 4);
  }, [users]);

  // Hồ sơ chi tiết người được chọn
  const selectedProfileDetails = selectedProfileUser ? getPersonnelDetails(selectedProfileUser) : null;

  // Lấy lịch lương cá nhân
  const personalSalaryRecords = useMemo(() => {
    return salaryRecords.filter(s => s.userId === currentUser.id || s.staffName === currentUser.name);
  }, [salaryRecords, currentUser.id, currentUser.name]);

  // Lấy chấm công cá nhân
  const personalAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(a => a.userId === currentUser.id || a.staffName === currentUser.name);
  }, [attendanceRecords, currentUser.id, currentUser.name]);

  return (
    <div className="w-full space-y-6 animate-fade-in" id="hrm-center-root">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-indigo-800/30 shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl space-y-3">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            HUMAN RESOURCE MANAGEMENT
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            {lang === 'vi' ? 'Quản trị Nhân sự & Tiêu chuẩn Giáo viên' : 'Staff Governance & Standards'}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
            {lang === 'vi' 
              ? 'Hệ thống HRM hợp nhất phân quyền theo bộ phận (workspaceId). Hỗ trợ hồ sơ đa trí tuệ (MI), duyệt nghỉ phép theo quy trình 2 cấp, đề xuất dạy thay thông minh bằng thuật toán TKB và quản lý bảo mật lương.'
              : 'Unified HRM system integrated with department scopes. Supporting Multiple Intelligences (MI) profiles, two-stage leave approval, smart substitute recommendations, and payroll security.'}
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border shadow-3xs flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-sm scale-[1.01]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab contents */}
      <div className="transition-all duration-300">

        {/* TAB: SƠ ĐỒ TỔ CHỨC */}
        {activeTab === 'ORG_CHART' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-6">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm">
                {lang === 'vi' ? 'Cơ cấu Phân cấp Tổ chức (Organizational Hierarchy)' : 'Organizational Hierarchy'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5 font-sans">
                {lang === 'vi' 
                  ? 'Sơ đồ tổ chức phân cấp từ Ban Giám hiệu (BGH), Hội đồng Trường đến các Phòng ban chức năng và Tổ chuyên môn học thuật.'
                  : 'School structural diagram displaying Ban Giám hiệu, School Council, functional offices and academic departments.'}
              </p>
            </div>

            <div className="p-6 bg-slate-50/40 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex flex-col items-center space-y-6 min-h-[500px] w-full overflow-x-auto select-none">
              
              {/* Level 1: Board of Founders & Council */}
              <div className="flex gap-4">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/35 rounded-xl text-center shadow-3xs w-60">
                  <strong className="text-[11px] text-amber-600 dark:text-amber-400 block font-black uppercase tracking-wider">Hội đồng Trường</strong>
                  <span className="text-xs text-slate-800 dark:text-white block font-bold mt-1">PGS.TS. Nguyễn Văn Minh</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Chủ tịch Hội đồng</span>
                </div>
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/35 rounded-xl text-center shadow-3xs w-60">
                  <strong className="text-[11px] text-amber-600 dark:text-amber-400 block font-black uppercase tracking-wider">Ban Điều hành</strong>
                  <span className="text-xs text-slate-800 dark:text-white block font-bold mt-1">CEO HVL</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Giám đốc Điều hành</span>
                </div>
              </div>

              <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-800" />

              {/* Level 2: Ban Giám hiệu (BGH) */}
              <div className="w-full max-w-4xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-150 dark:border-indigo-900/40 p-4.5 rounded-2xl shadow-3xs">
                <div className="text-center mb-3.5">
                  <strong className="text-[11px] text-indigo-650 dark:text-indigo-400 block font-black uppercase tracking-wider font-mono">Ban Giám hiệu (BGH)</strong>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-center shadow-4xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp THPT</span>
                    <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Nguyễn Minh Triết</strong>
                    <span className="text-[9.5px] text-indigo-650 dark:text-indigo-400 block mt-1.5 font-mono font-bold">Hiệu trưởng điều hành</span>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-4xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500"></div>
                    <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp THCS</span>
                    <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Dương Nam Anh</strong>
                    <span className="text-[9.5px] text-slate-400 block mt-1.5 font-mono">Phó Hiệu trưởng</span>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-4xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500"></div>
                    <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp Tiểu học</span>
                    <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Ngô Anh Tuấn</strong>
                    <span className="text-[9.5px] text-slate-400 block mt-1.5 font-mono">Phó Hiệu trưởng</span>
                  </div>
                </div>
              </div>

              {/* Connecting lines */}
              <div className="flex w-full max-w-5xl justify-between px-16 relative">
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2"></div>
                <div className="w-1/2 border-t-2 border-slate-200 dark:border-slate-800 h-6"></div>
                <div className="w-1/2 border-t-2 border-slate-200 dark:border-slate-800 h-6"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
                {/* Left Branch: Functional Departments */}
                <div className="bg-slate-100/40 dark:bg-slate-900/30 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    Các Phòng ban &amp; Khối Vận hành
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                      <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Phòng Tuyển sinh &amp; PR</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Trưởng phòng: Cô Vũ Khánh Chi</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                      <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Phòng Khảo thí &amp; ĐBCL</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Trưởng phòng: Cô Đỗ Thùy Trang</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                      <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Hành chính - Kế toán - Nhân sự</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Văn phòng trường</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                      <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Dịch vụ Học đường &amp; Bếp ăn</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Trưởng phòng: Thầy Phạm Thế Anh</span>
                    </div>
                  </div>
                </div>

                {/* Right Branch: Subject Departments */}
                <div className="bg-slate-100/40 dark:bg-slate-900/30 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Tổ chuyên môn Học thuật
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Toán - Tin học</strong>
                      <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Cô Lê Thị Thanh Nhàn</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Ngữ văn</strong>
                      <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Thầy Vũ Tiến Đạt</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Ngoại ngữ</strong>
                      <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Cô Minh Tuyết</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Khoa học Tự nhiên</strong>
                      <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Cô Trần Thị Kim Anh</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: DANH BẠ NHÂN SỰ */}
        {activeTab === 'DIRECTORY' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: List users */}
            <div className={`${isAdmin ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4`}>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
                  {isManager ? `Danh sách giáo viên thuộc ${getWorkspaceName(currentUser.workspaceId)}` : 'Danh bạ cán bộ giáo viên nhà trường'}
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowCertForm(!showCertForm)}
                    className="px-3 py-1 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    + Thêm chứng chỉ cho giáo viên
                  </button>
                )}
              </div>

              {/* Add Cert Form */}
              {showCertForm && isAdmin && (
                <form onSubmit={handleAddCertSubmit} className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">Ghi nhận chứng chỉ/bằng cấp mới</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9.5px] text-slate-400 block mb-1">Chọn nhân sự nhận</label>
                      <select
                        value={selectedStaffForCert}
                        onChange={(e) => setSelectedStaffForCert(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({translateTitle(u.title, lang)})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9.5px] text-slate-400 block mb-1">Tiêu đề bằng cấp / Chứng chỉ</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: IELTS 8.0, Thạc sĩ Khoa học..."
                        value={newCertTitle}
                        onChange={(e) => setNewCertTitle(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowCertForm(false)} className="px-3 py-1 text-slate-500 border border-slate-200 rounded-lg">Hủy</button>
                    <button type="submit" className="px-3.5 py-1 bg-indigo-600 text-white font-bold rounded-lg">Cập nhật hồ sơ</button>
                  </div>
                </form>
              )}

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={lang === 'vi' ? 'Tìm kiếm theo tên giáo viên, môn dạy hoặc chức vụ...' : 'Search staff...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-200 font-semibold"
                />
              </div>

              {/* Directory grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredStaff.map(user => {
                  const details = getPersonnelDetails(user);
                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedProfileUser(user)}
                      className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-200 hover:shadow-sm rounded-xl text-left transition-all flex items-start gap-3.5"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white shadow-4xs shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                        <span className="text-[10px] text-slate-450 block font-mono">{translateTitle(user.title, lang)}</span>
                        <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block mt-1">
                          {getWorkspaceName(user.workspaceId)}
                        </span>
                        
                        <div className="mt-2 space-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="flex items-center gap-1.5 min-w-0">
                            <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{details.email}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                            {details.phone}
                          </span>
                        </div>
                        {user.badges && user.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.badges.slice(0, 2).map((b, idx) => (
                              <span key={idx} className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-1.5 py-0.2 rounded font-black tracking-wide">
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-[9.5px] text-indigo-600 hover:underline block mt-2 font-black">
                          {lang === 'vi' ? 'Xem hồ sơ chi tiết →' : 'View full profile →'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Transfer Form (Admin only) */}
            {isAdmin && (
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                  Điều chuyển Công tác Cán bộ
                </h3>
                {transferSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] rounded-lg font-bold">
                    {transferSuccess}
                  </div>
                )}
                <form onSubmit={handleTransferStaff} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Chọn Nhân sự</label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">-- Chọn giáo viên / nhân viên --</option>
                      {users.filter(u => u.role !== 'ADMIN').map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({translateTitle(u.title, lang)})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bộ phận Tiếp nhận mới</label>
                    <select
                      value={targetWorkspaceId}
                      onChange={(e) => setTargetWorkspaceId(e.target.value)}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      {Object.keys(getWorkspaceName('')).filter(k => k !== 'ALL').map(k => (
                        <option key={k} value={k}>{getWorkspaceName(k)}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-black rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-3xs"
                  >
                    <span>Thực hiện Điều chuyển</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB: CHẤM CÔNG & LƯƠNG TOÀN TRƯỜNG (Admin) */}
        {activeTab === 'ATTENDANCE_SALARY' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Attendance List */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
                Chuyên cần &amp; Check-in Hôm nay
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto pr-1">
                {attendanceRecords.map(a => {
                  const checkInTime = a.checkIn || '--:--';
                  const statusColors = {
                    PRESENT: 'bg-emerald-50 text-emerald-700',
                    LATE: 'bg-orange-50 text-orange-700',
                    ABSENT: 'bg-rose-50 text-rose-700',
                    LEAVE: 'bg-indigo-50 text-indigo-700'
                  };
                  return (
                    <div key={a.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <strong className="block font-bold text-slate-800 dark:text-slate-200">{a.staffName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{a.role}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10.5px] text-slate-500">Giờ vào: {checkInTime}</span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${statusColors[a.status] || ''}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payroll Table */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
                Bảng Lương Tháng {salaryRecords[0]?.month || '06-2026'}
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10.5px] font-black uppercase font-mono">
                    <tr>
                      <th className="px-3 py-2">Nhân sự</th>
                      <th className="px-3 py-2 text-right">Lương cứng</th>
                      <th className="px-3 py-2 text-right">Thưởng KPIs</th>
                      <th className="px-3 py-2 text-right">Khấu trừ</th>
                      <th className="px-3 py-2 text-right">Thực nhận</th>
                      <th className="px-3 py-2 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {salaryRecords.map(s => {
                      const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(n);
                      const hasSensitiveRead = hasCapability('PAYROLL', 'read', s.userId);
                      return (
                        <tr key={s.id} className="hover:bg-slate-550/5">
                          <td className="px-3 py-2.5">
                            <strong className="block font-bold text-slate-800 dark:text-slate-200">{s.staffName}</strong>
                            <span className="text-[9px] text-slate-400 font-semibold">{s.department}</span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-medium">
                            {hasSensitiveRead ? `${fmt(s.baseSalary)}đ` : '***đ'}
                          </td>
                          <td className="px-3 py-2.5 text-right text-emerald-600 font-mono font-medium">
                            {hasSensitiveRead ? `+${fmt(s.teachingBonus + s.kpiBonus)}đ` : '***đ'}
                          </td>
                          <td className="px-3 py-2.5 text-right text-rose-500 font-mono font-medium">
                            {hasSensitiveRead ? `-${fmt(s.deductions)}đ` : '***đ'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                            {hasSensitiveRead ? `${fmt(s.totalSalary)}đ` : '***đ'}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              disabled={s.paid}
                              onClick={() => {
                                setSalaryRecords(prev => prev.map(item => item.id === s.id ? { ...item, paid: true } : item));
                              }}
                              className={`px-2 py-0.5 rounded text-[8.5px] font-black cursor-pointer uppercase ${
                                s.paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {s.paid ? 'Đã chi' : 'Chi lương'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: DUYỆT NGHỈ PHÉP (Admin & Manager) */}
        {activeTab === 'LEAVE_REQUESTS' && !isStaff && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
              Phê duyệt nghỉ phép &amp; điều phối dạy thay
            </h3>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {visibleLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-8">Không có yêu cầu nghỉ phép nào cần xử lý.</p>
              ) : (
                visibleLeaves.map(req => {
                  const statusColors = {
                    PENDING: 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse',
                    APPROVED_DEPT: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                    APPROVED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    REJECTED: 'bg-rose-50 border-rose-200 text-rose-700'
                  };

                  const getStatusText = (status: string) => {
                    switch (status) {
                      case 'PENDING': return lang === 'vi' ? 'Chờ Tổ trưởng duyệt' : 'Pending Dept';
                      case 'APPROVED_DEPT': return lang === 'vi' ? 'Chờ Hành chính duyệt' : 'Pending Admin';
                      case 'APPROVED': return lang === 'vi' ? 'Đã duyệt' : 'Approved';
                      case 'REJECTED': return lang === 'vi' ? 'Từ chối' : 'Rejected';
                      default: return status;
                    }
                  };

                  const subCandidates = getAvailableSubstitutes(req);

                  return (
                    <div key={req.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-900/40 space-y-3">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <div>
                          <strong className="text-slate-900 dark:text-white text-xs font-black">👤 {req.teacherName}</strong>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            📅 Ngày: <strong>{req.leaveDate}</strong> | Tiết: <strong>{req.slots.join(', ')}</strong> | Bộ phận: <strong>{getWorkspaceName(req.departmentId)}</strong>
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase font-mono ${statusColors[req.status]}`}>
                          {getStatusText(req.status)}
                        </span>
                      </div>

                      <p className="text-[11.5px] text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-medium">
                        "{req.reason}"
                      </p>

                      {/* Display assigned substitute teacher */}
                      {req.substituteTeacherId ? (
                        <div className="bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-200/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">🧑‍🏫 Dạy thay: <strong className="text-emerald-700 dark:text-emerald-400">{req.substituteTeacherName}</strong></span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded font-black uppercase">Đã phân lịch</span>
                        </div>
                      ) : (
                        (req.status === 'APPROVED' || req.status === 'APPROVED_DEPT') && (
                          <div className="bg-amber-50/20 dark:bg-amber-950/15 border border-amber-200/40 p-2.5 rounded-xl text-xs text-amber-800 dark:text-amber-400 font-semibold">
                            ⚠️ Chưa chỉ định nhân sự dạy thay.
                          </div>
                        )
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 justify-end pt-1">
                        {req.status === 'PENDING' && isManager && (
                          <>
                            <button
                              onClick={() => handleApproveLeave(req.id, 'REJECT')}
                              className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded cursor-pointer"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleApproveLeave(req.id, 'APPROVE')}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-[10px] rounded cursor-pointer"
                            >
                              Duyệt bước 1
                            </button>
                          </>
                        )}

                        {isAdmin && (req.status === 'PENDING' || req.status === 'APPROVED_DEPT') && (
                          <>
                            <button
                              onClick={() => handleApproveLeave(req.id, 'REJECT')}
                              className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded cursor-pointer"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleApproveLeave(req.id, 'APPROVE')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded cursor-pointer"
                            >
                              Duyệt quyết định
                            </button>
                          </>
                        )}
                      </div>

                      {/* AI suggestion panel */}
                      {!req.substituteTeacherId && (req.status === 'APPROVED' || req.status === 'APPROVED_DEPT') && (
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            Gợi ý dạy thay (Thời khóa biểu khả dụng)
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {subCandidates.filter(c => c.isAvailable).length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic">Không tìm thấy giáo viên cùng tổ rảnh lịch.</span>
                            ) : (
                              subCandidates.filter(c => c.isAvailable).map(c => (
                                <div key={c.teacher.id} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded text-[11px]">
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{c.teacher.name}</span>
                                    <span className="text-[9.5px] text-slate-400 font-mono">Dạy tuần: {c.teacher.cpdHours || 0} tiết</span>
                                  </div>
                                  <button
                                    onClick={() => handleAssignSubstitute(req.id, c.teacher.id, c.teacher.name)}
                                    className="px-2 py-0.5 bg-indigo-600 text-white text-[9.5px] font-bold rounded"
                                  >
                                    Chỉ định dạy
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB: KPI & KHỐI LƯỢNG GIẢNG DẠY (Admin & Manager) */}
        {activeTab === 'KPI_WORKLOAD' && !isStaff && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left side: Workload table */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
                  Số tiết giảng dạy &amp; Cảnh báo quá tải
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-450 mt-1">
                  Định lượng định mức tiết dạy của giáo viên trong học kỳ (Tiết tiêu chuẩn: 15-18 tiết/tuần).
                </p>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredStaff.filter(u => u.role === 'STAFF').map(user => {
                  const teachingHours = user.cpdHours || 8;
                  const isOverloaded = teachingHours >= 20;
                  return (
                    <div key={user.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</h4>
                          <span className="text-[9.5px] text-slate-450 font-mono block">{translateTitle(user.title, lang)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-xs font-mono font-bold block">{teachingHours} tiết / tuần</span>
                          <span className="text-[9px] text-slate-400 block font-mono">Cường độ dạy</span>
                        </div>

                        {isOverloaded ? (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8.5px] font-black uppercase font-mono tracking-wider rounded-md animate-pulse">
                            ⚠️ Quá tải
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8.5px] font-black uppercase font-mono tracking-wider rounded-md">
                            Ổn định
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Top Performing */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
                Top Giáo viên tiêu biểu tháng
              </h3>
              <div className="space-y-3">
                {topTeachers.map(teacher => (
                  <button
                    key={teacher.id}
                    onClick={() => setSelectedProfileUser(teacher)}
                    className="w-full flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all cursor-pointer"
                  >
                    <img src={teacher.avatar} alt={teacher.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{teacher.name}</h4>
                      <span className="text-[9.5px] text-slate-450 block truncate">{translateTitle(teacher.title, lang)}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-650 shrink-0">
                      ★ KPI {getProfileKpi(teacher)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: HỒ SƠ CÁ NHÂN (Staff Self-Service) */}
        {activeTab === 'MY_PROFILE' && isStaff && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* General Info */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs text-center">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="mx-auto h-24 w-24 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-md animate-fade-in"
                />
                <h4 className="mt-3 text-lg font-black text-slate-900 dark:text-white">{currentUser.name}</h4>
                <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{translateTitle(currentUser.title, lang)}</p>
                <span className="mt-3 inline-flex rounded-full bg-indigo-600 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                  {currentUser.roleName}
                </span>
              </div>

              {/* Contact Information & Masked Sensitive Data */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3.5 text-xs font-sans">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Thông tin Nhân sự &amp; Liên hệ</p>
                
                {(() => {
                  const details = getPersonnelDetails(currentUser);
                  return (
                    <>
                      <div className="flex items-start gap-2.5">
                        <IdCard className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Mã Cán Bộ</p>
                          <p className="font-bold text-slate-850 dark:text-slate-200">{details.employeeCode}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Mail className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Email Trường</p>
                          <p className="font-bold text-slate-850 dark:text-slate-200">{details.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Phone className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Số Điện Thoại</p>
                          <p className="font-bold text-slate-850 dark:text-slate-200">{details.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Địa chỉ thường trú</p>
                          <p className="font-bold text-slate-850 dark:text-slate-200 leading-tight">{details.address}</p>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                        <p className="text-[9.5px] font-black uppercase text-indigo-750 dark:text-indigo-400 tracking-wider mb-2">Thông tin bảo mật bảo hiểm</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[8.5px] font-bold text-slate-400 block uppercase">CCCD / CMND</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{details.nationalId}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] font-bold text-slate-400 block uppercase">Mã số BHXH</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{details.insuranceCode}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Profiles detail tabs */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* MI profile strength */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">Hồ sơ đa năng lực trí tuệ (MI Profile)</h4>
                {currentUser.miProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(currentUser.miProfile).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 px-3.5 py-2">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="capitalize text-slate-500 dark:text-slate-400">{key}</span>
                          <span className="text-indigo-650 dark:text-indigo-400">{value}/100</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-indigo-600" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Chưa đánh giá hồ sơ đa trí tuệ.</p>
                )}
              </div>

              {/* Add Certificate to Self */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Tự Khai báo Chứng chỉ / Bằng cấp</h4>
                <form onSubmit={handleAddMyCert} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: IELTS 8.5, Chứng chỉ Microsoft MIE..."
                    value={newCertTitle}
                    onChange={(e) => setNewCertTitle(e.target.value)}
                    className="flex-1 text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-xs rounded-lg cursor-pointer">
                    Cập nhật
                  </button>
                </form>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {(currentUser.badges || []).map((b, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-[9.5px] font-bold">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Log Training & CPD hours */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Ghi nhận giờ Bồi dưỡng Chuyên môn (CPD Log)</h4>
                
                <form onSubmit={handleAddMyCpd} className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Tên khóa bồi dưỡng, tập huấn..."
                      value={newCpdTitle}
                      onChange={(e) => setNewCpdTitle(e.target.value)}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newCpdHours}
                      onChange={(e) => setNewCpdHours(e.target.value)}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="2">2 giờ</option>
                      <option value="4">4 giờ</option>
                      <option value="8">8 giờ</option>
                      <option value="12">12 giờ</option>
                      <option value="16">16 giờ</option>
                    </select>
                    <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-755 cursor-pointer">
                      Ghi nhận
                    </button>
                  </div>
                </form>

                <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-850">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[9.5px]">
                      <tr>
                        <th className="px-3 py-2">Ngày ghi nhận</th>
                        <th className="px-3 py-2">Khóa tập huấn / Bồi dưỡng</th>
                        <th className="px-3 py-2 text-center">Thời lượng (Giờ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(currentUser.cpdLog || []).map(item => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 font-mono text-slate-450">{item.date}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-350">{item.title}</td>
                          <td className="px-3 py-2 text-center font-black text-indigo-600 dark:text-indigo-400">{item.hours}h</td>
                        </tr>
                      ))}
                      {(!currentUser.cpdLog || currentUser.cpdLog.length === 0) && (
                        <tr>
                          <td colSpan={3} className="px-3 py-8 text-center text-slate-400 italic">Chưa ghi nhận hoạt động bồi dưỡng nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB: TỰ ĐĂNG KÝ NGHỈ PHÉP (Staff) */}
        {activeTab === 'MY_LEAVE' && isStaff && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Form apply leave */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2">
                Nộp đơn xin nghỉ phép
              </h3>
              <form onSubmit={handleApplyLeave} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Ngày xin nghỉ</label>
                  <input
                    type="date"
                    required
                    value={newLeave.leaveDate}
                    onChange={(e) => setNewLeave({ ...newLeave, leaveDate: e.target.value })}
                    className="w-full p-2 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Các Tiết nghỉ giảng dạy (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 3, 4"
                    value={newLeave.slots}
                    onChange={(e) => setNewLeave({ ...newLeave, slots: e.target.value })}
                    className="w-full p-2 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Lý do xin nghỉ</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Nêu chi tiết lý do (ví dụ: việc gia đình, lý do sức khỏe...)"
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    className="w-full p-2 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-lg transition-all shadow-3xs">
                  Nộp đơn lên Tổ trưởng
                </button>
              </form>
            </div>

            {/* Leaves history */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
                Lịch sử Nghỉ phép cá nhân
              </h3>
              
              <div className="space-y-3">
                {visibleLeaves.length === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-6">Thầy/Cô chưa có đơn xin nghỉ phép nào.</p>
                ) : (
                  visibleLeaves.map(req => {
                    const statusText = req.status === 'PENDING' ? 'Chờ duyệt (Cấp 1 - Tổ trưởng)'
                      : req.status === 'APPROVED_DEPT' ? 'Đã duyệt cấp Tổ (Chờ Hành chính xác nhận)'
                      : req.status === 'APPROVED' ? 'Đã phê duyệt chính thức'
                      : 'Bị từ chối';

                    const badgeColor = req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : req.status === 'APPROVED_DEPT' ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      : req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100';

                    return (
                      <div key={req.id} className="p-4 border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20 rounded-xl space-y-2.5">
                        <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                          <div>
                            <span className="font-mono text-slate-450 block">Ngày nghỉ: <strong>{req.leaveDate}</strong> | Tiết: <strong>{req.slots.join(', ')}</strong></span>
                          </div>
                          <span className={`px-2 py-0.5 rounded border text-[9.5px] font-black uppercase ${badgeColor}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-850 font-medium">
                          "{req.reason}"
                        </p>
                        <div className="text-[10px] text-slate-450 font-medium">
                          Trạng thái kiểm tra: <span className="font-bold text-slate-700 dark:text-slate-300">{statusText}</span>
                        </div>
                        {req.substituteTeacherId && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            ✓ Lịch đã bàn giao dạy thay cho: {req.substituteTeacherName}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB: LƯƠNG & CHẤM CÔNG CÁ NHÂN (Staff) */}
        {activeTab === 'MY_SALARY' && isStaff && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Personal Checkin log */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
                Lịch sử Chấm công Tháng này
              </h3>
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {personalAttendanceRecords.length === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-6">Chưa có dữ liệu chấm công tháng này.</p>
                ) : (
                  personalAttendanceRecords.map(a => (
                    <div key={a.id} className="p-2.5 border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold block text-slate-750 dark:text-slate-250">Ngày {a.date.split('-')[2] || a.date}</span>
                        <span className="text-[9.5px] text-slate-400 block font-mono">{a.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono block text-slate-600 dark:text-slate-300">Nhận diện: {a.checkIn || '--:--'} - {a.checkOut || '--:--'}</span>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] font-black mt-0.5 ${
                          a.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                        }`}>{a.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Salary Slips */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2">
                Phiếu Lương &amp; Thu Nhập Cục bộ
              </h3>
              
              {personalSalaryRecords.length === 0 ? (
                <p className="text-xs text-slate-450 italic text-center py-8">Chưa có phiếu lương được phát hành cho Thầy/Cô.</p>
              ) : (
                personalSalaryRecords.map(s => {
                  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
                  return (
                    <div key={s.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/10 dark:bg-slate-900/40 space-y-4 font-sans text-xs">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div>
                          <strong className="text-sm font-bold text-slate-900 dark:text-white block">Tháng {s.month}</strong>
                          <span className="text-[9.5px] text-slate-400 uppercase font-bold">{getWorkspaceName(currentUser.workspaceId)}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          s.paid ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                        }`}>{s.paid ? 'Đã chi trả' : 'Đang xử lý'}</span>
                      </div>

                      <div className="space-y-2 font-semibold">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Lương cơ bản (Hợp đồng)</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">{fmt(s.baseSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Thù lao giảng dạy / Vượt giờ</span>
                          <span className="font-mono text-emerald-600">+{fmt(s.teachingBonus)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Thưởng đánh giá KPI</span>
                          <span className="font-mono text-emerald-600">+{fmt(s.kpiBonus)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Khấu trừ BHXH / Thuế TNCN / Nghỉ quá phép</span>
                          <span className="font-mono text-rose-500">-{fmt(s.deductions)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                          <span>THỰC LÃNH TAY (NET)</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">{fmt(s.totalSalary)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB: KPI & LỊCH GIẢNG DẠY CÁ NHÂN (Staff) */}
        {activeTab === 'MY_KPI' && isStaff && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* KPI metric */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between gap-4">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2 mb-3">
                  Hiệu suất KPIs cá nhân
                </h3>
                <div className="text-center py-6">
                  <span className="text-5xl font-display font-black text-indigo-600 dark:text-indigo-400">{getProfileKpi(currentUser)}%</span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2">Đạt chỉ số học vụ</span>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-[11px] leading-relaxed text-slate-500 font-medium border border-slate-100 dark:border-slate-850">
                Chỉ số KPI được tổng hợp tự động từ tiến độ nộp giáo án, tỷ lệ chuyên cần, hoàn thành nhiệm vụ và giờ đào tạo chuyên môn CPD.
              </div>
            </div>

            {/* Workload log details */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2">
                Khối lượng giảng dạy tuần này
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500">Tổng số tiết thực dạy dự kiến</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentUser.cpdHours || 14} tiết</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-650 h-2 rounded-full" style={{ width: `${Math.min(100, ((currentUser.cpdHours || 14) / 18) * 100)}%` }} />
                </div>
                <div className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                  Định mức tiết chuẩn: 15 tiết. Tiết dạy tối đa: 18 tiết. Đạt: {Math.min(100, ((currentUser.cpdHours || 14) / 15) * 100).toFixed(0)}% tải chuẩn giảng dạy.
                </div>

                <div className="pt-2">
                  <strong className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block mb-2 font-mono">Các nhóm lớp được phân công</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-150 dark:border-slate-850">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Lớp 12A1 - THPT</span>
                      <span className="text-[9.5px] text-slate-450 font-medium block">Số tiết: 4 tiết/tuần</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-150 dark:border-slate-850">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Lớp 11B2 - THPT</span>
                      <span className="text-[9.5px] text-slate-450 font-medium block">Số tiết: 4 tiết/tuần</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Profile Detail Pop-up / Modal */}
      {selectedProfileUser && selectedProfileDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Hồ sơ Cán bộ Giáo viên</p>
                <h3 className="text-base font-display font-black text-slate-900 dark:text-white">{selectedProfileUser.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfileUser(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600 cursor-pointer"
                aria-label="Đóng hồ sơ"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5">
              
              {/* Left Column: Avatar & Basic Specs */}
              <aside className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5 text-center">
                  <img
                    src={selectedProfileUser.avatar}
                    alt={selectedProfileUser.name}
                    className="mx-auto h-24 w-24 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-md"
                  />
                  <h4 className="mt-3 text-base font-black text-slate-900 dark:text-white">{selectedProfileUser.name}</h4>
                  <p className="mt-1 text-xs font-semibold text-slate-650 dark:text-slate-400">{translateTitle(selectedProfileUser.title, lang)}</p>
                  <span className="mt-3 inline-flex rounded-full bg-indigo-600 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                    {selectedProfileUser.roleName}
                  </span>
                </div>

                {/* Details */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 text-xs">
                  <ProfileLine icon={IdCard} label="Mã nhân sự" value={selectedProfileDetails.employeeCode} />
                  <ProfileLine icon={Mail} label="Email trường" value={selectedProfileDetails.email} />
                  <ProfileLine icon={Phone} label="Số điện thoại" value={selectedProfileDetails.phone} />
                  <ProfileLine icon={MapPin} label="Địa chỉ" value={selectedProfileDetails.address} />
                  <ProfileLine icon={Briefcase} label="Bộ phận" value={getWorkspaceName(selectedProfileUser.workspaceId)} />
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 text-xs">
                  <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 font-mono">Hành chính &amp; Hợp đồng</p>
                  <ProfileLine icon={UserCheck} label="Giới tính" value={selectedProfileDetails.gender} />
                  <ProfileLine icon={Calendar} label="Ngày sinh" value={selectedProfileDetails.dateOfBirth} />
                  <ProfileLine icon={Briefcase} label="Hợp đồng" value={selectedProfileDetails.contractType} />
                  <ProfileLine icon={BookOpen} label="Trình độ" value={selectedProfileDetails.qualification} />
                </div>
              </aside>

              {/* Right Column: Performance, CPD & Sensitive Info */}
              <section className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ProfileMetric label="KPIs tháng" value={`${getProfileKpi(selectedProfileUser)}%`} note="Dựa trên công việc & chuyên môn" />
                  <ProfileMetric label="Đã tích lũy" value={`${selectedProfileUser.cpdHours || 0}h CPD`} note="Giờ bồi dưỡng chuyên môn" />
                  <ProfileMetric label="Thâm niên" value={selectedProfileDetails.startDate} note="Ngày gia nhập trường" />
                </div>

                {/* Security Mask check */}
                {(() => {
                  const hasSensitiveRead = hasCapability('SENSITIVE_PROFILE', 'read', selectedProfileUser.id);
                  const nationalIdVal = hasSensitiveRead ? selectedProfileDetails.nationalId : maskString(selectedProfileDetails.nationalId);
                  const insuranceVal = hasSensitiveRead ? selectedProfileDetails.insuranceCode : maskString(selectedProfileDetails.insuranceCode);
                  
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <div className="text-xs space-y-3">
                        <p className="text-[10px] font-black uppercase text-indigo-750 dark:text-indigo-400 tracking-wider">Thông tin nhạy cảm bảo mật</p>
                        <ProfileLine icon={IdCard} label="Số CCCD" value={nationalIdVal} />
                        <ProfileLine icon={ShieldAlert} label="Số bảo hiểm BHXH" value={insuranceVal} />
                      </div>
                      <div className="text-xs flex flex-col justify-end">
                        {!hasSensitiveRead && (
                          <div className="text-[9.5px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2 font-semibold flex items-start gap-1">
                            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>Thông tin đã mã hóa. Chỉ bộ phận Hành chính (HANH_CHINH) và Ban giám hiệu có quyền truy cập.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* MI profiles */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-650" />
                    Đa trí tuệ (MI profile)
                  </h4>
                  {selectedProfileUser.miProfile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.entries(selectedProfileUser.miProfile).map(([key, value]) => (
                        <div key={key} className="bg-slate-50/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-2 rounded-xl text-xs">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="capitalize text-slate-500">{key}</span>
                            <span className="text-indigo-650 dark:text-indigo-400">{value}/100</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-indigo-600" style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Chưa khai báo.</p>
                  )}
                </div>

                {/* CPD logs */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-indigo-650" />
                    Lịch sử tập huấn sư phạm (CPD history)
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[9.5px]">
                        <tr>
                          <th className="px-3 py-2">Ngày</th>
                          <th className="px-3 py-2">Nội dung học vụ</th>
                          <th className="px-3 py-2 text-center">Giờ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(selectedProfileUser.cpdLog || []).map(item => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 font-mono text-slate-450">{item.date}</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-350">{item.title}</td>
                            <td className="px-3 py-2 text-center font-black text-indigo-600 dark:text-indigo-400">{item.hours}h</td>
                          </tr>
                        ))}
                        {(!selectedProfileUser.cpdLog || selectedProfileUser.cpdLog.length === 0) && (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-slate-400 italic">Chưa ghi nhận hoạt động.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </section>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ProfileLine({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-650" />
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">{label}</p>
        <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function ProfileMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-4xs flex flex-col justify-between">
      <div>
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">{label}</p>
        <strong className="mt-2 block text-base font-black text-slate-900 dark:text-white leading-none">{value}</strong>
      </div>
      <p className="mt-2 text-[9.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">{note}</p>
    </div>
  );
}
