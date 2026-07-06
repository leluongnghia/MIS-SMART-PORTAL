// ============================================================
// MOCK DATA — MODULE SUẤT ĂN / CĂNG TIN
// ============================================================

export type MealType = 'breakfast' | 'lunch' | 'snack';
export type DietType = 'seafood_allergy' | 'dairy_allergy' | 'vegetarian' | 'diet' | 'medical' | 'custom';
export type FeedbackCategory = 'quality' | 'portion' | 'hygiene' | 'inappropriate' | 'suggestion';
export type FeedbackStatus = 'new' | 'read' | 'replied';
export type AttendStatus = 'ate' | 'absent' | 'substitute' | 'not_recorded';
export type CanteenItemStatus = 'available' | 'out_of_stock' | 'limited';

// ─── Configs ─────────────────────────────────────────────────
export const DIET_CONFIG: Record<DietType, { label: string; icon: string; color: string }> = {
  seafood_allergy: { label: 'Dị ứng hải sản', icon: '🦐', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  dairy_allergy:   { label: 'Dị ứng sữa',     icon: '🥛', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  vegetarian:      { label: 'Ăn chay',          icon: '🥗', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  diet:            { label: 'Ăn kiêng',         icon: '⚖️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  medical:         { label: 'Chỉ định y tế',    icon: '⚕️', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  custom:          { label: 'Yêu cầu riêng',    icon: '📋', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const FEEDBACK_CATEGORY: Record<FeedbackCategory, { label: string; icon: string }> = {
  quality:       { label: 'Chất lượng món ăn', icon: '🍽️' },
  portion:       { label: 'Khẩu phần',          icon: '⚖️' },
  hygiene:       { label: 'Vệ sinh',             icon: '🧹' },
  inappropriate: { label: 'Món không phù hợp',  icon: '⚠️' },
  suggestion:    { label: 'Góp ý thực đơn',     icon: '💡' },
};

export const ATTEND_STATUS: Record<AttendStatus, { label: string; color: string }> = {
  ate:          { label: 'Đã ăn',        color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  absent:       { label: 'Không ăn',     color: 'bg-rose-50 text-rose-700 border-rose-200' },
  substitute:   { label: 'Suất thay thế',color: 'bg-blue-50 text-blue-700 border-blue-200' },
  not_recorded: { label: 'Chưa điểm danh',color:'bg-slate-100 text-slate-500 border-slate-200' },
};

export const ITEM_STATUS: Record<CanteenItemStatus, { label: string; color: string }> = {
  available:    { label: 'Còn hàng',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  out_of_stock: { label: 'Hết hàng',  color: 'bg-rose-50 text-rose-700 border-rose-200' },
  limited:      { label: 'Sắp hết',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

// ─── Types ───────────────────────────────────────────────────
export interface MenuDay {
  id: string;
  date: string;           // YYYY-MM-DD
  dayLabel: string;
  breakfast: string | null;
  lunch: string;
  snack: string;
  soup: string;
  side: string;
  dessert: string;
  calories: number;
  protein: number;        // g
  allergyNotes: string;
}

export interface SpecialDiet {
  id: string;
  studentName: string;
  className: string;
  dietType: DietType;
  description: string;
  approvedBy: string;
  validUntil: string;
}

export interface MealAttendance {
  id: string;
  studentName: string;
  className: string;
  dietType: DietType | null;
  status: AttendStatus;
  notes: string;
  date: string;
}

export interface MealFeedback {
  id: string;
  sender: string;
  senderRole: 'parent' | 'teacher' | 'student';
  category: FeedbackCategory;
  content: string;
  rating: number;   // 1-5
  status: FeedbackStatus;
  date: string;
  hasImage: boolean;
}

export interface CanteenItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  status: CanteenItemStatus;
  ageAppropriate: boolean;
  allergyWarning: string | null;
}

// ─── Seed data ────────────────────────────────────────────────
const TODAY = new Date();
const iso = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

// This week Mon–Fri
const monday = new Date(TODAY);
monday.setDate(TODAY.getDate() - ((TODAY.getDay() + 6) % 7));

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
const MENU_DATA = [
  { breakfast: 'Bánh mì trứng, sữa tươi', lunch: 'Cơm gà xối mỡ', snack: 'Sữa chua nha đam', soup: 'Canh bí đỏ thịt bằm', side: 'Rau muống xào tỏi', dessert: 'Chuối chín', calories: 680, protein: 35, allergyNotes: '' },
  { breakfast: 'Cháo thịt trứng', lunch: 'Cơm sườn nướng mật ong', snack: 'Bánh mì pate', soup: 'Canh cải thịt băm', side: 'Đậu phụ sốt cà', dessert: 'Dưa hấu', calories: 720, protein: 40, allergyNotes: 'Không có hải sản' },
  { breakfast: null, lunch: 'Cơm cá hồi sốt Teriyaki', snack: 'Sữa non', soup: 'Canh chua cá', side: 'Bắp cải luộc', dessert: 'Rau câu', calories: 660, protein: 38, allergyNotes: '⚠️ Có hải sản — HS dị ứng dùng suất thay thế' },
  { breakfast: 'Xôi lạc', lunch: 'Cơm bò xào cải mầm', snack: 'Trái cây theo mùa', soup: 'Soup gà ngô non', side: 'Bí đỏ xào', dessert: 'Nhãn', calories: 700, protein: 42, allergyNotes: '' },
  { breakfast: 'Phở gà', lunch: 'Bún bò Huế', snack: 'Bánh ít', soup: '—', side: 'Giá đỗ trụng', dessert: 'Xoài', calories: 650, protein: 32, allergyNotes: '' },
];

export const MOCK_MENU: MenuDay[] = MENU_DATA.map((m, i) => ({
  id: `M${i + 1}`,
  date: iso(addDays(monday, i)),
  dayLabel: DAY_LABELS[i],
  ...m,
}));

export const MOCK_SPECIAL_DIETS: SpecialDiet[] = [
  { id: 'SD01', studentName: 'Nguyễn Minh Khang', className: '3A', dietType: 'seafood_allergy', description: 'Dị ứng hải sản nặng, cần suất thay thế khi có cá/tôm', approvedBy: 'BS. Trần Thị Lan', validUntil: '2026-12-31' },
  { id: 'SD02', studentName: 'Lê Thu Hương',      className: '2B', dietType: 'dairy_allergy',   description: 'Không dung nạp lactose, không dùng sữa và phô mai', approvedBy: 'Y tế trường', validUntil: '2026-12-31' },
  { id: 'SD03', studentName: 'Phạm Gia Bảo',      className: '5C', dietType: 'vegetarian',      description: 'Ăn chay theo tín ngưỡng gia đình', approvedBy: 'BGH', validUntil: '2026-12-31' },
  { id: 'SD04', studentName: 'Trần Bảo Ngọc',     className: '4A', dietType: 'medical',         description: 'Tiểu đường type 1, hạn chế tinh bột và đường', approvedBy: 'BS. Lê Văn Hùng', validUntil: '2027-06-30' },
  { id: 'SD05', studentName: 'Hoàng Đức Anh',     className: '1A', dietType: 'custom',          description: 'PH yêu cầu không ăn thịt heo đã được BGH duyệt', approvedBy: 'BGH', validUntil: '2026-12-31' },
];

export const MOCK_ATTENDANCE: MealAttendance[] = [
  { id: 'A01', studentName: 'Nguyễn Minh Khang', className: '3A', dietType: 'seafood_allergy', status: 'substitute', notes: 'Dùng suất thay thế (gà luộc)', date: iso(TODAY) },
  { id: 'A02', studentName: 'Trần Anh Dũng',     className: '2B', dietType: null,              status: 'ate',       notes: '',                           date: iso(TODAY) },
  { id: 'A03', studentName: 'Lê Minh Tuấn',      className: '4C', dietType: null,              status: 'ate',       notes: '',                           date: iso(TODAY) },
  { id: 'A04', studentName: 'Phạm Thu Hương',     className: '5B', dietType: null,              status: 'absent',    notes: 'HS về nhà ăn cơm',           date: iso(TODAY) },
  { id: 'A05', studentName: 'Hoàng Đức Anh',      className: '1A', dietType: 'custom',          status: 'ate',       notes: 'Không ăn thịt heo',          date: iso(TODAY) },
  { id: 'A06', studentName: 'Lê Thu Hương',       className: '2B', dietType: 'dairy_allergy',   status: 'substitute',notes: 'Thay sữa chua bằng trái cây', date: iso(TODAY) },
  { id: 'A07', studentName: 'Nguyễn Văn Nam',     className: '3B', dietType: null,              status: 'not_recorded', notes: '',                        date: iso(TODAY) },
  { id: 'A08', studentName: 'Trần Thị Mai',       className: '3A', dietType: null,              status: 'ate',       notes: '',                           date: iso(TODAY) },
];

export const MOCK_FEEDBACK: MealFeedback[] = [
  { id: 'F01', sender: 'PH Nguyễn Thị Mai', senderRole: 'parent', category: 'quality', content: 'Hôm nay canh chua cá hơi mặn, bé về nhà nói không ăn được. Mong bếp điều chỉnh gia vị nhẹ hơn cho các con.', rating: 3, status: 'new', date: new Date(Date.now() - 2 * 3600000).toISOString(), hasImage: false },
  { id: 'F02', sender: 'GV Phạm Văn Nam',   senderRole: 'teacher', category: 'hygiene', content: 'Dụng cụ ăn uống hôm thứ 4 có vết ố vàng trên muỗng, cần vệ sinh kỹ hơn.', rating: 2, status: 'new', date: new Date(Date.now() - 5 * 3600000).toISOString(), hasImage: true },
  { id: 'F03', sender: 'PH Lê Văn Đức',     senderRole: 'parent', category: 'suggestion', content: 'Đề nghị bổ sung thêm rau củ đa dạng trong thực đơn tuần sau, các con cần nhiều vitamin hơn.', rating: 4, status: 'read', date: new Date(Date.now() - 24 * 3600000).toISOString(), hasImage: false },
  { id: 'F04', sender: 'HS Trần Anh Dũng',  senderRole: 'student', category: 'portion', content: 'Khẩu phần cơm hơi ít, bạn nào cũng thấy đói sau giờ ăn.', rating: 3, status: 'replied', date: new Date(Date.now() - 48 * 3600000).toISOString(), hasImage: false },
];

export const MOCK_CANTEEN: CanteenItem[] = [
  { id: 'C01', name: 'Bánh mì sandwich', category: 'Bánh mì', price: 15000, unit: 'chiếc', status: 'available', ageAppropriate: true, allergyWarning: null },
  { id: 'C02', name: 'Sữa tươi Vinamilk', category: 'Đồ uống', price: 12000, unit: 'hộp', status: 'available', ageAppropriate: true, allergyWarning: 'Sữa bò — chú ý dị ứng lactose' },
  { id: 'C03', name: 'Xúc xích tiệt trùng', category: 'Ăn vặt', price: 10000, unit: 'gói', status: 'limited', ageAppropriate: true, allergyWarning: null },
  { id: 'C04', name: 'Nước ngọt Coca-Cola', category: 'Đồ uống', price: 15000, unit: 'lon', status: 'available', ageAppropriate: false, allergyWarning: 'Không phù hợp học sinh tiểu học' },
  { id: 'C05', name: 'Snack Oishi tôm', category: 'Ăn vặt', price: 8000, unit: 'gói', status: 'available', ageAppropriate: true, allergyWarning: '⚠️ Hải sản — dị ứng' },
  { id: 'C06', name: 'Bánh quy bơ', category: 'Bánh mì', price: 20000, unit: 'hộp', status: 'out_of_stock', ageAppropriate: true, allergyWarning: null },
  { id: 'C07', name: 'Nước lọc đóng chai', category: 'Đồ uống', price: 5000, unit: 'chai', status: 'available', ageAppropriate: true, allergyWarning: null },
];

// Summary stats helpers
export function getMealStats(attendance: MealAttendance[]) {
  const today = attendance.filter(a => a.date === iso(new Date()));
  return {
    total: today.length,
    registered: today.filter(a => a.status !== 'absent').length,
    cancelled: today.filter(a => a.status === 'absent').length,
    special: today.filter(a => a.dietType !== null).length,
    substitute: today.filter(a => a.status === 'substitute').length,
  };
}
