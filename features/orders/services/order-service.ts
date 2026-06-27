import { getMockOrdersCollection } from '@/mock/orders-generator';
import { Order, OrderFilters, OrderStats } from '@/types/orders';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  filteredStats: OrderStats;
}

export async function fetchOrders(filters: OrderFilters): Promise<PaginatedResult<Order>> {
  // شبیه‌سازی تأخیر شبکه
  await new Promise((resolve) => setTimeout(resolve, 450));

  // شبیه‌سازی خطاهای احتمالی سرویس (برای تست، در صورت نیاز فعال شود)
  // if (Math.random() < 0.02) throw new Error("Internal Service Gateway Timeout (504)");

  let source = [...getMockOrdersCollection()];

  // 1. فیلتر بازه زمانی
  if (filters.dateRange !== 'all') {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.dateRange, 10));
    source = source.filter((o) => new Date(o.createdAt) >= cutoffDate);
  }

  // 2. جستجو در فیلدهای اصلی
  if (filters.search) {
    const query = filters.search.toLowerCase().trim();
    source = source.filter(
      (o) =>
        o.customerName.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query)
    );
  }

  // 3. فیلتر وضعیت‌ها (چندانتخابی)
  if (filters.status && filters.status.length > 0) {
    source = source.filter((o) => filters.status.includes(o.status));
  }

  // 4. فیلتر اولویت
  if (filters.priority && filters.priority !== 'all') {
    source = source.filter((o) => o.priority === filters.priority);
  }

  // 5. محاسبه آمار برای داشبورد
  const stats: OrderStats = {
    total: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  source.forEach((order) => {
    stats.total++;
    if (order.status in stats) {
      stats[order.status]++;
    }
  });

  // 6. مرتب‌سازی
  source.sort((a, b) => {
    let result = 0;

    if (filters.sortBy === 'createdAt') {
      result =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (filters.sortBy === 'totalAmount') {
      result = a.totalAmount - b.totalAmount;
    }

    return filters.sortOrder === 'asc' ? result : -result;
  });

  // 7. صفحه‌بندی
  const limit = 20;
  const offset = (filters.page - 1) * limit;
  const data = source.slice(offset, offset + limit);

  return {
    data,
    totalCount: source.length,
    filteredStats: stats,
  };
}