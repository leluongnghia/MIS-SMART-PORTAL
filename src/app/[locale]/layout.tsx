import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ClerkProvider } from '@clerk/nextjs';
import { viVN, enUS } from '@clerk/localizations';
import '../../index.css';
import AppProviders from './providers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'MIS Smart Portal',
  description: 'Cổng quản trị MIS Smart Portal',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const clerkLocalization = locale === 'vi' ? viVN : enUS;
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const content = (
    <NextIntlClientProvider messages={messages}>
      <AppProviders>{children}</AppProviders>
    </NextIntlClientProvider>
  );

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {hasClerkKey ? (
          <ClerkProvider localization={clerkLocalization}>
            {content}
          </ClerkProvider>
        ) : content}
      </body>
    </html>
  );
}
