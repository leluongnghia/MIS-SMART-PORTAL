'use client';
import { serverStorage } from '../libs/client/server-storage';


import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateTitle } from '../utils/translations';
import { Users } from 'lucide-react';
import { UserProfile } from '../types';

import HrmOrgChart from './hrm/HrmOrgChart';
import HrmDirectory from './hrm/HrmDirectory';
import HrmAttendanceSalary from './hrm/HrmAttendanceSalary';
import HrmLeaveRequests from './hrm/HrmLeaveRequests';
import HrmKpiWorkload from './hrm/HrmKpiWorkload';
import HrmMyProfile from './hrm/HrmMyProfile';
import HrmEmployeeDetailModal from './hrm/HrmEmployeeDetailModal';

// New HRM Modules
import HrmDashboard from './hrm/HrmDashboard';
import HrmRecruitment from './hrm/HrmRecruitment';
import HrmOnboarding from './hrm/HrmOnboarding';
import HrmProbation from './hrm/HrmProbation';
import HrmContracts from './hrm/HrmContracts';
import HrmCpdTraining from './hrm/HrmCpdTraining';
import HrmDiscipline from './hrm/HrmDiscipline';
import HrmTransfers from './hrm/HrmTransfers';
import HrmLeaveManagement from './hrm/HrmLeaveManagement';

import { 
  MOCK_RECRUITMENT_JOBS, MOCK_CANDIDATES, MOCK_ONBOARDING_TASKS,
  MOCK_PROBATION_EVALS, MOCK_HR_CONTRACTS, MOCK_CPD_PROGRAMS,
  MOCK_CPD_PARTICIPANTS, MOCK_DISCIPLINARY_RECORDS, MOCK_TRANSFER_RECORDS
} from '../mockData';

interface HrmCenterProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
  hasCapability: (capability: string, action?: string, resourceOwnerId?: string) => boolean;
}

export interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  departmentId: string;
  leaveDate: string;
  slots: number[];
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

