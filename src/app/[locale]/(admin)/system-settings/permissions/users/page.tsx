import { renderUsersPage } from '../../../users/render-users-page';

export default async function PermissionUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return renderUsersPage(locale);
}
