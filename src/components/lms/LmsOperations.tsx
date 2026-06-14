'use client';

import React, { useState, useMemo } from 'react';
import { 
  Video, Plus, RefreshCw, BookOpenCheck, FileSpreadsheet, BookOpen, Calculator, Bookmark, ChevronRight, Calendar
} from 'lucide-react';
import { UserProfile } from '../../types';
import { ALL_VIETNAM_SUBJECT_NAMES, VIETNAM_GRADE_LEVELS, getSubjectsForClassName } from '../../utils/vietnameseCurriculum';
import { exportToCsv } from '../../utils/exportUtils';

interface LmsStudent {
  id: string;
  name: string;
  className: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  parentName: string;
  parentPhone?: string;
  parentEmail: string;
  parentGender?: string;
  emergencyContact?: string;
  address?: string;
}

interface ReviewAssignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  teacher: string;
  deadline: string;
  durationMinutes: number;
  questionIds: number[];
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

interface ReviewSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
}

interface QuizQuestionOption {
  label: string;
  text: string;
}

interface QuizQuestion {
  id: number;
  q: string;
  options: QuizQuestionOption[];
  correct: string;
  subject?: string;
  grade?: string;
  topic?: string;
  difficulty?: 'NB' | 'TH' | 'VD';
  explanation?: string;
}

interface LmsOperationsProps {
  currentUser: UserProfile;
  lmsStudents: LmsStudent[];
  lang: 'VI' | 'EN';
  t: any;
  syncHistory: any[];
  reviewAssignments: ReviewAssignment[];
  setReviewAssignments: React.Dispatch<React.SetStateAction<ReviewAssignment[]>>;
  reviewSubmissions: ReviewSubmission[];
  setReviewSubmissions: React.Dispatch<React.SetStateAction<ReviewSubmission[]>>;
  quizQuestions: QuizQuestion[];
  setQuizQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  zoomClasses: any[];
  setZoomClasses: React.Dispatch<React.SetStateAction<any[]>>;
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS';
  syncProgress: number;
  syncLogs: string[];
  showSyncModal: boolean;
  setShowSyncModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleStartSync: () => void;
}

