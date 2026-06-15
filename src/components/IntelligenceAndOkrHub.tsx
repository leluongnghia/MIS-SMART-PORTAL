import React, { useState } from 'react';
import { UserProfile, Task, DepartmentOKR, LessonPlanAsset, MIProfile, getSafeAvatar } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { translateOKR } from '../utils/translations';
import { getScoreColorClass, getScoreBgClass, getScoreColorDarkClass } from '../utils/colorUtils';
import { MOCK_USERS } from '../mockData';
import { 
  MOCK_DEPARTMENT_OKRS, 
  enrichUserWithMIDetails, 
  MI_KEY_DETAILS, 
  INITIAL_LESSON_PLANS 
} from '../miAndOkrUtils';
import MIDetailsModal from './MIDetailsModal';
import { 
  Brain, 
  Target, 
  Sparkles, 
  Volume2, 
  Mic, 
  FileCheck, 
  AlertTriangle, 
  BookOpen, 
  ThumbsUp, 
  User, 
  Check, 
  Loader2,
  Send,
  Plus,
  BarChart3,
  TrendingUp,
  Award,
  FileText,
  Activity,
  CheckSquare,
  Printer,
  Download,
  Percent,
  Calendar,
  ClipboardList,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  PieChart, 
  Pie, 
  Cell,
  LabelList
} from 'recharts';

const DEPT_COLORS = [
  { solid: '#4f46e5', light: '#a5b4fc', name: 'Ban Giám hiệu' }, // Indigo
  { solid: '#0284c7', light: '#7dd3fc', name: 'Toán - Tin' },   // Sky
  { solid: '#db2777', light: '#f9a8d4', name: 'Ngữ văn' },     // Pink
  { solid: '#b91c1c', light: '#fca5a5', name: 'Khảo thí' },    // Red
  { solid: '#7c3aed', light: '#c4b5fd', name: 'Phòng Quốc Tế' }, // Violet
  { solid: '#ea580c', light: '#fdba74', name: 'Tuyển sinh & PR' }, // Orange
  { solid: '#d97706', light: '#fcd34d', name: 'Tâm lý & CTHS' }, // Amber
  { solid: '#059669', light: '#6ee7b7', name: 'Hành chính' },  // Emerald/Green
  { solid: '#0891b2', light: '#67e8f9', name: 'Dịch vụ Học đường' }, // Cyan
];

interface IntelligenceAndOkrHubProps {
  currentUser: UserProfile;
  tasks: Task[];
  onAddTask: (taskData: Omit<Task, 'id' | 'comments' | 'history'>) => void;
  users?: UserProfile[];
  onSelectStaffProfile?: (user: UserProfile) => void;
  onAddStaff?: () => void;
}

