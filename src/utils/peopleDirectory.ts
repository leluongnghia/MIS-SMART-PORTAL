import { Task, UserProfile } from '../types';

type GenderText = 'Nam' | 'Nữ' | 'Khác';

const FEMALE_GIVEN_NAMES = new Set([
  'anh', 'an', 'bich', 'chi', 'dung', 'hanh', 'hoa', 'huong', 'lan', 'linh',
  'mai', 'my', 'ngan', 'nga', 'ngoc', 'oanh', 'quyen', 'thao', 'thu', 'trang',
  'tra', 'van', 'yen'
]);

const MALE_GIVEN_NAMES = new Set([
  'bao', 'binh', 'dat', 'dao', 'dang', 'duy', 'hai', 'hoang', 'hung', 'huy',
  'kha', 'khanh', 'long', 'minh', 'nam', 'phong', 'quan', 'son', 'thai',
  'thang', 'thanh', 'thuan', 'tuan', 'vinh'
]);

const PARENT_GIVEN_NAMES = [
  'Minh', 'Hải', 'Sơn', 'Thắng', 'Hùng', 'Lan', 'Hương', 'Trang', 'Thu', 'Hạnh',
  'Bình', 'Phúc', 'Tâm', 'Dũng', 'Mai', 'Oanh'
];

const ADDRESS_AREAS = [
  'Cầu Giấy, Hà Nội',
  'Nam Từ Liêm, Hà Nội',
  'Thanh Xuân, Hà Nội',
  'Hà Đông, Hà Nội',
  'Hoàng Mai, Hà Nội',
  'Long Biên, Hà Nội',
  'Bắc Từ Liêm, Hà Nội',
  'Đống Đa, Hà Nội'
];

const stripVietnameseMarks = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const stableSeed = (value: string, fallback = 1) => {
  const source = value || String(fallback);
  return Array.from(source).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), fallback);
};

export const inferVietnameseGender = (name = ''): GenderText => {
  const lower = name.normalize('NFC').toLowerCase();
  const ascii = stripVietnameseMarks(name);

  if (lower.includes('cô ') || lower.includes(' thị ') || ascii.includes('co ') || ascii.includes(' thi ')) return 'Nữ';
  if (lower.includes('thầy ') || lower.includes(' văn ') || ascii.includes('thay ') || ascii.includes(' van ')) return 'Nam';

  const parts = ascii.split(/\s+/).filter(Boolean);
  const givenName = parts[parts.length - 1] || '';
  if (FEMALE_GIVEN_NAMES.has(givenName)) return 'Nữ';
  if (MALE_GIVEN_NAMES.has(givenName)) return 'Nam';
  return 'Khác';
};

export const deterministicPhone = (seed: number, prefix = '09') =>
  `${prefix}${String(10000000 + Math.abs(seed * 7919) % 90000000).padStart(8, '0')}`;

const isMissingText = (value?: string) => {
  const normalized = stripVietnameseMarks(value || '');
  return !normalized.trim() || normalized.includes('chua cap nhat') || normalized.includes('nguoi lien he');
};

const isValidPhone = (value?: string) => /^0\d{9}$/.test((value || '').trim());
const isValidEmail = (value?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());

const parentEmailFromStudent = (student: { id?: string; code?: string; name?: string }, seed: number) => {
  const raw = student.code || student.id || student.name || `student-${seed}`;
  const slug = stripVietnameseMarks(raw)
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 40);
  return `phuhuynh.${slug || seed}@parent.mis.edu.vn`;
};

