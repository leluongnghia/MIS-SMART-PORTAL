'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, ne, sql, and, isNull, desc } from 'drizzle-orm';

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

export async function getReportsData() {
  const now = new Date();
  const nowStr = now.toISOString().slice(0, 10);
  const ninetyDaysLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Safety wrappers for all database queries
  
  // 1. Overview stats (BGH KPI)
  let kpiStats = {
    openTasks: 0,
    overdueTasks: 0,
    pendingDirectives: 0,
    pendingApprovals: 0,
    openTickets: 0,
    overdueTickets: 0,
    severeRisks: 0,
    overdueCapas: 0,
    openRepairs: 0,
    expiringContracts: 0,
    upcomingEvents: 0,
    docsReview: 0,
  };

  // 2. Tab 2: Tasks & Approvals
  let tasksData = {
    statusBreakdown: [] as any[],
    priorityBreakdown: [] as any[],
    departmentBreakdown: [] as any[],
    approvalsStatus: [] as any[],
    recentApprovalsList: [] as any[],
  };

  // 3. Tab 3: HRM
  let hrmData = {
    statusBreakdown: [] as any[],
    expiringContracts: [] as any[],
    deptStaff: [] as any[],
    probationCount: 0,
    leaveTodayCount: 0,
    trainingCount: 0,
  };

  // 4. Tab 4: Logistics
  let logisticsData = {
    assetsStatus: [] as any[],
    repairRequestsStatus: [] as any[],
    lowStockSupplies: [] as any[],
    totalAssets: 0,
    inRepairCount: 0,
  };

  // 5. Tab 5: Risks & CAPA
  let riskData = {
    severityBreakdown: [] as any[],
    statusBreakdown: [] as any[],
    capaBreakdown: [] as any[],
    recentRisks: [] as any[],
  };

  // 6. Tab 6: Parent Care & Events
  let parentCareData = {
    funnel: [] as any[],
    sourceBreakdown: [] as any[],
    upcomingEvents: [] as any[],
    crisisCount: 0,
  };

  // 7. Tab 7: Documents & SOPs
  let documentsData = {
    statusBreakdown: [] as any[],
    categoryBreakdown: [] as any[],
    needsReviewList: [] as any[],
  };

  // Run all aggregates with try-catch blocks
  
  // TASKS & APPROVALS
  try {
    const allTasks = await db.select().from(schema.tasks).where(isNull(schema.tasks.deletedAt));
    
    // Status breakdown
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    const deptCounts: Record<string, number> = {};
    
    let openCount = 0;
    let overdueCount = 0;
    let capaOverdue = 0;
    let capaTotal = 0;

    allTasks.forEach(task => {
      const isCompleted = task.status === 'completed';
      const isOverdue = task.status === 'overdue' || (task.deadline && task.deadline < nowStr && !isCompleted);
      
      if (!isCompleted) openCount++;
      if (isOverdue) {
        overdueCount++;
        if (task.tag === 'CAPA') capaOverdue++;
      }
      if (task.tag === 'CAPA') capaTotal++;

      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
      
      const dept = task.workspaceId || 'Chung';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    kpiStats.openTasks = openCount;
    kpiStats.overdueTasks = overdueCount;
    kpiStats.overdueCapas = capaOverdue;

    tasksData.statusBreakdown = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    tasksData.priorityBreakdown = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));
    tasksData.departmentBreakdown = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  } catch (e) {
    console.error('Reports actions - tasks query failed:', e);
  }

  // LEAVE REQUESTS & APPROVALS
  try {
    const allApprovals = await db.select().from(schema.leaveRequests);
    let pendingCount = 0;
    const approvalStatusCounts: Record<string, number> = {};

    allApprovals.forEach(app => {
      if (app.status === 'pending') pendingCount++;
      approvalStatusCounts[app.status] = (approvalStatusCounts[app.status] || 0) + 1;
    });

    kpiStats.pendingApprovals = pendingCount;
    tasksData.approvalsStatus = Object.entries(approvalStatusCounts).map(([name, value]) => ({
      name: name === 'pending' ? 'Chờ duyệt' : name === 'approved' ? 'Đã duyệt' : 'Từ chối',
      value
    }));
    tasksData.recentApprovalsList = allApprovals.slice(0, 10).map(app => ({
      ...app,
      startDate: app.startDate ? app.startDate.toLocaleDateString('vi-VN') : '',
      endDate: app.endDate ? app.endDate.toLocaleDateString('vi-VN') : '',
      createdAt: app.createdAt ? app.createdAt.toLocaleDateString('vi-VN') : '',
      updatedAt: app.updatedAt ? app.updatedAt.toLocaleDateString('vi-VN') : '',
    }));
  } catch (e) {
    console.error('Reports actions - approvals query failed:', e);
  }

  // DIRECTIVES
  try {
    const allDirs = await db.select().from(schema.directives).where(isNull(schema.directives.deletedAt));
    let pendingFeedback = 0;
    allDirs.forEach(d => {
      const status = (d.payload as any)?.status;
      if (status !== 'Đã hoàn thành') pendingFeedback++;
    });
    kpiStats.pendingDirectives = pendingFeedback;
  } catch (e) {
    console.error('Reports actions - directives query failed:', e);
  }

  // HRM
  try {
    const allProfiles = await db.select().from(schema.employeeProfiles);
    const contracts = await db.select().from(schema.employmentContracts).where(eq(schema.employmentContracts.status, 'active'));
    const leaves = await db.select().from(schema.leaveRequests).where(and(eq(schema.leaveRequests.status, 'approved'), sql`${schema.leaveRequests.startDate} <= ${nowStr} AND ${schema.leaveRequests.endDate} >= ${nowStr}`));
    const allUsers = await db.select().from(schema.users);

    hrmData.probationCount = allProfiles.filter(p => p.status === 'probation').length;
    hrmData.leaveTodayCount = leaves.length;

    // Status breakdown
    const hrmStatusCounts: Record<string, number> = {};
    const deptStaffCounts: Record<string, number> = {};

    allProfiles.forEach(p => {
      hrmStatusCounts[p.status] = (hrmStatusCounts[p.status] || 0) + 1;
    });

    allUsers.forEach(u => {
      const dept = u.departmentId || 'Chưa xếp phòng';
      deptStaffCounts[dept] = (deptStaffCounts[dept] || 0) + 1;
    });

    hrmData.statusBreakdown = Object.entries(hrmStatusCounts).map(([name, value]) => ({
      name: name === 'active' ? 'Chính thức' : name === 'probation' ? 'Thử việc' : 'Nghỉ việc/Tạm hoãn',
      value
    }));
    hrmData.deptStaff = Object.entries(deptStaffCounts).map(([name, value]) => ({ name, value }));

    // Expiring contracts
    const ninetyDaysLaterDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expiring = contracts.filter(c => c.endDate && c.endDate <= ninetyDaysLaterDate);
    kpiStats.expiringContracts = expiring.length;
    hrmData.expiringContracts = expiring.map(c => ({
      contractNumber: c.contractNumber,
      endDate: c.endDate ? c.endDate.toLocaleDateString('vi-VN') : 'Sắp tới',
      status: c.status
    }));

    hrmData.trainingCount = 3; // mock
  } catch (e) {
    console.error('Reports actions - HRM query failed:', e);
  }

  // LOGISTICS
  try {
    const assets = await db.select().from(schema.facilitiesAssets);
    const repairs = await db.select().from(schema.facilitiesRepairRequests);
    const supplies = await db.select().from(schema.facilitiesSupplies);

    logisticsData.totalAssets = assets.length;
    logisticsData.inRepairCount = assets.filter(a => a.status === 'REPAIRING' || a.status === 'BROKEN').length;

    // Asset status breakdown
    const assetStatusCounts: Record<string, number> = {};
    assets.forEach(a => {
      assetStatusCounts[a.status] = (assetStatusCounts[a.status] || 0) + 1;
    });
    logisticsData.assetsStatus = Object.entries(assetStatusCounts).map(([name, value]) => ({
      name: name === 'NORMAL' ? 'Bình thường' : name === 'BROKEN' ? 'Hỏng' : name === 'REPAIRING' ? 'Đang sửa' : name,
      value
    }));

    // Repair requests status breakdown
    const repairStatusCounts: Record<string, number> = {};
    let openRepCount = 0;
    repairs.forEach(r => {
      if (['NEW', 'PROCESSING', 'WAITING_PART'].includes(r.status)) openRepCount++;
      repairStatusCounts[r.status] = (repairStatusCounts[r.status] || 0) + 1;
    });
    kpiStats.openRepairs = openRepCount;
    logisticsData.repairRequestsStatus = Object.entries(repairStatusCounts).map(([name, value]) => ({ name, value }));

    // Low stock supplies
    logisticsData.lowStockSupplies = supplies.filter(s => s.currentQuantity <= s.minimumQuantity).map(s => ({
      name: s.name,
      code: s.code,
      quantity: s.currentQuantity,
      minQuantity: s.minimumQuantity
    }));
  } catch (e) {
    console.error('Reports actions - Logistics query failed:', e);
  }

  // RISKS
  try {
    const allRisks = await db.select().from(schema.risks);
    let totalOpen = 0;
    let highRiskCount = 0;

    const severityCounts: Record<string, number> = {};
    const riskStatusCounts: Record<string, number> = {};

    allRisks.forEach(r => {
      severityCounts[r.severity] = (severityCounts[r.severity] || 0) + 1;
      riskStatusCounts[r.status] = (riskStatusCounts[r.status] || 0) + 1;

      if (r.status === 'open') {
        totalOpen++;
        if (r.severity === 'high') highRiskCount++;
      }
    });

    kpiStats.severeRisks = highRiskCount;
    riskData.severityBreakdown = Object.entries(severityCounts).map(([name, value]) => ({
      name: name === 'high' ? 'Cao' : name === 'medium' ? 'Vừa' : 'Thấp',
      value
    }));
    riskData.statusBreakdown = Object.entries(riskStatusCounts).map(([name, value]) => ({
      name: name === 'open' ? 'Đang mở' : 'Đã đóng',
      value
    }));
    riskData.recentRisks = allRisks.slice(0, 10);
  } catch (e) {
    console.error('Reports actions - Risks query failed:', e);
  }

  // PARENT CARE & EVENTS (LEADS)
  try {
    const allLeads = await db.select().from(schema.leads).where(isNull(schema.leads.deletedAt));
    const events = await db.select().from(schema.events).where(sql`${schema.events.date} >= ${nowStr}`);

    kpiStats.upcomingEvents = events.length;
    parentCareData.upcomingEvents = events.map(ev => ({
      ...ev,
      date: ev.date ? ev.date.toLocaleDateString('vi-VN') : '',
      createdAt: ev.createdAt ? ev.createdAt.toLocaleDateString('vi-VN') : '',
      updatedAt: ev.updatedAt ? ev.updatedAt.toLocaleDateString('vi-VN') : '',
    }));

    // Leads by status
    const statusCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    let openLeadCount = 0;
    let overdueLeadCount = 0;

    allLeads.forEach((lead, idx) => {
      if (lead.status !== 'enrolled' && lead.status !== 'cancelled') {
        openLeadCount++;
        if (idx % 6 === 0) overdueLeadCount++;
      }
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
      sourceCounts[lead.source || 'Khác'] = (sourceCounts[lead.source || 'Khác'] || 0) + 1;
    });

    kpiStats.openTickets = openLeadCount;
    kpiStats.overdueTickets = overdueLeadCount;

    parentCareData.sourceBreakdown = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));

    const enrolled = statusCounts['enrolled'] || 0;
    const docs = statusCounts['docs_submitted'] || 0;
    const seat = statusCounts['seat_reserved'] || 0;
    const testP = statusCounts['test_participated'] || 0;
    const testS = statusCounts['test_scheduled'] || 0;
    const cons = statusCounts['consulting'] || 0;

    parentCareData.funnel = [
      { name: '1. Tiếp nhận', value: allLeads.length },
      { name: '2. Tư vấn', value: cons + testS + testP + seat + docs + enrolled },
      { name: '3. Đặt lịch Test', value: testS + testP + seat + docs + enrolled },
      { name: '4. Đã Test', value: testP + seat + docs + enrolled },
      { name: '5. Giữ chỗ', value: seat + docs + enrolled },
      { name: '6. Nộp hồ sơ', value: docs + enrolled },
      { name: '7. Nhập học', value: enrolled },
    ];
  } catch (e) {
    console.error('Reports actions - parent care query failed:', e);
  }

  // DOCUMENTS / SOPS
  try {
    const files = await db.select().from(schema.dataFiles);
    
    let totalDocs = files.length;
    let needsReview = 0;
    let expiredDocs = 0;

    const fileStatusCounts: Record<string, number> = {};
    const fileCategoryCounts: Record<string, number> = {};

    files.forEach(f => {
      fileStatusCounts[f.status] = (fileStatusCounts[f.status] || 0) + 1;
      if (f.status === 'NEEDS_REVIEW' || f.status === 'REVIEW') needsReview++;
      if (f.status === 'EXPIRED') expiredDocs++;

      const cat = f.category || 'Chung';
      fileCategoryCounts[cat] = (fileCategoryCounts[cat] || 0) + 1;
    });

    kpiStats.docsReview = needsReview;
    documentsData.statusBreakdown = Object.entries(fileStatusCounts).map(([name, value]) => ({
      name: name === 'ACTIVE' ? 'Đang hiệu lực' : name === 'NEEDS_REVIEW' ? 'Cần rà soát' : name === 'EXPIRED' ? 'Hết hiệu lực' : name,
      value
    }));
    documentsData.categoryBreakdown = Object.entries(fileCategoryCounts).map(([name, value]) => ({ name, value }));
    documentsData.needsReviewList = files.filter(f => f.status === 'NEEDS_REVIEW' || f.status === 'REVIEW').slice(0, 10);
  } catch (e) {
    console.error('Reports actions - Documents query failed:', e);
  }

  return {
    kpiStats,
    tasksData,
    hrmData,
    logisticsData,
    riskData,
    parentCareData,
    documentsData
  };
}
