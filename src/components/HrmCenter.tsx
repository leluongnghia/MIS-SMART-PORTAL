import React, { useState, useEffect } from 'react';
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
  Briefcase
} from 'lucide-react';
import { UserProfile } from '../types';

interface HrmCenterProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
}

interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  departmentId: string;
  leaveDate: string;
  slots: number[]; // Tiết xin nghỉ (ví dụ: [3, 4])
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  substituteTeacherId?: string;
  substituteTeacherName?: string;
  createdAt: string;
}

// Lưới thời khóa biểu tĩnh để quét tìm giáo viên rảnh dạy thay
const MOCK_TKB_SLOTS = [
  // Nhàn (Toán) - Bận tiết 1,2 Thứ 2; 3,4 Thứ 3; 5,6 Thứ 4; 1 Thứ 5; 3 Thứ 6
  { teacherId: 'user_nhan', day: 2, period: 1 }, { teacherId: 'user_nhan', day: 2, period: 2 },
  { teacherId: 'user_nhan', day: 3, period: 3 }, { teacherId: 'user_nhan', day: 3, period: 4 },
  { teacherId: 'user_nhan', day: 4, period: 5 }, { teacherId: 'user_nhan', day: 4, period: 6 },
  { teacherId: 'user_nhan', day: 5, period: 1 }, { teacherId: 'user_nhan', day: 6, period: 3 },

  // Đạt (Văn) - Bận tiết 3,4 Thứ 2; 1,2 Thứ 3; 5,6 Thứ 5; 1,2 Thứ 6
  { teacherId: 'user_dat', day: 2, period: 3 }, { teacherId: 'user_dat', day: 2, period: 4 },
  { teacherId: 'user_dat', day: 3, period: 1 }, { teacherId: 'user_dat', day: 3, period: 2 },
  { teacherId: 'user_dat', day: 5, period: 5 }, { teacherId: 'user_dat', day: 5, period: 6 },
  { teacherId: 'user_dat', day: 6, period: 1 }, { teacherId: 'user_dat', day: 6, period: 2 },

  // Nam (Tin) - Bận tiết 5,6 Thứ 2; 1,2 Thứ 4; 3,4 Thứ 5
  { teacherId: 'user_nam', day: 2, period: 5 }, { teacherId: 'user_nam', day: 2, period: 6 },
  { teacherId: 'user_nam', day: 4, period: 1 }, { teacherId: 'user_nam', day: 4, period: 2 },
  { teacherId: 'user_nam', day: 5, period: 3 }, { teacherId: 'user_nam', day: 5, period: 4 }
];

