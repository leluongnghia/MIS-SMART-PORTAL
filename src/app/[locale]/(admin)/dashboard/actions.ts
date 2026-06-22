'use server';

import { db, schema } from '@/src/libs/server/db';
import { desc, eq, ne, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentActor, isAdminTruong, isTruongPhong, writeAuditLog } from '@/src/libs/server/auth-helper';
import { getJsonSetting, setJsonSetting } from '@/src/libs/server/module-settings';

const DASHBOARD_SETTINGS_KEY = 'dashboard:widget_settings';
const defaultDashboardSettings = {
  showAlerts: true,
  showOkrKpi: true,
  showActionCenter: true,
  showCharts: true,
  showActivities: true,
};

function canManageDashboard(actor: Awaited<ReturnType<typeof getCurrentActor>>) {
  return !!actor && (isAdminTruong(actor) || isTruongPhong(actor) || actor.workspaceId === 'BGH');
}

const emptyDashboardStats = {
  funnel: [
    { label: 'Tiếp cận', value: 0, pct: '0%' },
    { label: 'Quan tâm', value: 0, pct: '0%' },
    { label: 'Tư vấn', value: 0, pct: '0%' },
    { label: 'Đăng ký', value: 0, pct: '0%' },
    { label: 'Nhập học', value: 0, pct: '0%' },
  ],
  heatmapData: Array.from({ length: 5 }, () => Array(5).fill(0)),
  alerts: {
    overdueTasksCount: 0,
    overdueTasksTrend: 0,
    pendingApprovalsCount: 0,
    pendingApprovalsTrend: 0,
    severeRisksCount: 0,
    severeRisksTrend: 0,
  },
  actionCenter: { urgentApprovals: 0, priorityTasks: [] },
  recentActivities: [],
  risks: [],
};

