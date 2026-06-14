import { getLeads, getUsers } from './actions';
import LeadsClient from './leads-client';

export default async function LeadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    source?: string;
    grade?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  const filters = {
    search: resolvedSearchParams.search || '',
    status: resolvedSearchParams.status || 'all',
    source: resolvedSearchParams.source || 'all',
    grade: resolvedSearchParams.grade || 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    page: Number(resolvedSearchParams.page) || 1,
  };

  const initialData = await getLeads({
    ...filters,
    limit: 10,
  });

  const dbUsers = await getUsers();
  const users = dbUsers.map(u => ({
    id: u.id,
    name: u.name,
  }));

  return (
    <LeadsClient
      locale={locale}
      initialData={initialData}
      users={users}
      filters={filters}
    />
  );
}
