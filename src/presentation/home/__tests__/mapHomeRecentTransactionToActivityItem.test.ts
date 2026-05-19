import {mapHomeRecentTransactionToActivityItem} from '../mapHomeRecentTransactionToActivityItem';
import type {HomeRecentTransaction} from '../../../domain/entities/ContractBalance';

function baseTx(
  overrides: Partial<HomeRecentTransaction> = {},
): HomeRecentTransaction {
  return {
    transactionGuid: 'g1',
    transactionIdentifier: 'id-1',
    beneficiaryName: 'Ana',
    beneficiaryAccountType: 'Savings',
    beneficiaryAccountTypeLabel: 'Ahorros',
    beneficiaryAccountNumber: '****1111',
    ownerAccountType: 'Savings',
    ownerAccountLabel: 'Ahorros',
    accountNumber: '****2222',
    accountType: 'Savings',
    accountTypeLabel: 'Ahorros',
    amount: -91.02,
    transferDate: '2026-04-20T12:00:00.000Z',
    transactionTypeLabel: 'Transferencia interbancaria',
    transactionType: 'SentTransfers',
    concept: '',
    balanceAfterTransaction: 100,
    allowedShared: true,
    ...overrides,
  };
}

describe('mapHomeRecentTransactionToActivityItem', () => {
  test('usa transactionTypeLabel, fecha y monto formateado', () => {
    const item = mapHomeRecentTransactionToActivityItem(baseTx());
    expect(item.id).toBe('g1');
    expect(item.day).toBe('20');
    expect(item.monthLabel).toMatch(/ABR/i);
    expect(item.description).toBe('Transferencia interbancaria');
    expect(item.amountLabel).toContain('91');
  });

  test('si transactionTypeLabel vacío usa concept', () => {
    const item = mapHomeRecentTransactionToActivityItem(
      baseTx({transactionTypeLabel: '', concept: 'Pago servicio'}),
    );
    expect(item.description).toBe('Pago servicio');
  });
});
