'use client';

import { useEffect, useState, useMemo } from 'react';
import { Dialog } from '@/src/components/ui/dialog';
import { CheckCircle2, 
  UserCircle,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  Trophy,
  Phone,
  MessageSquare,
  Mail,
  Edit3,
  Bell,
  Activity,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  SettingsIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const trendData = [
  { term: 'HK1 2023-2024', student: 7.8, class: 7.2 },
  { term: 'HK2 2023-2024', student: 8.1, class: 7.4 },
  { term: 'HK1 2024-2025', student: 8.0, class: 7.5 },
  { term: 'HK2 2024-2025', student: 8.4, class: 7.6 },
];
export default function Student360Dashboard({ initialData }: { initialData?: any }) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return initialData?.students?.[0]?.id || '';
  });
  const [currentTab, setCurrentTab] = useState<'overview' | 'academics' | 'attendance' | 'conduct' | 'health'>('overview');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [hienTimelineDialog, setHienTimelineDialog] = useState(false);
  const [hienTuyChinh, setHienTuyChinh] = useState(false);
  const [tuyChinhAnLop, setTuyChinhAnLop] = useState(false);
  const [tuyChinhAnGPA, setTuyChinhAnGPA] = useState(false);

  const studentsByClass = useMemo(() => {
    const students = initialData?.students || [];
    const grouped: Record<string, any[]> = {};
    students.forEach((student: any) => {
      const className = student.className || 'Chưa phân lớp';
      grouped[className] = grouped[className] || [];
      grouped[className].push(student);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, 'vi', { numeric: true }));
  }, [initialData]);

  const officialClassOptions = useMemo(() => {
    const classDistribution = initialData?.officialStats?.classDistribution || [];
    if (classDistribution.length) {
      return classDistribution.map((item: any) => [item.className, item.students] as [string, number]);
    }
    return studentsByClass.map(([className, students]) => [className, students.length] as [string, number]);
  }, [initialData, studentsByClass]);

  const filteredStudents = useMemo(() => {
    const students = initialData?.students || [];
    if (selectedClass === 'all') return students;
    return students.filter((student: any) => (student.className || 'Chưa phân lớp') === selectedClass);
  }, [initialData, selectedClass]);

  useEffect(() => {
    if (!filteredStudents.length) return;
    if (!filteredStudents.some((student: any) => student.id === selectedStudentId)) {
      setSelectedStudentId(filteredStudents[0].id);
    }
  }, [filteredStudents, selectedStudentId]);

  const currentStudent = useMemo(() => {
    return filteredStudents.find((s: any) => s.id === selectedStudentId) || filteredStudents[0] || initialData?.students?.[0];
  }, [filteredStudents, initialData, selectedStudentId]);

  const studentGrades = useMemo(() => {
    if (!currentStudent) return [];
    return initialData?.grades?.filter((g: any) => g.studentId === currentStudent.id) || [];
  }, [initialData, currentStudent]);

  const studentTuition = useMemo(() => {
    if (!currentStudent) return [];
    return initialData?.tuitionFees?.filter((t: any) => t.studentId === currentStudent.id) || [];
  }, [initialData, currentStudent]);

  const studentTrend = useMemo(() => {
    const baseGpa = currentStudent?.payload?.gpa || 8.4;
    return [
      { term: 'HK1 23-24', student: Number((baseGpa - 0.6).toFixed(1)), class: 7.2 },
      { term: 'HK2 23-24', student: Number((baseGpa - 0.3).toFixed(1)), class: 7.4 },
      { term: 'HK1 24-25', student: Number((baseGpa - 0.4).toFixed(1)), class: 7.5 },
      { term: 'HK2 24-25', student: baseGpa, class: 7.6 },
    ];
  }, [currentStudent]);

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Không tìm thấy dữ liệu học sinh. Vui lòng kiểm tra lại database seed.
      </div>
    );
  }

  const payload = currentStudent.payload || {};
  const attendance = payload.attendanceStat || { present: 176, excused: 5, unexcused: 2, late: 3 };
  const conduct = payload.conduct || { status: 'Tốt', advantages: [], notes: [] };
  const health = payload.health || { status: 'Tốt', height: '170 cm', weight: '60 kg', bloodType: 'O+', warning: 'Không có' };
  const achievements = payload.achievements || [];
  const parents = payload.parents || [];
  const timeline = payload.timeline || [];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hồ sơ Học sinh 360°
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentTab('overview');
            }}
            className="block w-44 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 font-bold bg-white"
          >
            <option value="all">Tất cả lớp ({initialData?.officialStats?.totalStudents?.toLocaleString('vi-VN') || initialData?.students?.length || 0})</option>
            {officialClassOptions.map(([className, total]) => (
              <option key={className} value={className}>{className} ({total})</option>
            ))}
          </select>
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setCurrentTab('overview');
            }}
            className="block w-72 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 font-bold bg-white"
          >
            {studentsByClass.map(([className, students]) => {
              const options = (selectedClass === 'all' || selectedClass === className) ? students : [];
              if (!options.length) return null;
              return (
                <optgroup key={className} label={`${className} • ${students.length} học sinh`}>
                  {options.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {tuyChinhAnLop ? '' : `(${s.className})`}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          <select className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 font-bold bg-white">
            <option>Năm học 2024 - 2025</option>
          </select>
          <Button variant="outline" className="gap-2 font-bold" onClick={() => setHienTuyChinh(true)}>
            <SettingsIcon className="h-4 w-4" /> Tùy chỉnh
          </Button>
        </div>
      </div>

      {initialData?.officialStats && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">Tổng sĩ số</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{initialData.officialStats.totalStudents.toLocaleString('vi-VN')}</span>
                <span className="pb-1 text-sm font-bold text-slate-500">HS</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">Tổng sĩ số toàn trường</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Tổng số lớp</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{initialData.officialStats.totalClasses}</span>
                <span className="pb-1 text-sm font-bold text-slate-500">lớp</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">TB {initialData.officialStats.averageClassSize} HS/lớp</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Chia theo cấp học</p>
              <div className="mt-2 space-y-1">
                {initialData.officialStats.classGroups.map((group: any) => (
                  <div key={group.level} className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>{group.level} ({group.grades})</span>
                    <span>{group.classes} lớp • {group.students} HS</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Tuyển sinh năm học tới</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{initialData.officialStats.admissionsPipeline}</span>
                <span className="pb-1 text-sm font-bold text-slate-500">HS</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">Học sinh đang tuyển cho năm sau</p>
            </CardContent>
          </Card>
        </div>
      )}

      {initialData?.officialStats?.classDistribution && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-black">Phân bổ học sinh theo lớp</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
              {initialData.officialStats.classDistribution.map((item: any) => {
                const grade = Number(String(item.className).match(/\d+/)?.[0] || 0);
                const palette = grade <= 5
                  ? 'border-sky-200 bg-sky-50/80 text-sky-700 ring-sky-100 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300'
                  : grade <= 9
                    ? 'border-violet-200 bg-violet-50/80 text-violet-700 ring-violet-100 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-300'
                    : 'border-amber-200 bg-amber-50/80 text-amber-700 ring-amber-100 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300';
                const badge = grade <= 5 ? 'Tiểu học' : grade <= 9 ? 'THCS' : 'THPT';
                return (
                  <div key={item.className} className={cn('rounded-xl border p-3 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md', palette)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black">{item.className}</p>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-500 dark:bg-slate-950/50">{badge}</span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">{item.students} học sinh</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-100 shadow-sm dark:border-blue-900/30">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Điểm trung bình (TB)</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-blue-600">{tuyChinhAnGPA ? "—" : (payload.gpa || 8.4)}</h3>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">Xếp hạng: {payload.rank || 'N/A'}</div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-medium text-emerald-600">
                {payload.gpa >= 8.5 ? "Tăng ↑ 0.5 so với HK1" : "Ổn định so với HK1"}
              </span>
              <div className="w-16 h-6">
                 {/* Sparkline Mock */}
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d={payload.sparkline || "M0,15 L20,12 L40,8 L60,14 L80,5 L100,2"} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="2" r="3" fill="#10b981" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm dark:border-emerald-900/30">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Chuyên cần</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-emerald-600">{payload.attendanceRate || '96.2%'}</h3>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">Đi học: {attendance.present}/{attendance.present + attendance.excused + attendance.unexcused} buổi</div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> {parseFloat(payload.attendanceRate) >= 95 ? "Tốt" : "Khá"}
              </span>
              <div className="w-16 h-6">
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,18 L20,15 L40,10 L60,12 L80,6 L100,4" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="4" r="3" fill="#10b981" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm dark:border-orange-900/30">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Cảnh báo học tập</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-orange-600">
                    {conduct.status === 'Khá' ? 1 : 0}
                  </h3>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">{conduct.notes?.[0] || "Không có môn yếu"}</div>
            <div className="flex justify-between items-end mt-auto">
              <a href="#" className="text-[10px] font-medium text-blue-600">Xem chi tiết →</a>
              <div className="w-16 h-6">
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,18 L20,18 L40,15 L60,12 L80,6 L100,8" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="8" r="3" fill="#f97316" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm dark:border-purple-900/30">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Thành tích & Ngoại khóa</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-purple-600">{achievements.length || 0}</h3>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">Giải thưởng, chứng nhận</div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Tích cực</span>
              <div className="w-16 h-6">
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,15 L20,5 L40,12 L60,8 L80,14 L100,2" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="2" r="3" fill="#9333ea" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Profile */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="relative overflow-hidden border-blue-100 dark:border-blue-900/30">
            <div className="absolute top-0 right-0 p-3 z-10">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex gap-1.5 items-center px-2 py-0.5 text-[10px]">
                {payload.status || 'Đang học'}
              </Badge>
            </div>
            <CardHeader className="p-6 pb-2 text-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <img src={`https://i.pravatar.cc/150?u=${currentStudent.id}`} className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-white dark:ring-slate-950 mx-auto" alt="" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{currentStudent.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Mã HS: {currentStudent.code}</p>
            </CardHeader>
            <CardContent className="p-4 pt-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Lớp</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">{currentStudent.className}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Khối</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">{currentStudent.className?.match(/\d+/)?.[0] || '11'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Cơ sở</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">{payload.location || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Ngày sinh</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">{payload.dob || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Giới tính</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">{payload.gender || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Dân tộc</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">{payload.ethnicity || 'Kinh'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-1 text-slate-500 font-medium">Ngày nhập học</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100">{payload.admissionDate || 'N/A'}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-3 text-xs">Thông tin phụ huynh</p>
                <div className="space-y-3">
                  {parents.length > 0 ? (
                    parents.map((p: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={p.avatar || `https://i.pravatar.cc/150?u=${p.relation === 'Mẹ' ? 'mom' : 'dad'}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                          <div>
                            <p className="text-[11px] font-bold leading-tight text-slate-900 dark:text-white">
                              {p.name} <span className="font-normal text-slate-500">({p.relation})</span>
                            </p>
                            <p className="text-[10px] text-slate-500">{p.phone}</p>
                            <p className="text-[10px] text-slate-500">{p.email || ''}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600"><Phone className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic">Không có thông tin phụ huynh</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2 text-xs">Thao tác nhanh</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors border border-blue-100"><Bell className="h-4 w-4" /></div>
                    <span className="text-[9px] font-medium text-slate-600">Gửi thông báo</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors border border-emerald-100"><MessageSquare className="h-4 w-4" /></div>
                    <span className="text-[9px] font-medium text-slate-600">Nhắn tin PH</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors border border-purple-100"><Phone className="h-4 w-4" /></div>
                    <span className="text-[9px] font-medium text-slate-600">Gọi điện</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100 transition-colors border border-orange-100"><Edit3 className="h-4 w-4" /></div>
                    <span className="text-[9px] font-medium text-slate-600">Tạo ghi chú</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Main Section */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">
            {[
              ['overview', 'Tổng quan'],
              ['academics', 'Học tập'],
              ['attendance', 'Chuyên cần'],
              ['conduct', 'Hạnh kiểm'],
              ['health', 'Y tế'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab as any)}
                className={cn('pb-3 border-b-2 transition-colors', currentTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700')}
              >
                {label}
              </button>
            ))}
          </div>

          {(currentTab === 'overview' || currentTab === 'academics') && (
          <>
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Xu hướng học tập</CardTitle>
              <select className="text-xs border-slate-200 rounded-md bg-transparent">
                <option>4 học kỳ gần nhất</option>
              </select>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-6 mb-4 px-4 text-[11px] font-bold text-slate-600 justify-center">
                <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-blue-600" /> Điểm TB</span>
                <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-sky-500 border border-dashed border-sky-500" /> Điểm TB lớp</span>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studentTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="student" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} name="Điểm TB học sinh" />
                    <Line type="monotone" dataKey="class" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#0ea5e9' }} name="Điểm TB lớp" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Học tập HK2 */}
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold">Kết quả học tập học kỳ II <span className="text-[10px] text-slate-400 font-normal">(2024 - 2025)</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 pb-2 flex flex-col justify-between h-[180px]">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-600" strokeDasharray={`${(payload.gpa || 8.4) * 10}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[9px] text-slate-500 font-medium">Điểm TB</span>
                      <span className="text-xl font-bold text-blue-600 -mt-1">{payload.gpa || 8.4}</span>
                      <span className="text-[10px] text-emerald-600 font-bold -mt-0.5">{payload.gpa >= 8.0 ? 'Tốt' : 'Khá'}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-xs overflow-y-auto max-h-[140px]">
                    {studentGrades.map((g: any) => (
                      <div key={g.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                        <span className="text-slate-600 dark:text-slate-400">{g.subject}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{g.payload?.score}</span>
                      </div>
                    ))}
                    {studentGrades.length === 0 && (
                      <p className="text-slate-400 italic">Chưa có điểm</p>
                    )}
                  </div>
                </div>
                <div className="text-center mt-2">
                  <button type="button" onClick={() => setCurrentTab('academics')} className="text-[10px] font-bold text-blue-600">Xem chi tiết →</button>
                </div>
              </CardContent>
            </Card>

            {/* Chuyên cần HK2 */}
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold">Chuyên cần học kỳ II <span className="text-[10px] text-slate-400 font-normal">(2024 - 2025)</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 pb-2 flex flex-col justify-between h-[180px]">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-emerald-500" strokeDasharray={`${parseFloat(payload.attendanceRate || '96.2%')}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[15px] font-bold text-emerald-600 mt-1">{payload.attendanceRate || '96.2%'}</span>
                      <span className="text-[9px] text-slate-500 font-medium">{attendance.present} / {attendance.present + attendance.excused + attendance.unexcused} buổi</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Đi học</span><span className="font-bold">{attendance.present} <span className="text-[10px] font-normal text-slate-400">buổi</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Nghỉ phép</span><span className="font-bold">{attendance.excused} <span className="text-[10px] font-normal text-slate-400">buổi</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Nghỉ không phép</span><span className="font-bold text-red-500">{attendance.unexcused} <span className="text-[10px] font-normal text-slate-400">buổi</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Đi muộn</span><span className="font-bold text-orange-500">{attendance.late} <span className="text-[10px] font-normal text-slate-400">lần</span></span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <button type="button" onClick={() => setCurrentTab('attendance')} className="text-[10px] font-bold text-blue-600">Xem chi tiết →</button>
                </div>
              </CardContent>
            </Card>
            
            {/* Hạnh kiểm HK2 */}
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold">Hạnh kiểm học kỳ II <span className="text-[10px] text-slate-400 font-normal">(2024 - 2025)</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex gap-4 h-[160px]">
                <div className="w-20 h-full bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-center items-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-500 mb-1" />
                  <span className="text-sm font-bold text-emerald-600">{conduct.status || 'Tốt'}</span>
                </div>
                <div className="flex-1 space-y-2 text-xs overflow-y-auto">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Ưu điểm</span>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 list-disc list-inside ml-3 mt-1 space-y-1">
                      {conduct.advantages?.map((adv: string, idx: number) => (
                        <li key={idx}>{adv}</li>
                      ))}
                      {(!conduct.advantages || conduct.advantages.length === 0) && (
                        <li>Không có</li>
                      )}
                    </ul>
                  </div>
                  <div className="pt-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Nhắc nhở</span>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 list-disc list-inside ml-3 mt-1">
                      {conduct.notes?.map((note: string, idx: number) => (
                        <li key={idx}>{note}</li>
                      ))}
                      {(!conduct.notes || conduct.notes.length === 0) && (
                        <li>Không có</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Thành tích */}
            <Card>
              <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Thành tích & Giải thưởng</CardTitle>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="p-4 pb-2 flex flex-col justify-between h-[160px]">
                <div className="space-y-3 overflow-y-auto max-h-[110px]">
                  {achievements.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center shrink-0 mt-0.5"><Trophy className="h-3 w-3" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{item.title}</p>
                        </div>
                        <p className="text-[10px] text-slate-500">{item.organization}</p>
                      </div>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <p className="text-slate-400 text-xs italic">Chưa có thành tích</p>
                  )}
                </div>
                <div className="text-center mt-1">
                  <a href="#" className="text-[10px] font-bold text-blue-600">Xem tất cả →</a>
                </div>
              </CardContent>
            </Card>

          </div>
          </>
          )}

          {currentTab === 'attendance' && (
            <Card className="overflow-hidden border-emerald-100 shadow-sm dark:border-emerald-900/30">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-5 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Chuyên cần học kỳ II</p>
                      <h3 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{payload.attendanceRate || '96.2%'}</h3>
                      <p className="mt-1 text-sm font-bold text-slate-500">Tỷ lệ đi học hiện tại</p>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-emerald-600 shadow-lg shadow-emerald-200/60 ring-1 ring-emerald-100 dark:bg-slate-900/80 dark:shadow-none dark:ring-emerald-900/40">
                      <CalendarCheck className="h-9 w-9" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5">
                  {[
                    ['Đi học', attendance.present, 'buổi', 'text-emerald-600', 'bg-emerald-50'],
                    ['Nghỉ phép', attendance.excused, 'buổi', 'text-sky-600', 'bg-sky-50'],
                    ['Nghỉ không phép', attendance.unexcused, 'buổi', 'text-rose-600', 'bg-rose-50'],
                    ['Đi muộn', attendance.late, 'lần', 'text-amber-600', 'bg-amber-50'],
                  ].map(([label, value, unit, color, bg]) => (
                    <div key={label} className={cn('rounded-2xl p-4 ring-1 ring-slate-100 dark:ring-slate-800', bg as string)}>
                      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
                      <p className={cn('mt-2 text-2xl font-black', color as string)}>{value} <span className="text-xs font-bold text-slate-500">{unit}</span></p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {currentTab === 'conduct' && (
            <Card className="overflow-hidden border-violet-100 shadow-sm dark:border-violet-900/30">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white p-5 dark:from-violet-950/30 dark:via-fuchsia-950/20 dark:to-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Đánh giá hạnh kiểm</p>
                      <h3 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{conduct.status || 'Tốt'}</h3>
                      <p className="mt-1 text-sm font-bold text-slate-500">Theo dõi thái độ, nề nếp và tương tác lớp học</p>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-violet-600 shadow-lg shadow-violet-200/60 ring-1 ring-violet-100 dark:bg-slate-900/80 dark:shadow-none dark:ring-violet-900/40">
                      <ShieldCheck className="h-9 w-9" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                    <p className="mb-3 flex items-center gap-2 text-sm font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Ưu điểm</p>
                    <ul className="space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {(conduct.advantages?.length ? conduct.advantages : ['Duy trì nề nếp tốt']).map((item: string, idx: number) => <li key={idx}>• {item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                    <p className="mb-3 flex items-center gap-2 text-sm font-black text-amber-700"><AlertTriangle className="h-4 w-4" /> Nhắc nhở</p>
                    <ul className="space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {(conduct.notes?.length ? conduct.notes : ['Không có nhắc nhở']).map((item: string, idx: number) => <li key={idx}>• {item}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {currentTab === 'health' && (
            <Card className="overflow-hidden border-sky-100 shadow-sm dark:border-sky-900/30">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-sky-50 via-cyan-50 to-white p-5 dark:from-sky-950/30 dark:via-cyan-950/20 dark:to-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Y tế & sức khỏe</p>
                      <h3 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{health.status || 'Tốt'}</h3>
                      <p className="mt-1 text-sm font-bold text-slate-500">Hồ sơ sức khỏe học đường</p>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-sky-600 shadow-lg shadow-sky-200/60 ring-1 ring-sky-100 dark:bg-slate-900/80 dark:shadow-none dark:ring-sky-900/40">
                      <HeartPulse className="h-9 w-9" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5">
                  {[
                    ['Chiều cao', health.height || '170 cm'],
                    ['Cân nặng', health.weight || '60 kg'],
                    ['Nhóm máu', health.bloodType || 'O+'],
                    ['Cảnh báo y tế', health.warning || 'Không có'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
                      <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {/* Y tế (was bottom right in image, putting it here or at bottom) Wait, Y tế is a tab or a card? In image it is a card next to "Thành tích". Let's put it back to grid and Timeline here. */}
          
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold">Dòng thời gian trao đổi với phụ huynh</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                {timeline.map((act: any, i: number) => {
                  const timelineIcons: Record<string, any> = {
                    MessageSquare: MessageSquare,
                    Phone: Phone,
                    Bell: Bell
                  };
                  const ActIcon = timelineIcons[act.icon] || MessageSquare;
                  return (
                    <div key={i} className="relative pl-8">
                      <div className={cn("absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-white z-10 ring-4 ring-white dark:ring-slate-950", act.color)}>
                        <ActIcon className="h-3 w-3" />
                      </div>
                      {i !== timeline.length - 1 && <div className="absolute left-[11px] top-4 h-[calc(100%+16px)] w-[2px] bg-slate-100 dark:bg-slate-800" />}
                      
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</p>
                        <span className="text-[9px] text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-1">{act.desc}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1"><UserCircle className="h-3 w-3" /> {act.user}</p>
                    </div>
                  );
                })}
                {timeline.length === 0 && (
                  <p className="text-slate-400 text-xs italic">Chưa có hoạt động trao đổi nào</p>
                )}
              </div>
              <div className="mt-6 text-center">
                <Button variant="ghost" className="text-xs font-bold text-blue-600 h-auto p-0" onClick={() => setHienTimelineDialog(true)}>
                  Xem toàn bộ lịch sử trao đổi <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Y Tế Card moved to sidebar since grid only has 2 cols and is full */}
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold">Y tế & Sức khỏe</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex gap-4">
               <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30 flex flex-col justify-center items-center shrink-0">
                  <HeartPulse className="h-6 w-6 text-blue-500 mb-1" />
                </div>
                <div className="flex-1 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-slate-500">Tình trạng sức khỏe</span><span className="font-bold text-emerald-600">{health.status || 'Tốt'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-slate-500">Chiều cao / Cân nặng</span><span className="font-bold text-slate-700">{health.height || '170 cm'} / {health.weight || '60 kg'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-slate-500">Nhóm máu</span><span className="font-bold text-slate-700">{health.bloodType || 'O+'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cảnh báo y tế</span><span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {health.warning || 'Không có'}</span>
                  </div>
                </div>
            </CardContent>
          </Card>

        </div>

      </div>

      <Dialog
        open={hienTuyChinh}
        onOpenChange={setHienTuyChinh}
        title="Tùy chỉnh hồ sơ học sinh"
        description="Các tùy chọn này áp dụng ngay trên màn hình hiện tại."
      >
        <div className="space-y-4 text-sm">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <span>
              <span className="block font-bold text-slate-900 dark:text-white">Ẩn lớp trong danh sách học sinh</span>
              <span className="text-xs text-slate-500">Giữ nhóm lớp, chỉ ẩn hậu tố lớp cạnh tên.</span>
            </span>
            <input type="checkbox" checked={tuyChinhAnLop} onChange={(e) => setTuyChinhAnLop(e.target.checked)} className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <span>
              <span className="block font-bold text-slate-900 dark:text-white">Ẩn điểm trung bình</span>
              <span className="text-xs text-slate-500">Dùng khi trình chiếu hoặc chia sẻ màn hình.</span>
            </span>
            <input type="checkbox" checked={tuyChinhAnGPA} onChange={(e) => setTuyChinhAnGPA(e.target.checked)} className="h-4 w-4" />
          </label>
        </div>
      </Dialog>

      <Dialog
        open={hienTimelineDialog}
        onOpenChange={setHienTimelineDialog}
        title="Toàn bộ lịch sử trao đổi phụ huynh"
        description={`${currentStudent.name} • ${currentStudent.className}`}
        className="max-w-3xl"
      >
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {timeline.length > 0 ? timeline.map((act: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-slate-900 dark:text-white">{act.title}</p>
                <span className="text-xs text-slate-400">{act.time}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{act.desc}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><UserCircle className="h-3 w-3" /> {act.user}</p>
            </div>
          )) : (
            <p className="text-sm italic text-slate-400">Chưa có hoạt động trao đổi nào.</p>
          )}
        </div>
      </Dialog>
    </div>
  );
}
