import React from 'react';
import { OrderStats } from '@/types/orders';
import { ClipboardList, AlertCircle, CheckCircle, Truck, PackageCheck, XCircle } from 'lucide-react';

interface StatsProps {
  stats: OrderStats;
  isLoading: boolean;
}

export const DashboardStats: React.FC<StatsProps> = React.memo(({ stats, isLoading }) => {
  const items = [
    { label: 'Total Orders', count: stats.total, icon: ClipboardList, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50' },
    { label: 'Pending', count: stats.pending, icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Paid', count: stats.paid, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Shipped', count: stats.shipped, icon: Truck, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Delivered', count: stats.delivered, icon: PackageCheck, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Cancelled', count: stats.cancelled, icon: XCircle, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">{item.label}</span>
            <item.icon className={`h-5 w-5 rounded-md p-0.5 ${item.color}`} />
          </div>
          <div className="mt-2 flex items-baseline">
            {isLoading ? (
              <div className="h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            ) : (
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{item.count}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';