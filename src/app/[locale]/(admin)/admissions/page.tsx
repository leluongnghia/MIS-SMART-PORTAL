import AdmissionsEnterpriseDashboard, { type AdmissionsModule } from '@/src/components/AdmissionsEnterpriseDashboard';

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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ view?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return <AdmissionsEnterpriseDashboard activeModule={viewToModule(resolvedSearchParams?.view)} />;
}
