import React from 'react';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import { Megaphone, FileImage, BarChart3 } from 'lucide-react';

export default async function MediaPage() {
  const actor = await getCurrentActor();
  if (!actor) redirect('/login');

  return (
    <div className="w-full space-y-6 p-6 animate-fade-in">
      <div className="bg-gradient-to-r from-pink-600 via-rose-700 to-red-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-pink-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            MEDIA & CAMPAIGNS
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            Chiến dịch Truyền thông
          </h1>
          <p className="text-sm text-pink-100/80 leading-relaxed font-light">
            Quản lý chiến dịch quảng cáo, tài nguyên media và hiệu suất nội dung.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Quản lý chiến dịch', desc: 'Campaigns & Ads', icon: Megaphone, color: 'text-pink-600', bg: 'bg-pink-50' },
          { title: 'Tài nguyên Media', desc: 'Hình ảnh, Video, Banner', icon: FileImage, color: 'text-rose-600', bg: 'bg-rose-50' },
          { title: 'Hiệu suất (Metrics)', desc: 'Lượt tiếp cận & tương tác', icon: BarChart3, color: 'text-red-600', bg: 'bg-red-50' }
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
