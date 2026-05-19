import {AuthRemoteDataSource} from '../../../src/data/datasources/auth/AuthRemoteDataSource';
import {BeneficiaryRemoteDataSource} from '../../../src/data/datasources/beneficiary/BeneficiaryRemoteDataSource';
import {ContractBalanceRemoteDataSource} from '../../../src/data/datasources/contractBalance/ContractBalanceRemoteDataSource';
import {SecurityRemoteDataSource} from '../../../src/data/datasources/security/SecurityRemoteDataSource';
import {TransactionListRemoteDataSource} from '../../../src/data/datasources/transaction/TransactionListRemoteDataSource';
import {BiometricRemoteDataSource} from '../../../src/data/datasources/biometric/BiometricRemoteDataSource';
import {TransferRemoteDataSource} from '../../../src/data/datasources/transaction/TransferRemoteDataSource';

describe('remote data sources', () => {
  test('AuthRemoteDataSource returns login content on successful response', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {
          code: 200,
          responseType: 'Success',
          message: 'OK',
          content: {accessToken: 'jwt-token'},
        },
      }),
    };
    const dataSource = new AuthRemoteDataSource(httpClient);

    await expect(
      dataSource.login({username: 'cliente@banco.com', password: '123456'}),
    ).resolves.toEqual({accessToken: 'jwt-token'});
    expect(httpClient.post).toHaveBeenCalledWith('Authentication/login', {
      username: 'cliente@banco.com',
      password: '123456',
    });
  });

  test('AuthRemoteDataSource propagates API business errors', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {
          code: 401,
          responseType: 'Error',
          message: 'Credenciales inválidas',
          content: undefined,
        },
      }),
    };
    const dataSource = new AuthRemoteDataSource(httpClient);

    await expect(
      dataSource.login({username: 'cliente@banco.com', password: 'bad-pass'}),
    ).rejects.toThrow('Credenciales inválidas');
  });

  test('AuthRemoteDataSource normalizes non-Error failures', async () => {
    const httpClient = {
      post: jest.fn().mockRejectedValue('network-down'),
    };
    const dataSource = new AuthRemoteDataSource(httpClient);

    await expect(
      dataSource.login({username: 'cliente@banco.com', password: '123456'}),
    ).rejects.toThrow('Error de conexión con el servidor');
  });

  test('SecurityRemoteDataSource returns public key content on success', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {
          code: 200,
          responseType: 'Success',
          message: 'OK',
          content: {publicKey: 'PUBLIC_KEY'},
        },
      }),
    };
    const dataSource = new SecurityRemoteDataSource(httpClient);

    await expect(dataSource.getPublicKey()).resolves.toEqual({
      publicKey: 'PUBLIC_KEY',
    });
  });

  test('SecurityRemoteDataSource propagates API business errors', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {
          code: 500,
          responseType: 'Error',
          message: 'No se pudo obtener la clave pública',
          content: undefined,
        },
      }),
    };
    const dataSource = new SecurityRemoteDataSource(httpClient);

    await expect(dataSource.getPublicKey()).rejects.toThrow(
      'No se pudo obtener la clave pública',
    );
  });

  test('SecurityRemoteDataSource normalizes non-Error failures', async () => {
    const httpClient = {
      get: jest.fn().mockRejectedValue({status: 503}),
    };
    const dataSource = new SecurityRemoteDataSource(httpClient);

    await expect(dataSource.getPublicKey()).rejects.toThrow(
      'Error de conexión con el servidor',
    );
  });

  test('SecurityRemoteDataSource validateOtp returns content on success', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {
          code: 200,
          responseType: 'Success',
          message: 'OK',
          content: {userMessage: 'OTP validado'},
        },
      }),
    };
    const dataSource = new SecurityRemoteDataSource(httpClient);

    await expect(dataSource.validateOtp({otp: '123456'})).resolves.toEqual({
      userMessage: 'OTP validado',
    });
    expect(httpClient.post).toHaveBeenCalledWith('Security/validate-otp', {
      otp: '123456',
    });
  });

  test('SecurityRemoteDataSource validateOtp normalizes non-Error failures', async () => {
    const httpClient = {
      post: jest.fn().mockRejectedValue(undefined),
    };
    const dataSource = new SecurityRemoteDataSource(httpClient);

    await expect(dataSource.validateOtp({otp: '111111'})).rejects.toThrow(
      'Error de conexión con el servidor',
    );
  });

  test('SecurityRemoteDataSource validateOtp propagates API errors', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {
          code: 400,
          responseType: 'Error',
          message: 'Código incorrecto',
          content: undefined,
        },
      }),
    };
    const dataSource = new SecurityRemoteDataSource(httpClient);

    await expect(dataSource.validateOtp({otp: '000000'})).rejects.toThrow(
      'Código incorrecto',
    );
  });

  test('BeneficiaryRemoteDataSource normalizes non-Error failures', async () => {
    const httpClient = {
      get: jest.fn().mockRejectedValue('timeout'),
    };
    const dataSource = new BeneficiaryRemoteDataSource(httpClient);

    await expect(dataSource.getContacts()).rejects.toThrow(
      'Error de conexión con el servidor',
    );
  });

  test('BeneficiaryRemoteDataSource returns contacts on success', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {
          responseType: 'Success',
          message: 'OK',
          content: {contacts: []},
        },
      }),
    };
    const dataSource = new BeneficiaryRemoteDataSource(httpClient);

    await expect(dataSource.getContacts()).resolves.toEqual({contacts: []});
    expect(httpClient.get).toHaveBeenCalledWith('Beneficiary/contacts');
  });

  test('ContractBalanceRemoteDataSource normalizes non-Error failures', async () => {
    const httpClient = {
      get: jest.fn().mockRejectedValue(null),
    };
    const dataSource = new ContractBalanceRemoteDataSource(httpClient);

    await expect(dataSource.getHome()).rejects.toThrow(
      'Error de conexión con el servidor',
    );
  });

  test('ContractBalanceRemoteDataSource returns home balance on success', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {
          responseType: 'Success',
          message: 'OK',
          content: {
            accounts: [],
            creditCards: [],
            loans: [],
            investments: [],
            frequentPayments: [],
          },
        },
      }),
    };
    const dataSource = new ContractBalanceRemoteDataSource(httpClient);

    const result = await dataSource.getHome();

    expect(result.accounts).toEqual([]);
    expect(httpClient.get).toHaveBeenCalledWith('ContractBalance/home');
  });
});

