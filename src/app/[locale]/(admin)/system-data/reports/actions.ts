'use server';

import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor, canManageReports, canViewReport } from '@/src/libs/server/auth-helper';
import { count, eq, and, desc, sql } from 'drizzle-orm';

export async function getDashboardStats() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  // Basic check for dashboard stats
  // We can scope this based on actor's role
  const isManager = actor.role === 'MANAGER';
  const isAdmin = actor.role === 'ADMIN';

  // If not admin and not manager, return basic info or empty
  if (!isAdmin && !isManager) {
    return {
      totalTasks: 0,
      totalStudents: 0,
      totalLeads: 0,
      recentLogs: []
    };
  }

  const deptFilter = isManager && actor.departmentId ? eq(schema.tasks.workspaceId, actor.departmentId) : undefined;
  
  // Total Tasks
  const tasksCount = await db.select({ count: count() })
    .from(schema.tasks)
    .where(deptFilter);

  // Total Students
  const studentsCount = await db.select({ count: count() })
    .from(schema.students);

  // Pending Leads (received or consulting)
  const leadsCount = await db.select({ count: count() })
    .from(schema.leads)
    .where(sql`${schema.leads.status} IN ('received', 'consulting')`);

  // Recent Audit logs (Admin only)
  let recentLogs: any[] = [];
  if (isAdmin) {
    try {
      recentLogs = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(10);
    } catch (err) {
      console.error("Failed to query audit logs:", err);
    }
  }

  // Tasks status distribution
  const tasksByStatus = await db.select({
    status: schema.tasks.status,
    count: count()
  }).from(schema.tasks)
    .groupBy(schema.tasks.status);

  // Leads status distribution
  const leadsByStatus = await db.select({
    status: schema.leads.status,
    count: count()
  }).from(schema.leads)
    .groupBy(schema.leads.status);

  // Students by Class Name
  const studentsByClass = await db.select({
    className: schema.studentDirectory.className,
    count: count()
  }).from(schema.studentDirectory)
    .groupBy(schema.studentDirectory.className);

  return {
    totalTasks: tasksCount[0]?.count || 0,
    totalStudents: studentsCount[0]?.count || 0,
    totalLeads: leadsCount[0]?.count || 0,
    tasksByStatus,
    leadsByStatus,
    studentsByClass,
    recentLogs
  };
}
