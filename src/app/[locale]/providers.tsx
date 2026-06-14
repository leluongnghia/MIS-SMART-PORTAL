'use client';

import type { ReactNode } from 'react';
import { LanguageProvider } from '../../context/LanguageContext';
import AppErrorBoundary from '../../components/AppErrorBoundary';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AppErrorBoundary>
  );
}
