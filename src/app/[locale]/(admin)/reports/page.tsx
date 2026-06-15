import ReportsClient from './reports-client';

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Use mock data for BGH reports instead of DB call
  const mockData = {
    leadsBySource: [{name: 'Facebook', value: 120}, {name: 'Google', value: 80}],
    leadsByStatus: [{name: 'Đã nhập học', value: 50}],
    conversionFunnel: [{name: '1. Tiếp nhận Data', count: 200}],
    revenueByPaymentType: [{name: 'Học phí', value: 500000000}],
    enrollmentByGrade: [{name: 'Khối 10', value: 40}]
  };

  return <ReportsClient locale={locale} data={mockData as any} />;
}
