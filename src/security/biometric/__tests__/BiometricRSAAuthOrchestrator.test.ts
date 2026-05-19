import axios from 'axios';
import {BiometricRSAAuthOrchestrator} from '../BiometricRSAAuthOrchestrator';
import type {BiometricRemoteDataSource} from '../../../data/datasources/biometric/BiometricRemoteDataSource';
import type {CryptoService} from '../CryptoService';
import type {BiometricKeyStorageService} from '../BiometricKeyStorageService';
import type {SecureStorageService} from '../../../domain/services/SecureStorageService';
import type {GetPublicKeyUseCase} from '../../../domain/usecases/GetPublicKeyUseCase';
import type {RunCertificateHandshakeUseCase} from '../../../domain/usecases/RunCertificateHandshakeUseCase';
import type {BiometricAuthService} from '../../../domain/services/BiometricAuthService';
import {SecureStorageKeys} from '../../../data/datasources/storage/SecureStorageKeys';
import {SERVER_PUBLIC_KEY_PEM_BASE64} from '../../certificate/keys.constants';
import {BiometricRSAError} from '../errors';
import type {BiometricEnrollmentBinding} from '../BiometricEnrollmentBinding';
describe('BiometricRSAAuthOrchestrator', () => {
  const serverPem = SERVER_PUBLIC_KEY_PEM_BASE64;

  function buildOrchestrator(mocks: {
    remote: jest.Mocked<Pick<BiometricRemoteDataSource, 'postBiometricChallenge' | 'postBiometricRegistration' | 'postBiometricLogin'>>;
    crypto: jest.Mocked<CryptoService>;
    keyStorage: jest.Mocked<
      Pick<
        BiometricKeyStorageService,
        'savePrivateKey' | 'getPrivateKey' | 'hasPrivateKey' | 'deletePrivateKey'
      >
    >;
    secure: jest.Mocked<Pick<SecureStorageService, 'get' | 'save' | 'remove'>>;
    runCert?: jest.Mocked<Pick<RunCertificateHandshakeUseCase, 'execute'>>;
    getPk: jest.Mocked<Pick<GetPublicKeyUseCase, 'execute'>>;
    biometricAuth?: jest.Mocked<Pick<BiometricAuthService, 'getAvailability' | 'authenticate'>>;
    enrollmentBinding?: {
      snapshot: jest.Mock;
      verify: jest.Mock;
      clear: jest.Mock;
    };
  }) {
    const biometricAuth =
      mocks.biometricAuth ??
      ({
        getAvailability: jest.fn().mockResolvedValue({available: true}),
        authenticate: jest.fn().mockResolvedValue(undefined),
      } as jest.Mocked<Pick<BiometricAuthService, 'getAvailability' | 'authenticate'>>);

    const keyStorage = {
      deletePrivateKey: jest.fn().mockResolvedValue(undefined),
      ...mocks.keyStorage,
    } as unknown as BiometricKeyStorageService;

    const secure = {
      remove: jest.fn().mockResolvedValue(undefined),
      ...mocks.secure,
    } as unknown as SecureStorageService;

    const enrollmentBinding = mocks.enrollmentBinding ?? {
      snapshot: jest.fn().mockResolvedValue(undefined),
      verify: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    const runCert =
      mocks.runCert ??
      ({execute: jest.fn().mockResolvedValue(undefined)} as jest.Mocked<
        Pick<RunCertificateHandshakeUseCase, 'execute'>
      >);

    return new BiometricRSAAuthOrchestrator(
      mocks.remote as unknown as BiometricRemoteDataSource,
      mocks.crypto as unknown as CryptoService,
      keyStorage,
      secure,
      runCert as unknown as RunCertificateHandshakeUseCase,
      mocks.getPk as unknown as GetPublicKeyUseCase,
      biometricAuth as unknown as BiometricAuthService,
      enrollmentBinding as unknown as BiometricEnrollmentBinding,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registerBiometricForUser completes challenge, registration, storage', async () => {
    const remote = {
      postBiometricChallenge: jest.fn().mockResolvedValue({challenge: 'ch1'}),
      postBiometricRegistration: jest.fn().mockResolvedValue(undefined),
      postBiometricLogin: jest.fn(),
    };
    const crypto = {
      generateKeyPair: jest.fn().mockResolvedValue({
        publicKeyPem: '-----BEGIN PUBLIC KEY-----\nabc\n-----END PUBLIC KEY-----',
        privateKeyPem: '-----BEGIN PRIVATE KEY-----\ndef\n-----END PRIVATE KEY-----',
      }),
      signChallenge: jest.fn().mockResolvedValue('sigb64'),
      getPublicKeyBase64FromPem: jest.fn().mockReturnValue('cHVibGtleWI2NA=='),
      clearMemoryKeys: jest.fn(),
    };
    const keyStorage = {
      savePrivateKey: jest.fn().mockResolvedValue(undefined),
      getPrivateKey: jest.fn(),
      hasPrivateKey: jest.fn(),
    };
    const secure = {
      get: jest.fn().mockResolvedValue(serverPem),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const getPk = {
      execute: jest.fn().mockResolvedValue({value: serverPem}),
    };
    const getAvailability = jest
      .fn()
      .mockResolvedValue({available: true, biometryType: 'FaceID'});
    const authenticate = jest.fn().mockResolvedValue(undefined);

    const enrollmentBinding = {
      snapshot: jest.fn().mockResolvedValue(undefined),
      verify: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const orchestrator = buildOrchestrator({
      remote,
      crypto,
      keyStorage,
      secure,
      getPk,
      biometricAuth: {getAvailability, authenticate},
      enrollmentBinding,    });

    await orchestrator.registerBiometricForUser('user@test.com');

    expect(enrollmentBinding.snapshot).toHaveBeenCalled();
    expect(getAvailability).toHaveBeenCalled();
    expect(authenticate).toHaveBeenCalled();    expect(remote.postBiometricChallenge).toHaveBeenCalled();
    expect(remote.postBiometricRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge: 'ch1',
        challengeSignBase64: 'sigb64',
        mobilePublicKeyBase64: 'cHVibGtleWI2NA==',
      }),
    );
    expect(keyStorage.savePrivateKey).toHaveBeenCalled();
    expect(secure.save).toHaveBeenCalledWith(
      SecureStorageKeys.BIOMETRIC_USERNAME,
      'user@test.com',
    );
    expect(crypto.clearMemoryKeys).toHaveBeenCalled();
  });

  it('registerBiometricForUser falla si biometría no disponible', async () => {
    const orchestrator = buildOrchestrator({
      remote: {
        postBiometricChallenge: jest.fn(),
        postBiometricRegistration: jest.fn(),
        postBiometricLogin: jest.fn(),
      },
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn(),
      },
      secure: {get: jest.fn(), save: jest.fn()},
      getPk: {execute: jest.fn()},
      biometricAuth: {
        getAvailability: jest.fn().mockResolvedValue({
          available: false,
          error: 'No sensor',
        }),
        authenticate: jest.fn(),
      },
    });

    await expect(
      orchestrator.registerBiometricForUser('u@x.com'),
    ).rejects.toMatchObject({code: 'not_available'});
  });
  it('loginWithBiometric posts login with signed challenge', async () => {
    const remote = {
      postBiometricChallenge: jest.fn().mockResolvedValue({challenge: 'ch2'}),
      postBiometricRegistration: jest.fn(),
      postBiometricLogin: jest.fn().mockResolvedValue({
        accessToken: 'tok',
        firstName: 'Usuario',
        sessionTimeSeconds: 3600,
        inactivityTimeoutSeconds: 300,
      }),
    };
    const crypto = {
      generateKeyPair: jest.fn(),
      signChallenge: jest.fn().mockResolvedValue('sign2'),
      getPublicKeyBase64FromPem: jest.fn(),
      clearMemoryKeys: jest.fn(),
    };
    const keyStorage = {
      savePrivateKey: jest.fn(),
      getPrivateKey: jest.fn().mockResolvedValue('-----BEGIN PRIVATE KEY-----\nx\n-----END PRIVATE KEY-----'),
      hasPrivateKey: jest.fn().mockResolvedValue(true),
    };
    const secure = {
      get: jest.fn((key: string) => {
        if (key === SecureStorageKeys.BIOMETRIC_USERNAME) {
          return Promise.resolve('user@test.com');
        }
        return Promise.resolve(null);
      }),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const runCert = {execute: jest.fn().mockResolvedValue(undefined)};
    const getPk = {
      execute: jest.fn().mockResolvedValue({value: serverPem}),
    };
    const enrollmentBinding = {
      snapshot: jest.fn().mockResolvedValue(undefined),
      verify: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const orchestrator = buildOrchestrator({
      remote,
      crypto,
      keyStorage,
      secure,
      runCert,
      getPk,
      enrollmentBinding,
    });

    const result = await orchestrator.loginWithBiometric();

    expect(runCert.execute).toHaveBeenCalled();
    expect(enrollmentBinding.verify).toHaveBeenCalled();
    expect(result.token).toBe('tok');
    expect(result.email).toBe('user@test.com');
    expect(result.firstName).toBe('Usuario');
    expect(result.name).toBe('Usuario');
    expect(remote.postBiometricLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge: 'ch2',
        challengeSignBase64: 'sign2',
      }),
    );
    const loginDataSave = secure.save.mock.calls.find(
      c => c[0] === SecureStorageKeys.USER_LOGIN_DATA,
    );
    expect(loginDataSave).toBeDefined();
    expect(JSON.parse(String(loginDataSave?.[1]))).toMatchObject({
      email: 'user@test.com',
      firstName: 'Usuario',
      token: 'tok',
    });
  });

  it('loginWithBiometric falla si enrollmentBinding.verify detecta cambio', async () => {
    const deletePrivateKey = jest.fn().mockResolvedValue(undefined);
    const remove = jest.fn().mockResolvedValue(undefined);
    const enrollmentBinding = {
      snapshot: jest.fn().mockResolvedValue(undefined),
      verify: jest
        .fn()
        .mockRejectedValue(
          new BiometricRSAError('cambio', 'biometric_enrollment_changed'),
        ),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const remote = {
      postBiometricChallenge: jest.fn(),
      postBiometricRegistration: jest.fn(),
      postBiometricLogin: jest.fn(),
    };
    const orchestrator = buildOrchestrator({
      remote,
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn().mockResolvedValue(true),
        deletePrivateKey,
      },
      secure: {
        get: jest.fn((key: string) => {
          if (key === SecureStorageKeys.BIOMETRIC_USERNAME) {
            return Promise.resolve('user@test.com');
          }
          return Promise.resolve(null);
        }),
        save: jest.fn(),
        remove,
      },
      getPk: {execute: jest.fn()},
      enrollmentBinding,
    });

    await expect(orchestrator.loginWithBiometric()).rejects.toMatchObject({
      code: 'biometric_enrollment_changed',
    });
    expect(enrollmentBinding.clear).toHaveBeenCalled();
    expect(deletePrivateKey).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(SecureStorageKeys.BIOMETRIC_USERNAME);
  });

  it('loginWithBiometric limpia registro local si cambió el conjunto biométrico', async () => {
    const deletePrivateKey = jest.fn().mockResolvedValue(undefined);
    const remove = jest.fn().mockResolvedValue(undefined);
    const remote = {
      postBiometricChallenge: jest.fn().mockResolvedValue({challenge: 'ch2'}),
      postBiometricRegistration: jest.fn(),
      postBiometricLogin: jest.fn(),
    };
    const crypto = {
      generateKeyPair: jest.fn(),
      signChallenge: jest.fn(),
      getPublicKeyBase64FromPem: jest.fn(),
      clearMemoryKeys: jest.fn(),
    };
    const keyStorage = {
      savePrivateKey: jest.fn(),
      getPrivateKey: jest.fn().mockRejectedValue(
        new BiometricRSAError('cambio', 'biometric_enrollment_changed'),
      ),
      hasPrivateKey: jest.fn().mockResolvedValue(true),
      deletePrivateKey,
    };
    const secure = {
      get: jest.fn((key: string) => {
        if (key === SecureStorageKeys.BIOMETRIC_USERNAME) {
          return Promise.resolve('user@test.com');
        }
        return Promise.resolve(null);
      }),
      save: jest.fn(),
      remove,
    };
    const getPk = {
      execute: jest.fn().mockResolvedValue({value: serverPem}),
    };

    const orchestrator = buildOrchestrator({
      remote,
      crypto,
      keyStorage,
      secure,
      getPk,
    });

    await expect(orchestrator.loginWithBiometric()).rejects.toMatchObject({
      code: 'biometric_enrollment_changed',
    });
    expect(deletePrivateKey).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(SecureStorageKeys.BIOMETRIC_USERNAME);
  });
  it('registerBiometricForUser rechaza email vacío', async () => {
    const orchestrator = buildOrchestrator({
      remote: {
        postBiometricChallenge: jest.fn(),
        postBiometricRegistration: jest.fn(),
        postBiometricLogin: jest.fn(),
      },
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn(),
      },
      secure: {get: jest.fn(), save: jest.fn()},
      getPk: {execute: jest.fn()},
    });

    await expect(orchestrator.registerBiometricForUser('  ')).rejects.toMatchObject(
      {code: 'unknown', message: 'El usuario es requerido'},
    );
  });

  it('registerBiometricForUser obtiene PEM vía GetPublicKeyUseCase cuando la sesión aún no tiene la clave', async () => {
    const remote = {
      postBiometricChallenge: jest.fn().mockResolvedValue({challenge: 'c'}),
      postBiometricRegistration: jest.fn().mockResolvedValue(undefined),
      postBiometricLogin: jest.fn(),
    };
    const crypto = {
      generateKeyPair: jest.fn().mockResolvedValue({
        publicKeyPem: '-----BEGIN PUBLIC KEY-----\nA\n-----END PUBLIC KEY-----',
        privateKeyPem: '-----BEGIN PRIVATE KEY-----\nB\n-----END PRIVATE KEY-----',
      }),
      signChallenge: jest.fn().mockResolvedValue('sig'),
      getPublicKeyBase64FromPem: jest.fn().mockReturnValue('cGw='),
      clearMemoryKeys: jest.fn(),
    };
    const keyStorage = {
      savePrivateKey: jest.fn().mockResolvedValue(undefined),
      getPrivateKey: jest.fn(),
      hasPrivateKey: jest.fn(),
    };
    const secure = {
      get: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const getPk = {
      execute: jest.fn().mockResolvedValue({value: serverPem}),
    };

    const orchestrator = buildOrchestrator({
      remote,
      crypto,
      keyStorage,
      secure,
      getPk,
    });

    await orchestrator.registerBiometricForUser('u@x.com');
    expect(getPk.execute).toHaveBeenCalled();
    expect(remote.postBiometricChallenge).toHaveBeenCalled();
  });

  it('registerBiometricForUser llama clearMemoryKeys ante error y re-lanza BiometricRSAError', async () => {
    const remote = {
      postBiometricChallenge: jest
        .fn()
        .mockRejectedValue(new Error('challenge fail')),
      postBiometricRegistration: jest.fn(),
      postBiometricLogin: jest.fn(),
    };
    const crypto = {
      generateKeyPair: jest.fn(),
      signChallenge: jest.fn(),
      getPublicKeyBase64FromPem: jest.fn(),
      clearMemoryKeys: jest.fn(),
    };
    const orchestrator = buildOrchestrator({
      remote,
      crypto,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn(),
      },
      secure: {
        get: jest.fn().mockResolvedValue(serverPem),
        save: jest.fn(),
      },
      getPk: {
        execute: jest.fn().mockResolvedValue({value: serverPem}),
      },
    });

    await expect(
      orchestrator.registerBiometricForUser('u@x.com'),
    ).rejects.toMatchObject({message: 'challenge fail'});
    expect(crypto.clearMemoryKeys).toHaveBeenCalled();
  });

  it('loginWithBiometric falla sin usuario almacenado', async () => {
    const orchestrator = buildOrchestrator({
      remote: {
        postBiometricChallenge: jest.fn(),
        postBiometricRegistration: jest.fn(),
        postBiometricLogin: jest.fn(),
      },
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn().mockResolvedValue(true),
      },
      secure: {
        get: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      },
      getPk: {execute: jest.fn()},
    });

    await expect(orchestrator.loginWithBiometric()).rejects.toMatchObject({
      code: 'no_stored_username',
    });
  });

  it('loginWithBiometric trata ausencia de clave (p. ej. ítem invalidado) como cambio biométrico', async () => {
    const deletePrivateKey = jest.fn().mockResolvedValue(undefined);
    const remove = jest.fn().mockResolvedValue(undefined);    const orchestrator = buildOrchestrator({
      remote: {
        postBiometricChallenge: jest.fn(),
        postBiometricRegistration: jest.fn(),
        postBiometricLogin: jest.fn(),
      },
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn().mockResolvedValue(false),
        deletePrivateKey,      },
      secure: {
        get: jest.fn((key: string) =>
          key === SecureStorageKeys.BIOMETRIC_USERNAME
            ? Promise.resolve('u@x.com')
            : Promise.resolve(null),
        ),
        save: jest.fn(),
        remove,      },
      getPk: {execute: jest.fn()},
    });

    await expect(orchestrator.loginWithBiometric()).rejects.toMatchObject({
      code: 'biometric_enrollment_changed',
    });
    expect(deletePrivateKey).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(SecureStorageKeys.BIOMETRIC_USERNAME);
  });

  it('loginWithBiometric trata no_private_key al leer clave como cambio biométrico', async () => {
    const deletePrivateKey = jest.fn().mockResolvedValue(undefined);
    const remove = jest.fn().mockResolvedValue(undefined);
    const remote = {
      postBiometricChallenge: jest.fn().mockResolvedValue({challenge: 'ch2'}),
      postBiometricRegistration: jest.fn(),
      postBiometricLogin: jest.fn(),
    };
    const orchestrator = buildOrchestrator({
      remote,
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest
          .fn()
          .mockRejectedValue(
            new BiometricRSAError('No hay clave', 'no_private_key'),
          ),
        hasPrivateKey: jest.fn().mockResolvedValue(true),
        deletePrivateKey,
      },
      secure: {
        get: jest.fn((key: string) => {
          if (key === SecureStorageKeys.BIOMETRIC_USERNAME) {
            return Promise.resolve('u@x.com');
          }
          return Promise.resolve(null);
        }),
        save: jest.fn(),
        remove,
      },
      getPk: {
        execute: jest.fn().mockResolvedValue({value: serverPem}),
      },
    });

    await expect(orchestrator.loginWithBiometric()).rejects.toMatchObject({
      code: 'biometric_enrollment_changed',
    });
    expect(deletePrivateKey).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(SecureStorageKeys.BIOMETRIC_USERNAME);
  });

  it('mapUnknownError convierte AxiosError en network_error con mensaje del body', async () => {
    const axiosErr = new axios.AxiosError('fail');
    axiosErr.response = {
      data: {message: 'Sesión inválida'},
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as never,
    };

    const remote = {
      postBiometricChallenge: jest.fn().mockRejectedValue(axiosErr),
      postBiometricRegistration: jest.fn(),
      postBiometricLogin: jest.fn(),
    };
    const orchestrator = buildOrchestrator({
      remote,
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn().mockResolvedValue(true),
      },
      secure: {
        get: jest.fn((key: string) => {
          if (key === SecureStorageKeys.BIOMETRIC_USERNAME) {
            return Promise.resolve('u@x.com');
          }
          return Promise.resolve(null);
        }),
        save: jest.fn(),
      },
      getPk: {
        execute: jest.fn().mockResolvedValue({value: serverPem}),
      },
    });

    await expect(orchestrator.loginWithBiometric()).rejects.toMatchObject({
      code: 'network_error',
      message: 'Sesión inválida',
    });
  });

  it('mapUnknownError preserva BiometricRSAError', async () => {
    const inner = new BiometricRSAError('clave', 'no_private_key');
    const remote = {
      postBiometricChallenge: jest.fn().mockRejectedValue(inner),
      postBiometricRegistration: jest.fn(),
      postBiometricLogin: jest.fn(),
    };
    const orchestrator = buildOrchestrator({
      remote,
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn().mockResolvedValue(true),
      },
      secure: {
        get: jest.fn((key: string) =>
          key === SecureStorageKeys.BIOMETRIC_USERNAME
            ? Promise.resolve('u@x.com')
            : Promise.resolve(null),
        ),
        save: jest.fn(),
      },
      getPk: {
        execute: jest.fn().mockResolvedValue({value: serverPem}),
      },
    });

    await expect(orchestrator.loginWithBiometric()).rejects.toBe(inner);
  });

  it('hasBiometricRegistration es false sin usuario', async () => {
    const orchestrator = buildOrchestrator({
      remote: {
        postBiometricChallenge: jest.fn(),
        postBiometricRegistration: jest.fn(),
        postBiometricLogin: jest.fn(),
      },
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn(),
      },
      secure: {
        get: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      },
      getPk: {execute: jest.fn()},
    });
    await expect(orchestrator.hasBiometricRegistration()).resolves.toBe(false);
  });

  it('hasBiometricRegistration delega en keyStorage cuando hay usuario', async () => {
    const hasPrivateKey = jest.fn().mockResolvedValue(true);
    const orchestrator = buildOrchestrator({
      remote: {
        postBiometricChallenge: jest.fn(),
        postBiometricRegistration: jest.fn(),
        postBiometricLogin: jest.fn(),
      },
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey,
      },
      secure: {
        get: jest.fn().mockResolvedValue('u@x.com'),
        save: jest.fn(),
      },
      getPk: {execute: jest.fn()},
    });
    await expect(orchestrator.hasBiometricRegistration()).resolves.toBe(true);
    expect(hasPrivateKey).toHaveBeenCalled();
  });

  it('clearBiometricRegistration limpia clave, usuario y binding', async () => {
    const deletePrivateKey = jest.fn().mockResolvedValue(undefined);
    const remove = jest.fn().mockResolvedValue(undefined);
    const enrollmentClear = jest.fn().mockResolvedValue(undefined);
    const orchestrator = buildOrchestrator({
      remote: {
        postBiometricChallenge: jest.fn(),
        postBiometricRegistration: jest.fn(),
        postBiometricLogin: jest.fn(),
      },
      crypto: {
        generateKeyPair: jest.fn(),
        signChallenge: jest.fn(),
        getPublicKeyBase64FromPem: jest.fn(),
        clearMemoryKeys: jest.fn(),
      } as unknown as jest.Mocked<CryptoService>,
      keyStorage: {
        savePrivateKey: jest.fn(),
        getPrivateKey: jest.fn(),
        hasPrivateKey: jest.fn(),
        deletePrivateKey,
      },
      secure: {
        get: jest.fn(),
        save: jest.fn(),
        remove,
      },
      getPk: {execute: jest.fn()},
      enrollmentBinding: {
        snapshot: jest.fn(),
        verify: jest.fn(),
        clear: enrollmentClear,
      },
    });

    await orchestrator.clearBiometricRegistration();

    expect(deletePrivateKey).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(SecureStorageKeys.BIOMETRIC_USERNAME);
    expect(enrollmentClear).toHaveBeenCalled();
  });
});
