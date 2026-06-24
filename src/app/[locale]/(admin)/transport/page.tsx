import { Bus, MapPin, Users, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const metadata = { title: 'Xe đưa đón học sinh – MIS Portal' };

// ponytail: phase 5 — kết nối DB transport_routes, transport_vehicles, transport_attendance
// Hiện tại: scaffold UI với mock data để confirm layout
export default function TransportPage() {
  const mockRoutes = [
    { id: '1', code: 'TUYEN-Q7-01', name: 'Tuyến Quận 7 - Phú Mỹ Hưng', students: 32, driver: 'Nguyễn Văn A', status: 'active' },
    { id: '2', code: 'TUYEN-Q2-01', name: 'Tuyến Thủ Đức - An Phú', students: 28, driver: 'Trần Văn B', status: 'active' },
    { id: '3', code: 'TUYEN-BH-01', name: 'Tuyến Bình Hưng Hòa', students: 25, driver: 'Lê Văn C', status: 'maintenance' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Bus className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Xe đưa đón học sinh</h1>
            <p className="text-sm text-slate-500">Quản lý tuyến xe, phân công tài xế, điểm danh lên xuống xe</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng tuyến', value: '3', icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Học sinh đăng ký', value: '85', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Đang vận hành', value: '2', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Bảo trì', value: '1', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Routes Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Danh sách tuyến xe</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Mã tuyến</th>
              <th className="px-5 py-3 text-left">Tên tuyến</th>
              <th className="px-5 py-3 text-center">Học sinh</th>
              <th className="px-5 py-3 text-left">Tài xế</th>
              <th className="px-5 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockRoutes.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.code}</td>
                <td className="px-5 py-3 font-medium text-slate-800">{r.name}</td>
                <td className="px-5 py-3 text-center">{r.students}</td>
                <td className="px-5 py-3 text-slate-600">{r.driver}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {r.status === 'active' ? 'Đang chạy' : 'Bảo trì'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-amber-50/40 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Đây là dữ liệu mẫu. Kết nối DB thật sẽ được triển khai trong Giai đoạn 5.
        </div>
      </div>
    </div>
  );
}
