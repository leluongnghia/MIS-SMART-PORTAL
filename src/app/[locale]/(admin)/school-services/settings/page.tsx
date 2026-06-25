'use client';

import React, { useState } from 'react';
import { Settings, Users, ShieldCheck, Utensils, Bus } from 'lucide-react';
import GeneralSettingsTab from './components/GeneralSettingsTab';
import PermissionsTab from './components/PermissionsTab';
import ApprovalWorkflowsTab from './components/ApprovalWorkflowsTab';
import MealsTab from './components/MealsTab';
import TransportTab from './components/TransportTab';
import { useToast } from '@/src/components/ui/Toast';

export default function ServiceSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();

  const menuItems = [
    { id: 'general', label: 'Cấu hình chung', icon: Settings },
    { id: 'permissions', label: 'Phân công Nhân sự Dịch vụ', icon: Users },
    { id: 'workflows', label: 'Quy trình Phê duyệt', icon: ShieldCheck },
    { id: 'meals', label: 'Tham số Bếp ăn', icon: Utensils },
    { id: 'transport', label: 'Tham số Xe đưa đón', icon: Bus },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettingsTab />;
      case 'permissions':
        return <PermissionsTab />;
      case 'workflows':
        return <ApprovalWorkflowsTab />;
      case 'meals':
        return <MealsTab />;
      case 'transport':
        return <TransportTab />;
      default:
        return <GeneralSettingsTab />;
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Cấu Hình Dịch Vụ</h1>
          <p className="text-sm text-slate-500 mt-1">
            Trung tâm điều hành và thiết lập tham số cho các dịch vụ trường học.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* Sidebar Menu */}
        <div className="md:col-span-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 min-h-[600px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