export default function HrmCenter({ currentUser, users, onUpdateUsers, hasCapability }: HrmCenterProps) {
  const { lang } = useLanguage();

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
    if (isAdmin || (isManager && currentUser.workspaceId === 'HANH_CHINH')) {
      return [
        { id: 'DASHBOARD', label: lang === 'vi' ? 'Tổng quan HRM' : 'Dashboard' },
        { id: 'DIRECTORY', label: lang === 'vi' ? 'Hồ sơ Nhân sự 360' : 'Staff Directory' },
        { id: 'RECRUITMENT', label: lang === 'vi' ? 'Tuyển dụng' : 'Recruitment' },
        { id: 'ONBOARDING', label: lang === 'vi' ? 'Tiếp nhận (Onboarding)' : 'Onboarding' },
        { id: 'PROBATION', label: lang === 'vi' ? 'Thử việc' : 'Probation' },
        { id: 'CONTRACTS', label: lang === 'vi' ? 'Hợp đồng' : 'Contracts' },
        { id: 'CPD_TRAINING', label: lang === 'vi' ? 'Đào tạo & CPD' : 'Training & CPD' },
        { id: 'DISCIPLINE', label: lang === 'vi' ? 'Kỷ luật' : 'Discipline' },
        { id: 'TRANSFERS', label: lang === 'vi' ? 'Thuyên chuyển' : 'Transfers' },
        { id: 'LEAVES_MGMT', label: lang === 'vi' ? 'Nghỉ phép' : 'Leaves Mgmt' },
        { id: 'ATTENDANCE_SALARY', label: lang === 'vi' ? 'Chấm công & Lương' : 'Attendance & Payroll' },
        { id: 'ORG_CHART', label: lang === 'vi' ? 'Sơ đồ Tổ chức' : 'Org Chart' },
      ];
    }
    return [
      { id: 'ORG_CHART', label: lang === 'vi' ? 'Sơ đồ Tổ chức' : 'Org Chart' },
      { id: 'DIRECTORY', label: lang === 'vi' ? 'Thành viên trong Tổ' : 'Department Staff' },
      { id: 'LEAVE_REQUESTS', label: lang === 'vi' ? 'Duyệt nghỉ phép' : 'Approve Leaves' },
      { id: 'KPI_WORKLOAD', label: lang === 'vi' ? 'KPI & Khối lượng' : 'Department KPIs' }
    ];
  }, [isStaff, isManager, isAdmin, currentUser.workspaceId, lang]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (isStaff) return 'MY_PROFILE';
    if (isAdmin || (isManager && currentUser.workspaceId === 'HANH_CHINH')) return 'DASHBOARD';
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
    const saved = serverStorage.getItem('mis_hrm_leaves');
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
    serverStorage.setItem('mis_hrm_leaves', JSON.stringify(leaves));
  }, [leaves]);

  // State: Chấm công
  const [attendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = serverStorage.getItem('mis_hrm_attendance');
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

  // State: Lương
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => {
    const saved = serverStorage.getItem('mis_hrm_salary');
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
    serverStorage.setItem('mis_hrm_salary', JSON.stringify(salaryRecords));
  }, [salaryRecords]);

  // Selected Profile
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
      email: user.email || `${normalizedId}@misvn.edu.vn`,
      personalEmail: user.personalEmail || `${normalizedId}.personal@gmail.com`,
      phone: user.phone || `09${String(10000000 + (seed * 7919) % 90000000).padStart(8, '0')}`,
      address: user.address || `Số ${(seed % 88) + 10}, ngõ ${(seed % 45) + 1}, ${addressAreas[seed % addressAreas.length]}`,
      dateOfBirth: user.dateOfBirth || `${1978 + (seed % 20)}-${month}-${day}`,
      gender: user.gender || inferVietnameseGender(user.name),
      startDate: user.startDate || `${startYears[seed % startYears.length]}-08-${String((seed % 15) + 1).padStart(2, '0')}`,
      contractType: user.contractType || (isManagerUser ? 'Hợp đồng quản lý toàn thời gian' : 'Hợp đồng lao động toàn thời gian'),
      qualification: user.qualification || (isManagerUser ? 'Thạc sĩ Quản trị giáo dục' : isTeacher ? 'Cử nhân/Thạc sĩ Sư phạm' : 'Cử nhân chuyên ngành phù hợp'),
      specialization: user.specialization || user.title,
      nationalId: user.nationalId || `${String(100000000000 + (seed * 104729) % 900000000000)}`,
      insuranceCode: user.insuranceCode || `BH-${String(1000000000 + (seed * 7919) % 9000000000)}`,
    };
  };

  const getProfileKpi = (user: UserProfile) => {
    return Math.min(99, 82 + ((user.cpdHours || 8) % 18));
  };

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
      <div className="flex border border-slate-200 dark:border-slate-800 gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-3xs flex-wrap">
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

        {/* NEW HRM TABS */}
        {activeTab === 'DASHBOARD' && (
          <HrmDashboard 
            users={users} 
            contracts={MOCK_HR_CONTRACTS} 
            cpdPrograms={MOCK_CPD_PROGRAMS} 
            disciplines={MOCK_DISCIPLINARY_RECORDS}
            leaves={leaves}
            lang={lang} 
          />
        )}

        {activeTab === 'RECRUITMENT' && (
          <HrmRecruitment jobs={MOCK_RECRUITMENT_JOBS} candidates={MOCK_CANDIDATES} lang={lang} />
        )}

        {activeTab === 'ONBOARDING' && (
          <HrmOnboarding tasks={MOCK_ONBOARDING_TASKS} lang={lang} />
        )}

        {activeTab === 'PROBATION' && (
          <HrmProbation evaluations={MOCK_PROBATION_EVALS} lang={lang} />
        )}

        {activeTab === 'CONTRACTS' && (
          <HrmContracts contracts={MOCK_HR_CONTRACTS} lang={lang} />
        )}

        {activeTab === 'CPD_TRAINING' && (
          <HrmCpdTraining programs={MOCK_CPD_PROGRAMS} participants={MOCK_CPD_PARTICIPANTS} lang={lang} />
        )}

        {activeTab === 'DISCIPLINE' && (
          <HrmDiscipline records={MOCK_DISCIPLINARY_RECORDS} lang={lang} />
        )}

        {activeTab === 'TRANSFERS' && (
          <HrmTransfers records={MOCK_TRANSFER_RECORDS} getWorkspaceName={getWorkspaceName} lang={lang} />
        )}

        {activeTab === 'LEAVES_MGMT' && (
          <HrmLeaveManagement leaves={leaves} lang={lang} />
        )}

        {/* TAB: SƠ ĐỒ TỔ CHỨC */}
        {activeTab === 'ORG_CHART' && <HrmOrgChart lang={lang} />}

        {/* TAB: DANH BẠ NHÂN SỰ */}
        {activeTab === 'DIRECTORY' && (
          <HrmDirectory
            currentUser={currentUser}
            users={users}
            lang={lang}
            isAdmin={isAdmin}
            isManager={isManager}
            getWorkspaceName={getWorkspaceName}
            translateTitle={translateTitle}
            onUpdateUsers={onUpdateUsers}
            setSelectedProfileUser={setSelectedProfileUser}
          />
        )}

        {/* TAB: CHẤM CÔNG & LƯƠNG */}
        {activeTab === 'ATTENDANCE_SALARY' && (
          <HrmAttendanceSalary
            currentUser={currentUser}
            attendanceRecords={attendanceRecords}
            salaryRecords={salaryRecords}
            isStaff={isStaff}
            isAdmin={isAdmin}
            hasCapability={hasCapability}
            getWorkspaceName={getWorkspaceName}
            onUpdateSalaryRecords={setSalaryRecords}
          />
        )}

        {/* TAB: DUYỆT NGHỈ PHÉP */}
        {activeTab === 'LEAVE_REQUESTS' && (
          <HrmLeaveRequests
            currentUser={currentUser}
            users={users}
            lang={lang}
            isStaff={isStaff}
            isManager={isManager}
            isAdmin={isAdmin}
            leaves={leaves}
            onUpdateLeaves={setLeaves}
            getWorkspaceName={getWorkspaceName}
          />
        )}

        {/* TAB: KPI & KHỐI LƯỢNG */}
        {activeTab === 'KPI_WORKLOAD' && (
          <HrmKpiWorkload
            currentUser={currentUser}
            users={users}
            lang={lang}
            isStaff={isStaff}
            translateTitle={translateTitle}
            setSelectedProfileUser={setSelectedProfileUser}
          />
        )}

        {/* TABS CỦA STAFF (Self-Service) */}
        {isStaff && (
          <HrmMyProfile
            currentUser={currentUser}
            users={users}
            onUpdateUsers={onUpdateUsers}
            leaves={leaves}
            setLeaves={setLeaves}
            attendanceRecords={attendanceRecords}
            salaryRecords={salaryRecords}
            lang={lang}
            activeTab={activeTab}
            getPersonnelDetails={getPersonnelDetails}
            translateTitle={translateTitle}
            getProfileKpi={getProfileKpi}
            getWorkspaceName={getWorkspaceName}
          />
        )}

      </div>

      {/* Profile Detail Pop-up / Modal */}
      <HrmEmployeeDetailModal
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        user={selectedProfileUser}
        lang={lang}
        hasCapability={hasCapability}
        getWorkspaceName={getWorkspaceName}
        translateTitle={translateTitle}
      />

    </div>
  );
}
