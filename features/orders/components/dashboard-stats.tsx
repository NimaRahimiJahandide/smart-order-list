import React from 'react';
import { OrderStats } from '@/types/orders';

interface StatsProps {
  stats: OrderStats;
  isLoading: boolean;
  shrunk?: boolean;
}

const ClipboardListSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4"/><path d="M12 16h4"/>
    <path d="M8 11h.01"/><path d="M8 16h.01"/>
  </svg>
);
const AlertCircleSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);
const CheckCircleSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const TruckSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10"/>
    <path d="m19 10 3 3v3a2 2 0 0 1-2 2h-2"/>
    <circle cx="7" cy="18" r="2"/>
    <circle cx="17" cy="18" r="2"/>
  </svg>
);
const PackageCheckSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 2 2 4-4"/>
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/>
    <path d="M12 22V12"/><path d="m21.6 7-9.6 5.5L2.4 7"/><path d="m12 12-8.4-4.9"/>
  </svg>
);
const XCircleSVG = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);

const LABELS = {
  total: 'کل سفارش‌ها',
  pending: 'در انتظار',
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
} as const;

export const DashboardStats: React.FC<StatsProps> = React.memo(({ stats, isLoading, shrunk = false }) => {
  const items = [
    { label: LABELS.total,     count: stats.total,     icon: ClipboardListSVG, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50' },
    { label: LABELS.pending,   count: stats.pending,   icon: AlertCircleSVG,   color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' },
    { label: LABELS.paid,      count: stats.paid,      icon: CheckCircleSVG,   color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: LABELS.shipped,   count: stats.shipped,   icon: TruckSVG,         color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' },
    { label: LABELS.delivered, count: stats.delivered, icon: PackageCheckSVG,  color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
    { label: LABELS.cancelled, count: stats.cancelled, icon: XCircleSVG,       color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30' },
  ];

  return (
    <div
      className={[
        'grid grid-cols-3 gap-2 sm:grid-cols-6',
        'transition-all duration-500 ease-in-out',
        shrunk ? 'gap-1.5' : 'gap-4',
      ].join(' ')}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={[
            'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
            'transition-all duration-500 ease-in-out overflow-hidden',
            shrunk ? 'p-2' : 'p-4',
          ].join(' ')}
        >
          <div className={[
            'flex items-center transition-all duration-500',
            shrunk ? 'justify-between gap-1' : 'justify-between',
          ].join(' ')}>
            <span className={[
              'font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase truncate',
              'transition-all duration-500',
              shrunk ? 'text-[9px]' : 'text-xs',
            ].join(' ')}>
              {item.label}
            </span>
            <item.icon className={[
              'rounded-md flex-shrink-0 transition-all duration-500',
              shrunk ? 'h-3.5 w-3.5 p-0' : 'h-5 w-5 p-0.5',
              item.color,
            ].join(' ')} />
          </div>

          <div className={[
            'flex items-baseline transition-all duration-500',
            shrunk ? 'mt-0.5' : 'mt-2',
          ].join(' ')}>
            {isLoading ? (
              <div className={[
                'animate-pulse rounded bg-slate-200 dark:bg-slate-800 transition-all duration-500',
                shrunk ? 'h-4 w-10' : 'h-7 w-16',
              ].join(' ')} />
            ) : (
              <span className={[
                'font-bold tracking-tight text-slate-900 dark:text-white',
                'transition-all duration-500',
                shrunk ? 'text-base' : 'text-2xl',
              ].join(' ')}>
                {item.count}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';