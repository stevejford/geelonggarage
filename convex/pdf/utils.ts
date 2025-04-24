// Helper function to format currency
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

// Helper function to format date
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
