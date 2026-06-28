import { renderUsersPage } from './render-users-page';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function UsersLegacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return renderUsersPage(locale);
}
