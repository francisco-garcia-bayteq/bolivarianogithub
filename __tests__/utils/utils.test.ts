import {
  accountProductTitle,
  accountTypeModalLabel,
  formatAccountKindLine,
} from '../../src/utils/accountDisplay';
import {formatMoneyEc} from '../../src/utils/formatMoneyEc';

describe('formatMoneyEc', () => {
  test('formats USD for es-EC locale', () => {
    expect(formatMoneyEc(15642.5)).toMatch(/15/);
    expect(formatMoneyEc(15642.5)).toMatch(/642/);
    expect(formatMoneyEc(0)).toMatch(/0/);
  });
});

describe('accountDisplay', () => {
  const savings = {
    accountGuid: 'a',
    maskedAccountNumber: '****1234',
    accountKind: 'savings' as const,
    accountTypeLabel: 'Cta. Ahorros',
    balance: 100,
    beneficiary: {
      beneficiaryGuid: 'bg',
      contactName: 'N',
      bankName: 'BB',
      accountType: 'savings',
      accountTypeLabel: 'Ahorros',
      beneficiaryAccountNumber: '0000000000',
      lastFourDigits: '****1234',
    },
  };
  const checking = {
    ...savings,
    accountKind: 'checking' as const,
    accountTypeLabel: 'Cta. corriente',
  };
  const other = {
    ...savings,
    accountKind: 'other' as const,
    accountTypeLabel: 'Cuenta',
  };

  test('accountProductTitle reflects account kind', () => {
    expect(accountProductTitle(savings)).toBe('Cuenta de Ahorros');
    expect(accountProductTitle(checking)).toBe('Cuenta Corriente');
    expect(accountProductTitle(other)).toBe('Cuenta');
  });

  test('accountTypeModalLabel uses sentence case per kind', () => {
    expect(accountTypeModalLabel(savings)).toBe('Cuenta de ahorros');
    expect(accountTypeModalLabel(checking)).toBe('Cuenta corriente');
    expect(accountTypeModalLabel(other)).toBe('Cuenta');
  });

  test('formatAccountKindLine combines label and masked number', () => {
    expect(formatAccountKindLine(savings)).toBe('Cta. Ahorros ****1234');
    expect(formatAccountKindLine(checking)).toBe('Cta. corriente ****1234');
    expect(formatAccountKindLine(other)).toBe('Cuenta ****1234');
  });
});
