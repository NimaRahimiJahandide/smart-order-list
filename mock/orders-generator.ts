import { Order, OrderStatus, OrderPriority } from '../types/orders';
import { ORDER_PRIORITIES } from '../constants/orders';

const FIRST_NAMES = [
  'John', 'Jane', 'Alex', 'Emily', 'Michael',
  'Sarah', 'David', 'Jessica', 'James', 'Elena',
  'Ali', 'Maryam', 'Reza', 'Zahra', 'Hassan',
  'Fateme', 'Mohammad', 'Nasrin', 'Amir', 'Leila',
  'Chris', 'Amanda', 'Robert', 'Linda', 'Kevin',
  'Maria', 'Daniel', 'Susan', 'Mark', 'Lisa',
];

const LAST_NAMES = [
  'Smith', 'Doe', 'Johnson', 'Williams', 'Brown',
  'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez',
  'Ahmadi', 'Hosseini', 'Karimi', 'Mousavi', 'Rezaei',
  'Mohammadi', 'Nazari', 'Moradi', 'Jafari', 'Bagheri',
  'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Martin', 'Thompson',
];

const DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com',
  'proton.me', 'corporate.com', 'icloud.com',
  'hotmail.com', 'company.io',
];

function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

export function generateMockOrders(count = 10_000): Order[] {
  const rand = createSeededRandom(42);
  const orders: Order[] = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const firstName    = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName     = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const customerName = `${firstName} ${lastName}`;
    const email        =
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(rand() * 999)}` +
      `@${DOMAINS[Math.floor(rand() * DOMAINS.length)]}`;

    const sr = rand();
    let status: OrderStatus = 'pending';
    if      (sr > 0.85) status = 'cancelled';
    else if (sr > 0.55) status = 'delivered';
    else if (sr > 0.35) status = 'shipped';
    else if (sr > 0.15) status = 'paid';

    const priority: OrderPriority =
      ORDER_PRIORITIES[Math.floor(rand() * ORDER_PRIORITIES.length)];

    const itemsCount  = Math.floor(rand() * 8) + 1;
    const totalAmount = parseFloat(
      (itemsCount * (rand() * 45 + 5) + rand() * 15).toFixed(2),
    );

    // Spread over ~2 years so date filtering is interesting
    const daysAgo  = Math.floor(rand() * 730);
    const createdAt = new Date(
      now.getTime() - daysAgo * 24 * 60 * 60 * 1000,
    ).toISOString();

    orders.push({
      id: `ORD-${String(i).padStart(6, '0')}`,
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
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

let _cache: Order[] | null = null;

export function getMockOrdersCollection(): Order[] {
  if (!_cache) _cache = generateMockOrders(10_000);
  return _cache;
}