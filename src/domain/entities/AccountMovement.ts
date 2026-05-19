import type {AccountMovementTransactionType} from './AccountMovementTransactionType';

/** Tipo de cuenta en ítems de GET /Transaction (OpenAPI). */
export type AccountApiAccountKind = 'Savings' | 'Checking';

/** Movimiento de cuenta devuelto por GET /Transaction */
export interface AccountMovement {
  transactionGuid: string;
  transactionIdentifier: string;
  beneficiaryName: string;
  beneficiaryAccountType: AccountApiAccountKind;
  beneficiaryAccountTypeLabel: string;
  beneficiaryAccountNumber: string;
  /** Cuenta origen (Desde): etiqueta del titular/producto */
  ownerAccountLabel: string;
  ownerAccountType: AccountApiAccountKind;
  /** Cuenta origen enmascarada */
  accountNumber: string;
  accountType: AccountApiAccountKind;
  /** Tipo de cuenta origen (ej. Cta. ahorros) */
  accountTypeLabel: string;
  amount: number;
  transferDate: string;
  transactionTypeLabel: string;
  transactionType: AccountMovementTransactionType;
  /** Concepto libre de la operación (p. ej. transferencia). */
  concept: string | null;
  balanceAfterTransaction: number;
  /** Si el servidor permite compartir comprobante (p. ej. transferencias enviadas). */
  allowedShared: boolean;
}
