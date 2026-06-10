import React, { useState, useMemo } from 'react';
import { Target, Search, Plus, Award, User, Star, AlertTriangle, CheckCircle2, ClipboardList, BookOpen } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class: string;
  avatar: string;
  gpa: number;
  attendanceRate: number; // e.g. 92%
  conduct: 'TỐT' | 'KHÁ' | 'TRUNG BÌNH';
  extracurriculars: string[];
  scholarship: string; // e.g. "Học bổng 50% tài năng"
  awards: string[];
  disciplineLogs: string[];
  needSupport: boolean;
}

export default function StudentSuccessHub() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'student_1',
      name: 'Nguyễn Hoàng Lâm',
      class: '10A1',
      avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face',
      gpa: 8.8,
      attendanceRate: 98,
      conduct: 'TỐT',
      extracurriculars: ['CLB Robotics', 'Đội bóng rổ trường'],
      scholarship: 'Học bổng 30% Đa Trí Tuệ',
      awards: ['Giải Nhất Khoa học kỹ thuật cấp Quận', 'Học sinh Tiêu biểu Học kỳ I'],
      disciplineLogs: [],
      needSupport: false
    },
    {
      id: 'student_2',
      name: 'Phạm Minh Hằng',
      class: '11B2',
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop&crop=face',
      gpa: 4.8,
      attendanceRate: 82,
      conduct: 'KHÁ',
      extracurriculars: ['CLB Âm nhạc'],
      scholarship: 'Không',
      awards: [],
      disciplineLogs: ['Cảnh cáo nghỉ học không lý do 3 lần'],
      needSupport: true
    },
    {
      id: 'student_3',
      name: 'Đỗ Tiến Đạt',
      class: '12A5',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      gpa: 9.2,
      attendanceRate: 99,
      conduct: 'TỐT',
      extracurriculars: ['CLB Khởi nghiệp trẻ', 'Đại sứ thương hiệu trường'],
      scholarship: 'Học bổng 100% Chủ tịch Hội đồng trường',
      awards: ['Huy chương Đồng cuộc thi Lập trình Tin học Trẻ cấp Thành phố'],
      disciplineLogs: [],
      needSupport: false
    },
    {
      id: 'student_4',
      name: 'Lê Khánh Linh',
      class: '10A2',
      avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
      gpa: 7.5,
      attendanceRate: 95,
      conduct: 'TỐT',
      extracurriculars: ['CLB Hội họa'],
      scholarship: 'Không',
      awards: ['Học sinh Tiến tiến'],
      disciplineLogs: [],
      needSupport: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('student_1');
  const [profileTab, setProfileTab] = useState<'ACADEMIC' | 'ACTIVITIES' | 'AWARDS_SUPPORT'>('ACADEMIC');

  // Input states for adding behavior/scholarship log
  const [newAwardText, setNewAwardText] = useState('');
  const [newDisciplineText, setNewDisciplineText] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.class.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, searchQuery]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const stats = useMemo(() => {
    const total = students.length;
    const supportCount = students.filter(s => s.needSupport).length;
    const avgGpa = Number((students.reduce((sum, s) => sum + s.gpa, 0) / total).toFixed(1));
    const avgAttendance = Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / total);

    return { total, supportCount, avgGpa, avgAttendance };
  }, [students]);

  const handleAddAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !newAwardText.trim()) return;

    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentId) {
        return {
          ...s,
          awards: [...s.awards, newAwardText.trim()]
        };
      }
      return s;
    }));
    setNewAwardText('');
  };

  const handleAddDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !newDisciplineText.trim()) return;

    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentId) {
        return {
          ...s,
          disciplineLogs: [...s.disciplineLogs, newDisciplineText.trim()],
          needSupport: true // automatically flag for support if disciplined
        };
      }
      return s;
    }));
    setNewDisciplineText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1 w-fit">
            <Star className="w-3.5 h-3.5 text-indigo-400" />
            Student Success
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Student Success System (Hệ thống Học sinh)</h2>
          <p className="text-xs text-slate-350 max-w-3xl font-light leading-relaxed">
            Hồ sơ học sinh 360° tích hợp điểm số, chuyên cần, nề nếp và các hoạt động ngoại khóa để đưa ra cảnh báo sớm học vụ kịp thời.
          </p>
        </div>
      </div>

      {/* Student Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Sĩ số học sinh</span>
          <strong className="text-2xl font-display font-black text-slate-900 dark:text-white mt-1.5 block">{stats.total} <span className="text-xs text-slate-400 font-bold font-sans">học sinh</span></strong>
          <span className="text-[10.5px] text-slate-500 mt-1 block">Toàn trường hiện tại</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Điểm GPA trung bình</span>
          <strong className="text-2xl font-display font-black text-indigo-600 mt-1.5 block">{stats.avgGpa} <span className="text-xs text-slate-400 font-bold font-sans">/ 10</span></strong>
          <span className="text-[10.5px] text-slate-500 mt-1 block">Hiệu suất học tập trung bình</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Tỷ lệ chuyên cần chung</span>
          <strong className="text-2xl font-display font-black text-emerald-600 mt-1.5 block">{stats.avgAttendance}%</strong>
          <span className="text-[10.5px] text-emerald-600 font-bold mt-1 block">Đạt mục tiêu trường học đề ra</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Cần hỗ trợ học vụ</span>
          <strong className="text-2xl font-display font-black text-rose-600 mt-1.5 block">{stats.supportCount} <span className="text-xs text-slate-400 font-bold font-sans">học sinh</span></strong>
          <span className="text-[10.5px] text-rose-600 font-bold mt-1 block">GPA trễ hoặc vắng học nhiều</span>
        </div>
      </div>

      {/* Main Grid: Student list on left, 360 profile on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: student search & directory */}
        <div className="lg:col-span-4 bg-white border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
              placeholder="Tìm học sinh hoặc lớp..."
            />
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                  selectedStudentId === student.id
                    ? 'border-indigo-500 bg-indigo-50/20'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{student.name}</h4>
                  <span className="text-[10px] text-slate-400 block font-mono">Lớp: {student.class}</span>
                </div>
                {student.needSupport && (
                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8.5px] font-black rounded-md uppercase font-mono tracking-wider">
                    Cảnh báo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column: student 360 detailed card */}
        <div className="lg:col-span-8">
          {selectedStudent ? (
            <div className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
              {/* Profile Card Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-200/60 flex items-center gap-4">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      {selectedStudent.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-650 text-[10px] font-bold rounded-lg font-mono">
                      Lớp: {selectedStudent.class}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Học bổng: <span className="text-indigo-650 font-bold">{selectedStudent.scholarship}</span></span>
                </div>
              </div>

              {/* Profile Tabs */}
              <div className="flex border-b border-slate-100 text-xs font-bold text-slate-500 bg-white">
                <button
                  onClick={() => setProfileTab('ACADEMIC')}
                  className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                    profileTab === 'ACADEMIC' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  GPA &amp; Chuyên cần
                </button>
                <button
                  onClick={() => setProfileTab('ACTIVITIES')}
                  className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                    profileTab === 'ACTIVITIES' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Ngoại khóa &amp; CLB
                </button>
                <button
                  onClick={() => setProfileTab('AWARDS_SUPPORT')}
                  className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                    profileTab === 'AWARDS_SUPPORT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Khen thưởng &amp; Kỷ luật
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 space-y-4">
                
                {selectedStudent.needSupport && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-black uppercase tracking-wider text-[9px] mb-1">Cảnh báo hỗ trợ học vụ:</strong>
                      GPA học kỳ thấp (dưới 5.0) hoặc tỷ lệ chuyên cần vắng quá hạn định mức (dưới 85%). Yêu cầu Giáo viên chủ nhiệm liên hệ phụ huynh.
                    </div>
                  </div>
                )}

                {/* Tab: ACADEMIC */}
                {profileTab === 'ACADEMIC' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono">Điểm GPA năm học</span>
                      <strong className="text-xl font-display font-black text-slate-850 block mt-0.5">{selectedStudent.gpa} / 10</strong>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono">Tỷ lệ chuyên cần</span>
                      <strong className="text-xl font-display font-black text-slate-850 block mt-0.5">{selectedStudent.attendanceRate}%</strong>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-slate-400 block font-mono">Hạnh kiểm xếp loại</span>
                      <strong className="text-xl font-display font-black text-slate-850 block mt-0.5">{selectedStudent.conduct}</strong>
                    </div>
                  </div>
                )}

                {/* Tab: ACTIVITIES */}
                {profileTab === 'ACTIVITIES' && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Hoạt động ngoại khóa &amp; CLB đã tham gia</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.extracurriculars.map((act, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-xl font-bold border border-indigo-150">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: AWARDS */}
                {profileTab === 'AWARDS_SUPPORT' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Khen thưởng thành tích</span>
                      {selectedStudent.awards.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Chưa ghi nhận giải thưởng học kỳ.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {selectedStudent.awards.map((aw, idx) => (
                            <div key={idx} className="p-2 bg-emerald-50 border border-emerald-150 text-emerald-800 text-[11px] rounded-lg font-bold flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-emerald-600" />
                              <span>{aw}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Lịch sử kỷ luật nề nếp</span>
                      {selectedStudent.disciplineLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Chưa ghi nhận vi phạm nề nếp bán trú.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {selectedStudent.disciplineLogs.map((dp, idx) => (
                            <div key={idx} className="p-2 bg-rose-50 border border-rose-150 text-rose-800 text-[11px] rounded-lg font-semibold flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              <span>{dp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interactive forms to add logs */}
                    <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Add award form */}
                      <form onSubmit={handleAddAward} className="space-y-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Ghi danh khen thưởng</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={newAwardText}
                            onChange={(e) => setNewAwardText(e.target.value)}
                            placeholder="Tên giải thưởng / danh hiệu..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Thêm
                          </button>
                        </div>
                      </form>

                      {/* Add discipline form */}
                      <form onSubmit={handleAddDiscipline} className="space-y-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Ghi nhận vi phạm</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={newDisciplineText}
                            onChange={(e) => setNewDisciplineText(e.target.value)}
                            placeholder="Mô tả vi phạm nề nếp..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Ghi nhận
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-450 italic">
              Vui lòng chọn một học sinh trong danh sách bên trái để xem Hồ sơ 360 độ.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
