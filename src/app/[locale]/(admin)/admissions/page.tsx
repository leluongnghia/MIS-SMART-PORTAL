import { redirect } from 'next/navigation';

export default async function AdmissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}?tab=CRM_ADMISSIONS`);
}
