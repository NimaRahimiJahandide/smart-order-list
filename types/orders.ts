export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type OrderPriority = 'low' | 'medium' | 'high';
export type DateFilterOption = '7' | '30' | 'all';

export interface Order {
  id: string;
  customerName: string;
  email: string;
  status: OrderStatus;
  priority: OrderPriority;
  totalAmount: number;
  createdAt: string; // ISO String
  itemsCount: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface OrderFilters {
  page: number;
  search: string;
  status: OrderStatus[];
  priority: OrderPriority | 'all';
  dateRange: DateFilterOption;
  sortBy: 'createdAt' | 'totalAmount';
  sortOrder: 'asc' | 'desc';
}