export type UserRole =
  | 'ADMIN'
  | 'CHAIRMAN'
  | 'BGH'
  | 'MANAGER'
  | 'TEACHER'
  | 'STAFF'
  | 'ADMISSIONS'
  | 'HRM'
  | 'FACILITIES'
  | 'SCHOOL_SERVICE_STAFF'
  | 'SCHOOL_SERVICE_OPERATIONS_MANAGER';

export type UserStatus =
  | 'ACTIVE'
  | 'PENDING_INVITE'
  | 'PENDING_ACTIVATION'
  | 'LOCKED'
  | 'SUSPENDED'
  | 'DELETED';

export type DataScope =
  | 'SYSTEM'
  | 'SCHOOL'
  | 'DEPARTMENT'
  | 'TEAM'
  | 'CLASS'
  | 'OWN';

export interface User {
  id: string;
  clerkUserId: string | null;
  name: string;
  role: string;
  roleName: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  departmentId: string | null;
  status: string;
  dataScope: string;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
  employeeCode: string | null;
  staffType: string | null;
  joinedAt: Date | null;
  managerId: string | null;
  teachingLevel: string | null;
  subject: string | null;
  homeroomClassId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  payload: any;
}

interface UserInvitation {
  id: string;
  email: string;
  role: string;
  departmentId: string | null;
  dataScope: string;
  invitedById: string | null;
  invitedByName: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELED';
  tokenHash: string | null;
  expiresAt: Date | null;
  acceptedAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserLoginHistory {
  id: string;
  userId: string;
  loginAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  success: boolean;
  failureReason: string | null;
}

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string | null;
  metadata: any;
  createdAt: Date;
}
