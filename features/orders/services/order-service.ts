import { getMockOrdersCollection } from '@/mock/orders-generator';
import { Order, OrderFilters, OrderStats } from '@/types/orders';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  filteredStats: OrderStats;
}

export async function fetchOrders(filters: OrderFilters): Promise<PaginatedResult<Order>> {
  // Simulate network roundtrip latency
  await new Promise((resolve) => setTimeout(resolve, 450));

  // Simulation of intermittent API infrastructure failures (uncomment for verification tests)
  // if (Math.random() < 0.02) throw new Error("Internal Service Gateway Timeout (504)");

  let source = [...getMockOrdersCollection()];

  // 1. Evaluate Complex Date Filtering Criteria
  if (filters.dateRange !== 'all') {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.dateRange, 10));
    source = source.filter((o) => new Date(o.createdAt) >= cutoffDate);
  }

  // 2. Query Search Criteria Across Fields
  if (filters.search) {
    const query = filters.search.toLowerCase().trim();
    source = source.filter(
      (o) => o.customerName.toLowerCase().includes(query) || o.email.toLowerCase().includes(query)
    );
  }

  // 3. Multi-Select Status Intersection Vector
  if (filters.status && filters.status.length > 0) {
    source = source.filter((o) => filters.status.includes(o.status));
  }

  // 4. Evaluation of Priority Field
  if (filters.priority && filters.priority !== 'all') {
    source = source.filter((o) => o.priority === filters.priority);
  }

  // 5. Dynamic Calculations for Context Metrics Dashboard Summary
  const stats: OrderStats = { total: 0, pending: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0 };
  source.forEach((order) => {
    stats.total++;
    if (order.status in stats) {
      stats[order.status]++;
    }
  });

  // 6. Sorting Operations
  source.sort((a, b) => {
    let comparativeResult = 0;
    if (filters.sortBy === 'createdAt') {
      comparativeResult = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (filters.sortBy === 'totalAmount') {
      comparativeResult = a.totalAmount - b.totalAmount;
    }
    return filters.sortOrder === 'asc' ? comparativeResult : -comparativeResult;
  });

  // 7. Extract Specific Segment Window (Pagination)
  const limit = 20;
  const offset = (filters.page - 1) * limit;
  const segmentedData = source.slice(offset, offset + limit);

  return {
    data: segmentedData,
    totalCount: source.length,
    filteredStats: stats,
  };
}