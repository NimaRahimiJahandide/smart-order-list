import React from 'react';
import { ToastProvider } from '@/components/ui/toast';
import '@/styles/globals.css'; // Standard Tailwind Ingestion Point

export const metadata = {
  title: 'Enterprise Orders Control Board System',
  description: 'Production scalable internal control interface infrastructure tracking mechanisms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <body className="antialiased min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}