'use client';

import React, { useState } from 'react';
import { Calendar, Building2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import MeetingDashboard from './MeetingDashboard';
import RoomBookingManager from './RoomBookingManager';

const TABS = [
  { id: 'dashboard', label: 'Dashboard lịch họp', icon: Calendar },
  { id: 'rooms',     label: 'Đặt phòng họp',       icon: Building2 },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function MeetingsModuleClient() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="space-y-5">
      {/* Tab nav */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'dashboard' && <MeetingDashboard />}
      {activeTab === 'rooms'     && <RoomBookingManager />}
    </div>
  );
}
