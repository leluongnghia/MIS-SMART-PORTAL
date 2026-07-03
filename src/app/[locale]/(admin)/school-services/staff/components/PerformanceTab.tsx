'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useToast } from '@/src/components/ui/Toast';
import {
  PERFORMANCE_REVIEWS, type PerformanceReview, type PerformanceRating,
  PERFORMANCE_COLORS, DEPARTMENT_COLORS, STAFF_PROFILES,
} from '@/src/mockData/staff';
import { Plus, X, Star, ChevronDown, ChevronUp } from 'lucide-react';

const CRITERIA = [
  { key: 'punctuality', label: 'Đúng giờ' },
  { key: 'taskCompletion', label: 'Hoàn thành nhiệm vụ' },
  { key: 'workQuality', label: 'Chất lượng công việc' },
  { key: 'attitude', label: 'Thái độ phục vụ' },
  { key: 'compliance', label: 'Tuân thủ quy trình' },
  { key: 'feedback', label: 'Phản hồi PH/GV' },
] as const;

function scoreToRating(score: number): PerformanceRating {
  if (score >= 90) return 'Xuất sắc';
  if (score >= 78) return 'Tốt';
  if (score >= 65) return 'Đạt';
  if (score >= 50) return 'Cần cải thiện';
  return 'Không đạt';
}

