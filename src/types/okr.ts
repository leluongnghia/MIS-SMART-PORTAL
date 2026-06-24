export type Priority = "Low" | "Medium" | "High" | "Critical";
export type OkrStatus = "NotStarted" | "InProgress" | "OnTrack" | "AtRisk" | "Delayed" | "NeedCouncilIntervention" | "Completed" | "Paused" | "Cancelled";
export type ConfidenceLevel = "Low" | "Medium" | "High";
export type UpdateFrequency = "Weekly" | "Monthly" | "Quarterly";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface OkrGroup {
  id: string;
  code: string;
  name: string;
  color: string;
  icon: string;
  totalOkrs: number;
  onTrack: number;
  delayed: number;
  atRisk: number;
  avgProgress: number;
}

export interface KeyResult {
  id: string;
  okrId: string;
  title: string;
  metricName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPercent: number;
  ownerName: string;
  deadline: string;
  status: OkrStatus;
  confidenceLevel: ConfidenceLevel;
  updateFrequency: UpdateFrequency;
  evidenceNote: string;
  lastUpdatedAt: string;
}

export interface OkrTask {
  id: string;
  okrId: string;
  title: string;
  ownerName: string;
  deadline: string;
  status: "Pending" | "InProgress" | "Done";
  priority: Priority;
}

export interface AuditLog {
  id: string;
  okrId: string;
  actorName: string;
  role: string;
  timestamp: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  note?: string;
}

export interface StrategicOkr {
  id: string;
  code: string;
  title: string;
  description: string;
  schoolYear: string;
  categoryId: string; // references OkrGroup.id
  ownerName: string;
  ownerRole: string;
  department: string;
  collaborators: string[];
  startDate: string;
  endDate: string;
  priority: Priority;
  status: OkrStatus;
  progressPercent: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  riskLevel: RiskLevel;
  lastUpdatedAt: string;
  nextReviewDate: string;
  notes: string;
  keyResults: KeyResult[];
  actionItems: OkrTask[];
  auditLogs: AuditLog[];
}
