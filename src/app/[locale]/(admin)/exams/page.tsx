import React from 'react';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import { BookOpen, FileText, BarChart2, CheckSquare } from 'lucide-react';

export default async function ExamsPage() {
  const actor = await getCurrentActor();
  if (!actor) redirect('/login');

  return (
    <div className="w-full space-y-6 p-6 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-purple-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            EXAM MANAGEMENT
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            Quản lý Thi cử & Ngân hàng đề
          </h1>
          <p className="text-sm text-purple-100/80 leading-relaxed font-light">
            Phân hệ quản lý ngân hàng câu hỏi, tạo đề thi, nhập điểm và phân tích phổ điểm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Ngân hàng đề', desc: 'Quản lý câu hỏi theo môn/khối', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Tạo đề thi', desc: 'Sinh đề tự động từ ngân hàng', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Nhập điểm', desc: 'Cập nhật điểm thi lớp học', icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Báo cáo phổ điểm', desc: 'Thống kê & phân tích chất lượng', icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50' }
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
