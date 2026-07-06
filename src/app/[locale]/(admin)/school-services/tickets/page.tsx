import { getServiceTickets } from '../actions';
import ServiceTicketCenter from './ServiceTicketCenter';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';

export default async function TicketsPage() {
  const user = await getCurrentActor();
  if (!user) redirect('/vi/sign-in');

  const isStaff = user.role === 'SCHOOL_SERVICE_STAFF';
  const departmentScope = isStaff ? user.departmentScope : undefined;

  const rawTickets = await getServiceTickets({ departmentScope });

  const tickets = rawTickets.map(t => ({
    id: t.id,
    code: (t as any).code || t.id.substring(0, 8),
    title: t.title,
    description: (t as any).description || '',
    serviceGroup: t.serviceGroup,
    senderName: (t as any).reportedBy || (t as any).reportedByName || 'N/A',
    senderRole: (t as any).senderRole || 'staff',
    studentName: (t as any).studentName || null,
    classOrDept: (t as any).classOrDept || '',
    priority: t.priority,
    status: t.status,
    assignedTo: (t as any).assignedTo || null,
    desiredDeadline: (t as any).desiredDeadline || null,
    slaDeadline: (t as any).slaDeadline || null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: (t.updatedAt || t.createdAt).toISOString(),
  }));

  return <ServiceTicketCenter initialTickets={tickets} />;
}

