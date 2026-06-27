import { Order } from '@/types/orders';

export function exportOrdersToCSV(orders: Order[]): void {
  const headers = ['Order ID', 'Customer Name', 'Email', 'Status', 'Priority', 'Items', 'Total Amount', 'Created At'];
  
  const csvRows = [
    headers.join(','),
    ...orders.map(o => [
      `"${o.id}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.email}"`,
      `"${o.status}"`,
      `"${o.priority}"`,
      o.itemsCount,
      o.totalAmount,
      `"${o.createdAt}"`
    ].join(','))
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const hyperLink = document.createElement('a');
  
  hyperLink.setAttribute('href', url);
  hyperLink.setAttribute('download', `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
  hyperLink.style.visibility = 'hidden';
  
  document.body.appendChild(hyperLink);
  hyperLink.click();
  document.body.removeChild(hyperLink);
}