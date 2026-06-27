import { Order, OrderStatus, OrderPriority } from '../types/orders';
import { ORDER_PRIORITIES } from '../constants/orders';

const FIRST_NAMES = [
  'John', 'Jane', 'Alex', 'Emily', 'Michael',
  'Sarah', 'David', 'Jessica', 'James', 'Elena',
];

const LAST_NAMES = [
  'Smith', 'Doe', 'Johnson', 'Williams', 'Brown',
  'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez',
];

const DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'proton.me',
  'corporate.com',
];

// Simple deterministic pseudo-random (seeded LCG) so the mock database
// is stable across hot-reloads and SSR/client hydration.
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

export function generateMockOrders(count = 250): Order[] {
  const rand = createSeededRandom(42);
  const orders: Order[] = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName  = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const customerName = `${firstName} ${lastName}`;
    const email =
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}` +
      `@${DOMAINS[Math.floor(rand() * DOMAINS.length)]}`;

    const statusRand = rand();
    let status: OrderStatus = 'pending';
    if      (statusRand > 0.85) status = 'cancelled';
    else if (statusRand > 0.55) status = 'delivered';
    else if (statusRand > 0.35) status = 'shipped';
    else if (statusRand > 0.15) status = 'paid';

    const priority: OrderPriority =
      ORDER_PRIORITIES[Math.floor(rand() * ORDER_PRIORITIES.length)];

    const itemsCount  = Math.floor(rand() * 8) + 1;
    const totalAmount = parseFloat(
      (itemsCount * (rand() * 45 + 5) + rand() * 15).toFixed(2),
    );

    const daysAgo  = Math.floor(rand() * 45);
    const createdAt = new Date(
      now.getTime() - daysAgo * 24 * 60 * 60 * 1000,
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
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// Singleton — stable across the lifetime of the JS module
let clientSideMockDatabase: Order[] | null = null;

export function getMockOrdersCollection(): Order[] {
  if (!clientSideMockDatabase) {
    clientSideMockDatabase = generateMockOrders(240);
  }
  return clientSideMockDatabase;
}