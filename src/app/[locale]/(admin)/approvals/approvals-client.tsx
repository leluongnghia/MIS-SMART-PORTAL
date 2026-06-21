'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Dialog } from '@/src/components/ui/dialog';
import { AlertCircle, CheckCircle2, Clock, GitPullRequest, RotateCcw, XCircle } from 'lucide-react';
import type { Actor } from '@/src/libs/server/auth-helper';
import { approveEngineRequest, approveLeaveRequest, cancelEngineRequest, rejectEngineRequest, rejectLeaveRequest, requestEngineRevision } from './actions';

type LeaveRequest = { id: string; type: string; startDate: Date; endDate: Date; reason: string; status: string; approvedById: string | null; substituteTeacherId: string | null; payload: any; createdAt: Date; updatedAt: Date; employeeProfileId: string; };
type EngineRequest = { id: string; module: string; entityType: string; entityId: string; title: string; description?: string | null; status: string; requesterId?: string | null; requesterName?: string | null; approverRole?: string | null; approverWorkspaceId?: string | null; targetUrl?: string | null; payload: any; createdAt: Date; updatedAt: Date; };
type InitialData = { data?: LeaveRequest[]; approvalRequests?: EngineRequest[]; actor?: Actor | null };

const statusLabels: Record<string, string> = { DRAFT: 'Nháp', PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', NEEDS_REVISION: 'Cần bổ sung', CANCELLED: 'Đã hủy' };

export default function ApprovalsPage({ initialData }: { initialData?: InitialData }) {
  const leaveRequests = initialData?.data || [];
  const engineRequests = initialData?.approvalRequests || [];
  const actor = initialData?.actor || null;
  const [view, setView] = useState<'engine' | 'leave'>('engine');
  const [engineStatus, setEngineStatus] = useState('ALL');
  const [leaveTab, setLeaveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedEngine, setSelectedEngine] = useState<EngineRequest | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const visibleEngine = engineRequests.filter(r => engineStatus === 'ALL' || r.status === engineStatus);
  const visibleLeave = leaveRequests.filter(r => leaveTab === 'all' || r.status === leaveTab);
  const canApprove = actor && (actor.role === 'ADMIN' || actor.role === 'MANAGER' || actor.workspaceId === 'BGH');

  const runEngineAction = (action: 'approve' | 'reject' | 'revision' | 'cancel') => {
    if (!selectedEngine) return;
    startTransition(async () => {
      const fn = action === 'approve' ? approveEngineRequest : action === 'reject' ? rejectEngineRequest : action === 'revision' ? requestEngineRevision : cancelEngineRequest;
      const res = await fn(selectedEngine.id, comment);
      if (!res.success) alert('Lỗi: ' + res.error);
      else { setSelectedEngine(null); setComment(''); }
    });
  };

  const runLeaveAction = (action: 'approve' | 'reject') => {
    if (!selectedLeave) return;
    startTransition(async () => {
      const res = action === 'approve' ? await approveLeaveRequest(selectedLeave.id) : await rejectLeaveRequest(selectedLeave.id);
      if (!res.success) alert('Lỗi: ' + res.error);
      else setSelectedLeave(null);
    });
  };

  return <div className="space-y-6">
    <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-amber-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3 border-0 bg-amber-100 text-amber-800">Approval Engine</Badge>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Trung tâm phê duyệt toàn hệ thống</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">Chuẩn hóa luồng gửi duyệt, duyệt, từ chối, yêu cầu bổ sung, hủy yêu cầu, notification và audit log cho Tasks, Admissions, Students, Facilities, Storage, Settings.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="Chờ duyệt" value={engineRequests.filter(r => r.status === 'PENDING').length} tone="amber" />
          <Metric label="Đã duyệt" value={engineRequests.filter(r => r.status === 'APPROVED').length} tone="emerald" />
          <Metric label="Cần bổ sung" value={engineRequests.filter(r => r.status === 'NEEDS_REVISION').length} tone="sky" />
        </div>
      </div>
    </div>

    <div className="flex gap-2 rounded-2xl border bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Tab active={view === 'engine'} onClick={() => setView('engine')}>Approval Engine ({engineRequests.length})</Tab>
      <Tab active={view === 'leave'} onClick={() => setView('leave')}>Nghỉ phép cũ ({leaveRequests.length})</Tab>
    </div>

    {view === 'engine' ? <>
      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'CANCELLED'].map(s => <Button key={s} size="sm" variant={engineStatus === s ? 'default' : 'outline'} onClick={() => setEngineStatus(s)} className="text-xs">{s === 'ALL' ? 'Tất cả' : statusLabels[s]}</Button>)}
      </div>
      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50"><tr><th className="px-5 py-3">Yêu cầu</th><th className="px-5 py-3">Module</th><th className="px-5 py-3">Người gửi</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
          <tbody className="divide-y dark:divide-slate-800">
            {visibleEngine.map(req => <tr key={req.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-900"><td className="px-5 py-4"><div className="flex gap-3"><span className="rounded-xl bg-amber-100 p-2 text-amber-700"><GitPullRequest className="h-4 w-4" /></span><div><p className="font-bold text-slate-900 dark:text-white">{req.title}</p><p className="text-xs text-slate-500">{req.entityType} · {req.entityId}</p><p className="text-xs text-slate-500">{req.description}</p></div></div></td><td className="px-5 py-4"><Badge className="border-0 bg-slate-100 text-slate-700">{req.module}</Badge></td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{req.requesterName || req.requesterId || '-'}</td><td className="px-5 py-4">{statusBadge(req.status)}</td><td className="px-5 py-4 text-right"><Button size="sm" onClick={() => setSelectedEngine(req)}>Xem xử lý</Button></td></tr>)}
            {visibleEngine.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Chưa có yêu cầu Approval Engine.</td></tr>}
          </tbody>
        </table>
      </Card>
    </> : <LegacyLeave requests={visibleLeave} active={leaveTab} setActive={setLeaveTab} select={setSelectedLeave} />}

    <Dialog open={!!selectedEngine} onOpenChange={(open) => !open && setSelectedEngine(null)} title="Chi tiết Approval Engine">
      {selectedEngine && <div className="space-y-4 pt-2 text-sm">
        <div className="rounded-2xl border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500">#{selectedEngine.id}</p><h3 className="font-bold">{selectedEngine.title}</h3><p className="text-slate-600 dark:text-slate-300">{selectedEngine.description || 'Không có mô tả'}</p></div>
        <div className="grid grid-cols-2 gap-3 text-xs"><Info k="Module" v={selectedEngine.module} /><Info k="Entity" v={`${selectedEngine.entityType} · ${selectedEngine.entityId}`} /><Info k="Người gửi" v={selectedEngine.requesterName || '-'} /><Info k="Trạng thái" v={statusLabels[selectedEngine.status] || selectedEngine.status} /></div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ghi chú xử lý (bắt buộc khi từ chối/yêu cầu bổ sung)" className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-amber-400 dark:border-slate-800 dark:bg-slate-950" />
        {selectedEngine.status === 'PENDING' || selectedEngine.status === 'NEEDS_REVISION' ? <div className="grid grid-cols-2 gap-2 border-t pt-4 dark:border-slate-800">
          <Button disabled={isPending || !canApprove} onClick={() => runEngineAction('approve')} className="bg-emerald-600 text-white hover:bg-emerald-700">
            {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
            Duyệt
          </Button>
          <Button disabled={isPending || !canApprove} onClick={() => runEngineAction('reject')} variant="outline" className="border-rose-200 text-rose-600">
            {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-rose-600/20 border-t-rose-600" /> : <XCircle className="mr-1 h-4 w-4" />}
            Từ chối
          </Button>
          <Button disabled={isPending || !canApprove} onClick={() => runEngineAction('revision')} variant="outline" className="border-sky-200 text-sky-700">
            {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-sky-700/20 border-t-sky-700" /> : <RotateCcw className="mr-1 h-4 w-4" />}
            Yêu cầu bổ sung
          </Button>
          <Button disabled={isPending} onClick={() => runEngineAction('cancel')} variant="outline">
            {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-600/20 border-t-slate-600" /> : <AlertCircle className="mr-1 h-4 w-4" />}
            Hủy yêu cầu
          </Button>
        </div> : <Button onClick={() => setSelectedEngine(null)}>Đóng</Button>}
      </div>}
    </Dialog>

    <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)} title="Chi tiết đơn nghỉ phép">
      {selectedLeave && <div className="space-y-4 text-sm"><h3 className="font-bold">{selectedLeave.payload?.employeeName || selectedLeave.id}</h3><p>{selectedLeave.reason}</p>{statusBadge(selectedLeave.status)}{selectedLeave.status === 'pending' && canApprove ? <div className="flex gap-2 border-t pt-4">
        <Button disabled={isPending} onClick={() => runLeaveAction('approve')} className="flex-1 bg-emerald-600 text-white">
          {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : null}
          Phê duyệt
        </Button>
        <Button disabled={isPending} onClick={() => runLeaveAction('reject')} variant="outline" className="flex-1 text-rose-600">
          {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-rose-600/20 border-t-rose-600" /> : null}
          Từ chối
        </Button>
      </div> : <Button onClick={() => setSelectedLeave(null)}>Đóng</Button>}</div>}
    </Dialog>
  </div>;
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className={`rounded-2xl border bg-white/80 px-4 py-3 shadow-sm dark:bg-slate-900`}><p className={`text-2xl font-black text-${tone}-600`}>{value}</p><p className="text-[11px] font-bold text-slate-500">{label}</p></div>; }
function Tab({ active, onClick, children }: any) { return <button onClick={onClick} className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition ${active ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}`}>{children}</button>; }
function Info({ k, v }: { k: string; v: string }) { return <div className="rounded-xl border p-3 dark:border-slate-800"><p className="text-slate-500">{k}</p><p className="font-bold">{v}</p></div>; }
function statusBadge(status: string) { const s = status.toUpperCase(); const cls = s === 'APPROVED' || status === 'approved' ? 'bg-emerald-100 text-emerald-700' : s === 'REJECTED' || status === 'rejected' ? 'bg-rose-100 text-rose-700' : s === 'NEEDS_REVISION' ? 'bg-sky-100 text-sky-700' : s === 'CANCELLED' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'; return <Badge className={`${cls} border-0`}><Clock className="mr-1 h-3 w-3" />{statusLabels[s] || (status === 'pending' ? 'Chờ duyệt' : status)}</Badge>; }
function LegacyLeave({ requests, active, setActive, select }: any) { return <><div className="flex gap-2">{['all','pending','approved','rejected'].map(s => <Button key={s} size="sm" variant={active === s ? 'default' : 'outline'} onClick={() => setActive(s)}>{s}</Button>)}</div><Card className="overflow-hidden"><table className="w-full text-left text-sm"><tbody>{requests.map((r: LeaveRequest) => <tr key={r.id} className="border-b"><td className="px-5 py-4"><p className="font-bold">{r.payload?.employeeName || r.id}</p><p className="text-xs text-slate-500">{r.type}</p></td><td className="px-5 py-4">{r.reason}</td><td className="px-5 py-4">{statusBadge(r.status)}</td><td className="px-5 py-4 text-right"><Button size="sm" onClick={() => select(r)}>Xem</Button></td></tr>)}</tbody></table></Card></>; }
