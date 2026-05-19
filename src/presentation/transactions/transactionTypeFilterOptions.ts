import type {AccountMovementTransactionType} from '../../domain/entities/AccountMovementTransactionType';

/** Alias de dominio para filtros UI / query `TransactionType`. */
export type MovementTransactionEnumType = AccountMovementTransactionType;

export type TransactionTypeFilterOption = {
  enumValue: MovementTransactionEnumType;
  label: string;
};

/** Orden UI + valores enviados en query `TransactionType`. */
export const MOVEMENT_TRANSACTION_TYPE_OPTIONS: TransactionTypeFilterOption[] =
  [
    {
      enumValue: 'ReceivedTransfers',
      label: 'Transferencias recibidas',
    },
    {
      enumValue: 'SentTransfers',
      label: 'Transferencias realizadas',
    },
    {enumValue: 'Withdrawals', label: 'Retiros'},
    {enumValue: 'ServicePayments', label: 'Pago de servicios'},
    {enumValue: 'Deposits', label: 'Depósitos'},
    {enumValue: 'CardPurchases', label: 'Consumos con tarjeta'},
    {enumValue: 'Other', label: 'Otro'},
  ];

export function labelForMovementEnumType(
  value: MovementTransactionEnumType,
): string {
  const opt = MOVEMENT_TRANSACTION_TYPE_OPTIONS.find(
    o => o.enumValue === value,
  );
  return opt?.label ?? value;
}
