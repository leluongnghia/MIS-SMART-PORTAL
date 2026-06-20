'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Dialog } from '@/src/components/ui/dialog';
import { CalendarIcon, Clock, AlertTriangle, ArrowRightCircle, UserCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getOverdueDays, getOverdueLevel, getOverdueLevelColor } from '../tasks-client';
import { approveDeadlineExtension, rejectDeadlineExtension, remindTask, escalateTask } from '../actions';

const TERMINAL_STATUSES = new Set(['HOAN_THANH', 'completed', 'done', 'closed', 'canceled', 'cancelled', 'archived', 'ARCHIVED', 'HUY']);

const formatTaskDate = (deadline?: string | Date | null) => {
  if (!deadline) return 'Không có hạn';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return String(deadline);
  return date.toLocaleDateString('vi-VN');
};

export default function OverdueCenterClient({ initialData }: { initialData?: any }) {
  const tasksList = initialData?.data || [];
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  // Modal states
  const [escalateTaskId, setEscalateTaskId] = useState<string | null>(null);
  const [escalateMessage, setEscalateMessage] = useState('');
  const [rejectTaskId, setRejectTaskId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Filter only overdue tasks
  const overdueTasks = useMemo(() => {
    return tasksList.filter((t: any) => {
      if (!t.deadline || TERMINAL_STATUSES.has(String(t.status || ''))) return false;
      const date = new Date(t.deadline);
      return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
    });
  }, [tasksList]);

  // Apply filters
  const filteredOverdue = useMemo(() => {
    return overdueTasks.filter((t: any) => {
      if (filterLevel !== 'ALL' && getOverdueLevel(t) !== filterLevel) return false;
      return true;
    });
  }, [overdueTasks, filterLevel]);

  const handleRemind = async (taskId: string) => {
    const res = await remindTask(taskId);
    alert(res.success ? "Đã gửi nhắc nhở!" : "Lỗi: " + res.error);
  };

  const submitEscalate = async () => {
    if (!escalateTaskId || !escalateMessage.trim()) return;
    const res = await escalateTask(escalateTaskId, "BGH", escalateMessage);
    alert(res.success ? "Đã báo cáo leo thang!" : "Lỗi: " + res.error);
    setEscalateTaskId(null);
    setEscalateMessage('');
  };

  const handleApprove = async (taskId: string) => {
    const res = await approveDeadlineExtension(taskId);
    alert(res.success ? "Đã duyệt gia hạn deadline!" : "Lỗi: " + res.error);
  };

  const submitReject = async () => {
    if (!rejectTaskId || !rejectReason.trim()) return;
    const res = await rejectDeadlineExtension(rejectTaskId, rejectReason);
    alert(res.success ? "Đã từ chối gia hạn deadline!" : "Lỗi: " + res.error);
    setRejectTaskId(null);
    setRejectReason('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" /> Trung tâm xử lý quá hạn
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý, đánh giá rủi ro và xử lý dứt điểm các công việc bị chậm tiến độ
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <select 
          value={filterLevel} 
          onChange={(e) => setFilterLevel(e.target.value)}
          className="text-sm p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
        >
          <option value="ALL">Tất cả mức độ</option>
          <option value="LIGHT">Nhẹ (1-2 ngày)</option>
          <option value="MEDIUM">Trung bình (3-7 ngày)</option>
          <option value="HIGH">Nặng (8-14 ngày)</option>
          <option value="CRITICAL">Nghiêm trọng (&gt;14 ngày hoặc URGENT)</option>
        </select>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="w-[300px]">Công việc</TableHead>
                <TableHead>Phụ trách</TableHead>
                <TableHead>Hạn cũ</TableHead>
                <TableHead>Trạng thái trễ</TableHead>
                <TableHead>Lý do / Gia hạn</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOverdue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    <CheckCircle className="mx-auto h-8 w-8 text-emerald-500 mb-2 opacity-50" />
                    Không có công việc quá hạn nào trong danh sách.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOverdue.map((task: any) => {
                  const days = getOverdueDays(task);
                  const level = getOverdueLevel(task);
                  const color = getOverdueLevelColor(level);
                  const payload = task.payload || {};
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{task.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Phòng ban: {task.workspaceId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <UserCircle className="h-4 w-4 text-slate-400" />
                          {task.assignedName || task.user}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {formatTaskDate(task.deadline)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px] border-0", color)}>
                          Trễ {days} ngày ({level})
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {payload.overdueReason ? (
                            <span className="text-slate-600 dark:text-slate-400 italic line-clamp-1" title={payload.overdueReason}>
                              "{payload.overdueReason}"
                            </span>
                          ) : (
                            <span className="text-red-500 italic">Chưa có lý do</span>
                          )}

                          {payload.deadlineExtensionStatus === 'PENDING' && (
                            <Badge className="bg-orange-100 text-orange-700 border-0 flex items-center gap-1 w-max mt-1">
                              <Clock className="h-3 w-3" /> Xin gia hạn đến {formatTaskDate(payload.proposedNewDueDate)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {payload.deadlineExtensionStatus === 'PENDING' ? (
                            <>
                              <Button size="sm" onClick={() => handleApprove(task.id)} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700">Duyệt</Button>
                              <Button size="sm" variant="outline" onClick={() => setRejectTaskId(task.id)} className="h-7 text-[10px] text-red-600 border-red-200">Từ chối</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleRemind(task.id)} className="h-7 text-[10px] text-blue-600 border-blue-200 hover:bg-blue-50">Nhắc việc</Button>
                              <Button size="sm" variant="outline" onClick={() => setEscalateTaskId(task.id)} className="h-7 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50">
                                <ArrowRightCircle className="mr-1 h-3 w-3" /> Báo cáo BGH
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Escalate Dialog */}
      <Dialog 
        open={!!escalateTaskId} 
        onOpenChange={(open) => !open && setEscalateTaskId(null)}
        title="Báo cáo leo thang (Escalate)"
        description="Vui lòng nhập lý do và tình trạng hiện tại để báo cáo lên Ban Giám Hiệu."
      >
        <div className="py-4">
          <textarea
            className="w-full min-h-[100px] p-3 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            placeholder="Nhập nội dung báo cáo..."
            value={escalateMessage}
            onChange={(e) => setEscalateMessage(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 mt-4">
          <Button variant="ghost" onClick={() => setEscalateTaskId(null)}>Hủy</Button>
          <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={submitEscalate} disabled={!escalateMessage.trim()}>Gửi báo cáo</Button>
        </div>
      </Dialog>

      {/* Reject Extension Dialog */}
      <Dialog 
        open={!!rejectTaskId} 
        onOpenChange={(open) => !open && setRejectTaskId(null)}
        title="Từ chối gia hạn deadline"
        description="Nhập lý do từ chối yêu cầu gia hạn của nhân sự."
      >
        <div className="py-4">
          <textarea
            className="w-full min-h-[100px] p-3 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 mt-4">
          <Button variant="ghost" onClick={() => setRejectTaskId(null)}>Hủy</Button>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={submitReject} disabled={!rejectReason.trim()}>Xác nhận từ chối</Button>
        </div>
      </Dialog>
    </div>
  );
}
