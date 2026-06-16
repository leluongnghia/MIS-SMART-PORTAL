'use client';

import type { ReactNode } from 'react';
import { LanguageProvider } from '../../context/LanguageContext';
import AppErrorBoundary from '../../components/AppErrorBoundary';
import { ToastProvider } from '../../components/ui/Toast';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}
