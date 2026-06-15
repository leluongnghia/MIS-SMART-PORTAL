'use client';

import { useParams, useRouter } from 'next/navigation';
import SystemSettingsModal from '@/src/components/SystemSettingsModal';

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'vi';

  return (
    <div className="w-full h-full">
      <SystemSettingsModal onClose={() => router.push(`/${locale}/dashboard`)} />
    </div>
  );
}
