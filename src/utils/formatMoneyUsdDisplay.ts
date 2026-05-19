/**
 * USD for transfer amount display: $ prefix, comma as thousands separator,
 * period as decimal separator (e.g. $1,234.56).
 */
export function formatMoneyUsdDisplay(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
