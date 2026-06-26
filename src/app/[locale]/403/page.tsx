"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Truy cập bị từ chối</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Tài khoản của bạn không có quyền truy cập vào chức năng này. Vui lòng liên hệ Quản trị viên để được cấp quyền.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="default" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
