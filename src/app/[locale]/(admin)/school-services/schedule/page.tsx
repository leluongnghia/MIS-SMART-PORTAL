'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import DashboardTab from './components/DashboardTab';
import CalendarTab from './components/CalendarTab';
import TasksTab from './components/TasksTab';
import RecurringTab from './components/RecurringTab';
import HandoverTab from './components/HandoverTab';
import EventsTab from './components/EventsTab';
import OverdueTab from './components/OverdueTab';
import ReportsTab from './components/ReportsTab';
import { OPERATION_TASKS, SCHEDULE_KPI } from '@/src/mockData/schedule';
import { CalendarClock, AlertTriangle } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'calendar', label: 'Lịch tổng' },
  { id: 'tasks', label: 'Công việc' },
  { id: 'recurring', label: 'Định kỳ' },
  { id: 'handover', label: 'Bàn giao ca' },
  { id: 'events', label: 'Sự kiện' },
  { id: 'overdue', label: 'Quá hạn' },
  { id: 'reports', label: 'Báo cáo' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const overdueCount = OPERATION_TASKS.filter(t => t.status === 'Quá hạn').length;
  const urgentCount = OPERATION_TASKS.filter(
    t => t.priority === 'Khẩn cấp' && t.status !== 'Hoàn thành' && t.status !== 'Đã hủy'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lịch Vận Hành
            </h2>
            {(overdueCount > 0 || urgentCount > 0) && (
              <div className="flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-300 rounded-full px-2.5 py-0.5 text-xs font-semibold animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                {overdueCount > 0 && `${overdueCount} quá hạn`}
                {overdueCount > 0 && urgentCount > 0 && ' · '}
                {urgentCount > 0 && `${urgentCount} khẩn cấp`}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Trung tâm quản lý công việc vận hành, lịch sự kiện, ca trực và nhiệm vụ định kỳ trong nhà trường.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
          <CalendarClock className="h-4 w-4 text-blue-500" />
          <span>Hôm nay: <strong className="text-slate-700 dark:text-slate-300">{SCHEDULE_KPI.totalToday}</strong> công việc</span>
          <span>·</span>
          <span className="text-emerald-600 font-medium">{SCHEDULE_KPI.completed} hoàn thành</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex min-w-max h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="flex items-center gap-1.5">
                  {tab.label}
                  {tab.id === 'overdue' && (overdueCount + urgentCount) > 0 && (
                    <span className="bg-red-500 text-white rounded-full text-[10px] h-4 w-4 flex items-center justify-center shrink-0">
                      {overdueCount + urgentCount}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="dashboard" activeValue={activeTab} className="border-none p-0 outline-none">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="calendar" activeValue={activeTab} className="border-none p-0 outline-none">
          <CalendarTab />
        </TabsContent>
        <TabsContent value="tasks" activeValue={activeTab} className="border-none p-0 outline-none">
          <TasksTab />
        </TabsContent>
        <TabsContent value="recurring" activeValue={activeTab} className="border-none p-0 outline-none">
          <RecurringTab />
        </TabsContent>
        <TabsContent value="handover" activeValue={activeTab} className="border-none p-0 outline-none">
          <HandoverTab />
        </TabsContent>
        <TabsContent value="events" activeValue={activeTab} className="border-none p-0 outline-none">
          <EventsTab />
        </TabsContent>
        <TabsContent value="overdue" activeValue={activeTab} className="border-none p-0 outline-none">
          <OverdueTab />
        </TabsContent>
        <TabsContent value="reports" activeValue={activeTab} className="border-none p-0 outline-none">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
