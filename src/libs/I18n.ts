import { getRequestConfig } from 'next-intl/server';

export const locales = ['vi', 'en'] as const;
export const defaultLocale = 'vi';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested as typeof locales[number])
    ? requested as typeof locales[number]
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
