'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import {
  STAFF_PROFILES, type StaffProfile, type Department, type StaffType, type StaffStatus,
  DEPARTMENT_COLORS, STATUS_COLORS, PERFORMANCE_COLORS,
  ALL_DEPARTMENTS, ALL_STAFF_TYPES, ALL_STAFF_STATUSES, MANDATORY_TRAININGS,
  TRAINING_RECORDS,
} from '@/src/mockData/staff';
import {
  Search, Plus, User, Phone, MapPin, Calendar, ChevronDown, ChevronUp,
  GraduationCap, Star, X,
} from 'lucide-react';

const emptyForm: Omit<StaffProfile, 'id' | 'code' | 'performanceScore' | 'trainingCompleted'> = {
  name: '',
  phone: '',
  email: '',
  dob: '',
  address: '',
  department: 'Bảo vệ',
  title: '',
  type: 'Chính thức',
  startDate: '',
  status: 'Đang làm',
  manager: '',
  notes: '',
};

export default function ProfilesTab() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<StaffProfile[]>(STAFF_PROFILES);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const filtered = profiles.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) ||
               p.code.toLowerCase().includes(search.toLowerCase()) ||
               p.phone.includes(search);
    return ms &&
      (filterDept === 'all' || p.department === filterDept) &&
      (filterType === 'all' || p.type === filterType) &&
      (filterStatus === 'all' || p.status === filterStatus);
  });

  function getMissingTrainings(profile: StaffProfile) {
    return MANDATORY_TRAININGS.filter(tid => !profile.trainingCompleted.includes(tid));
  }

  function getTrainingName(tid: string) {
    return TRAINING_RECORDS.find(t => t.id === tid)?.title ?? tid;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập họ tên và số điện thoại', variant: 'destructive' });
      return;
    }
    const next = profiles.length + 1;
    const prefix = form.department === 'Bảo vệ' ? 'BV' : form.department === 'Vệ sinh' ? 'VS' :
      form.department === 'Bếp ăn' ? 'BA' : form.department === 'Y tế' ? 'YT' :
      form.department === 'Xe đưa đón' ? 'XE' : form.department === 'Kỹ thuật' ? 'KT' : 'NS';
    const newProfile: StaffProfile = {
      ...form,
      id: `s${Date.now()}`,
      code: `${prefix}${String(next).padStart(3, '0')}`,
      trainingCompleted: [],
    };
    setProfiles(prev => [newProfile, ...prev]);
    setForm({ ...emptyForm });
    setShowForm(false);
    toast({ title: '✅ Thêm nhân sự thành công', description: newProfile.name });
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm theo tên, mã, SĐT..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">Tất cả bộ phận</option>
          {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Tất cả loại</option>
          {ALL_STAFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {ALL_STAFF_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Button onClick={() => setShowForm(v => !v)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />Thêm nhân sự
        </Button>
      </div>

      <div className="text-xs text-slate-500">{filtered.length} nhân sự</div>

      {/* Create form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Thêm nhân sự mới</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Họ tên *</Label>
                <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Văn A..." />
              </div>
              <div className="space-y-1">
                <Label>Số điện thoại *</Label>
                <Input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="09xxxxxxxx" />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@school.edu.vn" />
              </div>
              <div className="space-y-1">
                <Label>Ngày sinh</Label>
                <Input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Bộ phận</Label>
                <Select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value as Department }))}>
                  {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Chức danh</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Bảo vệ, Tổ trưởng..." />
              </div>
              <div className="space-y-1">
                <Label>Loại nhân sự</Label>
                <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as StaffType }))}>
                  {ALL_STAFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Ngày bắt đầu</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Trạng thái</Label>
                <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as StaffStatus }))}>
                  {ALL_STAFF_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Người quản lý</Label>
                <Input value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))} placeholder="Tổ trưởng bảo vệ..." />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Địa chỉ</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Quận/Huyện, Tỉnh/TP..." />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Ghi chú</Label>
                <Input value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Ghi chú thêm..." />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Thêm nhân sự</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Profile cards */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">Không tìm thấy nhân sự nào</div>
        )}
        {filtered.map(profile => {
          const missingTrainings = getMissingTrainings(profile);
          return (
            <Card key={profile.id} className={profile.status !== 'Đang làm' ? 'opacity-80' : ''}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === profile.id ? null : profile.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar initials */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">
                        {profile.name.split(' ').map(n => n[0]).slice(-2).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{profile.name}</span>
                        <span className="text-xs text-slate-400">#{profile.code}</span>
                        <Badge className={`text-xs ${DEPARTMENT_COLORS[profile.department]}`}>{profile.department}</Badge>
                        <Badge className={`text-xs ${STATUS_COLORS[profile.status]}`}>{profile.status}</Badge>
                        {missingTrainings.length > 0 && (
                          <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                            ⚠️ Thiếu {missingTrainings.length} đào tạo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{profile.title}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{profile.phone}</span>
                        <span className="text-slate-400">{profile.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {profile.performanceRating && (
                      <Badge className={`text-xs ${PERFORMANCE_COLORS[profile.performanceRating]}`}>
                        <Star className="h-2.5 w-2.5 mr-1" />
                        {profile.performanceRating}
                      </Badge>
                    )}
                    {expanded === profile.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>
              </CardHeader>

              {expanded === profile.id && (
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Thông tin cá nhân</div>
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2"><Calendar className="h-3 w-3" />{profile.dob || '—'}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{profile.address}</div>
                        {profile.email && <div className="flex items-center gap-2">✉ {profile.email}</div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Công việc</div>
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <div>Ngày vào: {profile.startDate}</div>
                        <div>Quản lý: {profile.manager}</div>
                        {profile.notes && <div className="italic">{profile.notes}</div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Đào tạo bắt buộc</div>
                      <div className="space-y-1">
                        {MANDATORY_TRAININGS.map(tid => {
                          const done = profile.trainingCompleted.includes(tid);
                          return (
                            <div key={tid} className={`flex items-center gap-1.5 text-xs ${done ? 'text-emerald-600' : 'text-red-600'}`}>
                              <span>{done ? '✅' : '❌'}</span>
                              <span>{getTrainingName(tid)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {profile.performanceScore !== undefined && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Điểm hiệu suất:</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${profile.performanceScore >= 90 ? 'bg-emerald-500' : profile.performanceScore >= 75 ? 'bg-blue-500' : profile.performanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${profile.performanceScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{profile.performanceScore}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
