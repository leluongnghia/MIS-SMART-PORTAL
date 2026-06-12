import { normalizeStudentProfile, getUnifiedStudents, saveUnifiedStudents } from './peopleDirectory';

export const CRM_LEADS_STORAGE_KEY = 'school_crm_leads';
export const LMS_STUDENTS_STORAGE_KEY = 'mis_lms_students';
export const SIS_STUDENTS_STORAGE_KEY = 'mis_sis_students_v3';
export const LMS_TUITION_STORAGE_KEY = 'mis_lms_tuition_fees';

type LeadStage = 'NEW' | 'CONSULTING' | 'TOUR' | 'TESTING' | 'OFFER' | 'RESERVED' | 'ENROLLED';

export interface CrmLifecycleLead {
  id: string;
  studentName: string;
  parentName?: string;
  phone?: string;
  email?: string;
  stage: LeadStage | string;
  grade?: string;
  notes?: string;
  scholarshipInfo?: string;
  baseTuitionFee?: number;
  tuitionDiscount?: number;
  scholarshipDiscount?: number;
  phaseEnrollmentDiscount?: number;
  advancedFee?: number;
  otherDiscount?: number;
  docChecklist?: {
    healthRecord?: boolean;
  };
}

interface SyncedStudent {
  id: string;
  code: string;
  crmLeadId: string;
  name: string;
  className: string;
  gender?: string;
  birthDate?: string;
  avatar?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  address: string;
  healthNote?: string;
  conduct?: string;
  scholarship?: string;
  extracurriculars?: string[];
  awards?: string[];
  disciplineLogs?: string[];
  transferHistory?: Array<{
    id: string;
    date: string;
    fromClass: string;
    toClass: string;
    reason: string;
    approvedBy: string;
  }>;
  academicHistory?: unknown[];
  healthIncidents?: unknown[];
  vaccinations?: unknown[];
}

interface SyncOptions {
  persist?: boolean;
  lmsStudents?: any[];
  sisStudents?: any[];
  tuitionFees?: any[];
}