export default function HrmCenter({ currentUser, users, onUpdateUsers }: HrmCenterProps) {
  const { lang, t } = useLanguage();
  // 1. Quản lý Hồ sơ nghỉ phép
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('mis_hrm_leaves');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'LV001',
        teacherId: 'user_dat',
        teacherName: 'Thầy Trần Quốc Đạt',
        departmentId: 'VAN',
        leaveDate: '2026-06-08',
        slots: [3, 4],
        reason: 'Đi khám bệnh định kỳ tại bệnh viện Trung ương',
        status: 'APPROVED',
        substituteTeacherId: 'user_nhung',
        substituteTeacherName: 'Cô Nguyễn Hồng Nhung',
        createdAt: '2026-06-05'
      },
      {
        id: 'LV002',
        teacherId: 'user_nhan',
        teacherName: 'Cô Lê Thị Thanh Nhàn',
        departmentId: 'TOAN_TIN',
        leaveDate: '2026-06-09',
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

  // Form xin nghỉ phép
  const [newLeave, setNewLeave] = useState({
    leaveDate: new Date().toISOString().substring(0, 10),
    slots: '3,4', // tiết xin nghỉ
    reason: ''
  });
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  // Form Thêm chứng chỉ cho giáo viên
  const [showCertForm, setShowCertForm] = useState(false);
  const [selectedStaffForCert, setSelectedStaffForCert] = useState<string>(currentUser.id);
  const [newCertTitle, setNewCertTitle] = useState('');

  // Tìm kiếm nhân sự
  const [searchQuery, setSearchQuery] = useState('');

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
    setNewLeave({ leaveDate: new Date().toISOString().substring(0, 10), slots: '3,4', reason: '' });
    setShowLeaveForm(false);
  };

  const handleApproveLeave = (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l));
  };

  // Chỉ định giáo viên dạy thay
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

  // Thêm chứng chỉ vào hồ sơ giáo viên
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

  // Tìm kiếm danh sách giáo viên dạy thay khả dụng (rảnh tiết học đó)
  const getAvailableSubstitutes = (leaveRequest: LeaveRequest) => {
    // Chỉ tìm giáo viên cùng tổ bộ phận
    const deptTeachers = users.filter(u => u.workspaceId === leaveRequest.departmentId && u.id !== leaveRequest.teacherId);
    
    // Lấy ngày trong tuần (Thứ mấy) từ ngày xin nghỉ
    const dateObj = new Date(leaveRequest.leaveDate);
    let dayOfWeek = dateObj.getDay() + 1; // 0 -> Chủ nhật (1), 1 -> Thứ 2 (2)
    if (dayOfWeek === 1) dayOfWeek = 2; // Dự phòng lỗi

    return deptTeachers.map(teacher => {
      // Kiểm tra xem giáo viên có tiết bận nào trùng với các tiết xin nghỉ của yêu cầu này hay không
      const busySlots = MOCK_TKB_SLOTS.filter(s => s.teacherId === teacher.id && s.day === dayOfWeek);
      const isBusy = leaveRequest.slots.some(slot => busySlots.some(b => b.period === slot));

      return {
        teacher,
        isAvailable: !isBusy
      };
    });
  };

  const filteredStaff = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.roleName && u.roleName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

    return {
      employeeCode: user.employeeCode || `MIS-HR-${String(seed).padStart(4, '0')}`,
      email: user.email || `${normalizedId}@mis.edu.vn`,
      phone: user.phone || `09${String(10000000 + (seed * 7919) % 90000000).padStart(8, '0')}`,
      address: user.address || `Số ${(seed % 88) + 10}, ngõ ${(seed % 45) + 1}, ${addressAreas[seed % addressAreas.length]}`,
      contractType: user.contractType || (user.role === 'ADMIN' || user.role === 'MANAGER' ? 'Hợp đồng quản lý toàn thời gian' : 'Hợp đồng lao động toàn thời gian'),
      qualification: user.qualification || (user.role === 'STAFF' ? 'Cử nhân/Thạc sĩ Sư phạm' : 'Cử nhân/Thạc sĩ chuyên ngành phù hợp')
    };
  };

  return (
    <div className="w-full space-y-6 animate-fade-in" id="hrm-center-root">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-violet-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-violet-600/20 shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-violet-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            HUMAN RESOURCE MANAGEMENT
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            {lang === 'vi' ? 'Cổng nhân sự, nghỉ phép và dạy thay' : 'HRM, Leaves & Substitutions'}
          </h1>
          <p className="text-xs md:text-sm text-violet-100/80 leading-relaxed font-light">
            {lang === 'vi' ? 'Cổng quản trị thông tin nhân sự hỗ trợ nộp đơn xin nghỉ phép trực tuyến, tự động quét thời khóa biểu gợi ý giáo viên thay thế trong Tổ chuyên môn và cập nhật chứng chỉ sư phạm liên tục.' : 'HR administration portal supporting online leave applications, automatically scanning timetables to suggest departmental replacements, and updating certifications.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* 1. XIN NGHỈ PHÉP & ĐỀ XUẤT DẠY THẾ (7/12) */}
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Calendar className="text-violet-650 w-4.5 h-4.5" />
                {lang === 'vi' ? 'Cổng Nghỉ Phép & Bảng Phân Dạy Thay' : 'Leave Portal & Substitute Board'}
              </h3>
              <p className="text-[10.5px] text-slate-500">{lang === 'vi' ? 'Giáo viên nộp đơn xin nghỉ phép, hệ thống rà soát TKB rảnh tìm người dạy thế.' : 'Teachers apply for leave; the system scans timetables to find available substitutes.'}</p>
            </div>
            
            <button
              onClick={() => setShowLeaveForm(!showLeaveForm)}
              className="px-2.5 py-1 bg-violet-600 hover:bg-violet-750 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Đăng ký phép' : 'Apply for Leave'}</span>
            </button>
          </div>

          {/* Form Leave Application */}
          {showLeaveForm && (
            <form onSubmit={handleApplyLeave} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 font-sans">
              <h4 className="text-xs font-bold text-slate-855 dark:text-slate-200">{lang === 'vi' ? 'Đơn xin nghỉ phép giảng dạy' : 'Teaching Leave Application'}</h4>
              
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Ngày xin nghỉ' : 'Leave Date'}</label>
                    <input
                      type="date"
                      required
                      value={newLeave.leaveDate}
                      onChange={(e) => setNewLeave({...newLeave, leaveDate: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-350"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Xin nghỉ các Tiết (cách bằng dấu phẩy)' : 'Select Teaching Slots (comma separated)'}</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'vi' ? 'Ví dụ: 3, 4' : 'e.g., 3, 4'}
                      value={newLeave.slots}
                      onChange={(e) => setNewLeave({...newLeave, slots: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Lý do nghỉ dạy' : 'Reason for Leave'}</label>
                  <textarea
                    rows={2}
                    required
                    placeholder={lang === 'vi' ? 'Mô tả lý do cá nhân hoặc công tác học vụ ngoài trường...' : 'Describe personal reasons or off-campus academic duties...'}
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowLeaveForm(false)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    {lang === 'vi' ? 'Huỷ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-violet-650 hover:bg-violet-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {lang === 'vi' ? 'Nộp đơn duyệt' : 'Submit Leave'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List leaves requests and dynamic matching */}
          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {leaves.map(l => translateLeave(l, lang)).map(req => {
              const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
              const statusBadge = req.status === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : req.status === 'REJECTED'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse';

              const statusText = req.status === 'APPROVED' 
                ? (lang === 'vi' ? 'Đã phê duyệt' : 'Approved') 
                : req.status === 'REJECTED' 
                ? (lang === 'vi' ? 'Bị từ chối' : 'Rejected') 
                : (lang === 'vi' ? 'Chờ duyệt' : 'Pending');

              // Quét các giáo viên rảnh dạy thay
              const subCandidates = req.status === 'APPROVED' ? [] : getAvailableSubstitutes(req);

              return (
                <div key={req.id} className="p-4 border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/40 space-y-3">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div>
                      <strong className="text-slate-900 dark:text-white font-bold text-xs">👤 {req.teacherName}</strong>
                      <span className="text-[10px] text-slate-400 mt-1 block">{lang === 'vi' ? '📅 Ngày' : '📅 Date'}: <strong>{req.leaveDate}</strong> | {lang === 'vi' ? 'Tiết' : 'Slot'}: <strong>{req.slots.join(', ')}</strong></span>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight ${statusBadge}`}>
                      {statusText}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-350 bg-slate-550/5 p-2.5 rounded-lg border border-slate-100 dark:border-transparent dark:bg-slate-900/40 leading-relaxed font-medium">
                    {req.reason}
                  </p>

                  {/* Hiển thị giáo viên dạy thay đã gán */}
                  {req.substituteTeacherId ? (
                    <div className="bg-emerald-50/20 dark:bg-emerald-950/15 border border-emerald-200/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-705 dark:text-slate-300">
                      <span className="font-medium">{lang === 'vi' ? '🧑‍🏫 Giáo viên dạy thế chỉ định' : '🧑‍🏫 Assigned Substitute Teacher'}: <strong className="text-emerald-750 dark:text-emerald-400 font-bold">{req.substituteTeacherName}</strong></span>
                      <span className="text-[9.5px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-full font-bold">{lang === 'vi' ? 'Đã phân lịch' : 'Assigned'}</span>
                    </div>
                  ) : req.status === 'APPROVED' ? (
                    <div className="bg-amber-50/20 dark:bg-amber-950/15 border border-amber-200/40 p-2.5 rounded-xl text-xs text-amber-900 dark:text-amber-400 font-medium">
                      {lang === 'vi' ? '⚠️ Chưa có giáo viên đảm nhiệm dạy thế.' : '⚠️ No substitute teacher assigned yet.'}
                    </div>
                  ) : null}

                  {/* Panel Phê duyệt dành cho BGH/Tổ trưởng */}
                  {isAdmin && req.status === 'PENDING' && (
                    <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-850 pt-2.5 mt-1.5 no-print">
                      <button
                        onClick={() => handleApproveLeave(req.id, 'REJECTED')}
                        className="px-2.5 py-0.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded cursor-pointer flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> {lang === 'vi' ? 'Từ chối nghỉ' : 'Reject Leave'}
                      </button>
                      <button
                        onClick={() => handleApproveLeave(req.id, 'APPROVED')}
                        className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded cursor-pointer flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> {lang === 'vi' ? 'Phê duyệt phép' : 'Approve Leave'}
                      </button>
                    </div>
                  )}

                  {/* Panel gợi ý dạy thế nếu yêu cầu đã được duyệt nhưng chưa có ai dạy thế */}
                  {isAdmin && req.status === 'APPROVED' && !req.substituteTeacherId && (
                    <div className="bg-slate-50 dark:bg-slate-955/50 p-3 rounded-xl border border-slate-200 dark:border-slate-855 space-y-2 no-print">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        {lang === 'vi' ? 'AI gợi ý giáo viên dạy thế rảnh giờ' : 'AI Suggested Substitutes (Available)'}
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        {subCandidates.filter(c => c.isAvailable).length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic block">{lang === 'vi' ? 'Không tìm thấy giáo viên cùng tổ rảnh lịch tại tiết này.' : 'No available departmental teachers found for this slot.'}</span>
                        ) : (
                          subCandidates.filter(c => c.isAvailable).map(c => (
                            <div key={c.teacher.id} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2 rounded-lg text-[11px]">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-white block">{c.teacher.name}</span>
                                <span className="text-[9.5px] text-slate-400 font-medium block">{lang === 'vi' ? 'Số giờ bận tuần' : 'Weekly busy hours'}: {c.teacher.cpdHours || 0}h</span>
                              </div>
                              <button
                                onClick={() => handleAssignSubstitute(req.id, c.teacher.id, c.teacher.name)}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-[9px] rounded cursor-pointer shadow-3xs"
                              >
                                {lang === 'vi' ? 'Chỉ định dạy thế' : 'Assign Substitute'}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. HỒ SƠ NĂNG LỰC & BẰNG CẤP (5/12) */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Award className="text-violet-655 w-4.5 h-4.5" />
                {lang === 'vi' ? 'Bằng cấp và chứng chỉ giáo viên' : 'Teacher Certifications'}
              </h3>
              <p className="text-[10.5px] text-slate-500">{lang === 'vi' ? 'Xem và cập nhật bằng cấp khoa học sư phạm của cán bộ.' : 'View and update academic credentials and certifications of staff.'}</p>
            </div>
            
            <button
              onClick={() => setShowCertForm(!showCertForm)}
              className="px-2.5 py-1 bg-violet-600 hover:bg-violet-755 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Thêm chứng chỉ' : 'Add Certificate'}</span>
            </button>
          </div>

          {/* Form Thêm Chứng chỉ */}
          {showCertForm && (
            <form onSubmit={handleAddCertSubmit} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 font-sans">
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">{lang === 'vi' ? 'Bổ sung Bằng cấp / Chứng nhận khoa học' : 'Add Degree / Certificate'}</h4>
              
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Chọn giáo viên thụ hưởng' : 'Select Beneficiary Teacher'}</label>
                  <select
                    value={selectedStaffForCert}
                    onChange={(e) => setSelectedStaffForCert(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-350 focus:outline-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({translateTitle(u.title, lang)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Tiêu đề bằng cấp / Chứng chỉ' : 'Degree / Certification Title'}</label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'vi' ? 'Ví dụ: Thạc sĩ Quản lý Giáo dục, IELTS 8.0, Microsoft Educator...' : 'e.g. Master of Education, IELTS 8.0, Microsoft Educator...'}
                    value={newCertTitle}
                    onChange={(e) => setNewCertTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCertForm(false)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    {lang === 'vi' ? 'Huỷ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-violet-650 hover:bg-violet-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {lang === 'vi' ? 'Cập nhật hồ sơ' : 'Update Profile'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Search bar for profiles */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'vi' ? 'Tìm tên giáo viên hoặc chức danh...' : 'Search teacher name or title...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-550/5 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold text-slate-800 dark:text-slate-250"
            />
          </div>

          {/* List Staff Profiles */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {filteredStaff.map(s => translateUser(s, lang)).map(staff => {
              const details = getPersonnelDetails(staff);

              return (
                <div key={staff.id} className="p-4 border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/40 space-y-2 flex flex-col">
                  <div className="flex items-center gap-3">
                    <img 
                      src={staff.avatar} 
                      alt={staff.name} 
                      className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{staff.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{staff.roleName} - {staff.title}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <IdCard className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span className="truncate">{details.employeeCode}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span className="truncate">{details.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span>{details.phone}</span>
                    </div>
                    <div className="flex items-start gap-1.5 min-w-0">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span className="line-clamp-2">{details.address}</span>
                    </div>
                    <div className="flex items-start gap-1.5 min-w-0">
                      <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span>{details.contractType}</span>
                    </div>
                    <div className="flex items-start gap-1.5 min-w-0">
                      <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span>{details.qualification}</span>
                    </div>
                  </div>

                  {/* Danh sách bằng cấp (badges) */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {staff.badges && staff.badges.length > 0 ? (
                      staff.badges.map((b, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-900 text-violet-850 dark:text-violet-300 rounded text-[9.5px] font-bold"
                        >
                          {b}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9.5px] text-slate-400 italic block pl-1">{lang === 'vi' ? 'Chưa cập nhật bằng cấp/chứng chỉ chính thức.' : 'No degrees/certifications updated yet.'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
