import React, { useState, useMemo } from 'react';
import { Target, Search, Plus, PhoneCall, Mail, Calendar, Sparkles, Megaphone, ArrowRight, Award, FileText, CheckCircle2, ClipboardList, Edit3, X, Download, Upload, Loader2, Clock, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type LeadStage = 'NEW' | 'CONSULTING' | 'TOUR' | 'TESTING' | 'OFFER' | 'RESERVED' | 'ENROLLED';
type LeadSource = 'Social' | 'Website' | 'Referral' | 'Event' | 'Google' | 'Facebook' | 'TikTok';
type InterestLevel = 'HOT' | 'WARM' | 'COLD';

interface Lead {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  stage: LeadStage;
  source: LeadSource;
  notes: string;
  interactions: { date: string; type: string; content: string }[];
  testScore?: string;
  scholarshipInfo?: string;
  grade?: string;
  docChecklist?: {
    hocBa: boolean;
    khaiSinh: boolean;
    anh3x4: boolean;
    cccdParent?: boolean;
    healthRecord?: boolean;
    paymentProof?: boolean;
    admissionForm?: boolean;
  };
  campaignName?: string;
  adChannel?: string;
  leadOwner?: string;
  interestLevel?: InterestLevel;
  nextFollowUpDate?: string;
  currentSchool?: string;
  expectedRevenue?: number;
  adCost?: number;
  // Financial fields
  tuitionDiscount?: number;
  scholarshipDiscount?: number;
  phaseEnrollmentDiscount?: number;
  advancedFee?: number;
  otherDiscount?: number;
  baseTuitionFee?: number;
  // Scheduling fields
  testDate?: string;
  testTime?: string;
}

const leadStageOrder: LeadStage[] = ['NEW', 'CONSULTING', 'TOUR', 'TESTING', 'OFFER', 'RESERVED', 'ENROLLED'];
const advancedStages: LeadStage[] = ['OFFER', 'RESERVED', 'ENROLLED'];
const testedStages: LeadStage[] = ['TESTING', 'OFFER', 'RESERVED', 'ENROLLED'];
const financialStages: LeadStage[] = ['RESERVED', 'ENROLLED'];

const normalizeLeadStage = (stage: unknown): LeadStage => {
  if (typeof stage !== 'string') return 'NEW';
  const value = stage.toUpperCase();
  if (leadStageOrder.includes(value as LeadStage)) return value as LeadStage;
  if (value === 'LEAD' || value === 'ADS') return 'NEW';
  if (value === 'OPEN_DAY' || value === 'VISIT') return 'TOUR';
  if (value === 'SCHOLARSHIP' || value === 'OFFERED') return 'OFFER';
  return 'CONSULTING';
};

const normalizeLeadSource = (source: unknown): LeadSource => {
  const allowed: LeadSource[] = ['Social', 'Website', 'Referral', 'Event', 'Google', 'Facebook', 'TikTok'];
  return allowed.includes(source as LeadSource) ? source as LeadSource : 'Website';
};

const inferInterestLevel = (lead: Partial<Lead>, stage: LeadStage): InterestLevel => {
  if (lead.interestLevel) return lead.interestLevel;
  if (['OFFER', 'RESERVED', 'ENROLLED'].includes(stage)) return 'HOT';
  if (stage === 'TESTING' || stage === 'TOUR') return 'WARM';
  return 'COLD';
};

const getDefaultFollowUpDate = (stage: LeadStage) => {
  const days = stage === 'NEW' ? 0 : stage === 'CONSULTING' ? 1 : stage === 'TOUR' ? 2 : stage === 'TESTING' ? 1 : 3;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const normalizeLead = (raw: Partial<Lead>): Lead => {
  const stage = normalizeLeadStage(raw.stage);
  const source = normalizeLeadSource(raw.source);
  const checklist = raw.docChecklist || { hocBa: false, khaiSinh: false, anh3x4: false };
  return {
    id: raw.id || `lead_${Date.now()}`,
    studentName: raw.studentName || '',
    parentName: raw.parentName || '',
    phone: raw.phone || '',
    email: raw.email || '',
    stage,
    source,
    grade: raw.grade || 'Lớp 10',
    notes: raw.notes || '',
    interactions: Array.isArray(raw.interactions) ? raw.interactions : [],
    testScore: raw.testScore,
    scholarshipInfo: raw.scholarshipInfo,
    docChecklist: {
      hocBa: Boolean(checklist.hocBa),
      khaiSinh: Boolean(checklist.khaiSinh),
      anh3x4: Boolean(checklist.anh3x4),
      cccdParent: Boolean(checklist.cccdParent),
      healthRecord: Boolean(checklist.healthRecord),
      paymentProof: Boolean(checklist.paymentProof),
      admissionForm: Boolean(checklist.admissionForm),
    },
    campaignName: raw.campaignName || `${source} tuyển sinh 2026`,
    adChannel: raw.adChannel || source,
    leadOwner: raw.leadOwner || 'Phòng Tuyển sinh',
    interestLevel: inferInterestLevel(raw, stage),
    nextFollowUpDate: raw.nextFollowUpDate || (stage !== 'ENROLLED' ? getDefaultFollowUpDate(stage) : ''),
    currentSchool: raw.currentSchool || 'Chưa cập nhật',
    expectedRevenue: raw.expectedRevenue ?? raw.baseTuitionFee ?? 60000000,
    adCost: raw.adCost ?? (source === 'Referral' ? 0 : 250000),
    baseTuitionFee: raw.baseTuitionFee,
    tuitionDiscount: raw.tuitionDiscount,
    scholarshipDiscount: raw.scholarshipDiscount,
    phaseEnrollmentDiscount: raw.phaseEnrollmentDiscount,
    advancedFee: raw.advancedFee,
    otherDiscount: raw.otherDiscount,
    testDate: raw.testDate,
    testTime: raw.testTime,
  };
};

export default function SchoolCrmHub() {
  const defaultLeads: Lead[] = [
    {
      id: 'lead_1',
      studentName: 'Nguyễn Minh Anh',
      parentName: 'Nguyễn Văn Hải',
      phone: '0912345678',
      email: 'hai.nguyen@gmail.com',
      stage: 'CONSULTING',
      source: 'Social',
      grade: 'Lớp 10',
      notes: 'Đăng ký tìm hiểu lớp 10 chất lượng cao chuyên Anh.',
      docChecklist: { hocBa: false, khaiSinh: false, anh3x4: false },
      interactions: [
        { date: '2026-06-09', type: 'Đăng ký Form', content: 'Quan tâm chính sách học bổng đầu vào' }
      ]
    },
    {
      id: 'lead_2',
      studentName: 'Trần Bảo Nam',
      parentName: 'Lê Thị Thu',
      phone: '0987654321',
      email: 'thu.le@gmail.com',
      stage: 'CONSULTING',
      source: 'Website',
      grade: 'Lớp 10',
      notes: 'Đang tư vấn lộ trình học song bằng Cambridge.',
      docChecklist: { hocBa: false, khaiSinh: true, anh3x4: false },
      interactions: [
        { date: '2026-06-08', type: 'Gọi điện', content: 'Tư vấn biểu phí và chương trình bồi dưỡng học sinh' }
      ]
    },
    {
      id: 'lead_3',
      studentName: 'Phạm Tiến Dũng',
      parentName: 'Phạm Văn Thành',
      phone: '0905123456',
      email: 'thanh.pham@gmail.com',
      stage: 'TESTING',
      source: 'Referral',
      grade: 'Lớp 10',
      notes: 'Đăng ký kiểm tra năng lực đầu vào môn Toán & tiếng Anh.',
      docChecklist: { hocBa: false, khaiSinh: true, anh3x4: true },
      testDate: '2026-06-15',
      testTime: '09:00',
      interactions: [
        { date: '2026-06-09', type: 'Đặt lịch', content: 'Xác nhận tham quan cơ sở vật chất và đặt lịch hẹn kiểm tra ngày 15/06/2026 lúc 09:00' }
      ]
    },
    {
      id: 'lead_4',
      studentName: 'Đặng Hoàng Nam',
      parentName: 'Đặng Quốc Hưng',
      phone: '0904223344',
      email: 'hung.dang@gmail.com',
      stage: 'TESTING',
      source: 'Event',
      grade: 'Lớp 10',
      notes: 'Đã hoàn thành bài kiểm tra học bổng đầu vào.',
      testScore: '8.5/10 (Toán: 8.0, Anh: 9.0)',
      scholarshipInfo: 'Học bổng 30% học phí',
      docChecklist: { hocBa: false, khaiSinh: true, anh3x4: true },
      interactions: [
        { date: '2026-06-07', type: 'Kiểm tra', content: 'Hoàn tất bài test đạt điểm giỏi và xét học bổng' }
      ]
    },
    {
      id: 'lead_5',
      studentName: 'Nguyễn Thùy Chi',
      parentName: 'Nguyễn Văn Thắng',
      phone: '0977889900',
      email: 'thang.nguyen@gmail.com',
      stage: 'RESERVED',
      source: 'Social',
      grade: 'Lớp 10',
      notes: 'Đạt điểm test cao nhưng đang cân nhắc ưu đãi học phí bên trường quốc tế khác.',
      testScore: '9.0/10 (Toán: 9.5, Anh: 8.5)',
      scholarshipInfo: 'Học bổng 50% học phí',
      docChecklist: { hocBa: false, khaiSinh: false, anh3x4: false },
      interactions: [
        { date: '2026-06-06', type: 'Tư vấn', content: 'Gọi điện thoại giải thích thêm chính sách học phí' }
      ]
    },
    {
      id: 'lead_6',
      studentName: 'Lê Quỳnh Chi',
      parentName: 'Đỗ Thị Lan',
      phone: '0944112233',
      email: 'lan.do@gmail.com',
      stage: 'RESERVED',
      source: 'Event',
      grade: 'Lớp 10',
      notes: 'Đã đóng 5.000.000đ phí giữ chỗ nhận ưu đãi tuyển sinh sớm.',
      testScore: '8.0/10',
      scholarshipInfo: 'Không có học bổng',
      docChecklist: { hocBa: true, khaiSinh: true, anh3x4: false },
      baseTuitionFee: 60000000,
      tuitionDiscount: 2000000,
      scholarshipDiscount: 0,
      phaseEnrollmentDiscount: 1500000,
      advancedFee: 3000000,
      otherDiscount: 500000,
      interactions: [
        { date: '2026-06-05', type: 'Đóng phí giữ chỗ', content: 'Thu học phí giữ chỗ 5.000.000đ thành công' }
      ]
    },
    {
      id: 'lead_7',
      studentName: 'Bùi Tiến Đạt',
      parentName: 'Bùi Văn Hùng',
      phone: '0911223344',
      email: 'hung.bui@gmail.com',
      stage: 'RESERVED',
      source: 'Website',
      grade: 'Lớp 10',
      notes: 'Đã nộp đầy đủ hồ sơ học bạ THCS gốc và giấy chứng nhận học sinh giỏi cấp quận.',
      testScore: '8.5/10',
      scholarshipInfo: 'Học bổng 30%',
      docChecklist: { hocBa: true, khaiSinh: true, anh3x4: true },
      baseTuitionFee: 60000000,
      tuitionDiscount: 2000000,
      scholarshipDiscount: 18000000,
      phaseEnrollmentDiscount: 1500000,
      advancedFee: 3000000,
      otherDiscount: 0,
      interactions: [
        { date: '2026-06-03', type: 'Nộp hồ sơ', content: 'Thu nhận học bạ gốc và hồ sơ nhập học đầy đủ' }
      ]
    },
    {
      id: 'lead_8',
      studentName: 'Hoàng Minh Ngọc',
      parentName: 'Hoàng Văn Lâm',
      phone: '0933445566',
      email: 'lam.hoang@gmail.com',
      stage: 'ENROLLED',
      source: 'Website',
      grade: 'Lớp 10',
      notes: 'Đã hoàn tất học phí đợt 1 và nhận đồng phục.',
      testScore: '9.5/10',
      scholarshipInfo: 'Học bổng 70% tuyển thẳng',
      docChecklist: { hocBa: true, khaiSinh: true, anh3x4: true },
      baseTuitionFee: 60000000,
      tuitionDiscount: 3000000,
      scholarshipDiscount: 42000000,
      phaseEnrollmentDiscount: 2000000,
      advancedFee: 4500000,
      otherDiscount: 1000000,
      interactions: [
        { date: '2026-06-01', type: 'Nhập học', content: 'Xác nhận thu học phí học kỳ I và phát đồng phục' }
      ]
    }
  ];

  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_crm_leads');
      if (saved) {
        try {
          return JSON.parse(saved).map(normalizeLead);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return defaultLeads.map(normalizeLead);
  });

  React.useEffect(() => {
    localStorage.setItem('school_crm_leads', JSON.stringify(leads));
  }, [leads]);

  // Selected Lead Details Modal
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId) || null, [leads, selectedLeadId]);

  // Edit Lead State
  const [isEditing, setIsEditing] = useState(false);
  const [editStudentName, setEditStudentName] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSource, setEditSource] = useState<LeadSource>('Social');
  const [editStage, setEditStage] = useState<LeadStage>('CONSULTING');
  const [editGrade, setEditGrade] = useState('Lớp 10');
  const [editNotes, setEditNotes] = useState('');
  const [editTestScore, setEditTestScore] = useState('');
  const [editScholarshipInfo, setEditScholarshipInfo] = useState('');
  const [editDocHocBa, setEditDocHocBa] = useState(false);
  const [editDocKhaiSinh, setEditDocKhaiSinh] = useState(false);
  const [editDocAnh3x4, setEditDocAnh3x4] = useState(false);
  // Financial fields
  const [editBaseTuitionFee, setEditBaseTuitionFee] = useState('');
  const [editTuitionDiscount, setEditTuitionDiscount] = useState('');
  const [editScholarshipDiscount, setEditScholarshipDiscount] = useState('');
  const [editPhaseEnrollmentDiscount, setEditPhaseEnrollmentDiscount] = useState('');
  const [editAdvancedFee, setEditAdvancedFee] = useState('');
  const [editOtherDiscount, setEditOtherDiscount] = useState('');
  // Scheduling fields
  const [editTestDate, setEditTestDate] = useState('');
  const [editTestTime, setEditTestTime] = useState('');

  // Form State
  const [showAddLead, setShowAddLead] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSource, setNewSource] = useState<LeadSource>('Social');
  const [newStage, setNewStage] = useState<LeadStage>('NEW');
  const [newGrade, setNewGrade] = useState('Lớp 10');
  const [newNotes, setNewNotes] = useState('');
  const [newTestScore, setNewTestScore] = useState('');
  const [newScholarshipInfo, setNewScholarshipInfo] = useState('');
  const [newDocHocBa, setNewDocHocBa] = useState(false);
  const [newDocKhaiSinh, setNewDocKhaiSinh] = useState(false);
  const [newDocAnh3x4, setNewDocAnh3x4] = useState(false);
  // Financial fields
  const [newBaseTuitionFee, setNewBaseTuitionFee] = useState('');
  const [newTuitionDiscount, setNewTuitionDiscount] = useState('');
  const [newScholarshipDiscount, setNewScholarshipDiscount] = useState('');
  const [newPhaseEnrollmentDiscount, setNewPhaseEnrollmentDiscount] = useState('');
  const [newAdvancedFee, setNewAdvancedFee] = useState('');
  const [newOtherDiscount, setNewOtherDiscount] = useState('');
  // Scheduling fields
  const [newTestDate, setNewTestDate] = useState('');
  const [newTestTime, setNewTestTime] = useState('');

  // Quick Import State
  const [showQuickImport, setShowQuickImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<Omit<Lead, 'id' | 'interactions'>[]>([]);
  const [skipImportDuplicates, setSkipImportDuplicates] = useState(true);

  // Email Notification State
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailAlert, setEmailAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [interactionType, setInteractionType] = useState('Gọi điện');
  const [interactionContent, setInteractionContent] = useState('');

  const stages: { key: LeadStage; label: string; shortLabel: string; bg: string; text: string }[] = [
    { key: 'NEW', label: 'Lead quảng cáo mới', shortLabel: 'Lead mới', bg: 'bg-slate-50/80 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800', text: 'text-slate-700 dark:text-slate-300' },
    { key: 'CONSULTING', label: 'Tư vấn phụ huynh', shortLabel: 'Tư vấn', bg: 'bg-blue-50/50 border-blue-150 dark:bg-blue-950/20 dark:border-blue-900', text: 'text-blue-700 dark:text-blue-300' },
    { key: 'TOUR', label: 'Open Day / School Tour', shortLabel: 'Tour', bg: 'bg-violet-50/50 border-violet-200 dark:bg-violet-950/20 dark:border-violet-900', text: 'text-violet-700 dark:text-violet-300' },
    { key: 'TESTING', label: 'Kiểm tra năng lực', shortLabel: 'Test', bg: 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900', text: 'text-amber-700 dark:text-amber-300' },
    { key: 'OFFER', label: 'Xét học bổng / Offer', shortLabel: 'Offer', bg: 'bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900', text: 'text-orange-700 dark:text-orange-300' },
    { key: 'RESERVED', label: 'Giữ chỗ & Hồ sơ', shortLabel: 'Giữ chỗ', bg: 'bg-cyan-50/50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-900', text: 'text-cyan-700 dark:text-cyan-300' },
    { key: 'ENROLLED', label: 'Đã nhập học', shortLabel: 'Nhập học', bg: 'bg-emerald-50/50 border-emerald-150 dark:bg-emerald-950/20 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-355' }
  ];

  // Helper to compute document processing status
  const getDocumentStatus = (lead: Lead) => {
    const checklist = normalizeLead(lead).docChecklist!;
    const count = [
      checklist.hocBa,
      checklist.khaiSinh,
      checklist.anh3x4,
      checklist.cccdParent,
      checklist.healthRecord,
      checklist.paymentProof,
      checklist.admissionForm,
    ].filter(Boolean).length;
    if (count >= 7) return { label: 'Đầy đủ', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40', count };
    if (count > 0) return { label: 'Thiếu hồ sơ', bg: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40', count };
    return { label: 'Chưa nộp', bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', count };
  };

  // Currency Formatter Helper
  const formatCurrency = (val?: number) => {
    if (val === undefined || isNaN(val)) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Dynamic calculations
  const enrolledCount = useMemo(() => leads.filter(l => l.stage === 'ENROLLED').length, [leads]);
  const reservedCount = useMemo(() => leads.filter(l => l.stage === 'RESERVED').length, [leads]);
  const testedCount = useMemo(() => leads.filter(l => testedStages.includes(l.stage)).length, [leads]);
  const registeredCount = useMemo(() => leads.filter(l => financialStages.includes(l.stage) && getDocumentStatus(l).count >= 7).length, [leads]);
  const consultingCount = useMemo(() => leads.filter(l => ['NEW', 'CONSULTING', 'TOUR'].includes(l.stage)).length, [leads]);
  const offerCount = useMemo(() => leads.filter(l => l.stage === 'OFFER').length, [leads]);

  // Duplicate check memos for Add Lead
  const isAddPhoneDuplicate = useMemo(() => {
    if (!newPhone.trim()) return false;
    return leads.some(l => l.phone === newPhone.trim());
  }, [leads, newPhone]);

  const isAddEmailDuplicate = useMemo(() => {
    if (!newEmail.trim()) return false;
    return leads.some(l => l.email && l.email.toLowerCase() === newEmail.trim().toLowerCase());
  }, [leads, newEmail]);

  // Duplicate check memos for Edit Lead
  const isEditPhoneDuplicate = useMemo(() => {
    if (!editPhone.trim() || !selectedLeadId) return false;
    return leads.some(l => l.id !== selectedLeadId && l.phone === editPhone.trim());
  }, [leads, editPhone, selectedLeadId]);

  const isEditEmailDuplicate = useMemo(() => {
    if (!editEmail.trim() || !selectedLeadId) return false;
    return leads.some(l => l.id !== selectedLeadId && l.email && l.email.toLowerCase() === editEmail.trim().toLowerCase());
  }, [leads, editEmail, selectedLeadId]);

  // Source chart data
  const sourceChartData = useMemo(() => {
    const counts: Record<LeadSource, number> = { Social: 0, Website: 0, Referral: 0, Event: 0, Google: 0, Facebook: 0, TikTok: 0 };
    leads.forEach(l => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.entries(counts).filter(([, value]) => value > 0).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const conversionDashboard = useMemo(() => {
    return stages.map((stage, index) => {
      const count = leads.filter(l => l.stage === stage.key).length;
      const previousCount = index === 0 ? leads.length : leads.filter(l => stages.findIndex(s => s.key === l.stage) >= index - 1).length;
      const conversion = previousCount > 0 ? Math.round((count / previousCount) * 100) : 0;
      return { ...stage, count, conversion };
    });
  }, [leads, stages]);

  const overdueFollowUps = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return leads
      .filter(l => l.stage !== 'ENROLLED' && l.nextFollowUpDate && l.nextFollowUpDate <= today)
      .sort((a, b) => (a.nextFollowUpDate || '').localeCompare(b.nextFollowUpDate || ''))
      .slice(0, 6);
  }, [leads]);

  const upcomingTests = useMemo(() => {
    return leads
      .filter(l => l.testDate)
      .sort((a, b) => (a.testDate || '').localeCompare(b.testDate || ''))
      .slice(0, 6);
  }, [leads]);

  const marketingDashboard = useMemo(() => {
    const bySource = new Map<LeadSource, { source: LeadSource; leads: number; enrolled: number; cost: number; revenue: number }>();
    leads.forEach(lead => {
      const current = bySource.get(lead.source) || { source: lead.source, leads: 0, enrolled: 0, cost: 0, revenue: 0 };
      current.leads += 1;
      current.enrolled += lead.stage === 'ENROLLED' ? 1 : 0;
      current.cost += lead.adCost || 0;
      current.revenue += lead.stage === 'ENROLLED' ? (lead.expectedRevenue || lead.baseTuitionFee || 0) : 0;
      bySource.set(lead.source, current);
    });
    return Array.from(bySource.values()).sort((a, b) => b.leads - a.leads);
  }, [leads]);

  // Export CSV function
  const handleExportCsv = () => {
    const headers = [
      'ID', 'Tên Học Sinh', 'Tên Phụ Huynh', 'Số Điện Thoại', 'Email', 
      'Trạng Thái Tuyển Sinh', 'Nguồn Tiếp Cận', 'Chiến Dịch', 'Tư Vấn Viên', 'Mức Quan Tâm', 'Chăm Sóc Tiếp Theo', 'Điểm Test', 'Học Bổng', 
      'Học Bạ Gốc', 'Bản Sao Khai Sinh', 'Ảnh 3x4', 'CCCD Phụ Huynh', 'Hồ Sơ Y Tế', 'Xác Nhận Đóng Phí', 'Đơn Nhập Học', 'Trạng Thái Hồ Sơ', 
      'Học Phí Gốc', 'Ưu Đãi Học Phí', 'Ưu Đãi Học Bổng', 'Ưu Đãi Đóng Sớm', 
      'Phí Bổ Trợ', 'Ưu Đãi Khác', 'Tổng Ưu Đãi', 'Lịch Test', 'Ghi Chú'
    ];
    
    const rows = leads.map(l => {
      const docStatus = getDocumentStatus(l);
      const totalDiscount = (l.tuitionDiscount || 0) + (l.scholarshipDiscount || 0) + (l.phaseEnrollmentDiscount || 0) + (l.otherDiscount || 0);
      const testSchedule = l.testDate ? `${l.testDate} ${l.testTime || ''}`.trim() : '';
      return [
        l.id,
        l.studentName,
        l.parentName,
        l.phone,
        l.email || '',
        stages.find(s => s.key === l.stage)?.label || l.stage,
        l.source,
        l.campaignName || '',
        l.leadOwner || '',
        l.interestLevel || '',
        l.nextFollowUpDate || '',
        l.testScore || '',
        l.scholarshipInfo || '',
        l.docChecklist?.hocBa ? 'Đã nộp' : 'Chưa nộp',
        l.docChecklist?.khaiSinh ? 'Đã nộp' : 'Chưa nộp',
        l.docChecklist?.anh3x4 ? 'Đã nộp' : 'Chưa nộp',
        l.docChecklist?.cccdParent ? 'Đã nộp' : 'Chưa nộp',
        l.docChecklist?.healthRecord ? 'Đã nộp' : 'Chưa nộp',
        l.docChecklist?.paymentProof ? 'Đã nộp' : 'Chưa nộp',
        l.docChecklist?.admissionForm ? 'Đã nộp' : 'Chưa nộp',
        docStatus.label,
        l.baseTuitionFee || 0,
        l.tuitionDiscount || 0,
        l.scholarshipDiscount || 0,
        l.phaseEnrollmentDiscount || 0,
        l.advancedFee || 0,
        l.otherDiscount || 0,
        totalDiscount,
        testSchedule,
        l.notes.replace(/"/g, '""')
      ];
    });

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BaoCao_Tuyensinh_CRM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buildCrmReportRows = () => {
    return leads.map(l => {
      const docStatus = getDocumentStatus(l);
      const totalDiscount = (l.tuitionDiscount || 0) + (l.scholarshipDiscount || 0) + (l.phaseEnrollmentDiscount || 0) + (l.otherDiscount || 0);
      const testSchedule = l.testDate ? `${l.testDate} ${l.testTime || ''}`.trim() : 'Chưa xếp lịch';
      return {
        id: l.id,
        studentName: l.studentName,
        parentName: l.parentName,
        phone: l.phone,
        email: l.email || 'Chưa cung cấp',
        stage: stages.find(s => s.key === l.stage)?.label || l.stage,
        source: l.source,
        campaignName: l.campaignName || 'Chưa gắn chiến dịch',
        leadOwner: l.leadOwner || 'Phòng Tuyển sinh',
        interestLevel: l.interestLevel || 'WARM',
        nextFollowUpDate: l.nextFollowUpDate || '',
        testScore: l.testScore || 'Chưa có',
        scholarshipInfo: l.scholarshipInfo || 'Không',
        hocBa: l.docChecklist?.hocBa ? 'Đã nộp' : 'Chưa nộp',
        khaiSinh: l.docChecklist?.khaiSinh ? 'Đã nộp' : 'Chưa nộp',
        anh3x4: l.docChecklist?.anh3x4 ? 'Đã nộp' : 'Chưa nộp',
        cccdParent: l.docChecklist?.cccdParent ? 'Đã nộp' : 'Chưa nộp',
        healthRecord: l.docChecklist?.healthRecord ? 'Đã nộp' : 'Chưa nộp',
        paymentProof: l.docChecklist?.paymentProof ? 'Đã nộp' : 'Chưa nộp',
        admissionForm: l.docChecklist?.admissionForm ? 'Đã nộp' : 'Chưa nộp',
        docStatus: docStatus.label,
        baseTuitionFee: l.baseTuitionFee || 0,
        tuitionDiscount: l.tuitionDiscount || 0,
        scholarshipDiscount: l.scholarshipDiscount || 0,
        phaseEnrollmentDiscount: l.phaseEnrollmentDiscount || 0,
        advancedFee: l.advancedFee || 0,
        otherDiscount: l.otherDiscount || 0,
        totalDiscount,
        testSchedule,
        notes: l.notes || '',
      };
    });
  };

  const escapeHtml = (value: string | number) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const downloadReportFile = (content: string, fileName: string, type: string) => {
    const blob = new Blob(['\uFEFF', content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const rows = buildCrmReportRows();
    const reportDate = new Date().toLocaleDateString('vi-VN');
    const fileDate = new Date().toISOString().split('T')[0];
    const columns = [
      ['id', 'Mã lead'],
      ['studentName', 'Học sinh'],
      ['parentName', 'Phụ huynh'],
      ['phone', 'Số điện thoại'],
      ['email', 'Email'],
      ['stage', 'Trạng thái tuyển sinh'],
      ['source', 'Nguồn'],
      ['campaignName', 'Chiến dịch'],
      ['leadOwner', 'Tư vấn phụ trách'],
      ['interestLevel', 'Mức quan tâm'],
      ['nextFollowUpDate', 'Ngày chăm sóc tiếp theo'],
      ['testScore', 'Điểm test'],
      ['scholarshipInfo', 'Học bổng'],
      ['hocBa', 'Học bạ gốc'],
      ['khaiSinh', 'Khai sinh'],
      ['anh3x4', 'Ảnh 3x4'],
      ['cccdParent', 'CCCD phụ huynh'],
      ['healthRecord', 'Hồ sơ y tế'],
      ['paymentProof', 'Xác nhận đóng phí'],
      ['admissionForm', 'Đơn nhập học'],
      ['docStatus', 'Tình trạng hồ sơ'],
      ['baseTuitionFee', 'Học phí gốc'],
      ['tuitionDiscount', 'Ưu đãi học phí'],
      ['scholarshipDiscount', 'Ưu đãi học bổng'],
      ['phaseEnrollmentDiscount', 'Ưu đãi đóng sớm'],
      ['advancedFee', 'Phí bổ trợ'],
      ['otherDiscount', 'Ưu đãi khác'],
      ['totalDiscount', 'Tổng ưu đãi'],
      ['testSchedule', 'Lịch test'],
      ['notes', 'Ghi chú tư vấn'],
    ] as const;

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; }
            h1 { font-size: 20px; margin: 0 0 6px; }
            .meta { color: #475569; margin: 0 0 16px; }
            table { border-collapse: collapse; width: 100%; }
            th { background: #1e293b; color: #ffffff; font-weight: 700; text-align: left; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; font-size: 12px; }
            td.money { mso-number-format:"#,##0"; text-align: right; }
            .summary td { font-weight: 700; background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO TUYỂN SINH CRM - MIS SMART PORTAL</h1>
          <p class="meta">Ngày xuất báo cáo: ${escapeHtml(reportDate)} | Tổng số lead: ${rows.length} | Đã nhập học: ${enrolledCount} | Đã giữ chỗ: ${reservedCount}</p>
          <table>
            <thead>
              <tr>${columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${columns.map(([key]) => {
                    const isMoney = ['baseTuitionFee', 'tuitionDiscount', 'scholarshipDiscount', 'phaseEnrollmentDiscount', 'advancedFee', 'otherDiscount', 'totalDiscount'].includes(key);
                    return `<td class="${isMoney ? 'money' : ''}">${escapeHtml(row[key])}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    downloadReportFile(html, `BaoCao_Tuyensinh_CRM_${fileDate}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  };

  const handleExportWord = () => {
    const rows = buildCrmReportRows();
    const reportDate = new Date().toLocaleDateString('vi-VN');
    const fileDate = new Date().toISOString().split('T')[0];
    const stageSummary = stages
      .map(stage => ({ label: stage.label, count: leads.filter(l => l.stage === stage.key).length }))
      .filter(item => item.count > 0);

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #111827; line-height: 1.45; }
            h1 { text-align: center; font-size: 22px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin-top: 22px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
            .meta { text-align: center; color: #475569; margin-bottom: 18px; }
            .summary { display: table; width: 100%; margin: 12px 0 18px; }
            .summary div { display: table-cell; border: 1px solid #cbd5e1; padding: 10px; background: #f8fafc; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #1e293b; color: white; text-align: left; }
            th, td { border: 1px solid #cbd5e1; padding: 7px; font-size: 11px; vertical-align: top; }
            .lead-card { border: 1px solid #cbd5e1; padding: 10px 12px; margin: 8px 0; border-radius: 6px; }
            .lead-card strong { color: #1e40af; }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO TUYỂN SINH CRM</h1>
          <p class="meta">MIS Smart Portal | Ngày xuất báo cáo: ${escapeHtml(reportDate)}</p>

          <div class="summary">
            <div>Tổng lead: ${rows.length}</div>
            <div>Đã test: ${testedCount}</div>
            <div>Đã giữ chỗ: ${reservedCount}</div>
            <div>Đã nhập học: ${enrolledCount}</div>
          </div>

          <h2>1. Tổng hợp theo trạng thái</h2>
          <table>
            <thead><tr><th>Trạng thái</th><th>Số lượng</th></tr></thead>
            <tbody>
              ${stageSummary.map(item => `<tr><td>${escapeHtml(item.label)}</td><td>${item.count}</td></tr>`).join('')}
            </tbody>
          </table>

          <h2>2. Danh sách hồ sơ cần theo dõi</h2>
          ${rows.map(row => `
            <div class="lead-card">
              <p><strong>${escapeHtml(row.studentName)}</strong> - ${escapeHtml(row.stage)}</p>
              <p>Phụ huynh: ${escapeHtml(row.parentName)} | SĐT: ${escapeHtml(row.phone)} | Email: ${escapeHtml(row.email)}</p>
              <p>Điểm test: ${escapeHtml(row.testScore)} | Học bổng: ${escapeHtml(row.scholarshipInfo)} | Hồ sơ: ${escapeHtml(row.docStatus)}</p>
              <p>Lịch test: ${escapeHtml(row.testSchedule)}</p>
              <p>Ghi chú: ${escapeHtml(row.notes)}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    downloadReportFile(html, `BaoCao_Tuyensinh_CRM_${fileDate}.doc`, 'application/msword;charset=utf-8');
  };

  // Excel copy-paste TSV parser
  const handleParseImportText = (text: string) => {
    if (!text.trim()) {
      setImportPreview([]);
      return;
    }

    const lines = text.split(/\r?\n/);
    const parsed: Omit<Lead, 'id' | 'interactions'>[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;
      
      const cols = line.includes('\t') ? line.split('\t') : line.split(',');
      if (cols.length < 3 || !cols[0].trim() || !cols[1].trim() || !cols[2].trim()) return;

      const studentName = cols[0].trim();
      const parentName = cols[1].trim();
      const phone = cols[2].trim();
      const email = cols[3]?.trim() || '';
      
      let source: LeadSource = 'Social';
      const rawSource = cols[4]?.trim().toLowerCase();
      if (rawSource?.includes('web')) source = 'Website';
      else if (rawSource?.includes('google')) source = 'Google';
      else if (rawSource?.includes('facebook')) source = 'Facebook';
      else if (rawSource?.includes('tiktok')) source = 'TikTok';
      else if (rawSource?.includes('refer') || rawSource?.includes('gioi thieu')) source = 'Referral';
      else if (rawSource?.includes('event') || rawSource?.includes('su kien')) source = 'Event';

      const notes = cols[5]?.trim() || 'Import từ danh sách hàng loạt';
      const testScore = cols[6]?.trim() || undefined;
      const scholarshipInfo = cols[7]?.trim() || undefined;
      
      let grade = 'Lớp 10';
      if (notes.includes('10')) grade = 'Lớp 10';
      else if (notes.includes('11')) grade = 'Lớp 11';
      else if (notes.includes('12')) grade = 'Lớp 12';

      let stage: LeadStage = 'NEW';
      const rawStage = cols[8]?.trim().toLowerCase();
      if (rawStage?.includes('lead') || rawStage?.includes('quang cao')) stage = 'NEW';
      else if (rawStage?.includes('tu van')) stage = 'CONSULTING';
      else if (rawStage?.includes('tour') || rawStage?.includes('open day') || rawStage?.includes('tham quan')) stage = 'TOUR';
      else if (rawStage?.includes('test') || rawStage?.includes('lich')) stage = 'TESTING';
      else if (rawStage?.includes('hoc bong') || rawStage?.includes('offer')) stage = 'OFFER';
      else if (rawStage?.includes('giu') || rawStage?.includes('ho so') || rawStage?.includes('nop')) stage = 'RESERVED';
      else if (rawStage?.includes('nhap hoc') || rawStage?.includes('enrolled')) stage = 'ENROLLED';

      parsed.push({
        studentName,
        parentName,
        phone,
        email,
        stage,
        source,
        notes,
        testScore,
        scholarshipInfo,
        grade,
        campaignName: cols[9]?.trim() || `${source} tuyển sinh 2026`,
        leadOwner: cols[10]?.trim() || 'Phòng Tuyển sinh',
        interestLevel: stage === 'NEW' ? 'COLD' : stage === 'CONSULTING' ? 'WARM' : 'HOT',
        nextFollowUpDate: stage !== 'ENROLLED' ? getDefaultFollowUpDate(stage) : '',
        docChecklist: {
          hocBa: financialStages.includes(stage),
          khaiSinh: financialStages.includes(stage),
          anh3x4: financialStages.includes(stage),
          cccdParent: financialStages.includes(stage),
          healthRecord: false,
          paymentProof: stage === 'ENROLLED',
          admissionForm: stage === 'ENROLLED',
        }
      });
    });

    setImportPreview(parsed);
  };

  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;

    const filteredPreview = skipImportDuplicates
      ? importPreview.filter(item => {
          const isDup = leads.some(l => 
            l.phone === item.phone || 
            (item.email && l.email && l.email.toLowerCase() === item.email.toLowerCase())
          );
          return !isDup;
        })
      : importPreview;

    if (filteredPreview.length === 0) {
      alert("Tất cả các bản ghi nhập vào đều trùng lặp và đã được bỏ qua!");
      setImportPreview([]);
      setImportText('');
      setShowQuickImport(false);
      return;
    }

    const newLeads: Lead[] = filteredPreview.map((item, idx) => normalizeLead({
      ...item,
      id: `import_${Date.now()}_${idx}`,
      interactions: [
        {
          date: new Date().toISOString().split('T')[0],
          type: 'Import Excel',
          content: 'Khởi tạo hàng loạt từ file Excel/Sheets',
        },
      ],
    }));

    setLeads(prev => [...prev, ...newLeads]);
    setImportText('');
    setImportPreview([]);
    setShowQuickImport(false);
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newParentName.trim() || !newPhone.trim()) return;

    if (isAddPhoneDuplicate || isAddEmailDuplicate) {
      const confirmMsg = `Phát hiện thông tin học sinh trùng lặp:\n${isAddPhoneDuplicate ? '- Số điện thoại đã tồn tại\n' : ''}${isAddEmailDuplicate ? '- Email đã tồn tại\n' : ''}\nBạn có chắc chắn vẫn muốn thêm học sinh này?`;
      if (!window.confirm(confirmMsg)) return;
    }

    const hasSchedulingFields = newStage === 'TESTING';
    const hasScoreFields = testedStages.includes(newStage);
    const hasFinancialFields = financialStages.includes(newStage);

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      studentName: newStudentName.trim(),
      parentName: newParentName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      stage: newStage,
      source: newSource,
      grade: newGrade,
      notes: newNotes.trim(),
      campaignName: `${newSource} tuyển sinh 2026`,
      leadOwner: 'Phòng Tuyển sinh',
      interestLevel: newStage === 'NEW' ? 'COLD' : newStage === 'CONSULTING' ? 'WARM' : 'HOT',
      nextFollowUpDate: newStage !== 'ENROLLED' ? getDefaultFollowUpDate(newStage) : '',
      currentSchool: 'Chưa cập nhật',
      expectedRevenue: hasFinancialFields && newBaseTuitionFee.trim() ? Number(newBaseTuitionFee) : 60000000,
      adCost: newSource === 'Referral' ? 0 : 250000,
      testScore: hasScoreFields && newTestScore.trim() ? newTestScore.trim() : undefined,
      scholarshipInfo: hasScoreFields && newScholarshipInfo.trim() ? newScholarshipInfo.trim() : undefined,
      docChecklist: {
        hocBa: newDocHocBa,
        khaiSinh: newDocKhaiSinh,
        anh3x4: newDocAnh3x4,
        cccdParent: false,
        healthRecord: false,
        paymentProof: false,
        admissionForm: false,
      },
      // Financial inputs
      baseTuitionFee: hasFinancialFields && newBaseTuitionFee.trim() ? Number(newBaseTuitionFee) : undefined,
      tuitionDiscount: hasFinancialFields && newTuitionDiscount.trim() ? Number(newTuitionDiscount) : undefined,
      scholarshipDiscount: hasFinancialFields && newScholarshipDiscount.trim() ? Number(newScholarshipDiscount) : undefined,
      phaseEnrollmentDiscount: hasFinancialFields && newPhaseEnrollmentDiscount.trim() ? Number(newPhaseEnrollmentDiscount) : undefined,
      advancedFee: hasFinancialFields && newAdvancedFee.trim() ? Number(newAdvancedFee) : undefined,
      otherDiscount: hasFinancialFields && newOtherDiscount.trim() ? Number(newOtherDiscount) : undefined,
      // Scheduling inputs
      testDate: hasSchedulingFields && newTestDate ? newTestDate : undefined,
      testTime: hasSchedulingFields && newTestTime ? newTestTime : undefined,
      interactions: [
        { 
          date: new Date().toISOString().split('T')[0], 
          type: 'Tạo Lead', 
          content: `Khởi tạo vào CRM với trạng thái ban đầu: ${stages.find(s => s.key === newStage)?.label}` 
        }
      ]
    };

    setLeads([...leads, newLead]);
    setNewStudentName('');
    setNewParentName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
    setNewStage('NEW');
    setNewGrade('Lớp 10');
    setNewTestScore('');
    setNewScholarshipInfo('');
    setNewDocHocBa(false);
    setNewDocKhaiSinh(false);
    setNewDocAnh3x4(false);
    // Reset financial states
    setNewBaseTuitionFee('');
    setNewTuitionDiscount('');
    setNewScholarshipDiscount('');
    setNewPhaseEnrollmentDiscount('');
    setNewAdvancedFee('');
    setNewOtherDiscount('');
    // Reset scheduling states
    setNewTestDate('');
    setNewTestTime('');
    setShowAddLead(false);
  };

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !interactionContent.trim()) return;

    setLeads(prev => prev.map(l => {
      if (l.id === selectedLeadId) {
        return {
          ...l,
          interactions: [
            ...l.interactions,
            {
              date: new Date().toISOString().split('T')[0],
              type: interactionType,
              content: interactionContent.trim()
            }
          ]
        };
      }
      return l;
    }));

    setInteractionContent('');
  };

  const handleMoveStage = (leadId: string, targetStage: Lead['stage']) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: targetStage,
          interestLevel: targetStage === 'NEW' ? 'COLD' : targetStage === 'CONSULTING' ? 'WARM' : 'HOT',
          nextFollowUpDate: targetStage !== 'ENROLLED' ? getDefaultFollowUpDate(targetStage) : '',
          interactions: [
            ...l.interactions,
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Chuyển trạng thái',
              content: `Di chuyển sang bước: ${stages.find(s => s.key === targetStage)?.label}`
            }
          ]
        };
      }
      return l;
    }));
  };

  // Trigger SMTP/Ethereal admissions result email
  const handleSendAdmissionsEmail = async (lead: Lead) => {
    if (!lead.email) {
      setEmailAlert({ type: 'error', message: 'Vui lòng bổ sung địa chỉ email phụ huynh trước khi gửi!' });
      return;
    }

    setSendingEmail(true);
    setEmailAlert(null);

    try {
      const response = await fetch('/api/email/send-admissions-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: lead.studentName,
          parentName: lead.parentName,
          parentEmail: lead.email,
          testScore: lead.testScore || 'Chưa có điểm',
          scholarshipInfo: lead.scholarshipInfo || 'Không nhận học bổng',
          stage: stages.find(s => s.key === lead.stage)?.label || lead.stage
        })
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const errText = await response.text();
        throw new Error(errText || `Server returned status: ${response.status}`);
      }

      if (response.ok && data && data.status === 'success') {
        const message = data.provider === 'Ethereal' 
          ? `Gửi email báo điểm giả lập thành công! Xem trước tại: ${data.previewUrl}`
          : 'Đã gửi email thông báo thực tế tới phụ huynh!';

        setEmailAlert({ type: 'success', message });

        setLeads(prev => prev.map(l => {
          if (l.id === lead.id) {
            return {
              ...l,
              interactions: [
                ...l.interactions,
                {
                  date: new Date().toISOString().split('T')[0],
                  type: 'Gửi Email báo điểm',
                  content: `Đã gửi kết quả cho phụ huynh (${lead.email}). Kết quả: ${lead.testScore || 'Chưa có'}, Học bổng: ${lead.scholarshipInfo || 'Không'}`
                }
              ]
            };
          }
          return l;
        }));
      } else {
        throw new Error((data && data.error) || 'Lỗi gửi email từ server');
      }
    } catch (error: any) {
      console.error(error);
      setEmailAlert({ type: 'error', message: `Không thể gửi email: ${error.message || 'Lỗi kết nối server'}` });
    } finally {
      setSendingEmail(false);
    }
  };

  // Trigger SMTP/Ethereal test invitation email
  const handleSendTestInvitationEmail = async (lead: Lead) => {
    if (!lead.email) {
      setEmailAlert({ type: 'error', message: 'Vui lòng bổ sung địa chỉ email phụ huynh trước khi gửi!' });
      return;
    }
    if (!lead.testDate || !lead.testTime) {
      setEmailAlert({ type: 'error', message: 'Vui lòng cấu hình ngày tháng và giờ thi test của học sinh trước khi gửi!' });
      return;
    }

    setSendingEmail(true);
    setEmailAlert(null);

    try {
      const response = await fetch('/api/email/send-test-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: lead.studentName,
          parentName: lead.parentName,
          parentEmail: lead.email,
          testDate: lead.testDate,
          testTime: lead.testTime
        })
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const errText = await response.text();
        throw new Error(errText || `Server returned status: ${response.status}`);
      }

      if (response.ok && data && data.status === 'success') {
        const message = data.provider === 'Ethereal' 
          ? `Gửi thư mời test giả lập thành công! Xem trước tại: ${data.previewUrl}`
          : 'Đã gửi thư mời kiểm tra thực tế tới phụ huynh!';

        setEmailAlert({ type: 'success', message });

        setLeads(prev => prev.map(l => {
          if (l.id === lead.id) {
            return {
              ...l,
              interactions: [
                ...l.interactions,
                {
                  date: new Date().toISOString().split('T')[0],
                  type: 'Gửi thư mời test',
                  content: `Đã gửi thư mời test cho phụ huynh (${lead.email}). Lịch hẹn: ngày ${lead.testDate} lúc ${lead.testTime}`
                }
              ]
            };
          }
          return l;
        }));
      } else {
        throw new Error((data && data.error) || 'Lỗi gửi thư mời từ server');
      }
    } catch (error: any) {
      console.error(error);
      setEmailAlert({ type: 'error', message: `Không thể gửi thư mời: ${error.message || 'Lỗi kết nối server'}` });
    } finally {
      setSendingEmail(false);
    }
  };

  const startEditing = () => {
    if (!selectedLead) return;
    setEditStudentName(selectedLead.studentName);
    setEditParentName(selectedLead.parentName);
    setEditPhone(selectedLead.phone);
    setEditEmail(selectedLead.email);
    setEditSource(selectedLead.source);
    setEditStage(selectedLead.stage);
    setEditGrade(selectedLead.grade || 'Lớp 10');
    setEditNotes(selectedLead.notes);
    setEditTestScore(selectedLead.testScore || '');
    setEditScholarshipInfo(selectedLead.scholarshipInfo || '');
    setEditDocHocBa(selectedLead.docChecklist?.hocBa || false);
    setEditDocKhaiSinh(selectedLead.docChecklist?.khaiSinh || false);
    setEditDocAnh3x4(selectedLead.docChecklist?.anh3x4 || false);
    // Financial states
    setEditBaseTuitionFee(selectedLead.baseTuitionFee !== undefined ? String(selectedLead.baseTuitionFee) : '');
    setEditTuitionDiscount(selectedLead.tuitionDiscount !== undefined ? String(selectedLead.tuitionDiscount) : '');
    setEditScholarshipDiscount(selectedLead.scholarshipDiscount !== undefined ? String(selectedLead.scholarshipDiscount) : '');
    setEditPhaseEnrollmentDiscount(selectedLead.phaseEnrollmentDiscount !== undefined ? String(selectedLead.phaseEnrollmentDiscount) : '');
    setEditAdvancedFee(selectedLead.advancedFee !== undefined ? String(selectedLead.advancedFee) : '');
    setEditOtherDiscount(selectedLead.otherDiscount !== undefined ? String(selectedLead.otherDiscount) : '');
    // Scheduling states
    setEditTestDate(selectedLead.testDate || '');
    setEditTestTime(selectedLead.testTime || '');
    
    setIsEditing(true);
    setEmailAlert(null);
  };

  const handleCloseModal = () => {
    setSelectedLeadId(null);
    setIsEditing(false);
    setEmailAlert(null);
  };

  // Toggle document checklist inside static view
  const handleToggleDocStatic = (leadId: string, docType: 'hocBa' | 'khaiSinh' | 'anh3x4' | 'cccdParent' | 'healthRecord' | 'paymentProof' | 'admissionForm') => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const nextChecklist = {
          hocBa: l.docChecklist?.hocBa || false,
          khaiSinh: l.docChecklist?.khaiSinh || false,
          anh3x4: l.docChecklist?.anh3x4 || false,
          cccdParent: l.docChecklist?.cccdParent || false,
          healthRecord: l.docChecklist?.healthRecord || false,
          paymentProof: l.docChecklist?.paymentProof || false,
          admissionForm: l.docChecklist?.admissionForm || false,
          [docType]: !(l.docChecklist?.[docType] || false)
        };

        const docLabels = {
          hocBa: 'Học bạ gốc',
          khaiSinh: 'Bản sao Khai sinh',
          anh3x4: 'Ảnh 3x4',
          cccdParent: 'CCCD phụ huynh',
          healthRecord: 'Hồ sơ y tế',
          paymentProof: 'Xác nhận đóng phí',
          admissionForm: 'Đơn nhập học',
        };

        return {
          ...l,
          docChecklist: nextChecklist,
          interactions: [
            ...l.interactions,
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Cập nhật hồ sơ',
              content: `Thay đổi trạng thái ${docLabels[docType]}: ${nextChecklist[docType] ? 'Đã nộp' : 'Rút/Chưa nộp'}`
            }
          ]
        };
      }
      return l;
    }));
  };

  const handleSaveLeadEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !editStudentName.trim() || !editParentName.trim() || !editPhone.trim()) return;

    if (isEditPhoneDuplicate || isEditEmailDuplicate) {
      const confirmMsg = `Phát hiện thông tin học sinh trùng lặp với học sinh khác:\n${isEditPhoneDuplicate ? '- Số điện thoại đã tồn tại\n' : ''}${isEditEmailDuplicate ? '- Email đã tồn tại\n' : ''}\nBạn có chắc chắn vẫn muốn lưu thay đổi này?`;
      if (!window.confirm(confirmMsg)) return;
    }

    setLeads(prev => prev.map(l => {
      if (l.id === selectedLeadId) {
        const logs = [...l.interactions];
        const changes: string[] = [];
        if (l.studentName !== editStudentName.trim()) changes.push(`Tên HS: ${l.studentName} → ${editStudentName.trim()}`);
        if (l.parentName !== editParentName.trim()) changes.push(`Tên PH: ${l.parentName} → ${editParentName.trim()}`);
        if (l.phone !== editPhone.trim()) changes.push(`SĐT: ${l.phone} → ${editPhone.trim()}`);
        if (l.email !== editEmail.trim()) changes.push(`Email: ${l.email || 'Chưa có'} → ${editEmail.trim()}`);
        if (l.stage !== editStage) changes.push(`Trạng thái: ${stages.find(s => s.key === l.stage)?.label} → ${stages.find(s => s.key === editStage)?.label}`);
        if (l.source !== editSource) changes.push(`Nguồn: ${l.source} → ${editSource}`);
        if (l.grade !== editGrade) changes.push(`Khối: ${l.grade || 'Chưa chọn'} → ${editGrade}`);
        if (l.notes !== editNotes.trim()) changes.push(`Ghi chú cập nhật`);
        
        const hasSchedulingFields = editStage === 'TESTING';
        const hasScoreFields = testedStages.includes(editStage);
        const hasFinancialFields = financialStages.includes(editStage);

        const nextScore = hasScoreFields && editTestScore.trim() ? editTestScore.trim() : undefined;
        const nextScholarship = hasScoreFields && editScholarshipInfo.trim() ? editScholarshipInfo.trim() : undefined;
        
        if ((l.testScore || '') !== (nextScore || '')) changes.push(`Điểm test: ${l.testScore || 'Chưa có'} → ${nextScore || 'Chưa có'}`);
        if ((l.scholarshipInfo || '') !== (nextScholarship || '')) changes.push(`Học bổng: ${l.scholarshipInfo || 'Chưa có'} → ${nextScholarship || 'Chưa có'}`);

        if ((l.docChecklist?.hocBa || false) !== editDocHocBa) changes.push(`Học bạ gốc: ${editDocHocBa ? 'Đã nộp' : 'Chưa nộp'}`);
        if ((l.docChecklist?.khaiSinh || false) !== editDocKhaiSinh) changes.push(`Khai sinh: ${editDocKhaiSinh ? 'Đã nộp' : 'Chưa nộp'}`);
        if ((l.docChecklist?.anh3x4 || false) !== editDocAnh3x4) changes.push(`Ảnh 3x4: ${editDocAnh3x4 ? 'Đã nộp' : 'Chưa nộp'}`);

        // Financial values
        const nextBaseTuition = hasFinancialFields && editBaseTuitionFee.trim() ? Number(editBaseTuitionFee) : undefined;
        const nextTuitionDiscount = hasFinancialFields && editTuitionDiscount.trim() ? Number(editTuitionDiscount) : undefined;
        const nextScholarshipDiscount = hasFinancialFields && editScholarshipDiscount.trim() ? Number(editScholarshipDiscount) : undefined;
        const nextPhaseDiscount = hasFinancialFields && editPhaseEnrollmentDiscount.trim() ? Number(editPhaseEnrollmentDiscount) : undefined;
        const nextAdvancedFee = hasFinancialFields && editAdvancedFee.trim() ? Number(editAdvancedFee) : undefined;
        const nextOtherDiscount = hasFinancialFields && editOtherDiscount.trim() ? Number(editOtherDiscount) : undefined;

        if (l.baseTuitionFee !== nextBaseTuition) changes.push(`Học phí gốc: ${formatCurrency(l.baseTuitionFee)} → ${formatCurrency(nextBaseTuition)}`);
        if (l.tuitionDiscount !== nextTuitionDiscount) changes.push(`Ưu đãi học phí: ${formatCurrency(l.tuitionDiscount)} → ${formatCurrency(nextTuitionDiscount)}`);
        
        // Scheduling values
        const nextTestDateVal = hasSchedulingFields && editTestDate ? editTestDate : undefined;
        const nextTestTimeVal = hasSchedulingFields && editTestTime ? editTestTime : undefined;

        if (l.testDate !== nextTestDateVal || l.testTime !== nextTestTimeVal) {
          changes.push(`Lịch test: ${l.testDate || ''} ${l.testTime || ''} → ${nextTestDateVal || ''} ${nextTestTimeVal || ''}`);
        }

        if (changes.length > 0) {
          logs.push({
            date: new Date().toISOString().split('T')[0],
            type: 'Cập nhật thông tin',
            content: changes.join(', ')
          });
        }

        return {
          ...l,
          studentName: editStudentName.trim(),
          parentName: editParentName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          source: editSource,
          stage: editStage,
          grade: editGrade,
          notes: editNotes.trim(),
          interestLevel: editStage === 'NEW' ? 'COLD' : editStage === 'CONSULTING' ? 'WARM' : 'HOT',
          nextFollowUpDate: editStage !== 'ENROLLED' ? (l.nextFollowUpDate || getDefaultFollowUpDate(editStage)) : '',
          expectedRevenue: nextBaseTuition || l.expectedRevenue,
          testScore: nextScore || undefined,
          scholarshipInfo: nextScholarship || undefined,
          docChecklist: {
            hocBa: editDocHocBa,
            khaiSinh: editDocKhaiSinh,
            anh3x4: editDocAnh3x4,
            cccdParent: l.docChecklist?.cccdParent || false,
            healthRecord: l.docChecklist?.healthRecord || false,
            paymentProof: l.docChecklist?.paymentProof || false,
            admissionForm: l.docChecklist?.admissionForm || false,
          },
          // Save Financial Fields
          baseTuitionFee: nextBaseTuition,
          tuitionDiscount: nextTuitionDiscount,
          scholarshipDiscount: nextScholarshipDiscount,
          phaseEnrollmentDiscount: nextPhaseDiscount,
          advancedFee: nextAdvancedFee,
          otherDiscount: nextOtherDiscount,
          // Save Scheduling Fields
          testDate: nextTestDateVal,
          testTime: nextTestTimeVal,
          interactions: logs
        };
      }
      return l;
    }));

    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Admissions Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1 w-fit">
            <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
            Admissions CRM
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Quy trình và dữ liệu tuyển sinh tích hợp</h2>
          <p className="text-xs text-slate-350 max-w-3xl font-light leading-relaxed">
            Theo dõi phễu chuyển đổi tuyển sinh từ đầu vào quảng cáo đến tư vấn phụ huynh, đăng ký kiểm tra năng lực đầu vào, xét học bổng, đặt chỗ giữ vị trí và hoàn tất hồ sơ nhập học.
          </p>
        </div>
      </div>

      {/* CRM Funnel Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Chỉ tiêu & Thực tế</span>
          <strong className="text-2xl font-display font-black text-slate-900 dark:text-white mt-1.5 block">1,500 <span className="text-xs text-slate-400 font-bold font-sans">học sinh</span></strong>
          <span className="text-[10.5px] text-emerald-600 font-bold mt-1 block">Đã nhập học: {1280 + enrolledCount} HS ({( ((1280 + enrolledCount) / 1500) * 100 ).toFixed(1)}%)</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Đã giữ chỗ (Reserved)</span>
          <strong className="text-2xl font-display font-black text-cyan-600 mt-1.5 block">{reservedCount} <span className="text-xs text-slate-455 font-bold font-sans">học sinh</span></strong>
          <span className="text-[10.5px] text-slate-500 mt-1 block">Yêu cầu hoàn thiện nộp hồ sơ gốc</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Tổng số Leads tuyển sinh</span>
          <strong className="text-2xl font-display font-black text-indigo-655 mt-1.5 block">{leads.length} <span className="text-xs text-slate-455 font-bold font-sans">đầu mối</span></strong>
          <span className="text-[10.5px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">Đã thi test đầu vào: {testedCount} HS</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Nộp hồ sơ / Đang tư vấn</span>
          <strong className="text-2xl font-display font-black text-purple-600 mt-1.5 block">{registeredCount} <span className="text-xs text-slate-455 font-bold font-sans">hồ sơ</span></strong>
          <span className="text-[10.5px] text-slate-500 mt-1 block">Đang tư vấn chuyên sâu: {consultingCount} HS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Bản đồ phễu tuyển sinh 7 bước</h3>
              <p className="text-[11px] text-slate-500 mt-1">Theo dõi từ đầu vào quảng cáo đến nhập học, dùng để phát hiện bước đang nghẽn.</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black">
              CVR nhập học {leads.length ? Math.round((enrolledCount / leads.length) * 100) : 0}%
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
            {conversionDashboard.map((step, index) => (
              <div key={step.key} className="rounded-xl border border-slate-150 bg-slate-50/60 dark:bg-slate-900/60 dark:border-slate-800 p-3 min-h-24">
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[10px] font-black text-slate-500 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className={`text-[10px] font-black ${step.text}`}>{step.count}</span>
                </div>
                <p className="mt-2 text-[10.5px] font-extrabold text-slate-800 dark:text-slate-200 leading-snug">{step.shortLabel}</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${leads.length ? Math.min(100, (step.count / leads.length) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Cần chăm sóc ngay</h3>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-100">{overdueFollowUps.length}</span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {overdueFollowUps.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-3">Không có lead quá hạn chăm sóc trong hôm nay.</p>
            ) : overdueFollowUps.map(lead => (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelectedLeadId(lead.id)}
                className="w-full text-left rounded-xl border border-rose-100 bg-rose-50/40 p-3 hover:bg-rose-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-xs text-slate-900">{lead.studentName}</strong>
                  <span className="text-[9px] font-mono text-rose-700">{lead.nextFollowUpDate}</span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1">{lead.parentName} - {lead.phone}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Lịch kiểm tra năng lực đầu vào</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {upcomingTests.length === 0 ? (
              <p className="text-xs text-slate-500">Chưa có lịch kiểm tra nào.</p>
            ) : upcomingTests.map(lead => (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelectedLeadId(lead.id)}
                className="text-left rounded-xl border border-amber-100 bg-amber-50/35 p-3 hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-amber-700 font-black text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{lead.testDate} {lead.testTime || ''}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1">{lead.studentName}</p>
                <p className="text-[10.5px] text-slate-500">{lead.grade} - {lead.testScore || 'Chưa nhập điểm'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Hiệu quả nguồn quảng cáo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 uppercase font-mono border-b border-slate-100">
                  <th className="text-left py-2">Nguồn</th>
                  <th className="text-right py-2">Lead</th>
                  <th className="text-right py-2">Nhập học</th>
                  <th className="text-right py-2">Chi phí/lead</th>
                </tr>
              </thead>
              <tbody>
                {marketingDashboard.map(row => (
                  <tr key={row.source} className="border-b border-slate-50">
                    <td className="py-2 font-bold text-slate-800">{row.source}</td>
                    <td className="py-2 text-right">{row.leads}</td>
                    <td className="py-2 text-right text-emerald-700 font-bold">{row.enrolled}</td>
                    <td className="py-2 text-right">{formatCurrency(row.leads ? Math.round(row.cost / row.leads) : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Admissions Pipeline Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Phễu chuyển đổi tuyển sinh (Pipeline)</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-emerald-700 dark:text-emerald-300"
              title="Xuất báo cáo tuyển sinh ra file Excel có định dạng"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleExportWord}
              className="px-3 py-1.5 border border-blue-200 dark:border-blue-900 bg-blue-50/60 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-blue-700 dark:text-blue-300"
              title="Xuất báo cáo tuyển sinh dạng Word tổng hợp"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xuất Word</span>
            </button>

            <button
              onClick={() => setShowQuickImport(true)}
              className="px-3 py-1.5 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
              title="Nhập nhanh danh sách từ file Excel/Google Sheets"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import nhanh</span>
            </button>

            <button
              onClick={() => setShowAddLead(!showAddLead)}
              className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs animate-pulse"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Lead</span>
            </button>
          </div>
        </div>

        {showAddLead && (
          <form onSubmit={handleAddLead} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl space-y-4 max-w-3xl animate-in fade-in slide-in-from-top-3 duration-250">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">Khởi tạo Lead mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tên Học sinh</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-indigo-400 outline-none"
                  placeholder="Họ tên học sinh..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tên Phụ huynh</label>
                <input
                  type="text"
                  required
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-indigo-400 outline-none"
                  placeholder="Họ tên phụ huynh..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Số điện thoại</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-indigo-400 outline-none"
                  placeholder="Số điện thoại liên hệ..."
                />
                {isAddPhoneDuplicate && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ Số điện thoại đã tồn tại trong CRM!</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Địa chỉ Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-indigo-400 outline-none"
                  placeholder="Email liên hệ..."
                />
                {isAddEmailDuplicate && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ Email đã tồn tại trong CRM!</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Khối lớp đăng ký</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400 font-semibold"
                >
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Nguồn marketing</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as LeadSource)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400 font-semibold"
                >
                  <option value="Social">Mạng xã hội (Social)</option>
                  <option value="Facebook">Facebook Ads</option>
                  <option value="Google">Google Ads</option>
                  <option value="TikTok">TikTok Ads</option>
                  <option value="Website">Cổng thông tin (Website)</option>
                  <option value="Referral">Người giới thiệu (Referral)</option>
                  <option value="Event">Sự kiện tuyển sinh (Event)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Trạng thái hiện tại</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as LeadStage)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-850 text-slate-800 dark:text-white font-bold outline-none focus:border-indigo-400"
                >
                  {stages.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic check box for documents checklist */}
              <div className="md:col-span-2 p-3 bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Trạng thái bàn giao hồ sơ</span>
                <div className="flex gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input type="checkbox" checked={newDocHocBa} onChange={(e) => setNewDocHocBa(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-400" />
                    <span>Học bạ gốc</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input type="checkbox" checked={newDocKhaiSinh} onChange={(e) => setNewDocKhaiSinh(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-400" />
                    <span>Bản sao G.Khai sinh</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input type="checkbox" checked={newDocAnh3x4} onChange={(e) => setNewDocAnh3x4(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-400" />
                    <span>Ảnh 3x4</span>
                  </label>
                </div>
              </div>

              {/* Dynamic inputs for Test schedule (TESTING stage) */}
              {newStage === 'TESTING' && (
                <div className="md:col-span-2 grid grid-cols-2 gap-3 p-3.5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-150/45 dark:border-amber-900/40 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1 font-mono">Ngày test đầu vào</label>
                    <input
                      type="date"
                      value={newTestDate}
                      onChange={(e) => setNewTestDate(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1 font-mono">Giờ kiểm tra (Giờ test)</label>
                    <input
                      type="time"
                      value={newTestTime}
                      onChange={(e) => setNewTestTime(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic inputs for Financial Details (RESERVED, ENROLLED stages) */}
              {financialStages.includes(newStage) && (
                <div className="md:col-span-2 p-3.5 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900 rounded-2xl space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="block text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider font-mono">Thông Tin Tài Chính & Ưu Đãi (Đã giữ chỗ)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Học phí gốc tại thời điểm</label>
                      <input
                        type="number"
                        value={newBaseTuitionFee}
                        onChange={(e) => setNewBaseTuitionFee(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                        placeholder="Số tiền (VND)..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ưu đãi học phí</label>
                      <input
                        type="number"
                        value={newTuitionDiscount}
                        onChange={(e) => setNewTuitionDiscount(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                        placeholder="Số tiền (VND)..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ưu đãi học bổng</label>
                      <input
                        type="number"
                        value={newScholarshipDiscount}
                        onChange={(e) => setNewScholarshipDiscount(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                        placeholder="Số tiền (VND)..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ưu đãi đóng theo giai đoạn</label>
                      <input
                        type="number"
                        value={newPhaseEnrollmentDiscount}
                        onChange={(e) => setNewPhaseEnrollmentDiscount(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                        placeholder="Số tiền (VND)..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Phí bổ trợ nâng cao</label>
                      <input
                        type="number"
                        value={newAdvancedFee}
                        onChange={(e) => setNewAdvancedFee(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 font-bold"
                        placeholder="Số tiền (VND)..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Các ưu đãi khác</label>
                      <input
                        type="number"
                        value={newOtherDiscount}
                        onChange={(e) => setNewOtherDiscount(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                        placeholder="Số tiền (VND)..."
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-indigo-100 dark:border-indigo-900 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Tổng toàn bộ các ưu đãi cộng dồn:</span>
                    <strong className="text-sm text-emerald-600 font-black">
                      {formatCurrency(
                        (Number(newTuitionDiscount) || 0) + 
                        (Number(newScholarshipDiscount) || 0) + 
                        (Number(newPhaseEnrollmentDiscount) || 0) + 
                        (Number(newOtherDiscount) || 0)
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Ghi chú nhu cầu</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-indigo-400 outline-none"
                  placeholder="Lớp đăng ký, nhu cầu bán trú..."
                />
              </div>

              {testedStages.includes(newStage) && (
                <>
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Điểm kiểm tra (testScore)</label>
                    <input
                      type="text"
                      value={newTestScore}
                      onChange={(e) => setNewTestScore(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold focus:border-indigo-400 outline-none"
                      placeholder="Nhập điểm thi (ví dụ: 8.5/10)..."
                    />
                  </div>
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Thông tin học bổng</label>
                    <input
                      type="text"
                      value={newScholarshipInfo}
                      onChange={(e) => setNewScholarshipInfo(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-300 font-semibold focus:border-indigo-400 outline-none"
                      placeholder="Ví dụ: Học bổng 30%..."
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddLead(false)}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Lưu Học Sinh Tiềm Năng
              </button>
            </div>
          </form>
        )}

        {/* Quick Import Modal */}
        {showQuickImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-3xl w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] overflow-y-auto animate-in scale-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Import dữ liệu nhanh từ Excel / Google Sheets</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Copy các cột dữ liệu trong file Excel của bạn và dán trực tiếp vào khung dưới đây.</p>
                </div>
                <button
                  onClick={() => { setShowQuickImport(false); setImportText(''); setImportPreview([]); }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-bold block text-slate-800 dark:text-slate-300">Thứ tự các cột phân tích mặc định (phân cách bằng phím Tab hoặc Dấu phẩy):</span>
                <span className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border dark:border-slate-700">Tên Học Sinh | Tên Phụ Huynh | Số Điện Thoại | Email | Nguồn | Ghi Chú | Điểm Test | Học Bổng | Trạng Thái</span>
                <span className="block mt-1 italic text-slate-450 text-[10px]">* Trạng thái hợp lệ: Lead, Tu van, Dk test, Da test, Chua giu, Da giu, Nop ho so, Nhap hoc.</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Dán dữ liệu dòng cột tại đây:</label>
                <textarea
                  rows={5}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    handleParseImportText(e.target.value);
                  }}
                  placeholder="Ví dụ:&#10;Trần Quốc Anh	Trần Quốc Bảo	0912223344	bao.tran@gmail.com	Social	Học sinh giỏi lớp 9	8.5	Học bổng 30%	Da test"
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400 font-mono"
                />
              </div>

              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Xem trước kết quả phân tích ({importPreview.length} dòng hợp lệ)
                  </span>
                  <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-xl max-h-48 text-[11px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-150 dark:border-slate-800">
                          <th className="p-2.5">Tên học sinh</th>
                          <th className="p-2.5">Phụ huynh</th>
                          <th className="p-2.5">SĐT</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Nguồn</th>
                          <th className="p-2.5">Cột trạng thái</th>
                          <th className="p-2.5">Điểm / Học bổng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((item, idx) => {
                          const isRowDup = leads.some(l => l.phone === item.phone || (item.email && l.email && l.email.toLowerCase() === item.email.toLowerCase()));
                          return (
                            <tr key={idx} className={`border-b border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 ${isRowDup ? 'bg-rose-500/5 dark:bg-rose-955/10' : ''}`}>
                              <td className="p-2.5 font-bold">
                                <div className="flex items-center gap-1.5">
                                  <span>{item.studentName}</span>
                                  {isRowDup && (
                                    <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 text-[8.5px] rounded border border-rose-200 dark:border-rose-900/40 font-bold shrink-0">Trùng</span>
                                  )}
                                </div>
                              </td>
                            <td className="p-2.5">{item.parentName}</td>
                            <td className="p-2.5 font-mono">{item.phone}</td>
                            <td className="p-2.5 truncate max-w-[120px]">{item.email || '-'}</td>
                            <td className="p-2.5">{item.source}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-[10px] rounded font-semibold text-slate-600 dark:text-slate-400">
                                {stages.find(s => s.key === item.stage)?.label}
                              </span>
                            </td>
                            <td className="p-2.5 font-semibold text-indigo-650 dark:text-indigo-400">
                              {item.testScore ? `${item.testScore}đ` : ''} {item.scholarshipInfo ? `(${item.scholarshipInfo})` : ''}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-350 select-none">
                  <input
                    type="checkbox"
                    checked={skipImportDuplicates}
                    onChange={(e) => setSkipImportDuplicates(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-400"
                  />
                  <span>Bỏ qua dòng trùng SĐT/Email</span>
                </label>
                <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowQuickImport(false); setImportText(''); setImportPreview([]); }}
                  className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-1.5 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Xác nhận Import vào CRM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Kanban Board - Responsive Grid Layout (Fits screen on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 pb-4 select-none">
          {stages.map(col => {
            const colLeads = leads.filter(l => l.stage === col.key);

            return (
              <div
                key={col.key}
                className={`p-3 rounded-2xl border ${col.bg} flex flex-col min-h-[460px] w-full transition-all duration-300`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-250/40 dark:border-slate-800/40 mb-3">
                  <span className={`text-[11px] font-black ${col.text}`}>{col.shortLabel}</span>
                  <span className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[9.5px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {colLeads.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px]">
                  {colLeads.map(lead => {
                    const docStatus = getDocumentStatus(lead);
                    const totalDiscount = (lead.tuitionDiscount || 0) + (lead.scholarshipDiscount || 0) + (lead.phaseEnrollmentDiscount || 0) + (lead.otherDiscount || 0);
                    
                    return (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-3xs hover:shadow-2xs select-none hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[11.5px] font-bold text-slate-900 dark:text-white truncate">
                            {lead.studentName}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[8.5px] font-mono text-slate-500 dark:text-slate-455 rounded font-semibold">
                              {lead.grade || 'Lớp 10'}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[8.5px] font-mono text-slate-500 dark:text-slate-455 rounded font-semibold">
                              {lead.source}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-550 dark:text-slate-400 mt-1">
                          PH: {lead.parentName} • SĐT: {lead.phone}
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[8.5px]">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold truncate">
                            {lead.campaignName || lead.source}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded border font-bold text-center ${
                            lead.interestLevel === 'HOT'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : lead.interestLevel === 'WARM'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-slate-50 text-slate-600 border-slate-150'
                          }`}>
                            {lead.interestLevel || 'WARM'}
                          </span>
                        </div>

                        {lead.nextFollowUpDate && lead.stage !== 'ENROLLED' && (
                          <div className="mt-2 p-1.5 bg-rose-500/10 border border-rose-100 dark:border-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg text-[9px] font-semibold flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-rose-500" />
                            <span>Chăm sóc: {lead.nextFollowUpDate}</span>
                          </div>
                        )}

                        {/* Display scheduling parameters (TESTING stage) */}
                        {lead.stage === 'TESTING' && lead.testDate && (
                          <div className="mt-2 p-1.5 bg-amber-500/10 border border-amber-100 dark:border-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-[9px] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Lịch test: {lead.testDate} ({lead.testTime || '--:--'})</span>
                          </div>
                        )}

                        {/* Display dynamic discount summary badge (RESERVED stage or later) */}
                        {financialStages.includes(lead.stage) && totalDiscount > 0 && (
                          <div className="mt-2 p-1.5 bg-cyan-500/10 border border-cyan-100 dark:border-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-lg text-[9px] font-bold flex items-center gap-1 justify-between">
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-cyan-500" /> Ưu đãi:</span>
                            <span>{formatCurrency(totalDiscount)}</span>
                          </div>
                        )}

                        {/* Display document processing checklist status dynamically */}
                        <div className="mt-2 flex items-center justify-between text-[9.5px]">
                          <span className="text-slate-400 dark:text-slate-500">Hồ sơ bàn giao:</span>
                          <span className={`px-1.5 py-0.2 rounded border text-[8.5px] font-bold ${docStatus.bg}`}>
                            {docStatus.label} ({docStatus.count}/7)
                          </span>
                        </div>

                        {/* Display testScore & scholarshipInfo dynamically */}
                        {(lead.testScore || lead.scholarshipInfo) && (
                          <div className="mt-2.5 p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-lg text-[9.5px] space-y-1">
                            {lead.testScore && (
                              <div className="flex items-center justify-between text-slate-550 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <ClipboardList className="w-3 h-3 text-purple-500" />
                                  Điểm test:
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{lead.testScore}</span>
                              </div>
                            )}
                            {lead.scholarshipInfo && (
                              <div className="flex items-center justify-between text-slate-550 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  Học bổng:
                                </span>
                                <span className="font-semibold px-1.5 py-0.2 bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-300 rounded border border-amber-100 dark:border-amber-900/40 text-[8.5px]">
                                  {lead.scholarshipInfo}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-slate-100/55 dark:border-slate-800/55 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 dark:text-slate-500">Xem chi tiết</span>
                          <div className="flex items-center gap-1">
                            {lead.stage !== 'ENROLLED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextIndex = stages.findIndex(s => s.key === lead.stage) + 1;
                                  if (nextIndex < stages.length) {
                                    handleMoveStage(lead.id, stages[nextIndex].key);
                                  }
                                }}
                                className="px-1.5 py-0.5 bg-indigo-55 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-bold transition-all border border-indigo-100 dark:border-indigo-900"
                              >
                                Chuyển tiếp →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">
                  Lead Profile 360
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  HS: {selectedLead.studentName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="px-2.5 py-1 bg-indigo-55 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10.5px] font-bold cursor-pointer flex items-center gap-1 transition-all border border-indigo-100 dark:border-indigo-900"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Sửa thông tin</span>
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email send alerts */}
            {emailAlert && (
              <div className={`p-3 rounded-xl border text-xs flex justify-between items-start animate-in fade-in duration-200 ${
                emailAlert.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900' 
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'
              }`}>
                <div className="flex-1 break-all pr-2">
                  <span className="font-bold uppercase block text-[9.5px] mb-0.5">
                    {emailAlert.type === 'success' ? 'Thành công' : 'Lỗi gửi tin'}
                  </span>
                  {emailAlert.message}
                </div>
                <button onClick={() => setEmailAlert(null)} className="p-0.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveLeadEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tên Học sinh</label>
                    <input
                      type="text"
                      required
                      value={editStudentName}
                      onChange={(e) => setEditStudentName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tên Phụ huynh</label>
                    <input
                      type="text"
                      required
                      value={editParentName}
                      onChange={(e) => setEditParentName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Số điện thoại</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                    />
                    {isEditPhoneDuplicate && (
                      <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ Số điện thoại đã trùng với học sinh khác!</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Địa chỉ Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                    />
                    {isEditEmailDuplicate && (
                      <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ Email đã trùng với học sinh khác!</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Khối lớp đăng ký</label>
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400 font-semibold"
                    >
                      <option value="Lớp 10">Lớp 10</option>
                      <option value="Lớp 11">Lớp 11</option>
                      <option value="Lớp 12">Lớp 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Nguồn marketing</label>
                    <select
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value as LeadSource)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                    >
                      <option value="Social">Mạng xã hội (Social)</option>
                      <option value="Facebook">Facebook Ads</option>
                      <option value="Google">Google Ads</option>
                      <option value="TikTok">TikTok Ads</option>
                      <option value="Website">Cổng thông tin (Website)</option>
                      <option value="Referral">Người giới thiệu (Referral)</option>
                      <option value="Event">Sự kiện tuyển sinh (Event)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Trạng thái tuyển sinh</label>
                    <select
                      value={editStage}
                      onChange={(e) => setEditStage(e.target.value as LeadStage)}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold outline-none focus:border-indigo-400"
                    >
                      {stages.map(s => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Document checklist form in edit mode */}
                  <div className="md:col-span-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Checklist hồ sơ bàn giao</span>
                    <div className="flex gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={editDocHocBa} onChange={(e) => setEditDocHocBa(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-400" />
                        <span>Học bạ gốc</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={editDocKhaiSinh} onChange={(e) => setEditDocKhaiSinh(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-400" />
                        <span>Bản sao Khai sinh</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={editDocAnh3x4} onChange={(e) => setEditDocAnh3x4(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-400" />
                        <span>Ảnh 3x4</span>
                      </label>
                    </div>
                  </div>

                  {/* Edit scheduling details if TESTING */}
                  {editStage === 'TESTING' && (
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 p-3 bg-amber-500/10 border border-amber-200 rounded-xl animate-in fade-in duration-200">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1 font-mono">Ngày làm bài test</label>
                        <input
                          type="date"
                          value={editTestDate}
                          onChange={(e) => setEditTestDate(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1 font-mono">Giờ test</label>
                        <input
                          type="time"
                          value={editTestTime}
                          onChange={(e) => setEditTestTime(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Edit Financial Details (RESERVED, ENROLLED stages) */}
                  {financialStages.includes(editStage) && (
                    <div className="md:col-span-2 p-3 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900 rounded-xl space-y-3 animate-in fade-in duration-200">
                      <span className="block text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider font-mono">Thông Tin Tài Chính & Ưu Đãi</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Học phí gốc tại thời điểm</label>
                          <input
                            type="number"
                            value={editBaseTuitionFee}
                            onChange={(e) => setEditBaseTuitionFee(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                            placeholder="Số tiền (VND)..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ưu đãi học phí</label>
                          <input
                            type="number"
                            value={editTuitionDiscount}
                            onChange={(e) => setEditTuitionDiscount(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                            placeholder="Số tiền (VND)..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ưu đãi học bổng</label>
                          <input
                            type="number"
                            value={editScholarshipDiscount}
                            onChange={(e) => setEditScholarshipDiscount(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                            placeholder="Số tiền (VND)..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ưu đãi theo giai đoạn</label>
                          <input
                            type="number"
                            value={editPhaseEnrollmentDiscount}
                            onChange={(e) => setEditPhaseEnrollmentDiscount(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                            placeholder="Số tiền (VND)..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Phí bổ trợ nâng cao</label>
                          <input
                            type="number"
                            value={editAdvancedFee}
                            onChange={(e) => setEditAdvancedFee(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                            placeholder="Số tiền (VND)..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Các ưu đãi khác</label>
                          <input
                            type="number"
                            value={editOtherDiscount}
                            onChange={(e) => setEditOtherDiscount(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800"
                            placeholder="Số tiền (VND)..."
                          />
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-indigo-100 dark:border-indigo-900 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">Tổng toàn bộ các ưu đãi cộng dồn:</span>
                        <strong className="text-sm text-emerald-600 font-black">
                          {formatCurrency(
                            (Number(editTuitionDiscount) || 0) + 
                            (Number(editScholarshipDiscount) || 0) + 
                            (Number(editPhaseEnrollmentDiscount) || 0) + 
                            (Number(editOtherDiscount) || 0)
                          )}
                        </strong>
                      </div>
                    </div>
                  )}

                  {testedStages.includes(editStage) && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Điểm kiểm tra</label>
                        <input
                          type="text"
                          value={editTestScore}
                          onChange={(e) => setEditTestScore(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold outline-none focus:border-indigo-400"
                          placeholder="Nhập điểm..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Thông tin học bổng</label>
                        <input
                          type="text"
                          value={editScholarshipInfo}
                          onChange={(e) => setEditScholarshipInfo(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-300 font-semibold outline-none focus:border-indigo-400"
                          placeholder="Nhập học bổng..."
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Ghi chú hiện trạng</label>
                  <textarea
                    rows={2.5}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                    placeholder="Nhập ghi chú chi tiết..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block">Tên phụ huynh</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedLead.parentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block">Điện thoại liên lạc</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedLead.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block">Email phụ huynh</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedLead.email || 'Chưa cung cấp'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-555 font-medium block">Nguồn tiếp cận</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{selectedLead.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block">Khối lớp đăng ký</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedLead.grade || 'Lớp 10'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-555 font-medium block mb-0.5">Trạng thái tuyển sinh</span>
                    <span className={`inline-block px-2.5 py-0.5 text-[10.5px] font-bold rounded-full ${stages.find(s => s.key === selectedLead.stage)?.bg} ${stages.find(s => s.key === selectedLead.stage)?.text} border`}>
                      {stages.find(s => s.key === selectedLead.stage)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block">Chiến dịch</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedLead.campaignName || 'Chưa gắn chiến dịch'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block">Tư vấn phụ trách</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedLead.leadOwner || 'Phòng Tuyển sinh'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block">Mức độ quan tâm</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedLead.interestLevel || 'WARM'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block">Chăm sóc tiếp theo</span>
                    <span className="font-bold text-rose-600 dark:text-rose-300 mt-0.5 block">{selectedLead.nextFollowUpDate || 'Không còn lịch chăm sóc'}</span>
                  </div>
                </div>

                {/* Display checklist status dynamically */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Bàn giao hồ sơ (Nhấp để thay đổi nhanh)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedLead.docChecklist?.hocBa || false} 
                        onChange={() => handleToggleDocStatic(selectedLead.id, 'hocBa')}
                        className="rounded text-indigo-600 focus:ring-indigo-400" 
                      />
                      <span>Học bạ gốc</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedLead.docChecklist?.khaiSinh || false} 
                        onChange={() => handleToggleDocStatic(selectedLead.id, 'khaiSinh')}
                        className="rounded text-indigo-600 focus:ring-indigo-400" 
                      />
                      <span>Bản sao Khai sinh</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedLead.docChecklist?.anh3x4 || false} 
                        onChange={() => handleToggleDocStatic(selectedLead.id, 'anh3x4')}
                        className="rounded text-indigo-600 focus:ring-indigo-400" 
                      />
                      <span>Ảnh 3x4</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedLead.docChecklist?.cccdParent || false} 
                        onChange={() => handleToggleDocStatic(selectedLead.id, 'cccdParent')}
                        className="rounded text-indigo-600 focus:ring-indigo-400" 
                      />
                      <span>CCCD phụ huynh</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedLead.docChecklist?.healthRecord || false} 
                        onChange={() => handleToggleDocStatic(selectedLead.id, 'healthRecord')}
                        className="rounded text-indigo-600 focus:ring-indigo-400" 
                      />
                      <span>Hồ sơ y tế</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedLead.docChecklist?.paymentProof || false} 
                        onChange={() => handleToggleDocStatic(selectedLead.id, 'paymentProof')}
                        className="rounded text-indigo-600 focus:ring-indigo-400" 
                      />
                      <span>Xác nhận đóng phí</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedLead.docChecklist?.admissionForm || false} 
                        onChange={() => handleToggleDocStatic(selectedLead.id, 'admissionForm')}
                        className="rounded text-indigo-600 focus:ring-indigo-400" 
                      />
                      <span>Đơn nhập học</span>
                    </label>
                  </div>
                </div>

                {/* Display test scheduling details and invitation email trigger inside Modal (TESTING stage) */}
                {selectedLead.stage === 'TESTING' && (
                  <div className="p-3 bg-amber-50/45 dark:bg-amber-950/15 border border-amber-150 dark:border-amber-900/40 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                      <div>
                        <span className="text-amber-800 dark:text-amber-300 font-bold block">Lịch hẹn kiểm tra năng lực đầu vào:</span>
                        <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span>Ngày: {selectedLead.testDate || 'Chưa xếp lịch'}</span>
                          <span className="text-slate-300 font-normal">|</span>
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>Giờ: {selectedLead.testTime || 'Chưa xếp giờ'}</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        disabled={sendingEmail || !selectedLead.testDate || !selectedLead.testTime}
                        onClick={() => handleSendTestInvitationEmail(selectedLead)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer shadow-3xs"
                      >
                        {sendingEmail ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang gửi...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            <span>Gửi thư mời test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Display billing and discounts details inside Modal (RESERVED stage or later) */}
                {financialStages.includes(selectedLead.stage) && (
                  <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-3">
                    <span className="block text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider font-mono">Chi tiết biểu phí & ưu đãi học sinh</span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                          <span className="text-slate-500">Học phí thời điểm:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-250">{formatCurrency(selectedLead.baseTuitionFee)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                          <span className="text-slate-500">Ưu đãi học phí:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-250">- {formatCurrency(selectedLead.tuitionDiscount)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                          <span className="text-slate-500">Ưu đãi học bổng:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-250">- {formatCurrency(selectedLead.scholarshipDiscount)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                          <span className="text-slate-500">Ưu đãi đợt tuyển sinh:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-250">- {formatCurrency(selectedLead.phaseEnrollmentDiscount)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                          <span className="text-slate-500">Phí bổ trợ nâng cao:</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">+ {formatCurrency(selectedLead.advancedFee)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                          <span className="text-slate-500">Các ưu đãi khác:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-250">- {formatCurrency(selectedLead.otherDiscount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center text-[11.5px] flex-wrap gap-2">
                      <div>
                        <span className="text-slate-450 block">Tổng ưu đãi áp dụng:</span>
                        <strong className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                          {formatCurrency(
                            (selectedLead.tuitionDiscount || 0) + 
                            (selectedLead.scholarshipDiscount || 0) + 
                            (selectedLead.phaseEnrollmentDiscount || 0) + 
                            (selectedLead.otherDiscount || 0)
                          )}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-450 block">Học phí cần đóng thực tế:</span>
                        <strong className="text-sm text-indigo-650 dark:text-indigo-400 font-black block mt-0.5">
                          {formatCurrency(
                            (selectedLead.baseTuitionFee || 0) - 
                            ((selectedLead.tuitionDiscount || 0) + (selectedLead.scholarshipDiscount || 0) + (selectedLead.phaseEnrollmentDiscount || 0) + (selectedLead.otherDiscount || 0)) + 
                            (selectedLead.advancedFee || 0)
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Test score & Scholarship Display in Modal with Send Email Action */}
                {testedStages.includes(selectedLead.stage) && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-550 font-bold block mb-1">
                          Điểm kiểm tra:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded border border-slate-150 dark:border-slate-700 inline-block font-mono">
                          {selectedLead.testScore || 'Chưa có điểm'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-555 font-bold block mb-1">
                          Thông tin học bổng:
                        </span>
                        {selectedLead.scholarshipInfo ? (
                          <span className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-955/40 text-amber-700 dark:text-amber-300 rounded-md font-bold border border-amber-100 dark:border-amber-900/40 inline-flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            {selectedLead.scholarshipInfo}
                          </span>
                        ) : (
                          <span className="text-slate-450 italic inline-block mt-1.5">Không nhận học bổng</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center">
                      <span className="text-[11px] text-slate-550 dark:text-slate-400">
                        Gửi kết quả test và thông báo học bổng cho phụ huynh:
                      </span>
                      <button
                        type="button"
                        disabled={sendingEmail}
                        onClick={() => handleSendAdmissionsEmail(selectedLead)}
                        className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed shadow-3xs"
                      >
                        {sendingEmail ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang gửi...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            <span>Gửi kết quả test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-755 dark:text-slate-350">
                  <span className="font-bold text-slate-400 dark:text-slate-555 block mb-1">Ghi chú hiện trạng:</span>
                  "{selectedLead.notes || 'Không có ghi chú'}"
                </div>

                {/* Interaction Logs */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Lịch sử tương tác ({selectedLead.interactions.length})</span>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl font-medium">
                    {selectedLead.interactions.map((it, idx) => (
                      <div key={idx} className="p-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg text-[11px] border border-slate-100/50 dark:border-slate-800/50">
                        <span className="font-mono text-slate-400">{it.date}</span> • <strong className="text-indigo-650 dark:text-indigo-400">{it.type}</strong>: {it.content}
                      </div>
                    ))}
                  </div>

                  {/* Add Interaction Log Form */}
                  <form onSubmit={handleAddInteraction} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value)}
                      className="px-2 py-1.5 text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                    >
                      <option value="Gọi điện">Gọi điện</option>
                      <option value="Email">Gửi Email</option>
                      <option value="Tham quan">School Tour</option>
                      <option value="Họp trực tiếp">Gặp trực tiếp</option>
                      <option value="Cập nhật điểm">Cập nhật điểm</option>
                      <option value="Thông báo học bổng">Thông báo học bổng</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={interactionContent}
                      onChange={(e) => setInteractionContent(e.target.value)}
                      placeholder="Ghi nội dung chi tiết thảo luận với phụ huynh..."
                      className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
                    >
                      Gửi Log
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Marketing Campaign Analytics */}
      <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
        <div>
          <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
            📊 Phân tích Nguồn truyền thông & tuyển sinh (Marketing Source Analytics)
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">Đo lường số lượng học sinh đăng ký dựa theo nguồn kênh chiến dịch quảng cáo.</p>
        </div>

        <div className="h-52 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9.5} />
              <YAxis stroke="#94a3b8" fontSize={9.5} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
        <div>
          <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Lộ trình tích hợp tuyển sinh</h4>
          <p className="text-[11px] text-slate-500 mt-1">Các đầu nối đã được chuẩn hóa theo 3 giai đoạn để chuyển từ vận hành thủ công sang tự động hóa.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: 'Giai đoạn 1 - CRM lõi',
              status: 'Đã triển khai',
              items: ['Pipeline 7 bước', 'Hồ sơ lead 360°', 'Lịch kiểm tra', 'Checklist nhập học', 'Báo cáo nguồn'],
            },
            {
              title: 'Giai đoạn 2 - Tự động hóa',
              status: 'Sẵn sàng cấu hình',
              items: ['Nhắc chăm sóc lead', 'Email SMTP', 'Zalo OA Broadcast', 'Gửi thư mời test', 'Gửi kết quả học bổng'],
            },
            {
              title: 'Giai đoạn 3 - Quảng cáo/web form',
              status: 'Sẵn sàng nối API',
              items: ['Import Excel/CSV', 'Nguồn Google/Facebook/TikTok', 'Chiến dịch quảng cáo', 'Chi phí/lead', 'Chuyển lead thành học sinh'],
            },
          ].map(section => (
            <div key={section.title} className="rounded-2xl border border-slate-150 bg-slate-50/60 dark:bg-slate-900/60 dark:border-slate-800 p-4">
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-xs font-black text-slate-900 dark:text-white">{section.title}</h5>
                <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[9px] font-black">
                  {section.status}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {section.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-350">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
