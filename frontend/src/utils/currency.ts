
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  NGN: '₦',
};

export function getCurrencySymbol(): string {
  const currency = localStorage.getItem('currency') || 'USD';
  return CURRENCY_SYMBOLS[currency] || '$';
}

export function formatCurrency(amount: number): string {
  const symbol = getCurrencySymbol();
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}