// ── TransactionListRemoteDataSource ──────────────────────────────────────────
describe('TransactionListRemoteDataSource', () => {
  test('retorna el contenido de transacciones con parámetros mínimos', async () => {
    const content = {totalCount: 1, pageNumber: 1, pageSize: 20, items: []};
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {responseType: 'Success', message: 'OK', content},
      }),
    };
    const ds = new TransactionListRemoteDataSource(httpClient);

    const result = await ds.getTransactionPage({
      AccountGuid: 'acc-001',
      PageNumber: 1,
      PageSize: 20,
    });

    expect(result).toEqual(content);
    expect(httpClient.get).toHaveBeenCalledWith('Transaction', {
      params: {AccountGuid: 'acc-001', PageNumber: '1', PageSize: '20'},
    });
  });

  test('incluye parámetros opcionales en la query cuando se proveen', async () => {
    const content = {totalCount: 0, pageNumber: 1, pageSize: 10, items: []};
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {responseType: 'Success', message: 'OK', content},
      }),
    };
    const ds = new TransactionListRemoteDataSource(httpClient);

    await ds.getTransactionPage({
      AccountGuid: 'acc-001',
      PageNumber: 1,
      PageSize: 10,
      DateFrom: '2026-01-01',
      DateTo: '2026-04-01',
      TransactionType: 'Deposits',
      MinAmount: '10',
      MaxAmount: '500',
      TextSearch: 'nómina',
    });

    const calledParams = httpClient.get.mock.calls[0][1].params;
    expect(calledParams.DateFrom).toBe('2026-01-01');
    expect(calledParams.DateTo).toBe('2026-04-01');
    expect(calledParams.TransactionType).toBe('Deposits');
    expect(calledParams.MinAmount).toBe('10');
    expect(calledParams.MaxAmount).toBe('500');
    expect(calledParams.TextSearch).toBe('nómina');
  });

  test('no incluye parámetros opcionales cuando están ausentes', async () => {
    const content = {totalCount: 0, pageNumber: 1, pageSize: 20, items: []};
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {responseType: 'Success', message: 'OK', content},
      }),
    };
    const ds = new TransactionListRemoteDataSource(httpClient);

    await ds.getTransactionPage({AccountGuid: 'acc', PageNumber: 1, PageSize: 20});

    const calledParams = httpClient.get.mock.calls[0][1].params;
    expect(calledParams.DateFrom).toBeUndefined();
    expect(calledParams.TransactionType).toBeUndefined();
    expect(calledParams.TextSearch).toBeUndefined();
  });

  test('lanza error cuando responseType es Error', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {responseType: 'Error', message: 'Sin movimientos', content: null},
      }),
    };
    const ds = new TransactionListRemoteDataSource(httpClient);

    await expect(
      ds.getTransactionPage({AccountGuid: 'acc', PageNumber: 1, PageSize: 20}),
    ).rejects.toThrow('Sin movimientos');
  });

  test('lanza error con mensaje por defecto cuando content es nulo y no hay message', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {responseType: 'Error', message: '', content: null},
      }),
    };
    const ds = new TransactionListRemoteDataSource(httpClient);

    await expect(
      ds.getTransactionPage({AccountGuid: 'acc', PageNumber: 1, PageSize: 20}),
    ).rejects.toThrow('No se pudieron cargar los movimientos');
  });

  test('normaliza errores de red no-Error', async () => {
    const httpClient = {get: jest.fn().mockRejectedValue('timeout')};
    const ds = new TransactionListRemoteDataSource(httpClient);

    await expect(
      ds.getTransactionPage({AccountGuid: 'acc', PageNumber: 1, PageSize: 20}),
    ).rejects.toThrow('Error de conexión con el servidor');
  });

  test('relanza errores de tipo Error directamente', async () => {
    const httpClient = {
      get: jest.fn().mockRejectedValue(new Error('DNS lookup failed')),
    };
    const ds = new TransactionListRemoteDataSource(httpClient);

    await expect(
      ds.getTransactionPage({AccountGuid: 'acc', PageNumber: 1, PageSize: 20}),
    ).rejects.toThrow('DNS lookup failed');
  });
});

