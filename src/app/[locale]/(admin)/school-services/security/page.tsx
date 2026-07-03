'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import DashboardTab from './components/DashboardTab';
import GuestsTab from './components/GuestsTab';
import PickupTab from './components/PickupTab';
import GuardLogTab from './components/GuardLogTab';
import PatrolTab from './components/PatrolTab';
import IncidentsTab from './components/IncidentsTab';
import CameraTab from './components/CameraTab';
import FireSafetyTab from './components/FireSafetyTab';
import ReportsTab from './components/ReportsTab';
import { SECURITY_INCIDENTS } from '@/src/mockData/security';
import { ShieldAlert } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'guests', label: 'Khách ra vào' },
  { id: 'pickup', label: 'Đón trả HS' },
  { id: 'guard-log', label: 'Nhật ký BV' },
  { id: 'patrol', label: 'Tuần tra' },
  { id: 'incidents', label: 'Sự cố' },
  { id: 'cameras', label: 'Camera' },
  { id: 'fire-safety', label: 'PCCC' },
  { id: 'reports', label: 'Báo cáo' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const openUrgentCount = SECURITY_INCIDENTS.filter(
    (i) => (i.severity === 'Khẩn cấp' || i.severity === 'Cao') &&
    i.status !== 'Đã xử lý' && i.status !== 'Đóng sự cố'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              An Ninh &amp; An Toàn
            </h2>
            {openUrgentCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-300 rounded-full px-2.5 py-0.5 text-xs font-semibold animate-pulse">
                <ShieldAlert className="h-3.5 w-3.5" />
                {openUrgentCount} khẩn cấp
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý bảo vệ, kiểm soát người ra vào, đón trả học sinh, sự cố an ninh, camera và PCCC.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex min-w-max h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.id === 'incidents' && openUrgentCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white rounded-full text-[10px] h-4 w-4 flex items-center justify-center shrink-0">
                    {openUrgentCount}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="dashboard" activeValue={activeTab} className="border-none p-0 outline-none">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="guests" activeValue={activeTab} className="border-none p-0 outline-none">
          <GuestsTab />
        </TabsContent>
        <TabsContent value="pickup" activeValue={activeTab} className="border-none p-0 outline-none">
          <PickupTab />
        </TabsContent>
        <TabsContent value="guard-log" activeValue={activeTab} className="border-none p-0 outline-none">
          <GuardLogTab />
        </TabsContent>
        <TabsContent value="patrol" activeValue={activeTab} className="border-none p-0 outline-none">
          <PatrolTab />
        </TabsContent>
        <TabsContent value="incidents" activeValue={activeTab} className="border-none p-0 outline-none">
          <IncidentsTab />
        </TabsContent>
        <TabsContent value="cameras" activeValue={activeTab} className="border-none p-0 outline-none">
          <CameraTab />
        </TabsContent>
        <TabsContent value="fire-safety" activeValue={activeTab} className="border-none p-0 outline-none">
          <FireSafetyTab />
        </TabsContent>
        <TabsContent value="reports" activeValue={activeTab} className="border-none p-0 outline-none">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
