/** Valores de `transactionType` en GET /Transaction (OpenAPI). */
export type AccountMovementTransactionType =
  | 'ReceivedTransfers'
  | 'SentTransfers'
  | 'Withdrawals'
  | 'ServicePayments'
  | 'Deposits'
  | 'CardPurchases'
  | 'Other';

const KNOWN: readonly AccountMovementTransactionType[] = [
  'ReceivedTransfers',
  'SentTransfers',
  'Withdrawals',
  'ServicePayments',
  'Deposits',
  'CardPurchases',
  'Other',
] as const;

export function parseAccountMovementTransactionType(
  raw: string | null | undefined,
): AccountMovementTransactionType {
  if (raw != null && KNOWN.includes(raw as AccountMovementTransactionType)) {
    return raw as AccountMovementTransactionType;
  }
  return 'Other';
}
