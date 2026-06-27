import { getMockOrdersCollection } from '@/mock/orders-generator';
import { Order, OrderFilters, OrderStats } from '@/types/orders';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  filteredStats: OrderStats;
}

export async function fetchOrders(
  filters: OrderFilters,
  signal?: AbortSignal,
): Promise<PaginatedResult<Order>> {
  // Simulate network latency
  await new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, 450);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

  let source = [...getMockOrdersCollection()];

  // 1. Date range filter
  if (filters.dateRange === 'custom') {
    if (filters.customDateFrom) {
      const from = new Date(filters.customDateFrom);
      from.setHours(0, 0, 0, 0);
      source = source.filter((o) => new Date(o.createdAt) >= from);
    }
    if (filters.customDateTo) {
      const to = new Date(filters.customDateTo);
      to.setHours(23, 59, 59, 999);
      source = source.filter((o) => new Date(o.createdAt) <= to);
    }
  } else if (filters.dateRange !== 'all') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(filters.dateRange, 10));
    source = source.filter((o) => new Date(o.createdAt) >= cutoff);
  }

  // 2. Free-text search
  if (filters.search.trim()) {
    const query = filters.search.toLowerCase().trim();
    source = source.filter(
      (o) =>
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query),
    );
  }

  // 3. Multi-select status filter
  if (filters.status.length > 0) {
    source = source.filter((o) => filters.status.includes(o.status));
  }

  // 4. Priority filter
  if (filters.priority !== 'all') {
    source = source.filter((o) => o.priority === filters.priority);
  }

  // 5. Compute stats AFTER filtering (before sort/paginate)
  const filteredStats: OrderStats = {
    total: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of source) {
    filteredStats.total++;
    filteredStats[order.status]++;
  }

  // 6. Sort
  source.sort((a, b) => {
    const result =
      filters.sortBy === 'totalAmount'
        ? a.totalAmount - b.totalAmount
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return filters.sortOrder === 'asc' ? result : -result;
  });

  // 7. Paginate
  const offset = (filters.page - 1) * 20;
  const data   = source.slice(offset, offset + 20);

  return { data, totalCount: source.length, filteredStats };
}