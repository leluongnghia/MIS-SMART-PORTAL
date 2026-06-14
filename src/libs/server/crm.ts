const crmLeadIntakeQueue: any[] = [];
const crmLeadsStore = new Map<string, any>();
const crmWorkflowLogsStore: any[] = [];
const crmPaymentsStore = new Map<string, any>();
const crmImportBatchesStore: any[] = [];

const CRM_STAGE_SET = new Set([
  'NEW_LEAD',
  'CONTACTED',
  'CONSULTING',
  'APPOINTMENT_BOOKED',
  'ENTRANCE_TEST_REGISTERED',
  'TEST_COMPLETED',
  'SCHOLARSHIP_REVIEW',
  'OFFER_SENT',
  'SEAT_RESERVATION_PAYMENT',
  'SEAT_RESERVED',
  'ENROLLMENT_PAYMENT',
  'DOCUMENTS_PENDING',
  'ENROLLED',
  'LOST',
]);

export function normalizeCrmStage(stage: unknown) {
  const value = String(stage || '').toUpperCase();
  const legacy: Record<string, string> = {
    NEW: 'NEW_LEAD',
    LEAD: 'NEW_LEAD',
    ADS: 'NEW_LEAD',
    TOUR: 'APPOINTMENT_BOOKED',
    OPEN_DAY: 'APPOINTMENT_BOOKED',
    TESTING: 'ENTRANCE_TEST_REGISTERED',
    OFFER: 'OFFER_SENT',
    RESERVED: 'SEAT_RESERVED',
  };
  return CRM_STAGE_SET.has(value) ? value : legacy[value] || 'NEW_LEAD';
}

function createCrmCode(prefix: string) {
  return `${prefix}_${new Date().getFullYear()}_${Date.now().toString(36).toUpperCase()}`;
}

export function normalizeCrmLead(raw: any) {
  const id = String(raw.id || `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const leadCode = String(raw.leadCode || createCrmCode('LD'));
  const now = new Date().toISOString();
  return {
    id,
    leadCode,
    contactId: String(raw.contactId || `ct_${leadCode.toLowerCase()}`),
    opportunityId: String(raw.opportunityId || `opp_${leadCode.toLowerCase()}`),
    enrollmentCode: String(raw.enrollmentCode || `ENR_${leadCode}`),
    studentName: String(raw.studentName || raw.student_name || raw.name || '').trim(),
    parentName: String(raw.parentName || raw.parent_name || raw.contactName || '').trim(),
    phone: String(raw.phone || raw.mobile || raw.parentPhone || '').trim(),
    email: String(raw.email || raw.parentEmail || '').trim(),
    grade: String(raw.grade || raw.className || 'Lớp 10').trim(),
    stage: normalizeCrmStage(raw.stage),
    source: String(raw.source || raw.utm_source || raw.utmSource || 'Website').trim(),
    campaign: String(raw.campaign || raw.campaignName || raw.utm_campaign || raw.utmCampaign || 'Tuyển sinh 2026').trim(),
    adSet: String(raw.adSet || '').trim(),
    keyword: String(raw.keyword || '').trim(),
    utmSource: String(raw.utmSource || raw.utm_source || raw.source || 'Website').trim(),
    utmMedium: String(raw.utmMedium || raw.utm_medium || 'organic').trim(),
    utmCampaign: String(raw.utmCampaign || raw.utm_campaign || raw.campaign || raw.campaignName || 'Tuyển sinh 2026').trim(),
    landingPage: String(raw.landingPage || raw.landing_page || '/admissions').trim(),
    adCost: Number(raw.adCost || 0),
    ownerId: String(raw.ownerId || 'admissions_team'),
    ownerName: String(raw.ownerName || 'Phòng Tuyển sinh'),
    leadTemperature: String(raw.leadTemperature || 'WARM'),
    leadScore: Number(raw.leadScore || 0),
    lostReason: String(raw.lostReason || ''),
    testDate: String(raw.testDate || ''),
    testTime: String(raw.testTime || ''),
    mathScore: raw.mathScore ?? '',
    englishScore: raw.englishScore ?? '',
    vietnameseScore: raw.vietnameseScore ?? '',
    scholarshipPercent: Number(raw.scholarshipPercent || 0),
    baseTuitionFee: Number(raw.baseTuitionFee || 60000000),
    reservationFee: Number(raw.reservationFee || 5000000),
    notes: String(raw.notes || raw.message || ''),
    createdAt: raw.createdAt || now,
    updatedAt: now,
    rawPayload: raw.rawPayload || raw,
  };
}

export function appendCrmWorkflowLog(leadId: string, name: string, channel = 'SYSTEM', status = 'SENT', error = '') {
  const log = {
    id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    leadId,
    name,
    channel,
    status,
    error,
    createdAt: new Date().toISOString(),
  };
  crmWorkflowLogsStore.unshift(log);
  if (crmWorkflowLogsStore.length > 500) crmWorkflowLogsStore.pop();
  return log;
}

export function getBankConfig() {
  return {
    bankBin: process.env.BANK_BIN || '970436',
    bankAccountNo: process.env.BANK_ACCOUNT_NO || '0123456789',
    bankAccountName: process.env.BANK_ACCOUNT_NAME || 'MIS SMART SCHOOL',
    reservationPrefix: process.env.PAYMENT_PREFIX_RESERVATION || 'GCHO',
    enrollmentPrefix: process.env.PAYMENT_PREFIX_ENROLLMENT || 'NHAPHOC',
  };
}

export function buildVietQrUrl(payment: any) {
  const accountName = encodeURIComponent(payment.bankAccountName);
  const addInfo = encodeURIComponent(payment.code);
  return `https://img.vietqr.io/image/${payment.bankBin}-${payment.bankAccountNo}-compact2.png?amount=${payment.amount}&addInfo=${addInfo}&accountName=${accountName}`;
}

export const crmStore = {
  leadIntakeQueue: crmLeadIntakeQueue,
  leads: crmLeadsStore,
  workflowLogs: crmWorkflowLogsStore,
  payments: crmPaymentsStore,
  importBatches: crmImportBatchesStore,
};
