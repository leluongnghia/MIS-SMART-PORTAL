'use client';

import React, { useState, useMemo } from 'react';
import { 
  IdCard, Mail, Phone, MapPin, Calendar, Briefcase, BookOpen, UserCheck, ShieldAlert, Lock, Sparkles, X, Plus 
} from 'lucide-react';
import { UserProfile } from '../../types';

interface LeaveRequest {
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

interface HrmMyProfileProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  attendanceRecords: AttendanceRecord[];
  salaryRecords: SalaryRecord[];
  lang: string;
  activeTab: string;
  getPersonnelDetails: (user: UserProfile) => any;
  translateTitle: (title: string, lang: string) => string;
  getProfileKpi: (user: UserProfile) => number;
  getWorkspaceName: (wId: string) => string;
}

export default function HrmMyProfile({
  currentUser,
  users,
  onUpdateUsers,
  leaves,
  setLeaves,
  attendanceRecords,
  salaryRecords,
  lang,
  activeTab,
  getPersonnelDetails,
  translateTitle,
  getProfileKpi,
  getWorkspaceName,
}: HrmMyProfileProps) {
  // Form states
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCpdTitle, setNewCpdTitle] = useState('');
  const [newCpdHours, setNewCpdHours] = useState('4');
  const [newLeave, setNewLeave] = useState({
    leaveDate: new Date().toISOString().substring(0, 10),
    slots: '3, 4',
    reason: ''
  });

  // Lấy lịch lương cá nhân
  const personalSalaryRecords = useMemo(() => {
    return salaryRecords.filter(s => s.userId === currentUser.id || s.staffName === currentUser.name);
  }, [salaryRecords, currentUser.id, currentUser.name]);

  // Lấy chấm công cá nhân
  const personalAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(a => a.userId === currentUser.id || a.staffName === currentUser.name);
  }, [attendanceRecords, currentUser.id, currentUser.name]);

  // Lọc lịch sử nghỉ phép hiển thị
  const visibleLeaves = useMemo(() => {
    return leaves.filter(l => l.teacherId === currentUser.id);
  }, [leaves, currentUser.id]);

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
  };

  return (
    <>
      {/* TAB: HỒ SƠ CÁ NHÂN (Staff Self-Service) */}
      {activeTab === 'MY_PROFILE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* General Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs text-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="mx-auto h-24 w-24 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-md animate-fade-in"
              />
              <h4 className="mt-3 text-lg font-black text-slate-900 dark:text-white">{currentUser.name}</h4>
              <p className="mt-1 text-xs font-semibold text-slate-660 dark:text-slate-400">{translateTitle(currentUser.title, lang)}</p>
              <span className="mt-3 inline-flex rounded-full bg-indigo-600 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                {currentUser.roleName}
              </span>
            </div>

            {/* Contact Information & Masked Sensitive Data */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3.5 text-xs font-sans text-left">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs text-left">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3 text-left">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 text-left">
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
      {activeTab === 'MY_LEAVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* Form apply leave */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 text-left">
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
              <button type="submit" className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-lg transition-all shadow-3xs cursor-pointer">
                Nộp đơn lên Tổ trưởng
              </button>
            </form>
          </div>

          {/* Leaves history */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 text-left">
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
      {activeTab === 'MY_SALARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* Personal Checkin log */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 text-left">
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
                      <span className="text-[9.5px] text-slate-450 block font-mono">{a.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono block text-slate-650 dark:text-slate-300">Nhận diện: {a.checkIn || '--:--'} - {a.checkOut || '--:--'}</span>
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
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 text-left">
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
      {activeTab === 'MY_KPI' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
          
          {/* KPI metric */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between gap-4 text-left">
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
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 text-left">
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
    </>
  );
}
