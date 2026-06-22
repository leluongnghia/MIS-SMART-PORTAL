'use client';

import React, { useMemo } from 'react';
import { UserProfile } from '../../types';

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

interface HrmAttendanceSalaryProps {
  currentUser: UserProfile;
  attendanceRecords: AttendanceRecord[];
  salaryRecords: SalaryRecord[];
  isStaff: boolean;
  isAdmin: boolean;
  hasCapability: (capability: string, action?: string, resourceOwnerId?: string) => boolean;
  getWorkspaceName: (wId: string) => string;
  onUpdateSalaryRecords: (records: SalaryRecord[]) => void;
}

export default function HrmAttendanceSalary({
  currentUser,
  attendanceRecords = [],
  salaryRecords = [],
  isStaff,
  isAdmin,
  hasCapability,
  getWorkspaceName,
  onUpdateSalaryRecords,
}: HrmAttendanceSalaryProps) {

  // Lọc dữ liệu cá nhân của Staff
  const personalAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(a => a.userId === currentUser.id);
  }, [attendanceRecords, currentUser.id]);

  const personalSalaryRecords = useMemo(() => {
    return salaryRecords.filter(s => s.userId === currentUser.id);
  }, [salaryRecords, currentUser.id]);

  const fmtVnd = (n: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  };

  const fmtSimple = (n: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(n);
  };

  if (isStaff) {
    return (
      <div className="grid grid-cols-1 gap-6 items-start">
        
        {/* Personal Checkin log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
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
                    <span className="font-mono block text-slate-650 dark:text-slate-300">Nhận diện: {a.checkIn || '--:--'} - {a.checkOut || '--:--'}</span>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] font-black mt-0.5 ${
                      a.status === 'PRESENT' ? 'bg-emerald-55 text-emerald-800' : 'bg-orange-55 text-orange-800'
                    }`}>{a.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>



      </div>
    );
  }

  // Admin/Manager view
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Attendance List */}
      <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
          Chuyên cần &amp; Check-in Hôm nay
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto pr-1">
          {attendanceRecords.map(a => {
            const checkInTime = a.checkIn || '--:--';
            const statusColors = {
              PRESENT: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
              LATE: 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
              ABSENT: 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-455',
              LEAVE: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
            };
            return (
              <div key={a.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div>
                  <strong className="block font-bold text-slate-805 dark:text-slate-200">{a.staffName}</strong>
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
    </div>
  );
}
