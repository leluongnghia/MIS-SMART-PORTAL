// ============================================================
// MOCK DATA — MODULE Y TẾ HỌC ĐƯỜNG
// ============================================================

export type BloodGroup = 'A' | 'B' | 'AB' | 'O' | 'unknown';
export type IncidentType = 'fever' | 'stomachache' | 'headache' | 'injury' | 'fall' | 'allergy' | 'accident' | 'emergency' | 'infectious';
export type IncidentStatus = 'recorded' | 'monitoring' | 'parent_notified' | 'awaiting_pickup' | 'transferred' | 'completed';
export type DrugSource = 'parent' | 'school';
export type SupplyCategory = 'medicine' | 'equipment' | 'consumable';

// ─── Configs ─────────────────────────────────────────────────
export const INCIDENT_TYPE: Record<IncidentType, { label: string; icon: string; severity: 'low' | 'medium' | 'high' | 'critical' }> = {
  fever:       { label: 'Sốt',                      icon: '🌡️', severity: 'medium' },
  stomachache: { label: 'Đau bụng',                 icon: '🤢', severity: 'medium' },
  headache:    { label: 'Đau đầu',                  icon: '🤕', severity: 'low'    },
  injury:      { label: 'Chấn thương',              icon: '🩹', severity: 'high'   },
  fall:        { label: 'Té ngã',                   icon: '⚡', severity: 'high'   },
  allergy:     { label: 'Dị ứng',                   icon: '⚠️', severity: 'high'   },
  accident:    { label: 'Tai nạn học đường',        icon: '🚨', severity: 'critical'},
  emergency:   { label: 'Cấp cứu',                  icon: '🆘', severity: 'critical'},
  infectious:  { label: 'Nghi bệnh truyền nhiễm',  icon: '🦠', severity: 'critical'},
};

export const INCIDENT_STATUS: Record<IncidentStatus, { label: string; color: string; step: number }> = {
  recorded:         { label: 'Ghi nhận',              color: 'bg-slate-100 text-slate-700 border-slate-200',   step: 1 },
  monitoring:       { label: 'Đang theo dõi',         color: 'bg-blue-50 text-blue-700 border-blue-200',       step: 2 },
  parent_notified:  { label: 'Đã báo phụ huynh',      color: 'bg-amber-50 text-amber-700 border-amber-200',    step: 3 },
  awaiting_pickup:  { label: 'Chờ PH đón',            color: 'bg-orange-50 text-orange-700 border-orange-200', step: 4 },
  transferred:      { label: 'Chuyển viện',           color: 'bg-rose-50 text-rose-700 border-rose-200',       step: 5 },
  completed:        { label: 'Hoàn tất',              color: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 6 },
};

export const SEVERITY_COLOR: Record<'low' | 'medium' | 'high' | 'critical', string> = {
  low:      'bg-slate-100 text-slate-600 border-slate-200',
  medium:   'bg-amber-50 text-amber-700 border-amber-200',
  high:     'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
};

// ─── Types ───────────────────────────────────────────────────
export interface HealthProfile {
  id: string;
  studentName: string;
  className: string;
  dob: string;           // YYYY-MM-DD
  height: number;        // cm
  weight: number;        // kg
  bloodGroup: BloodGroup;
  conditions: string[];  // bệnh nền
  allergies: string[];
  currentMeds: string[];
  emergencyContact: string;
  emergencyPhone: string;
  medNotes: string;
}

export interface MedLog {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  visitTime: string;     // ISO
  reason: string;
  symptoms: string;
  handler: string;
  treatment: string;
  drugsGiven: boolean;
  needsMonitoring: boolean;
  parentNotified: boolean;
  outcome: string;
}

export interface HealthIncident {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  type: IncidentType;
  description: string;
  occurredAt: string;    // ISO
  handler: string;
  status: IncidentStatus;
  parentNotified: boolean;
  notes: string;
}

