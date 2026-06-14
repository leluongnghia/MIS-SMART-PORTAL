'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
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

interface HrmLeaveRequestsProps {
  currentUser: UserProfile;
  users: UserProfile[];
  lang: string;
  isStaff: boolean;
  isManager: boolean;
  isAdmin: boolean;
  leaves: LeaveRequest[];
  onUpdateLeaves: (updated: LeaveRequest[]) => void;
  getWorkspaceName: (wId: string) => string;
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

export default function HrmLeaveRequests({
  currentUser,
  users = [],
  lang,
  isStaff,
  isManager,
  isAdmin,
  leaves = [],
  onUpdateLeaves,
  getWorkspaceName,
}: HrmLeaveRequestsProps) {
  
  // State: Nộp đơn xin nghỉ phép
  const [newLeave, setNewLeave] = useState({
    leaveDate: '',
    slots: '',
    reason: ''
  });

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

  // Submit đơn nghỉ phép
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.reason) return;

    const slotNumbers = newLeave.slots
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    const apply: LeaveRequest = {
      id: `LV${String(Date.now()).slice(-4)}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      departmentId: currentUser.workspaceId,
      leaveDate: newLeave.leaveDate,
      slots: slotNumbers.length > 0 ? slotNumbers : [1, 2],
      reason: newLeave.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString().substring(0, 10)
    };

    onUpdateLeaves([apply, ...leaves]);
    setNewLeave({ leaveDate: '', slots: '', reason: '' });
  };

  // Duyệt nghỉ phép
  const handleApproveLeave = (leaveId: string, action: 'APPROVE' | 'REJECT') => {
    onUpdateLeaves(leaves.map(l => {
      if (l.id !== leaveId) return l;
      if (action === 'REJECT') return { ...l, status: 'REJECTED' as const };

      // Quyết định trạng thái tiếp theo dựa trên vai trò duyệt
      if (isManager && l.status === 'PENDING') {
        return { ...l, status: 'APPROVED_DEPT' as const }; // Tổ trưởng duyệt bước 1
      }
      if (isAdmin) {
        return { ...l, status: 'APPROVED' as const }; // Hành chính / BGH phê duyệt cuối cùng
      }
      return l;
    }));
  };

  // Gán giáo viên dạy thay
  const handleAssignSubstitute = (leaveId: string, subId: string, subName: string) => {
    onUpdateLeaves(leaves.map(l => {
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

  if (isStaff) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form apply leave */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2 dark:border-slate-800">
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

                const badgeColor = req.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30'
                  : req.status === 'APPROVED_DEPT' ? 'bg-indigo-50 text-indigo-800 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
                  : req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                  : 'bg-rose-50 text-rose-805 border-rose-100 dark:bg-rose-955/20 dark:text-rose-455 dark:border-rose-900/30';

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
                    <p className="text-xs text-slate-705 dark:text-slate-350 bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-850 font-medium">
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
    );
  }

  // Admin/Manager view
  return (
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
              PENDING: 'bg-amber-50 border-amber-250 text-amber-800 animate-pulse dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30',
              APPROVED_DEPT: 'bg-indigo-50 border-indigo-250 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
              APPROVED: 'bg-emerald-50 border-emerald-250 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
              REJECTED: 'bg-rose-50 border-rose-250 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455 dark:border-rose-900/30'
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
              <div key={req.id} className="p-4 border border-slate-205 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-900/40 space-y-3">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <strong className="text-slate-900 dark:text-white text-xs font-black">👤 {req.teacherName}</strong>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      📅 Ngày: <strong>{req.leaveDate}</strong> | Tiết: <strong>{req.slots.join(', ')}</strong> | Bộ phận: <strong>{getWorkspaceName(req.departmentId)}</strong>
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase font-mono ${statusColors[req.status] || ''}`}>
                    {getStatusText(req.status)}
                  </span>
                </div>

                <p className="text-[11.5px] text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-medium">
                  "{req.reason}"
                </p>

                {/* Display substitute teacher */}
                {req.substituteTeacherId ? (
                  <div className="bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-200/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">🧑‍🏫 Dạy thay: <strong className="text-emerald-700 dark:text-emerald-400">{req.substituteTeacherName}</strong></span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-105 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded font-black uppercase">Đã phân lịch</span>
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
                        type="button"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApproveLeave(req.id, 'APPROVE')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-[10px] rounded cursor-pointer"
                        type="button"
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
                        type="button"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApproveLeave(req.id, 'APPROVE')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded cursor-pointer"
                        type="button"
                      >
                        Duyệt quyết định
                      </button>
                    </>
                  )}
                </div>

                {/* AI suggestion panel */}
                {!req.substituteTeacherId && (req.status === 'APPROVED' || req.status === 'APPROVED_DEPT') && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-750 dark:text-indigo-400">
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
                              className="px-2 py-0.5 bg-indigo-600 text-white text-[9.5px] font-bold rounded cursor-pointer"
                              type="button"
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
  );
}