export interface CrmLifecycleSyncResult {
  lmsStudents: any[];
  sisStudents: any[];
  tuitionFees: any[];
  syncedLeadIds: string[];
  addedLmsStudentIds: string[];
  addedSisStudentIds: string[];
  addedInvoiceNos: string[];
  updatedLmsStudentIds: string[];
  updatedSisStudentIds: string[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const readStoredArray = <T,>(key: string, fallback: T[] = []): T[] => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredArray = (key: string, value: any[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const readCrmLeadsFromStorage = () =>
  readStoredArray<CrmLifecycleLead>(CRM_LEADS_STORAGE_KEY, []);

const normalizeClassName = (grade?: string) => {
  const raw = String(grade || '').trim();
  const match = raw.match(/(?:lớp|lop)?\s*(\d{1,2})(?:\s*([a-z])\s*(\d))?/i);
  const gradeNumber = match?.[1] || '10';
  const sectionLetter = (match?.[2] || 'A').toUpperCase();
  const sectionNumber = match?.[3] || '1';
  return `Lớp ${gradeNumber}${sectionLetter}${sectionNumber}`;
};

const safeIdPart = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || String(Date.now());

const fallbackParentEmail = (lead: CrmLifecycleLead) =>
  lead.email?.trim() || `parent_${lead.phone || safeIdPart(lead.id)}@parent.mis.edu.vn`;

const calculatePayable = (lead: CrmLifecycleLead) => {
  const base = lead.baseTuitionFee || 15000000;
  const discounts =
    (lead.tuitionDiscount || 0) +
    (lead.scholarshipDiscount || 0) +
    (lead.phaseEnrollmentDiscount || 0) +
    (lead.otherDiscount || 0);
  return Math.max(0, base - discounts + (lead.advancedFee || 0));
};

const buildStudentFromLead = (lead: CrmLifecycleLead, index: number): SyncedStudent => {
  const idPart = safeIdPart(lead.id);
  const className = normalizeClassName(lead.grade);
  const parentPhone = lead.phone?.trim() || 'Chưa cập nhật';
  const rawStudent = normalizeStudentProfile({
    id: lead.id,
    code: lead.id.startsWith('lead_') ? `MIS-${lead.id.toUpperCase().replace('_', '-')}` : `MIS-${lead.id.toUpperCase()}`,
    crmLeadId: lead.id,
    name: lead.studentName.trim(),
    className,
    parentName: lead.parentName?.trim() || 'Phụ huynh chưa cập nhật',
    parentPhone,
    parentEmail: fallbackParentEmail(lead),
    emergencyContact: parentPhone,
    address: 'Chuyển từ CRM tuyển sinh',
    healthNote: lead.docChecklist?.healthRecord
      ? 'Đã có hồ sơ y tế từ quy trình tuyển sinh.'
      : 'Cần bổ sung hồ sơ y tế sau nhập học.',
    conduct: 'Tốt',
    scholarship: lead.scholarshipInfo || 'Không',
    extracurriculars: [],
    awards: lead.scholarshipInfo ? [`Tuyển sinh: ${lead.scholarshipInfo}`] : [],
    disciplineLogs: [],
    transferHistory: [
      {
        id: `tr_crm_${idPart}`,
        date: todayIso(),
        fromClass: 'CRM tuyển sinh',
        toClass: className,
        reason: 'Tự động tạo hồ sơ khi lead chuyển sang trạng thái nhập học',
        approvedBy: 'CRM Admissions',
      },
    ],
    academicHistory: [],
    healthIncidents: [],
    vaccinations: [],
  }, index, { refreshContact: false }) as SyncedStudent;

  return {
    ...rawStudent,
    crmLeadId: lead.id,
    parentName: lead.parentName?.trim() || rawStudent.parentName,
    parentPhone,
    parentEmail: fallbackParentEmail(lead),
    emergencyContact: parentPhone,
  };
};

const sameStudent = (student: any, incoming: SyncedStudent) =>
  student.crmLeadId === incoming.crmLeadId ||
  student.id === incoming.id ||
  (student.name === incoming.name &&
    (student.parentEmail === incoming.parentEmail || student.parentPhone === incoming.parentPhone));

const mergeStudent = (existing: any, incoming: SyncedStudent) => ({
  ...incoming,
  ...existing,
  crmLeadId: existing.crmLeadId || incoming.crmLeadId,
  code: existing.code || incoming.code,
  className: incoming.className || existing.className,
  parentName: incoming.parentName || existing.parentName,
  parentPhone: incoming.parentPhone || existing.parentPhone,
  parentEmail: incoming.parentEmail || existing.parentEmail,
  emergencyContact: incoming.emergencyContact || existing.emergencyContact,
  address:
    existing.address && !String(existing.address).toLowerCase().includes('chưa cập nhật')
      ? existing.address
      : incoming.address,
  healthNote: existing.healthNote || incoming.healthNote,
  scholarship: incoming.scholarship || existing.scholarship,
});

const upsertStudent = (students: any[], incoming: SyncedStudent) => {
  const index = students.findIndex(student => sameStudent(student, incoming));
  if (index === -1) return { students: [...students, incoming], added: true, updated: false };
  const next = [...students];
  next[index] = mergeStudent(next[index], incoming);
  return { students: next, added: false, updated: true };
};

const buildInvoiceFromLead = (lead: CrmLifecycleLead) => {
  const studentCode = lead.id.startsWith('lead_') ? `MIS-${lead.id.toUpperCase().replace('_', '-')}` : `MIS-${lead.id.toUpperCase()}`;
  return {
    id: `inv_crm_${safeIdPart(lead.id)}`,
    studentId: lead.id,
    studentCode,
    student: lead.studentName,
    amount: `${calculatePayable(lead).toLocaleString('vi-VN')}đ`,
    deadline: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'CHO_DONG',
    invoiceNo: `INV-CRM-${lead.id}`,
    crmLeadId: lead.id,
  };
};

export const syncEnrolledCrmLeadsToLifecycle = (
  leads: CrmLifecycleLead[],
  options: SyncOptions = {},
): CrmLifecycleSyncResult => {
  let lmsStudents = options.lmsStudents || readStoredArray<any>(LMS_STUDENTS_STORAGE_KEY, []);
  let sisStudents = options.sisStudents || readStoredArray<any>(SIS_STUDENTS_STORAGE_KEY, []);
  let tuitionFees = options.tuitionFees || readStoredArray<any>(LMS_TUITION_STORAGE_KEY, []);

  const syncedLeadIds: string[] = [];
  const addedLmsStudentIds: string[] = [];
  const addedSisStudentIds: string[] = [];
  const addedInvoiceNos: string[] = [];
  const updatedLmsStudentIds: string[] = [];
  const updatedSisStudentIds: string[] = [];

  leads
    .filter(lead => lead.stage === 'ENROLLED' && lead.studentName?.trim())
    .forEach((lead, index) => {
      const incoming = buildStudentFromLead(lead, sisStudents.length + index + 1);

      const lmsResult = upsertStudent(lmsStudents, incoming);
      lmsStudents = lmsResult.students;
      if (lmsResult.added) addedLmsStudentIds.push(incoming.id);
      if (lmsResult.updated) updatedLmsStudentIds.push(incoming.id);

      const sisResult = upsertStudent(sisStudents, incoming);
      sisStudents = sisResult.students;
      if (sisResult.added) addedSisStudentIds.push(incoming.id);
      if (sisResult.updated) updatedSisStudentIds.push(incoming.id);

      const invoice = buildInvoiceFromLead(lead);
      const hasInvoice = tuitionFees.some(item => item.invoiceNo === invoice.invoiceNo || item.crmLeadId === lead.id);
      if (!hasInvoice) {
        tuitionFees = [...tuitionFees, invoice];
        addedInvoiceNos.push(invoice.invoiceNo);
      }

      syncedLeadIds.push(lead.id);
    });

  if (options.persist !== false) {
    writeStoredArray(LMS_STUDENTS_STORAGE_KEY, lmsStudents);
    writeStoredArray(SIS_STUDENTS_STORAGE_KEY, sisStudents);
    writeStoredArray(LMS_TUITION_STORAGE_KEY, tuitionFees);

    const currentUnified = getUnifiedStudents();
    const nextUnified = currentUnified.map(student => {
      const match = sisStudents.find(s => s.id === student.id);
      if (match) {
        return {
          ...student,
          ...match,
          enrollmentStatus: 'ENROLLED' as const,
        };
      }
      return student;
    });
    sisStudents.forEach(s => {
      if (!nextUnified.some(u => u.id === s.id)) {
        nextUnified.push({
          ...s,
          enrollmentStatus: 'ENROLLED',
        });
      }
    });
    localStorage.setItem('mis_student_directory', JSON.stringify(nextUnified));
  }

  return {
    lmsStudents,
    sisStudents,
    tuitionFees,
    syncedLeadIds,
    addedLmsStudentIds,
    addedSisStudentIds,
    addedInvoiceNos,
    updatedLmsStudentIds,
    updatedSisStudentIds,
  };
};