export interface DrugDispense {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  drugName: string;
  dose: string;
  schedule: string;      // e.g. "08:00, 12:00"
  source: DrugSource;
  dispensedBy: string;
  dispensedAt: string;   // ISO
  confirmed: boolean;    // học sinh đã dùng
  reaction: string;
}

export interface CheckupRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;          // YYYY-MM-DD
  height: number;
  weight: number;
  vision: string;        // "10/10" format
  dental: string;
  ent: string;           // tai mũi họng
  recommendations: string;
  parentReportSent: boolean;
}

export interface MedSupply {
  id: string;
  name: string;
  category: SupplyCategory;
  unit: string;
  quantity: number;
  minLevel: number;      // alert threshold
  expiry: string;        // YYYY-MM-DD
  handler: string;
  lastUpdated: string;   // ISO
}

// ─── Seed data ────────────────────────────────────────────────
const now = new Date();
const iso = () => now.toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const TODAY = now.toISOString().split('T')[0];

export const MOCK_PROFILES: HealthProfile[] = [
  { id: 'P01', studentName: 'Nguyễn Minh Khang', className: '3A', dob: '2018-05-12', height: 122, weight: 24, bloodGroup: 'O', conditions: ['Hen suyễn nhẹ'], allergies: ['Hải sản'], currentMeds: ['Ventolin xịt (khi cần)'], emergencyContact: 'Nguyễn Thị Mai', emergencyPhone: '0901111111', medNotes: 'Có bình xịt trong cặp. Nếu khó thở liên hệ ngay phụ huynh.' },
  { id: 'P02', studentName: 'Trần Anh Dũng',     className: '2B', dob: '2019-03-22', height: 115, weight: 21, bloodGroup: 'A', conditions: [], allergies: ['Penicillin'], currentMeds: [], emergencyContact: 'Trần Thị Lan', emergencyPhone: '0902222222', medNotes: 'Dị ứng Penicillin — KHÔNG dùng kháng sinh nhóm beta-lactam.' },
  { id: 'P03', studentName: 'Lê Minh Tuấn',      className: '4C', dob: '2017-08-15', height: 135, weight: 31, bloodGroup: 'B', conditions: ['Tiểu đường type 1'], allergies: [], currentMeds: ['Insulin (tiêm tại nhà)'], emergencyContact: 'Lê Văn Đức', emergencyPhone: '0903333333', medNotes: 'Tiểu đường type 1. Cần kiểm tra đường huyết 10:00. Có glucagon khẩn cấp.' },
  { id: 'P04', studentName: 'Phạm Thu Hương',    className: '5B', dob: '2016-11-30', height: 148, weight: 38, bloodGroup: 'AB', conditions: [], allergies: ['Sữa bò (lactose)'], currentMeds: [], emergencyContact: 'Phạm Văn Nam', emergencyPhone: '0904444444', medNotes: '' },
  { id: 'P05', studentName: 'Hoàng Đức Anh',     className: '1A', dob: '2020-02-14', height: 108, weight: 18, bloodGroup: 'unknown', conditions: [], allergies: [], currentMeds: [], emergencyContact: 'Hoàng Thị Thu', emergencyPhone: '0905555555', medNotes: '' },
];

export const MOCK_LOGS: MedLog[] = [
  { id: 'L01', studentId: 'P01', studentName: 'Nguyễn Minh Khang', className: '3A', visitTime: hoursAgo(2), reason: 'Khó thở nhẹ', symptoms: 'Thở nhanh, ngực hơi tức', handler: 'Y tá Nguyễn Thị Hoa', treatment: 'Cho xịt Ventolin 2 lần, nghỉ 20 phút', drugsGiven: true, needsMonitoring: true, parentNotified: true, outcome: 'Ổn định, về lớp học tiếp' },
  { id: 'L02', studentId: 'P02', studentName: 'Trần Anh Dũng',    className: '2B', visitTime: hoursAgo(4), reason: 'Đau bụng', symptoms: 'Đau vùng rốn, không sốt', handler: 'Y tá Nguyễn Thị Hoa', treatment: 'Sờ bụng kiểm tra, uống nước ấm, nghỉ ngơi 30 phút', drugsGiven: false, needsMonitoring: false, parentNotified: false, outcome: 'Hết đau, về lớp' },
  { id: 'L03', studentId: 'P04', studentName: 'Phạm Thu Hương',   className: '5B', visitTime: hoursAgo(1), reason: 'Đau đầu, chóng mặt', symptoms: 'Đau đầu vùng trán, hơi chóng mặt', handler: 'Y tá Nguyễn Thị Hoa', treatment: 'Đo huyết áp, cho nằm nghỉ, uống nước', drugsGiven: false, needsMonitoring: true, parentNotified: true, outcome: 'Đang theo dõi' },
];

