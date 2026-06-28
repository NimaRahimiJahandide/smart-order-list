import { NextRequest, NextResponse } from 'next/server';
import { getMockOrdersCollection } from '@/mock/orders-generator';
import { OrderFilters, OrderStats, OrderStatus } from '@/types/orders';
import { ORDER_STATUSES, ORDER_PRIORITIES, ITEMS_PER_PAGE } from '@/constants/orders';
import { PaginatedResult } from '@/types/orders-api';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams;

  const pageRaw = parseInt(sp.get('page') ?? '1', 10);
  const page    = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  const search      = (sp.get('search') ?? '').trim();
  const statusRaw   = sp.get('status') ?? '';
  const priorityRaw = sp.get('priority') ?? 'all';
  const dateRange   = sp.get('dateRange') ?? 'all';
  const dateFrom    = sp.get('dateFrom') ?? '';
  const dateTo      = sp.get('dateTo') ?? '';
  const sortByRaw   = sp.get('sortBy') ?? 'createdAt';
  const sortOrderRaw = sp.get('sortOrder') ?? 'desc';

  const status = statusRaw
    ? (statusRaw.split(',').filter((s) =>
        ORDER_STATUSES.includes(s as OrderStatus),
      ) as OrderStatus[])
    : [];

  const priority = ORDER_PRIORITIES.includes(priorityRaw as never) ? priorityRaw : 'all';
  const sortBy   = ['createdAt', 'totalAmount'].includes(sortByRaw)
    ? (sortByRaw as OrderFilters['sortBy'])
    : 'createdAt';
  const sortOrder = sortOrderRaw === 'asc' ? 'asc' : ('desc' as const);

  // Simulate ~80ms server latency
  await new Promise((r) => setTimeout(r, 1000));

  let source = [...getMockOrdersCollection()];

  // 1. Date range
  if (dateRange === 'custom') {
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      source = source.filter((o) => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      source = source.filter((o) => new Date(o.createdAt) <= to);
    }
  } else if (dateRange !== 'all') {
    const days = parseInt(dateRange, 10);
    if (!isNaN(days)) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      source = source.filter((o) => new Date(o.createdAt) >= cutoff);
    }
  }

  // 2. Search
  if (search) {
    const q = search.toLowerCase();
    source = source.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q),
    );
  }

  // 3. Status
  if (status.length > 0) source = source.filter((o) => status.includes(o.status));

  // 4. Priority
  if (priority !== 'all') source = source.filter((o) => o.priority === priority);

  // 5. Stats
  const filteredStats: OrderStats = {
    total: 0, pending: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0,
  };
  for (const o of source) { filteredStats.total++; filteredStats[o.status]++; }

  // 6. Sort
  source.sort((a, b) => {
    const diff = sortBy === 'totalAmount'
      ? a.totalAmount - b.totalAmount
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? diff : -diff;
  });

  // 7. Paginate
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const data   = source.slice(offset, offset + ITEMS_PER_PAGE);

  return NextResponse.json({ data, totalCount: source.length, filteredStats } satisfies PaginatedResult);
}