export default function PerformanceTab() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<PerformanceReview[]>(PERFORMANCE_REVIEWS);
  const [expanded, setExpanded] = useState<string | null>('pr001');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    staffId: '',
    period: 'T7/2026',
    punctuality: 3,
    taskCompletion: 3,
    workQuality: 3,
    attitude: 3,
    compliance: 3,
    feedback: 3,
    violations: 0,
    commendations: 0,
    reviewedBy: '',
    notes: '',
  });

  function calcScore(f: typeof form) {
    const weighted = (f.punctuality + f.taskCompletion + f.workQuality + f.attitude + f.compliance + f.feedback) / 6;
    const penaltyBonus = f.commendations * 2 - f.violations * 5;
    return Math.max(0, Math.min(100, Math.round(weighted * 20 + penaltyBonus)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const profile = STAFF_PROFILES.find(p => p.id === form.staffId);
    if (!profile) { toast({ title: 'Chọn nhân sự', variant: 'destructive' }); return; }
    const score = calcScore(form);
    const newReview: PerformanceReview = {
      id: `pr${Date.now()}`,
      staffId: form.staffId,
      staffName: profile.name,
      department: profile.department,
      period: form.period,
      punctuality: form.punctuality,
      taskCompletion: form.taskCompletion,
      workQuality: form.workQuality,
      attitude: form.attitude,
      compliance: form.compliance,
      feedback: form.feedback,
      violations: form.violations,
      commendations: form.commendations,
      overall: scoreToRating(score),
      overallScore: score,
      reviewedBy: form.reviewedBy || 'Trưởng phòng vận hành',
      reviewDate: new Date().toISOString().slice(0, 10),
      notes: form.notes || undefined,
    };
    setReviews(prev => [newReview, ...prev]);
    setShowForm(false);
    toast({ title: '✅ Đánh giá thành công', description: `${profile.name} — ${score}/100 (${scoreToRating(score)})` });
  }

  const preview = calcScore(form);

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Đánh giá hiệu suất</h3>
          <p className="text-sm text-slate-500">{reviews.length} đánh giá đã ghi nhận</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="h-4 w-4 mr-1" />Đánh giá mới
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-base">Biểu mẫu đánh giá nhân sự</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <Label>Nhân sự *</Label>
                  <select
                    required
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
                    value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                  >
                    <option value="">Chọn nhân sự...</option>
                    {STAFF_PROFILES.map(p => <option key={p.id} value={p.id}>{p.name} — {p.department}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Kỳ đánh giá</Label>
                  <Input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} placeholder="T7/2026" />
                </div>
              </div>

              {/* Criteria sliders */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Tiêu chí đánh giá (1-5)</div>
                {CRITERIA.map(c => (
                  <div key={c.key} className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-44 shrink-0">{c.label}</span>
                    <input
                      type="range" min="1" max="5"
                      value={form[c.key]}
                      onChange={e => setForm(f => ({ ...f, [c.key]: Number(e.target.value) }))}
                      className="flex-1 h-1.5 accent-indigo-500"
                    />
                    <div className="flex gap-1 shrink-0">
                      {[1,2,3,4,5].map(v => (
                        <div key={v} className={`h-4 w-4 rounded-full flex items-center justify-center ${v <= form[c.key] ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                          {v <= form[c.key] && <Star className="h-2 w-2 text-white" />}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-indigo-600 w-4">{form[c.key]}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label>Số vi phạm</Label>
                  <Input type="number" min="0" value={form.violations} onChange={e => setForm(f => ({ ...f, violations: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1">
                  <Label>Số khen thưởng</Label>
                  <Input type="number" min="0" value={form.commendations} onChange={e => setForm(f => ({ ...f, commendations: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1">
                  <Label>Người đánh giá</Label>
                  <Input value={form.reviewedBy} onChange={e => setForm(f => ({ ...f, reviewedBy: e.target.value }))} placeholder="Trưởng phòng..." />
                </div>
                <div className="space-y-1">
                  <Label>Điểm dự kiến</Label>
                  <div className={`text-2xl font-bold mt-1 ${preview >= 90 ? 'text-emerald-600' : preview >= 78 ? 'text-blue-600' : preview >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                    {preview}/100
                  </div>
                  <Badge className={`text-xs ${PERFORMANCE_COLORS[scoreToRating(preview)]}`}>{scoreToRating(preview)}</Badge>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Ghi chú</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Nhận xét thêm..." />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Lưu đánh giá</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <div className="space-y-3">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardHeader className="cursor-pointer pb-2" onClick={() => setExpanded(expanded === review.id ? null : review.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">
                      {review.staffName.split(' ').map(n => n[0]).slice(-2).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{review.staffName}</span>
                      <Badge className={`text-xs ${DEPARTMENT_COLORS[review.department]}`}>{review.department}</Badge>
                      <span className="text-xs text-slate-400">{review.period}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-xs ${PERFORMANCE_COLORS[review.overall]}`}>
                        <Star className="h-2.5 w-2.5 mr-1" />{review.overall}
                      </Badge>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{review.overallScore}/100</span>
                    </div>
                  </div>
                </div>
                {expanded === review.id ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
              </div>
            </CardHeader>

            {expanded === review.id && (
              <CardContent>
                <div className="space-y-3">
                  {/* Score bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${review.overallScore >= 90 ? 'bg-emerald-500' : review.overallScore >= 78 ? 'bg-blue-500' : review.overallScore >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${review.overallScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{review.overallScore}/100</span>
                  </div>

                  {/* Criteria breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CRITERIA.map(c => (
                      <div key={c.key} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5">
                        <div className="text-xs text-slate-500 mb-1">{c.label}</div>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(v => (
                            <div key={v} className={`h-3 flex-1 rounded-sm ${v <= review[c.key] ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <div className="text-xs font-semibold text-indigo-600 mt-1">{review[c.key]}/5</div>
                      </div>
                    ))}
                  </div>

                  {/* Violations / commendations */}
                  <div className="flex gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-red-600">
                      <span className="font-bold">{review.violations}</span>
                      <span className="text-xs">vi phạm</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <span className="font-bold">{review.commendations}</span>
                      <span className="text-xs">khen thưởng</span>
                    </div>
                  </div>

                  {review.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">{review.notes}</p>
                  )}
                  <div className="text-xs text-slate-400">Đánh giá bởi {review.reviewedBy} · {review.reviewDate}</div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
