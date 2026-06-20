import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Sparkles, Send, Check, X, Plus, Clock, FileText,
  Settings, ArrowDown, ArrowUp, Trash2, GripVertical,
  Bell, AlertTriangle, ShieldAlert, CheckCircle2, Hourglass,
  ChevronRight, Users, Zap, RefreshCw, Eye, Filter,
  ClipboardList, BarChart3, MessageSquare, Activity
} from 'lucide-react';
import { useToast } from './ui/Toast';

// ─── TYPES ─────────────────────────────────────────────────────────────────

type StepStatus = 'WAITING' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type TemplateType = 'LEAVE' | 'PURCHASE' | 'RECRUIT';
type TabType = 'TEMPLATES' | 'BUILDER' | 'LOGS';

interface ApprovalStep {
  role: string;
  user: string;
  status: StepStatus;
  timestamp?: string;
  note?: string;
  slaHours: number;
}

interface ApprovalRequest {
  id: string;
  requester: string;
  type: string;
  templateType: TemplateType;
  content: string;
  status: RequestStatus;
  submittedAt: number; // epoch ms
  steps: ApprovalStep[];
  urgency: 'normal' | 'high' | 'critical';
}

interface WorkflowNode {
  id: string;
  role: string;
  type: 'start' | 'approval' | 'notify' | 'end';
  slaHours: number;
  description: string;
}

interface WorkflowTemplate {
  id: TemplateType;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  nodes: WorkflowNode[];
}

// ─── HELPERS ───────────────────────────────────────────────────────────────

function getSlaInfo(submittedAt: number, totalSlaHours: number) {
  const now = Date.now();
  const elapsed = (now - submittedAt) / 1000 / 3600; // hours
  const remaining = totalSlaHours - elapsed;
  const pct = Math.max(0, Math.min(100, (remaining / totalSlaHours) * 100));
  const isOverdue = remaining <= 0;
  const hours = Math.abs(Math.floor(remaining));
  const mins = Math.abs(Math.floor((remaining % 1) * 60));

  return { remaining, pct, isOverdue, hours, mins };
}

function formatTimestamp(ts?: string) {
  if (!ts) return '';
  return ts;
}

function epochToDisplay(epoch: number) {
  return new Date(epoch).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ─── INITIAL DATA ──────────────────────────────────────────────────────────

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'LEAVE',
    name: 'Xin nghỉ phép',
    icon: <Clock className="w-4 h-4" />,
    description: 'Đăng ký nghỉ phép học vụ, tự động tìm giáo viên dạy thay.',
    color: 'indigo',
    nodes: [
      { id: 'n1', role: 'Nhân viên', type: 'start', slaHours: 0, description: 'Điền form xin nghỉ phép' },
      { id: 'n2', role: 'Trưởng bộ phận', type: 'approval', slaHours: 12, description: 'Duyệt sơ bộ hồ sơ' },
      { id: 'n3', role: 'Nhân sự', type: 'approval', slaHours: 12, description: 'Kiểm tra & cập nhật HR' },
      { id: 'n4', role: 'Hoàn tất', type: 'end', slaHours: 0, description: 'Hệ thống ghi nhận & thông báo' },
    ]
  },
  {
    id: 'PURCHASE',
    name: 'Đề xuất mua sắm',
    icon: <ClipboardList className="w-4 h-4" />,
    description: 'Yêu cầu kinh phí mua sắm thiết bị phòng học chuyên môn.',
    color: 'amber',
    nodes: [
      { id: 'n1', role: 'Nhân viên', type: 'start', slaHours: 0, description: 'Điền form đề xuất mua sắm' },
      { id: 'n2', role: 'Trưởng bộ phận', type: 'approval', slaHours: 24, description: 'Duyệt nhu cầu thiết bị' },
      { id: 'n3', role: 'Kế toán kiểm tra', type: 'approval', slaHours: 24, description: 'Kiểm tra ngân sách & báo giá' },
      { id: 'n4', role: 'Ban Giám hiệu', type: 'approval', slaHours: 24, description: 'Phê duyệt và ban hành quyết định' },
      { id: 'n5', role: 'Hoàn tất', type: 'end', slaHours: 0, description: 'Chuyển phòng tài vụ thực hiện' },
    ]
  },
  {
    id: 'RECRUIT',
    name: 'Đề xuất tuyển dụng',
    icon: <Users className="w-4 h-4" />,
    description: 'Đề xuất tuyển dụng nhân sự mới cho bộ phận.',
    color: 'emerald',
    nodes: [
      { id: 'n1', role: 'Trưởng bộ phận', type: 'start', slaHours: 0, description: 'Điền form đề xuất tuyển dụng' },
      { id: 'n2', role: 'Nhân sự', type: 'approval', slaHours: 48, description: 'Thẩm định JD & điều kiện tuyển' },
      { id: 'n3', role: 'Ban Giám hiệu', type: 'approval', slaHours: 48, description: 'Phê duyệt biên chế và ngân sách lương' },
      { id: 'n4', role: 'Hoàn tất', type: 'end', slaHours: 0, description: 'Mở hồ sơ tuyển dụng chính thức' },
    ]
  }
];

const INITIAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'req_1',
    requester: 'Cô Phạm Hồng Nhung',
    type: 'Xin nghỉ phép',
    templateType: 'LEAVE',
    content: 'Xin nghỉ phép học vụ tham gia đợt khám sức khỏe cá nhân (2 ngày: 12/06 - 13/06)',
    status: 'PENDING',
    submittedAt: Date.now() - 1000 * 3600 * 9, // 9 giờ trước
    urgency: 'normal',
    steps: [
      { role: 'Trưởng bộ phận', user: 'Thầy Vũ Tiến Đạt', status: 'APPROVED', slaHours: 12, timestamp: epochToDisplay(Date.now() - 1000 * 3600 * 6) },
      { role: 'Nhân sự', user: 'Cô Vũ Khánh Chi', status: 'PENDING', slaHours: 12 },
      { role: 'Hoàn tất', user: 'Hệ thống', status: 'WAITING', slaHours: 0 },
    ]
  },
  {
    id: 'req_2',
    requester: 'Thầy Trần Hoàng Nam',
    type: 'Đề xuất mua sắm',
    templateType: 'PURCHASE',
    content: 'Mua sắm thiết bị thực hành lắp ráp robot cho phòng Lab AI (Kinh phí: 18.000.000đ)',
    status: 'APPROVED',
    submittedAt: Date.now() - 1000 * 3600 * 52,
    urgency: 'high',
    steps: [
      { role: 'Trưởng bộ phận', user: 'Cô Lê Thị Thanh Nhàn', status: 'APPROVED', slaHours: 24, timestamp: epochToDisplay(Date.now() - 1000 * 3600 * 48) },
      { role: 'Kế toán kiểm tra', user: 'Thầy Phạm Thanh Bình', status: 'APPROVED', slaHours: 24, timestamp: epochToDisplay(Date.now() - 1000 * 3600 * 30) },
      { role: 'Ban Giám hiệu', user: 'Thầy Chưa Biết Chứng', status: 'APPROVED', slaHours: 24, timestamp: epochToDisplay(Date.now() - 1000 * 3600 * 8) },
      { role: 'Hoàn tất', user: 'Hệ thống', status: 'APPROVED', slaHours: 0, timestamp: epochToDisplay(Date.now() - 1000 * 3600 * 7) },
    ]
  },
  {
    id: 'req_3',
    requester: 'Thầy Lê Văn Phúc',
    type: 'Đề xuất tuyển dụng',
    templateType: 'RECRUIT',
    content: 'Đề xuất tuyển dụng 02 Giáo viên bộ môn Tin học (Lập trình AI) cho năm học 2026-2027',
    status: 'PENDING',
    submittedAt: Date.now() - 1000 * 3600 * 54, // quá SLA 48h
    urgency: 'critical',
    steps: [
      { role: 'Nhân sự', user: 'Cô Vũ Khánh Chi', status: 'ESCALATED', slaHours: 48, timestamp: epochToDisplay(Date.now() - 1000 * 3600 * 50), note: 'Quá hạn SLA - tự động chuyển lên Ban Giám hiệu' },
      { role: 'Ban Giám hiệu', user: 'Thầy Chưa Biết Chứng', status: 'PENDING', slaHours: 48 },
      { role: 'Hoàn tất', user: 'Hệ thống', status: 'WAITING', slaHours: 0 },
    ]
  }
];

// ─── SLA BADGE ─────────────────────────────────────────────────────────────

function SlaBadge({ submittedAt, totalSlaHours, compact = false }: { submittedAt: number; totalSlaHours: number; compact?: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const { pct, isOverdue, hours, mins, remaining } = getSlaInfo(submittedAt, totalSlaHours);

  const color = isOverdue
    ? 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50'
    : pct < 20
      ? 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50'
      : pct < 50
        ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50'
        : 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50';

  const barColor = isOverdue ? 'bg-rose-500' : pct < 20 ? 'bg-rose-400' : pct < 50 ? 'bg-amber-400' : 'bg-emerald-400';

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold font-mono border ${color}`}>
        <Clock className="w-2.5 h-2.5" />
        {isOverdue ? `Quá ${hours}h${mins}m` : `Còn ${hours}h${mins}m`}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold font-mono ${color}`}>
      <Clock className="w-3 h-3 shrink-0" />
      <div className="flex-1 min-w-[80px]">
        <div className="flex justify-between mb-0.5">
          <span>SLA {totalSlaHours}h</span>
          <span>{isOverdue ? `⚠ Quá ${hours}h` : `Còn ${hours}h${mins}m`}</span>
        </div>
        <div className="w-full h-1 bg-slate-200/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
            style={{ width: `${Math.max(2, pct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── STEP STATUS BADGE ─────────────────────────────────────────────────────

function StepBadge({ status }: { status: StepStatus }) {
  const map: Record<StepStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    APPROVED: { label: 'Đã duyệt', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30', icon: <CheckCircle2 className="w-3 h-3" /> },
    PENDING: { label: 'Đang chờ', cls: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 animate-pulse', icon: <Hourglass className="w-3 h-3" /> },
    REJECTED: { label: 'Từ chối', cls: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30', icon: <X className="w-3 h-3" /> },
    WAITING: { label: 'Chờ lượt', cls: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800', icon: <ChevronRight className="w-3 h-3" /> },
    ESCALATED: { label: 'Leo thang', cls: 'text-rose-700 bg-rose-100 border-rose-300 dark:bg-rose-950/50', icon: <AlertTriangle className="w-3 h-3" /> },
  };
  const { label, cls, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold border ${cls}`}>
      {icon}{label}
    </span>
  );
}

