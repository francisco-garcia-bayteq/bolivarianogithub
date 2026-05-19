import {mapOtpContentToEntity} from '../../../src/data/mappers/OtpMapper';
import {mapBeneficiaryContactsContentToEntities} from '../../../src/data/mappers/beneficiaryMapper';
import {mapContractBalanceContentToEntity} from '../../../src/data/mappers/contractBalanceMapper';

describe('OtpMapper', () => {
  test('mapOtpContentToEntity maps userMessage to entity message', () => {
    expect(mapOtpContentToEntity({userMessage: 'Listo'})).toEqual({
      message: 'Listo',
    });
  });
});

describe('beneficiaryMapper', () => {
  test('mapBeneficiaryContactsContentToEntities maps every contact', () => {
    const result = mapBeneficiaryContactsContentToEntities({
      contacts: [
        {
          beneficiaryGuid: 'g1',
          contactName: 'Luis',
          bankName: 'BB',
          accountType: 2,
          lastFourDigits: '9999',
        },
      ],
    });

    expect(result).toEqual([
      {
        beneficiaryGuid: 'g1',
        contactName: 'Luis',
        bankName: 'BB',
        accountType: 2,
        lastFourDigits: '9999',
      },
    ]);
  });
});

describe('contractBalanceMapper', () => {
  test('maps all product kinds and account types', () => {
    const entity = mapContractBalanceContentToEntity({
      accounts: [
        {
          accountGuid: 'a1',
          maskedAccountNumber: '****1111',
          accountType: 1,
          accountTypeLabel: 'Cta. Ahorros',
          balance: 10,
          maskedAccountHome: '******0101',
          accountAlias: 'Gastos',
        },
        {
          accountGuid: 'a2',
          maskedAccountNumber: '****2222',
          accountType: 2,
          accountTypeLabel: 'Cta. corriente',
          balance: 20,
        },
        {
          accountGuid: 'a3',
          maskedAccountNumber: '****3333',
          accountType: 99,
          accountTypeLabel: 'Cuenta',
          balance: 30,
        },
      ],
      creditCards: [
        {
          maskedCardNumber: '****9999',
          totalDue: 50,
          maxPaymentDate: '2026-04-01',
        },
      ],
      loans: [
        {
          loanGuid: 'l1',
          outstandingBalance: 1000,
          nextInstallmentAmount: 100,
          nextInstallmentDate: '2026-04-05',
        },
      ],
      investments: [
        {
          investmentGuid: 'i1',
          productName: 'Fondo',
          currentValue: 5000,
          currency: 'USD',
        },
      ],
      frequentPayments: [
        {
          beneficiaryName: 'Servicio',
          beneficiaryType: 'service',
        },
      ],
    });

    expect(entity.accounts.map(a => a.accountKind)).toEqual([
      'savings',
      'checking',
      'other',
    ]);
    expect(entity.accounts[0]).toMatchObject({
      maskedAccountHome: '******0101',
      accountTypeLabel: 'Cta. Ahorros',
      accountAlias: 'Gastos',
    });
    expect(entity.creditCards[0].maskedCardNumber).toBe('****9999');
    expect(entity.loans[0].loanGuid).toBe('l1');
    expect(entity.investments[0].currency).toBe('USD');
    expect(entity.frequentPayments[0].beneficiaryName).toBe('Servicio');
    expect(entity.banners).toEqual([]);
    expect(entity.homeDashboardIcons).toEqual([]);
    expect(entity.recentTransactions).toEqual([]);
  });
});
