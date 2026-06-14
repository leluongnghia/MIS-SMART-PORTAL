import { getAdmissionsData } from './actions';
import KanbanClient from './kanban-client';

export default async function AdmissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = await getAdmissionsData();

  return (
    <KanbanClient
      locale={locale}
      initialLeads={data.leads as any}
      users={data.users as any}
      activities={data.activities as any}
    />
  );
}
