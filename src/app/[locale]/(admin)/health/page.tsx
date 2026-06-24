import { HeartPulse, Shield, AlertTriangle, CheckCircle2, Phone } from 'lucide-react';

export const metadata = { title: 'Y tế học đường – MIS Portal' };

// ponytail: phase 5 — kết nối DB health_profiles, health_incidents, health_medications, health_sick_leaves
// SECURITY: bảng này có cờ confidential=true → chỉ nurse/operations/BGH mới xem chi tiết
export default function HealthPage() {
  const mockIncidents = [
    { id: '1', student: 'Nguyễn Minh Anh', severity: 'minor', symptom: 'Sốt nhẹ 37.8°C', handledAt: '08:30', status: 'resolved' },
    { id: '2', student: 'Trần Gia Bảo', severity: 'moderate', symptom: 'Đau bụng, nôn ói', handledAt: '10:15', status: 'in_progress' },
    { id: '3', student: 'Lê Thị Cẩm', severity: 'info', symptom: 'Đau đầu nhẹ, xin nghỉ ngơi', handledAt: '11:00', status: 'resolved' },
  ];

  const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
    info: { label: 'Thông tin', color: 'text-blue-700', bg: 'bg-blue-50' },
    minor: { label: 'Nhẹ', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    moderate: { label: 'Trung bình', color: 'text-amber-700', bg: 'bg-amber-50' },
    serious: { label: 'Nghiêm trọng', color: 'text-rose-700', bg: 'bg-rose-50' },
    emergency: { label: 'Khẩn cấp', color: 'text-red-900', bg: 'bg-red-100' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-rose-100 rounded-xl">
          <HeartPulse className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Y tế học đường</h1>
          <p className="text-sm text-slate-500">Sự cố y tế, thuốc, hồ sơ sức khỏe học sinh</p>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5">
        <Shield className="w-5 h-5 text-rose-500 shrink-0" />
        <p className="text-sm text-rose-700">
          Dữ liệu y tế được bảo mật — chỉ Y tá, Ban Giám hiệu và Phụ huynh liên quan mới được xem chi tiết hồ sơ.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sự cố hôm nay', value: '3', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Thuốc đang dùng', value: '8', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Cần parentConsent', value: '2', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Liên hệ khẩn', value: '0', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-white shadow-sm p-4 flex items-center gap-3`}>
            <s.icon className={`w-7 h-7 ${s.color}`} />
            <div>
              <div className="text-xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Incidents today */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Sự cố y tế hôm nay</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {mockIncidents.map(inc => {
            const sev = severityConfig[inc.severity] ?? severityConfig.info;
            return (
              <div key={inc.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${sev.bg} ${sev.color}`}>
                  {sev.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm">{inc.student}</div>
                  <div className="text-xs text-slate-500">{inc.symptom}</div>
                </div>
                <div className="text-xs text-slate-400 shrink-0">{inc.handledAt}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${inc.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {inc.status === 'resolved' ? 'Đã xử lý' : 'Đang xử lý'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 bg-rose-50/40 border-t border-rose-100 text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Dữ liệu mẫu. Kết nối DB (health_incidents, health_profiles) trong Giai đoạn 5.
        </div>
      </div>
    </div>
  );
}
