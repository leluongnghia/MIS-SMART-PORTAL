'use server';

import { getLessonPlans, createLessonPlan, updateLessonPlan, deleteLessonPlan, submitLessonPlan } from '@/src/libs/server/academic';
import { approveApprovalRequest, rejectApprovalRequest } from '@/src/libs/server/approval-engine';

export async function fetchLessonPlans(filters?: { status?: string; teacherId?: string }) {
  return await getLessonPlans(filters);
}

export async function addLessonPlan(data: {
  title: string;
  subjectId?: string;
  classId?: string;
  groupId?: string;
  week?: number;
  schoolYear?: string;
  term?: string;
  content?: string;
  fileUrl?: string;
}) {
  return await createLessonPlan(data);
}

export async function modifyLessonPlan(id: string, updates: Record<string, any>) {
  return await updateLessonPlan(id, updates);
}

export async function removeLessonPlan(id: string) {
  return await deleteLessonPlan(id);
}

export async function submitPlanForApproval(id: string, approverId: string, approverWorkspaceId?: string, approverRole?: string) {
  return await submitLessonPlan(id, approverId, approverWorkspaceId, approverRole);
}

export async function approvePlan(requestId: string, feedback?: string | null) {
  return await approveApprovalRequest(requestId, feedback);
}

export async function rejectPlan(requestId: string, reason: string) {
  return await rejectApprovalRequest(requestId, reason);
}
