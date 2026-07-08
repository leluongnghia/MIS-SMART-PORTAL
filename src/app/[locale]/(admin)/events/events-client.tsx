'use client';

import EventManagement from '@/src/components/EventManagement';
import { createEvent, updateEventStatus, updateEventChecklist, submitPostEventReport, deleteEvent } from './actions';
import { createCampaign, updateCampaignStatus, updateCampaignSchedule, updateCampaignMetrics } from './communication-actions';
import { submitForApproval, processApproval, getApprovalHistory } from './approval-actions';

export default function EventsClient({ initialData }: any) {
  return (
    <EventManagement 
      initialData={initialData} 
      actions={{ 
        createEvent, updateEventStatus, updateEventChecklist, submitPostEventReport, deleteEvent,
        createCampaign, updateCampaignStatus, updateCampaignSchedule, updateCampaignMetrics,
        submitForApproval, processApproval, getApprovalHistory
      }} 
    />
  );
}
