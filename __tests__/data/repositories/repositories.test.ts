import {AuthRepositoryImpl} from '../../../src/data/repositories/AuthRepositoryImpl';
import {BeneficiaryRepositoryImpl} from '../../../src/data/repositories/BeneficiaryRepositoryImpl';
import {ContractBalanceRepositoryImpl} from '../../../src/data/repositories/ContractBalanceRepositoryImpl';
import {SecurityRepositoryImpl} from '../../../src/data/repositories/SecurityRepositoryImpl';
import {AccountMovementRepositoryImpl} from '../../../src/data/repositories/AccountMovementRepositoryImpl';
import {TransferRepositoryImpl} from '../../../src/data/repositories/TransferRepositoryImpl';

describe('data repositories', () => {
  test('AuthRepositoryImpl maps datasource login response to a user entity', async () => {
    const dataSource = {
      login: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        firstName: '',
        sessionTimeSeconds: 3600,
        inactivityTimeoutSeconds: 300,
      }),
    };
    const repository = new AuthRepositoryImpl(dataSource);

    const result = await repository.login(
      'cliente@banco.com',
      'encrypted-user',
      'encrypted-pass',
    );

    expect(dataSource.login).toHaveBeenCalledWith({
      username: 'encrypted-user',
      password: 'encrypted-pass',
    });
    expect(result).toMatchObject({
      id: 'cliente@banco.com',
      email: 'cliente@banco.com',
      firstName: '',
      name: 'cliente',
      token: 'access-token',
    });
  });

  test('SecurityRepositoryImpl maps remote public key content', async () => {
    const remoteDataSource = {
      getPublicKey: jest.fn().mockResolvedValue({publicKey: 'PUBLIC_KEY'}),
      validateOtp: jest.fn(),
    };
    const repository = new SecurityRepositoryImpl(remoteDataSource);

    await expect(repository.getPublicKey()).resolves.toEqual({
      value: 'PUBLIC_KEY',
    });
  });

  test('SecurityRepositoryImpl maps OTP validation response to entity', async () => {
    const remoteDataSource = {
      getPublicKey: jest.fn(),
      validateOtp: jest.fn().mockResolvedValue({userMessage: 'Validado'}),
    };
    const repository = new SecurityRepositoryImpl(remoteDataSource);

    await expect(repository.validateOtp('123456')).resolves.toEqual({
      message: 'Validado',
    });
    expect(remoteDataSource.validateOtp).toHaveBeenCalledWith({otp: '123456'});
  });

  test('BeneficiaryRepositoryImpl maps contacts content to entities', async () => {
    const dataSource = {
      getContacts: jest.fn().mockResolvedValue({
        contacts: [
          {
            beneficiaryGuid: 'g1',
            contactName: 'Ana',
            bankName: 'BB',
            accountType: 1,
            lastFourDigits: '4242',
          },
        ],
      }),
    };
    const repository = new BeneficiaryRepositoryImpl(dataSource);

    const result = await repository.getContacts();

    expect(result).toEqual([
      {
        beneficiaryGuid: 'g1',
        contactName: 'Ana',
        bankName: 'BB',
        accountType: 1,
        lastFourDigits: '4242',
      },
    ]);
  });

  test('ContractBalanceRepositoryImpl maps home content to entity', async () => {
    const dataSource = {
      getHome: jest.fn().mockResolvedValue({
        accounts: [
          {
            accountGuid: 'a1',
            maskedAccountNumber: '****1111',
            accountType: 1,
            accountTypeLabel: 'Ahorros',
            balance: 100,
          },
        ],
        creditCards: [],
        loans: [],
        investments: [],
        frequentPayments: [],
      }),
    };
    const repository = new ContractBalanceRepositoryImpl(dataSource);

    const result = await repository.getHomeBalance();

    expect(result.accounts).toHaveLength(1);
    expect(result.accounts[0]).toMatchObject({
      accountGuid: 'a1',
      accountKind: 'savings',
      balance: 100,
    });
  });

  test('AccountMovementRepositoryImpl maps paginated transaction list', async () => {
    const dataSource = {
      getTransactionPage: jest.fn().mockResolvedValue({
        totalCount: 1,
        pageNumber: 1,
        pageSize: 20,
        items: [
          {
            transactionGuid: 'g1',
            transactionIdentifier: 'id-1',
            beneficiaryName: 'Ana Pérez',
            beneficiaryAccountType: 'Savings',
            beneficiaryAccountTypeLabel: 'Ahorros',
            beneficiaryAccountNumber: '****1234',
            ownerAccountType: 'Savings',
            ownerAccountLabel: 'Propia',
            accountNumber: '****5678',
            accountType: 'Savings',
            accountTypeLabel: 'Ahorros',
            amount: -50,
            transferDate: '2026-04-04T12:00:00.000Z',
            transactionTypeLabel: 'Transferencia',
            transactionType: 'SentTransfers',
            concept: null,
            balanceAfterTransaction: 900,
            allowedShared: true,
          },
        ],
      }),
    };
    const repository = new AccountMovementRepositoryImpl(dataSource);

    const result = await repository.getMovements({
      accountGuid: 'acc-1',
      pageNumber: 1,
      pageSize: 20,
    });

    expect(dataSource.getTransactionPage).toHaveBeenCalledWith({
      AccountGuid: 'acc-1',
      PageNumber: 1,
      PageSize: 20,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      beneficiaryName: 'Ana Pérez',
      ownerAccountLabel: 'Propia',
      accountNumber: '****5678',
      transactionType: 'SentTransfers',
      amount: -50,
      balanceAfterTransaction: 900,
      allowedShared: true,
    });
  });

  test('TransferRepositoryImpl delega al dataSource y mapea transactionIdentifier', async () => {
    const dataSource = {
      transfer: jest.fn().mockResolvedValue({transactionIdentifier: 'TXN-XYZ'}),
    };
    const repository = new TransferRepositoryImpl(dataSource as never);

    const result = await repository.executeTransfer({
      amount: 100,
      beneficiaryContactGuid: 'ben-001',
      accountGuid: 'acc-001',
      concept: 'Pago renta',
    });

    expect(dataSource.transfer).toHaveBeenCalledWith({
      amount: 100,
      beneficiaryContactGuid: 'ben-001',
      accountGuid: 'acc-001',
      concept: 'Pago renta',
    });
    expect(result).toEqual({transactionIdentifier: 'TXN-XYZ'});
  });
});
