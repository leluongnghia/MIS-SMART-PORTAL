import React from 'react';
import { EnvironmentClient } from './environment-client';
import { 
  ENVIRONMENT_AREAS, 
  CLEANING_SCHEDULES, 
  ENVIRONMENT_REPORTS, 
  CLEANING_CHECKLISTS, 
  ENVIRONMENT_STATS 
} from '@/src/mockData/environment';

export const metadata = { title: 'Vệ sinh / Môi trường – MIS Portal' };

export default function EnvironmentPage() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6 w-full max-w-7xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Vệ sinh & Môi trường</h1>
        <p className="text-muted-foreground text-sm">Quản lý công tác vệ sinh, lịch dọn dẹp, checklist kiểm tra và phản ánh môi trường.</p>
      </div>
      <EnvironmentClient 
        initialAreas={ENVIRONMENT_AREAS}
        initialSchedules={CLEANING_SCHEDULES}
        initialReports={ENVIRONMENT_REPORTS}
        initialChecklists={CLEANING_CHECKLISTS}
        initialStats={ENVIRONMENT_STATS}
      />
    </div>
  );
}
