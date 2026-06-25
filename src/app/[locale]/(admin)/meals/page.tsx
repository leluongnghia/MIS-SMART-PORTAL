import { Utensils, Users, CheckCircle2, AlertTriangle, Calendar, Flame, WheatOff, MilkOff, Salad } from 'lucide-react';
import { getWeekMenu, listSpecialDiets } from '@/src/libs/server/meals';

export const metadata = { title: 'Bán trú & Bếp ăn – MIS Portal' };

export default async function MealsPage() {
  const dbMenu = await getWeekMenu('2023-10-02'); // Example date or dynamic
  let weekMenu = dbMenu.filter(m => m.mealType === 'lunch').map(m => ({
    day: m.dayOfWeek === 2 ? 'Thứ 2' : m.dayOfWeek === 3 ? 'Thứ 3' : m.dayOfWeek === 4 ? 'Thứ 4' : m.dayOfWeek === 5 ? 'Thứ 5' : 'Thứ 6',
    date: m.weekStart,
    lunch: (m.items as any)?.main || 'Chưa cập nhật',
    snack: (m.items as any)?.snack || 'Chưa cập nhật',
    calories: m.calories || 0,
    tag: 'Món chính'
  }));

  if (weekMenu.length === 0) {
    weekMenu = [
      { day: 'Thứ 2', date: '23/06', lunch: 'Cơm gà xối mỡ, Canh bí đỏ thịt bằm', snack: 'Sữa chua nha đam', calories: 680, tag: 'Gà' },
      { day: 'Thứ 3', date: '24/06', lunch: 'Cơm sườn nướng mật ong, Canh rau', snack: 'Bánh mì pate', calories: 720, tag: 'Heo' },
      { day: 'Thứ 4', date: '25/06', lunch: 'Cơm cá hồi sốt Teriyaki, Canh chua', snack: 'Sữa non', calories: 660, tag: 'Cá' },
      { day: 'Thứ 5', date: '26/06', lunch: 'Cơm bò xào cải mầm, Soup gà ngô non', snack: 'Trái cây theo mùa', calories: 700, tag: 'Bò' },
      { day: 'Thứ 6', date: '27/06', lunch: 'Bún bò Huế, Tráng miệng rau câu', snack: 'Bánh ít', calories: 650, tag: 'Nước' },
    ];
  }

  const dbAllergies = await listSpecialDiets();
  let allergies = dbAllergies.map(a => ({
    name: 'Học sinh ' + a.studentId, // In real app, join with student table
    class: 'N/A',
    type: ((a.allergies as any)?.join?.(', ') || a.specialDiet || 'Chế độ đặc biệt') as string,
    icon: (a.allergies as any)?.includes('sữa') ? MilkOff : (a.specialDiet?.includes('chay') ? Salad : WheatOff),
    color: 'text-orange-500', bg: 'bg-orange-100'
  }));

  if (allergies.length === 0) {
    allergies = [
      { name: 'Nguyễn Văn A', class: '10A1', type: 'Dị ứng sữa bò', icon: MilkOff, color: 'text-orange-500', bg: 'bg-orange-100' },
      { name: 'Lê Hoàng B', class: '11B2', type: 'Dị ứng gluten', icon: WheatOff, color: 'text-amber-500', bg: 'bg-amber-100' },
      { name: 'Trần C', class: '12C3', type: 'Ăn chay', icon: Salad, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    ];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-slate-50 to-orange-50/40 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
            <Utensils className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bán trú & Bếp ăn</h1>
            <p className="text-slate-500 font-medium mt-1">Hệ thống điều phối dinh dưỡng và suất ăn học đường</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <Calendar className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-slate-700">Tuần 26 (23/06 - 27/06)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Học sinh đăng ký', value: '420', sub: '+15 so với tuần trước', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Dị ứng & Ăn kiêng', value: '12', sub: 'Cần lưu ý đặc biệt', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
          { label: 'Điểm danh hôm nay', value: '98%', sub: '412/420 học sinh', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Đánh giá món ăn', value: '4.8/5', sub: 'Thực đơn tuần trước', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100' },
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
        {/* Weekly Menu Bento */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-amber-500/5 to-transparent">
              <div>
                <h2 className="text-xl font-black text-slate-800">Thực đơn Tuần 26</h2>
                <p className="text-sm text-slate-500 mt-1">Đã được bác sĩ dinh dưỡng phê duyệt</p>
              </div>
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">Approved</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekMenu.map((day, idx) => (
                <div key={day.day} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${idx === 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200 ring-4 ring-amber-500/10' : 'bg-slate-50/50 border-slate-100 hover:border-amber-200 hover:bg-amber-50/30'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className={`text-sm font-black px-3 py-1 rounded-lg ${idx === 0 ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-amber-600 shadow-sm border border-slate-100'}`}>
                      {day.day}
                    </div>
                    <span className="text-xs font-bold text-slate-400">{day.date}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Trưa</div>
                      <div className="text-sm text-slate-700 font-bold leading-snug">{day.lunch}</div>
                    </div>
                    <div className="pt-3 border-t border-slate-200/60">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Xế</div>
                      <div className="text-sm text-slate-600 font-semibold">{day.snack}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs bg-white border border-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-md shadow-sm">{day.tag}</span>
                    <div className="flex items-center gap-1.5 text-orange-600 bg-orange-100/50 px-2.5 py-1 rounded-md">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-xs font-black">{day.calories} kcal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special Diet & Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-slate-800 mb-1">Lưu ý Dinh dưỡng</h2>
            <p className="text-sm text-slate-500 mb-5">Danh sách học sinh cần chế độ ăn riêng</p>
            
            <div className="space-y-3">
              {allergies.map(item => (
                <div key={item.name} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-100">
                  <div className={`p-2.5 ${item.bg} rounded-xl shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-700 truncate">{item.name}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">Lớp {item.class}</div>
                  </div>
                  <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 shadow-sm whitespace-nowrap">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-sm rounded-xl transition-colors">
              Xem toàn bộ danh sách (12)
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <h3 className="font-black text-lg mb-2">Vệ sinh ATTP</h3>
              <p className="text-sm text-indigo-200/80 mb-6 leading-relaxed">Đợt kiểm tra gần nhất vào ngày 15/06/2026 bởi Sở Y Tế thành phố.</p>
              <div className="flex items-end justify-between">
                <div className="text-4xl font-black text-emerald-400">ĐẠT</div>
                <div className="text-xs font-bold text-indigo-300 bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-800">100/100 điểm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
