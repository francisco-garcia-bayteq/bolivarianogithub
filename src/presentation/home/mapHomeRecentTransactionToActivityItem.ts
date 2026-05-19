import type {HomeRecentTransaction} from '../../domain/entities/ContractBalance';
import {formatMoneyEc} from '../../utils/formatMoneyEc';
import type {RecentActivityItem} from './homeDashboardMocks';

export function mapHomeRecentTransactionToActivityItem(
  tx: HomeRecentTransaction,
): RecentActivityItem {
  const date = new Date(tx.transferDate);
  const invalid = Number.isNaN(date.getTime());
  const day = invalid ? '--' : String(date.getDate());
  const monthLabel = invalid
    ? ''
    : date
        .toLocaleDateString('es-EC', {month: 'short'})
        .replaceAll('.', '')
        .toUpperCase();

  const description =
    tx.transactionTypeLabel?.trim() ||
    tx.concept?.trim() ||
    'Movimiento';

  return {
    id: tx.transactionGuid,
    day,
    monthLabel,
    description,
    amountLabel: formatMoneyEc(tx.amount),
  };
}