// ── BiometricRemoteDataSource ─────────────────────────────────────────────────
describe('BiometricRemoteDataSource', () => {
  // postBiometricChallenge
  test('postBiometricChallenge retorna el content en caso de éxito', async () => {
    const challengeContent = {challenge: 'abc123', sessionId: 'sess-001'};
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Success', message: 'OK', content: challengeContent},
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    const result = await ds.postBiometricChallenge({email: 'u@b.com', publicKey: 'PK'});

    expect(result).toEqual(challengeContent);
    expect(httpClient.post).toHaveBeenCalledWith('Security/biometric-challenge', {
      email: 'u@b.com',
      publicKey: 'PK',
    });
  });

  test('postBiometricChallenge lanza error cuando responseType es Error', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Error', message: 'No autorizado', content: null},
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    await expect(
      ds.postBiometricChallenge({email: 'u@b.com', publicKey: 'PK'}),
    ).rejects.toThrow('No autorizado');
  });

  test('postBiometricChallenge lanza error cuando content.challenge está vacío', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {
          responseType: 'Success',
          message: '',
          content: {challenge: '', sessionId: ''},
        },
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    await expect(
      ds.postBiometricChallenge({email: 'u@b.com', publicKey: 'PK'}),
    ).rejects.toThrow('No se pudo obtener el challenge biométrico');
  });

  // postBiometricRegistration
  test('postBiometricRegistration resuelve sin error en caso de éxito', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Success', message: 'OK', content: null},
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    await expect(
      ds.postBiometricRegistration({email: 'u@b.com', publicKey: 'PK', signature: 'sig'}),
    ).resolves.toBeUndefined();
  });

  test('postBiometricRegistration lanza error cuando responseType es Error', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Error', message: 'Registro fallido', content: null},
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    await expect(
      ds.postBiometricRegistration({email: 'u@b.com', publicKey: 'PK', signature: 'sig'}),
    ).rejects.toThrow('Registro fallido');
  });

  test('postBiometricRegistration lanza mensaje por defecto cuando no hay message', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Error', message: '', content: null},
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    await expect(
      ds.postBiometricRegistration({email: 'u@b.com', publicKey: 'PK', signature: 'sig'}),
    ).rejects.toThrow('No se pudo completar el registro biométrico');
  });

  // postBiometricLogin
  test('postBiometricLogin retorna content con accessToken en caso de éxito', async () => {
    const loginContent = {accessToken: 'bio-jwt', sessionTimeSeconds: 3600};
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Success', message: 'OK', content: loginContent},
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    const result = await ds.postBiometricLogin({
      email: 'u@b.com',
      signature: 'sig',
      challenge: 'chal',
    });

    expect(result).toEqual(loginContent);
    expect(httpClient.post).toHaveBeenCalledWith('Authentication/biometric-login', {
      email: 'u@b.com',
      signature: 'sig',
      challenge: 'chal',
    });
  });

  test('postBiometricLogin lanza error cuando responseType es Error', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Error', message: 'Biometría inválida', content: null},
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    await expect(
      ds.postBiometricLogin({email: 'u@b.com', signature: 'sig', challenge: 'chal'}),
    ).rejects.toThrow('Biometría inválida');
  });

  test('postBiometricLogin lanza error cuando accessToken está ausente', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Success', message: '', content: {accessToken: ''}},
      }),
    };
    const ds = new BiometricRemoteDataSource(httpClient);

    await expect(
      ds.postBiometricLogin({email: 'u@b.com', signature: 'sig', challenge: 'chal'}),
    ).rejects.toThrow('No se pudo iniciar sesión con biometría');
  });
});

