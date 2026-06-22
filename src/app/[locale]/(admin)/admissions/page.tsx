import AdmissionsEnterpriseDashboard, { type AdmissionsModule } from '@/src/components/AdmissionsEnterpriseDashboard';
import { getLeads, getUsers } from '../leads/actions';

const viewToModule = (view?: string): AdmissionsModule => {
  const allowed: AdmissionsModule[] = [
    'dashboard',
    'leads',
    'pipeline',
    'lead_detail',
    'appointments',
    'documents',
    'payments',
    'reports',
    'campaigns',
    'settings',
    'applications',
    'interviews',
    'enrollment',
    'classes',
    'scholarships',
    'email',
    'tasks',
  ];
  return allowed.includes(view as AdmissionsModule) ? (view as AdmissionsModule) : 'dashboard';
};

export default async function AdmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    view?: string;
    search?: string;
    status?: string;
    source?: string;
    grade?: string;
    page?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const filters = {
    search: resolvedSearchParams?.search || '',
    status: resolvedSearchParams?.status || 'all',
    source: resolvedSearchParams?.source || 'all',
    grade: resolvedSearchParams?.grade || 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    page: Number(resolvedSearchParams?.page) || 1,
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
    <AdmissionsEnterpriseDashboard 
      activeModule={viewToModule(resolvedSearchParams?.view)} 
      initialData={initialData}
      users={users}
      filters={filters}
    />
  );
}
