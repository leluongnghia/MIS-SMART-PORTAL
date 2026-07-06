import React from 'react';
import { EnvironmentClient } from './environment-client';
import { 
  ENVIRONMENT_AREAS, 
  CLEANING_SCHEDULES, 
  ENVIRONMENT_REPORTS, 
  CLEANING_CHECKLISTS, 
  ENVIRONMENT_STATS 
} from '@/mockData/environment';
import { PageHeader } from '@/components/page-header';

export default function EnvironmentPage() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6 w-full max-w-7xl mx-auto">
      <PageHeader
        title="Vệ sinh & Môi trường"
        description="Quản lý công tác vệ sinh, lịch dọn dẹp, checklist kiểm tra và phản ánh môi trường."
      />
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
