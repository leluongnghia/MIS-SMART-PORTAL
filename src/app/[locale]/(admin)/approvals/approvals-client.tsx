'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Dialog } from '@/src/components/ui/dialog';
import { UserCheck, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, FileText, User } from 'lucide-react';
import { approveLeaveRequest, rejectLeaveRequest } from './actions';
import type { Actor } from '@/src/libs/server/auth-helper';

type LeaveRequest = {
  id: string;
  employeeProfileId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
  approvedById: string | null;
  substituteTeacherId: string | null;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
};

export default function ApprovalsPage({ initialData }: { initialData?: { data?: LeaveRequest[], actor?: Actor | null } }) {
  const requests = initialData?.data || [];
  const actor = initialData?.actor || null;
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filter requests based on tab
  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'all') return true;
    return req.status === activeTab;
  });

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveLeaveRequest(id);
      if (res.success) {
        setIsDetailsOpen(false);
      } else {
        alert("Lỗi: " + res.error);
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const res = await rejectLeaveRequest(id);
      if (res.success) {
        setIsDetailsOpen(false);
      } else {
        alert("Lỗi: " + res.error);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex gap-1 items-center w-fit"><CheckCircle2 className="h-3 w-3" /> Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 flex gap-1 items-center w-fit"><XCircle className="h-3 w-3" /> Từ chối</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 flex gap-1 items-center w-fit"><Clock className="h-3 w-3 text-orange-500" /> Chờ duyệt</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getDaysCount = (start: Date, end: Date) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e.getTime() - s.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days || 1;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Danh sách yêu cầu phê duyệt</h2>
        <p className="text-sm text-slate-500">Quản lý và phê duyệt đơn xin nghỉ phép, đề xuất chi tiêu và các quy trình hành chính</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-bold gap-4">
        {[
          { key: 'all', label: 'Tất cả', count: requests.length },
          { key: 'pending', label: 'Chờ duyệt', count: requests.filter(r => r.status === 'pending').length },
          { key: 'approved', label: 'Đã duyệt', count: requests.filter(r => r.status === 'approved').length },
          { key: 'rejected', label: 'Đã từ chối', count: requests.filter(r => r.status === 'rejected').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "pb-3 border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === tab.key
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            {tab.label}
            <Badge className={cn("px-1.5 py-0 text-[10px]", activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* List / Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-bold">Mã Đơn / Nhân sự</th>
                <th className="px-5 py-3.5 font-bold">Loại đề xuất</th>
                <th className="px-5 py-3.5 font-bold">Thời gian nghỉ</th>
                <th className="px-5 py-3.5 font-bold">Lý do xin nghỉ</th>
                <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                <th className="px-5 py-3.5 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer" onClick={() => {
                  setSelectedRequest(req);
                  setIsDetailsOpen(true);
                }}>
                  <td className="px-5 py-4">
                    <div>
                      <span className="text-xs font-mono text-slate-400">#{req.id}</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{req.payload?.employeeName || 'Cán bộ giáo viên'}</p>
                      <p className="text-[10px] text-slate-500">{req.payload?.department || 'Tổ chuyên môn'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{req.type}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs space-y-0.5">
                      <p className="font-medium">{formatDate(req.startDate)}</p>
                      <p className="text-slate-400">Đến: {formatDate(req.endDate)}</p>
                      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/20 text-[9px] py-0 border-0">{getDaysCount(req.startDate, req.endDate)} ngày</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate">
                    <span className="text-slate-600 dark:text-slate-400">{req.reason}</span>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant={req.status === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsDetailsOpen(true);
                        }}
                        className={cn(
                          "h-8 text-xs font-semibold",
                          req.status === 'pending' 
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm" 
                            : "text-slate-700 dark:text-slate-350"
                        )}
                      >
                        {req.status === 'pending' ? 'Xem & Phê duyệt' : 'Xem chi tiết'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Không có yêu cầu phê duyệt nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAILS DIALOG */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} title="Chi tiết đơn xin nghỉ phép">
        {selectedRequest && (
          <div className="space-y-5 pt-2">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">Mã đơn: #{selectedRequest.id}</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedRequest.payload?.employeeName}</h3>
                <p className="text-xs text-slate-500">{selectedRequest.payload?.department}</p>
              </div>
              {getStatusBadge(selectedRequest.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 block">Thời gian nghỉ:</span>
                <span className="font-bold flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(selectedRequest.startDate)}</span>
                <span className="text-slate-400 block pl-5">Đến: {formatDate(selectedRequest.endDate)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Số ngày nghỉ:</span>
                <span className="font-bold text-sm text-blue-600">{getDaysCount(selectedRequest.startDate, selectedRequest.endDate)} ngày</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 block">Loại hình nghỉ:</span>
                <span className="font-bold">{selectedRequest.type}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Giáo viên dạy thay đề cử:</span>
                <span className="font-bold flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> {selectedRequest.substituteTeacherId === 'user_hoa' ? 'Cô Trịnh Thúy Hoa' : 'Thầy Lê Quang Minh'}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-500 block">Lý do xin nghỉ phép:</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedRequest.reason}
              </p>
            </div>

            {selectedRequest.status === 'pending' && actor && (actor.role === 'ADMIN' || actor.role === 'MANAGER') ? (
              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-9"
                >
                  {isPending ? 'Đang xử lý...' : 'Phê duyệt thông qua'}
                </Button>
                <Button 
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={isPending}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-rose-50 hover:text-red-700 text-xs h-9"
                >
                  {isPending ? 'Đang xử lý...' : 'Từ chối đơn xin nghỉ'}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button onClick={() => setIsDetailsOpen(false)} className="text-xs h-9">
                  Đóng
                </Button>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

