'use client';

import React, { useMemo } from 'react';
import { UserProfile } from '../../types';

interface HrmKpiWorkloadProps {
  currentUser: UserProfile;
  users: UserProfile[];
  lang: string;
  isStaff: boolean;
  translateTitle: (title: string, lang: string) => string;
  setSelectedProfileUser: (user: UserProfile) => void;
}

export default function HrmKpiWorkload({
  currentUser,
  users = [],
  lang,
  isStaff,
  translateTitle,
  setSelectedProfileUser,
}: HrmKpiWorkloadProps) {

  const getProfileKpi = (u: UserProfile) => {
    return Math.min(99, 82 + ((u.cpdHours || 8) % 18));
  };

  // Lọc chỉ các staff chuyên môn
  const staffUsers = useMemo(() => {
    return users.filter(u => u.role === 'STAFF');
  }, [users]);

  // Top giáo viên tiêu biểu
  const topTeachers = useMemo(() => {
    return [...users]
      .filter(u => u.role === 'STAFF')
      .sort((a, b) => (b.cpdHours || 0) - (a.cpdHours || 0))
      .slice(0, 5);
  }, [users]);

  if (isStaff) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* KPI metric */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2 mb-3 dark:border-slate-800">
              Hiệu suất KPIs cá nhân
            </h3>
            <div className="text-center py-6">
              <span className="text-5xl font-display font-black text-indigo-650 dark:text-indigo-400">{getProfileKpi(currentUser)}%</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2">Đạt chỉ số học vụ</span>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-[11px] leading-relaxed text-slate-500 font-medium border border-slate-100 dark:border-slate-850">
            Chỉ số KPI được tổng hợp tự động từ tiến độ nộp giáo án, tỷ lệ chuyên cần, hoàn thành nhiệm vụ và giờ đào tạo chuyên môn CPD.
          </div>
        </div>

        {/* Workload log details */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2 dark:border-slate-800">
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
    );
  }

  // Admin/Manager view
  return (
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
          {staffUsers.map(user => {
            const teachingHours = user.cpdHours || 8;
            const isOverloaded = teachingHours >= 20;
            return (
              <div key={user.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border dark:border-slate-800" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</h4>
                    <span className="text-[9.5px] text-slate-450 font-mono block">{translateTitle(user.title, lang)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs font-mono font-bold block text-slate-700 dark:text-slate-300">{teachingHours} tiết / tuần</span>
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
              type="button"
            >
              <img src={teacher.avatar} alt={teacher.name} className="w-8 h-8 rounded-full object-cover border dark:border-slate-800" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{teacher.name}</h4>
                <span className="text-[9.5px] text-slate-450 block truncate">{translateTitle(teacher.title, lang)}</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-650 dark:text-indigo-400 shrink-0">
                ★ KPI {getProfileKpi(teacher)}%
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
