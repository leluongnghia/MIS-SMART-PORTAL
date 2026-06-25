import DashboardClient from './DashboardClient';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import { getServiceTickets } from './actions';

export default async function DashboardServicesPage() {
  const user = await getCurrentActor();
  if (!user) {
    redirect('/vi/sign-in');
  }

  const isManager = user.role === 'SCHOOL_SERVICE_OPERATIONS_MANAGER';
  const isSchoolServiceStaff = user.role === 'SCHOOL_SERVICE_STAFF';
  const departmentScope = isSchoolServiceStaff ? user.departmentScope : undefined;

  const rawTickets = await getServiceTickets({ departmentScope });

  const tickets = rawTickets.map(t => ({
    id: t.id,
    code: t.code || t.id.substring(0, 8),
    title: t.title,
    category: t.serviceGroup,
    priority: t.priority,
    status: t.status,
    createdBy: t.reportedBy || 'Unknown',
    createdAt: t.createdAt.toISOString(),
  }));

  return <DashboardClient tickets={tickets} isManager={isManager} />;
}
