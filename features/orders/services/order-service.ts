import { OrderFilters } from '@/types/orders';
import { PaginatedResult } from '@/types/orders-api';

export type { PaginatedResult };

export async function fetchOrders(
  filters: OrderFilters,
  signal?: AbortSignal,
): Promise<PaginatedResult> {
  const params = new URLSearchParams();

  params.set('page',      String(filters.page));
  params.set('sortBy',    filters.sortBy);
  params.set('sortOrder', filters.sortOrder);

  if (filters.search)              params.set('search',    filters.search);
  if (filters.status.length > 0)   params.set('status',    filters.status.join(','));
  if (filters.priority !== 'all')  params.set('priority',  filters.priority);
  if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
  if (filters.customDateFrom)      params.set('dateFrom',  filters.customDateFrom);
  if (filters.customDateTo)        params.set('dateTo',    filters.customDateTo);
  const url = `/api/orders?${params.toString()}`;

  const res = await fetch(url, { signal });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `خطای سرور: ${res.status}`);
  }

  return res.json() as Promise<PaginatedResult>;
}