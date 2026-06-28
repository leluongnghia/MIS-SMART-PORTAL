import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/libs/I18n.ts');

const nextConfig: any = {
  devIndicators: {
    position: 'bottom-right',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['@electric-sql/pglite'],
  transpilePackages: ['recharts', 'lucide-react', 'motion'],
};

export default withNextIntl(nextConfig);