export default function LmsOperations({
  currentUser,
  lmsStudents = [],
  lang,
  t,
  syncHistory = [],
  reviewAssignments = [],
  setReviewAssignments,
  reviewSubmissions = [],
  setReviewSubmissions,
  quizQuestions = [],
  setQuizQuestions,
  zoomClasses = [],
  setZoomClasses,
  syncStatus,
  syncProgress,
  syncLogs,
  showSyncModal,
  setShowSyncModal,
  handleStartSync,
}: LmsOperationsProps) {
  // Local states for Review assignments
  const [showCreateReviewForm, setShowCreateReviewForm] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState<string>(reviewAssignments[0]?.id || '');
  const [newReviewData, setNewReviewData] = useState({
    title: '',
    subject: 'Toán',
    className: 'Lớp 10A1',
    deadline: new Date().toISOString().split('T')[0],
    durationMinutes: 30,
    selectedQuestionIds: [] as number[],
  });

  const reviewSubjectOptions = getSubjectsForClassName(newReviewData.className);

  // States for Zoom
  const [zoomActiveId, setZoomActiveId] = useState<string | null>(null);
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [newClassData, setNewClassData] = useState({
    title: '',
    subject: 'Toán',
    teacher: '',
    time: '08:00 - 09:30',
    classStatus: 'SCHEDULED',
  });
  const [attendanceLogs, setAttendanceLogs] = useState<Record<string, boolean>>({});

  // States for MCQ test
  const [showAddMcqForm, setShowAddMcqForm] = useState(false);
  const [newMcqData, setNewMcqData] = useState({
    q: '',
    A: '',
    B: '',
    C: '',
    correct: 'A',
    subject: 'Toán',
    grade: 'Lớp 10',
    topic: '',
    difficulty: 'NB' as 'NB' | 'TH' | 'VD',
    explanation: '',
  });
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // LaTeX editor state
  const [equationCode, setEquationCode] = useState<string>(
    'f(x) = \\int_{a}^{b} \\frac{x^2 + \\sin(x)}{\\sqrt{3y}} dx'
  );

  const insertMathSnippet = (snippet: string) => {
    setEquationCode(prev => prev + ' ' + snippet);
  };

  const renderMathPreview = () => {
    return (
      <div className="bg-slate-900 border border-slate-800 text-emerald-400 p-4 rounded-xl min-h-[70px] flex items-center justify-center font-mono text-xs overflow-auto">
        <div className="text-center">
          <span className="text-[10px] text-slate-500 block mb-1">LaTeX Compiled Output (Khôi Công Thức):</span>
          <span className="text-sm tracking-wide font-sans text-white border-b border-indigo-500/30 pb-0.5 select-all font-mono">
            {equationCode}
          </span>
        </div>
      </div>
    );
  };

  const activeReview = reviewAssignments.find(item => item.id === activeReviewId) || reviewAssignments[0];
  const activeReviewQuestions = activeReview
    ? quizQuestions.filter(question => activeReview.questionIds.includes(question.id))
    : [];
  const activeReviewStudents = activeReview
    ? lmsStudents.filter(student => student.className === activeReview.className)
    : [];
  const activeReviewSubmissions = activeReview
    ? reviewSubmissions.filter(submission => submission.assignmentId === activeReview.id)
    : [];

  const completionRate = activeReviewStudents.length > 0
    ? Math.round((activeReviewSubmissions.length / activeReviewStudents.length) * 100)
    : 0;
  const averageScore = activeReviewSubmissions.length > 0
    ? Math.round(activeReviewSubmissions.reduce((sum, item) => sum + item.score, 0) / activeReviewSubmissions.length)
    : 0;
  const topicSummary = activeReviewQuestions.reduce<Record<string, number>>((acc, question) => {
    const topic = question.topic || 'Chưa phân loại';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});

  const handleCreateReviewAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewData.title.trim() || newReviewData.selectedQuestionIds.length === 0) return;

    const nextNumber = reviewAssignments.length + 1;
    const assignment: ReviewAssignment = {
      id: `RV${String(nextNumber).padStart(3, '0')}`,
      title: newReviewData.title.trim(),
      subject: newReviewData.subject,
      className: newReviewData.className,
      teacher: currentUser.name,
      deadline: newReviewData.deadline,
      durationMinutes: Number(newReviewData.durationMinutes) || 30,
      questionIds: newReviewData.selectedQuestionIds,
      status: 'PUBLISHED',
    };

    setReviewAssignments(prev => [assignment, ...prev]);
    setActiveReviewId(assignment.id);
    setNewReviewData({
      title: '',
      subject: 'Toán',
      className: 'Lớp 10A1',
      deadline: new Date().toISOString().split('T')[0],
      durationMinutes: 30,
      selectedQuestionIds: [],
    });
    setShowCreateReviewForm(false);
  };

  const toggleReviewQuestion = (questionId: number) => {
    setNewReviewData(prev => ({
      ...prev,
      selectedQuestionIds: prev.selectedQuestionIds.includes(questionId)
        ? prev.selectedQuestionIds.filter(id => id !== questionId)
        : [...prev.selectedQuestionIds, questionId],
    }));
  };

  const handleSimulateSubmission = (student: LmsStudent) => {
    if (!activeReview || activeReviewQuestions.length === 0) return;
    const alreadySubmitted = reviewSubmissions.some(
      submission => submission.assignmentId === activeReview.id && submission.studentId === student.id
    );
    if (alreadySubmitted) return;

    const seed = student.id.charCodeAt(student.id.length - 1) + activeReview.id.charCodeAt(activeReview.id.length - 1);
    const totalQuestions = activeReviewQuestions.length;
    const correctCount = Math.max(1, Math.min(totalQuestions, seed % (totalQuestions + 1)));
    const submission: ReviewSubmission = {
      id: `SUB${Date.now()}`,
      assignmentId: activeReview.id,
      studentId: student.id,
      studentName: student.name,
      submittedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
      score: Math.round((correctCount / totalQuestions) * 100),
      correctCount,
      totalQuestions,
    };

    setReviewSubmissions(prev => [submission, ...prev]);
  };

  const handleExportReviewReport = () => {
    if (!activeReview) return;
    const headers = ['Bài ôn tập', 'Học sinh', 'Lớp', 'Trạng thái', 'Điểm', 'Số câu đúng', 'Thời gian nộp', 'Email phụ huynh'];
    const rows = activeReviewStudents.map(student => {
      const submission = activeReviewSubmissions.find(item => item.studentId === student.id);
      return [
        activeReview.title,
        student.name,
        student.className,
        submission ? 'Đã nộp' : 'Chưa nộp',
        String(submission?.score ?? ''),
        submission ? `${submission.correctCount}/${submission.totalQuestions}` : '',
        submission?.submittedAt ?? '',
        student.parentEmail,
      ];
    });
    exportToCsv(`Bao_cao_on_tap_${activeReview.id}.csv`, headers, rows);
  };

  const handleEvaluateQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach(q => {
      if (userQuizAnswers[q.id] === q.correct) {
        correctCount += 1;
      }
    });
    const finalScore = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;
    setQuizScore(finalScore);
  };

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* Phân hệ Liên thông dữ liệu quốc gia EMIS & vnEdu */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-indigo-900 text-white rounded-2xl border border-emerald-500/20 shadow-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div className="space-y-1.5 max-w-3xl">
          <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-teal-200 text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
            🌐 LIÊN THÔNG CƠ SỞ DỮ LIỆU QUỐC GIA
          </span>
          <h3 className="font-display font-black text-white text-base">
            Cổng Đồng bộ Dữ liệu Học bạ EMIS / vnEdu
          </h3>
          <p className="text-xs text-emerald-100/80 leading-relaxed font-light">
            Đồng bộ hóa tức thời thông tin hồ sơ lớp học, sổ điểm số điện tử học bạ và chuyên cần chuyên môn với hệ thống CSDL của Bộ Giáo dục &amp; Đào tạo.
          </p>
          {syncHistory.length > 0 && (
            <div className="text-[10px] text-teal-200 flex items-center gap-2 mt-1">
              <span>🔄 Lần đồng bộ cuối: <strong>{syncHistory[0].date}</strong> bởi <strong>{syncHistory[0].operator}</strong> ({syncHistory[0].records} bản ghi).</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleStartSync}
          className="w-full md:w-auto px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-700 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
          <span>Bắt đầu đồng bộ ngay</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* E-Learning, Scheduled Class hours & Attendance Tracker */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-start gap-3 flex-wrap">
              <div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <BookOpenCheck className="text-emerald-600 w-4.5 h-4.5" />
                  Trung tâm Ôn tập trực tuyến
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-450">
                  Giao bài ôn tập theo lớp, tự chấm trắc nghiệm, theo dõi học sinh chưa nộp và xuất báo cáo gửi giáo viên/phụ huynh.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportReviewReport}
                  className="px-2.5 py-1 text-[10.5px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-205 dark:hover:bg-slate-750 rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Xuất báo cáo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateReviewForm(prev => !prev)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1 shadow-3xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showCreateReviewForm ? 'Đóng' : 'Tạo bài ôn tập'}
                </button>
              </div>
            </div>

            {showCreateReviewForm && (
              <form onSubmit={handleCreateReviewAssignment} className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">Tên bài ôn tập</label>
                    <input
                      required
                      value={newReviewData.title}
                      onChange={(e) => setNewReviewData({ ...newReviewData, title: e.target.value })}
                      placeholder="Ví dụ: Ôn tập Toán 10 - Hàm số bậc hai"
                      className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">Môn học</label>
                      <select
                        value={newReviewData.subject}
                        onChange={(e) => setNewReviewData({ ...newReviewData, subject: e.target.value })}
                        className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 cursor-pointer"
                      >
                        {reviewSubjectOptions.map(subject => (
                          <option key={`${subject.name}-${subject.type}`} value={subject.name}>
                            {subject.name} ({subject.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">Lớp</label>
                      <select
                        value={newReviewData.className}
                        onChange={(e) => {
                          const nextSubjects = getSubjectsForClassName(e.target.value);
                          setNewReviewData({
                            ...newReviewData,
                            className: e.target.value,
                            subject: nextSubjects.some(subject => subject.name === newReviewData.subject)
                              ? newReviewData.subject
                              : nextSubjects[0]?.name || 'Toán',
                          });
                        }}
                        className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 cursor-pointer"
                      >
                        {VIETNAM_GRADE_LEVELS.map(level => (
                          <option key={level}>{level}A1</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">Deadline</label>
                    <input
                      type="date"
                      value={newReviewData.deadline}
                      onChange={(e) => setNewReviewData({ ...newReviewData, deadline: e.target.value })}
                      className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-505 dark:text-slate-400 block mb-1">Thời gian làm bài (Phút)</label>
                    <input
                      type="number"
                      min={5}
                      value={newReviewData.durationMinutes}
                      onChange={(e) => setNewReviewData({ ...newReviewData, durationMinutes: Number(e.target.value) })}
                      className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-2">Chọn câu hỏi từ ngân hàng</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {quizQuestions.map(question => {
                      const selected = newReviewData.selectedQuestionIds.includes(question.id);
                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => toggleReviewQuestion(question.id)}
                          className={`text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                            selected
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-400 font-bold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <span className="block font-bold line-clamp-1">{question.q}</span>
                          <span className="text-[9.5px] text-slate-400 dark:text-slate-500">{question.subject || 'Chưa phân môn'} · {question.topic || 'Chưa phân loại'} · {question.difficulty || 'NB'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateReviewForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-805 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Giao bài
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {reviewAssignments.map(assignment => {
                  const isActive = assignment.id === activeReview?.id;
                  const submissionCount = reviewSubmissions.filter(item => item.assignmentId === assignment.id).length;
                  return (
                    <button
                      key={assignment.id}
                      type="button"
                      onClick={() => setActiveReviewId(assignment.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 shadow-3xs' : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900'
                      }`}
                    >
                      <span className="block text-xs font-black text-slate-850 dark:text-white line-clamp-2">{assignment.title}</span>
                      <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-450">{assignment.className} · {assignment.subject} · hạn {assignment.deadline}</span>
                      <span className="mt-2 inline-flex text-[9px] font-bold rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-slate-600 dark:text-slate-350">
                        {submissionCount} bài đã nộp
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/10 p-4 space-y-4">
                {activeReview ? (
                  <>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{activeReview.title}</h4>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-450">
                          {activeReview.className} · {activeReview.subject} · {activeReview.durationMinutes} phút · {activeReviewQuestions.length} câu hỏi
                        </p>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                        activeReview.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {activeReview.status === 'PUBLISHED' ? 'Đang giao' : activeReview.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Hoàn thành</span>
                        <strong className="block text-xl text-emerald-700 dark:text-emerald-450">{completionRate}%</strong>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Điểm TB</span>
                        <strong className="block text-xl text-indigo-700 dark:text-indigo-400">{averageScore}</strong>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Chưa nộp</span>
                        <strong className="block text-xl text-rose-700 dark:text-rose-455">{Math.max(activeReviewStudents.length - activeReviewSubmissions.length, 0)}</strong>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="text-left px-3 py-2">Học sinh</th>
                            <th className="text-left px-3 py-2">Phụ huynh</th>
                            <th className="text-center px-3 py-2">Trạng thái</th>
                            <th className="text-center px-3 py-2">Điểm</th>
                            <th className="text-right px-3 py-2">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {activeReviewStudents.map(student => {
                            const submission = activeReviewSubmissions.find(item => item.studentId === student.id);
                            return (
                              <tr key={student.id}>
                                <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-250">{student.name}</td>
                                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{student.parentName}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${submission ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                                    {submission ? 'Đã nộp' : 'Chưa nộp'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                  {submission ? `${submission.score}/100` : '-'}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {submission ? (
                                    <span className="text-[10px] text-slate-400">{submission.submittedAt}</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSimulateSubmission(student)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                                    >
                                      Ghi nhận nộp
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-955/20 p-3 text-[10.5px] text-amber-900 dark:text-amber-400 font-medium">
                      <strong className="block mb-1">Phân tích năng lực:</strong>
                      {Object.keys(topicSummary).length > 0
                        ? `Bài này đang kiểm tra các chủ đề: ${Object.entries(topicSummary).map(([topic, count]) => `${topic} (${count} câu)`).join(', ')}. Hệ thống nên nhắc phụ huynh/học sinh chưa nộp trước deadline và gợi ý ôn lại các chủ đề điểm thấp.`
                        : 'Chưa có câu hỏi để phân tích.'}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">Chưa có bài ôn tập trực tuyến nào được giao.</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Visual classrooms list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-display font-black text-slate-905 dark:text-white text-sm flex items-center gap-1.5">
                  <BookOpen className="text-emerald-600 w-4.5 h-4.5" />
                  {t.eLearning}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-450">Mở phòng Online Zoom, xuất dữ liệu điểm danh, theo sát giờ dạy giáo viên liên tục.</p>
              </div>
              <button
                onClick={() => setShowAddClassForm(!showAddClassForm)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1 shadow-3xs cursor-pointer"
              >
                <span>➕ {showAddClassForm ? "Đóng bản đăng ký" : "Lên lịch Zoom mới"}</span>
              </button>
            </div>

            {/* Add Class Form */}
            {showAddClassForm && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newClassData.title || !newClassData.teacher) return;
                  const newCls = {
                    id: `ZM10${zoomClasses.length + 3}`,
                    title: newClassData.title,
                    subject: newClassData.subject,
                    teacher: newClassData.teacher,
                    time: newClassData.time,
                    classStatus: newClassData.classStatus,
                    studentsPresent: 0,
                    totalStudents: 30
                  };
                  setZoomClasses([...zoomClasses, newCls]);
                  setNewClassData({ title: '', subject: 'Toán', teacher: '', time: '08:00 - 09:30', classStatus: 'SCHEDULED' });
                  setShowAddClassForm(false);
                }}
                className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-205 dark:border-slate-800 space-y-3 font-sans"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lên lịch phòng học trực tuyến mới</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-450 block">Tên phòng học / Chuyên đề</label>
                    <input 
                      type="text" 
                      placeholder="Toán Chuyên sâu hình giải tích..." 
                      value={newClassData.title}
                      onChange={(e) => setNewClassData({...newClassData, title: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-450 block">Môn học</label>
                      <select 
                        value={newClassData.subject}
                        onChange={(e) => setNewClassData({...newClassData, subject: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-805 dark:text-slate-200 cursor-pointer"
                      >
                        {ALL_VIETNAM_SUBJECT_NAMES.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-450 block font-sans">Trạng thái</label>
                      <select 
                        value={newClassData.classStatus}
                        onChange={(e) => setNewClassData({...newClassData, classStatus: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-805 dark:text-slate-200 font-semibold cursor-pointer"
                      >
                        <option value="SCHEDULED">Đã Lên lịch</option>
                        <option value="LIVE">Phát trực tiếp</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-450 block">Tên giảng viên phụ trách</label>
                    <input 
                      type="text" 
                      placeholder="Cô Thanh Nhàn..." 
                      value={newClassData.teacher}
                      onChange={(e) => setNewClassData({...newClassData, teacher: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-450 block">Giờ dạy dự kiến</label>
                    <input 
                      type="text" 
                      placeholder="08:00 - 09:30" 
                      value={newClassData.time}
                      onChange={(e) => setNewClassData({...newClassData, time: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={() => setShowAddClassForm(false)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 rounded text-xs font-semibold cursor-pointer"
                  >
                    Huỷ bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs font-bold cursor-pointer shadow-3xs"
                  >
                    Tạo buổi học
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {zoomClasses.map(cls => {
                const isLive = cls.classStatus === 'LIVE';
                const isActiveView = zoomActiveId === cls.id;

                return (
                  <div 
                    key={cls.id}
                    className={`p-4 border rounded-2xl transition-all ${
                      isActiveView 
                        ? 'border-emerald-600 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-2xs' 
                        : 'border-slate-150 dark:border-slate-800 hover:border-slate-250 bg-slate-50/25 dark:bg-slate-950/20'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="space-y-1">
                        <span className={`text-[8.5px] px-2 py-0.5 font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                          isLive ? 'bg-rose-500 text-white animate-pulse animate-duration-1000' : 'bg-slate-205 dark:bg-slate-800 text-slate-700 dark:text-slate-350'
                        }`}>
                          <Video className="w-2.5 h-2.5" />
                          {isLive ? 'Trực tiếp lớp học' : 'Lên lịch học'}
                        </span>

                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{cls.title}</h4>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-450 font-sans">
                          Giảng viên: <strong className="text-slate-750 dark:text-slate-300">{cls.teacher}</strong> | Giờ dạy: {cls.time}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {isLive ? (
                          <button
                            onClick={() => setZoomActiveId(isActiveView ? null : cls.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Vào học Zoom trực tuyến
                          </button>
                        ) : (
                          <button
                            onClick={() => alert("Phòng học chưa mở. Bạn chỉ có thể kích hoạt khi tới thời gian chỉ định.")}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Mở Link lịch học
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Student Attendance tracker list below class drawer */}
                    {isActiveView && (
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 animate-scale-up space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">📝 Bảng điểm danh tự động kết nối API Zoom:</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-450 font-semibold">Tích hợp AI nhận diện gương mặt</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                          {[
                            { id: 'std1', name: 'Nguyễn Minh Quân' },
                            { id: 'std2', name: 'Trần Mỹ Lệ' },
                            { id: 'std3', name: 'Phạm Hồng Thái' },
                            { id: 'std4', name: 'Hoàng Thùy Dương' }
                          ].map(std => {
                            const isPresent = attendanceLogs[std.id] ?? false;
                            return (
                              <div 
                                key={std.id}
                                onClick={() => setAttendanceLogs({ ...attendanceLogs, [std.id]: !isPresent })}
                                className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  isPresent ? 'bg-emerald-500/5 border-emerald-200 text-slate-800 dark:text-slate-200 font-semibold' : 'bg-rose-550/5 border-rose-205 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <span>{std.name}</span>
                                <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-2.5 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-[10px] text-emerald-800 dark:text-emerald-400 leading-snug">
                          <strong>✓ Điểm danh hoàn tất:</strong> Đã ghi nhận 3/4 học viên có mặt trong luồng Zoom học thuật. Báo cáo chấm công dạy học tự động cộng 1.5 giờ công cho {cls.teacher}.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teachers load hours metrics substitute system */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Calendar className="text-emerald-600 w-4.5 h-4.5" />
                Lịch dạy &amp; Đăng ký dạy bù học kỳ II
              </h3>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-450">Giám sát tải công việc, phân vai nghỉ phép hoặc bù tiết kịp thời.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/30 space-y-2">
                <span className="text-[9px] uppercase tracking-wide font-bold text-amber-600">Đơn xin nghỉ - dạy thế</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">Cô Thanh Nhàn đề nghị nghỉ thứ 6 (05/6) nghỉ phép cá nhân.</p>
                <p className="text-[10.5px] text-slate-505 dark:text-slate-450">Người dạy thế đề xuất: <strong>Thầy Đức Nam</strong></p>
                <div className="flex gap-1.5 pt-1">
                  <button 
                    onClick={() => alert("Đã duyệt bàn giao lịch phân tổ thành công.")}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer"
                  >
                    Phê duyệt
                  </button>
                  <button 
                    onClick={() => alert("Vui lòng nhập lý do từ chối.")}
                    className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-bold rounded hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Khước từ
                  </button>
                </div>
              </div>

              <div className="p-3 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/30 space-y-2">
                <span className="text-[9px] uppercase tracking-wide font-bold text-emerald-600">Hàng tuần: Định mức dạy</span>
                <div className="space-y-1.5 text-[11px] font-sans">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Cô Thanh Nhàn:</span>
                    <strong>42 / 40 giờ dạy chuẩn ✓</strong>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Thầy Đức Nam:</span>
                    <strong>50 / 40 giờ dạy (Over 10h) ⏰</strong>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Thầy Quốc Đạt:</span>
                    <strong>38 / 40 giờ dạy (-2h) ⚠️</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Online MCQ grading exam & Math components */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Math/Physics/Chemistry visual editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Calculator className="text-emerald-600 w-4.5 h-4.5" />
                {t.mathEditor}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-450">Người dạy có thể nhấp chọn nhanh ký hiệu để chèn công thức chuyên khoa vào ngân hàng câu hỏi đề thi.</p>
            </div>

            {/* Math buttons grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Tích phân', code: '\\int_{a}^{b} f(x) dx' },
                  { label: 'Tổng x', code: '\\sum_{i=1}^{n}' },
                  { label: 'Căn thức', code: '\\sqrt{x}' },
                  { label: 'Phân số', code: '\\frac{a}{b}' },
                  { label: 'Lim', code: '\\lim_{x \\to \\infty}' },
                  { label: 'Đạo hàm', code: '\\frac{dy}{dx}' },
                  { label: 'Mũ', code: 'x^{2}' },
                  { label: 'Phương trình', code: 'H_2O + CO_2' }
                ].map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertMathSnippet(btn.code)}
                    className="p-1 px-1.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-700 dark:text-slate-300 font-mono rounded text-center transition-all truncate cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
                    title={btn.code}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mã cấu trúc công thức soạn thảo:</span>
                <textarea
                  rows={2}
                  value={equationCode}
                  onChange={(e) => setEquationCode(e.target.value)}
                  className="w-full text-xs font-mono p-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 resize-none"
                />
              </div>

              {/* Math Render Output */}
              {renderMathPreview()}
            </div>
          </div>

          {/* MCQ test interactive preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Bookmark className="text-emerald-600 w-4.5 h-4.5" />
                  {t.mcqTest}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-450">Mô phỏng bài thi thử năng lực Đa Trí Tuệ trực tuyến - Chấm điểm trực tiếp.</p>
              </div>
              <button
                onClick={() => setShowAddMcqForm(!showAddMcqForm)}
                className="px-2 py-0.5 border border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-[10.5px] font-bold rounded-lg cursor-pointer"
              >
                <span>{showAddMcqForm ? "Đóng ẩn" : "➕ Thêm câu hỏi"}</span>
              </button>
            </div>

            {/* Add MCQ Form */}
            {showAddMcqForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newMcqData.q || !newMcqData.A || !newMcqData.B || !newMcqData.C) return;
                  const newQ = {
                    id: quizQuestions.length + 1,
                    q: newMcqData.q,
                    options: [
                      { label: 'A', text: newMcqData.A },
                      { label: 'B', text: newMcqData.B },
                      { label: 'C', text: newMcqData.C }
                    ],
                    correct: newMcqData.correct,
                    subject: newMcqData.subject,
                    grade: newMcqData.grade,
                    topic: newMcqData.topic || 'Chưa phân loại',
                    difficulty: newMcqData.difficulty,
                    explanation: newMcqData.explanation
                  };
                  setQuizQuestions([...quizQuestions, newQ]);
                  setNewMcqData({
                    q: '',
                    A: '',
                    B: '',
                    C: '',
                    correct: 'A',
                    subject: 'Toán',
                    grade: 'Lớp 10',
                    topic: '',
                    difficulty: 'NB',
                    explanation: '',
                  });
                  setShowAddMcqForm(false);
                }}
                className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mt-2 space-y-3 font-sans"
              >
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-205">Biên soạn câu hỏi mới</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 block">Nội dung câu hỏi</label>
                  <input
                    type="text"
                    placeholder="Nhập câu hỏi (Ví dụ: 8% của 200 bằng bao nhiêu?)..."
                    value={newMcqData.q}
                    onChange={(e) => setNewMcqData({...newMcqData, q: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455">Môn học</label>
                    <select
                      value={newMcqData.subject}
                      onChange={(e) => setNewMcqData({...newMcqData, subject: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-205 cursor-pointer"
                    >
                      {ALL_VIETNAM_SUBJECT_NAMES.map(subject => (
                        <option key={subject}>{subject}</option>
                      ))}
                      <option>Kỹ năng sống</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455">Khối lớp</label>
                    <select
                      value={newMcqData.grade}
                      onChange={(e) => setNewMcqData({...newMcqData, grade: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-205 cursor-pointer"
                    >
                      {VIETNAM_GRADE_LEVELS.map(level => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455">Mức độ</label>
                    <select
                      value={newMcqData.difficulty}
                      onChange={(e) => setNewMcqData({...newMcqData, difficulty: e.target.value as 'NB' | 'TH' | 'VD'})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-205 cursor-pointer"
                    >
                      <option value="NB">Nhận biết</option>
                      <option value="TH">Thông hiểu</option>
                      <option value="VD">Vận dụng</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455">Chủ đề</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đọc hiểu, Hàm số, Từ vựng..."
                      value={newMcqData.topic}
                      onChange={(e) => setNewMcqData({...newMcqData, topic: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455">Lời giải ngắn</label>
                    <input
                      type="text"
                      placeholder="Giải thích đáp án để học sinh xem lại"
                      value={newMcqData.explanation}
                      onChange={(e) => setNewMcqData({...newMcqData, explanation: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455">Phương án A</label>
                    <input
                      type="text"
                      placeholder="Giá trị A"
                      value={newMcqData.A}
                      onChange={(e) => setNewMcqData({...newMcqData, A: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455">Phương án B</label>
                    <input
                      type="text"
                      placeholder="Giá trị B"
                      value={newMcqData.B}
                      onChange={(e) => setNewMcqData({...newMcqData, B: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455">Phương án C</label>
                    <input
                      type="text"
                      placeholder="Giá trị C"
                      value={newMcqData.C}
                      onChange={(e) => setNewMcqData({...newMcqData, C: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-500">Kích hoạt đáp án đúng:</span>
                    <select
                      value={newMcqData.correct}
                      onChange={(e) => setNewMcqData({...newMcqData, correct: e.target.value})}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border rounded text-xs px-2 py-0.5 cursor-pointer"
                    >
                      <option value="A">Đáp án A</option>
                      <option value="B">Đáp án B</option>
                      <option value="C">Đáp án C</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMcqForm(false)}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-755 dark:text-slate-350 hover:bg-slate-305 rounded text-xs font-semibold cursor-pointer"
                    >
                      Huỷ bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs font-bold cursor-pointer"
                    >
                      Nạp câu hỏi
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {quizQuestions.map((q) => (
                <div key={q.id} className="p-3 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                  <span className="text-[9.5px] uppercase font-bold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                    Câu hỏi {q.id}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">{q.subject || 'Chưa phân môn'}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">{q.grade || 'Chưa khối'}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">{q.topic || 'Chưa chủ đề'}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400">{q.difficulty || 'NB'}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{q.q}</p>
                  
                  <div className="space-y-1.5">
                    {q.options.map(o => (
                      <label 
                        key={o.label} 
                        className={`flex items-start gap-2 p-1.5 px-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          userQuizAnswers[q.id] === o.label 
                            ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 font-medium text-emerald-900 dark:text-emerald-400' 
                            : 'border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          checked={userQuizAnswers[q.id] === o.label}
                          onChange={() => setUserQuizAnswers({ ...userQuizAnswers, [q.id]: o.label })}
                          className="mt-1 accent-emerald-600 cursor-pointer"
                        />
                        <span><strong>{o.label}.</strong> {o.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-850">
                {quizScore !== null ? (
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-850 dark:text-slate-200">
                      Kết quả thi: {quizScore}/100 Điểm
                    </p>
                    <p className="text-[10px] text-slate-450 italic">
                      {quizScore >= 100 ? 'Chúc mừng! Đạt chuẩn khen thưởng Đa Trí Tuệ.' : 'Đề nghị liên hệ hỗ trợ nâng điểm học thuật.'}
                    </p>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400">Chọn phương án và bấm chấm điểm...</span>
                )}

                <button
                  type="button"
                  onClick={handleEvaluateQuiz}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-sm cursor-pointer"
                >
                  Chấm Điểm Tự Động
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