// ─── URGENCY BADGE ─────────────────────────────────────────────────────────

function UrgencyBadge({ urgency }: { urgency: 'normal' | 'high' | 'critical' }) {
  const map = {
    normal: { label: 'Bình thường', cls: 'text-slate-500 bg-slate-50 border-slate-200' },
    high: { label: 'Khẩn', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
    critical: { label: '🚨 Rất khẩn', cls: 'text-rose-700 bg-rose-50 border-rose-300' },
  };
  const { label, cls } = map[urgency];
  return <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-bold border ${cls}`}>{label}</span>;
}

// ─── WORKFLOW NODE CARD (in Builder) ───────────────────────────────────────

function BuilderNode({
  node, index, total,
  onMoveUp, onMoveDown, onDelete, onUpdate
}: {
  node: WorkflowNode;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onUpdate: (updated: WorkflowNode) => void;
}) {
  const typeConfig = {
    start: { label: 'Bắt đầu', color: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30', badge: 'bg-indigo-100 text-indigo-700', icon: <Play className="w-3.5 h-3.5" /> },
    approval: { label: 'Phê duyệt', color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30', badge: 'bg-amber-100 text-amber-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    notify: { label: 'Thông báo', color: 'bg-sky-50 border-sky-200 dark:bg-sky-950/30', badge: 'bg-sky-100 text-sky-700', icon: <Bell className="w-3.5 h-3.5" /> },
    end: { label: 'Hoàn tất', color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30', badge: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  };
  const cfg = typeConfig[node.type];
  const isEdge = node.type === 'start' || node.type === 'end';

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className={`w-full max-w-sm border rounded-2xl p-4 shadow-xs transition-all duration-200 hover:shadow-md group ${cfg.color}`}>
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div className="flex flex-col gap-0.5 pt-1 opacity-40 group-hover:opacity-70 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 space-y-2">
            {/* Top row */}
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider font-mono ${cfg.badge}`}>
                {cfg.icon} {cfg.label}
              </span>
              {!isEdge && (
                <div className="flex items-center gap-1">
                  <button onClick={onMoveUp} disabled={index <= 1} className="p-1 rounded-lg hover:bg-white/60 disabled:opacity-20 transition-all cursor-pointer" title="Lên">
                    <ArrowUp className="w-3 h-3 text-slate-500" />
                  </button>
                  <button onClick={onMoveDown} disabled={index >= total - 2} className="p-1 rounded-lg hover:bg-white/60 disabled:opacity-20 transition-all cursor-pointer" title="Xuống">
                    <ArrowDown className="w-3 h-3 text-slate-500" />
                  </button>
                  <button onClick={onDelete} className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all cursor-pointer" title="Xóa">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Role input */}
            <input
              type="text"
              value={node.role}
              onChange={e => onUpdate({ ...node, role: e.target.value })}
              disabled={isEdge}
              className="w-full text-xs font-bold text-slate-800 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-400 focus:outline-none py-0.5 transition-all disabled:cursor-default"
            />

            {/* Description */}
            <input
              type="text"
              value={node.description}
              onChange={e => onUpdate({ ...node, description: e.target.value })}
              disabled={isEdge}
              className="w-full text-[10.5px] text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-400 focus:outline-none py-0.5 transition-all disabled:cursor-default"
              placeholder="Mô tả bước này..."
            />

            {/* SLA */}
            {node.type === 'approval' && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] text-slate-500 font-mono">SLA:</span>
                <input
                  type="number"
                  min={1} max={168}
                  value={node.slaHours}
                  onChange={e => onUpdate({ ...node, slaHours: parseInt(e.target.value) || 0 })}
                  className="w-14 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <span className="text-[10px] text-slate-400">giờ</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connector arrow (except after last node) */}
      {index < total - 1 && (
        <div className="flex flex-col items-center my-1">
          <div className="w-0.5 h-4 bg-indigo-200 dark:bg-indigo-800" />
          <ArrowDown className="w-4 h-4 text-indigo-400 -mt-1" />
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function WorkflowBuilder() {
  const { success: toastSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('TEMPLATES');
  const [requests, setRequests] = useState<ApprovalRequest[]>(INITIAL_REQUESTS);

  // ── Builder state ──
  const [builderNodes, setBuilderNodes] = useState<WorkflowNode[]>(WORKFLOW_TEMPLATES[0].nodes);
  const [activeBuilderTemplate, setActiveBuilderTemplate] = useState<TemplateType>('LEAVE');
  const [builderSaved, setBuilderSaved] = useState(false);

  // ── Template / form state ──
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('LEAVE');
  const [leaveDays, setLeaveDays] = useState('1');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [purchaseItem, setPurchaseItem] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [purchaseReason, setPurchaseReason] = useState('');
  const [recruitRole, setRecruitRole] = useState('');
  const [recruitCount, setRecruitCount] = useState('1');
  const [recruitBudget, setRecruitBudget] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'critical'>('normal');
  const [formSuccess, setFormSuccess] = useState('');

  // ── Logs filter ──
  const [logsFilter, setLogsFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectTarget, setRejectTarget] = useState<{ reqId: string; stepIdx: number } | null>(null);

  // ── SLA timer ──
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceUpdate(v => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // ─── BUILDER ACTIONS ─────────────────────────────────────────────────────

  const loadTemplate = (tplId: TemplateType) => {
    const tpl = WORKFLOW_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setBuilderNodes(JSON.parse(JSON.stringify(tpl.nodes)));
      setActiveBuilderTemplate(tplId);
      setBuilderSaved(false);
    }
  };

  const addNode = (afterIndex: number) => {
    const newNode: WorkflowNode = {
      id: `n_${Date.now()}`,
      role: 'Vai trò mới',
      type: 'approval',
      slaHours: 24,
      description: 'Mô tả bước duyệt...',
    };
    const updated = [...builderNodes];
    updated.splice(afterIndex + 1, 0, newNode);
    setBuilderNodes(updated);
    setBuilderSaved(false);
  };

  const updateNode = (index: number, updated: WorkflowNode) => {
    setBuilderNodes(prev => prev.map((n, i) => i === index ? updated : n));
    setBuilderSaved(false);
  };

  const moveNode = (index: number, dir: -1 | 1) => {
    const arr = [...builderNodes];
    const target = index + dir;
    if (target < 1 || target >= arr.length - 1) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setBuilderNodes(arr);
    setBuilderSaved(false);
  };

  const deleteNode = (index: number) => {
    setBuilderNodes(prev => prev.filter((_, i) => i !== index));
    setBuilderSaved(false);
  };

  const saveWorkflow = () => {
    setBuilderSaved(true);
    setTimeout(() => setBuilderSaved(false), 3000);
  };

  // ─── FORM SUBMIT ─────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tpl = WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplate)!;
    let content = '';
    let type = tpl.name;

    if (selectedTemplate === 'LEAVE') {
      content = `Xin nghỉ phép ${leaveDays} ngày (${leaveFrom} → ${leaveTo}). Lý do: ${leaveReason}`;
    } else if (selectedTemplate === 'PURCHASE') {
      content = `Đề xuất mua: ${purchaseItem}. Kinh phí dự kiến: ${Number(purchaseCost).toLocaleString('vi-VN')}đ. Lý do: ${purchaseReason}`;
    } else {
      content = `Đề xuất tuyển dụng: ${recruitRole} (${recruitCount} người). Ngân sách lương ước tính: ${recruitBudget}`;
    }

    const newReq: ApprovalRequest = {
      id: `req_${Date.now()}`,
      requester: 'Giáo viên / Nhân viên đang đăng nhập',
      type,
      templateType: selectedTemplate,
      content,
      status: 'PENDING',
      submittedAt: Date.now(),
      urgency,
      steps: tpl.nodes.map((node, i) => ({
        role: node.role,
        user: i === 0 ? 'Người gửi' : node.role,
        status: i === 0 ? 'APPROVED' : i === 1 ? 'PENDING' : 'WAITING',
        slaHours: node.slaHours,
        timestamp: i === 0 ? epochToDisplay(Date.now()) : undefined,
      }))
    };

    setRequests(prev => [newReq, ...prev]);
    setFormSuccess('✅ Gửi đề xuất thành công! Đã chuyển lên bước duyệt tiếp theo.');
    setTimeout(() => setFormSuccess(''), 5000);

    // Reset
    setLeaveReason(''); setLeaveFrom(''); setLeaveTo('');
    setPurchaseItem(''); setPurchaseCost(''); setPurchaseReason('');
    setRecruitRole(''); setRecruitBudget('');
    setUrgency('normal');
  };

  // ─── APPROVAL ACTIONS ─────────────────────────────────────────────────────

  const handleApprove = (reqId: string, stepIdx: number) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== reqId) return req;
      const steps = req.steps.map((s, i) => {
        if (i === stepIdx) return { ...s, status: 'APPROVED' as const, timestamp: epochToDisplay(Date.now()) };
        if (i === stepIdx + 1) return { ...s, status: 'PENDING' as const };
        return s;
      });
      const allApproved = steps.every(s => s.status === 'APPROVED');
      return { ...req, steps, status: allApproved ? 'APPROVED' : req.status };
    }));
  };

  const handleReject = (reqId: string, stepIdx: number, note: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== reqId) return req;
      const steps = req.steps.map((s, i) => {
        if (i === stepIdx) return { ...s, status: 'REJECTED' as const, timestamp: epochToDisplay(Date.now()), note };
        return s;
      });
      return { ...req, steps, status: 'REJECTED' };
    }));
    setRejectTarget(null);
    setRejectNote('');
  };

  const handleReminder = (reqId: string) => {
    toastSuccess('Đã nhắc nhở', `📬 Đã gửi nhắc nhở SLA đến người duyệt cho yêu cầu ${reqId}`);
  };

  // ─── FILTERED REQUESTS ────────────────────────────────────────────────────

  const filteredRequests = requests.filter(r => {
    if (logsFilter === 'ALL') return true;
    return r.status === logsFilter;
  });

  // ─── STATS ───────────────────────────────────────────────────────────────

  const stats = {
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
    overdueSla: requests.filter(r => {
      const totalSla = r.steps.reduce((acc, s) => acc + s.slaHours, 0);
      return r.status === 'PENDING' && getSlaInfo(r.submittedAt, totalSla || 24).isOverdue;
    }).length,
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Header Banner ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 md:p-6 rounded-2xl text-white border border-slate-800/80 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-40 bg-violet-500/6 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[9.5px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1.5 w-fit">
              <Settings className="w-3.5 h-3.5" />
              MODULE 05 — Operations &amp; Workflow
            </span>
            <h2 className="text-xl md:text-2xl font-display font-black leading-tight">
              Quy trình và hệ thống phê duyệt tự động
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl font-light leading-relaxed">
              No-Code Workflow Builder · Dynamic Form · Approval Matrix · SLA Tracking · Reminder · Escalation · Audit Trail
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 shrink-0">
            {[
              { label: 'Chờ duyệt', val: stats.pending, color: 'text-amber-300', bg: 'bg-amber-500/10' },
              { label: 'Đã duyệt', val: stats.approved, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
              { label: 'Từ chối', val: stats.rejected, color: 'text-rose-300', bg: 'bg-rose-500/10' },
              { label: 'Quá SLA', val: stats.overdueSla, color: 'text-orange-300', bg: 'bg-orange-500/10' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border border-white/5 rounded-xl px-3 py-2 text-center min-w-[60px]`}>
                <div className={`text-xl font-display font-black ${s.color}`}>{s.val}</div>
                <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {([
          { key: 'TEMPLATES', label: 'Biểu Mẫu & Gửi Yêu Cầu', icon: <FileText className="w-4 h-4" /> },
          { key: 'BUILDER', label: 'No-Code Workflow Builder', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
          { key: 'LOGS', label: 'Nhật ký và phê duyệt', icon: <Activity className="w-4 h-4" /> },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: TEMPLATES & DYNAMIC FORM
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* Left — Template Selector */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono px-1">
              Chọn quy trình đề xuất
            </h3>
            {WORKFLOW_TEMPLATES.map(tpl => {
              const colorMap: Record<string, string> = {
                indigo: 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20',
                amber: 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20',
                emerald: 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20',
              };
              const isActive = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    isActive ? colorMap[tpl.color] : 'border-slate-200 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`p-1.5 rounded-lg ${isActive ? `bg-${tpl.color}-100 text-${tpl.color}-700` : 'bg-slate-100 text-slate-500'}`}>
                      {tpl.icon}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{tpl.name}</h4>
                    {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 ml-auto" />}
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed">{tpl.description}</p>

                  {/* Flow preview */}
                  <div className="mt-3 flex items-center gap-1 flex-wrap">
                    {tpl.nodes.map((node, i) => (
                      <React.Fragment key={node.id}>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          node.type === 'end' ? 'bg-emerald-100 text-emerald-700' :
                          node.type === 'start' ? 'bg-slate-100 text-slate-600' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {node.role}
                        </span>
                        {i < tpl.nodes.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-slate-300" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right — Dynamic Form */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
            {/* Form header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-sm">
                    {WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                  </h3>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Điền đầy đủ thông tin để gửi yêu cầu phê duyệt</p>
                </div>
                {/* Approval Matrix Preview */}
                <div className="hidden md:flex items-center gap-1 text-[9px] font-mono text-slate-400">
                  {WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplate)?.nodes.map((node, i, arr) => (
                    <React.Fragment key={node.id}>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${node.type === 'end' ? 'bg-emerald-50 text-emerald-600' : node.type === 'approval' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                        {node.role}
                      </span>
                      {i < arr.length - 1 && <ArrowDown className="w-2.5 h-2.5 rotate-[-90deg]" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Success message */}
            {formSuccess && (
              <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Urgency selector */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Mức độ khẩn cấp</label>
                <div className="flex gap-2">
                  {([
                    { val: 'normal', label: 'Bình thường', color: 'border-slate-200 text-slate-600 hover:border-slate-300' },
                    { val: 'high', label: '⚡ Khẩn', color: 'border-amber-200 text-amber-700 hover:border-amber-300' },
                    { val: 'critical', label: '🚨 Rất khẩn', color: 'border-rose-200 text-rose-700 hover:border-rose-300' },
                  ] as const).map(o => (
                    <button
                      key={o.val}
                      type="button"
                      onClick={() => setUrgency(o.val)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border-2 transition-all cursor-pointer ${o.color} ${urgency === o.val ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LEAVE form */}
              {selectedTemplate === 'LEAVE' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Số ngày nghỉ</label>
                      <select value={leaveDays} onChange={e => setLeaveDays(e.target.value)} className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none">
                        <option value="0.5">Nửa ngày</option>
                        <option value="1">1 ngày</option>
                        <option value="2">2 ngày</option>
                        <option value="3">3 ngày</option>
                        <option value="5">5 ngày</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Từ ngày</label>
                      <input type="date" required value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)} className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Đến ngày</label>
                      <input type="date" required value={leaveTo} onChange={e => setLeaveTo(e.target.value)} className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Lý do xin nghỉ phép <span className="text-rose-400">*</span></label>
                    <textarea required value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows={3} placeholder="Mô tả lý do nghỉ phép..." className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none font-sans" />
                  </div>
                </>
              )}

              {/* PURCHASE form */}
              {selectedTemplate === 'PURCHASE' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Thiết bị / Hàng hóa cần mua <span className="text-rose-400">*</span></label>
                      <input required type="text" value={purchaseItem} onChange={e => setPurchaseItem(e.target.value)} placeholder="Vd: 2 cái bảng tương tác thông minh" className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Kinh phí dự kiến (VNĐ) <span className="text-rose-400">*</span></label>
                      <input required type="number" min={0} value={purchaseCost} onChange={e => setPurchaseCost(e.target.value)} placeholder="Vd: 18000000" className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Lý do & mục đích sử dụng <span className="text-rose-400">*</span></label>
                    <textarea required value={purchaseReason} onChange={e => setPurchaseReason(e.target.value)} rows={3} placeholder="Mô tả mục đích mua sắm, phục vụ hoạt động nào..." className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none font-sans" />
                  </div>
                </>
              )}

              {/* RECRUIT form */}
              {selectedTemplate === 'RECRUIT' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Vị trí tuyển dụng <span className="text-rose-400">*</span></label>
                      <input required type="text" value={recruitRole} onChange={e => setRecruitRole(e.target.value)} placeholder="Vd: Giáo viên bộ môn Tin học (Lập trình AI)" className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Số lượng cần tuyển</label>
                      <select value={recruitCount} onChange={e => setRecruitCount(e.target.value)} className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} người</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Ngân sách lương ước tính / tháng</label>
                    <input type="text" value={recruitBudget} onChange={e => setRecruitBudget(e.target.value)} placeholder="Vd: 15.000.000đ – 20.000.000đ / người" className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
                  </div>
                </>
              )}

              <div className="flex justify-end pt-1">
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm">
                  <Send className="w-3.5 h-3.5" />
                  Gửi đề xuất phê duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: NO-CODE WORKFLOW BUILDER
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'BUILDER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* Left — Template selector & features */}
          <div className="lg:col-span-4 space-y-4">
            {/* Load template */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3">
                Tải Quy Trình Mẫu
              </h3>
              <div className="space-y-2">
                {WORKFLOW_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs font-semibold ${
                      activeBuilderTemplate === tpl.id
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30'
                        : 'border-slate-200 bg-white dark:bg-slate-900 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg ${activeBuilderTemplate === tpl.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      {tpl.icon}
                    </span>
                    <div>
                      <div className="font-bold">{tpl.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{tpl.nodes.length} bước</div>
                    </div>
                    {activeBuilderTemplate === tpl.id && <Check className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature badges */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3">Tính Năng Hỗ Trợ</h3>
              <div className="space-y-2">
                {[
                  { icon: <Zap className="w-3.5 h-3.5" />, label: 'Dynamic Form', desc: 'Form thay đổi theo loại yêu cầu', color: 'text-indigo-600 bg-indigo-50' },
                  { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Approval Matrix', desc: 'Ma trận phê duyệt đa cấp', color: 'text-amber-600 bg-amber-50' },
                  { icon: <Clock className="w-3.5 h-3.5" />, label: 'SLA Tracking', desc: 'Đếm ngược thời gian thực', color: 'text-sky-600 bg-sky-50' },
                  { icon: <Bell className="w-3.5 h-3.5" />, label: 'Reminder', desc: 'Nhắc nhở khi sắp hết SLA', color: 'text-violet-600 bg-violet-50' },
                  { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Escalation', desc: 'Tự động leo thang khi quá hạn', color: 'text-rose-600 bg-rose-50' },
                  { icon: <Eye className="w-3.5 h-3.5" />, label: 'Audit Trail', desc: 'Lịch sử phê duyệt đầy đủ', color: 'text-emerald-600 bg-emerald-50' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2.5">
                    <span className={`p-1.5 rounded-lg ${f.color}`}>{f.icon}</span>
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{f.label}</div>
                      <div className="text-[9.5px] text-slate-400">{f.desc}</div>
                    </div>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Builder canvas */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              {/* Canvas header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                <div>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-sm">No-Code Workflow Builder</h3>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">
                    Kéo thả · Thêm / Xóa bước · Cấu hình SLA từng node
                  </p>
                </div>
                {builderSaved && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu!
                  </span>
                )}
              </div>

              {/* Canvas area */}
              <div className="p-5">
                <div className="flex flex-col items-center space-y-0">
                  {builderNodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      <BuilderNode
                        node={node}
                        index={index}
                        total={builderNodes.length}
                        onMoveUp={() => moveNode(index, -1)}
                        onMoveDown={() => moveNode(index, 1)}
                        onDelete={() => deleteNode(index)}
                        onUpdate={updated => updateNode(index, updated)}
                      />
                      {/* Add node button between nodes (except after last) */}
                      {index < builderNodes.length - 2 && (
                        <button
                          onClick={() => addNode(index)}
                          className="flex items-center gap-1 px-3 py-1 text-[9.5px] text-indigo-500 hover:text-indigo-700 border border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-full transition-all cursor-pointer font-bold font-mono my-1"
                        >
                          <Plus className="w-2.5 h-2.5" /> Thêm bước
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Canvas footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900">
                <div className="text-[10px] text-slate-400 font-mono">
                  {builderNodes.length} bước · Tổng SLA: {builderNodes.reduce((acc, n) => acc + n.slaHours, 0)}h
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadTemplate(activeBuilderTemplate)}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> Đặt lại
                  </button>
                  <button
                    onClick={saveWorkflow}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Lưu &amp; Kích Hoạt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3: LOGS, APPROVAL MATRIX & AUDIT TRAIL
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {([
              { val: 'ALL', label: 'Tất cả', count: requests.length },
              { val: 'PENDING', label: 'Chờ duyệt', count: stats.pending },
              { val: 'APPROVED', label: 'Đã duyệt', count: stats.approved },
              { val: 'REJECTED', label: 'Từ chối', count: stats.rejected },
            ] as const).map(f => (
              <button
                key={f.val}
                onClick={() => setLogsFilter(f.val)}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer border ${
                  logsFilter === f.val
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black ${logsFilter === f.val ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Reject dialog */}
          {rejectTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 w-full max-w-md space-y-4">
                <h4 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Xác nhận từ chối
                </h4>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Lý do từ chối <span className="text-rose-400">*</span></label>
                  <textarea
                    required
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    rows={3}
                    placeholder="Nhập lý do từ chối để ghi vào audit trail..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setRejectTarget(null); setRejectNote(''); }} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Hủy</button>
                  <button
                    onClick={() => rejectNote && handleReject(rejectTarget.reqId, rejectTarget.stepIdx, rejectNote)}
                    disabled={!rejectNote}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Xác nhận từ chối
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Request cards */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">Không có yêu cầu nào</div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(req => {
                const totalSla = req.steps.reduce((acc, s) => acc + s.slaHours, 0) || 24;
                const slaInfo = getSlaInfo(req.submittedAt, totalSla);
                const activeStepIdx = req.steps.findIndex(s => s.status === 'PENDING');
                const hasEscalated = req.steps.some(s => s.status === 'ESCALATED');

                return (
                  <div key={req.id} className={`bg-white dark:bg-slate-900 border rounded-2xl shadow-xs overflow-hidden transition-all duration-200 ${
                    req.status === 'REJECTED' ? 'border-rose-200 dark:border-rose-900/50' :
                    req.status === 'APPROVED' ? 'border-emerald-200 dark:border-emerald-900/50' :
                    hasEscalated ? 'border-rose-300 dark:border-rose-800/60' :
                    'border-slate-200 dark:border-slate-800/80'
                  }`}>
                    {/* Card header */}
                    <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${
                      req.status === 'REJECTED' ? 'border-rose-100 bg-rose-50/30 dark:bg-rose-950/10 dark:border-rose-900/30' :
                      req.status === 'APPROVED' ? 'border-emerald-100 bg-emerald-50/30 dark:bg-emerald-950/10 dark:border-emerald-900/30' :
                      hasEscalated ? 'border-rose-100 bg-rose-50/20 dark:bg-rose-950/10 dark:border-rose-900/20' :
                      'border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900'
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{req.requester}</span>
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[9px] font-black rounded-md border border-indigo-100 dark:border-indigo-900/40 font-mono uppercase tracking-wide">
                          {req.type}
                        </span>
                        <UrgencyBadge urgency={req.urgency} />
                        {hasEscalated && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black rounded-md border border-rose-200 font-mono uppercase tracking-wide flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Leo thang
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">{epochToDisplay(req.submittedAt)}</span>
                        {req.status === 'PENDING' && (
                          <SlaBadge submittedAt={req.submittedAt} totalSlaHours={totalSla} compact />
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã phê duyệt
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="flex items-center gap-1 text-[10px] text-rose-600 font-bold">
                            <X className="w-3.5 h-3.5" /> Bị từ chối
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Content */}
                      <p className="text-[11.5px] text-slate-600 dark:text-slate-350 leading-relaxed">{req.content}</p>

                      {/* SLA bar (only for pending) */}
                      {req.status === 'PENDING' && (
                        <SlaBadge submittedAt={req.submittedAt} totalSlaHours={totalSla} />
                      )}

                      {/* ── APPROVAL MATRIX ─────────────────────────────── */}
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
                          Approval Matrix — Trạng thái phê duyệt
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px] border-collapse">
                            <thead>
                              <tr className="text-[9px] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <th className="text-left py-2 px-2 font-bold">Bước</th>
                                <th className="text-left py-2 px-2 font-bold">Vai trò</th>
                                <th className="text-left py-2 px-2 font-bold">Người duyệt</th>
                                <th className="text-left py-2 px-2 font-bold">SLA</th>
                                <th className="text-left py-2 px-2 font-bold">Trạng thái</th>
                                <th className="text-left py-2 px-2 font-bold">Thời gian</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                              {req.steps.map((step, idx) => (
                                <tr key={idx} className={`${step.status === 'PENDING' ? 'bg-amber-50/40 dark:bg-amber-950/10' : step.status === 'ESCALATED' ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}>
                                  <td className="py-2 px-2 font-mono font-bold text-slate-400">{idx + 1}</td>
                                  <td className="py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">{step.role}</td>
                                  <td className="py-2 px-2 text-slate-500">{step.user}</td>
                                  <td className="py-2 px-2 text-slate-400 font-mono">{step.slaHours > 0 ? `${step.slaHours}h` : '—'}</td>
                                  <td className="py-2 px-2"><StepBadge status={step.status} /></td>
                                  <td className="py-2 px-2 text-slate-400 text-[10px] font-mono">{step.timestamp || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* ── AUDIT TRAIL ─────────────────────────────────── */}
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
                          Audit Trail — Lịch sử hành động
                        </div>
                        <div className="bg-slate-50/60 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-xl p-3 space-y-0">
                          {req.steps.map((step, idx) => {
                            if (step.status === 'WAITING') return null;
                            const isLast = idx === req.steps.length - 1;
                            const statusConfig: Record<StepStatus, { icon: React.ReactNode; color: string; lineColor: string }> = {
                              APPROVED: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', lineColor: 'bg-emerald-200' },
                              PENDING: { icon: <Hourglass className="w-3.5 h-3.5 animate-spin" />, color: 'text-amber-600 bg-amber-50 border-amber-200', lineColor: 'bg-amber-200' },
                              REJECTED: { icon: <X className="w-3.5 h-3.5" />, color: 'text-rose-600 bg-rose-50 border-rose-200', lineColor: 'bg-rose-200' },
                              ESCALATED: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-rose-700 bg-rose-100 border-rose-300', lineColor: 'bg-rose-300' },
                              WAITING: { icon: <ChevronRight className="w-3.5 h-3.5" />, color: 'text-slate-400 bg-slate-50 border-slate-200', lineColor: 'bg-slate-200' },
                            };
                            const cfg = statusConfig[step.status];
                            return (
                              <div key={idx} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1 ${cfg.color}`}>
                                    {cfg.icon}
                                  </div>
                                  {!isLast && <div className={`w-0.5 flex-1 my-1 min-h-[16px] ${cfg.lineColor}`} />}
                                </div>
                                <div className="pb-3 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{step.role}</span>
                                    <span className="text-[10px] text-slate-500">– {step.user}</span>
                                    {step.timestamp && (
                                      <span className="text-[10px] text-slate-400 font-mono ml-auto">{step.timestamp}</span>
                                    )}
                                  </div>
                                  {step.note && (
                                    <div className="mt-1 text-[10.5px] text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5">
                                      <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                                      {step.note}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── ACTION BUTTONS ─────────────────────────────── */}
                      {req.status === 'PENDING' && activeStepIdx >= 0 && (
                        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {/* Reminder button */}
                            <button
                              onClick={() => handleReminder(req.id)}
                              className="px-3 py-1.5 border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              Gửi nhắc nhở
                            </button>
                            {slaInfo.isOverdue && (
                              <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Đã quá hạn SLA – cần leo thang
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setRejectTarget({ reqId: req.id, stepIdx: activeStepIdx })}
                              className="px-3.5 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-700 dark:hover:bg-rose-950/20 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <X className="w-3.5 h-3.5" />
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleApprove(req.id, activeStepIdx)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Phê duyệt bước này
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
