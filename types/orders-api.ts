import { Order, OrderStats } from '@/types/orders';

export interface PaginatedResult {
  data: Order[];
  totalCount: number;
  filteredStats: OrderStats;
}