// ── TransferRemoteDataSource ──────────────────────────────────────────────────
describe('TransferRemoteDataSource', () => {
  test('transfer retorna el content en caso de éxito', async () => {
    const transferContent = {transactionIdentifier: 'TXN-001'};
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Success', message: 'OK', content: transferContent},
      }),
    };
    const ds = new TransferRemoteDataSource(httpClient);

    const result = await ds.transfer({
      amount: 50,
      beneficiaryContactGuid: 'ben-001',
      accountGuid: 'acc-001',
      concept: 'Pago',
    });

    expect(result).toEqual(transferContent);
    expect(httpClient.post).toHaveBeenCalledWith('Transaction/transfer', {
      amount: 50,
      beneficiaryContactGuid: 'ben-001',
      accountGuid: 'acc-001',
      concept: 'Pago',
    });
  });

  test('transfer lanza error cuando responseType es Error', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {
          responseType: 'Error',
          message: 'Fondos insuficientes',
          content: null,
        },
      }),
    };
    const ds = new TransferRemoteDataSource(httpClient);

    await expect(
      ds.transfer({
        amount: 999,
        beneficiaryContactGuid: 'ben-001',
        accountGuid: 'acc-001',
        concept: '',
      }),
    ).rejects.toThrow('Fondos insuficientes');
  });

  test('transfer lanza mensaje por defecto cuando no hay content ni message', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: {responseType: 'Error', message: '', content: null},
      }),
    };
    const ds = new TransferRemoteDataSource(httpClient);

    await expect(
      ds.transfer({amount: 10, beneficiaryContactGuid: 'b', accountGuid: 'a', concept: ''}),
    ).rejects.toThrow('No se pudo completar la transferencia');
  });

  test('transfer normaliza errores de red no-Error', async () => {
    const httpClient = {post: jest.fn().mockRejectedValue('network-error')};
    const ds = new TransferRemoteDataSource(httpClient);

    await expect(
      ds.transfer({amount: 10, beneficiaryContactGuid: 'b', accountGuid: 'a', concept: ''}),
    ).rejects.toThrow('Error de conexión con el servidor');
  });

  test('transfer relanza errores de tipo Error directamente', async () => {
    const httpClient = {
      post: jest.fn().mockRejectedValue(new Error('SSL error')),
    };
    const ds = new TransferRemoteDataSource(httpClient);

    await expect(
      ds.transfer({amount: 10, beneficiaryContactGuid: 'b', accountGuid: 'a', concept: ''}),
    ).rejects.toThrow('SSL error');
  });

  test('getTransactions retorna arreglo vacío', async () => {
    const httpClient = {post: jest.fn()};
    const ds = new TransferRemoteDataSource(httpClient);
    await expect(ds.getTransactions()).resolves.toEqual([]);
  });
});
