'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { CONTRACTORS, type Contractor, type Department, DEPARTMENT_COLORS, ALL_DEPARTMENTS } from '@/src/mockData/staff';
import { Building2, Plus, X, AlertTriangle, Star, ChevronDown, ChevronUp } from 'lucide-react';

export default function ContractorsTab() {
  const { toast } = useToast();
  const [contractors, setContractors] = useState<Contractor[]>(CONTRACTORS);
  const [expanded, setExpanded] = useState<string | null>('ct001');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    serviceType: 'Bảo vệ' as Department,
    representative: '',
    phone: '',
    contractStart: '',
    contractEnd: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.representative.trim()) {
      toast({ title: 'Thiếu thông tin', variant: 'destructive' });
      return;
    }
    const newCtx: Contractor = {
      id: `ct${Date.now()}`,
      ...form,
      staffList: [],
      qualityScore: 7,
      incidents: 0,
      status: 'Còn hiệu lực',
    };
    setContractors(prev => [newCtx, ...prev]);
    setShowForm(false);
    setForm({ name: '', serviceType: 'Bảo vệ', representative: '', phone: '', contractStart: '', contractEnd: '' });
    toast({ title: '✅ Thêm nhà thầu thành công', description: form.name });
  }

  function getStatusColor(status: Contractor['status']) {
    if (status === 'Còn hiệu lực') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Hết hạn') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  }

  function getScoreColor(score: number) {
    if (score >= 8) return 'text-emerald-600';
    if (score >= 6) return 'text-amber-600';
    return 'text-red-600';
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Nhà thầu dịch vụ</h3>
          <p className="text-sm text-slate-500">{contractors.length} nhà thầu · {contractors.filter(c => c.status === 'Còn hiệu lực').length} còn hiệu lực</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="h-4 w-4 mr-1" />Thêm nhà thầu
        </Button>
      </div>

      {/* Expiry warnings */}
      {contractors.filter(c => c.status === 'Hết hạn').length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <span className="font-semibold">Hợp đồng hết hạn:</span>{' '}
            {contractors.filter(c => c.status === 'Hết hạn').map(c => c.name).join(', ')} — cần gia hạn hoặc thay thế.
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-base">Thêm nhà thầu mới</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <Label>Tên đơn vị *</Label>
                <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Cty Bảo vệ Sao Việt..." />
              </div>
              <div className="space-y-1">
                <Label>Loại dịch vụ</Label>
                <Select value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value as Department }))}>
                  {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Người đại diện *</Label>
                <Input required value={form.representative} onChange={e => setForm(f => ({ ...f, representative: e.target.value }))} placeholder="Họ tên..." />
              </div>
              <div className="space-y-1">
                <Label>Số điện thoại</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="028..." />
              </div>
              <div className="space-y-1">
                <Label>Bắt đầu hợp đồng</Label>
                <Input type="date" value={form.contractStart} onChange={e => setForm(f => ({ ...f, contractStart: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Kết thúc hợp đồng</Label>
                <Input type="date" value={form.contractEnd} onChange={e => setForm(f => ({ ...f, contractEnd: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Thêm nhà thầu</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contractor cards */}
      <div className="space-y-3">
        {contractors.map(c => (
          <Card key={c.id} className={c.status === 'Hết hạn' ? 'border-red-300' : c.qualityScore < 6 ? 'border-amber-300' : ''}>
            <CardHeader className="cursor-pointer pb-2" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <Building2 className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{c.name}</span>
                      <Badge className={`text-xs ${DEPARTMENT_COLORS[c.serviceType]}`}>{c.serviceType}</Badge>
                      <Badge className={`text-xs ${getStatusColor(c.status)}`}>{c.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 flex-wrap">
                      <span>Đại diện: {c.representative}</span>
                      <span>{c.phone}</span>
                      <span>HĐ: {c.contractStart} → {c.contractEnd}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className={`text-lg font-bold flex items-center gap-1 ${getScoreColor(c.qualityScore)}`}>
                      <Star className="h-3.5 w-3.5" />{c.qualityScore}/10
                    </div>
                    {c.incidents > 0 && <div className="text-xs text-red-600">{c.incidents} sự cố</div>}
                  </div>
                  {expanded === c.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>
            </CardHeader>

            {expanded === c.id && (
              <CardContent>
                <div className="space-y-3 text-sm">
                  {/* Quality score bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24">Chất lượng:</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.qualityScore >= 8 ? 'bg-emerald-500' : c.qualityScore >= 6 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${c.qualityScore * 10}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(c.qualityScore)}`}>{c.qualityScore}/10</span>
                  </div>

                  {/* Staff list */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1.5">Nhân sự thuộc nhà thầu ({c.staffList.length}):</div>
                    {c.staffList.length === 0 ? (
                      <span className="text-xs text-slate-400">Chưa có nhân sự được liên kết</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {c.staffList.map((name, i) => (
                          <Badge key={i} className="text-xs bg-slate-100 text-slate-600">{name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {c.incidents > 0 && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {c.incidents} sự cố đã ghi nhận — cần rà soát hợp đồng
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
