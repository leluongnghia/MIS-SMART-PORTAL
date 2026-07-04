import React from 'react';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import { Calendar } from 'lucide-react';
import MeetingDashboard from './components/MeetingDashboard';

export default async function MeetingsPage() {
  const actor = await getCurrentActor();
  if (!actor) redirect('/login');

  return (
    <div className="w-full space-y-5 p-4 md:p-6 animate-fade-in">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-5 md:p-7 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-blue-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10">
              <Calendar className="w-3 h-3 text-amber-300" />
              MEETINGS & ROOMS
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Lịch họp &amp; Đặt phòng
            </h1>
            <p className="text-sm text-blue-100/80 font-light leading-relaxed">
              Quản lý lịch họp giao ban, sự kiện nội bộ, đặt phòng chức năng và xác nhận tham dự.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <MeetingDashboard />
    </div>
  );
}
