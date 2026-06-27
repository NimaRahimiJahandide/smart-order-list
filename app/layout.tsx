import React from 'react';
import { ToastProvider } from '@/components/ui/toast';
import '@/styles/globals.css';

export const metadata = {
  title: 'داشبورد مدیریت سفارشات',
  description: 'سامانه مدیریت و ردیابی سفارشات سازمانی',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}