export default function IntelligenceAndOkrHub({ 
  currentUser, 
  tasks, 
  onAddTask,
  users = [],
  onSelectStaffProfile,
  onAddStaff
}: IntelligenceAndOkrHubProps) {
  const { lang, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'REPORTS' | 'MI_PROFILES' | 'OKRS' | 'AI_CO_PILOT'>('REPORTS');
  const [miDetailsModalDept, setMiDetailsModalDept] = useState<{ id: string, name: string } | null>(null);

  const isDarkModeActive = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const chartTextColor = isDarkModeActive ? '#94a3b8' : '#475569';
  const chartGridColor = isDarkModeActive ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9';

  // Quantitative calculations for departments & academic performance representation
  const DEPARTMENTS_DATA = [
    { id: 'BGH', name: lang === 'vi' ? 'Ban Giám hiệu & Hội đồng Trường' : 'Board & Council', shortName: lang === 'vi' ? 'Ban Giám hiệu' : 'School Board', coreMI: 'interpersonal', desc: lang === 'vi' ? 'Học thuật vĩ mô, chiến lược, kiểm định' : 'Macro academic, strategy, accreditation' },
    { id: 'TOAN_TIN', name: lang === 'vi' ? 'Tổ Chuyên môn Toán - Tin' : 'Math & IT Department', shortName: lang === 'vi' ? 'Toán - Tin' : 'Math & IT', coreMI: 'logical', desc: lang === 'vi' ? 'Toán học lý thuyết & bồi dưỡng STEM' : 'Theoretical math & STEM coaching' },
    { id: 'VAN', name: lang === 'vi' ? 'Tổ Chuyên môn Ngữ văn' : 'Literature Department', shortName: lang === 'vi' ? 'Ngữ văn' : 'Literature', coreMI: 'linguistic', desc: lang === 'vi' ? 'Ngữ văn kịch nghệ, biểu soạn đổi mới' : 'Theatrical literature, innovative syllabus' },
    { id: 'KHAO_THI', name: lang === 'vi' ? 'Phòng Khảo thí & ĐBCL' : 'Testing & Quality Assurance', shortName: lang === 'vi' ? 'Khảo thí' : 'Testing & QA', coreMI: 'logical', desc: lang === 'vi' ? 'Kiểm định chất lượng bộ đề khảo bồi' : 'Quality audit of question bank' },
    { id: 'QUOC_TE', name: lang === 'vi' ? 'Ban Chương trình Quốc tế' : 'International Programs Division', shortName: lang === 'vi' ? 'Phòng Quốc Tế' : 'Int\'l Programs', coreMI: 'linguistic', desc: lang === 'vi' ? 'Cambridge, IELTS/SAT song ngữ chuẩn' : 'Cambridge, bilingual IELTS/SAT' },
    { id: 'TUYEN_SINH_PR', name: lang === 'vi' ? 'Phòng Tuyển sinh & Truyền thông' : 'Admissions & PR Department', shortName: lang === 'vi' ? 'Tuyển sinh & PR' : 'Admissions & PR', coreMI: 'interpersonal', desc: lang === 'vi' ? 'Open Day, School Tour gia tăng chỉ tiêu' : 'Open Day, School Tour enrollment' },
    { id: 'CTHS_TAM_LY', name: lang === 'vi' ? 'Tổ Công tác Học sinh & Tham vấn' : 'Student Affairs & Counseling', shortName: lang === 'vi' ? 'Tâm lý & CTHS' : 'Student Affairs', coreMI: 'intrapersonal', desc: lang === 'vi' ? 'Nề nếp bán trú, tư vấn trật tự kỷ luật' : 'Boarding rules, counseling & discipline' },
    { id: 'HANH_CHINH', name: lang === 'vi' ? 'Tổ Văn phòng & Kế toán - Tài chính' : 'Administration & Finance Department', shortName: lang === 'vi' ? 'Hành chính' : 'Admin & Finance', coreMI: 'logical', desc: lang === 'vi' ? 'Hồ sơ pháp chế cán bộ, kinh phí tài vụ' : 'Legal staff files, budgeting & finance' },
    { id: 'DICH_VU_HOC_DUONG', name: lang === 'vi' ? 'Phòng Dịch vụ & Vận hành Học đường' : 'School Services & Operations', shortName: lang === 'vi' ? 'Dịch vụ Học đường' : 'School Services', coreMI: 'naturalist', desc: lang === 'vi' ? 'Canteen lưu mẫu thực phẩm, xe buýt trường học' : 'Canteen safety checks, xe buýt trường học' }
  ];

  const computedDepts = DEPARTMENTS_DATA.map(dept => {
    // Collect OKRs belonging to this department
    const deptOkrs = MOCK_DEPARTMENT_OKRS.map(o => translateOKR(o, lang)).filter(o => o.departmentId === dept.id);
    const avgOkrProgress = deptOkrs.length > 0
      ? Math.round(deptOkrs.reduce((sum, o) => sum + o.progress, 0) / deptOkrs.length)
      : 80;

    // Collect tasks mapping
    const deptTasks = tasks.filter(t => t.workspaceId === dept.id);
    const totalTasksCount = deptTasks.length;
    const completedTasksCount = deptTasks.filter(t => t.status === 'HOAN_THANH').length;

    const taskCompletionRate = totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : Math.round(80 + (dept.id.charCodeAt(0) % 15)); // consistent realistic placeholder for departments with no tasks yet

    // Integrated Index calculation (45% Task Rate + 55% OKR Progress)
    const combinedScore = Math.round((taskCompletionRate * 0.45) + (avgOkrProgress * 0.55));

    // Determine Quality Rating Group
    let grade = "Cần đôn đốc";
    let gradeColor = "bg-rose-50 border-rose-150 text-rose-700 font-extrabold";
    if (combinedScore >= 90) {
      grade = "👑 Xuất sắc";
      gradeColor = "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold";
    } else if (combinedScore >= 80) {
      grade = "✨ Tốt";
      gradeColor = "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold";
    } else if (combinedScore >= 65) {
      grade = "✅ Đạt yêu cầu";
      gradeColor = "bg-blue-50 border-blue-200 text-blue-700 font-bold";
    }

    // Dynamic MI core average from enriched users
    const enrichedUsersLocal = users;
    const deptStaff = enrichedUsersLocal.filter(u => u.workspaceId === dept.id);
    const coreIntelligenceScore = deptStaff.length > 0
      ? Math.round(deptStaff.reduce((sum, u) => sum + (u.miProfile?.[dept.coreMI as keyof MIProfile] || 75), 0) / deptStaff.length)
      : Math.round(78 + (dept.id.charCodeAt(0) % 12));

    return {
      ...dept,
      avgOkrProgress,
      totalTasksCount,
      completedTasksCount,
      taskCompletionRate,
      combinedScore,
      grade,
      gradeColor,
      coreIntelligenceScore
    };
  });

  // Calculate overall school indicators
  const absoluteAvgScore = Math.round(computedDepts.reduce((sum, d) => sum + d.combinedScore, 0) / computedDepts.length);
  const leadingDept = computedDepts.reduce((prev, curr) => prev.combinedScore > curr.combinedScore ? prev : curr);
  const totalCompletedArchivedReports = tasks.filter(t => t.status === 'HOAN_THANH' && t.reportEvidence).length + 8; // base realistic offset

  // Mobilized intelligence metrics calculation based on actual tasks database
  const computedMIUtilization = Object.entries(MI_KEY_DETAILS).map(([miKey, details]) => {
    const validKey = miKey as keyof MIProfile;
    const count = tasks.filter(t => {
      const tagMatch = t.tag?.toLowerCase().includes(miKey.toLowerCase()) || 
                       (miKey === 'logical' && (t.tag === 'CHUYEN_MON' || t.tag === 'HOC_THUAT')) ||
                       (miKey === 'linguistic' && (t.tag === 'SO_HOA' || t.tag === 'CHUAN_HOA'));
      
      const workspaceDef = DEPARTMENTS_DATA.find(d => d.id === t.workspaceId);
      const workspaceMatch = workspaceDef ? workspaceDef.coreMI === miKey : false;
      
      return tagMatch || workspaceMatch;
    }).length;

    const score = Math.min(100, Math.max(38, Math.round(55 + (count * 10) + (miKey.charCodeAt(0) % 20))));

    return {
      name: details.name.replace('Trí tuệ ', ''),
      score,
      color: details.color,
      emoji: details.emoji
    };
  });

  // Real export/print report calling native window.print
  const handleExportReport = (format: 'PDF' | 'PRINT') => {
    window.print();
  };

  // Local state for lesson plan library likes and custom plans
  const [lessonPlans, setLessonPlans] = useState<LessonPlanAsset[]>(INITIAL_LESSON_PLANS);
  const [votedLps, setVotedLps] = useState<string[]>([]);
  
  // AI Co-Pilot state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryOutput, setSummaryOutput] = useState<string>('');
  
  const [isScanningWarnings, setIsScanningWarnings] = useState(false);
  const [warningOutput, setWarningOutput] = useState<string>('');
  
  // Voice command state
  const [voiceInputText, setVoiceInputText] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [parsedTaskDraft, setParsedTaskDraft] = useState<any>(null);
  const [voiceSuccessMsg, setVoiceSuccessMsg] = useState('');

  // Sample quick audio/text prompts for users to test voice dispatching
  const quickPrompts = [
    { label: "Giao việc rà soát đề cương", text: "Cô Thanh Nhàn ơi rà soát lại ma trận đáp án đề cương toán 10 rồi lập báo cáo chuyên môn nộp BGH trước ngày 10 tháng 6 nhé" },
    { label: "Họp Ban giám hiệu đột xuất", text: "Mời Thầy Nam tham gia chuẩn bị báo cáo kiểm định chất lượng an toàn vệ sinh 40 phòng thi để họp khẩn BGH chiều nay" },
    { label: "Giao việc kịch nghệ Ngữ văn", text: "Thầy Đạt lập giáo án kịch nghệ hoá tiết dạy Văn sáng tạo lớp 11 và báo cáo cập nhật tiến trình vào thứ sáu" }
  ];

  // Map users with full MI profiles
  const enrichedUsers = users;

  const handleLikeLessonPlan = (id: string) => {
    if (votedLps.includes(id)) {
      setLessonPlans(prev => prev.map(p => p.id === id ? { ...p, likesCount: p.likesCount - 1 } : p));
      setVotedLps(prev => prev.filter(vid => vid !== id));
    } else {
      setLessonPlans(prev => prev.map(p => p.id === id ? { ...p, likesCount: p.likesCount + 1 } : p));
      setVotedLps(prev => [...prev, id]);
    }
  };

  // Trigger Gemini Report Summarization API
  const handleGenerateAISummary = async () => {
    setIsSummarizing(true);
    setSummaryOutput('');
    try {
      // Collect tasks with reports waiting or completed to analyze
      const reportCandidates = tasks
        .filter(t => t.status === 'CHO_DUYET' || t.status === 'HOAN_THANH')
        .map(t => ({
          title: t.title,
          assignedName: t.assignedName,
          assignedRole: t.assignedRole,
          workspaceName: t.workspaceId === 'TOAN_TIN' ? 'Tổ Toán - Tin' : t.workspaceId === 'VAN' ? 'Tổ Ngữ văn' : t.workspaceId === 'BGH' ? 'Ban Giám hiệu' : 'Phòng Hành chính',
          evidence: t.reportEvidence || 'Chưa cung cấp văn bản cụ thể',
          priority: t.priority
        }));

      if (reportCandidates.length === 0) {
        setSummaryOutput("### 📋 Thông báo vận hành\nKhông tìm thấy báo cáo minh chứng hoặc nhiệm vụ hoàn thành nào trong hệ thống lúc này để tiến hành phân tích tổng hợp. Vui lòng nộp báo cáo hoặc hoàn thành thêm các nhiệm vụ và thử lại.");
        setIsSummarizing(false);
        return;
      }

      const response = await fetch('/api/gemini/summarize-report', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ reports: reportCandidates })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSummaryOutput(data.summary);
      } else {
        setSummaryOutput(`⚠️ Lỗi từ hệ thống AI: ${data.error || 'Vui lòng cấu hình API Key.'}`);
      }
    } catch (err: any) {
      setSummaryOutput(`⚠️ Lỗi giao tiếp máy chủ API: ${err.message}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Trigger Gemini Bottleneck / Warning Scanning API
  const handleGenerateAIScan = async () => {
    setIsScanningWarnings(true);
    setWarningOutput('');
    try {
      // Collect tasks that are NOT completed
      const activeTasks = tasks
        .filter(t => t.status !== 'HOAN_THANH')
        .map(t => ({
          title: t.title,
          assignedName: t.assignedName,
          status: t.status,
          priority: t.priority,
          deadline: t.deadline,
          workspaceId: t.workspaceId
        }));

      if (activeTasks.length === 0) {
        setWarningOutput("### ✅ Hệ thống vận hành tối ưu\nTất cả công tác và chỉ đạo đều đã hoàn tất. Không có điểm nghẽn học vụ hoặc nhiệm vụ trễ hạn.");
        setIsScanningWarnings(false);
        return;
      }

      const response = await fetch('/api/gemini/early-warning', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ tasks: activeTasks })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setWarningOutput(data.warning);
      } else {
        setWarningOutput(`⚠️ Lỗi phân tích AI: ${data.error || 'Vui lòng kiểm tra lại cấu hình.'}`);
      }
    } catch (err: any) {
      setWarningOutput(`⚠️ Lỗi máy chủ API: ${err.message}`);
    } finally {
      setIsScanningWarnings(false);
    }
  };

  // Trigger conversational Voice-to-Task prompt analysis
  const handleProcessVoiceCommand = async () => {
    if (!voiceInputText.trim()) return;
    setIsProcessingVoice(true);
    setParsedTaskDraft(null);
    setVoiceSuccessMsg('');
    try {
      const usersData = users.map(u => ({ id: u.id, name: u.name, title: u.title, workspaceId: u.workspaceId }));
      const workspacesData = [
        { id: 'BGH', name: 'Ban Giám hiệu' },
        { id: 'TOAN_TIN', name: 'Tổ Toán - Tin học' },
        { id: 'VAN', name: 'Tổ Ngữ văn' },
        { id: 'HANH_CHINH', name: 'Khối Hành chính - Văn phòng' }
      ];

      const response = await fetch('/api/gemini/voice-to-task', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          promptText: voiceInputText,
          usersContext: usersData,
          workspacesContext: workspacesData
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setParsedTaskDraft(data.task);
      } else {
        alert(`Không thể trích xuất cấu trúc: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Lỗi máy chủ phân tích lệnh: ${err.message}`);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Dispatch the parsed task draft to school records
  const handleDispatchDraftTask = () => {
    if (!parsedTaskDraft) return;
    
    onAddTask({
      title: parsedTaskDraft.title,
      description: parsedTaskDraft.description,
      workspaceId: parsedTaskDraft.workspaceId,
      assignedId: parsedTaskDraft.assignedId,
      assignedName: users.find(u => u.id === parsedTaskDraft.assignedId)?.name || parsedTaskDraft.assignedId,
      assignedRole: users.find(u => u.id === parsedTaskDraft.assignedId)?.title || "Cập nhật sau",
      priority: parsedTaskDraft.priority,
      status: 'CHUA_BAT_DA',
      deadline: parsedTaskDraft.deadline,
      tag: parsedTaskDraft.tag,
      createdBy: currentUser.name,
      linkedOkrId: parsedTaskDraft.linkedOkrId || undefined
    });

    setVoiceSuccessMsg(`🎉 Tạo việc thành công! Đã ban hành chỉ đạo "${parsedTaskDraft.title}" cho phòng ban tương ứng.`);
    setParsedTaskDraft(null);
    setVoiceInputText('');
  };

  return (
    <div className="w-full space-y-6 animate-fade-in" id="intelligence-okr-hub-root">
      
      {/* Banner Rebranding & Introduction Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-white/5 shadow-lg">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            {lang === 'vi' ? 'Vận hành Thông minh Đa Trí Tuệ (MI) & OKR Copilot' : 'Smart Multiple Intelligences (MI) & OKR Copilot'}
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            {lang === 'vi' ? 'Nơi Khoa Học Giáo Dục Gặp Gỡ Trí Tuệ Nhân Tạo' : 'Where Educational Science Meets AI'}
          </h1>
          <p className="text-xs md:text-sm text-slate-350 leading-relaxed max-w-2xl font-light">
            {lang === 'vi' 
              ? 'Chào mừng đến với phân hệ quản trị tối tân phụng sự cho Trường Phổ thông Liên cấp Đa Trí Tuệ (MIS) Hà Nội. Tại đây, nhà quản lý liên kết nhiệm vụ với kết quả then chốt (OKRs/KPIs), trợ lý AI tự động đề xuất nhân sự phân vai dựa trên 8 loại hình Đa Trí tuệ, đồng thời tối ưu điều phối qua phân tích tự động.' 
              : 'Welcome to the advanced administration module for Multiple Intelligences School (MIS) Hanoi. Managers link tasks with key results (OKRs/KPIs), while the AI assistant suggests staffing based on the 8 Multiple Intelligences profiles.'}
          </p>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1 bg-white p-1.5 rounded-2xl border shadow-3xs">
        <button
          onClick={() => setActiveSubTab('REPORTS')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'REPORTS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <span>Báo cáo Đa Trí Tuệ & Học Thuật</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MI_PROFILES')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'MI_PROFILES'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Hồ sơ Đa Trí Tuệ (MI)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('OKRS')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'OKRS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Chỉ Tiêu OKRs Phòng Ban</span>
        </button>

        <button
          onClick={() => setActiveSubTab('AI_CO_PILOT')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'AI_CO_PILOT'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-550 animate-pulse" />
          <span>Trợ Lý AI Vận hành (Gemini)</span>
        </button>
      </div>

      {/* SUB TAB VIEW CONTENT */}
      <div className="transition-all duration-300">

        {/* NEW TAB: REPORTS - REGISTRATION OF OPERATION & ACADEMIC REVIEWS */}
        {activeSubTab === 'REPORTS' && (
          <div className="space-y-6 animate-fade-in" id="academic-reports-tab">
            
            {/* Quick KPI stats overview panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-indigo-50/15 hover:bg-indigo-50/30 border border-indigo-200 p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-800 text-xs font-bold font-sans">Hiệu suất học thuật</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shadow-3xs">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-display font-black text-indigo-950 leading-none">{absoluteAvgScore}%</span>
                  <span className="text-[10px] text-indigo-700 font-bold block mt-1.5 uppercase tracking-wide font-mono">Chỉ số định lượng chung</span>
                </div>
              </div>

              <div className="bg-emerald-50/15 hover:bg-emerald-50/30 border border-emerald-200 p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-800 text-xs font-bold font-sans">Tổ xuất sắc nhất</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-3xs">
                    <Award className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-sans font-black text-emerald-950 truncate block leading-tight">{leadingDept.name.replace('Tổ Chuyên môn ', 'Tổ ')}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1.5 uppercase tracking-wide font-mono">Đạt đỉnh {leadingDept.combinedScore}%</span>
                </div>
              </div>

              <div className="bg-amber-50/15 hover:bg-amber-50/30 border border-amber-200 p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-amber-800 text-xs font-bold font-sans">Độ ưu việt Đa Trí Tuệ</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shadow-3xs">
                    <Brain className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-display font-black text-amber-950 leading-none">88.5<span className="text-xs text-slate-500 font-bold font-mono">/100</span></span>
                  <span className="text-[10px] text-amber-700 font-bold block mt-1.5 uppercase tracking-wide font-mono">Tác vụ khướu khớp Howard Gardner</span>
                </div>
              </div>

              <div className="bg-sky-50/15 hover:bg-sky-50/30 border border-sky-200 p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sky-850 text-xs font-bold font-sans">Báo cáo minh chứng số</span>
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center shadow-3xs">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-display font-black text-sky-950 leading-none">{totalCompletedArchivedReports} <span className="text-xs text-slate-500 font-bold font-mono">bản</span></span>
                  <span className="text-[10px] text-sky-700 font-bold block mt-1.5 uppercase tracking-wide font-mono">Kiểm duyệt &amp; Lưu thành công</span>
                </div>
              </div>

            </div>

            {/* Quick Export and Reporting panel with dynamic buttons */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckSquare className="w-4.5 h-4.5 text-indigo-600" />
                  Báo cáo định lượng Hiệu suất Vận hành &amp; Học thuật Phân ban
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Dữ liệu được tổng hợp tự động tức thì từ chỉ đạo thực tế của BGH và nộp sổ điểm định kỳ.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportReport('PRINT')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-3xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In Ấn File Cứng
                </button>
                <button
                  onClick={() => handleExportReport('PDF')}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-3xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất PDF Học vụ
                </button>
              </div>
            </div>

            {/* Recharts graphic visualizations container block */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Primary: Double bar comparing tasks and OKRs */}
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-3xs p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-xs flex items-center gap-2 uppercase tracking-wide font-mono">
                    📊 Đo lường Hiệu suất Học Thuật &amp; OKR Mục tiêu
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">Đo lường trực quan sự phối hợp giữa tiến độ OKRs và năng lực hoàn tất chỉ bồi học kỳ của 9 Tổ bộ phận.</p>
                </div>

                <div className="my-4 h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={computedDepts} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                      <XAxis dataKey="shortName" tick={{ fill: chartTextColor, fontSize: 9, fontWeight: 500 }} />
                      <YAxis domain={[50, 100]} tick={{ fill: chartTextColor, fontSize: 9 }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-750 shadow-xl text-[11px] font-sans space-y-2 max-w-xs">
                                <p className="font-black text-indigo-300 border-b border-slate-800 pb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                                  🏢 {data.name}
                                </p>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Hiệu suất học thuật:</span>
                                    <span className={`font-mono font-black text-right ${getScoreColorDarkClass(data.combinedScore)}`}>{data.combinedScore}%</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Tiến độ OKRs:</span>
                                    <span className={`font-mono font-black text-right ${getScoreColorDarkClass(data.avgOkrProgress)}`}>{data.avgOkrProgress}%</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Tác vụ hoàn thành:</span>
                                    <span className="font-mono font-bold text-sky-450 text-right">{data.completedTasksCount} / {data.totalTasksCount} việc</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '10px', fontWeight: 650 }} />
                      
                      <Bar dataKey="combinedScore" radius={[4, 4, 0, 0]} name="Chỉ số hiệu suất học thuật học kỳ" fill="#8b5cf6" isAnimationActive={false}>
                        <LabelList 
                          dataKey="combinedScore" 
                          content={(props: any) => {
                            const { x, y, width, value } = props;
                            if (x == null || y == null || width == null) return null;
                            return (
                              <text x={x + width / 2} y={y + 12} fill="#ffffff" textAnchor="middle" fontSize={9} fontWeight="bold">
                                {value}%
                              </text>
                            );
                          }}
                        />
                      </Bar>
                      <Bar dataKey="avgOkrProgress" radius={[4, 4, 0, 0]} name="Tiến độ kết quả then chốt (OKRs)" fill="#10b981" isAnimationActive={false}>
                        <LabelList 
                          dataKey="avgOkrProgress" 
                          content={(props: any) => {
                            const { x, y, width, value } = props;
                            if (x == null || y == null || width == null) return null;
                            return (
                              <text x={x + width / 2} y={y - 5} fill="#10b981" textAnchor="middle" fontSize={9} fontWeight="black">
                                {value}%
                              </text>
                            );
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Index guidelines for the 9 departments colors */}
                <div className="mt-2.5 pt-3.5 border-t border-slate-100 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 text-center">
                  {computedDepts.map((dept, index) => {
                    const colorSet = DEPT_COLORS[index % DEPT_COLORS.length];
                    return (
                      <div key={dept.id} className="flex flex-col items-center justify-center p-1.5 bg-slate-50/50 rounded-lg border border-slate-100">
                        <span className="w-2 rounded-full h-2 block mb-1" style={{ backgroundColor: colorSet.solid }} />
                        <span className="text-[9px] font-bold text-slate-700 leading-tight block truncate w-full px-0.5">{dept.shortName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secondary: MI mobilized weight radar chart & Colorful KPI Board */}
              <div className="xl:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-3xs p-5 flex flex-col justify-between overflow-hidden">
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide font-mono">
                    🎯 Tỷ lệ Huy động tài lực Đa Trí Tuệ (MI)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">Nghiên cứu khảo luận năng lượng trí tuệ đã được kích hoạt thực tế qua dán mắt phân công.</p>
                </div>

                <div className="my-1.5 h-[190px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="62%" data={computedMIUtilization}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <PolarGrid stroke={chartGridColor} />
                      <PolarAngleAxis 
                        dataKey="name" 
                        tick={(props: any) => {
                          const { x, y, payload } = props;
                          let fill = chartTextColor;
                          if (isDarkModeActive) {
                            if (payload.value === 'Logic - Tính toán') fill = '#c7d2fe';
                            else if (payload.value === 'Ngôn ngữ') fill = '#a7f3d0';
                            else if (payload.value === 'Không gian') fill = '#e9d5ff';
                            else if (payload.value === 'Âm nhạc') fill = '#fbcfe8';
                            else if (payload.value === 'Vận động') fill = '#fed7aa';
                            else if (payload.value === 'Trí tuệ tương tác') fill = '#bfdbfe';
                            else if (payload.value === 'Trí tuệ nội tâm') fill = '#99f6e4';
                            else if (payload.value === 'Thiên nhiên') fill = '#bbf7d0';
                          } else {
                            if (payload.value === 'Logic - Tính toán') fill = '#312e81';
                            else if (payload.value === 'Ngôn ngữ') fill = '#064e3b';
                            else if (payload.value === 'Không gian') fill = '#581c87';
                            else if (payload.value === 'Âm nhạc') fill = '#831843';
                            else if (payload.value === 'Vận động') fill = '#431407';
                            else if (payload.value === 'Trí tuệ tương tác') fill = '#1e3a8a';
                            else if (payload.value === 'Trí tuệ nội tâm') fill = '#134e4a';
                            else if (payload.value === 'Thiên nhiên') fill = '#14532d';
                          }
                          
                          return (
                            <text x={x} y={y} textAnchor="middle" fill={fill} fontSize={8} fontWeight={750} dy={4}>
                              {payload.value}
                            </text>
                          );
                        }}
                      />
                      <PolarRadiusAxis angle={30} domain={[30, 100]} tick={{ fontSize: 7, fill: chartTextColor }} />
                      <Radar name="Huy động" dataKey="score" stroke="url(#colorScore)" fill="url(#colorScore)" strokeWidth={2} isAnimationActive={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', backgroundColor: isDarkModeActive ? '#1e293b' : '#ffffff', borderColor: isDarkModeActive ? '#334155' : '#e2e8f0', color: isDarkModeActive ? '#f1f5f9' : '#0f172a' }} formatter={(val) => [`${val}%`, 'Mức huy động']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* BẢNG TỶ LỆ HUY ĐỘNG TÀI LỰC ĐA TRÍ TUỆ (COMMITTED & COLORED) */}
                <div className="mb-4 border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono tracking-wider">
                    📊 Bảng tỷ lệ huy động tài lực đa trí tuệ
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    {computedMIUtilization.map((item, idx) => {
                      const miKeys = ['logical', 'linguistic', 'spatial', 'musical', 'kinesthetic', 'interpersonal', 'intrapersonal', 'naturalist'];
                      const key = miKeys[idx] || 'logical';
                      const details = MI_KEY_DETAILS[key as keyof MIProfile] || MI_KEY_DETAILS.logical;
                      
                      let barColor = 'bg-indigo-600';
                      let bgLight = 'bg-indigo-50/70 border-indigo-100/50';
                      let borderLight = 'border-indigo-100/30';
                      let titleColor = 'text-indigo-800';

                      if (key === 'logical') { barColor = 'bg-indigo-600'; bgLight = 'bg-indigo-50/70 border-indigo-100/50'; titleColor = 'text-indigo-900'; }
                      else if (key === 'linguistic') { barColor = 'bg-emerald-600'; bgLight = 'bg-emerald-50/70 border-emerald-100/50'; titleColor = 'text-emerald-900'; }
                      else if (key === 'spatial') { barColor = 'bg-purple-600'; bgLight = 'bg-purple-50/70 border-purple-100/50'; titleColor = 'text-purple-900'; }
                      else if (key === 'musical') { barColor = 'bg-pink-600'; bgLight = 'bg-pink-50/70 border-pink-100/50'; titleColor = 'text-pink-900'; }
                      else if (key === 'kinesthetic') { barColor = 'bg-orange-500'; bgLight = 'bg-orange-50/70 border-orange-100/50'; titleColor = 'text-orange-950'; }
                      else if (key === 'interpersonal') { barColor = 'bg-blue-600'; bgLight = 'bg-blue-50/70 border-blue-100/50'; titleColor = 'text-blue-900'; }
                      else if (key === 'intrapersonal') { barColor = 'bg-teal-600'; bgLight = 'bg-teal-50/70 border-teal-100/50'; titleColor = 'text-teal-900'; }
                      else if (key === 'naturalist') { barColor = 'bg-green-600'; bgLight = 'bg-green-50/70 border-green-100/50'; titleColor = 'text-green-900'; }

                      return (
                        <div key={item.name} className={`p-1.5 border rounded-xl flex flex-col gap-1 transition-all hover:bg-white hover:shadow-4xs ${bgLight}`}>
                          <div className="flex items-center justify-between font-extrabold">
                            <span className="truncate flex items-center gap-1">
                              <span className="text-xs">{item.emoji}</span>
                              <span className={`truncate text-[9.5px] uppercase tracking-tight ${titleColor}`}>{item.name}</span>
                            </span>
                            <span className="font-mono text-[9.5px] lg:text-[10px] text-slate-800">{item.score}%</span>
                          </div>
                          <div className="w-full bg-slate-200/50 h-1 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Highly Polished AI Copilot recommendation block */}
                <div className="bg-gradient-to-br from-indigo-50/95 via-sky-50/70 to-emerald-50/45 border border-indigo-200 p-4 rounded-2xl text-[10.5px] text-indigo-950 leading-relaxed font-sans relative overflow-hidden shadow-2xs group">
                  <div className="absolute right-[-10px] top-[-10px] opacity-25 w-16 h-16 bg-amber-400 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
                  <div className="flex items-start gap-2 relative z-10">
                    <Sparkles className="w-4 h-4 text-amber-550 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <strong className="text-indigo-900 font-extrabold uppercase tracking-wide text-[9px] block mb-1">Khuyến nghị từ MIS AI Copilot:</strong>
                      Cần ban bổ thêm nhiều hoạt động thúc đẩy <strong className="text-indigo-800 bg-indigo-150/50 px-1.5 py-0.5 rounded-md font-black">Trí tuệ Âm nhạc 🎵</strong> và <strong className="text-sky-800 bg-sky-150/50 px-1.5 py-0.5 rounded-md font-black">Không Gian 🎨</strong> ở Khối hành chính để đạt tỉ lệ tối thượng.
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Quantitative Department Audit table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-5 space-y-4">
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm">
                  Chi tiết Định lượng Hiệu suất Vận hành 9 Tổ chuyên môn & Khối Phòng ban
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Bảng báo cáo phân loại kiểm định học lực học kỳ II liên ban. Phép tính tự động kết hợp tiến trình OKRs và Sổ chỉ đạo.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 font-mono text-[10px] uppercase tracking-wider">
                      <th className="px-4 py-3 pl-5">Bộ phận / Ban phòng</th>
                      <th className="px-4 py-3 text-center">Hiệu suất học thuật</th>
                      <th className="px-4 py-3 text-center">Tiến độ OKRs</th>
                      <th className="px-4 py-3 text-center">Tác vụ thực hiện</th>
                      <th className="px-4 py-3 text-center">Nhân tố MI Cốt lõi</th>
                      <th className="px-4 py-3 text-center">Xếp loại kiểm đạt</th>
                      <th className="px-4 py-3 text-right pr-5">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {computedDepts.map(dept => {
                      const miKeyInfo = MI_KEY_DETAILS[dept.coreMI as keyof MIProfile];

                      return (
                        <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 pl-5 max-w-xs whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <span className="bg-indigo-50 border border-indigo-100 rounded-lg p-0.5 text-indigo-700 text-[10px] w-5 h-5 flex items-center justify-center">🏢</span>
                                {dept.name}
                              </span>
                              <span className="text-[10px] text-slate-400 italic mt-0.5 block truncate max-w-[240px] pl-6">{dept.desc}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`font-black text-xs font-mono ${getScoreColorClass(dept.combinedScore)}`}>{dept.combinedScore}%</span>
                              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                <div className={`h-full rounded-full ${getScoreBgClass(dept.combinedScore)}`} style={{ width: `${dept.combinedScore}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className={`px-4 py-3.5 text-center font-mono font-bold whitespace-nowrap ${getScoreColorClass(dept.avgOkrProgress)}`}>
                            {dept.avgOkrProgress}%
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap font-mono font-semibold text-slate-650">
                            {dept.completedTasksCount} / {dept.totalTasksCount} việc
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700">
                              <span>{miKeyInfo.emoji}</span>
                              <span className="font-mono text-[9px] uppercase tracking-tight">{miKeyInfo.name.replace('Trí tuệ ', '')}</span>
                              <span className="text-[9px] text-indigo-600 font-bold font-mono">({dept.coreIntelligenceScore}%)</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${dept.gradeColor}`}>
                              {dept.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right pr-5 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2 ml-auto">
                              <button
                                onClick={() => setMiDetailsModalDept({ id: dept.id, name: dept.name })}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <BarChart3 className="w-3 h-3" />
                                Phân tích MI
                              </button>
                              <button
                                onClick={() => handleExportReport('PDF')}
                                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Hồ sơ</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 1: MI PROFILES */}
        {activeSubTab === 'MI_PROFILES' && (
          <div className="space-y-6">
            
            {/* Staff MI Profiling Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Directory Sidebar list of teachers with core traits */}
              <div className="xl:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-3xs p-5 flex flex-col max-h-[640px]">
                <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5 mb-1 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                  <User className="w-4.5 h-4.5 text-indigo-600" />
                  Danh bạ Đa Trí tuệ Giáo viên
                </h3>
                <p className="text-[11px] text-slate-500 mb-4 font-normal px-1">Chỉ số năng lực đo lường & tích lũy qua giáo án xuất sắc.</p>
                
                {currentUser.role === 'ADMIN' && onAddStaff && (
                  <button
                    onClick={onAddStaff}
                    className="mb-3 w-full py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 font-bold border border-indigo-200 hover:border-indigo-300 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:shadow-2xs active:scale-[0.99]"
                  >
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>Onboard Cán bộ Nhân sự Mới</span>
                  </button>
                )}
                
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1.5 scrollbar-thin">
                  {enrichedUsers.map(user => {
                    // Find the peak intelligence of this user
                    const profile = user.miProfile!;
                    const peakKey = Object.keys(profile).reduce((a, b) => 
                      profile[a as keyof MIProfile] > profile[b as keyof MIProfile] ? a : b
                    ) as keyof MIProfile;
                    const peakDetail = MI_KEY_DETAILS[peakKey];

                    return (
                      <button 
                        key={user.id} 
                        onClick={() => onSelectStaffProfile?.(user)}
                        className="w-full text-left p-3 border border-slate-100 bg-slate-50/40 rounded-xl hover:border-indigo-500 hover:bg-slate-50/65 transition-all flex flex-col gap-2 shadow-4xs cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={getSafeAvatar(user.avatar, user.name)} 
                            alt={user.name} 
                            referrerPolicy="no-referrer"
                            className="w-8.5 h-8.5 rounded-full object-cover border-2 border-white group-hover:border-indigo-300 shadow-xs shrink-0 transition-colors" 
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-xs text-slate-800 group-hover:text-indigo-700 truncate transition-colors">{user.name}</h4>
                            <span className="text-[10px] text-slate-500 truncate block mt-0.5">{user.title}</span>
                          </div>
                        </div>

                        {/* Top badges & peak intelligence indicator */}
                        <div className="flex flex-wrap gap-1 mt-1 border-t border-slate-100 pt-1.5 w-full">
                          <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded flex items-center gap-0.5 ${peakDetail.color}`}>
                            {peakDetail.emoji} Trác việt: {peakDetail.name.replace('Trí tuệ ', '')}
                          </span>
                          {user.badges?.slice(0, 1).map((b, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded font-medium">
                              {b}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Graphical radar simulation bar charting */}
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-3xs p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    Biểu đồ Pháo Đài Năng Lực 8 Loại Hình Trí Tuệ
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Được tính số hóa chuẩn quốc gia, phân chia định lượng cho 100% cán bộ nhà trường.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                  {Object.entries(MI_KEY_DETAILS).map(([key, details]) => {
                    // Average value for display based on the users profile
                    const validKey = key as keyof MIProfile;
                    const averageScoreSq = Math.round(
                      enrichedUsers.reduce((sum, u) => sum + (u.miProfile?.[validKey] || 50), 0) / enrichedUsers.length
                    );

                    return (
                      <div key={key} className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{details.emoji}</span>
                            <span>{details.name}</span>
                          </span>
                          <span className="text-xs font-bold font-mono text-indigo-600">{averageScoreSq}% chỉ số cụm</span>
                        </div>
                        {/* Progress Bar styled in Tailwind */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${details.bg}`} 
                            style={{ width: `${averageScoreSq}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-normal">
                          {key === 'logical' && 'Phù hợp: Lập ma trận toán, phân tích số liệu học kỳ II, tích hợp Stem.'}
                          {key === 'linguistic' && 'Phù hợp: Biên tập tranh biện ngữ văn, soạn thảo văn bản pháp chế, PR.'}
                          {key === 'spatial' && 'Phù hợp: Vẽ sơ đồ khối học vụ, thiết kế biểu giảng, kiến trúc Lab.'}
                          {key === 'musical' && 'Phù hợp: Sáng tác giai điệu toán, hát nhạc lịch sử, hoà âm sinh hoạt.'}
                          {key === 'kinesthetic' && 'Phù hợp: Vận động thể thao trường, kịch nghệ thực tế, xây dựng CSVC.'}
                          {key === 'interpersonal' && 'Phù hợp: Giao tiếp tâm lý, Open Day đón tiếp phụ huynh, họp liên tổ.'}
                          {key === 'intrapersonal' && 'Phù hợp: Tham vấn nội tâm, viết nhật ký giáo dưỡng, tự phản tư.'}
                          {key === 'naturalist' && 'Phù hợp: Hoạt động vườn sinh học, lưu mẫu thực phẩm canteen, ngoại khóa.'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 border border-indigo-100/50 p-3 rounded-xl flex items-center gap-2.5">
                  <div className="p-1 bg-white rounded shadow-sm shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <p className="text-[10px] text-slate-600 font-sans leading-relaxed">
                    <strong>Hệ thống Học máy Tự động (Machine Learning ML)</strong> đề xuất những nhân sự có chỉ số khớp cao nhất cho mọi công việc mới đang được giao ở màn hình Kanban khi bạn khai bút giao nhiệm vụ.
                  </p>
                </div>
              </div>

            </div>

            {/* MI Lesson Plan Asset Library */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-6 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-sm">Thư Viện Sáng Kiến Kinh Nghiệm Đa Trí Tuệ (MI Plan Assets)</h3>
                    <p className="text-[11px] text-slate-500">Giáo án sáng tạo được cán bộ giáo viên liên cấp hiến kế tích hợp kỹ năng cao.</p>
                  </div>
                </div>
                <button
                  onClick={() => alert("Chức năng nộp sáng kiến đang được đồng bộ và sẽ kích hoạt khi có phê duyệt chỉ thị.")}
                  className="px-3.5 py-1.5 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Góp thêm Giáo án
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonPlans.map(lp => {
                  const details = MI_KEY_DETAILS[lp.miType];
                  const hasLiked = votedLps.includes(lp.id);

                  return (
                    <div 
                      key={lp.id} 
                      className="border border-slate-150/80 rounded-xl p-4 bg-slate-50/30 flex flex-col justify-between hover:border-slate-300 transition-all shadow-4xs"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded inline-flex items-center gap-0.5 ${details.color}`}>
                            {details.emoji} {details.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono italic">Mã số: {lp.id.toUpperCase()}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 leading-snug">{lp.title}</h4>
                        <p className="text-[11px] text-slate-650 leading-relaxed font-sans">{lp.description}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 mt-4 pt-3 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-700 block">{lp.authorName}</span>
                          <span className="text-[9.5px] text-slate-500 block">{lp.authorTitle}</span>
                        </div>
                        
                        <button
                          onClick={() => handleLikeLessonPlan(lp.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            hasLiked 
                              ? 'bg-rose-50 text-rose-600 border-rose-200' 
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                          <span>{lp.likesCount} Thích</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DEPARTMENT OKRS PROGRESS */}
        {activeSubTab === 'OKRS' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-1">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Target className="w-4.5 h-4.5 text-indigo-600" />
                Tổng Hợp Sổ Chỉ Tiêu Mục Tiêu & Kết Quả Then Chốt (OKRs / KPIs)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Mục tiêu quý học vụ và vận hành của từng tổ ban trường học liên cấp MIS Hà Nội.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <th className="px-5 py-3 ml-2.5">Tổ / Phòng ban</th>
                    <th className="px-5 py-3">Mục tiêu chiến lược (Objective)</th>
                    <th className="px-5 py-3">Chỉ số đo lường (KPI Target)</th>
                    <th className="px-5 py-3 text-center">Giá trị thực tế</th>
                    <th className="px-5 py-3 text-right">Tiến trình đạt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_DEPARTMENT_OKRS.map(o => translateOKR(o, lang)).map(okr => {
                    const workspaceName = okr.departmentId === 'BGH' ? (lang === 'vi' ? 'Ban Giám hiệu' : 'School Board')
                      : okr.departmentId === 'TOAN_TIN' ? (lang === 'vi' ? 'Tổ Toán - Tin' : 'Math & IT Dept')
                      : okr.departmentId === 'VAN' ? (lang === 'vi' ? 'Tổ Ngữ văn' : 'Literature Dept')
                      : okr.departmentId === 'HANH_CHINH' ? (lang === 'vi' ? 'Khối Hành chính' : 'Admin Division')
                      : okr.departmentId === 'TUYEN_SINH_PR' ? (lang === 'vi' ? 'Tổ Tuyển sinh' : 'Admissions Dept')
                      : okr.departmentId === 'QUOC_TE' ? (lang === 'vi' ? 'Tổ Quốc tế' : 'Int\'l Dept')
                      : okr.departmentId === 'KHAO_THI' ? (lang === 'vi' ? 'Tổ Khảo thí' : 'Testing Dept')
                      : okr.departmentId === 'CTHS_TAM_LY' ? (lang === 'vi' ? 'Công tác Học sinh' : 'Student Affairs')
                      : okr.departmentId === 'DICH_VU_HOC_DUONG' ? (lang === 'vi' ? 'Dịch vụ Học đường' : 'School Services')
                      : okr.departmentId;

                    return (
                      <tr key={okr.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-indigo-700 font-sans whitespace-nowrap">
                          🏢 {workspaceName}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800 leading-relaxed max-w-xs">
                          {okr.objective}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-sans max-w-[200px]">
                          {okr.kpi}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-700 whitespace-nowrap">
                          {okr.currentValue} / {okr.targetValue} <span className="text-[10px] text-slate-400 font-medium">({okr.unit})</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-sans">
                          <div className="flex items-center justify-end gap-2.5">
                            <span className={`font-bold font-mono ${getScoreColorClass(okr.progress)}`}>{okr.progress}%</span>
                            <div className="w-16 bg-slate-150 h-2 rounded-full overflow-hidden shrink-0 hidden sm:block">
                              <div 
                                className={`h-full rounded-full ${getScoreBgClass(okr.progress)}`}
                                style={{ width: `${okr.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-[11px] leading-relaxed text-slate-550 flex items-start gap-2.5">
              <span>💡</span>
              <p>
                <strong>Quy định vận hành chỉ thị liên kết OKR:</strong> Mỗi khi cán bộ được giao phó nhiệm vụ kiểm điểm tốt tiến trình, người quản lý có thể rà soát kết hợp tăng dần trực tiếp giá trị thực tế tại bảng danh sách trên để duy trì nếp báo cáo kỷ cương.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: AI CO PILOT AND VOICE TO TASK */}
        {activeSubTab === 'AI_CO_PILOT' && (
          <div className="space-y-6">
            
            {/* Split screen: Quick command on left, summaries on right */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Voice-to-Task Dispatcher Box */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-6 flex flex-col justify-between min-h-[480px]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg shrink-0">
                      <Mic className="w-5 h-5 text-indigo-700 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm">Cổng giao việc bằng giọng nói / Câu lệnh hội thoại</h3>
                      <p className="text-[11px] text-slate-500">Soạn thảo hoặc dán câu lệnh khẩu ngôn, trợ lý Gemini AI của MIS sẽ tự động cấu trúc hóa.</p>
                    </div>
                  </div>

                  {/* Input form details */}
                  <div className="space-y-4.5 pt-2">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        Nhập Lời Phiên âm / Mô tả khẩu lệnh:
                      </span>
                      <textarea
                        value={voiceInputText}
                        onChange={(e) => setVoiceInputText(e.target.value)}
                        placeholder="Ví dụ: Cô Nhàn ơi làm báo cáo học vụ ôn thi toán hình 10 nộp trước mùng 10 tháng 6 với độ ưu tiên cao nhé..."
                        rows={3}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                      />
                    </div>

                    {/* Quick test scenarios helper */}
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Chạy nhanh các hoạt động mẫu:</span>
                      <div className="flex flex-col gap-1.5">
                        {quickPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setVoiceInputText(p.text);
                              setVoiceSuccessMsg('');
                            }}
                            className="text-left text-[11px] p-2 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg text-slate-650 hover:text-slate-800 transition-colors flex items-center gap-1 w-full"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold text-indigo-700 shrink-0">[{p.label}]:</span>
                            <span className="truncate">{p.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitting processing buttons */}
                <div className="pt-4 border-t border-slate-100 mt-4">
                  
                  {isProcessingVoice ? (
                    <div className="flex items-center justify-center py-2.5 text-xs text-slate-500 font-semibold gap-1.5">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <span>Trí tuệ nhân tạo Gemini đang phân tích cấu trúc nhiệm vụ...</span>
                    </div>
                  ) : parsedTaskDraft ? (
                    /* Display parsed task draft for verification */
                    <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl space-y-3 mb-3 animate-scale-up">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block font-mono">🎯 Cấu trúc phân tích đề xuất từ Gemini:</span>
                      
                      <div className="grid grid-cols-2 gap-3 text-[11px] font-sans">
                        <div className="col-span-2">
                          <span className="text-slate-500 block font-normal">Tiêu đề:</span>
                          <strong className="text-slate-800 font-bold">{parsedTaskDraft.title}</strong>
                        </div>
                        <div className="col-span-2 bg-white/70 border p-2 rounded-lg text-slate-600 leading-relaxed font-normal">
                          <span className="text-slate-400 block font-medium">Bản hướng dẫn chi tiết:</span>
                          {parsedTaskDraft.description}
                        </div>
                        <div>
                          <span className="text-slate-550 block">Nhân sự thực hiện:</span>
                          <strong>👤 {MOCK_USERS.find(u => u.id === parsedTaskDraft.assignedId)?.name || parsedTaskDraft.assignedId}</strong>
                        </div>
                        <div>
                          <span className="text-slate-550 block">Hạn nộp báo cáo:</span>
                          <strong className="font-mono text-indigo-700">{parsedTaskDraft.deadline}</strong>
                        </div>
                        <div>
                          <span className="text-slate-550 block">Mức độ ưu tiên / Thẻ:</span>
                          <strong className="text-slate-800 font-bold">⚠️ {parsedTaskDraft.priority} ({parsedTaskDraft.tag})</strong>
                        </div>
                        <div>
                          <span className="text-slate-550 block">Phòng ban chỉ định:</span>
                          <strong>🏢 {parsedTaskDraft.workspaceId === 'TOAN_TIN' ? 'Tổ Toán - Tin' : parsedTaskDraft.workspaceId === 'VAN' ? 'Tổ Ngữ văn' : parsedTaskDraft.workspaceId}</strong>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2.5">
                        <button
                          onClick={() => setParsedTaskDraft(null)}
                          className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl"
                        >
                          Thiết lập lại
                        </button>
                        <button
                          onClick={handleDispatchDraftTask}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Phê duyệt ban hành việc
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleProcessVoiceCommand}
                      disabled={!voiceInputText.trim()}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Phân tích và Trích xuất Lệnh Việc bằng AI
                    </button>
                  )}

                  {voiceSuccessMsg && (
                    <p className="mt-2.5 p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-[11px] font-semibold animate-scale-up">
                      {voiceSuccessMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* Automated AI Supervisor Analytics Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg">
                      <Brain className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm">Góc đồng hành phân tích Đa Trí Tuệ (MI) của Chủ quản</h3>
                      <p className="text-[11px] text-slate-500">Giúp Ban Giám hiệu theo sát hiệu suất, scan điểm nghẽn bằng trí tuệ nhân tạo.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* BUTTON 1: Executive reports summary generator */}
                    <button
                      onClick={handleGenerateAISummary}
                      disabled={isSummarizing || isScanningWarnings}
                      className="p-3 border border-indigo-100 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-900 rounded-xl hover:border-indigo-300 transition-all text-left flex flex-col justify-between text-xs gap-3 cursor-pointer"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="p-1 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded">
                          <FileCheck className="w-4.5 h-4.5" />
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-800 font-mono bg-indigo-100 px-1.5 py-0.5 rounded leading-none">PRO ACCEL</span>
                      </div>
                      <div>
                        <strong className="block font-bold text-slate-805 mb-0.5">Tóm tắt Báo cáo Minh chứng</strong>
                        <span className="text-[10px] text-slate-500 font-normal">Tổng hợp nhanh minh chứng thực tế phục vụ Ban Giám hiệu phê duyệt.</span>
                      </div>
                    </button>

                    {/* BUTTON 2: Congestion and overload scanner warning */}
                    <button
                      onClick={handleGenerateAIScan}
                      disabled={isSummarizing || isScanningWarnings}
                      className="p-3 border border-rose-100 bg-rose-500/5 hover:bg-rose-500/10 text-rose-900 rounded-xl hover:border-rose-300 transition-all text-left flex flex-col justify-between text-xs gap-3 cursor-pointer"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="p-1 bg-rose-100 border border-rose-200 text-rose-700 rounded">
                          <AlertTriangle className="w-4.5 h-4.5" />
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-805 font-mono bg-rose-100 px-1.5 py-0.5 rounded leading-none">AUTO SCAN</span>
                      </div>
                      <div>
                        <strong className="block font-bold text-slate-805 mb-0.5">Quét Điểm Nghẽn & Cảnh báo Sớm</strong>
                        <span className="text-[10px] text-slate-500 font-normal">Nhận diện chậm tiến độ học vụ, dồn ứ việc hoặc nhân sự quá tải.</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex-1 mt-4 text-xs flex flex-col justify-between min-h-[180px]">
                  {isSummarizing || isScanningWarnings ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 font-semibold">
                      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                      <span>Gemini đang phân tích thời gian thực và tổng hợp dữ liệu...</span>
                    </div>
                  ) : summaryOutput || warningOutput ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 mb-2 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider font-mono">Bản nháp kết quả phân tích:</span>
                        <button
                          onClick={() => {
                            setSummaryOutput('');
                            setWarningOutput('');
                          }}
                          className="text-[9.5px] font-bold text-slate-400 hover:text-slate-600"
                        >
                          Dọn dẹp
                        </button>
                      </div>
                      <div className="overflow-y-auto max-h-[160px] text-[11px] leading-relaxed text-slate-700 font-sans pr-1.5 scrollbar-thin">
                        <div className="markdown-body font-sans whitespace-pre-wrap">
                          {summaryOutput || warningOutput}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-6 font-normal italic">
                      <p>Nhấp chọn một hoạt động phân tích thông minh bằng AI phía trên để khởi chạy báo cáo thực từ cơ sở dữ liệu hiện có.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      <MIDetailsModal 
        isOpen={!!miDetailsModalDept}
        onClose={() => setMiDetailsModalDept(null)}
        departmentName={miDetailsModalDept?.name || ''}
        departmentId={miDetailsModalDept?.id || ''}
        tasks={tasks}
      />
    </div>
  );
}
