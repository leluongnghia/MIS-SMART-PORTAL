import { serverStorage } from '../libs/client/server-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  Mail,
  Plus,
  QrCode,
  Search,
  Send,
  Target,
  Zap,
  Upload,
  Users,
  WalletCards,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { collection, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { syncEnrolledCrmLeadsToLifecycle } from '../utils/crmStudentSync';

type LeadStage =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'CONSULTING'
  | 'APPOINTMENT_BOOKED'
  | 'ENTRANCE_TEST_REGISTERED'
  | 'TEST_COMPLETED'
  | 'SCHOLARSHIP_REVIEW'
  | 'OFFER_SENT'
  | 'SEAT_RESERVATION_PAYMENT'
  | 'SEAT_RESERVED'
  | 'ENROLLMENT_PAYMENT'
  | 'DOCUMENTS_PENDING'
  | 'ENROLLED'
  | 'LOST';

type LeadTemperature = 'HOT' | 'WARM' | 'COLD';
type PaymentType = 'RESERVATION' | 'ENROLLMENT';
type PaymentStatus = 'PENDING' | 'MATCHED' | 'FAILED';
type WorkflowStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';

interface Interaction {
  id: string;
  date: string;
  type: string;
  owner: string;
  content: string;
}

interface CrmPayment {
  id: string;
  type: PaymentType;
  code: string;
  amount: number;
  status: PaymentStatus;
  bankBin: string;
  bankAccountNo: string;
  bankAccountName: string;
  vietQrUrl: string;
  matchedAt?: string;
  statementRef?: string;
}

interface WorkflowLog {
  id: string;
  name: string;
  channel: 'EMAIL' | 'ZALO' | 'SYSTEM';
  status: WorkflowStatus;
  createdAt: string;
  error?: string;
}

interface DocumentChecklist {
  hocBa: boolean;
  khaiSinh: boolean;
  anh3x4: boolean;
  cccdParent: boolean;
  healthRecord: boolean;
  admissionForm: boolean;
  paymentProof: boolean;
  personalId: boolean;
  siblingInfo: boolean;
}

interface AdmissionLead {
  id: string;
  leadCode: string;
  contactId: string;
  opportunityId: string;
  enrollmentCode: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  grade: string;
  stage: LeadStage;
  source: string;
  campaign: string;
  adSet: string;
  keyword: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  landingPage: string;
  adCost: number;
  ownerId: string;
  ownerName: string;
  leadTemperature: LeadTemperature;
  leadScore: number;
  lostReason: string;
  currentSchool: string;
  address: string;
  personalId: string;
  ministryStudentCode: string;
  healthInsuranceCode: string;
  siblingInfo: string;
  testDate: string;
  testTime: string;
  mathScore: number | '';
  englishScore: number | '';
  vietnameseScore: number | '';
  testSummary: string;
  councilNote: string;
  scholarshipPercent: number;
  phaseDiscountPercent: number;
  siblingDiscountPercent: number;
  staffChildDiscountPercent: number;
  otherDiscountPercent: number;
  baseTuitionFee: number;
  reservationFee: number;
  supportFee: number;
  docChecklist: DocumentChecklist;
  interactions: Interaction[];
  workflowLogs: WorkflowLog[];
  payments: CrmPayment[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const CRM_LEADS_STORAGE_KEY = 'school_crm_leads';
const CRM_IMPORT_BATCHES_STORAGE_KEY = 'crm_import_batches';

const stageMeta: Array<{ key: LeadStage; label: string; short: string; color: string }> = [
  { key: 'NEW_LEAD', label: 'Lead mới', short: 'Lead', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'CONTACTED', label: 'Đã liên hệ', short: 'Liên hệ', color: 'bg-sky-50 text-sky-700 border-sky-150' },
  { key: 'CONSULTING', label: 'Đang tư vấn', short: 'Tư vấn', color: 'bg-blue-50 text-blue-700 border-blue-150' },
  { key: 'APPOINTMENT_BOOKED', label: 'Đã đặt lịch', short: 'Lịch hẹn', color: 'bg-violet-50 text-violet-700 border-violet-150' },
  { key: 'ENTRANCE_TEST_REGISTERED', label: 'Đăng ký test', short: 'Test', color: 'bg-amber-50 text-amber-700 border-amber-150' },
  { key: 'TEST_COMPLETED', label: 'Đã test', short: 'KQ test', color: 'bg-orange-50 text-orange-700 border-orange-150' },
  { key: 'SCHOLARSHIP_REVIEW', label: 'Duyệt học bổng', short: 'HB', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-150' },
  { key: 'OFFER_SENT', label: 'Đã gửi offer', short: 'Offer', color: 'bg-indigo-50 text-indigo-700 border-indigo-150' },
  { key: 'SEAT_RESERVATION_PAYMENT', label: 'Chờ phí giữ chỗ', short: 'Chờ G. chỗ', color: 'bg-cyan-50 text-cyan-700 border-cyan-150' },
  { key: 'SEAT_RESERVED', label: 'Đã giữ chỗ', short: 'Giữ chỗ', color: 'bg-teal-50 text-teal-700 border-teal-150' },
  { key: 'ENROLLMENT_PAYMENT', label: 'Chờ phí nhập học', short: 'Chờ NH', color: 'bg-lime-50 text-lime-700 border-lime-150' },
  { key: 'DOCUMENTS_PENDING', label: 'Chờ hồ sơ', short: 'Hồ sơ', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'ENROLLED', label: 'Đã nhập học', short: 'Nhập học', color: 'bg-emerald-50 text-emerald-700 border-emerald-150' },
  { key: 'LOST', label: 'Lost', short: 'Lost', color: 'bg-rose-50 text-rose-700 border-rose-150' },
];

const defaultBankConfig = {
  bankBin: '970436',
  bankAccountNo: '0123456789',
  bankAccountName: 'TRUONG MIS SMART',
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const safeIdPart = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);

const mapLegacyStage = (stage: unknown): LeadStage => {
  const value = String(stage || '').toUpperCase();
  const legacy: Record<string, LeadStage> = {
    NEW: 'NEW_LEAD',
    LEAD: 'NEW_LEAD',
    ADS: 'NEW_LEAD',
    CONTACTED: 'CONTACTED',
    CONSULTING: 'CONSULTING',
    TOUR: 'APPOINTMENT_BOOKED',
    OPEN_DAY: 'APPOINTMENT_BOOKED',
    TESTING: 'ENTRANCE_TEST_REGISTERED',
    OFFER: 'OFFER_SENT',
    RESERVED: 'SEAT_RESERVED',
    ENROLLED: 'ENROLLED',
    LOST: 'LOST',
  };
  return stageMeta.some(item => item.key === value) ? value as LeadStage : legacy[value] || 'NEW_LEAD';
};

const defaultChecklist = (): DocumentChecklist => ({
  hocBa: false,
  khaiSinh: false,
  anh3x4: false,
  cccdParent: false,
  healthRecord: false,
  admissionForm: false,
  paymentProof: false,
  personalId: false,
  siblingInfo: false,
});

const buildVietQrUrl = (payment: Pick<CrmPayment, 'bankBin' | 'bankAccountNo' | 'amount' | 'code'>) =>
  `https://img.vietqr.io/image/${payment.bankBin}-${payment.bankAccountNo}-compact2.png?amount=${payment.amount}&addInfo=${encodeURIComponent(payment.code)}&accountName=${encodeURIComponent(defaultBankConfig.bankAccountName)}`;

const getTestAverage = (lead: Pick<AdmissionLead, 'mathScore' | 'englishScore' | 'vietnameseScore'>) => {
  const scores = [lead.mathScore, lead.englishScore, lead.vietnameseScore]
    .map(value => Number(value))
    .filter(value => Number.isFinite(value) && value > 0);
  return scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
};

const hasTestScore = (lead: Pick<AdmissionLead, 'mathScore' | 'englishScore' | 'vietnameseScore'>) => getTestAverage(lead) > 0;

const getNextAction = (lead: AdmissionLead) => {
  if (!lead.testDate || !lead.testTime) return 'Đặt lịch test';
  if (!hasTestScore(lead)) return `Test ${lead.testDate} ${lead.testTime}`;
  if (getTestAverage(lead) >= 8 && lead.stage !== 'SCHOLARSHIP_REVIEW') return 'Duyệt học bổng';
  if (!lead.payments.length) return 'Tạo QR giữ chỗ';
  if (lead.payments.some(item => item.status === 'PENDING')) return 'Chờ đối soát';
  if (!Object.values(lead.docChecklist).every(Boolean)) return 'Bổ sung hồ sơ';
  return 'Sẵn sàng nhập học';
};

const computeLeadScore = (lead: AdmissionLead) => {
  const stageScore = Math.max(0, stageMeta.findIndex(item => item.key === lead.stage)) * 5;
  const interactionScore = Math.min(18, lead.interactions.length * 3);
  const testScore = lead.mathScore || lead.englishScore || lead.vietnameseScore ? 12 : 0;
  const paymentScore = lead.payments.some(item => item.status === 'MATCHED') ? 12 : 0;
  const docScore = Object.values(lead.docChecklist).filter(Boolean).length * 2;
  const tempScore = lead.leadTemperature === 'HOT' ? 14 : lead.leadTemperature === 'WARM' ? 8 : 2;
  return Math.min(100, stageScore + interactionScore + testScore + paymentScore + docScore + tempScore);
};

const normalizeLead = (raw: Partial<AdmissionLead>): AdmissionLead => {
  const id = raw.id || `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const leadCode = raw.leadCode || `LD${new Date().getFullYear()}_${safeIdPart(id).toUpperCase()}`;
  const stage = mapLegacyStage(raw.stage);
  const docChecklist = { ...defaultChecklist(), ...(raw.docChecklist || {}) };
  const normalized: AdmissionLead = {
    id,
    leadCode,
    contactId: raw.contactId || `ct_${safeIdPart(leadCode).toLowerCase()}`,
    opportunityId: raw.opportunityId || `opp_${safeIdPart(leadCode).toLowerCase()}`,
    enrollmentCode: raw.enrollmentCode || `ENR_${safeIdPart(leadCode).toUpperCase()}`,
    studentName: raw.studentName || '',
    parentName: raw.parentName || '',
    phone: raw.phone || '',
    email: raw.email || '',
    grade: raw.grade || 'Lớp 10',
    stage,
    source: raw.source || raw.utmSource || 'Website',
    campaign: raw.campaign || raw.utmCampaign || 'Tuyển sinh 2026',
    adSet: raw.adSet || '',
    keyword: raw.keyword || '',
    utmSource: raw.utmSource || raw.source || 'Website',
    utmMedium: raw.utmMedium || 'organic',
    utmCampaign: raw.utmCampaign || raw.campaign || 'Tuyển sinh 2026',
    landingPage: raw.landingPage || '/admissions',
    adCost: numberValue(raw.adCost, raw.source === 'Referral' ? 0 : 250000),
    ownerId: raw.ownerId || 'admissions_team',
    ownerName: raw.ownerName || 'Phòng Tuyển sinh',
    leadTemperature: raw.leadTemperature || (['OFFER_SENT', 'SEAT_RESERVATION_PAYMENT', 'SEAT_RESERVED', 'ENROLLMENT_PAYMENT', 'DOCUMENTS_PENDING', 'ENROLLED'].includes(stage) ? 'HOT' : stage === 'NEW_LEAD' ? 'COLD' : 'WARM'),
    leadScore: raw.leadScore || 0,
    lostReason: raw.lostReason || '',
    currentSchool: raw.currentSchool || '',
    address: raw.address || '',
    personalId: raw.personalId || '',
    ministryStudentCode: raw.ministryStudentCode || '',
    healthInsuranceCode: raw.healthInsuranceCode || '',
    siblingInfo: raw.siblingInfo || '',
    testDate: raw.testDate || '',
    testTime: raw.testTime || '',
    mathScore: raw.mathScore ?? '',
    englishScore: raw.englishScore ?? '',
    vietnameseScore: raw.vietnameseScore ?? '',
    testSummary: raw.testSummary || '',
    councilNote: raw.councilNote || '',
    scholarshipPercent: numberValue(raw.scholarshipPercent),
    phaseDiscountPercent: numberValue(raw.phaseDiscountPercent),
    siblingDiscountPercent: numberValue(raw.siblingDiscountPercent),
    staffChildDiscountPercent: numberValue(raw.staffChildDiscountPercent),
    otherDiscountPercent: numberValue(raw.otherDiscountPercent),
    baseTuitionFee: numberValue(raw.baseTuitionFee, 60000000),
    reservationFee: numberValue(raw.reservationFee, 5000000),
    supportFee: numberValue(raw.supportFee),
    docChecklist,
    interactions: Array.isArray(raw.interactions) ? raw.interactions : [],
    workflowLogs: Array.isArray(raw.workflowLogs) ? raw.workflowLogs : [],
    payments: Array.isArray(raw.payments) ? raw.payments : [],
    notes: raw.notes || '',
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
  return { ...normalized, leadScore: computeLeadScore(normalized) };
};

const seedLeads: AdmissionLead[] = [
  normalizeLead({
    id: 'lead_1',
    leadCode: 'LD2026_001',
    studentName: 'Nguyễn Minh Anh',
    parentName: 'Nguyễn Văn Hải',
    phone: '0912345678',
    email: 'hai.nguyen@gmail.com',
    stage: 'CONSULTING',
    source: 'Facebook',
    campaign: 'Open Day lớp 10',
    adCost: 340000,
    notes: 'Quan tâm chính sách học bổng đầu vào.',
    interactions: [{ id: 'i1', date: '2026-06-09', type: 'Call', owner: 'Phòng Tuyển sinh', content: 'Tư vấn chương trình chất lượng cao.' }],
  }),
  normalizeLead({
    id: 'lead_2',
    leadCode: 'LD2026_002',
    studentName: 'Phạm Tiến Dũng',
    parentName: 'Phạm Văn Thành',
    phone: '0905123456',
    email: 'thanh.pham@gmail.com',
    stage: 'ENTRANCE_TEST_REGISTERED',
    source: 'Referral',
    campaign: 'Giới thiệu phụ huynh',
    testDate: '2026-06-15',
    testTime: '09:00',
    notes: 'Đã đặt lịch kiểm tra năng lực.',
  }),
  normalizeLead({
    id: 'lead_3',
    leadCode: 'LD2026_003',
    studentName: 'Đặng Hoàng Nam',
    parentName: 'Đặng Quốc Hưng',
    phone: '0904223344',
    email: 'hung.dang@gmail.com',
    stage: 'OFFER_SENT',
    source: 'Event',
    campaign: 'Ngày hội trải nghiệm',
    mathScore: 8.5,
    englishScore: 9,
    vietnameseScore: 8,
    testSummary: 'Đạt khuyến nghị xét học bổng.',
    scholarshipPercent: 30,
    docChecklist: { ...defaultChecklist(), khaiSinh: true, anh3x4: true },
  }),
  normalizeLead({
    id: 'lead_4',
    leadCode: 'LD2026_004',
    studentName: 'Hoàng Minh Ngọc',
    parentName: 'Hoàng Văn Lâm',
    phone: '0933445566',
    email: 'lam.hoang@gmail.com',
    stage: 'ENROLLED',
    source: 'Website',
    campaign: 'Tuyển sinh trực tuyến',
    mathScore: 9,
    englishScore: 9.5,
    vietnameseScore: 8.5,
    scholarshipPercent: 50,
    phaseDiscountPercent: 5,
    docChecklist: { hocBa: true, khaiSinh: true, anh3x4: true, cccdParent: true, healthRecord: true, admissionForm: true, paymentProof: true, personalId: true, siblingInfo: false },
  }),
];

const readStoredLeads = () => {
  try {
    const raw = serverStorage.getItem(CRM_LEADS_STORAGE_KEY);
    if (!raw) return seedLeads;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeLead) : seedLeads;
  } catch {
    return seedLeads;
  }
};

const writeStoredLeads = (leads: AdmissionLead[]) => {
  serverStorage.setItem(CRM_LEADS_STORAGE_KEY, JSON.stringify(leads));
};

const exportCsv = (leads: AdmissionLead[]) => {
  const headers = [
    'leadCode', 'contactId', 'opportunityId', 'studentName', 'parentName', 'phone', 'email', 'grade', 'stage',
    'source', 'campaign', 'adSet', 'keyword', 'utmSource', 'utmMedium', 'utmCampaign', 'landingPage', 'adCost',
    'ownerName', 'leadTemperature', 'leadScore', 'lostReason', 'testDate', 'testTime', 'mathScore', 'englishScore',
    'vietnameseScore', 'scholarshipPercent', 'reservationFee', 'paymentStatus', 'documentsCompleted', 'notes',
  ];
  const rows = leads.map(lead => {
    const paymentStatus = lead.payments.some(item => item.status === 'MATCHED') ? 'MATCHED' : lead.payments.length ? 'PENDING' : '';
    const documentsCompleted = Object.values(lead.docChecklist).filter(Boolean).length;
    return headers.map(header => {
      const value = header === 'paymentStatus' ? paymentStatus : header === 'documentsCompleted' ? documentsCompleted : (lead as any)[header] ?? '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  const blob = new Blob(['\uFEFF', headers.join(','), '\n', rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Admissions_CRM_${todayIso()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function SchoolCrmHub() {
  const [leads, setLeads] = useState<AdmissionLead[]>(readStoredLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(readStoredLeads()[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'CARE' | 'ASSESSMENT' | 'DOCUMENTS' | 'PERSONAL'>('CARE');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'KANBAN'>('LIST');
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'SYNCING' | 'READY' | 'LOCAL'>('SYNCING');
  const [saving, setSaving] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ studentName: '', parentName: '', phone: '', email: '', source: 'Website', campaign: 'Tuyển sinh 2026', grade: 'Lớp 10' });
  const [interactionContent, setInteractionContent] = useState('');
  const [importText, setImportText] = useState('');
  const [reconcileText, setReconcileText] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setActiveTab('CARE');
  }, [selectedLeadId]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const bootstrap = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'crm_leads'));
        if (snapshot.empty) {
          await Promise.all(leads.map(lead => setDoc(doc(db, 'crm_leads', lead.id), lead)));
        }
        unsub = onSnapshot(collection(db, 'crm_leads'), (next) => {
          const cloudLeads = next.docs.map(item => normalizeLead({ id: item.id, ...item.data() }));
          if (cloudLeads.length) {
            setLeads(cloudLeads);
            writeStoredLeads(cloudLeads);
            setSelectedLeadId(current => current || cloudLeads[0].id);
          }
          setCloudStatus('READY');
        }, () => setCloudStatus('LOCAL'));
      } catch {
        setCloudStatus('LOCAL');
      }
    };
    bootstrap();
    return () => unsub?.();
    // Bootstrap intentionally uses the initial local dataset for Firestore seeding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    writeStoredLeads(leads);
  }, [leads]);

  const selectedLead = useMemo(() => leads.find(lead => lead.id === selectedLeadId) || leads[0] || null, [leads, selectedLeadId]);

  const persistLead = async (incoming: AdmissionLead, options: { skipAutomation?: boolean } = {}) => {
    const original = leads.find(item => item.id === incoming.id);
    let automated = normalizeLead({ ...incoming, updatedAt: nowIso() });

    if (!options.skipAutomation) {
      const logs: WorkflowLog[] = [];
      const pushRule = (name: string, channel: WorkflowLog['channel'] = 'SYSTEM', status: WorkflowStatus = 'SENT') => {
        logs.push({ id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name, channel, status, createdAt: nowIso() });
      };
      const stageRank = (stage: LeadStage) => stageMeta.findIndex(item => item.key === stage);
      const testScheduled = Boolean(automated.testDate && automated.testTime);
      const testAverage = getTestAverage(automated);

      if (testScheduled && stageRank(automated.stage) < stageRank('ENTRANCE_TEST_REGISTERED')) {
        automated = { ...automated, stage: 'ENTRANCE_TEST_REGISTERED' };
        pushRule(`Auto: có lịch ${automated.testDate} ${automated.testTime} → đăng ký test`, automated.email ? 'EMAIL' : 'SYSTEM', automated.email ? 'SENT' : 'SKIPPED');
      }
      if (testAverage > 0 && stageRank(automated.stage) < stageRank('TEST_COMPLETED')) {
        automated = { ...automated, stage: 'TEST_COMPLETED' };
        pushRule(`Auto: đã nhập điểm test TB ${testAverage.toFixed(1)} → đã test`, automated.email ? 'EMAIL' : 'SYSTEM', automated.email ? 'SENT' : 'SKIPPED');
      }
      if (testAverage >= 8 && stageRank(automated.stage) < stageRank('SCHOLARSHIP_REVIEW')) {
        automated = { ...automated, stage: 'SCHOLARSHIP_REVIEW', leadTemperature: 'HOT' };
        pushRule(`Auto: điểm TB ${testAverage.toFixed(1)} ≥ 8.0 → duyệt học bổng`, 'SYSTEM');
      }
      if (automated.stage === 'DOCUMENTS_PENDING' && Object.values(automated.docChecklist).every(Boolean)) {
        pushRule('Auto: hồ sơ đã đủ → sẵn sàng đồng bộ nhập học', 'SYSTEM');
      }
      if (logs.length) automated = normalizeLead({ ...automated, workflowLogs: [...logs, ...automated.workflowLogs] });
    }

    const nextLead = normalizeLead({ ...automated, updatedAt: nowIso(), createdAt: original?.createdAt || automated.createdAt });
    setLeads(current => current.map(item => item.id === nextLead.id ? nextLead : item));
    setSaving(true);
    try {
      await setDoc(doc(db, 'crm_leads', nextLead.id), nextLead);
      setCloudStatus('READY');
    } catch {
      setCloudStatus('LOCAL');
    } finally {
      setSaving(false);
    }
  };

  const addWorkflowLog = (lead: AdmissionLead, name: string, channel: WorkflowLog['channel'], status: WorkflowStatus = 'SENT', error = ''): AdmissionLead => ({
    ...lead,
    workflowLogs: [
      { id: `wf_${Date.now()}`, name, channel, status, createdAt: nowIso(), error },
      ...lead.workflowLogs,
    ],
  });

  const updateStage = async (lead: AdmissionLead, stage: LeadStage) => {
    let next = addWorkflowLog({ ...lead, stage }, `Chuyển trạng thái sang ${stageMeta.find(item => item.key === stage)?.label || stage}`, 'SYSTEM');
    if (stage === 'ENTRANCE_TEST_REGISTERED') next = addWorkflowLog(next, 'Gửi lịch test qua Email/Zalo OA', 'EMAIL', lead.email ? 'SENT' : 'SKIPPED');
    if (stage === 'TEST_COMPLETED') next = addWorkflowLog(next, 'Gửi kết quả test và đề xuất học bổng', 'EMAIL', lead.email ? 'SENT' : 'SKIPPED');
    if (stage === 'SEAT_RESERVED') next = addWorkflowLog(next, 'Gửi xác nhận giữ chỗ và checklist nhập học', 'ZALO');
    if (stage === 'ENROLLED') {
      next = addWorkflowLog(next, 'Đồng bộ Student 360, LMS, PHHS và công nợ', 'SYSTEM');
      syncEnrolledCrmLeadsToLifecycle([next]);
    }
    await persistLead(next, { skipAutomation: true });
  };

  const addLead = async () => {
    if (!newLead.studentName.trim() || !newLead.parentName.trim() || !newLead.phone.trim()) {
      setNotice('Cần nhập học sinh, phụ huynh và số điện thoại.');
      return;
    }
    const duplicate = leads.some(lead => lead.phone === newLead.phone.trim() || (newLead.email && lead.email.toLowerCase() === newLead.email.toLowerCase()));
    if (duplicate) {
      setNotice('Lead trùng số điện thoại hoặc email.');
      return;
    }
    const lead = normalizeLead({
      id: `lead_${Date.now()}`,
      leadCode: `LD2026_${String(leads.length + 1).padStart(3, '0')}`,
      ...newLead,
      stage: 'NEW_LEAD',
      interactions: [{ id: `i_${Date.now()}`, date: todayIso(), type: 'Intake', owner: 'Phòng Tuyển sinh', content: 'Tạo lead mới trong Admissions CRM.' }],
    });
    setLeads(current => [lead, ...current]);
    setSelectedLeadId(lead.id);
    setShowAddLead(false);
    setNewLead({ studentName: '', parentName: '', phone: '', email: '', source: 'Website', campaign: 'Tuyển sinh 2026', grade: 'Lớp 10' });
    try {
      await setDoc(doc(db, 'crm_leads', lead.id), lead);
      setCloudStatus('READY');
    } catch {
      setCloudStatus('LOCAL');
    }
  };

  const addInteraction = async () => {
    if (!selectedLead || !interactionContent.trim()) return;
    await persistLead({
      ...selectedLead,
      interactions: [
        { id: `int_${Date.now()}`, date: todayIso(), type: 'Chăm sóc', owner: selectedLead.ownerName, content: interactionContent.trim() },
        ...selectedLead.interactions,
      ],
    });
    setInteractionContent('');
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggingLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    if (!draggingLeadId) return;
    const lead = leads.find(l => l.id === draggingLeadId);
    if (lead && lead.stage !== targetStage) {
      await updateStage(lead, targetStage);
    }
    setDraggingLeadId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggingLeadId(null);
    setDragOverStage(null);
  };

  const generatePayment = async (lead: AdmissionLead, type: PaymentType) => {
    const code = type === 'RESERVATION' ? `GCHO_${lead.leadCode}` : `NHAPHOC_${lead.enrollmentCode}`;
    const amount = type === 'RESERVATION' ? lead.reservationFee : Math.max(0, lead.baseTuitionFee * (1 - (lead.scholarshipPercent + lead.phaseDiscountPercent + lead.siblingDiscountPercent + lead.staffChildDiscountPercent + lead.otherDiscountPercent) / 100) + lead.supportFee);
    const payment: CrmPayment = {
      id: `pay_${Date.now()}`,
      type,
      code,
      amount,
      status: 'PENDING',
      ...defaultBankConfig,
      vietQrUrl: buildVietQrUrl({ ...defaultBankConfig, amount, code }),
    };
    await persistLead(addWorkflowLog({ ...lead, payments: [payment, ...lead.payments], stage: type === 'RESERVATION' ? 'SEAT_RESERVATION_PAYMENT' : 'ENROLLMENT_PAYMENT' }, `Tạo VietQR ${code}`, 'SYSTEM'));
  };

  const reconcilePayments = async () => {
    const lines = reconcileText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (!lines.length) return;
    const nextLeads = leads.map(lead => {
      let changed = false;
      const payments = lead.payments.map(payment => {
        const matchedLine = lines.find(line => line.toUpperCase().includes(payment.code.toUpperCase()) || (line.includes(String(payment.amount)) && line.toUpperCase().includes(lead.leadCode.toUpperCase())));
        if (!matchedLine || payment.status === 'MATCHED') return payment;
        changed = true;
        return { ...payment, status: 'MATCHED' as const, matchedAt: nowIso(), statementRef: matchedLine };
      });
      if (!changed) return lead;
      const hasReservation = payments.some(item => item.type === 'RESERVATION' && item.status === 'MATCHED');
      const hasEnrollment = payments.some(item => item.type === 'ENROLLMENT' && item.status === 'MATCHED');
      const stage = hasEnrollment ? 'DOCUMENTS_PENDING' : hasReservation ? 'SEAT_RESERVED' : lead.stage;
      return addWorkflowLog({ ...lead, payments, stage }, 'Đối soát thanh toán thành công từ sao kê', 'SYSTEM');
    });
    setLeads(nextLeads);
    writeStoredLeads(nextLeads);
    serverStorage.setItem(CRM_IMPORT_BATCHES_STORAGE_KEY, JSON.stringify([{ id: `batch_${Date.now()}`, type: 'PAYMENT_RECONCILE', lines, createdAt: nowIso() }]));
    await Promise.all(nextLeads.map(lead => setDoc(doc(db, 'crm_leads', lead.id), lead).catch(() => undefined)));
    setNotice('Đã đối soát sao kê và cập nhật trạng thái thanh toán.');
  };

  const importLeads = async () => {
    const rows = importText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const parsed = rows.map(row => {
      const [studentName, parentName, phone, email = '', source = 'Website', campaign = 'Import tuyển sinh', stage = 'NEW_LEAD'] = row.includes('\t') ? row.split('\t') : row.split(',');
      return normalizeLead({ id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, studentName, parentName, phone, email, source, campaign, stage: mapLegacyStage(stage) });
    }).filter(lead => lead.studentName && lead.parentName && lead.phone && !leads.some(item => item.phone === lead.phone || (lead.email && item.email === lead.email)));
    if (!parsed.length) {
      setNotice('Không có lead hợp lệ hoặc tất cả bị trùng.');
      return;
    }
    const next = [...parsed, ...leads];
    setLeads(next);
    setImportText('');
    await Promise.all(parsed.map(lead => setDoc(doc(db, 'crm_leads', lead.id), lead).catch(() => undefined)));
    setNotice(`Đã import ${parsed.length} lead.`);
  };

  const filteredLeads = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return leads.filter(lead => {
      const matchStage = stageFilter === 'ALL' || lead.stage === stageFilter;
      const matchSearch = !q || [lead.studentName, lead.parentName, lead.phone, lead.email, lead.leadCode, lead.campaign, lead.source].some(value => String(value).toLowerCase().includes(q));
      return matchStage && matchSearch;
    });
  }, [leads, searchTerm, stageFilter]);

  const funnelData = useMemo(() => stageMeta.map(stage => ({ name: stage.short, value: leads.filter(lead => lead.stage === stage.key).length })), [leads]);
  const enrolled = leads.filter(lead => lead.stage === 'ENROLLED').length;
  const tested = leads.filter(lead => ['TEST_COMPLETED', 'SCHOLARSHIP_REVIEW', 'OFFER_SENT', 'SEAT_RESERVATION_PAYMENT', 'SEAT_RESERVED', 'ENROLLMENT_PAYMENT', 'DOCUMENTS_PENDING', 'ENROLLED'].includes(lead.stage)).length;
  const reserved = leads.filter(lead => ['SEAT_RESERVED', 'ENROLLMENT_PAYMENT', 'DOCUMENTS_PENDING', 'ENROLLED'].includes(lead.stage)).length;
  const reconciledRevenue = leads.flatMap(lead => lead.payments).filter(payment => payment.status === 'MATCHED').reduce((sum, item) => sum + item.amount, 0);
  const totalAdCost = leads.reduce((sum, lead) => sum + lead.adCost, 0);
  const selectedStageMeta = selectedLead ? stageMeta.find(item => item.key === selectedLead.stage) : null;

  return (
    <div className="space-y-5">
      <div className="bg-slate-950 text-white rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
              <Target className="h-4 w-4" /> Admissions CRM SaaS
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-black leading-tight">Pipeline tuyển sinh tự động: Lead → Test → Nhập học</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Lịch hẹn/Test tự đẩy trạng thái, rule automation ghi log rõ ràng, Kanban theo dõi next action và SLA tuyển sinh.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowAddLead(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-400">
              <Plus className="h-4 w-4" /> Lead
            </button>
            <button onClick={() => exportCsv(leads)} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
              <Download className="h-4 w-4" /> CSV
            </button>
            <span className={`rounded-lg px-3 py-2 text-xs font-bold ${cloudStatus === 'READY' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>
              {cloudStatus === 'SYNCING' ? 'Đang nối Firestore' : cloudStatus === 'READY' ? 'Firestore + local cache' : 'Local cache'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {([
          { label: 'Tổng lead', value: leads.length, icon: <Users className="h-4 w-4" />, accent: 'from-indigo-500/10 to-indigo-500/5 border-indigo-200/60', color: 'text-indigo-600' },
          { label: 'Đã test', value: tested, icon: <ClipboardList className="h-4 w-4" />, accent: 'from-sky-500/10 to-sky-500/5 border-sky-200/60', color: 'text-sky-600' },
          { label: 'Giữ chỗ', value: reserved, icon: <WalletCards className="h-4 w-4" />, accent: 'from-violet-500/10 to-violet-500/5 border-violet-200/60', color: 'text-violet-600' },
          { label: 'Nhập học', value: enrolled, icon: <CheckCircle2 className="h-4 w-4" />, accent: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200/60', color: 'text-emerald-600' },
          { label: 'Doanh thu đối soát', value: money(reconciledRevenue), icon: <QrCode className="h-4 w-4" />, accent: 'from-amber-500/10 to-amber-500/5 border-amber-200/60', color: 'text-amber-600' },
        ] as const).map(({ label, value, icon, accent, color }) => (
          <div key={label} className={`rounded-xl border bg-gradient-to-br ${accent} p-4 hover:shadow-sm transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
              <div className={`w-7 h-7 rounded-lg bg-white/70 border border-white/80 shadow-xs flex items-center justify-center ${color}`}>{icon}</div>
            </div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('LIST')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'LIST' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
        >
          <ClipboardList className="h-3.5 w-3.5" /> Danh sách
        </button>
        <button
          onClick={() => setViewMode('KANBAN')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'KANBAN' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
        >
          <Award className="h-3.5 w-3.5" /> Kanban Board
        </button>
        <span className="text-xs text-slate-400 ml-2">{filteredLeads.length} lead</span>
      </div>

      {/* Kanban Board */}
      {viewMode === 'KANBAN' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {stageMeta.map(stage => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
              const isOver = dragOverStage === stage.key;
              return (
                <div
                  key={stage.key}
                  className={`w-72 flex-shrink-0 rounded-2xl border shadow-sm transition-all duration-150 ${isOver ? 'ring-2 ring-indigo-400 border-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60'}`}
                  onDragOver={e => handleDragOver(e, stage.key)}
                  onDrop={e => handleDrop(e, stage.key)}
                  onDragLeave={() => setDragOverStage(null)}
                >
                  {/* Column header */}
                  <div className={`px-3 py-2.5 rounded-t-xl border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between`}>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black border ${stage.color}`}>{stage.short}</span>
                    <span className="text-[10px] font-black text-slate-400">{stageLeads.length} lead</span>
                  </div>
                  {/* Cards */}
                  <div className="p-2 space-y-2 min-h-[120px]">
                    {stageLeads.map(lead => {
                      const tempIcon = lead.leadTemperature === 'HOT' ? '🔥' : lead.leadTemperature === 'WARM' ? '🟡' : '❄️';
                      const scoreColor = lead.leadScore >= 70 ? 'bg-emerald-100 text-emerald-700' : lead.leadScore >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
                      const isDragging = draggingLeadId === lead.id;
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={e => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`bg-white dark:bg-slate-800 border rounded-lg p-2.5 cursor-grab active:cursor-grabbing select-none transition-all duration-150 hover:shadow-md hover:border-indigo-200 dark:border-slate-700 ${isDragging ? 'opacity-40 scale-95' : ''} ${selectedLead?.id === lead.id ? 'ring-1 ring-emerald-400 border-emerald-300' : 'border-slate-200'}`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="font-black text-[11.5px] text-slate-900 dark:text-white leading-snug flex-1 truncate">{lead.studentName}</div>
                            <span className="shrink-0 text-sm">{tempIcon}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{lead.parentName} · {lead.phone}</div>
                          <div className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">⚡ {getNextAction(lead)}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded font-mono truncate max-w-[80px]">{lead.source}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${scoreColor}`}>{lead.leadScore}pt</span>
                          </div>
                          <div className="mt-1.5 h-0.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all" style={{ width: `${lead.leadScore}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-6 text-[10px] text-slate-300 dark:text-slate-600 italic">Chưa có lead</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'LIST' && (
        <>
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Funnel tuyển sinh</h3>
              <p className="text-xs text-slate-500">CPL: {money(leads.length ? Math.round(totalAdCost / leads.length) : 0)} | CPA nhập học: {money(enrolled ? Math.round(totalAdCost / enrolled) : 0)}</p>
            </div>
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value as LeadStage | 'ALL')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="ALL">Tất cả trạng thái</option>
              {stageMeta.map(stage => <option key={stage.key} value={stage.key}>{stage.label}</option>)}
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <defs>
                  <linearGradient id="crmBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" fill="url(#crmBarGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Import &amp; Đối soát Sao kê</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Import Lead</span>
            </div>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Học sinh, Phụ huynh, SĐT, Email, Nguồn, Chiến dịch, Trạng thái" className="w-full min-h-[72px] rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/40" />
            <button onClick={importLeads} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-700 transition-colors">
              <Upload className="h-3.5 w-3.5" /> Import lead
            </button>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <WalletCards className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Đối soát Sao kê</span>
            </div>
            <textarea value={reconcileText} onChange={e => setReconcileText(e.target.value)} placeholder="Dán sao kê: GCHO_xxx hoặc NHAPHOC_xxx + số tiền" className="w-full min-h-[72px] rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/40" />
            <button onClick={reconcilePayments} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-colors">
              <WalletCards className="h-3.5 w-3.5" /> Đối soát
            </button>
          </div>
          {notice && <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800">{notice}</div>}
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Danh sách lead</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm lead, phụ huynh, SĐT..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs md:w-72 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-black text-[11px] uppercase tracking-wide">Lead</th>
                  <th className="px-4 py-3 font-black text-[11px] uppercase tracking-wide">Pipeline</th>
                  <th className="px-4 py-3 font-black text-[11px] uppercase tracking-wide">Marketing</th>
                  <th className="px-4 py-3 font-black text-[11px] uppercase tracking-wide">Score</th>
                  <th className="px-4 py-3 font-black text-[11px] uppercase tracking-wide">Lịch/Test</th>
                  <th className="px-4 py-3 font-black text-[11px] uppercase tracking-wide">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.map(lead => {
                  const meta = stageMeta.find(item => item.key === lead.stage);
                  const payment = lead.payments[0];
                  const tempIcon = lead.leadTemperature === 'HOT' ? '🔥' : lead.leadTemperature === 'WARM' ? '🟡' : '❄️';
                  const scoreColor = lead.leadScore >= 70 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : lead.leadScore >= 40 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  return (
                    <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-950 ${selectedLead?.id === lead.id ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-black text-slate-900 dark:text-white text-[12.5px]">{lead.studentName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{lead.leadCode} · {lead.parentName} · {lead.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{tempIcon}</span>
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${meta?.color}`}>{meta?.short}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="font-semibold">{lead.source}</div>
                        <div className="text-slate-400 text-[10px]">{lead.campaign}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black w-fit ${scoreColor}`}>{lead.leadScore}</span>
                          <div className="w-16 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500" style={{ width: `${lead.leadScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {getNextAction(lead)}
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        {payment ? <span className={payment.status === 'MATCHED' ? 'font-bold text-emerald-600' : 'font-bold text-amber-600'}>{payment.status === 'MATCHED' ? '✅' : '⏳'} {money(payment.amount)}</span> : <span className="text-slate-400">Chưa tạo QR</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {selectedLead && (
          <aside className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedLead.studentName}</h3>
                <p className="text-xs text-slate-500">{selectedLead.parentName || 'Chưa có thông tin PH'} | {selectedLead.phone || 'Chưa có SĐT'}</p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${selectedStageMeta?.color}`}>{selectedStageMeta?.short}</span>
            </div>

            {/* Tabs Navigation */}
            <div className="mt-4 flex border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('CARE')}
                className={`flex-1 pb-2 text-center text-[11px] font-black uppercase tracking-wide transition-all border-b-2 ${
                  activeTab === 'CARE'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Chăm sóc
              </button>
              <button
                onClick={() => setActiveTab('ASSESSMENT')}
                className={`flex-1 pb-2 text-center text-[11px] font-black uppercase tracking-wide transition-all border-b-2 ${
                  activeTab === 'ASSESSMENT'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Đánh giá
              </button>
              <button
                onClick={() => setActiveTab('DOCUMENTS')}
                className={`flex-1 pb-2 text-center text-[11px] font-black uppercase tracking-wide transition-all border-b-2 ${
                  activeTab === 'DOCUMENTS'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Hồ sơ
              </button>
              <button
                onClick={() => setActiveTab('PERSONAL')}
                className={`flex-1 pb-2 text-center text-[11px] font-black uppercase tracking-wide transition-all border-b-2 ${
                  activeTab === 'PERSONAL'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Cá nhân
              </button>
            </div>

            {/* Tab 1: CARE */}
            {activeTab === 'CARE' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500">Lịch sử chăm sóc</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={interactionContent}
                      onChange={e => setInteractionContent(e.target.value)}
                      placeholder="Ghi chú cuộc gọi/tư vấn..."
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={addInteraction}
                      className="rounded-lg bg-slate-900 p-2 text-white dark:bg-slate-700 hover:bg-slate-800 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
                  {[
                    ...selectedLead.workflowLogs,
                    ...selectedLead.interactions.map(item => ({
                      id: item.id,
                      name: item.content,
                      channel: 'SYSTEM' as const,
                      status: 'SENT' as const,
                      createdAt: item.date,
                    })),
                  ]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(item => {
                      let icon = '⚙️';
                      if (item.channel === 'EMAIL') icon = '📧';
                      else if (item.channel === 'ZALO') icon = '💬';
                      else if (item.name.toLowerCase().includes('gọi') || item.name.toLowerCase().includes('call')) icon = '📞';
                      else if (item.name.toLowerCase().includes('zalo') || item.name.toLowerCase().includes('tin nhắn')) icon = '💬';
                      
                      return (
                        <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/40 flex items-start gap-2.5">
                          <span className="text-base select-none shrink-0">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">{item.name}</div>
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                              <span>{item.createdAt.slice(0, 10)} {item.createdAt.includes('T') ? item.createdAt.slice(11, 16) : ''}</span>
                              <span>·</span>
                              <span className="uppercase text-[9px] px-1 bg-slate-200/50 dark:bg-slate-800 text-slate-500 rounded">{item.channel}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {selectedLead.workflowLogs.length === 0 && selectedLead.interactions.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-300 dark:text-slate-600 italic">Chưa có lịch sử chăm sóc</div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: ASSESSMENT */}
            {activeTab === 'ASSESSMENT' && (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-sky-950/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CalendarClock className="h-4 w-4" />
                    <h4 className="text-sm font-black">Lịch hẹn & Test hoạt động thế nào?</h4>
                  </div>
                  <div className="mt-3 grid gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <div className="rounded-xl bg-white/70 p-2 dark:bg-slate-950/40">1. Nhập ngày + giờ test → tự chuyển <b>Đăng ký test</b> + log gửi lịch.</div>
                    <div className="rounded-xl bg-white/70 p-2 dark:bg-slate-950/40">2. Nhập điểm → tự chuyển <b>Đã test</b>; TB ≥ 8.0 → <b>Duyệt học bổng</b>.</div>
                    <div className="rounded-xl bg-white/70 p-2 dark:bg-slate-950/40">3. Tạo QR/đối soát → tự đẩy giữ chỗ, hồ sơ, nhập học.</div>
                  </div>
                </div>

                <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500"><Zap className="h-3.5 w-3.5 text-amber-500" /> Quy tắc tự động</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">ON</span>
                  </div>
                  {['Có lịch → Đăng ký test', 'Có điểm → Đã test', 'TB ≥ 8.0 → Duyệt học bổng', 'Đủ hồ sơ → Sẵn sàng nhập học'].map(rule => (
                    <div key={rule} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {rule}</div>
                  ))}
                </div>

                <div className="grid gap-2">
                  <label className="text-[11px] font-black uppercase text-slate-500">Chuyển pipeline</label>
                  <select
                    value={selectedLead.stage}
                    onChange={e => updateStage(selectedLead, e.target.value as LeadStage)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {stageMeta.map(stage => <option key={stage.key} value={stage.key}>{stage.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-2">Đánh giá năng lực đầu vào</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <EditableField label="Ngày test" value={selectedLead.testDate} type="date" onChange={value => persistLead({ ...selectedLead, testDate: value })} />
                    <EditableField label="Giờ test" value={selectedLead.testTime} type="time" onChange={value => persistLead({ ...selectedLead, testTime: value })} />
                    <EditableField label="Toán/Tư duy" value={String(selectedLead.mathScore)} type="number" onChange={value => persistLead({ ...selectedLead, mathScore: value ? Number(value) : '' })} />
                    <EditableField label="Tiếng Anh" value={String(selectedLead.englishScore)} type="number" onChange={value => persistLead({ ...selectedLead, englishScore: value ? Number(value) : '' })} />
                    <EditableField label="Học bổng %" value={String(selectedLead.scholarshipPercent)} type="number" onChange={value => persistLead({ ...selectedLead, scholarshipPercent: numberValue(value) })} />
                    <EditableField label="Ưu đãi giai đoạn %" value={String(selectedLead.phaseDiscountPercent)} type="number" onChange={value => persistLead({ ...selectedLead, phaseDiscountPercent: numberValue(value) })} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-2">Thao tác tài chính & Bàn giao</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => generatePayment(selectedLead, 'RESERVATION')} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors px-3 py-2 text-xs font-bold text-white">
                      <QrCode className="h-3.5 w-3.5" /> QR giữ chỗ
                    </button>
                    <button onClick={() => generatePayment(selectedLead, 'ENROLLMENT')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors px-3 py-2 text-xs font-bold text-white">
                      <QrCode className="h-3.5 w-3.5" /> QR nhập học
                    </button>
                    <button onClick={() => updateStage(selectedLead, 'ENROLLED')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đồng bộ 360
                    </button>
                  </div>
                </div>

                {selectedLead.payments[0] && (
                  <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 bg-slate-50/30">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-slate-900 dark:text-white truncate">{selectedLead.payments[0].code}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{money(selectedLead.payments[0].amount)} | <span className={selectedLead.payments[0].status === 'MATCHED' ? 'text-emerald-600 font-bold' : 'text-amber-600'}>{selectedLead.payments[0].status}</span></div>
                      </div>
                      <a href={selectedLead.payments[0].vietQrUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-600 shrink-0 hover:underline">Mở QR</a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: DOCUMENTS */}
            {activeTab === 'DOCUMENTS' && (
              <div className="mt-4 space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-500">Danh mục hồ sơ gốc nộp số</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedLead.docChecklist).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-xs dark:border-slate-700 bg-slate-50/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer select-none">
                      <input type="checkbox" checked={value} onChange={e => persistLead({ ...selectedLead, docChecklist: { ...selectedLead.docChecklist, [key]: e.target.checked } })} className="accent-emerald-600 h-3.5 w-3.5" />
                      <span className="font-semibold">{documentLabel(key)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: PERSONAL */}
            {activeTab === 'PERSONAL' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-2">Thông tin phụ huynh</label>
                  <div className="grid gap-3">
                    <EditableField
                      label="Họ tên phụ huynh"
                      value={selectedLead.parentName || ''}
                      type="text"
                      onChange={value => persistLead({ ...selectedLead, parentName: value })}
                    />
                    <EditableField
                      label="Số điện thoại"
                      value={selectedLead.phone || ''}
                      type="text"
                      onChange={value => persistLead({ ...selectedLead, phone: value })}
                    />
                    <EditableField
                      label="Thư điện tử (Email)"
                      value={selectedLead.email || ''}
                      type="text"
                      onChange={value => persistLead({ ...selectedLead, email: value })}
                    />
                    <EditableField
                      label="Địa chỉ thường trú"
                      value={selectedLead.address || ''}
                      type="text"
                      onChange={value => persistLead({ ...selectedLead, address: value })}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <label className="text-[11px] font-black uppercase text-slate-500 block mb-2">Thông tin học sinh & Nguồn</label>
                  <div className="grid gap-3">
                    <EditableField
                      label="Trường học hiện tại"
                      value={selectedLead.currentSchool || ''}
                      type="text"
                      onChange={value => persistLead({ ...selectedLead, currentSchool: value })}
                    />
                    <EditableField
                      label="CCCD / Mã định danh"
                      value={selectedLead.personalId || ''}
                      type="text"
                      onChange={value => persistLead({ ...selectedLead, personalId: value })}
                    />
                    <EditableField
                      label="Thông tin anh/chị/em"
                      value={selectedLead.siblingInfo || ''}
                      type="text"
                      onChange={value => persistLead({ ...selectedLead, siblingInfo: value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
        </>
      )}

      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Thêm lead tuyển sinh</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ['studentName', 'Học sinh'],
                ['parentName', 'Phụ huynh'],
                ['phone', 'Số điện thoại'],
                ['email', 'Email'],
                ['source', 'Nguồn'],
                ['campaign', 'Chiến dịch'],
                ['grade', 'Lớp/Hệ đăng ký'],
              ].map(([key, label]) => (
                <input key={key} value={(newLead as any)[key]} onChange={e => setNewLead(current => ({ ...current, [key]: e.target.value }))} placeholder={label} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAddLead(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">Hủy</button>
              <button onClick={addLead} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Tạo lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableField({ label, value, type, onChange }: { label: string; value: string; type: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
      <input value={value} type={type} onChange={e => onChange(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
    </label>
  );
}

function documentLabel(key: string) {
  const labels: Record<string, string> = {
    hocBa: 'Học bạ',
    khaiSinh: 'Khai sinh',
    anh3x4: 'Ảnh 3x4',
    cccdParent: 'CCCD PH',
    healthRecord: 'Y tế',
    admissionForm: 'Đơn nhập học',
    paymentProof: 'Xác nhận phí',
    personalId: 'Mã định danh',
    siblingInfo: 'Anh/chị/em',
  };
  return labels[key] || key;
}
