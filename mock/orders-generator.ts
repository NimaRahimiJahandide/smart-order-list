import { Order, OrderStatus, OrderPriority } from '../types/orders';
import { ORDER_PRIORITIES } from '../constants/orders';

const FIRST_NAMES = [
  'John', 'Jane', 'Alex', 'Emily', 'Michael',
  'Sarah', 'David', 'Jessica', 'James', 'Elena'
];

const LAST_NAMES = [
  'Smith', 'Doe', 'Johnson', 'Williams', 'Brown',
  'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez'
];

const DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'proton.me',
  'corporate.com'
];

/**
 * تولید سفارش‌های ساختگی برای محیط تست
 */
export function generateMockOrders(count = 250): Order[] {
  const orders: Order[] = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    const customerName = `${firstName} ${lastName}`;

    const email =
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}` +
      `@${DOMAINS[Math.floor(Math.random() * DOMAINS.length)]}`;

    // توزیع طبیعی وضعیت سفارش
    const statusRand = Math.random();
    let status: OrderStatus = 'pending';

    if (statusRand > 0.85) status = 'cancelled';
    else if (statusRand > 0.55) status = 'delivered';
    else if (statusRand > 0.35) status = 'shipped';
    else if (statusRand > 0.15) status = 'paid';

    const priority =
      ORDER_PRIORITIES[Math.floor(Math.random() * ORDER_PRIORITIES.length)];

    const itemsCount = Math.floor(Math.random() * 8) + 1;

    const totalAmount = parseFloat(
      (
        itemsCount * (Math.random() * 45 + 5) +
        Math.random() * 15
      ).toFixed(2)
    );

    // تاریخ‌های پراکنده در ۴۵ روز اخیر
    const daysAgo = Math.floor(Math.random() * 45);
    const createdAt = new Date(
      now.getTime() - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString();

    orders.push({
      id: `ORD-${2026}${String(i).padStart(4, '0')}`,
      customerName,
      email,
      status,
      priority,
      totalAmount,
      createdAt,
      itemsCount,
    });
  }

  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Singleton pattern for client-side persistence representation
let clientSideMockDatabase: Order[] | null = null;

/**
 * دریافت مجموعه دیتابیس mock (کلاینت)
 */
export function getMockOrdersCollection(): Order[] {
  if (!clientSideMockDatabase) {
    clientSideMockDatabase = generateMockOrders(240);
  }
  return clientSideMockDatabase;
}