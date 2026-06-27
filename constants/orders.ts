import { OrderStatus, OrderPriority } from '@/types/orders';

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
export const ORDER_PRIORITIES: OrderPriority[] = ['low', 'medium', 'high'];
export const ITEMS_PER_PAGE = 20;