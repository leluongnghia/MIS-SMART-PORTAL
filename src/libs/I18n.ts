import { getRequestConfig } from 'next-intl/server';
import { translations } from '../utils/translations';

export const locales = ['vi', 'en'] as const;
export const defaultLocale = 'vi';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested as typeof locales[number])
    ? requested as typeof locales[number]
    : defaultLocale;

  const jsonMessages = (await import(`../locales/${locale}.json`)).default;
  const tsMessages = translations[locale] || {};

  return {
    locale,
    messages: {
      ...tsMessages,
      ...jsonMessages,
    },
  };
});
