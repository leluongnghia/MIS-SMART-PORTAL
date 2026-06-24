import React from 'react';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import { Users, FileText, Calendar, Shield } from 'lucide-react';

export default async function SubjectGroupsPage() {
  const actor = await getCurrentActor();
  if (!actor) redirect('/login');

  return (
    <div className="w-full space-y-6 p-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-teal-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            SUBJECT GROUPS
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            Quản lý Tổ chuyên môn
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed font-light">
            Cấu trúc tổ chuyên môn, danh sách thành viên và quản lý biên bản sinh hoạt tổ.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Danh sách tổ', desc: 'Sơ đồ tổ chức & chức năng', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Thành viên', desc: 'Phân công giáo viên theo tổ', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Lịch sinh hoạt', desc: 'Kế hoạch họp tổ chuyên môn', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Biên bản họp', desc: 'Lưu trữ hồ sơ & biên bản', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} mb-4`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <h3 className="font-bold text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
