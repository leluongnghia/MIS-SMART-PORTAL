import React from 'react';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import { Mail, BookOpen, UserCheck, MessageSquare, ShieldCheck, CalendarCheck, Activity, FileText } from 'lucide-react';

export default async function CommunicationConductPage() {
  const actor = await getCurrentActor();
  if (!actor) redirect('/login');

  return (
    <div className="w-full space-y-6 p-6 animate-fade-in">
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-cyan-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-teal-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            COMMUNICATION & CONDUCT
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            Sổ liên lạc & Nề nếp
          </h1>
          <p className="text-sm text-teal-100/80 leading-relaxed font-light">
            Kênh liên lạc 2 chiều giữa nhà trường và gia đình, kèm theo quản lý điểm danh, vi phạm và nề nếp học sinh.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Ghi chú hằng ngày', desc: 'Nhận xét từ GVCN đến PH', icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-50' },
          { title: 'Phản hồi Phụ huynh', desc: 'Tin nhắn từ phụ huynh (Unread)', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Xác nhận đã xem', desc: 'Trạng thái đọc tin', icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Điểm danh hằng ngày', desc: 'Ghi nhận vắng mặt, đi trễ', icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Sổ đầu bài & Nề nếp', desc: 'Vi phạm nội quy, khen thưởng', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Xếp loại hạnh kiểm', desc: 'Đánh giá cuối kỳ', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' }
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
