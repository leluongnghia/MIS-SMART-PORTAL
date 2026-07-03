'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { PATROL_RECORDS, type PatrolRecord, type PatrolResult } from '@/src/mockData/security';
import { MapPin, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

const PATROL_AREAS = [
  'Cổng trường & khu vực cổng',
  'Sân trường & hành lang',
  'Nhà xe & bãi đỗ xe',
  'Nhà ăn',
  'Khu bán trú',
  'Phòng chức năng',
  'Khu vực vắng',
];

export default function PatrolTab() {
  const { toast } = useToast();
  const [records, setRecords] = useState<PatrolRecord[]>(PATROL_RECORDS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = records.filter((r) =>
    filterStatus === 'all' || r.status === filterStatus
  );

  function toggleCheck(recordId: string, itemIndex: number) {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newChecklist = r.checklist.map((item, i) =>
          i === itemIndex ? { ...item, checked: !item.checked } : item
        );
        return { ...r, checklist: newChecklist };
      })
    );
  }

  function finishPatrol(id: string) {
    const rec = records.find((r) => r.id === id)!;
    const allChecked = rec.checklist.every((c) => c.checked);
    const hasUnchecked = rec.checklist.some((c) => !c.checked);
    const result: PatrolResult = hasUnchecked ? 'Bất thường' : 'Bình thường';
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Hoàn thành', result, actualTime: now } : r
      )
    );
    toast({
      title: result === 'Bình thường' ? '✅ Tuần tra hoàn thành' : '⚠️ Phát hiện bất thường',
      description: `${rec.area} — ${now}`,
      variant: result === 'Bất thường' ? 'destructive' : undefined,
    });
  }

  function startPatrol(id: string) {
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setRecords((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'Đang tuần tra', actualTime: now } : r)
    );
    setExpanded(id);
    toast({ title: 'Bắt đầu tuần tra', description: records.find(r => r.id === id)?.area });
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="sm:w-48">
          <option value="all">Tất cả trạng thái</option>
          <option value="Chưa thực hiện">Chưa thực hiện</option>
          <option value="Đang tuần tra">Đang tuần tra</option>
          <option value="Hoàn thành">Hoàn thành</option>
        </Select>
        <div className="flex gap-3 text-sm ml-auto">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-slate-300" />
            Chưa thực hiện: {records.filter(r => r.status === 'Chưa thực hiện').length}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Đang tuần tra: {records.filter(r => r.status === 'Đang tuần tra').length}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Hoàn thành: {records.filter(r => r.status === 'Hoàn thành').length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((rec) => (
          <Card
            key={rec.id}
            className={
              rec.result === 'Bất thường' && rec.status === 'Hoàn thành'
                ? 'border-orange-300 dark:border-orange-700'
                : rec.status === 'Đang tuần tra'
                ? 'border-blue-300 dark:border-blue-700'
                : ''
            }
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium">{rec.area}</span>
                    <Badge
                      className={`text-xs ${
                        rec.status === 'Hoàn thành'
                          ? rec.result === 'Bất thường'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-emerald-100 text-emerald-700'
                          : rec.status === 'Đang tuần tra'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rec.status === 'Hoàn thành' ? rec.result : rec.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span>Người tuần tra: {rec.patrolBy}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Dự kiến: {rec.scheduledTime}
                      {rec.actualTime && ` | Thực tế: ${rec.actualTime}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {rec.status === 'Chưa thực hiện' && (
                    <Button size="sm" onClick={() => startPatrol(rec.id)} className="text-xs h-7">Bắt đầu</Button>
                  )}
                  {rec.status === 'Đang tuần tra' && (
                    <Button size="sm" onClick={() => finishPatrol(rec.id)} className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700">
                      Hoàn thành
                    </Button>
                  )}
                  <button
                    onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {expanded === rec.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardHeader>

            {expanded === rec.id && (
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Checklist tuần tra:</div>
                  {rec.checklist.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        item.checked
                          ? 'bg-emerald-50 dark:bg-emerald-950/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100'
                      } ${rec.status === 'Hoàn thành' ? 'cursor-default' : ''}`}
                      onClick={() => rec.status !== 'Hoàn thành' && toggleCheck(rec.id, i)}
                    >
                      {item.checked ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${item.checked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600'}`}>
                          {item.item}
                        </div>
                        {item.note && (
                          <div className="text-xs text-orange-600 mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {rec.notes && (
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 text-sm text-orange-700">
                      <strong>Ghi chú: </strong>{rec.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
