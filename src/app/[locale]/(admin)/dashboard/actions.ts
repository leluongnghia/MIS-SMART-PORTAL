'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, desc } from 'drizzle-orm';
import { seedDashboardData } from './seed';

export async function getDashboardStats() {
  // Try to seed data first if needed
  await seedDashboardData();

  // Get tasks
  const allTasks = await db.select().from(schema.tasks);
  const overdueTasksCount = allTasks.filter(t => t.status === 'overdue' || (t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed')).length;

  // Get risks
  const allRisks = await db.select().from(schema.risks);
  const severeRisksCount = allRisks.filter(r => r.severity === 'high' && r.status === 'open').length;
  const recentRisks = [...allRisks].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 3);

  // Get approvals (using leaveRequests as a proxy)
  const allApprovals = await db.select().from(schema.leaveRequests);
  const pendingApprovalsCount = allApprovals.filter(a => a.status === 'pending').length;

  // Get events for timeline
  const recentEvents = await db.select().from(schema.events).orderBy(desc(schema.events.date)).limit(5);

  // Action Center tasks
  const priorityTasks = [...allTasks].filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 3);

  // Leads for funnel
  const allLeads = await db.select().from(schema.leads);

  
  // Funnel calculation
  const totalLeads = allLeads.length || 1; // avoid division by zero
  const tiepCan = allLeads.length;
  const quanTam = allLeads.filter(l => ["consulting", "test_scheduled", "test_participated", "seat_reserved", "docs_submitted", "enrolled"].includes(l.status)).length;
  const tuVan = allLeads.filter(l => ["test_scheduled", "test_participated", "seat_reserved", "docs_submitted", "enrolled"].includes(l.status)).length;
  const dangKy = allLeads.filter(l => ["seat_reserved", "docs_submitted", "enrolled"].includes(l.status)).length;
  const nhapHoc = allLeads.filter(l => ["enrolled"].includes(l.status)).length;

  const funnel = [
    { label: "Tiếp cận", value: tiepCan, pct: tiepCan ? "100%" : "0%" },
    { label: "Quan tâm", value: quanTam, pct: tiepCan ? Math.round((quanTam/tiepCan)*100) + "%" : "0%" },
    { label: "Tư vấn", value: tuVan, pct: tiepCan ? Math.round((tuVan/tiepCan)*100) + "%" : "0%" },
    { label: "Đăng ký", value: dangKy, pct: tiepCan ? Math.round((dangKy/tiepCan)*100) + "%" : "0%" },
    { label: "Nhập học", value: nhapHoc, pct: tiepCan ? Math.round((nhapHoc/tiepCan)*100) + "%" : "0%" }
  ];

  // Heatmap calculation
  const categories = ["Tài chính", "Hoạt động", "Nhân sự", "Tuân thủ", "Danh tiếng"];
  // We place risks into the grid [row][col] -> count. rows = categories (0-4), cols = severity (0-4)
  const heatmapData = Array(5).fill(0).map(() => Array(5).fill(0));
  
  allRisks.forEach(r => {
    // Generate pseudo-random position if payload is empty so it looks nice with real data
    const payload = r.payload as any;
    let catIdx = categories.indexOf(payload?.category);
    if (catIdx === -1) catIdx = r.title.length % 5;
    
    let sevIdx = r.severity === "high" ? 4 : r.severity === "medium" ? 2 : 1;
    if (payload?.probability !== undefined) {
      sevIdx = payload.probability;
    }
    heatmapData[catIdx][sevIdx]++;
  });

  return {
    funnel, heatmapData, alerts: {
      overdueTasksCount,
      overdueTasksTrend: 8,
      pendingApprovalsCount,
      pendingApprovalsTrend: 5,
      severeRisksCount,
      severeRisksTrend: 2,
    },
    actionCenter: {
      urgentApprovals: pendingApprovalsCount,
      priorityTasks: priorityTasks.map(t => ({
        task: t.title,
        dept: (t.payload as any)?.department || 'Chung',
        date: t.deadline || 'Sắp tới',
      })),
    },
    recentActivities: recentEvents.map(e => ({
      time: new Date(e.date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
      text: e.title,
      dept: e.department || 'Hệ thống',
    })),
    risks: recentRisks.map(r => ({
      id: r.id.slice(0, 3),
      text: r.title,
      tag: r.severity === 'high' ? 'Cao' : 'Trung bình',
    }))
  };
}
