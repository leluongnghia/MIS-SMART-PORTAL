'use client';

import React from 'react';

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Vai trò</h1>
          <p className="text-muted-foreground">Định nghĩa các vai trò trong hệ thống và phân quyền.</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">Danh sách Vai trò</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="text-sm text-muted-foreground py-10 text-center">
            Tính năng đang được xây dựng...
          </div>
        </div>
      </div>
    </div>
  );
}
