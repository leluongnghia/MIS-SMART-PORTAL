'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import DashboardTab from './components/DashboardTab';
import AreasTab from './components/AreasTab';
import SchedulesTab from './components/SchedulesTab';
import ChecklistsTab from './components/ChecklistsTab';
import IncidentsTab from './components/IncidentsTab';
import MaterialsTab from './components/MaterialsTab';
import ReportsTab from './components/ReportsTab';

export default function CleaningPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Vệ Sinh & Môi Trường</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý công tác vệ sinh, lịch trực, kiểm tra chất lượng và xử lý sự cố.
          </p>
        </div>
      </div>

      <Tabs className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex min-w-max h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <TabsTrigger active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Tổng quan</TabsTrigger>
            <TabsTrigger active={activeTab === 'areas'} onClick={() => setActiveTab('areas')}>Khu vực</TabsTrigger>
            <TabsTrigger active={activeTab === 'schedules'} onClick={() => setActiveTab('schedules')}>Lịch vệ sinh</TabsTrigger>
            <TabsTrigger active={activeTab === 'checklists'} onClick={() => setActiveTab('checklists')}>Checklist</TabsTrigger>
            <TabsTrigger active={activeTab === 'incidents'} onClick={() => setActiveTab('incidents')}>Sự cố</TabsTrigger>
            <TabsTrigger active={activeTab === 'materials'} onClick={() => setActiveTab('materials')}>Vật tư</TabsTrigger>
            <TabsTrigger active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>Báo cáo</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" activeValue={activeTab} className="border-none p-0 outline-none">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="areas" activeValue={activeTab} className="border-none p-0 outline-none">
          <AreasTab />
        </TabsContent>
        <TabsContent value="schedules" activeValue={activeTab} className="border-none p-0 outline-none">
          <SchedulesTab />
        </TabsContent>
        <TabsContent value="checklists" activeValue={activeTab} className="border-none p-0 outline-none">
          <ChecklistsTab />
        </TabsContent>
        <TabsContent value="incidents" activeValue={activeTab} className="border-none p-0 outline-none">
          <IncidentsTab />
        </TabsContent>
        <TabsContent value="materials" activeValue={activeTab} className="border-none p-0 outline-none">
          <MaterialsTab />
        </TabsContent>
        <TabsContent value="reports" activeValue={activeTab} className="border-none p-0 outline-none">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
