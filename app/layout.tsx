import React from 'react';
import { ToastProvider } from '@/components/ui/toast';
import '@/styles/globals.css'; // Standard Tailwind Ingestion Point

export const metadata = {
  title: 'داشبورد کنترل سفارشات سازمانی',
  description: 'زیرساخت مقیاس‌پذیر تولید برای مدیریت و ردیابی سیستم‌های کنترل داخلی سازمانی.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}