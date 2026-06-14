import { getPayments, getLeadsForPayment } from './actions';
import PaymentsClient from './payments-client';

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Fetch active payments and leads lists
  const paymentData = await getPayments();
  const leadsData = await getLeadsForPayment();

  return (
    <PaymentsClient
      locale={locale}
      initialPayments={paymentData as any}
      leads={leadsData as any}
    />
  );
}
