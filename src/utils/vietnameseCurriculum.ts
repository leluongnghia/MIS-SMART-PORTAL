export type CurriculumSubjectType = 'Bắt buộc' | 'Lựa chọn' | 'Tự chọn' | 'Hoạt động giáo dục';

export interface CurriculumSubject {
  name: string;
  type: CurriculumSubjectType;
}

export const VIETNAM_GRADE_LEVELS = [
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
] as const;

export type VietnamGradeLevel = typeof VIETNAM_GRADE_LEVELS[number];

const PRIMARY_1_2: CurriculumSubject[] = [
  { name: 'Tiếng Việt', type: 'Bắt buộc' },
  { name: 'Toán', type: 'Bắt buộc' },
  { name: 'Đạo đức', type: 'Bắt buộc' },
  { name: 'Tự nhiên và Xã hội', type: 'Bắt buộc' },
  { name: 'Giáo dục thể chất', type: 'Bắt buộc' },
  { name: 'Âm nhạc', type: 'Bắt buộc' },
  { name: 'Mĩ thuật', type: 'Bắt buộc' },
  { name: 'Hoạt động trải nghiệm', type: 'Hoạt động giáo dục' },
  { name: 'Nội dung giáo dục của địa phương', type: 'Hoạt động giáo dục' },
  { name: 'Tiếng dân tộc thiểu số', type: 'Tự chọn' },
  { name: 'Ngoại ngữ 1', type: 'Tự chọn' },
];

const PRIMARY_3: CurriculumSubject[] = [
  { name: 'Tiếng Việt', type: 'Bắt buộc' },
  { name: 'Toán', type: 'Bắt buộc' },
  { name: 'Đạo đức', type: 'Bắt buộc' },
  { name: 'Ngoại ngữ 1', type: 'Bắt buộc' },
  { name: 'Tự nhiên và Xã hội', type: 'Bắt buộc' },
  { name: 'Tin học và Công nghệ', type: 'Bắt buộc' },
  { name: 'Giáo dục thể chất', type: 'Bắt buộc' },
  { name: 'Âm nhạc', type: 'Bắt buộc' },
  { name: 'Mĩ thuật', type: 'Bắt buộc' },
  { name: 'Hoạt động trải nghiệm', type: 'Hoạt động giáo dục' },
  { name: 'Nội dung giáo dục của địa phương', type: 'Hoạt động giáo dục' },
  { name: 'Tiếng dân tộc thiểu số', type: 'Tự chọn' },
];

const PRIMARY_4_5: CurriculumSubject[] = [
  { name: 'Tiếng Việt', type: 'Bắt buộc' },
  { name: 'Toán', type: 'Bắt buộc' },
  { name: 'Đạo đức', type: 'Bắt buộc' },
  { name: 'Ngoại ngữ 1', type: 'Bắt buộc' },
  { name: 'Lịch sử và Địa lí', type: 'Bắt buộc' },
  { name: 'Khoa học', type: 'Bắt buộc' },
  { name: 'Tin học và Công nghệ', type: 'Bắt buộc' },
  { name: 'Giáo dục thể chất', type: 'Bắt buộc' },
  { name: 'Âm nhạc', type: 'Bắt buộc' },
  { name: 'Mĩ thuật', type: 'Bắt buộc' },
  { name: 'Hoạt động trải nghiệm', type: 'Hoạt động giáo dục' },
  { name: 'Nội dung giáo dục của địa phương', type: 'Hoạt động giáo dục' },
  { name: 'Tiếng dân tộc thiểu số', type: 'Tự chọn' },
];

