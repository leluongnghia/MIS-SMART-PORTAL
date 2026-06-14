'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq } from 'drizzle-orm';

const statusLabels: Record<string, string> = {
  new: 'Mới (New)',
  contacted: 'Đã liên hệ',
  consultation_scheduled: 'Hẹn tư vấn',
  application_submitted: 'Nộp đơn học',
  seat_reserved: 'Giữ chỗ',
  payment_confirmed: 'Đóng phí',
  enrolled: 'Nhập học',
  lost: 'Từ chối (Lost)',
};

const typeLabels: Record<string, string> = {
  seat_reservation: 'Giữ chỗ (Seat)',
  tuition: 'Học phí (Tuition)',
  admission_fee: 'Lệ phí tuyển sinh (Fee)',
};

export async function getReportsData() {
  const allLeads = await db.select().from(schema.leads);
  const paidPayments = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.status, 'paid'));

  // 1. Leads by source
  const sourceGroups: Record<string, number> = {};
  for (const lead of allLeads) {
    const src = lead.source || 'Other';
    sourceGroups[src] = (sourceGroups[src] || 0) + 1;
  }
  const leadsBySource = Object.entries(sourceGroups).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Leads by status
  const statusGroups: Record<string, number> = {};
  for (const lead of allLeads) {
    statusGroups[lead.status] = (statusGroups[lead.status] || 0) + 1;
  }
  const leadsByStatus = Object.entries(statusGroups).map(([key, value]) => ({
    name: statusLabels[key] || key,
    value,
  }));

  // 3. Conversion funnel
  // Funnel stages in logical order:
  // 1. Mới (New) -> 2. Đã liên hệ (Contacted) -> 3. Lên lịch tư vấn (Consultation) -> 4. Nộp đơn học (Applied) -> 5. Giữ chỗ (Reserved) -> 6. Nhập học (Enrolled)
  const funnelStages = [
    { key: 'new', label: '1. Đăng ký mới' },
    { key: 'contacted', label: '2. Đã liên hệ' },
    { key: 'consultation_scheduled', label: '3. Hẹn tư vấn' },
    { key: 'application_submitted', label: '4. Nộp đơn học' },
    { key: 'seat_reserved', label: '5. Đã giữ chỗ' },
    { key: 'enrolled', label: '6. Nhập học' },
  ];

  // For each stage, we calculate the number of candidates who reached this stage or further.
  // In a CRM pipeline:
  // Anyone contacted must have been new.
  // Anyone in consultation scheduled must have been contacted.
  // Anyone in applied must have had consultation.
  // Anyone in seat reserved must have applied.
  // Anyone enrolled must have reserved.
  // So cumulative funnel:
  let cumulative = 0;
  const funnelData: { name: string; count: number }[] = [];
  
  // We can also calculate standard stage counts, but a funnel chart looks best with cumulative/progression.
  // Let's compute both or just logical funnel progression:
  // e.g. Count of leads currently in that stage or beyond.
  const enrolledCount = allLeads.filter(l => l.status === 'enrolled').length;
  const paymentConfirmedCount = allLeads.filter(l => l.status === 'payment_confirmed').length;
  const seatReservedCount = allLeads.filter(l => l.status === 'seat_reserved').length;
  const appSubmittedCount = allLeads.filter(l => l.status === 'application_submitted').length;
  const consultationCount = allLeads.filter(l => l.status === 'consultation_scheduled').length;
  const contactedCount = allLeads.filter(l => l.status === 'contacted').length;
  const newCount = allLeads.filter(l => l.status === 'new').length;
  const lostCount = allLeads.filter(l => l.status === 'lost').length;

  const funnel = [
    { name: '1. Đăng ký mới', count: allLeads.length },
    { name: '2. Đã liên hệ', count: allLeads.length - newCount },
    { name: '3. Hẹn tư vấn', count: contactedCount + consultationCount + appSubmittedCount + seatReservedCount + paymentConfirmedCount + enrolledCount },
    { name: '4. Nộp đơn học', count: appSubmittedCount + seatReservedCount + paymentConfirmedCount + enrolledCount },
    { name: '5. Đã giữ chỗ', count: seatReservedCount + paymentConfirmedCount + enrolledCount },
    { name: '6. Nhập học', count: enrolledCount },
  ];

  // 4. Revenue by payment type
  const revenueGroups: Record<string, number> = {
    seat_reservation: 0,
    tuition: 0,
    admission_fee: 0,
  };
  for (const pay of paidPayments) {
    revenueGroups[pay.type] = (revenueGroups[pay.type] || 0) + pay.amount;
  }
  const revenueByPaymentType = Object.entries(revenueGroups).map(([key, value]) => ({
    name: typeLabels[key] || key,
    value,
  }));

  // 5. Enrollment by grade (Enrolled students grouped by grade level)
  const enrolledStudents = allLeads.filter(l => l.status === 'enrolled');
  const gradeGroups: Record<string, number> = {};
  for (const student of enrolledStudents) {
    gradeGroups[student.grade] = (gradeGroups[student.grade] || 0) + 1;
  }
  // Let's sort grades logically if possible
  const enrollmentByGrade = Object.entries(gradeGroups).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    leadsBySource,
    leadsByStatus,
    conversionFunnel: funnel,
    revenueByPaymentType,
    enrollmentByGrade,
  };
}
