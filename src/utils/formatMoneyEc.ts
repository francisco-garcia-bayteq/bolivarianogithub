/**
 * Formats an amount as USD for Ecuador locale (e.g. US$ 1.234,56).
 */
export function formatMoneyEc(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
