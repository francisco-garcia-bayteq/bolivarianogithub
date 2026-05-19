import {
  beneficiaryContactToTemplate,
  groupContactsByLetter,
  ownAccountToBeneficiary,
  templateToBeneficiary,
} from '../../../src/presentation/beneficiary/beneficiaryData.ts';
import type {BeneficiaryContact} from '../../../src/domain/entities/BeneficiaryContact';
import type {AccountBalance} from '../../../src/domain/entities/ContractBalance';

function makeContact(overrides: Partial<BeneficiaryContact> = {}): BeneficiaryContact {
  return {
    beneficiaryGuid: 'guid-1',
    contactName: 'Ana Pérez',
    bankName: 'Banco Bolivariano',
    accountType: 1,
    lastFourDigits: '1234',
    ...overrides,
  };
}

function toTemplate(overrides: Partial<BeneficiaryContact> = {}) {
  return beneficiaryContactToTemplate(makeContact(overrides));
}

function makeAccount(overrides: Partial<AccountBalance> = {}): AccountBalance {
  return {
    accountGuid: 'ag-1',
    maskedAccountNumber: '****4242',
    accountKind: 'savings',
    balance: 1000,
    ...overrides,
  };
}

describe('beneficiaryData', () => {
  describe('templateToBeneficiary', () => {
    test('mapea beneficiaryGuid → id y contactName → name', () => {
      const result = templateToBeneficiary(
        toTemplate({beneficiaryGuid: 'g1', contactName: 'Ana', bankName: 'BB'}),
      );
      expect(result.id).toBe('g1');
      expect(result.name).toBe('Ana');
      expect(result.bankName).toBe('BB');
      expect(result.kind).toBe('contact');
    });

    test('construye accountHint con accountType y lastFourDigits', () => {
      const result = templateToBeneficiary(
        toTemplate({accountType: 2, lastFourDigits: '5678'}),
      );
      expect(result.accountHint).toContain('corriente');
      expect(result.accountHint).toContain('5678');
    });

    test('objeto completo coincide con la forma esperada', () => {
      expect(
        templateToBeneficiary(
          beneficiaryContactToTemplate({
            beneficiaryGuid: 'g1',
            contactName: 'Ana',
            bankName: 'BB',
            accountType: 1,
            lastFourDigits: '1111',
          }),
        ),
      ).toEqual({
        id: 'g1',
        name: 'Ana',
        kind: 'contact',
        bankName: 'BB',
        accountHint: 'Cta. ahorros • **** 1111',
      });
    });

    test('kind siempre es "contact"', () => {
      expect(templateToBeneficiary(toTemplate()).kind).toBe('contact');
    });
  });

  describe('ownAccountToBeneficiary', () => {
    test('usa accountGuid con prefijo own- para id', () => {
      const result = ownAccountToBeneficiary(makeAccount({accountGuid: 'ag'}));
      expect(result.id).toBe('own-ag');
    });

    test('cuenta de ahorros — objeto completo', () => {
      expect(
        ownAccountToBeneficiary({
          accountGuid: 'ag',
          maskedAccountNumber: '****4242',
          accountKind: 'savings',
          balance: 0,
        }),
      ).toEqual({
        id: 'own-ag',
        name: 'Cuenta de Ahorros',
        kind: 'own_account',
        accountHint: '****4242',
      });
    });

    test('cuenta corriente — título correcto', () => {
      const result = ownAccountToBeneficiary(
        makeAccount({accountKind: 'checking', accountGuid: 'ag2'}),
      );
      expect(result.name).toBe('Cuenta Corriente');
      expect(result.id).toBe('own-ag2');
      expect(result.kind).toBe('own_account');
    });

    test('usa maskedAccountNumber como accountHint', () => {
      const result = ownAccountToBeneficiary(
        makeAccount({maskedAccountNumber: '****9999'}),
      );
      expect(result.accountHint).toBe('****9999');
    });

    test('kind siempre es "own_account"', () => {
      expect(ownAccountToBeneficiary(makeAccount()).kind).toBe('own_account');
    });
  });

  describe('groupContactsByLetter', () => {
    test('retorna array vacío para entrada vacía', () => {
      expect(groupContactsByLetter([])).toEqual([]);
    });

    test('agrupa correctamente por primera letra y clasifica # para no-alfa', () => {
      const groups = groupContactsByLetter([
        toTemplate({beneficiaryGuid: '1', contactName: 'beta'}),
        toTemplate({beneficiaryGuid: '2', contactName: 'Álvaro'}),
        toTemplate({beneficiaryGuid: '3', contactName: ' 123'}),
      ]);
      const titles = groups.map(g => g.title);
      expect(titles).toContain('#');
      expect(titles.some(t => /^[AÁ]$/i.test(t))).toBe(true);
      expect(groups.reduce((n, g) => n + g.data.length, 0)).toBe(3);
    });

    test('ordena grupos alfabéticamente (A < C < Z)', () => {
      const groups = groupContactsByLetter([
        toTemplate({beneficiaryGuid: 'z', contactName: 'Zara'}),
        toTemplate({beneficiaryGuid: 'a', contactName: 'Ana'}),
        toTemplate({beneficiaryGuid: 'c', contactName: 'Carlos'}),
      ]);
      const titles = groups.map(g => g.title);
      expect(titles.indexOf('A')).toBeLessThan(titles.indexOf('C'));
      expect(titles.indexOf('C')).toBeLessThan(titles.indexOf('Z'));
    });

    test('varios contactos con la misma letra van en el mismo grupo', () => {
      const groups = groupContactsByLetter([
        toTemplate({beneficiaryGuid: '1', contactName: 'Ana'}),
        toTemplate({beneficiaryGuid: '2', contactName: 'Alberto'}),
        toTemplate({beneficiaryGuid: '3', contactName: 'Beatriz'}),
      ]);
      expect(groups.find(g => g.title === 'A')?.data.length).toBe(2);
      expect(groups.find(g => g.title === 'B')?.data.length).toBe(1);
    });

    test('caracteres no alfabéticos (#, dígitos, @) van bajo "#"', () => {
      const groups = groupContactsByLetter([
        toTemplate({beneficiaryGuid: '1', contactName: '123 Corp'}),
        toTemplate({beneficiaryGuid: '2', contactName: '@empresa'}),
      ]);
      expect(groups.find(g => g.title === '#')?.data.length).toBe(2);
    });

    test('contacto único genera un grupo con un elemento', () => {
      const groups = groupContactsByLetter([
        toTemplate({beneficiaryGuid: 'x', contactName: 'Mónica'}),
      ]);
      expect(groups.length).toBe(1);
      expect(groups[0].data.length).toBe(1);
    });

    test('preserva todos los datos del contacto dentro del grupo', () => {
      const contact = toTemplate({beneficiaryGuid: 'abc', contactName: 'Luis', bankName: 'Produbanco'});
      const groups = groupContactsByLetter([contact]);
      expect(groups[0].data[0]).toEqual(contact);
    });
  });
});
