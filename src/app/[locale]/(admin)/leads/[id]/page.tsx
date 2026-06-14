import { notFound } from 'next/navigation';
import { getLeadDetail } from './actions';
import LeadDetailClient from './lead-detail-client';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const data = await getLeadDetail(id);

  if (!data) {
    notFound();
  }

  return (
    <LeadDetailClient
      locale={locale}
      lead={data.lead as any}
      activities={data.activities as any}
      pipeline={data.pipeline as any}
      payments={data.payments as any}
      documents={data.documents as any}
    />
  );
}
