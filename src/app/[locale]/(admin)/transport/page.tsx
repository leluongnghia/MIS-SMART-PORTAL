import { Bus, MapPin, Users, AlertTriangle, CheckCircle2, Clock, Route, User, Phone, Map } from 'lucide-react';

export const metadata = { title: 'Xe đưa đón học sinh – MIS Portal' };

export default function TransportPage() {
  const mockRoutes = [
    { id: '1', code: 'TUYEN-Q7-01', name: 'Tuyến Q7 - PMH', students: 32, driver: 'Nguyễn Văn A', phone: '0901234567', plate: '51B-123.45', status: 'active', progress: 65 },
    { id: '2', code: 'TUYEN-Q2-01', name: 'Tuyến TĐ - An Phú', students: 28, driver: 'Trần Văn B', phone: '0902345678', plate: '51B-234.56', status: 'active', progress: 30 },
    { id: '3', code: 'TUYEN-BH-01', name: 'Tuyến Bình Hưng Hòa', students: 25, driver: 'Lê Văn C', phone: '0903456789', plate: '51B-345.67', status: 'maintenance', progress: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/40 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Xe đưa đón học sinh</h1>
            <p className="text-slate-500 font-medium mt-1">Hệ thống điều phối và giám sát lộ trình thời gian thực</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-bold text-slate-700 text-sm">Real-time GPS Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Tổng số tuyến', value: '18', sub: 'Bao phủ 12 quận/huyện', icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Học sinh đăng ký', value: '450', sub: 'Đã đóng phí T6', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Đang chạy', value: '16', sub: 'Tất cả đúng giờ', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Bảo trì định kỳ', value: '2', sub: 'Xe dự phòng đã thay', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
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
        {/* Active Routes Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-indigo-500/5 to-transparent">
              <div>
                <h2 className="text-xl font-black text-slate-800">Giám sát lộ trình</h2>
                <p className="text-sm text-slate-500 mt-1">Tiến độ xe đang di chuyển sáng nay</p>
              </div>
              <button className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors">
                <Map className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {mockRoutes.map(r => (
                <div key={r.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all group">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black bg-slate-800 text-white px-2.5 py-1 rounded-lg">
                        {r.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-800">{r.name}</h3>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      r.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {r.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {r.status === 'active' ? 'Đang chạy' : 'Bảo trì'}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{r.driver}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{r.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="px-2 py-0.5 bg-yellow-400 text-yellow-900 font-bold border border-yellow-500 rounded text-xs tracking-wider">
                        {r.plate}
                      </div>
                    </div>
                  </div>

                  {r.status === 'active' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Bến xe trường</span>
                        <span className="text-indigo-600">Đã đi được {r.progress}%</span>
                        <span>Trạm cuối</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full relative transition-all duration-1000" 
                          style={{ width: `${r.progress}%` }}
                        >
                          <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 w-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications & Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-slate-800 mb-1">Cảnh báo Vận hành</h2>
            <p className="text-sm text-slate-500 mb-5">Thông báo từ ứng dụng tài xế & bảo mẫu</p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 hover:bg-amber-100/50 transition-colors">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Kẹt xe cầu Sài Gòn</h4>
                  <p className="text-xs text-amber-700 mt-1">Tuyến Q2-01 báo cáo kẹt xe, dự kiến đến trễ 15 phút.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex gap-3 hover:bg-rose-100/50 transition-colors">
                <User className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">HS vắng không phép</h4>
                  <p className="text-xs text-rose-700 mt-1">Em Lê Hữu Phước (10A2) không ra điểm đón tuyến Q7-01, gia đình không nghe máy.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <Route className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <h3 className="font-black text-lg mb-2">Điều phối khẩn cấp</h3>
              <p className="text-sm text-indigo-100 mb-6 leading-relaxed">Gửi thông báo broadcast đến toàn bộ tài xế và bảo mẫu đang chạy trên đường.</p>
              <button className="bg-white text-indigo-700 px-5 py-3 rounded-xl text-sm font-bold transition-all w-full text-center hover:bg-slate-50 shadow-md">
                Gửi thông báo Push
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
