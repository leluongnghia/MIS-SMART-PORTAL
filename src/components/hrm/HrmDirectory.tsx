'use client';

import React, { useState, useMemo } from 'react';
import { Search, Mail, Phone, ArrowRightLeft, Award } from 'lucide-react';
import { UserProfile, Role } from '../../types';

interface HrmDirectoryProps {
  currentUser: UserProfile;
  users: UserProfile[];
  lang: string;
  isAdmin: boolean;
  isManager: boolean;
  getWorkspaceName: (wId: string) => string;
  translateTitle: (title: string, lang: string) => string;
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
  setSelectedProfileUser: (user: UserProfile) => void;
}

export default function HrmDirectory({
  currentUser,
  users,
  lang,
  isAdmin,
  isManager,
  getWorkspaceName,
  translateTitle,
  onUpdateUsers,
  setSelectedProfileUser,
}: HrmDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // States cho thêm chứng chỉ
  const [showCertForm, setShowCertForm] = useState(false);
  const [selectedStaffForCert, setSelectedStaffForCert] = useState(users[0]?.id || '');
  const [newCertTitle, setNewCertTitle] = useState('');

  // States cho điều chuyển
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [targetWorkspaceId, setTargetWorkspaceId] = useState('ALL');
  const [transferSuccess, setTransferSuccess] = useState('');

  const getPersonnelDetails = (u: UserProfile) => {
    const seed = Array.from(u.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const normalizedId = u.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `ns${seed}`;
    return {
      email: u.email || `${normalizedId}@misvn.edu.vn`,
      phone: u.phone || `09${String(10000000 + (seed * 7919) % 90000000).padStart(8, '0')}`,
    };
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

  return (
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
            <h4 className="text-xs font-bold text-slate-850 dark:text-slate-250">Ghi nhận chứng chỉ/bằng cấp mới</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[9.5px] text-slate-400 block mb-1">Chọn nhân sự nhận</label>
                <select
                  value={selectedStaffForCert}
                  onChange={(e) => setSelectedStaffForCert(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
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
                type="button"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover border border-white dark:border-slate-800 shadow-4xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                  <span className="text-[10px] text-slate-450 block font-mono">{translateTitle(user.title, lang)}</span>
                  <span className="text-[9.5px] text-indigo-650 dark:text-indigo-400 font-bold block mt-1">
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
                        <span key={idx} className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-1.5 py-0.5 rounded font-black tracking-wide">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 hover:underline block mt-2 font-black">
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
            <div className="p-2.5 bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10.5px] rounded-lg font-bold">
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
                {['BGH', 'TOAN_TIN', 'VAN', 'NGOAI_NGU', 'KHTN', 'LS_DL', 'GDCD_KTPL', 'NT_TC_QPAN', 'CN_TRAI_NGHIEM', 'HANH_CHINH', 'TUYEN_SINH_PR', 'KHAO_THI', 'CTHS_TAM_LY', 'DICH_VU_HOC_DUONG'].map(k => (
                  <option key={k} value={k}>{getWorkspaceName(k)}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-black rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer"
            >
              <span>Thực hiện Điều chuyển</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
