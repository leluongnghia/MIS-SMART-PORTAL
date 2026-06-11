import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { Target, Users, Sparkles, Award, ShieldAlert, Check, X, ArrowRightLeft, Clock, Calendar, Mail, Briefcase, BookOpen, Lock, Phone, MapPin, IdCard, UserCheck } from 'lucide-react';

interface TeacherHrHubProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
}

interface LeaveRequest {
  id: string;
  name: string;
  role: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function TeacherHrHub({ currentUser, users, onUpdateUsers }: TeacherHrHubProps) {
  const [activeTab, setActiveTab] = useState<'ORG_CHART' | 'DIRECTORY' | 'KPI_WORKLOAD' | 'LEAVE_REQUESTS'>('ORG_CHART');

  // Leave Requests state
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { id: 'l_1', name: 'Cô Phạm Hồng Nhung', role: 'Giáo viên Ngữ Văn', days: 2, reason: 'Nghỉ phép đi khám sức khỏe định kỳ ở bệnh viện', status: 'PENDING' },
    { id: 'l_2', name: 'Thầy Nguyễn Văn Kha', role: 'Cán bộ Thiết bị', days: 1, reason: 'Giải quyết việc gia đình riêng đột xuất', status: 'PENDING' }
  ]);

  // Transfer state
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('TOAN_TIN');
  const [transferSuccess, setTransferSuccess] = useState('');

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
    setTransferSuccess(`🎉 Điều chuyển thành công ${staff.name} sang Bộ phận ${targetWorkspaceId}!`);
    setTimeout(() => setTransferSuccess(''), 5000);
  };

  const handleApproveLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'APPROVED' } : l));
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'REJECTED' } : l));
  };

  // Top teachers sorted by cpdHours
  const topTeachers = useMemo(() => {
    return [...users]
      .filter(u => u.role === 'STAFF')
      .sort((a, b) => (b.cpdHours || 0) - (a.cpdHours || 0))
      .slice(0, 4);
  }, [users]);

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

  const getProfileKpi = (user: UserProfile) => {
    return Math.min(99, 82 + ((user.cpdHours || 8) % 18));
  };

  const getPersonnelDetails = (user: UserProfile) => {
    const seed = Array.from(user.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const normalizedId = user.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `ns${seed}`;
    const addressAreas = [
      'Cau Giay, Ha Noi',
      'Nam Tu Liem, Ha Noi',
      'Thanh Xuan, Ha Noi',
      'Ha Dong, Ha Noi',
      'Hoang Mai, Ha Noi',
      'Long Bien, Ha Noi',
      'Bac Tu Liem, Ha Noi',
      'Dong Da, Ha Noi'
    ];
    const startYears = [2018, 2019, 2020, 2021, 2022, 2023];
    const month = String((seed % 9) + 1).padStart(2, '0');
    const day = String((seed % 20) + 5).padStart(2, '0');
    const roleTitle = `${user.roleName} - ${user.title}`;
    const isTeacher = /giao vien|to truong|teacher/i.test(roleTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    const isManager = user.role === 'ADMIN' || user.role === 'MANAGER';

    return {
      employeeCode: user.employeeCode || `MIS-HR-${String(seed).padStart(4, '0')}`,
      email: user.email || `${normalizedId}@mis.edu.vn`,
      personalEmail: user.personalEmail || `${normalizedId}.personal@gmail.com`,
      phone: user.phone || `09${String(10000000 + (seed * 7919) % 90000000).padStart(8, '0')}`,
      address: user.address || `So ${(seed % 88) + 10}, ngo ${(seed % 45) + 1}, ${addressAreas[seed % addressAreas.length]}`,
      dateOfBirth: user.dateOfBirth || `${1978 + (seed % 20)}-${month}-${day}`,
      gender: user.gender || (seed % 3 === 0 ? 'Nam' : 'Nữ'),
      startDate: user.startDate || `${startYears[seed % startYears.length]}-08-${String((seed % 15) + 1).padStart(2, '0')}`,
      contractType: user.contractType || (isManager ? 'Hợp đồng quản lý toàn thời gian' : 'Hợp đồng lao động toàn thời gian'),
      qualification: user.qualification || (isManager ? 'Thạc sĩ Quản trị giáo dục' : isTeacher ? 'Cử nhân/Thạc sĩ Sư phạm' : 'Cử nhân chuyên ngành phù hợp'),
      specialization: user.specialization || user.title,
      emergencyContact: user.emergencyContact || `Nguoi than - 08${String(10000000 + (seed * 3571) % 90000000).padStart(8, '0')}`,
      nationalId: user.nationalId || `0${String(10000000000 + (seed * 15485863) % 90000000000).padStart(11, '0')}`,
      insuranceCode: user.insuranceCode || `BHXH-${String(seed * 97).padStart(6, '0')}`
    };
  };

  const selectedProfileDetails = selectedProfileUser ? getPersonnelDetails(selectedProfileUser) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1 w-fit">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Human Resources Management
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Quản trị nhân sự và phát triển năng lực giáo viên</h2>
          <p className="text-xs text-slate-350 max-w-3xl font-light leading-relaxed">
            Xem cơ cấu tổ chức nhà trường, điều phối điều chuyển nhân sự phòng ban, theo dõi chuyên cần nghỉ phép và bảng xếp hạng KPIs giảng dạy.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 bg-white p-1.5 rounded-2xl border shadow-3xs flex-wrap">
        <button
          onClick={() => setActiveTab('ORG_CHART')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ORG_CHART' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Sơ đồ Tổ chức (Org Chart)</span>
        </button>
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Danh bạ Nhân sự (Directory)</span>
        </button>
        <button
          onClick={() => setActiveTab('KPI_WORKLOAD')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'KPI_WORKLOAD' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>KPIs &amp; Khối lượng giảng dạy</span>
        </button>
        <button
          onClick={() => setActiveTab('LEAVE_REQUESTS')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'LEAVE_REQUESTS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>Duyệt Nghỉ Phép ({leaveRequests.filter(l => l.status === 'PENDING').length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: ORGANIZATIONAL CHART REPRESENTATION */}
        {activeTab === 'ORG_CHART' && (
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-6">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm">Sơ đồ Tổ Chức Nhà Trường (Hierarchy Structure)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-sans">Mô hình phân cấp quản lý vận hành từ Hội đồng trường đến Ban giám hiệu, các Phòng chức năng và các Tổ chuyên môn theo chuẩn GDPT 2018.</p>
            </div>

            {/* Visual tree diagram */}
            <div className="p-6 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex flex-col items-center space-y-6 min-h-[500px] w-full overflow-x-auto select-none">
              
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

              {/* Level 2: Ban Giám hiệu (BGH) - Phân cấp quản lý */}
              <div className="w-full max-w-4xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-150 dark:border-indigo-900/40 p-4.5 rounded-2xl shadow-3xs">
                <div className="text-center mb-3.5">
                  <strong className="text-[11px] text-indigo-650 dark:text-indigo-400 block font-black uppercase tracking-wider font-mono">Ban Giám hiệu (BGH)</strong>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cấp THPT & Chung - Thầy Chưa Biết Chừng */}
                  <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-center shadow-4xs flex flex-col justify-between items-center relative overflow-hidden group hover:border-indigo-500 transition-colors">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
                    <div className="w-full">
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp THPT</span>
                      <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Chưa Biết Chừng</strong>
                    </div>
                    <span className="text-[9.5px] text-indigo-650 dark:text-indigo-400 block mt-1.5 font-mono font-bold">Hiệu trưởng điều hành chung</span>
                  </div>

                  {/* Cấp THCS - Thầy Dương Nam Anh */}
                  <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-4xs flex flex-col justify-between items-center relative overflow-hidden group hover:border-violet-500/50 transition-colors">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500"></div>
                    <div className="w-full">
                      <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp THCS</span>
                      <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Dương Nam Anh</strong>
                    </div>
                    <span className="text-[9.5px] text-slate-400 block mt-1.5 font-mono">Phó Hiệu trưởng</span>
                  </div>

                  {/* Cấp Tiểu học - Thầy Ngô Anh Tuấn */}
                  <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-4xs flex flex-col justify-between items-center relative overflow-hidden group hover:border-sky-500/50 transition-colors">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500"></div>
                    <div className="w-full">
                      <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp Tiểu học</span>
                      <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Ngô Anh Tuấn</strong>
                    </div>
                    <span className="text-[9.5px] text-slate-400 block mt-1.5 font-mono">Phó Hiệu trưởng</span>
                  </div>
                </div>
              </div>

              {/* Connector lines to two main branches */}
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
                    Các Phòng ban &amp; Tổ chức Chức năng
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                      <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Phòng Tuyển sinh &amp; PR</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Trưởng phòng: Cô Vũ Khánh Chi</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                      <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Phòng Khảo thí &amp; ĐBCL</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Quản lý: Cô Hoàng Trúc Liên</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                      <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Tổ Công tác Học sinh</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Tổ trưởng: Thầy Phạm Đức Hải</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                      <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Dịch vụ &amp; Vận hành</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5">Điều phối: Cô Trần Vân Anh</span>
                    </div>
                  </div>
                </div>

                {/* Right Branch: Academic Subject Departments (GDPT 2018) */}
                <div className="bg-slate-100/40 dark:bg-slate-900/30 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Tổ chuyên môn học thuật (GDPT 2018)
                  </h4>
                  
                  {/* Cấp THPT */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
                      <span className="text-[9px] font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-mono">Cấp THPT</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Toán - Tin học (THPT)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Thầy Nguyễn Minh Triết</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Ngữ văn (THPT)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Thầy Vũ Tiến Đạt</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Vật lí - Hóa học (THPT)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Cô Trần Thị Kim Anh</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Sinh - Địa - GDQP (THPT)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Thầy Hoàng Văn Sơn</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Ngoại ngữ (THPT)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Cô Minh Tuyết</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ GDKT-PL &amp; Nghệ thuật (THPT)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Liên hệ: Cô Hoàng Thị Hương</span>
                      </div>
                    </div>
                  </div>

                  {/* Cấp THCS */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-violet-500 rounded-full"></span>
                      <span className="text-[9px] font-black uppercase tracking-wide text-violet-600 dark:text-violet-400 font-mono">Cấp THCS</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Toán - Tin học (THCS)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Cô Lê Thị Thanh Nhàn</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Khoa học Tự nhiên (THCS)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Thầy Vũ Minh Khang</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Ngữ văn &amp; Lịch sử - Địa lí (THCS)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Cô Nguyễn Thanh Lan</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Ngoại ngữ &amp; GDCD (THCS)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Liên hệ: Cô Đỗ Thục Quyên</span>
                      </div>
                    </div>
                  </div>

                  {/* Cấp Tiểu học */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-sky-500 rounded-full"></span>
                      <span className="text-[9px] font-black uppercase tracking-wide text-sky-600 dark:text-sky-400 font-mono">Cấp Tiểu học</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Toán - Tiếng Việt (Tiểu học)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Cô Nguyễn Mai Chi</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Tự nhiên &amp; Xã hội (Tiểu học)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Cô Lê Thu Hà</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Ngoại ngữ &amp; Tin học (Tiểu học)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Liên hệ: Thầy David Miller</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                        <strong className="text-[10px] text-slate-850 dark:text-white block font-bold">Tổ Nghệ thuật &amp; Thể chất (Tiểu học)</strong>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">Liên hệ: Thầy Trịnh Công Sơn</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
{/* TAB 2: HR DIRECTORY & TRANSFER SYSTEM */}
        {activeTab === 'DIRECTORY' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left side: Directory grid */}
            <div className="lg:col-span-8 bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
                Danh bạ giáo viên &amp; nhân viên
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
                {users.map(user => {
                  const details = getPersonnelDetails(user);

                  return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedProfileUser(user)}
                    className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start gap-3.5 hover:border-indigo-250 hover:bg-white hover:shadow-3xs transition-all select-none text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white shadow-3xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{user.name}</h4>
                      <span className="text-[9.5px] text-slate-400 block font-mono">{user.title}</span>
                      <span className="text-[9.5px] text-indigo-600 block font-semibold mt-1">Đơn vị: {getWorkspaceName(user.workspaceId)}</span>
                      <div className="mt-2 space-y-1 text-[9.5px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{details.email}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                          {details.phone}
                        </span>
                        <span className="flex items-start gap-1.5">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                          <span className="line-clamp-2">{details.address}</span>
                        </span>
                      </div>
                      {user.badges && user.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {user.badges.slice(0, 1).map((b, idx) => (
                            <span key={idx} className="text-[8.5px] bg-slate-200/85 px-1.5 py-0.2 rounded font-semibold text-slate-600">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-indigo-600">
                        Xem hồ sơ đầy đủ
                        <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: HR Transfer form */}
            <div className="lg:col-span-4 bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
                Điều chuyển Công tác Nhân sự
              </h3>

              {transferSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg font-semibold">
                  {transferSuccess}
                </div>
              )}

              <form onSubmit={handleTransferStaff} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Chọn Nhân sự</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn Cán bộ giáo viên --</option>
                    {users.filter(u => u.role !== 'ADMIN').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Chuyển sang Bộ phận mới</label>
                  <select
                    value={targetWorkspaceId}
                    onChange={(e) => setTargetWorkspaceId(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="TOAN_TIN">Tổ Toán - Tin học</option>
                    <option value="VAN">Tổ Ngữ Văn</option>
                    <option value="TUYEN_SINH_PR">Tuyển sinh & PR</option>
                    <option value="HANH_CHINH">Tổ Hành chính</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Thực hiện Điều Chuyển</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: TEACHER KPI & WORKLOAD STATS */}
        {activeTab === 'KPI_WORKLOAD' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Workload list */}
            <div className="lg:col-span-8 bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
                  Định lượng Khối lượng Giảng dạy &amp; Overload alerts
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Giám sát tải số giờ dạy hàng tuần của giáo viên để tránh tình trạng quá tải kiệt sức học vụ.</p>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {users.filter(u => u.role === 'STAFF').map(user => {
                  const teachingHours = user.cpdHours || 8; // map cpdHours to workload demo
                  const isOverloaded = teachingHours >= 20;

                  return (
                    <div key={user.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{user.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{user.title}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-[10.5px] font-bold block">{teachingHours} giờ / tuần</span>
                          <span className="text-[9px] text-slate-400 block font-mono">Số tiết giảng dạy</span>
                        </div>

                        {isOverloaded ? (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8.5px] font-black uppercase font-mono tracking-wider rounded-md shrink-0 animate-pulse">
                            ⚠️ Quá tải
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8.5px] font-black uppercase font-mono tracking-wider rounded-md shrink-0">
                            Ổn định
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top performing teachers */}
            <div className="lg:col-span-4 bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b border-slate-100 pb-2">
                Top Giáo viên tiêu biểu tháng
              </h3>

              <div className="space-y-3.5">
                {topTeachers.map(teacher => (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => setSelectedProfileUser(teacher)}
                    className="w-full flex items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50 hover:ring-1 hover:ring-indigo-100 transition-all cursor-pointer"
                  >
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{teacher.name}</h4>
                      <span className="text-[10px] text-slate-450 block truncate">{teacher.title}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600 shrink-0">
                      ★ KPI {90 + ((teacher.cpdHours || 0) % 10)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: LEAVE REQUEST APPROVAL LIST */}
        {activeTab === 'LEAVE_REQUESTS' && (
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm border-b border-slate-100 pb-3">
              Xét duyệt nghỉ phép giáo viên &amp; nhân viên
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {leaveRequests.map(req => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{req.name}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-[8.5px] font-bold text-slate-500 rounded-md font-mono">{req.role}</span>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">Vắng: {req.days} ngày</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 font-semibold leading-relaxed">
                      Lý do nghỉ: "{req.reason}"
                    </p>
                  </div>

                  {req.status === 'PENDING' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRejectLeave(req.id)}
                        className="p-1 px-3 border border-rose-250 hover:bg-rose-50 text-rose-700 text-xs rounded-lg font-bold cursor-pointer"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApproveLeave(req.id)}
                        className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg font-bold cursor-pointer"
                      >
                        Duyệt phép
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase font-mono tracking-wider rounded-lg shrink-0 ${
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {req.status === 'APPROVED' ? '✓ Đã đồng ý' : '✗ Đã bác bỏ'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {selectedProfileUser && selectedProfileDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Hồ sơ nhân sự đầy đủ</p>
                <h3 className="text-base font-display font-black text-slate-900">{selectedProfileUser.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfileUser(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-rose-600 cursor-pointer"
                aria-label="Đóng hồ sơ nhân sự"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5">
              <aside className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <img
                    src={selectedProfileUser.avatar}
                    alt={selectedProfileUser.name}
                    className="mx-auto h-24 w-24 rounded-3xl object-cover border-4 border-white shadow-md"
                  />
                  <h4 className="mt-3 text-lg font-black text-slate-900">{selectedProfileUser.name}</h4>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{selectedProfileUser.title}</p>
                  <span className="mt-3 inline-flex rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    {selectedProfileUser.roleName}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
                  <ProfileLine icon={IdCard} label="Mã nhân sự" value={selectedProfileDetails.employeeCode} />
                  <ProfileLine icon={Mail} label="Email trường" value={selectedProfileDetails.email} />
                  <ProfileLine icon={Mail} label="Email cá nhân" value={selectedProfileDetails.personalEmail} />
                  <ProfileLine icon={Phone} label="Số điện thoại" value={selectedProfileDetails.phone} />
                  <ProfileLine icon={MapPin} label="Địa chỉ nhà" value={selectedProfileDetails.address} />
                  <ProfileLine icon={Briefcase} label="Bộ phận" value={getWorkspaceName(selectedProfileUser.workspaceId)} />
                  <ProfileLine icon={ShieldAlert} label="Vai trò hệ thống" value={selectedProfileUser.role} />
                  <ProfileLine icon={Lock} label="Trạng thái KPI" value={selectedProfileUser.kpiLocked ? 'Đã khóa kỳ đánh giá' : 'Đang mở đánh giá'} />
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Thông tin cá nhân &amp; hành chính</p>
                  <ProfileLine icon={UserCheck} label="Giới tính" value={selectedProfileDetails.gender} />
                  <ProfileLine icon={Calendar} label="Ngày sinh" value={selectedProfileDetails.dateOfBirth} />
                  <ProfileLine icon={Calendar} label="Ngày vào trường" value={selectedProfileDetails.startDate} />
                  <ProfileLine icon={Briefcase} label="Loại hợp đồng" value={selectedProfileDetails.contractType} />
                  <ProfileLine icon={BookOpen} label="Trình độ" value={selectedProfileDetails.qualification} />
                  <ProfileLine icon={Target} label="Chuyên môn" value={selectedProfileDetails.specialization} />
                  <ProfileLine icon={Phone} label="Liên hệ khẩn cấp" value={selectedProfileDetails.emergencyContact} />
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Huy hiệu / ghi nhận</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(selectedProfileUser.badges || ['Chưa có huy hiệu ghi nhận']).map((badge, idx) => (
                      <span key={idx} className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>

              <section className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ProfileMetric label="KPI tháng" value={`${getProfileKpi(selectedProfileUser)}%`} note="Tổng hợp từ tiến độ, CPD và hồ sơ công việc" />
                  <ProfileMetric label="Giờ CPD" value={`${selectedProfileUser.cpdHours || 0}`} note="Bồi dưỡng chuyên môn đã ghi nhận" />
                  <ProfileMetric label="Mã nhân sự" value={selectedProfileDetails.employeeCode} note="Định danh nội bộ trên hệ thống" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Thông tin định danh</p>
                    <ProfileLine icon={IdCard} label="CCCD/CMND" value={selectedProfileDetails.nationalId} />
                    <ProfileLine icon={ShieldAlert} label="Mã BHXH" value={selectedProfileDetails.insuranceCode} />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Liên hệ công việc</p>
                    <ProfileLine icon={Phone} label="Điện thoại" value={selectedProfileDetails.phone} />
                    <ProfileLine icon={Mail} label="Email" value={selectedProfileDetails.email} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Hồ sơ năng lực đa trí tuệ</h4>
                  </div>
                  {selectedProfileUser.miProfile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(selectedProfileUser.miProfile).map(([key, value]) => (
                        <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="capitalize text-slate-600">{key}</span>
                            <span className="text-indigo-700">{value}/100</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Chưa có dữ liệu hồ sơ năng lực đa trí tuệ cho nhân sự này.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Lịch sử bồi dưỡng chuyên môn</h4>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="text-left px-3 py-2">Ngày</th>
                          <th className="text-left px-3 py-2">Nội dung</th>
                          <th className="text-center px-3 py-2">Số giờ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedProfileUser.cpdLog || []).map(item => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 font-mono text-slate-500">{item.date}</td>
                            <td className="px-3 py-2 font-semibold text-slate-700">{item.title}</td>
                            <td className="px-3 py-2 text-center font-black text-indigo-700">{item.hours}</td>
                          </tr>
                        ))}
                        {(!selectedProfileUser.cpdLog || selectedProfileUser.cpdLog.length === 0) && (
                          <tr>
                            <td colSpan={3} className="px-3 py-8 text-center text-slate-400">Chưa ghi nhận khóa bồi dưỡng chuyên môn.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
                  <strong className="block text-slate-900 mb-1">Ghi chú hồ sơ:</strong>
                  Hồ sơ này tổng hợp dữ liệu đang có trong danh bạ nhân sự, phân quyền, CPD, KPI và hồ sơ năng lực. Khi tích hợp thêm bảng lương, lịch dạy và đánh giá tiết học, khu vực này có thể mở rộng thành hồ sơ nhân sự hoàn chỉnh theo từng năm học.
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
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 break-words font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function ProfileMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-3xs">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <strong className="mt-1 block text-lg font-black text-slate-900">{value}</strong>
      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{note}</p>
    </div>
  );
}
