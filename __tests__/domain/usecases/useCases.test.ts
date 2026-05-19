import {GetBeneficiaryContactsUseCase} from '../../../src/domain/usecases/GetBeneficiaryContactsUseCase';
import {GetHomeContractBalanceUseCase} from '../../../src/domain/usecases/GetHomeContractBalanceUseCase';
import {GetPublicKeyUseCase} from '../../../src/domain/usecases/GetPublicKeyUseCase';
import {GetAccountMovementsUseCase} from '../../../src/domain/usecases/GetAccountMovementsUseCase';
import {GetUserLoggedUseCase} from '../../../src/domain/usecases/GetUserLoggedUseCase';
import {LoginUseCase} from '../../../src/domain/usecases/LoginUseCase';
import {ValidateOtpUseCase} from '../../../src/domain/usecases/ValidateOtpUseCase';
import {ValidateTransactionAmountUseCase} from '../../../src/domain/usecases/ValidateTransactionAmountUseCase';
import {ExecuteTransferUseCase} from '../../../src/domain/usecases/ExecuteTransferUseCase';
import * as rsaUtils from '../../../src/security/certificate/rsaUtils';
import {ServerPublicKeySessionStoreImpl} from '../../../src/data/services/ServerPublicKeySessionStoreImpl';

describe('domain use cases', () => {
  test('LoginUseCase trims credentials, persists session and returns user', async () => {
    const user = {
      id: 'usuario-demo12',
      email: 'usuario-demo12',
      firstName: 'Usuario',
      name: 'Usuario Demo',
      token: 'jwt-token',
      sessionExpiresAt: Date.now() + 3600 * 1000,
      inactivityTimeoutSeconds: 300,
    };
    const authRepository = {
      login: jest.fn().mockResolvedValue(user),
    };
    const secureStorage = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    const runCertificateHandshakeUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const getPublicKeyUseCase = {
      execute: jest.fn().mockResolvedValue({value: 'server-public-key-material'}),
    };
    const encryptSpy = jest
      .spyOn(rsaUtils, 'rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64')
      .mockReturnValue('enc-blob');
    const useCase = new LoginUseCase(
      authRepository,
      secureStorage as never,
      '@bb_user_session',
      runCertificateHandshakeUseCase as never,
      getPublicKeyUseCase as never,
      '@auth_token',
    );

    const result = await useCase.execute('  usuario-demo12  ', '  12345678  ');

    expect(runCertificateHandshakeUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getPublicKeyUseCase.execute).toHaveBeenCalledTimes(1);
    expect(encryptSpy).toHaveBeenCalledTimes(2);
    expect(authRepository.login).toHaveBeenCalledWith(
      'usuario-demo12',
      'enc-blob',
      'enc-blob',
    );
    expect(secureStorage.save).toHaveBeenCalledWith(
      '@bb_user_session',
      JSON.stringify(user),
    );
    expect(secureStorage.save).toHaveBeenCalledWith('@auth_token', 'jwt-token');
    expect(result.token).toBe('jwt-token');
    encryptSpy.mockRestore();
  });

  test('LoginUseCase rejects usuario vacío before calling repository', async () => {
    const authRepository = {
      login: jest.fn(),
    };
    const secureStorage = {save: jest.fn()};
    const runCertificateHandshakeUseCase = {execute: jest.fn()};
    const getPublicKeyUseCase = {execute: jest.fn()};
    const useCase = new LoginUseCase(
      authRepository,
      secureStorage as never,
      '@bb_user_session',
      runCertificateHandshakeUseCase as never,
      getPublicKeyUseCase as never,
      '@auth_token',
    );

    await expect(useCase.execute('', '123456')).rejects.toThrow(
      'El usuario es requerido',
    );
    expect(authRepository.login).not.toHaveBeenCalled();
    expect(secureStorage.save).not.toHaveBeenCalled();
    expect(runCertificateHandshakeUseCase.execute).not.toHaveBeenCalled();
    expect(getPublicKeyUseCase.execute).not.toHaveBeenCalled();
  });

  test('LoginUseCase rejects username shorter than minimum before calling repository', async () => {
    const authRepository = {login: jest.fn()};
    const secureStorage = {save: jest.fn()};
    const runCertificateHandshakeUseCase = {execute: jest.fn()};
    const getPublicKeyUseCase = {execute: jest.fn()};
    const useCase = new LoginUseCase(
      authRepository,
      secureStorage as never,
      '@bb_user_session',
      runCertificateHandshakeUseCase as never,
      getPublicKeyUseCase as never,
      '@auth_token',
    );

    await expect(useCase.execute('usr', '1234567')).rejects.toThrow(
      'El usuario debe tener al menos 12 caracteres',
    );
    expect(authRepository.login).not.toHaveBeenCalled();
    expect(secureStorage.save).not.toHaveBeenCalled();
    expect(runCertificateHandshakeUseCase.execute).not.toHaveBeenCalled();
    expect(getPublicKeyUseCase.execute).not.toHaveBeenCalled();
  });

  test('LoginUseCase rejects invalid password before calling repository', async () => {
    const authRepository = {login: jest.fn()};
    const secureStorage = {save: jest.fn()};
    const runCertificateHandshakeUseCase = {execute: jest.fn()};
    const getPublicKeyUseCase = {execute: jest.fn()};
    const useCase = new LoginUseCase(
      authRepository,
      secureStorage as never,
      '@bb_user_session',
      runCertificateHandshakeUseCase as never,
      getPublicKeyUseCase as never,
      '@auth_token',
    );

    await expect(
      useCase.execute('usuario-demo12', '1234567'),
    ).rejects.toThrow('La contraseña debe tener al menos 8 caracteres');
    expect(authRepository.login).not.toHaveBeenCalled();
    expect(secureStorage.save).not.toHaveBeenCalled();
    expect(runCertificateHandshakeUseCase.execute).not.toHaveBeenCalled();
  });

  test('GetPublicKeyUseCase normaliza la clave y la guarda en sesión (una sola llamada al repo)', async () => {
    const securityRepository = {
      getPublicKey: jest.fn().mockResolvedValue({value: '  PUBLIC_KEY  '}),
    };
    const sessionStore = new ServerPublicKeySessionStoreImpl();
    const useCase = new GetPublicKeyUseCase(
      securityRepository as never,
      sessionStore,
    );

    const result = await useCase.execute();

    expect(securityRepository.getPublicKey).toHaveBeenCalledTimes(1);
    expect(result).toEqual({value: 'PUBLIC/KEY'});

    await useCase.execute();
    expect(securityRepository.getPublicKey).toHaveBeenCalledTimes(1);
  });

  test('GetPublicKeyUseCase rejects an empty public key', async () => {
    const securityRepository = {
      getPublicKey: jest.fn().mockResolvedValue({value: '   '}),
    };
    const sessionStore = {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
    };
    const useCase = new GetPublicKeyUseCase(
      securityRepository as never,
      sessionStore as never,
    );

    await expect(useCase.execute()).rejects.toThrow(
      'La clave pública recibida no es válida',
    );
    expect(sessionStore.set).not.toHaveBeenCalled();
  });

  test('GetAccountMovementsUseCase returns paginated movements', async () => {
    const repository = {
      getMovements: jest.fn().mockResolvedValue({
        totalCount: 1,
        pageNumber: 1,
        pageSize: 20,
        items: [
          {
            transactionGuid: 'g1',
            transactionIdentifier: 'x',
            beneficiaryName: 'Depósito',
            beneficiaryAccountType: 'Savings',
            beneficiaryAccountTypeLabel: 'Ahorros',
            beneficiaryAccountNumber: '',
            ownerAccountType: 'Savings',
            ownerAccountLabel: '',
            accountNumber: '',
            accountType: 'Savings',
            accountTypeLabel: '',
            amount: 100,
            transferDate: '2026-03-28T00:00:00.000Z',
            transactionTypeLabel: 'Abono',
            transactionType: 'Deposits',
            concept: null,
            balanceAfterTransaction: 500,
            allowedShared: false,
          },
        ],
      }),
    };
    const useCase = new GetAccountMovementsUseCase(repository);

    const result = await useCase.execute({
      accountGuid: 'acc-1',
      pageNumber: 1,
      pageSize: 20,
    });

    expect(repository.getMovements).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].beneficiaryName).toBe('Depósito');
  });

  test('ValidateOtpUseCase encrypts OTP with server public key then delegates to repository', async () => {
    const securityRepository = {
      validateOtp: jest.fn().mockResolvedValue({message: 'OK'}),
    };
    const getPublicKeyUseCase = {
      execute: jest.fn().mockResolvedValue({value: 'server-public-key-material'}),
    };
    const encryptSpy = jest
      .spyOn(rsaUtils, 'rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64')
      .mockReturnValue('enc-otp');
    const useCase = new ValidateOtpUseCase(
      securityRepository as never,
      getPublicKeyUseCase as never,
    );

    await expect(useCase.execute('123456')).resolves.toEqual({message: 'OK'});
    expect(getPublicKeyUseCase.execute).toHaveBeenCalledTimes(1);
    expect(encryptSpy).toHaveBeenCalledWith(
      'server-public-key-material',
      '123456',
    );
    expect(securityRepository.validateOtp).toHaveBeenCalledWith('enc-otp');
    encryptSpy.mockRestore();
  });

  test('GetUserLoggedUseCase parses stored JSON user', async () => {
    const user = {id: '1', email: 'a@b.com', name: 'A', token: 't'};
    const secureStorage = {
      get: jest.fn().mockResolvedValue(JSON.stringify(user)),
    };
    const useCase = new GetUserLoggedUseCase(secureStorage as never, '@key');

    await expect(useCase.execute()).resolves.toEqual({...user, firstName: ''});
    expect(secureStorage.get).toHaveBeenCalledWith('@key');
  });

  test('GetUserLoggedUseCase throws when no session is stored', async () => {
    const secureStorage = {get: jest.fn().mockResolvedValue(null)};
    const useCase = new GetUserLoggedUseCase(secureStorage as never, '@key');

    await expect(useCase.execute()).rejects.toThrow('No se encontró el usuario.');
  });

  test('GetHomeContractBalanceUseCase returns repository balance', async () => {
    const contractBalanceRepository = {
      getHomeBalance: jest.fn().mockResolvedValue({
        accounts: [],
        creditCards: [],
        loans: [],
        investments: [],
        frequentPayments: [],
        banners: [],
        homeDashboardIcons: [],
        recentTransactions: [],
      }),
    };
    const useCase = new GetHomeContractBalanceUseCase(contractBalanceRepository);

    const result = await useCase.execute();

    expect(contractBalanceRepository.getHomeBalance).toHaveBeenCalledTimes(1);
    expect(result.accounts).toEqual([]);
  });

  test('GetBeneficiaryContactsUseCase returns repository contacts', async () => {
    const beneficiaryRepository = {
      getContacts: jest.fn().mockResolvedValue([
        {
          beneficiaryGuid: 'g1',
          contactName: 'Ana',
          bankName: 'BB',
          accountType: 1,
          lastFourDigits: '1234',
        },
      ]),
    };
    const useCase = new GetBeneficiaryContactsUseCase(beneficiaryRepository);

    const result = await useCase.execute();

    expect(beneficiaryRepository.getContacts).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].contactName).toBe('Ana');
  });

  test('ValidateTransactionAmountUseCase delega al securityRepository', async () => {
    const securityRepository = {
      validateTransactionAmount: jest.fn().mockResolvedValue({isValid: true}),
    };
    const useCase = new ValidateTransactionAmountUseCase(securityRepository as never);

    const input = {amount: 100, beneficiaryGuid: 'ben-001', accountGuid: 'acc-001', concept: 'Pago'};
    const result = await useCase.execute(input);

    expect(securityRepository.validateTransactionAmount).toHaveBeenCalledWith(input);
    expect(result).toEqual({isValid: true});
  });

  test('ValidateTransactionAmountUseCase propaga errores del repositorio', async () => {
    const securityRepository = {
      validateTransactionAmount: jest.fn().mockRejectedValue(new Error('Error de validación')),
    };
    const useCase = new ValidateTransactionAmountUseCase(securityRepository as never);

    await expect(
      useCase.execute({amount: 0, beneficiaryGuid: 'b', accountGuid: 'a', concept: ''}),
    ).rejects.toThrow('Error de validación');
  });

  test('ExecuteTransferUseCase delega al transferRepository', async () => {
    const transferRepository = {
      executeTransfer: jest.fn().mockResolvedValue({transactionIdentifier: 'TXN-123'}),
    };
    const useCase = new ExecuteTransferUseCase(transferRepository as never);

    const params = {
      amount: 200,
      beneficiaryContactGuid: 'ben-002',
      accountGuid: 'acc-002',
      concept: 'Servicios',
    };
    const result = await useCase.execute(params);

    expect(transferRepository.executeTransfer).toHaveBeenCalledWith(params);
    expect(result).toEqual({transactionIdentifier: 'TXN-123'});
  });

  test('ExecuteTransferUseCase propaga errores del repositorio', async () => {
    const transferRepository = {
      executeTransfer: jest.fn().mockRejectedValue(new Error('Transferencia fallida')),
    };
    const useCase = new ExecuteTransferUseCase(transferRepository as never);

    await expect(
      useCase.execute({amount: 50, beneficiaryContactGuid: 'b', accountGuid: 'a', concept: ''}),
    ).rejects.toThrow('Transferencia fallida');
  });
});
