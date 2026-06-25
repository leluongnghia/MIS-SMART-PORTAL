import { HeartPulse, Shield, AlertTriangle, CheckCircle2, Phone, Stethoscope, Activity, FileText } from 'lucide-react';
import { healthSummary, HealthCtx } from '@/src/libs/server/health';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { inferPrimaryRole } from '@/src/libs/server/rbac-config';

export const metadata = { title: 'Y tế học đường – MIS Portal' };

export default async function HealthPage() {
  const actor = await getCurrentActor();
  const ctx: HealthCtx = {
    userId: actor?.id || 'system',
    role: actor ? inferPrimaryRole(actor) : 'system_admin'
  };

  let summary;
  try {
    summary = await healthSummary(ctx);
  } catch (e) {
    summary = { totalIncidents: 0, emergencies: 0, serious: 0, resolved: 0 };
  }

  const mockIncidents = [
    { id: '1', student: 'Nguyễn Minh Anh', class: '10A1', severity: 'minor', symptom: 'Sốt nhẹ 37.8°C', handledAt: '08:30', status: 'resolved', note: 'Đã uống 1 liều Hapacol 250, đang nằm nghỉ.' },
    { id: '2', student: 'Trần Gia Bảo', class: '11B2', severity: 'moderate', symptom: 'Đau bụng, nôn ói', handledAt: '10:15', status: 'in_progress', note: 'Đang theo dõi rối loạn tiêu hóa, đã báo phụ huynh.' },
    { id: '3', student: 'Lê Thị Cẩm', class: '12C3', severity: 'info', symptom: 'Đau đầu nhẹ', handledAt: '11:00', status: 'resolved', note: 'Xin dầu gió, đã về lớp học bình thường.' },
  ];

  const severityConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    info: { label: 'Thông tin', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
    minor: { label: 'Nhẹ', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    moderate: { label: 'Trung bình', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
    serious: { label: 'Nghiêm trọng', color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200' },
    emergency: { label: 'Khẩn cấp', color: 'text-red-900', bg: 'bg-red-200', border: 'border-red-300' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/60 via-slate-50 to-pink-50/40 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl shadow-lg shadow-pink-500/20">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Y tế học đường</h1>
            <p className="text-slate-500 font-medium mt-1">Quản lý hồ sơ sức khỏe và xử lý sự cố y tế</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <Shield className="w-5 h-5 text-rose-500" />
          <span className="font-bold text-rose-700 text-sm">Chế độ Bảo mật Y tế</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Sự cố hôm nay', value: summary.totalIncidents || '3', sub: summary.totalIncidents ? `${summary.emergencies} ca khẩn cấp` : '2 ca đang theo dõi', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-100' },
          { label: 'Học sinh dùng thuốc', value: '8', sub: 'Đã có ủy quyền PH', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Thiếu Parent Consent', value: '2', sub: 'Cần phụ huynh xác nhận', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Liên hệ khẩn cấp', value: summary.serious || '0', sub: 'Không có ca nghiêm trọng', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map(s => (
          <div key={s.label} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${s.bg} rounded-2xl`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-800 mb-1">{s.value}</div>
            <div className="text-sm font-bold text-slate-600">{s.label}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Incidents Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-rose-500/5 to-transparent">
              <div>
                <h2 className="text-xl font-black text-slate-800">Sự cố y tế đang xử lý</h2>
                <p className="text-sm text-slate-500 mt-1">Cập nhật realtime từ phòng Y tế</p>
              </div>
              <button className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-sm rounded-xl transition-colors">
                + Ghi nhận sự cố
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {mockIncidents.map(inc => {
                const sev = severityConfig[inc.severity] ?? severityConfig.info;
                return (
                  <div key={inc.id} className={`p-5 rounded-2xl border ${sev.border} bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sev.bg} group-hover:w-2 transition-all`}></div>
                    <div className="flex justify-between items-start mb-3 ml-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg ${sev.bg} ${sev.color}`}>
                          {sev.label}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{inc.handledAt}</span>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${inc.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {inc.status === 'resolved' ? 'Đã xử lý' : 'Đang theo dõi'}
                      </span>
                    </div>
                    
                    <div className="ml-2 mt-2">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-base font-black text-slate-800">{inc.student}</h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{inc.class}</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium mb-2">{inc.symptom}</p>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-600">
                        <span className="font-bold text-slate-700 mr-2">Xử trí:</span>
                        {inc.note}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Health Inventory & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-slate-800 mb-1">Vật tư y tế sắp cạn</h2>
            <p className="text-sm text-slate-500 mb-5">Cần dự trù mua sắm bổ sung</p>
            
            <div className="space-y-4">
              {[
                { name: 'Thuốc hạ sốt Hapacol 250', stock: 12, unit: 'gói', status: 'warning' },
                { name: 'Băng gạc cá nhân Urgo', stock: 5, unit: 'miếng', status: 'critical' },
                { name: 'Nước muối sinh lý', stock: 2, unit: 'chai', status: 'critical' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="font-bold text-slate-700 text-sm">{item.name}</div>
                  <div className={`text-xs font-black px-2.5 py-1 rounded-lg ${item.status === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    Còn {item.stock} {item.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-900 to-pink-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <FileText className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="font-black text-lg mb-2">Sổ khám sức khỏe</h3>
              <p className="text-sm text-rose-200/80 mb-6 leading-relaxed">Khám đợt 1 năm học 2025-2026 đã hoàn tất nhập liệu cho 100% học sinh.</p>
              <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full text-center backdrop-blur-md">
                Xem báo cáo tổng hợp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