export async function getDashboardStats() {
  try {
    const now = new Date().toISOString().slice(0, 10);

    const [
      overdueRows,
      severeRiskRows,
      pendingApprovalRows,
      priorityTasks,
      recentEvents,
      recentRisks,
      funnelRows,
      heatmapRisks,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.tasks)
        .where(sql`${schema.tasks.status} = 'overdue' OR (${schema.tasks.deadline} < ${now} AND ${schema.tasks.status} <> 'completed')`),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.risks)
        .where(sql`${schema.risks.severity} = 'high' AND ${schema.risks.status} = 'open'`),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leaveRequests)
        .where(eq(schema.leaveRequests.status, 'pending')),
      db
        .select()
        .from(schema.tasks)
        .where(sql`${schema.tasks.priority} = 'high' AND ${schema.tasks.status} <> 'completed'`)
        .orderBy(desc(schema.tasks.createdAt))
        .limit(3),
      db.select().from(schema.events).orderBy(desc(schema.events.date)).limit(5),
      db
        .select({ id: schema.risks.id, title: schema.risks.title, severity: schema.risks.severity, status: schema.risks.status, payload: schema.risks.payload, createdAt: schema.risks.createdAt })
        .from(schema.risks)
        .orderBy(desc(schema.risks.createdAt))
        .limit(25),
      db
        .select({ status: schema.leads.status, count: sql<number>`count(*)` })
        .from(schema.leads)
        .groupBy(schema.leads.status),
      db
        .select({ title: schema.risks.title, severity: schema.risks.severity, payload: schema.risks.payload })
        .from(schema.risks)
        .where(ne(schema.risks.status, 'closed'))
        .limit(100),
    ]);

    const overdueTasksCount = Number(overdueRows[0]?.count || 0);
    const severeRisksCount = Number(severeRiskRows[0]?.count || 0);
    const pendingApprovalsCount = Number(pendingApprovalRows[0]?.count || 0);

    const leadCountByStatus = Object.fromEntries(funnelRows.map((row) => [row.status, Number(row.count || 0)]));
    const countStatuses = (statuses: string[]) => statuses.reduce((sum, status) => sum + (leadCountByStatus[status] || 0), 0);
    const tiepCan = Object.values(leadCountByStatus).reduce((sum, count) => sum + count, 0);
    const quanTam = countStatuses(['consulting', 'test_scheduled', 'test_participated', 'seat_reserved', 'docs_submitted', 'enrolled']);
    const tuVan = countStatuses(['test_scheduled', 'test_participated', 'seat_reserved', 'docs_submitted', 'enrolled']);
    const dangKy = countStatuses(['seat_reserved', 'docs_submitted', 'enrolled']);
    const nhapHoc = countStatuses(['enrolled']);

    const pct = (value: number) => tiepCan ? `${Math.round((value / tiepCan) * 100)}%` : '0%';
    const funnel = [
      { label: 'Tiếp cận', value: tiepCan, pct: tiepCan ? '100%' : '0%' },
      { label: 'Quan tâm', value: quanTam, pct: pct(quanTam) },
      { label: 'Tư vấn', value: tuVan, pct: pct(tuVan) },
      { label: 'Đăng ký', value: dangKy, pct: pct(dangKy) },
      { label: 'Nhập học', value: nhapHoc, pct: pct(nhapHoc) },
    ];

    const categories = ['Tài chính', 'Hoạt động', 'Nhân sự', 'Tuân thủ', 'Danh tiếng'];
    const heatmapData = Array.from({ length: 5 }, () => Array(5).fill(0));
    heatmapRisks.forEach((risk) => {
      const payload = risk.payload as any;
      let catIdx = categories.indexOf(payload?.category);
      if (catIdx === -1) catIdx = risk.title.length % 5;
      let sevIdx = risk.severity === 'high' ? 4 : risk.severity === 'medium' ? 2 : 1;
      if (payload?.probability !== undefined) sevIdx = Math.max(0, Math.min(4, Number(payload.probability)));
      heatmapData[catIdx][sevIdx]++;
    });

    return {
      dashboardSettings: await getJsonSetting(DASHBOARD_SETTINGS_KEY, defaultDashboardSettings),
      funnel,
      heatmapData,
      alerts: {
        overdueTasksCount,
        overdueTasksTrend: 8,
        pendingApprovalsCount,
        pendingApprovalsTrend: 5,
        severeRisksCount,
        severeRisksTrend: 2,
      },
      actionCenter: {
        urgentApprovals: pendingApprovalsCount,
        priorityTasks: priorityTasks.map((task) => ({
          task: task.title,
          dept: (task.payload as any)?.department || 'Chung',
          date: task.deadline || 'Sắp tới',
        })),
      },
      recentActivities: recentEvents.map((event) => ({
        time: new Date(event.date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
        text: event.title,
        dept: event.department || 'Hệ thống',
      })),
      risks: recentRisks.slice(0, 3).map((risk) => ({
        id: risk.id.slice(0, 3),
        text: risk.title,
        tag: risk.severity === 'high' ? 'Cao' : 'Trung bình',
      })),
    };
  } catch (error) {
    console.error('Dashboard stats failed:', error);
    return { ...emptyDashboardStats, dashboardSettings: defaultDashboardSettings };
  }
}

export async function saveDashboardSettings(settings: typeof defaultDashboardSettings) {
  try {
    const actor = await getCurrentActor();
    if (!canManageDashboard(actor)) return { success: false, error: 'Unauthorized' };
    const next = { ...defaultDashboardSettings, ...settings };
    await setJsonSetting(DASHBOARD_SETTINGS_KEY, next, {
      group: 'dashboard',
      label: 'Dashboard widget settings',
      description: 'Widget visibility for executive dashboard',
      updatedBy: actor?.id,
    });
    await writeAuditLog(actor?.id || null, 'save_dashboard_settings', 'dashboard', DASHBOARD_SETTINGS_KEY, { after: next, module: 'dashboard' });
    revalidatePath('/[locale]/dashboard', 'layout');
    return { success: true, data: next };
  } catch (error: any) {
    console.error('Save dashboard settings failed:', error);
    return { success: false, error: error.message };
  }
}
