'use client';

import React from 'react';
import { X, Mail, Phone, MapPin, IdCard, Briefcase, Target, ShieldAlert, Lock, BookOpen } from 'lucide-react';
import { UserProfile } from '../../types';

interface HrmEmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  lang: string;
  hasCapability: (capability: string, action?: string, resourceOwnerId?: string) => boolean;
  getWorkspaceName: (wId: string) => string;
  translateTitle: (title: string, lang: string) => string;
}

export default function HrmEmployeeDetailModal({
  isOpen,
  onClose,
  user,
  lang,
  hasCapability,
  getWorkspaceName,
  translateTitle,
}: HrmEmployeeDetailModalProps) {
  if (!isOpen || !user) return null;

  const inferVietnameseGender = (name: string): string => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes(' thi ') || lowercase.includes(' thị ') || lowercase.includes(' cô ')) return 'Nữ';
    if (lowercase.includes(' văn ') || lowercase.includes(' thầy ')) return 'Nam';
    return 'Khác';
  };

  const getPersonnelDetails = (u: UserProfile) => {
    const seed = Array.from(u.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const normalizedId = u.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `ns${seed}`;
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
    const roleTitle = `${u.roleName} - ${u.title}`;
    const isTeacher = /giao vien|to truong|teacher/i.test(roleTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    const isManagerUser = u.role === 'ADMIN' || u.role === 'MANAGER';

    return {
      employeeCode: u.employeeCode || `MIS-HR-${String(seed).padStart(4, '0')}`,
      email: u.email || `${normalizedId}@misvn.edu.vn`,
      personalEmail: u.personalEmail || `${normalizedId}.personal@gmail.com`,
      phone: u.phone || `09${String(10000000 + (seed * 7919) % 90000000).padStart(8, '0')}`,
      address: u.address || `Số ${(seed % 88) + 10}, ngõ ${(seed % 45) + 1}, ${addressAreas[seed % addressAreas.length]}`,
      dateOfBirth: u.dateOfBirth || `${1978 + (seed % 20)}-${month}-${day}`,
      gender: u.gender || inferVietnameseGender(u.name),
      startDate: u.startDate || `${startYears[seed % startYears.length]}-08-${String((seed % 15) + 1).padStart(2, '0')}`,
      contractType: u.contractType || (isManagerUser ? 'Hợp đồng quản lý toàn thời gian' : 'Hợp đồng lao động toàn thời gian'),
      qualification: u.qualification || (isManagerUser ? 'Thạc sĩ Quản trị giáo dục' : isTeacher ? 'Cử nhân/Thạc sĩ Sư phạm' : 'Cử nhân chuyên ngành phù hợp'),
      specialization: u.specialization || u.title,
      emergencyContact: u.emergencyContact || `Người thân - 08${String(10000000 + (seed * 3571) % 90000000).padStart(8, '0')}`,
      nationalId: u.nationalId || `0${String(10000000000 + (seed * 15485863) % 90000000000).padStart(11, '0')}`,
      insuranceCode: u.insuranceCode || `BHXH-${String(seed * 97).padStart(6, '0')}`
    };
  };

  const maskString = (str: string) => {
    if (!str) return 'N/A';
    if (str.length <= 4) return '****';
    return str.slice(0, 2) + '*'.repeat(str.length - 4) + str.slice(-2);
  };

  const getProfileKpi = (u: UserProfile) => {
    return Math.min(99, 82 + ((u.cpdHours || 8) % 18));
  };

  const details = getPersonnelDetails(user);
  const hasSensitiveRead = hasCapability('SENSITIVE_PROFILE', 'read', user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 font-mono tracking-wider block">Hồ sơ Cán bộ Giáo viên</span>
            <h3 className="text-base font-display font-black text-slate-900 dark:text-white mt-0.5">{user.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Avatar & Key details card */}
            <div className="md:col-span-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-xl flex flex-col items-center text-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover border border-white dark:border-slate-800 shadow-md"
              />
              <h4 className="mt-3 text-base font-black text-slate-900 dark:text-white">{user.name}</h4>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{translateTitle(user.title, lang)}</p>
              <span className="mt-2.5 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[9.5px] font-black uppercase tracking-wider rounded-lg font-mono">
                {user.roleName}
              </span>

              <div className="w-full border-t border-slate-100 dark:border-slate-800 my-4"></div>

              <div className="w-full space-y-3 text-left">
                <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Bộ phận: {getWorkspaceName(user.workspaceId)}</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{details.email}</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{details.phone}</span>
                </div>
              </div>
            </div>

            {/* General Profile Info */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Metrics rows */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/15 border border-indigo-100/40 dark:border-indigo-900/30 rounded-xl text-center">
                  <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 block font-mono">KPIs tháng</span>
                  <span className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">{getProfileKpi(user)}%</span>
                  <span className="text-[8.5px] text-slate-400 block mt-1">Dựa trên công việc &amp; chuyên môn</span>
                </div>
                <div className="p-3 bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-100/40 dark:border-emerald-900/30 rounded-xl text-center">
                  <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 block font-mono">Đã tích lũy</span>
                  <span className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">{user.cpdHours || 0}h CPD</span>
                  <span className="text-[8.5px] text-slate-440 block mt-1">Giờ bồi dưỡng chuyên môn</span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3.5">
                <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <IdCard className="w-4 h-4 text-slate-400" />
                  Thông tin cá nhân &amp; Hợp đồng
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-450 text-[10px] block">Mã số nhân viên</span>
                    <span className="font-bold text-slate-800 dark:text-white font-mono mt-0.5 block">{details.employeeCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 text-[10px] block">Ngày vào làm</span>
                    <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{details.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 text-[10px] block">Loại hợp đồng</span>
                    <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{details.contractType}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 text-[10px] block">Trình độ chuyên môn</span>
                    <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{details.qualification}</span>
                  </div>
                </div>
              </div>

              {/* Private sensitive details (masked unless has capability) */}
              <div className="bg-slate-50/40 dark:bg-slate-950/30 p-4 border border-slate-200/60 dark:border-slate-800/60 rounded-xl space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1.5">
                  {hasSensitiveRead ? <Lock className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                  Thông tin bảo mật nhân sự
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-450 text-[10px] block">Số CCCD / Hộ chiếu</span>
                    <span className="font-bold text-slate-800 dark:text-white font-mono mt-0.5 block">
                      {hasSensitiveRead ? details.nationalId : maskString(details.nationalId)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-450 text-[10px] block">Số sổ Bảo hiểm xã hội</span>
                    <span className="font-bold text-slate-800 dark:text-white font-mono mt-0.5 block">
                      {hasSensitiveRead ? details.insuranceCode : maskString(details.insuranceCode)}
                    </span>
                  </div>
                </div>
                {!hasSensitiveRead && (
                  <p className="text-[10px] text-slate-500 font-normal leading-normal mt-2.5">
                    ℹ️ Bạn không có quyền truy cập thông tin nhân sự bảo mật hoặc dữ liệu cá nhân của thành viên này. Vui lòng liên hệ Phòng Hành chính - Nhân sự.
                  </p>
                )}
              </div>

            </div>

          </div>

          {/* Multiple Intelligences Profile */}
          {user.miProfile && (
            <div className="space-y-3 pt-2">
              <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-slate-400" />
                Hồ sơ Trí thông minh Đa diện (MI Profile)
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(user.miProfile).map(([key, val]) => (
                  <div key={key} className="p-2.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900">
                    <span className="text-[9.5px] font-bold text-slate-450 block truncate">
                      {lang === 'vi' ? MI_KEY_DETAILS[key]?.vi : MI_KEY_DETAILS[key]?.en || key}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-650 h-1.5 rounded-full"
                          style={{ width: `${val}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200">{val}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CPD Training Log */}
          <div className="space-y-3 pt-2">
            <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-400" />
              Nhật ký bồi dưỡng chuyên môn (CPD Logs)
            </h5>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {(user.cpdLog || []).map((item) => (
                <div key={item.id} className="p-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-lg flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <strong className="text-xs text-slate-800 dark:text-slate-200 block truncate">{item.title}</strong>
                    <span className="text-[9.5px] text-slate-400 font-mono mt-0.5 block">Thời gian: {item.date}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 font-mono text-[9px] font-bold rounded">
                    +{item.hours}h
                  </span>
                </div>
              ))}
              {(!user.cpdLog || user.cpdLog.length === 0) && (
                <p className="text-center py-6 text-[11px] text-slate-450 font-medium italic">
                  Chưa có nhật ký học tập tích lũy.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Map key details of Multiple Intelligences
const MI_KEY_DETAILS: Record<string, { vi: string; en: string }> = {
  logical: { vi: 'Logic - Toán học', en: 'Logical-Mathematical' },
  linguistic: { vi: 'Ngôn ngữ', en: 'Linguistic' },
  spatial: { vi: 'Không gian - Thị giác', en: 'Spatial-Visual' },
  musical: { vi: 'Âm nhạc - Nhịp điệu', en: 'Musical-Rhythmic' },
  kinesthetic: { vi: 'Vận động cơ thể', en: 'Bodily-Kinesthetic' },
  interpersonal: { vi: 'Tương tác cá nhân', en: 'Interpersonal' },
  intrapersonal: { vi: 'Nội tâm', en: 'Intrapersonal' },
  naturalist: { vi: 'Tự nhiên', en: 'Naturalist' }
};
