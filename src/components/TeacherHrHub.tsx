import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { Target, Users, Sparkles, Award, ShieldAlert, Check, X, ArrowRightLeft, Clock, Calendar } from 'lucide-react';

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
              <p className="text-[11px] text-slate-500 mt-0.5">Mô hình phân cấp quản lý vận hành từ Hội đồng trường đến Ban giám hiệu và các Tổ bộ phận.</p>
            </div>

            {/* Visual tree diagram */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex flex-col items-center space-y-8 min-h-[350px]">
              
              {/* Level 1: Chairman */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center shadow-3xs w-60">
                <strong className="text-xs text-amber-900 block font-bold">Chủ tịch Hội đồng trường</strong>
                <span className="text-[10px] text-slate-500 block">Thầy PGS.TS. Nguyễn Văn Minh</span>
              </div>

              <div className="h-6 w-0.5 bg-slate-300" />

              {/* Level 2: Principal */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center shadow-3xs w-60">
                <strong className="text-xs text-indigo-900 block font-bold">Hiệu trưởng (BGH)</strong>
                <span className="text-[10px] text-slate-500 block">Thầy Chưa Biết Chừng</span>
              </div>

              <div className="h-6 w-0.5 bg-slate-300" />

              {/* Level 3: Vice Principals */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-3 bg-indigo-50/70 border border-indigo-150 rounded-xl text-center shadow-3xs w-48">
                  <strong className="text-xs text-indigo-900 block font-semibold">Phó Hiệu trưởng Chuyên môn</strong>
                  <span className="text-[10px] text-slate-500 block">Thầy Dương Nam Anh</span>
                </div>
                <div className="p-3 bg-indigo-50/70 border border-indigo-150 rounded-xl text-center shadow-3xs w-48">
                  <strong className="text-xs text-indigo-900 block font-semibold">Phó Hiệu trưởng CSVC</strong>
                  <span className="text-[10px] text-slate-500 block">Thầy Ngô Anh Tuấn</span>
                </div>
              </div>

              <div className="h-6 w-0.5 bg-slate-300" />

              {/* Level 4: Department Heads */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                  <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Tổ Toán - Tin</strong>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">Cô Lê Thị Thanh Nhàn</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                  <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Tổ Ngữ Văn</strong>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">Thầy Vũ Tiến Đạt</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                  <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Phòng Tuyển sinh</strong>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">Cô Vũ Khánh Chi</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                  <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Khối Hành chính</strong>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">Cô Hoàng Trúc Liên</span>
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
                {users.map(user => (
                  <div key={user.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start gap-3.5 hover:border-slate-200 transition-all select-none">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white shadow-3xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{user.name}</h4>
                      <span className="text-[9.5px] text-slate-400 block font-mono">{user.title}</span>
                      <span className="text-[9.5px] text-indigo-600 block font-semibold mt-1">Đơn vị: {user.workspaceId}</span>
                      {user.badges && user.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {user.badges.slice(0, 1).map((b, idx) => (
                            <span key={idx} className="text-[8.5px] bg-slate-200/85 px-1.5 py-0.2 rounded font-semibold text-slate-600">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                  <div key={teacher.id} className="flex items-center gap-3">
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
                  </div>
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
    </div>
  );
}