const LOWER_SECONDARY: CurriculumSubject[] = [
  { name: 'Ngữ văn', type: 'Bắt buộc' },
  { name: 'Toán', type: 'Bắt buộc' },
  { name: 'Ngoại ngữ 1', type: 'Bắt buộc' },
  { name: 'Giáo dục công dân', type: 'Bắt buộc' },
  { name: 'Lịch sử và Địa lí', type: 'Bắt buộc' },
  { name: 'Khoa học tự nhiên', type: 'Bắt buộc' },
  { name: 'Công nghệ', type: 'Bắt buộc' },
  { name: 'Tin học', type: 'Bắt buộc' },
  { name: 'Giáo dục thể chất', type: 'Bắt buộc' },
  { name: 'Âm nhạc', type: 'Bắt buộc' },
  { name: 'Mĩ thuật', type: 'Bắt buộc' },
  { name: 'Hoạt động trải nghiệm, hướng nghiệp', type: 'Hoạt động giáo dục' },
  { name: 'Nội dung giáo dục của địa phương', type: 'Hoạt động giáo dục' },
  { name: 'Tiếng dân tộc thiểu số', type: 'Tự chọn' },
  { name: 'Ngoại ngữ 2', type: 'Tự chọn' },
  { name: 'Tiếng Trung', type: 'Tự chọn' },
];

const UPPER_SECONDARY: CurriculumSubject[] = [
  { name: 'Ngữ văn', type: 'Bắt buộc' },
  { name: 'Toán', type: 'Bắt buộc' },
  { name: 'Ngoại ngữ 1', type: 'Bắt buộc' },
  { name: 'Lịch sử', type: 'Bắt buộc' },
  { name: 'Giáo dục thể chất', type: 'Bắt buộc' },
  { name: 'Giáo dục quốc phòng và an ninh', type: 'Bắt buộc' },
  { name: 'Hoạt động trải nghiệm, hướng nghiệp', type: 'Hoạt động giáo dục' },
  { name: 'Nội dung giáo dục của địa phương', type: 'Hoạt động giáo dục' },
  { name: 'Địa lí', type: 'Lựa chọn' },
  { name: 'Giáo dục kinh tế và pháp luật', type: 'Lựa chọn' },
  { name: 'Vật lí', type: 'Lựa chọn' },
  { name: 'Hóa học', type: 'Lựa chọn' },
  { name: 'Sinh học', type: 'Lựa chọn' },
  { name: 'Công nghệ', type: 'Lựa chọn' },
  { name: 'Tin học', type: 'Lựa chọn' },
  { name: 'Âm nhạc', type: 'Lựa chọn' },
  { name: 'Mĩ thuật', type: 'Lựa chọn' },
  { name: 'Chuyên đề học tập', type: 'Lựa chọn' },
  { name: 'Tiếng dân tộc thiểu số', type: 'Tự chọn' },
  { name: 'Ngoại ngữ 2', type: 'Tự chọn' },
  { name: 'Tiếng Trung', type: 'Tự chọn' },
];

export const VIETNAM_CURRICULUM_SUBJECTS: Record<VietnamGradeLevel, CurriculumSubject[]> = {
  'Lớp 1': PRIMARY_1_2,
  'Lớp 2': PRIMARY_1_2,
  'Lớp 3': PRIMARY_3,
  'Lớp 4': PRIMARY_4_5,
  'Lớp 5': PRIMARY_4_5,
  'Lớp 6': LOWER_SECONDARY,
  'Lớp 7': LOWER_SECONDARY,
  'Lớp 8': LOWER_SECONDARY,
  'Lớp 9': LOWER_SECONDARY,
  'Lớp 10': UPPER_SECONDARY,
  'Lớp 11': UPPER_SECONDARY,
  'Lớp 12': UPPER_SECONDARY,
};

export const ALL_VIETNAM_SUBJECT_NAMES = Array.from(
  new Set(Object.values(VIETNAM_CURRICULUM_SUBJECTS).flat().map(subject => subject.name))
).sort((a, b) => a.localeCompare(b, 'vi'));

export function getGradeLevelFromClassName(className: string): VietnamGradeLevel | null {
  const match = className.match(/\d+/);
  const grade = match ? Number(match[0]) : 0;
  if (grade >= 1 && grade <= 12) {
    return `Lớp ${grade}` as VietnamGradeLevel;
  }
  return null;
}

export function getSubjectsForClassName(className: string): CurriculumSubject[] {
  const gradeLevel = getGradeLevelFromClassName(className);
  return gradeLevel ? VIETNAM_CURRICULUM_SUBJECTS[gradeLevel] : ALL_VIETNAM_SUBJECT_NAMES.map(name => ({ name, type: 'Bắt buộc' as const }));
}
