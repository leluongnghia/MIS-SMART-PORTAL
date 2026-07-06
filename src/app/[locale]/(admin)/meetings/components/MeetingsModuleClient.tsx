'use client';

import React, { useState } from 'react';
import { Calendar, Building2, Users, FileText, Shield, Bell } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import MeetingDashboard from './MeetingDashboard';
import RoomBookingManager from './RoomBookingManager';
import ParticipantManager from './ParticipantManager';
import MinutesManager from './MinutesManager';
import MeetingSettingsPanel from './MeetingSettingsPanel';
import MeetingReportsPanel from './MeetingReportsPanel';

const TABS = [
  { id: 'dashboard',    label: 'Dashboard',            icon: Calendar  },
  { id: 'rooms',        label: 'Đặt phòng',             icon: Building2 },
  { id: 'participants', label: 'Người tham gia',        icon: Users     },
  { id: 'minutes',      label: 'Biên bản',              icon: FileText  },
  { id: 'reports',      label: 'Thông báo & Báo cáo',   icon: Bell      },
  { id: 'settings',     label: 'Phân quyền',            icon: Shield    },
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
                'flex items-center gap-2 flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'dashboard'    && <MeetingDashboard />}
      {activeTab === 'rooms'        && <RoomBookingManager />}
      {activeTab === 'participants' && <ParticipantManager />}
      {activeTab === 'minutes'      && <MinutesManager />}
      {activeTab === 'reports'      && <MeetingReportsPanel />}
      {activeTab === 'settings'     && <MeetingSettingsPanel />}
    </div>
  );
}
