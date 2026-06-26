import { renderUsersPage } from './render-users-page';

export default async function UsersLegacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return renderUsersPage(locale);
}
