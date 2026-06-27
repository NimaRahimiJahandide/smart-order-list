'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  OrderFilters,
  OrderStatus,
  OrderPriority,
  DateFilterOption,
} from '@/types/orders';
import { ORDER_STATUSES, ORDER_PRIORITIES } from '@/constants/orders';

const VALID_SORT_FIELDS  = ['createdAt', 'totalAmount'] as const;
const VALID_SORT_ORDERS  = ['asc', 'desc'] as const;
const VALID_DATE_RANGES  = ['7', '30', 'all'] as const;

type SortField = (typeof VALID_SORT_FIELDS)[number];
type SortOrder = (typeof VALID_SORT_ORDERS)[number];

function parseSortField(raw: string | null): SortField {
  const [field] = (raw ?? '').split('-');
  return VALID_SORT_FIELDS.includes(field as SortField)
    ? (field as SortField)
    : 'createdAt';
}

function parseSortOrder(raw: string | null): SortOrder {
  const [, order] = (raw ?? '').split('-');
  return VALID_SORT_ORDERS.includes(order as SortOrder)
    ? (order as SortOrder)
    : 'desc';
}

export function useOrderQueryState() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const filters: OrderFilters = useMemo(() => {
    const pageRaw   = parseInt(searchParams.get('page') ?? '1', 10);
    const search    = searchParams.get('search') ?? '';
    const sortRaw   = searchParams.get('sort');
    const statusRaw = searchParams.get('status');
    const dateRaw   = (searchParams.get('date') ?? 'all') as DateFilterOption;
    const prioRaw   = (searchParams.get('priority') ?? 'all') as OrderPriority | 'all';

    const status: OrderStatus[] = statusRaw
      ? (statusRaw.split(',').filter((s) =>
          ORDER_STATUSES.includes(s as OrderStatus),
        ) as OrderStatus[])
      : [];

    const priority =
      prioRaw !== 'all' && ORDER_PRIORITIES.includes(prioRaw as OrderPriority)
        ? (prioRaw as OrderPriority)
        : 'all';

    const dateRange = VALID_DATE_RANGES.includes(dateRaw as typeof VALID_DATE_RANGES[number])
      ? dateRaw
      : 'all';

    return {
      page:      isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw,
      search,
      status,
      priority,
      dateRange,
      sortBy:    parseSortField(sortRaw),
      sortOrder: parseSortOrder(sortRaw),
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (
      updater:
        | Partial<OrderFilters>
        | ((prev: OrderFilters) => Partial<OrderFilters>),
    ) => {
      const next =
        typeof updater === 'function' ? updater(filters) : updater;
      const merged = { ...filters, ...next };

      const params = new URLSearchParams();

      if (merged.page > 1)            params.set('page', String(merged.page));
      if (merged.search)              params.set('search', merged.search);
      if (merged.status.length > 0)   params.set('status', merged.status.join(','));
      if (merged.priority !== 'all')  params.set('priority', merged.priority);
      if (merged.dateRange !== 'all') params.set('date', merged.dateRange);

      params.set('sort', `${merged.sortBy}-${merged.sortOrder}`);

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [filters, router],
  );

  const resetFilters = useCallback(() => {
    router.push('?', { scroll: false });
  }, [router]);

  return { filters, setFilters, resetFilters };
}