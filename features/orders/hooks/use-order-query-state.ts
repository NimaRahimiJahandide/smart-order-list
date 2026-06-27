'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { OrderFilters, OrderStatus, OrderPriority, DateFilterOption } from '@/types/orders';

export function useOrderQueryState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: OrderFilters = useMemo(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const priority = (searchParams.get('priority') || 'all') as OrderPriority | 'all';
    const dateRange = (searchParams.get('date') || 'all') as DateFilterOption;
    
    const sortRaw = searchParams.get('sort') || 'createdAt-desc';
    const [sortBy, sortOrder] = sortRaw.split('-') as [ 'createdAt' | 'totalAmount', 'asc' | 'desc' ];

    const statusRaw = searchParams.get('status');
    const status: OrderStatus[] = statusRaw ? (statusRaw.split(',') as OrderStatus[]) : [];

    return {
      page: isNaN(page) ? 1 : page,
      search,
      status,
      priority,
      dateRange,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    };
  }, [searchParams]);

  const setFilters = useCallback((updater: Partial<OrderFilters> | ((prev: OrderFilters) => Partial<OrderFilters>)) => {
    const currentParams = new URLSearchParams(window.location.search);
    const nextFilters = typeof updater === 'function' ? updater(filters) : updater;
    
    const merged = { ...filters, ...nextFilters };

    // Page updates
    if (merged.page && merged.page > 1) currentParams.set('page', merged.page.toString());
    else currentParams.delete('page');

    // Search updates
    if (merged.search) currentParams.set('search', merged.search);
    else currentParams.delete('search');

    // Status multi-select updates
    if (merged.status && merged.status.length > 0) currentParams.set('status', merged.status.join(','));
    else currentParams.delete('status');

    // Priority updates
    if (merged.priority && merged.priority !== 'all') currentParams.set('priority', merged.priority);
    else currentParams.delete('priority');

    // Date range updates
    if (merged.dateRange && merged.dateRange !== 'all') currentParams.set('date', merged.dateRange);
    else currentParams.delete('date');

    // Sorting updates
    if (merged.sortBy && merged.sortOrder) {
      currentParams.set('sort', `${merged.sortBy}-${merged.sortOrder}`);
    }

    router.push(`?${currentParams.toString()}`, { scroll: false });
  }, [filters, router]);

  const resetFilters = useCallback(() => {
    router.push('?', { scroll: false });
  }, [router]);

  return { filters, setFilters, resetFilters };
}