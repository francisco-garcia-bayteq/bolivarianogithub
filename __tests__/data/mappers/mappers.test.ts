import {mapPublicKeyContentToEntity} from '../../../src/data/mappers/PublicKeyMapper';
import {
  mapTransactionListItemToEntity,
  mapTransactionListItemsToEntities,
} from '../../../src/data/mappers/accountMovementMapper';
import {mapLoginResponseToUser} from '../../../src/data/mappers/UserMapper';

describe('data mappers', () => {
  test('mapLoginResponseToUser maps token, firstName y name', () => {
    const result = mapLoginResponseToUser(
      {
        accessToken: 'token-123',
        firstName: 'María',
        sessionTimeSeconds: 3600,
        inactivityTimeoutSeconds: 300,
      },
      'cliente@banco.com',
    );

    expect(result).toMatchObject({
      id: 'cliente@banco.com',
      email: 'cliente@banco.com',
      firstName: 'María',
      name: 'María',
      token: 'token-123',
      inactivityTimeoutSeconds: 300,
    });
    expect(result.alias).toBeUndefined();
    expect(typeof result.sessionExpiresAt).toBe('number');
  });

  test('mapLoginResponseToUser incluye alias cuando el servidor lo envía', () => {
    const result = mapLoginResponseToUser(
      {
        accessToken: 'token-123',
        firstName: 'Cliente',
        alias: 'usuario-demo12',
        sessionTimeSeconds: 3600,
        inactivityTimeoutSeconds: 300,
      },
      'cliente@banco.com',
    );

    expect(result.alias).toBe('usuario-demo12');
  });

  test('mapLoginResponseToUser preserva alias null cuando el servidor lo envía', () => {
    const result = mapLoginResponseToUser(
      {
        accessToken: 'token-123',
        firstName: 'Cliente',
        alias: null,
        sessionTimeSeconds: 3600,
        inactivityTimeoutSeconds: 300,
      },
      'cliente@banco.com',
    );

    expect(result.alias).toBeNull();
  });

  test('mapPublicKeyContentToEntity maps the public key value', () => {
    expect(
      mapPublicKeyContentToEntity({publicKey: '-----BEGIN PUBLIC KEY-----'}),
    ).toEqual({value: '-----BEGIN PUBLIC KEY-----'});
  });

  test('mapTransactionListItemToEntity maps API fields to AccountMovement', () => {
    const model = {
      transactionGuid: 'g1',
      transactionIdentifier: 'id-1',
      beneficiaryName: 'Juan',
      beneficiaryAccountType: 'Savings',
      beneficiaryAccountTypeLabel: 'Ahorros',
      beneficiaryAccountNumber: '****1111',
      ownerAccountType: 'Savings',
      ownerAccountLabel: 'Propia',
      accountNumber: '****2222',
      accountType: 'Checking',
      accountTypeLabel: 'Corriente',
      amount: -25,
      transferDate: '2026-03-25T11:00:00Z',
      transactionTypeLabel: 'Transferencia',
      transactionType: 'SentTransfers',
      concept: 'Pago préstamo',
      balanceAfterTransaction: 100,
      allowedShared: true,
    };

    expect(mapTransactionListItemToEntity(model)).toEqual({
      transactionGuid: 'g1',
      transactionIdentifier: 'id-1',
      beneficiaryName: 'Juan',
      beneficiaryAccountType: 'Savings',
      beneficiaryAccountTypeLabel: 'Ahorros',
      beneficiaryAccountNumber: '****1111',
      ownerAccountLabel: 'Propia',
      ownerAccountType: 'Savings',
      accountNumber: '****2222',
      accountType: 'Checking',
      accountTypeLabel: 'Corriente',
      amount: -25,
      transferDate: '2026-03-25T11:00:00Z',
      transactionTypeLabel: 'Transferencia',
      transactionType: 'SentTransfers',
      concept: 'Pago préstamo',
      balanceAfterTransaction: 100,
      allowedShared: true,
    });
  });

  test('mapTransactionListItemToEntity maps unknown transactionType to Other', () => {
    const model = {
      transactionGuid: 'g1',
      transactionIdentifier: 'id-1',
      beneficiaryName: 'Juan',
      beneficiaryAccountType: 'Savings',
      beneficiaryAccountTypeLabel: 'Ahorros',
      beneficiaryAccountNumber: '',
      ownerAccountType: 'Savings',
      ownerAccountLabel: 'Propia',
      accountNumber: '',
      accountType: 'Savings',
      accountTypeLabel: 'Ahorros',
      amount: -1,
      transferDate: '2026-03-25T11:00:00Z',
      transactionTypeLabel: 'X',
      transactionType: 'UnknownEnumValue',
      concept: null,
      balanceAfterTransaction: 0,
      allowedShared: false,
    };
    expect(mapTransactionListItemToEntity(model).transactionType).toBe('Other');
  });

  test('mapTransactionListItemsToEntities maps every item', () => {
    const base = {
      transactionIdentifier: '',
      beneficiaryAccountType: 'Savings' as const,
      beneficiaryAccountTypeLabel: '',
      beneficiaryAccountNumber: '',
      ownerAccountType: 'Savings' as const,
      ownerAccountLabel: '',
      accountNumber: '',
      accountType: 'Savings' as const,
      accountTypeLabel: '',
      transferDate: '2026-03-25T11:00:00Z',
      transactionTypeLabel: '',
      transactionType: 'Deposits' as const,
      concept: null,
      balanceAfterTransaction: 0,
      allowedShared: false,
    };
    const result = mapTransactionListItemsToEntities([
      {
        ...base,
        transactionGuid: 'a',
        beneficiaryName: 'A',
        amount: 1,
      },
      {
        ...base,
        transactionGuid: 'b',
        beneficiaryName: 'B',
        amount: 2,
        transferDate: '2026-03-24T11:00:00Z',
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[1].beneficiaryName).toBe('B');
  });
});
