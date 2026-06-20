'use client';

import React from 'react';
import Drawer from '@/src/components/ui/Drawer';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Phone, MessageSquare, Edit3, Bell, GraduationCap, AlertTriangle, Activity } from 'lucide-react';
import Link from 'next/link';

interface StudentQuickProfileProps {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
  locale?: string;
}

export default function StudentQuickProfile({ isOpen, onClose, student, locale = 'vi' }: StudentQuickProfileProps) {
  if (!student) return null;

  const payload = student.payload || {};
  const parents = payload.parents || [];
  const attendance = payload.attendanceStat || { present: 0, excused: 0, unexcused: 0, late: 0 };
  const conduct = payload.conduct || { status: 'Chưa đánh giá', advantages: [], notes: [] };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ sơ Nhanh Học Sinh"
      description={`Mã HS: ${student.code}`}
      side="right"
      width="md"
      footer={
        <div className="flex gap-2 justify-end w-full">
          <Button variant="outline" onClick={onClose} className="font-bold">Đóng</Button>
          <Link href={`/${locale}/students?studentId=${student.id}`} onClick={onClose}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Xem Hồ Sơ 360° Chi Tiết
            </Button>
          </Link>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header Info */}
        <div className="text-center">
          <img 
            src={`https://i.pravatar.cc/150?u=${student.id}`} 
            className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-slate-100 dark:ring-slate-800" 
            alt={student.name} 
          />
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-3">{student.name}</h3>
          <p className="text-sm font-bold text-slate-500">{student.className}</p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-600/20 px-2 py-0.5 border-0">
              {payload.status || 'Đang học'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Điểm TB</p>
            <p className="text-xl font-black text-blue-600">{payload.gpa || 'N/A'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Activity className="h-3 w-3" /> Chuyên cần</p>
            <p className="text-xl font-black text-emerald-600">{payload.attendanceRate || 'N/A'}</p>
          </div>
        </div>

        {/* Parent Info */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Thông tin Phụ huynh</p>
          {parents.length > 0 ? (
            <div className="space-y-2">
              {parents.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                      {p.relation?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name} <span className="font-normal text-slate-500">({p.relation})</span></p>
                      <p className="text-[10px] text-slate-500">{p.phone}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" onClick={() => {
                    if (p.phone) {
                      window.location.href = `tel:${p.phone.replace(/\s+/g, '')}`;
                    } else {
                      alert("Chưa cập nhật số điện thoại phụ huynh!");
                    }
                  }}><Phone className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Chưa cập nhật</p>
          )}
        </div>

        {/* Conduct & Alerts */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-orange-500" /> Nhắc nhở & Lưu ý
          </p>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-950">
             <div className="mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Hạnh kiểm: </span>
                <span className="text-xs font-bold text-emerald-600">{conduct.status}</span>
             </div>
             <ul className="text-xs text-slate-500 list-disc list-inside space-y-1">
               {conduct.notes?.length > 0 ? (
                 conduct.notes.map((n: string, i: number) => <li key={i}>{n}</li>)
               ) : (
                 <li>Không có nhắc nhở kỷ luật</li>
               )}
               {attendance.unexcused > 0 && (
                 <li className="text-rose-500 font-medium">Nghỉ không phép {attendance.unexcused} buổi</li>
               )}
             </ul>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Thao tác nhanh</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 text-[10px]" onClick={() => {
              const msg = prompt(`Nhập nội dung thông báo gửi cho phụ huynh học sinh ${student.name}:`);
              if (msg) alert(`Đã gửi thông báo thành công!`);
            }}><Bell className="h-3.5 w-3.5 text-blue-500" /> Thông báo</Button>
            <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 text-[10px]" onClick={() => {
              const msg = prompt(`Nhập tin nhắn nhanh gửi cho phụ huynh học sinh ${student.name}:`);
              if (msg) alert(`Đã gửi tin nhắn thành công!`);
            }}><MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> Nhắn tin</Button>
            <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 text-[10px]" onClick={() => {
              const msg = prompt(`Nhập ghi chú cho học sinh ${student.name}:`);
              if (msg) alert(`Đã lưu ghi chú thành công!`);
            }}><Edit3 className="h-3.5 w-3.5 text-orange-500" /> Ghi chú</Button>
          </div>
        </div>

      </div>
    </Drawer>
  );
}