export const MOCK_INCIDENTS: HealthIncident[] = [
  { id: 'INC01', studentId: 'P01', studentName: 'Nguyễn Minh Khang', className: '3A', type: 'allergy', description: 'Học sinh có biểu hiện khó thở sau giờ ăn trưa (nghi tiếp xúc hải sản)', occurredAt: hoursAgo(2), handler: 'Y tá Nguyễn Thị Hoa', status: 'monitoring', parentNotified: true, notes: 'Đã xịt Ventolin, cần theo dõi thêm 1 giờ' },
  { id: 'INC02', studentId: 'P03', studentName: 'Lê Minh Tuấn',      className: '4C', type: 'emergency', description: 'Học sinh đường huyết thấp (hypoglycemia) — run tay, toát mồ hôi, mặt tái', occurredAt: hoursAgo(5), handler: 'Y tá Nguyễn Thị Hoa', status: 'completed', parentNotified: true, notes: 'Đã cho uống nước đường, đo lại sau 15 phút — bình thường. PH đã đón về.' },
  { id: 'INC03', studentId: 'P05', studentName: 'Hoàng Đức Anh',     className: '1A', type: 'fall', description: 'Té ngã sân trường giờ ra chơi, trầy tay phải và đầu gối', occurredAt: hoursAgo(1), handler: 'GV Phạm Văn Nam', status: 'parent_notified', parentNotified: true, notes: 'Sát khuẩn vết trầy, băng bó. PH đã được thông báo.' },
  { id: 'INC04', studentId: 'P02', studentName: 'Trần Anh Dũng',     className: '2B', type: 'fever', description: 'Sốt 38.5°C đo tại phòng y tế 13:30', occurredAt: hoursAgo(0.5), handler: 'Y tá Nguyễn Thị Hoa', status: 'awaiting_pickup', parentNotified: true, notes: 'Đã hạ sốt bằng Paracetamol trường, chờ phụ huynh đón' },
];

export const MOCK_DRUGS: DrugDispense[] = [
  { id: 'D01', studentId: 'P01', studentName: 'Nguyễn Minh Khang', className: '3A', drugName: 'Ventolin 100mcg', dose: '2 nhát xịt', schedule: 'Khi khó thở', source: 'parent', dispensedBy: 'Y tá Nguyễn Thị Hoa', dispensedAt: hoursAgo(2), confirmed: true, reaction: 'Không có phản ứng bất thường' },
  { id: 'D02', studentId: 'P02', studentName: 'Trần Anh Dũng',    className: '2B', drugName: 'Paracetamol 250mg', dose: '1 viên', schedule: '13:30', source: 'school', dispensedBy: 'Y tá Nguyễn Thị Hoa', dispensedAt: hoursAgo(0.5), confirmed: true, reaction: '' },
  { id: 'D03', studentId: 'P03', studentName: 'Lê Minh Tuấn',      className: '4C', drugName: 'Glucose 20% uống', dose: '50ml', schedule: '10:15 (khẩn cấp)', source: 'school', dispensedBy: 'Y tá Nguyễn Thị Hoa', dispensedAt: hoursAgo(5), confirmed: true, reaction: 'Phục hồi tốt sau 15 phút' },
];

