'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import DashboardTab from './components/DashboardTab';
import ProfilesTab from './components/ProfilesTab';
import ShiftsTab from './components/ShiftsTab';
import AttendanceTab from './components/AttendanceTab';
import TasksTab from './components/TasksTab';
import PerformanceTab from './components/PerformanceTab';
import TrainingTab from './components/TrainingTab';
import DisciplinaryTab from './components/DisciplinaryTab';
import ContractorsTab from './components/ContractorsTab';
import ReportsTab from './components/ReportsTab';
import { STAFF_KPI, SHIFT_ASSIGNMENTS, STAFF_TASKS, MANDATORY_TRAININGS, STAFF_PROFILES } from '@/src/mockData/staff';
import { Users, AlertTriangle } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'profiles', label: 'Hồ sơ' },
  { id: 'shifts', label: 'Phân ca' },
  { id: 'attendance', label: 'Chấm công' },
  { id: 'tasks', label: 'Nhiệm vụ' },
  { id: 'performance', label: 'Đánh giá' },
  { id: 'training', label: 'Đào tạo' },
  { id: 'disciplinary', label: 'K.Thưởng/Vi phạm' },
  { id: 'contractors', label: 'Nhà thầu' },
  { id: 'reports', label: 'Báo cáo' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Alert counts
  const absentNoSub = SHIFT_ASSIGNMENTS.filter(s => s.status === 'Vắng mặt' && !s.substitute).length;
  const overdueTasks = STAFF_TASKS.filter(t => t.status === 'Quá hạn').length;
  const incompleteTraining = STAFF_PROFILES.filter(
    p => MANDATORY_TRAININGS.some(tid => !p.trainingCompleted.includes(tid))
  ).length;
  const totalAlerts = absentNoSub + overdueTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Nhân Sự Dịch Vụ
            </h2>
            {totalAlerts > 0 && (
              <div className="flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-300 rounded-full px-2.5 py-0.5 text-xs font-semibold animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                {absentNoSub > 0 && `${absentNoSub} ca thiếu người thay`}
                {absentNoSub > 0 && overdueTasks > 0 && ' · '}
                {overdueTasks > 0 && `${overdueTasks} nhiệm vụ quá hạn`}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý đội ngũ bảo vệ, vệ sinh, bếp ăn, y tế, xe đưa đón, kỹ thuật và nhà thầu dịch vụ.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{STAFF_KPI.onDutyToday}</strong>/{STAFF_KPI.total} đang làm
          </span>
          {incompleteTraining > 0 && (
            <>
              <span>·</span>
              <span className="text-amber-600 font-medium">{incompleteTraining} chưa đào tạo</span>
            </>
          )}
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
                  {tab.id === 'shifts' && absentNoSub > 0 && (
                    <span className="bg-red-500 text-white rounded-full text-[10px] h-4 w-4 flex items-center justify-center shrink-0">{absentNoSub}</span>
                  )}
                  {tab.id === 'tasks' && overdueTasks > 0 && (
                    <span className="bg-orange-500 text-white rounded-full text-[10px] h-4 w-4 flex items-center justify-center shrink-0">{overdueTasks}</span>
                  )}
                  {tab.id === 'training' && incompleteTraining > 0 && (
                    <span className="bg-amber-500 text-white rounded-full text-[10px] h-4 w-4 flex items-center justify-center shrink-0">{incompleteTraining}</span>
                  )}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="dashboard" activeValue={activeTab} className="border-none p-0 outline-none"><DashboardTab /></TabsContent>
        <TabsContent value="profiles" activeValue={activeTab} className="border-none p-0 outline-none"><ProfilesTab /></TabsContent>
        <TabsContent value="shifts" activeValue={activeTab} className="border-none p-0 outline-none"><ShiftsTab /></TabsContent>
        <TabsContent value="attendance" activeValue={activeTab} className="border-none p-0 outline-none"><AttendanceTab /></TabsContent>
        <TabsContent value="tasks" activeValue={activeTab} className="border-none p-0 outline-none"><TasksTab /></TabsContent>
        <TabsContent value="performance" activeValue={activeTab} className="border-none p-0 outline-none"><PerformanceTab /></TabsContent>
        <TabsContent value="training" activeValue={activeTab} className="border-none p-0 outline-none"><TrainingTab /></TabsContent>
        <TabsContent value="disciplinary" activeValue={activeTab} className="border-none p-0 outline-none"><DisciplinaryTab /></TabsContent>
        <TabsContent value="contractors" activeValue={activeTab} className="border-none p-0 outline-none"><ContractorsTab /></TabsContent>
        <TabsContent value="reports" activeValue={activeTab} className="border-none p-0 outline-none"><ReportsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
