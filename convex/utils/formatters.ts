// Format a date for display
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format a phone number
export function formatPhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

// Format an address
export function formatAddress(address: string, city?: string, state?: string, zip?: string, country?: string): string {
  const parts = [address];

  if (city && state) {
    parts.push(`${city}, ${state}`);
  } else if (city) {
    parts.push(city);
  } else if (state) {
    parts.push(state);
  }

  if (zip) {
    parts.push(zip);
  }

  if (country) {
    parts.push(country);
  }

  return parts.join(', ');
}
