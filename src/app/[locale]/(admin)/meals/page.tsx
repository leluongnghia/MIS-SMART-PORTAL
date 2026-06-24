import { Utensils, Users, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

export const metadata = { title: 'Bán trú & Bếp ăn – MIS Portal' };

// ponytail: phase 5 — kết nối DB meal_menus, meal_registrations, meal_daily_attendance, meal_dietary_profiles
export default function MealsPage() {
  const weekMenu = [
    { day: 'Thứ 2', date: '23/06', lunch: 'Cơm gà xối mỡ + Canh bí đỏ', snack: 'Sữa chua trái cây', calories: 680 },
    { day: 'Thứ 3', date: '24/06', lunch: 'Cơm sườn nướng + Canh rau', snack: 'Bánh mì pate', calories: 720 },
    { day: 'Thứ 4', date: '25/06', lunch: 'Cơm cá hồi chiên + Canh chua', snack: 'Yaourt', calories: 660 },
    { day: 'Thứ 5', date: '26/06', lunch: 'Cơm bò xào + Soup gà', snack: 'Trái cây tươi', calories: 700 },
    { day: 'Thứ 6', date: '27/06', lunch: 'Bún bò Huế + Tráng miệng', snack: 'Bánh ít', calories: 650 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-xl">
          <Utensils className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bán trú & Bếp ăn</h1>
          <p className="text-sm text-slate-500">Thực đơn tuần, đăng ký bán trú, điểm danh ăn, VSATTP</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'HS đăng ký BT', value: '420', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Dị ứng thực phẩm', value: '12', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Điểm danh hôm nay', value: '98%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tuần hiện tại', value: 'T26/2026', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
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

      {/* Weekly Menu */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Thực đơn tuần này</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {weekMenu.map(day => (
            <div key={day.day} className="p-4 hover:bg-amber-50/30 transition-colors">
              <div className="text-xs font-bold text-amber-700 mb-1">{day.day} {day.date}</div>
              <div className="text-sm text-slate-700 font-medium mb-1.5">{day.lunch}</div>
              <div className="text-xs text-slate-500 mb-2">Xế: {day.snack}</div>
              <div className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-block">{day.calories} kcal</div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-amber-50/40 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Dữ liệu mẫu. Kết nối DB (meal_menus) trong Giai đoạn 5.
        </div>
      </div>
    </div>
  );
}
