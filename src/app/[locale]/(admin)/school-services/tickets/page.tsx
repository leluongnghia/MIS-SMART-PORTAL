import { getServiceTickets } from '../actions';
import TicketClient from './TicketClient';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';

export default async function TicketsPage() {
  const user = await getCurrentActor();
  if (!user) {
    redirect('/vi/sign-in');
  }

  // Nếu là STAFF dịch vụ học đường, tự động lọc theo scope của họ
  const isSchoolServiceStaff = user.role === 'SCHOOL_SERVICE_STAFF';
  const departmentScope = isSchoolServiceStaff ? user.departmentScope : undefined;

  const rawTickets = await getServiceTickets({ departmentScope });

  // Map to format matching TicketClient
  const tickets = rawTickets.map(t => ({
    id: t.id,
    code: t.code || t.id.substring(0, 8),
    title: t.title,
    category: t.serviceGroup, // e.g. transport, facility
    priority: t.priority,
    status: t.status,
    createdBy: t.reportedBy || 'Unknown',
    createdAt: t.createdAt.toISOString(),
  }));

  return <TicketClient initialTickets={tickets} userRole={user.role} />;
}
