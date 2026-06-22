'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Dialog } from '@/src/components/ui/dialog';
import { AlertCircle, CheckCircle2, Clock, GitPullRequest, RotateCcw, XCircle, Plus } from 'lucide-react';
import type { Actor } from '@/src/libs/server/auth-helper';
import { approveEngineRequest, cancelEngineRequest, rejectEngineRequest, requestEngineRevision, createNewRequest } from './actions';

type EngineRequest = { id: string; module: string; entityType: string; entityId: string; title: string; description?: string | null; status: string; requesterId?: string | null; requesterName?: string | null; approverRole?: string | null; approverWorkspaceId?: string | null; targetUrl?: string | null; payload: any; createdAt: Date; updatedAt: Date; };
type InitialData = { approvalRequests?: EngineRequest[]; actor?: Actor | null };

const statusLabels: Record<string, string> = { DRAFT: 'Nháp', PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', NEEDS_REVISION: 'Cần bổ sung', CANCELLED: 'Đã hủy' };

const typeLabels: Record<string, string> = {
  LEAVE_REQUEST: 'Nghỉ phép',
  RESIGNATION: 'Nghỉ việc',
  TRAINING: 'Đào tạo',
  PURCHASE: 'Mua sắm',
  MAINTENANCE: 'Sửa chữa',
  ASSET_TRANSFER: 'Điều chuyển tài sản',
  CAPA: 'Hành động khắc phục'
};

export default function ApprovalsPage({ initialData }: { initialData?: InitialData }) {
  const engineRequests = initialData?.approvalRequests || [];
  const actor = initialData?.actor || null;
  const [engineStatus, setEngineStatus] = useState('ALL');
  const [engineType, setEngineType] = useState('ALL');
  const [selectedEngine, setSelectedEngine] = useState<EngineRequest | null>(null);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const [showCreate, setShowCreate] = useState(false);
  const [newRequestType, setNewRequestType] = useState('LEAVE_REQUEST');
  const [newRequestData, setNewRequestData] = useState<any>({});

  const visibleEngine = engineRequests.filter(r => 
    (engineStatus === 'ALL' || r.status === engineStatus) &&
    (engineType === 'ALL' || r.entityType === engineType)
  );
  
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

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createNewRequest({
        entityType: newRequestType,
        title: `Đề xuất ${typeLabels[newRequestType] || newRequestType}`,
        description: newRequestData.reason || newRequestData.description || 'Yêu cầu mới',
        payload: newRequestData
      });
      if (!res.success) alert('Lỗi: ' + res.error);
      else { setShowCreate(false); setNewRequestData({}); }
    });
  };

  const renderPayload = (payload: any) => {
    if (!payload) return null;
    return (
      <div className="grid grid-cols-2 gap-2 mt-4 border-t pt-4 dark:border-slate-800">
        {Object.entries(payload).map(([k, v]) => (
          <div key={k} className="col-span-2 sm:col-span-1 rounded bg-white dark:bg-slate-950 p-2 text-xs border dark:border-slate-800">
            <span className="text-slate-500 block mb-1">{k}</span>
            <span className="font-medium">{String(v)}</span>
          </div>
        ))}
      </div>
    );
  };

  return <div className="space-y-6">
    <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-amber-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3 border-0 bg-amber-100 text-amber-800">Workflow & Approvals</Badge>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Trung tâm phê duyệt</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">Quản lý 7 quy trình: Nghỉ phép, Nghỉ việc, Đào tạo, Mua sắm, Sửa chữa, Điều chuyển TS, CAPA.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl h-12 px-6">
            <Plus className="mr-2 w-5 h-5" />
            Tạo đơn mới
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Metric label="Chờ duyệt" value={engineRequests.filter(r => r.status === 'PENDING').length} tone="amber" />
        <Metric label="Đã duyệt" value={engineRequests.filter(r => r.status === 'APPROVED').length} tone="emerald" />
        <Metric label="Cần bổ sung" value={engineRequests.filter(r => r.status === 'NEEDS_REVISION').length} tone="sky" />
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'CANCELLED'].map(s => <Button key={s} size="sm" variant={engineStatus === s ? 'default' : 'outline'} onClick={() => setEngineStatus(s)} className="text-xs">{s === 'ALL' ? 'Tất cả trạng thái' : statusLabels[s]}</Button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <select className="text-sm rounded-lg border p-2" value={engineType} onChange={e => setEngineType(e.target.value)}>
          <option value="ALL">Tất cả quy trình</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
    </div>

    <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50"><tr><th className="px-5 py-3">Yêu cầu</th><th className="px-5 py-3">Phân loại</th><th className="px-5 py-3">Người gửi</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
        <tbody className="divide-y dark:divide-slate-800">
          {visibleEngine.map(req => <tr key={req.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-900"><td className="px-5 py-4"><div className="flex gap-3"><span className="rounded-xl bg-amber-100 p-2 text-amber-700"><GitPullRequest className="h-4 w-4" /></span><div><p className="font-bold text-slate-900 dark:text-white">{req.title}</p><p className="text-xs text-slate-500">{req.description}</p></div></div></td><td className="px-5 py-4"><Badge className="border-0 bg-slate-100 text-slate-700">{typeLabels[req.entityType] || req.entityType}</Badge></td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{req.requesterName || req.requesterId || '-'}</td><td className="px-5 py-4">{statusBadge(req.status)}</td><td className="px-5 py-4 text-right"><Button size="sm" onClick={() => setSelectedEngine(req)}>Xem xử lý</Button></td></tr>)}
          {visibleEngine.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Chưa có yêu cầu nào.</td></tr>}
        </tbody>
      </table>
    </Card>

    <Dialog open={!!selectedEngine} onOpenChange={(open) => !open && setSelectedEngine(null)} title="Chi tiết Đơn từ">
      {selectedEngine && <div className="space-y-4 pt-2 text-sm">
        <div className="rounded-2xl border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500">#{selectedEngine.id}</p>
              <h3 className="font-bold text-lg">{selectedEngine.title}</h3>
            </div>
            {statusBadge(selectedEngine.status)}
          </div>
          <p className="text-slate-600 dark:text-slate-300 mt-2">{selectedEngine.description || 'Không có mô tả'}</p>
          {renderPayload(selectedEngine.payload)}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs"><Info k="Loại quy trình" v={typeLabels[selectedEngine.entityType] || selectedEngine.entityType} /><Info k="Người gửi" v={selectedEngine.requesterName || '-'} /></div>
        
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
        </div> : <Button onClick={() => setSelectedEngine(null)} className="w-full mt-2">Đóng</Button>}
      </div>}
    </Dialog>

    <Dialog open={showCreate} onOpenChange={setShowCreate} title="Tạo Đơn từ mới">
      <div className="space-y-4 pt-4 text-sm">
        <div>
          <label className="font-bold text-xs text-slate-500 mb-1 block">Loại đơn từ</label>
          <select 
            className="w-full p-3 rounded-xl border outline-none focus:border-sky-500"
            value={newRequestType}
            onChange={e => setNewRequestType(e.target.value)}
          >
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        
        {newRequestType === 'LEAVE_REQUEST' && (
          <div className="space-y-3">
            <input type="date" placeholder="Từ ngày" className="w-full p-3 border rounded-xl" onChange={e => setNewRequestData({...newRequestData, startDate: e.target.value})} />
            <input type="date" placeholder="Đến ngày" className="w-full p-3 border rounded-xl" onChange={e => setNewRequestData({...newRequestData, endDate: e.target.value})} />
            <textarea placeholder="Lý do" className="w-full p-3 border rounded-xl" onChange={e => setNewRequestData({...newRequestData, reason: e.target.value})} />
            <input type="text" placeholder="Người dạy thay" className="w-full p-3 border rounded-xl" onChange={e => setNewRequestData({...newRequestData, substituteTeacher: e.target.value})} />
          </div>
        )}
        
        {newRequestType === 'PURCHASE' && (
          <div className="space-y-3">
            <input type="text" placeholder="Chi tiết mặt hàng" className="w-full p-3 border rounded-xl" onChange={e => setNewRequestData({...newRequestData, items: e.target.value})} />
            <input type="text" placeholder="Chi phí dự kiến" className="w-full p-3 border rounded-xl" onChange={e => setNewRequestData({...newRequestData, estimatedCost: e.target.value})} />
            <select className="w-full p-3 border rounded-xl" onChange={e => setNewRequestData({...newRequestData, priority: e.target.value})}>
              <option value="">Chọn độ ưu tiên</option>
              <option value="Thấp">Thấp</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Cao">Cao</option>
            </select>
          </div>
        )}
        
        {(newRequestType !== 'LEAVE_REQUEST' && newRequestType !== 'PURCHASE') && (
          <div className="space-y-3">
            <textarea placeholder="Nhập mô tả/Lý do" className="w-full p-3 border rounded-xl min-h-[100px]" onChange={e => setNewRequestData({...newRequestData, description: e.target.value})} />
          </div>
        )}

        <div className="pt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Hủy</Button>
          <Button disabled={isPending} className="flex-1 bg-sky-600 text-white" onClick={handleCreate}>
            {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : null}
            Gửi yêu cầu
          </Button>
        </div>
      </div>
    </Dialog>
  </div>;
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className={`rounded-2xl border bg-white/80 px-4 py-3 shadow-sm dark:bg-slate-900`}><p className={`text-2xl font-black text-${tone}-600`}>{value}</p><p className="text-[11px] font-bold text-slate-500">{label}</p></div>; }
function Info({ k, v }: { k: string; v: string }) { return <div className="rounded-xl border p-3 dark:border-slate-800"><p className="text-slate-500">{k}</p><p className="font-bold">{v}</p></div>; }
function statusBadge(status: string) { const s = status.toUpperCase(); const cls = s === 'APPROVED' || status === 'approved' ? 'bg-emerald-100 text-emerald-700' : s === 'REJECTED' || status === 'rejected' ? 'bg-rose-100 text-rose-700' : s === 'NEEDS_REVISION' ? 'bg-sky-100 text-sky-700' : s === 'CANCELLED' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'; return <Badge className={`${cls} border-0`}><Clock className="mr-1 h-3 w-3" />{statusLabels[s] || (status === 'pending' ? 'Chờ duyệt' : status)}</Badge>; }