export const MOCK_CHECKUPS: CheckupRecord[] = [
  { id: 'CK01', studentId: 'P01', studentName: 'Nguyễn Minh Khang', className: '3A', date: TODAY, height: 122, weight: 24, vision: '10/10', dental: 'Sâu răng 1 cái (hàm trên)', ent: 'Bình thường', recommendations: 'Hẹn nha sĩ kiểm tra sâu răng. Tiếp tục theo dõi hen suyễn.', parentReportSent: false },
  { id: 'CK02', studentId: 'P04', studentName: 'Phạm Thu Hương',   className: '5B', date: TODAY, height: 148, weight: 38, vision: '9/10', dental: 'Bình thường', ent: 'Viêm mũi dị ứng nhẹ', recommendations: 'Khám mắt chuyên khoa. Theo dõi viêm mũi.', parentReportSent: true },
  { id: 'CK03', studentId: 'P05', studentName: 'Hoàng Đức Anh',     className: '1A', date: TODAY, height: 108, weight: 18, vision: '10/10', dental: 'Bình thường', ent: 'Bình thường', recommendations: '', parentReportSent: false },
];

export const MOCK_SUPPLIES: MedSupply[] = [
  { id: 'S01', name: 'Paracetamol 250mg', category: 'medicine', unit: 'viên', quantity: 15, minLevel: 20, expiry: '2027-06-30', handler: 'Y tá Nguyễn Thị Hoa', lastUpdated: hoursAgo(24) },
  { id: 'S02', name: 'Betadine sát khuẩn', category: 'medicine', unit: 'chai', quantity: 3, minLevel: 5, expiry: '2026-12-31', handler: 'Y tá Nguyễn Thị Hoa', lastUpdated: hoursAgo(48) },
  { id: 'S03', name: 'Băng gạc y tế', category: 'consumable', unit: 'cuộn', quantity: 8, minLevel: 10, expiry: '2028-01-01', handler: 'Y tá Nguyễn Thị Hoa', lastUpdated: hoursAgo(24) },
  { id: 'S04', name: 'Nhiệt kế điện tử', category: 'equipment', unit: 'cái', quantity: 2, minLevel: 2, expiry: '2030-01-01', handler: 'Y tá Nguyễn Thị Hoa', lastUpdated: hoursAgo(72) },
  { id: 'S05', name: 'Glucose 20% uống', category: 'medicine', unit: 'gói', quantity: 5, minLevel: 5, expiry: '2027-03-15', handler: 'Y tá Nguyễn Thị Hoa', lastUpdated: hoursAgo(5) },
  { id: 'S06', name: 'Bông y tế', category: 'consumable', unit: 'gói', quantity: 2, minLevel: 3, expiry: '2029-01-01', handler: 'Y tá Nguyễn Thị Hoa', lastUpdated: hoursAgo(48) },
  { id: 'S07', name: 'Oresol', category: 'medicine', unit: 'gói', quantity: 20, minLevel: 10, expiry: '2027-09-01', handler: 'Y tá Nguyễn Thị Hoa', lastUpdated: hoursAgo(48) },
];

export const STAFF = ['Y tá Nguyễn Thị Hoa', 'BS. Trần Văn Minh', 'GV trực Phạm Văn Nam'];

export function getHealthStats(incidents: HealthIncident[], supplies: MedSupply[]) {
  const todayVisits = MOCK_LOGS.length;
  const activeIncidents = incidents.filter(i => i.status !== 'completed').length;
  const notified = incidents.filter(i => i.parentNotified).length;
  const awaitingPickup = incidents.filter(i => i.status === 'awaiting_pickup').length;
  const lowStock = supplies.filter(s => s.quantity <= s.minLevel).length;
  const specialAlert = MOCK_PROFILES.filter(p => p.conditions.length > 0 || p.allergies.length > 0).length;
  return { todayVisits, activeIncidents, notified, awaitingPickup, lowStock, specialAlert };
}
