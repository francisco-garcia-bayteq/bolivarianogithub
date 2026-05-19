import {mapContractBalanceContentToEntity} from '../../../../../src/data/mappers/contractBalanceMapper';
import type {ContractBalanceContentModel} from '../../../../../src/data/models/ContractBalanceContentModel';
import type {BeneficiaryContactDto} from '../../../../../src/data/models/BeneficiaryContactsContentModel';

function bene(overrides: Partial<BeneficiaryContactDto> = {}): BeneficiaryContactDto {
  return {
    beneficiaryGuid: 'b1',
    contactName: 'N',
    bankName: 'BB',
    accountType: 'savings',
    accountTypeLabel: 'Ahorros',
    beneficiaryAccountNumber: '1',
    lastFourDigits: '4242',
    ...overrides,
  };
}

function minimalContent(
  overrides: Partial<ContractBalanceContentModel> = {},
): ContractBalanceContentModel {
  return {
    accounts: [],
    creditCards: [],
    loans: [],
    investments: [],
    frequentPayments: [],
    ...overrides,
  };
}

describe('mapContractBalanceContentToEntity', () => {
  test('mapea accountKind savings y checking (case insensitive)', () => {
    const entity = mapContractBalanceContentToEntity(
      minimalContent({
        accounts: [
          {
            accountGuid: 'a1',
            maskedAccountNumber: '***1',
            accountType: 'SAVINGS',
            accountTypeLabel: 'Ahorros',
            balance: 10,
            beneficiary: bene(),
          },
          {
            accountGuid: 'a2',
            maskedAccountNumber: '***2',
            accountType: 'Checking',
            accountTypeLabel: 'Corriente',
            balance: 20,
            beneficiary: bene(),
          },
        ],
      }),
    );
    expect(entity.accounts[0]?.accountKind).toBe('savings');
    expect(entity.accounts[1]?.accountKind).toBe('checking');
  });

  test('accountType desconocido mapea a other', () => {
    const entity = mapContractBalanceContentToEntity(
      minimalContent({
        accounts: [
          {
            accountGuid: 'a3',
            maskedAccountNumber: '***3',
            accountType: 'brokerage',
            accountTypeLabel: 'Otro',
            balance: 0,
            beneficiary: bene(),
          },
        ],
      }),
    );
    expect(entity.accounts[0]?.accountKind).toBe('other');
  });

  test('mapea todas las colecciones requeridas y opcionales', () => {
    const content: ContractBalanceContentModel = minimalContent({
      accounts: [
        {
          accountGuid: 'ag',
          maskedAccountNumber: '**99',
          accountType: 'savings',
          accountTypeLabel: 'Ahorros',
          balance: 100,
          beneficiary: bene({contactName: 'X'}),
        },
      ],
      creditCards: [
        {
          maskedCardNumber: '****1111',
          totalDue: 50,
          maxPaymentDate: '2026-01-15',
        },
      ],
      loans: [
        {
          loanGuid: 'lg',
          outstandingBalance: 1000,
          nextInstallmentAmount: 100,
          nextInstallmentDate: '2026-02-01',
        },
      ],
      investments: [
        {
          investmentGuid: 'ig',
          productName: 'Fondo',
          currentValue: 5000,
          currency: 'USD',
        },
      ],
      frequentPayments: [
        {beneficiaryName: 'Pepe', beneficiaryType: 'contact'},
      ],
      banners: [
        {
          text: 'Hola',
          buttonText: 'Ir',
          buttonLink: 'https://x',
          landscape: 'car',
        },
      ],
      homeDashboardIcons: [{iconCode: 'user', text: 'Perfil'}],
      recentTransactions: [
        {
          transactionGuid: 'tg',
          transactionIdentifier: 'id1',
          beneficiaryName: 'B',
          beneficiaryAccountType: 'savings',
          beneficiaryAccountTypeLabel: 'Ahorros',
          beneficiaryAccountNumber: '1',
          ownerAccountType: 'checking',
          ownerAccountLabel: 'Corriente',
          accountNumber: '2',
          accountType: 'savings',
          accountTypeLabel: 'Ahorros',
          amount: 10,
          transferDate: '2026-01-01',
          transactionTypeLabel: 'T',
          transactionType: 'transfer',
          concept: 'c',
          balanceAfterTransaction: 90,
          allowedShared: true,
        },
      ],
    });

    const entity = mapContractBalanceContentToEntity(content);

    expect(entity.accounts).toHaveLength(1);
    expect(entity.accounts[0]?.beneficiary.contactName).toBe('X');
    expect(entity.creditCards[0]?.maskedCardNumber).toBe('****1111');
    expect(entity.loans[0]?.loanGuid).toBe('lg');
    expect(entity.investments[0]?.productName).toBe('Fondo');
    expect(entity.frequentPayments[0]?.beneficiaryName).toBe('Pepe');
    expect(entity.banners[0]?.text).toBe('Hola');
    expect(entity.homeDashboardIcons[0]?.iconCode).toBe('user');
    expect(entity.recentTransactions[0]?.transactionGuid).toBe('tg');
  });

  test('banners, homeDashboardIcons y recentTransactions undefined se tratan como vacíos', () => {
    const raw = {
      accounts: [],
      creditCards: [],
      loans: [],
      investments: [],
      frequentPayments: [],
      banners: undefined,
      homeDashboardIcons: undefined,
      recentTransactions: undefined,
    } as ContractBalanceContentModel;

    const entity = mapContractBalanceContentToEntity(raw);

    expect(entity.banners).toEqual([]);
    expect(entity.homeDashboardIcons).toEqual([]);
    expect(entity.recentTransactions).toEqual([]);
  });

  test('arrays requeridos undefined en runtime se mapean a vacíos', () => {
    const raw = {
      accounts: undefined,
      creditCards: undefined,
      loans: undefined,
      investments: undefined,
      frequentPayments: undefined,
    } as unknown as ContractBalanceContentModel;

    const entity = mapContractBalanceContentToEntity(raw);

    expect(entity.accounts).toEqual([]);
    expect(entity.creditCards).toEqual([]);
    expect(entity.loans).toEqual([]);
    expect(entity.investments).toEqual([]);
    expect(entity.frequentPayments).toEqual([]);
  });
});
