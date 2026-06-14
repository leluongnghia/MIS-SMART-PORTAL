'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq } from 'drizzle-orm';

const statusLabels: Record<string, string> = {
  received: 'Tiếp nhận Data',
  consulting: 'Đang tư vấn',
  test_scheduled: 'Đăng ký Test',
  test_participated: 'Đã tham gia Test',
  seat_reserved: 'Đã giữ chỗ',
  docs_submitted: 'Đã nộp hồ sơ',
  enrolled: 'Đã nhập học',
  cancelled: 'Hủy/Rút hồ sơ',
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
  const enrolledCount = allLeads.filter(l => l.status === 'enrolled').length;
  const docsSubmittedCount = allLeads.filter(l => l.status === 'docs_submitted').length;
  const seatReservedCount = allLeads.filter(l => l.status === 'seat_reserved').length;
  const testParticipatedCount = allLeads.filter(l => l.status === 'test_participated').length;
  const testScheduledCount = allLeads.filter(l => l.status === 'test_scheduled').length;
  const consultingCount = allLeads.filter(l => l.status === 'consulting').length;
  const receivedCount = allLeads.filter(l => l.status === 'received').length;

  const funnel = [
    { name: '1. Tiếp nhận Data', count: allLeads.length },
    { name: '2. Đang tư vấn', count: consultingCount + testScheduledCount + testParticipatedCount + seatReservedCount + docsSubmittedCount + enrolledCount },
    { name: '3. Đăng ký Test', count: testScheduledCount + testParticipatedCount + seatReservedCount + docsSubmittedCount + enrolledCount },
    { name: '4. Đã tham gia Test', count: testParticipatedCount + seatReservedCount + docsSubmittedCount + enrolledCount },
    { name: '5. Đã giữ chỗ', count: seatReservedCount + docsSubmittedCount + enrolledCount },
    { name: '6. Đã nộp hồ sơ', count: docsSubmittedCount + enrolledCount },
    { name: '7. Đã nhập học', count: enrolledCount },
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