export function normalizeStudentProfile<T extends {
  id?: string;
  code?: string;
  name: string;
  className?: string;
  gender?: unknown;
  birthDate?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
  address?: string;
}>(student: T, index = 0, options: { refreshContact?: boolean } = {}): T {
  const seed = stableSeed(`${student.id || ''}-${student.code || ''}-${student.name}`, index + 1);
  const inferredGender = inferVietnameseGender(student.name);
  const nameParts = student.name.trim().split(/\s+/);
  const familyName = nameParts[0] || 'Nguyễn';
  const parentMiddleName = seed % 2 === 0 ? 'Văn' : 'Thị';
  const parentGivenName = PARENT_GIVEN_NAMES[seed % PARENT_GIVEN_NAMES.length];
  const birthYear = student.className?.match(/\d+/)?.[0]
    ? 2026 - (Number(student.className.match(/\d+/)?.[0]) + 5)
    : 2010;

  const next = {
    ...student,
    gender: (inferredGender !== 'Khác' ? inferredGender : student.gender || inferredGender) as T['gender'],
    birthDate: student.birthDate || `${birthYear}-09-05`,
    parentName: (options.refreshContact || isMissingText(student.parentName) || (student.parentName || '').trim().split(/\s+/).length < 3)
      ? `${familyName} ${parentMiddleName} ${parentGivenName}`
      : student.parentName,
    parentPhone: (options.refreshContact || !isValidPhone(student.parentPhone))
      ? deterministicPhone(seed)
      : student.parentPhone,
    parentEmail: isValidEmail(student.parentEmail)
      ? student.parentEmail
      : parentEmailFromStudent(student, seed),
    emergencyContact: (options.refreshContact || !isValidPhone(student.emergencyContact))
      ? deterministicPhone(seed + 97, '08')
      : student.emergencyContact,
    address: (options.refreshContact || isMissingText(student.address) || (student.address || '').split(',').length < 3)
      ? `Số ${(seed % 88) + 10}, ngõ ${(seed % 45) + 1}, ${ADDRESS_AREAS[seed % ADDRESS_AREAS.length]}`
      : student.address
  };

  return next as T;
}

export const normalizeStudentProfiles = <T extends Parameters<typeof normalizeStudentProfile>[0]>(students: T[]) =>
  students.map((student, index) => normalizeStudentProfile(student, index));

export function normalizeUserProfile<T extends UserProfile>(user: T, index = 0): T {
  const seed = stableSeed(user.id, index + 1);
  const inferredGender = inferVietnameseGender(user.name);
  const normalizedId = user.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `ns${seed}`;
  const isManager = user.role === 'ADMIN' || user.role === 'MANAGER';
  const roleText = stripVietnameseMarks(`${user.roleName} ${user.title}`);
  const isTeacher = roleText.includes('giao vien') || roleText.includes('to truong');
  const startYears = [2018, 2019, 2020, 2021, 2022, 2023];
  const month = String((seed % 9) + 1).padStart(2, '0');
  const day = String((seed % 20) + 5).padStart(2, '0');

  return {
    ...user,
    email: user.email || `${normalizedId}@mis.edu.vn`,
    personalEmail: user.personalEmail || `${normalizedId}.personal@gmail.com`,
    phone: user.phone || deterministicPhone(seed),
    address: user.address || `Số ${(seed % 88) + 10}, ngõ ${(seed % 45) + 1}, ${ADDRESS_AREAS[seed % ADDRESS_AREAS.length]}`,
    employeeCode: user.employeeCode || `MIS-HR-${String(seed).padStart(4, '0')}`,
    dateOfBirth: user.dateOfBirth || `${1978 + (seed % 20)}-${month}-${day}`,
    gender: (inferredGender !== 'Khác' ? inferredGender : user.gender || inferredGender) as UserProfile['gender'],
    startDate: user.startDate || `${startYears[seed % startYears.length]}-08-${String((seed % 15) + 1).padStart(2, '0')}`,
    contractType: user.contractType || (isManager ? 'Hợp đồng quản lý toàn thời gian' : 'Hợp đồng lao động toàn thời gian'),
    qualification: user.qualification || (isManager ? 'Thạc sĩ Quản trị giáo dục' : isTeacher ? 'Cử nhân/Thạc sĩ Sư phạm' : 'Cử nhân chuyên ngành phù hợp'),
    specialization: user.specialization || user.title,
    emergencyContact: user.emergencyContact || `Người thân - ${deterministicPhone(seed + 41, '08')}`,
    nationalId: user.nationalId || `0${String(10000000000 + Math.abs(seed * 15485863) % 90000000000).padStart(11, '0')}`,
    insuranceCode: user.insuranceCode || `BHXH-${String(seed * 97).padStart(6, '0')}`
  } as T;
}

export const normalizeUserProfiles = <T extends UserProfile>(users: T[]) =>
  users.map((user, index) => normalizeUserProfile(user, index));

export function normalizeTaskAssigneeRoles(tasks: Task[], users: UserProfile[]): Task[] {
  const userById = new Map(users.map(user => [user.id, user]));
  return tasks.map(task => {
    const assignedUser = userById.get(task.assignedId);
    if (!assignedUser) return task;
    if (task.assignedName === assignedUser.name && task.assignedRole === assignedUser.title) return task;
    return {
      ...task,
      assignedName: assignedUser.name,
      assignedRole: assignedUser.title
    };
  });
}
