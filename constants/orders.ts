import { OrderStatus, OrderPriority } from '@/types/orders';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
];

export const ORDER_PRIORITIES: OrderPriority[] = ['low', 'medium', 'high'];

export const ITEMS_PER_PAGE = 20;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'در انتظار',
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
};