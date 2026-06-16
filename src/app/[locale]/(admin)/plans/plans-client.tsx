'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Dialog } from '@/src/components/ui/dialog';
import { ClipboardCheck, Calendar, Clock, CheckCircle2, Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { createPlan, updatePlan, deletePlan } from './actions';

type PlanItem = {
  id: string;
  title: string;
  description: string | null;
  workspaceId: string;
  assignedId: string;
  assignedName: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  tag: string | null;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
};

export default function PlansPage({ initialData }: { initialData?: { data?: PlanItem[] } }) {
  const plans = initialData?.data || [];
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [progress, setProgress] = useState(0);

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('medium');
    setStatus('todo');
    setProgress(0);
    setIsCreateOpen(true);
  };

  const openEditModal = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setTitle(plan.title);
    setDescription(plan.description || '');
    setDeadline(plan.deadline || '');
    setPriority(plan.priority);
    setStatus(plan.status);
    setProgress(plan.payload?.progress || 0);
    setIsEditOpen(true);
  };

  const openDeleteModal = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setIsDeleteOpen(true);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      const res = await createPlan({ title, description, deadline, priority, status, progress });
      if (res.success) {
        setIsCreateOpen(false);
      } else {
        alert("Lỗi: " + res.error);
      }
    });
  };

  const handleUpdate = () => {
    if (!selectedPlan || !title.trim()) return;
    startTransition(async () => {
      const res = await updatePlan(selectedPlan.id, { title, description, deadline, priority, status, progress });
      if (res.success) {
        setIsEditOpen(false);
      } else {
        alert("Lỗi: " + res.error);
      }
    });
  };

  const handleDelete = () => {
    if (!selectedPlan) return;
    startTransition(async () => {
      const res = await deletePlan(selectedPlan.id);
      if (res.success) {
        setIsDeleteOpen(false);
      } else {
        alert("Lỗi: " + res.error);
      }
    });
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'high':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">Quan trọng</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">Trung bình</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Thấp</Badge>;
    }
  };

  const getStatusBadge = (stat: string) => {
    switch (stat) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">Đã hoàn thành</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Đang triển khai</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0">Mới lập</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Kế hoạch hoạt động</h2>
          <p className="text-sm text-slate-500">Giám sát, tạo mới và quản lý tiến độ các kế hoạch chiến lược của trường</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 gap-2 self-start sm:self-center">
          <Plus className="h-4 w-4" /> Thêm kế hoạch mới
        </Button>
      </div>

      {/* Grid of Plans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const prog = plan.payload?.progress || 0;
          return (
            <Card key={plan.id} className="relative flex flex-col justify-between border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-snug">{plan.title}</CardTitle>
                    <p className="text-[10px] text-slate-400">Người phụ trách: {plan.assignedName || 'Chưa phân công'}</p>
                  </div>
                  <ClipboardCheck className="h-5 w-5 text-blue-500 shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 min-h-[48px]">
                  {plan.description || 'Không có mô tả chi tiết.'}
                </p>

                {/* Tags and Dates */}
                <div className="flex flex-wrap gap-2">
                  {getPriorityBadge(plan.priority)}
                  {getStatusBadge(plan.status)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Hạn chót: {plan.deadline ? new Date(plan.deadline).toLocaleDateString('vi-VN') : 'Không có hạn'}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">Tiến độ</span>
                    <span className="font-bold text-blue-600">{prog}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${prog}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(plan)} className="h-8 gap-1.5 text-slate-600 dark:text-slate-300">
                    <Edit className="h-3.5 w-3.5" /> Sửa
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteModal(plan)} className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200">
                    <Trash2 className="h-3.5 w-3.5" /> Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {plans.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed rounded-xl">
            Không có kế hoạch nào được tìm thấy. Hãy nhấn nút phía trên để thêm mới.
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Thêm kế hoạch mới">
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề kế hoạch <span className="text-red-500">*</span></label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả chi tiết</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả mục tiêu, nhiệm vụ..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hạn hoàn thành</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiến độ (%)</label>
              <Input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Độ ưu tiên</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-md border border-slate-200 p-2 text-sm dark:bg-slate-900 dark:border-slate-800">
                <option value="high">Quan trọng (Cao)</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-slate-200 p-2 text-sm dark:bg-slate-900 dark:border-slate-800">
                <option value="todo">Mới lập (Cần làm)</option>
                <option value="in_progress">Đang triển khai</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">{isPending ? 'Đang tạo...' : 'Tạo mới'}</Button>
          </div>
        </div>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen} title="Chỉnh sửa kế hoạch">
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề kế hoạch <span className="text-red-500">*</span></label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả chi tiết</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả mục tiêu, nhiệm vụ..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hạn hoàn thành</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiến độ (%)</label>
              <Input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Độ ưu tiên</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-md border border-slate-200 p-2 text-sm dark:bg-slate-900 dark:border-slate-800">
                <option value="high">Quan trọng (Cao)</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-slate-200 p-2 text-sm dark:bg-slate-900 dark:border-slate-800">
                <option value="todo">Mới lập (Cần làm)</option>
                <option value="in_progress">Đang triển khai</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdate} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">{isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </div>
        </div>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} title="Xác nhận xóa kế hoạch">
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium">Hành động này không thể hoàn tác. Bản ghi kế hoạch và tiến độ sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
          </div>
          <p className="text-sm font-semibold">Bạn có chắc chắn muốn xóa kế hoạch: <span className="text-slate-900 dark:text-white font-extrabold">"{selectedPlan?.title}"</span>?</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white border-0">{isPending ? 'Đang xóa...' : 'Xác nhận xóa'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

