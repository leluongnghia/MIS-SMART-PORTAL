export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'OVERDUE';
export type LessonPlanStatus = 'MISSING' | 'SUBMITTED' | 'PENDING_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED';
export type LeaveRequestStatus = 'PENDING_DEPT' | 'PENDING_HR' | 'APPROVED' | 'REJECTED';
export type DirectiveStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESPONDED' | 'COMPLETED';

export interface DeptTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  comments: number;
  attachments: number;
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  grade: string;
  week: number;
  status: LessonPlanStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  fileUrl?: string;
}

export interface LeaveRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  handoverTo: string;
  status: LeaveRequestStatus;
  createdAt: string;
}

export interface DeptMember {
  id: string;
  name: string;
  role: 'Trưởng bộ phận' | 'Tổ phó' | 'Thành viên';
  subjects: string[];
  status: 'ONLINE' | 'OFFLINE' | 'ON_LEAVE';
  activeTasks: number;
  completionRate: number;
  avatar?: string;
}

export interface Directive {
  id: string;
  title: string;
  content: string;
  from: string; // Tên BGH
  status: DirectiveStatus;
  dueDate: string;
  createdAt: string;
  assignee?: string;
  assigneeName?: string;
  response?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  createdAt: string;
  readBy: string[];
}

export const MOCK_DEPT_TASKS: DeptTask[] = [
  {
    id: 't1',
    title: 'Soạn ma trận đề kiểm tra Giữa kì 1',
    description: 'Yêu cầu các giáo viên hoàn thành ma trận đề thi các khối 10, 11, 12.',
    assignee: 'u2',
    assigneeName: 'Trần Thị B',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: '2026-10-15',
    createdAt: '2026-10-01',
    comments: 2,
    attachments: 1
  },
  {
    id: 't2',
    title: 'Nộp báo cáo chuyên đề',
    description: 'Báo cáo chuyên đề Đổi mới phương pháp dạy học STEM.',
    assignee: 'u3',
    assigneeName: 'Lê Văn C',
    priority: 'NORMAL',
    status: 'PENDING_REVIEW',
    dueDate: '2026-10-10',
    createdAt: '2026-09-25',
    comments: 0,
    attachments: 2
  },
  {
    id: 't3',
    title: 'Họp phụ huynh đầu năm',
    description: 'Chuẩn bị nội dung họp phụ huynh cho các lớp chủ nhiệm.',
    assignee: 'u4',
    assigneeName: 'Phạm Thị D',
    priority: 'URGENT',
    status: 'OVERDUE',
    dueDate: '2026-09-20',
    createdAt: '2026-09-15',
    comments: 5,
    attachments: 0
  }
];

export const MOCK_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'lp1',
    teacherId: 'u2',
    teacherName: 'Trần Thị B',
    subject: 'Toán 10',
    grade: 'Khối 10',
    week: 5,
    status: 'PENDING_REVIEW',
    submittedAt: '2026-10-02T08:00:00Z',
    fileUrl: '#'
  },
  {
    id: 'lp2',
    teacherId: 'u3',
    teacherName: 'Lê Văn C',
    subject: 'Tin học 11',
    grade: 'Khối 11',
    week: 5,
    status: 'REVISION_REQUESTED',
    submittedAt: '2026-10-01T14:30:00Z',
    reviewedAt: '2026-10-02T09:15:00Z',
    reviewerNotes: 'Cần bổ sung phần thực hành Python.',
    fileUrl: '#'
  },
  {
    id: 'lp3',
    teacherId: 'u4',
    teacherName: 'Phạm Thị D',
    subject: 'Toán 12',
    grade: 'Khối 12',
    week: 5,
    status: 'APPROVED',
    submittedAt: '2026-09-30T10:00:00Z',
    reviewedAt: '2026-10-01T16:00:00Z',
    fileUrl: '#'
  }
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr1',
    requesterId: 'u3',
    requesterName: 'Lê Văn C',
    type: 'Nghỉ ốm',
    startDate: '2026-10-05',
    endDate: '2026-10-06',
    reason: 'Sốt siêu vi',
    handoverTo: 'Trần Thị B',
    status: 'PENDING_DEPT',
    createdAt: '2026-10-03T07:00:00Z'
  }
];

export const MOCK_DEPT_MEMBERS: DeptMember[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn A',
    role: 'Trưởng bộ phận',
    subjects: ['Toán 12'],
    status: 'ONLINE',
    activeTasks: 3,
    completionRate: 95
  },
  {
    id: 'u2',
    name: 'Trần Thị B',
    role: 'Tổ phó',
    subjects: ['Toán 10', 'Toán 11'],
    status: 'ONLINE',
    activeTasks: 5,
    completionRate: 88
  },
  {
    id: 'u3',
    name: 'Lê Văn C',
    role: 'Thành viên',
    subjects: ['Tin học 10', 'Tin học 11'],
    status: 'OFFLINE',
    activeTasks: 2,
    completionRate: 100
  },
  {
    id: 'u4',
    name: 'Phạm Thị D',
    role: 'Thành viên',
    subjects: ['Toán 11', 'Toán 12'],
    status: 'ON_LEAVE',
    activeTasks: 0,
    completionRate: 92
  }
];

export const MOCK_DIRECTIVES: Directive[] = [
  {
    id: 'd1',
    title: 'Triển khai chuyên đề cấp cụm',
    content: 'Yêu cầu tổ Toán - Tin chuẩn bị 1 chuyên đề báo cáo cấp cụm vào cuối tháng 11.',
    from: 'Nguyễn Hiệu Trưởng',
    status: 'NEW',
    dueDate: '2026-11-20',
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'd2',
    title: 'Rà soát ngân hàng đề',
    content: 'Các tổ chuyên môn rà soát, bổ sung ngân hàng đề thi trắc nghiệm học kỳ 1.',
    from: 'Trần Phó Hiệu Trưởng',
    status: 'IN_PROGRESS',
    assignee: 'u2',
    assigneeName: 'Trần Thị B',
    dueDate: '2026-10-30',
    createdAt: '2026-09-20T08:00:00Z'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Họp tổ chuyên môn tuần 6',
    content: 'Toàn thể giáo viên tổ Toán - Tin họp định kỳ vào 14h00 thứ 5 tuần này tại phòng hội đồng.',
    author: 'Nguyễn Văn A',
    priority: 'IMPORTANT',
    createdAt: '2026-10-02T09:00:00Z',
    readBy: ['u2', 'u3']
  }
];
