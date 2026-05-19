import * as Keychain from 'react-native-keychain';
import {Platform} from 'react-native';
import {SecureStorageKeys} from '../../../data/datasources/storage/SecureStorageKeys';
import type {BiometricAuthService} from '../../../domain/services/BiometricAuthService';
import type {SecureStorageService} from '../../../domain/services/SecureStorageService';
import {
  BiometricKeyStorageService,
  mapKeychainError,
} from '../BiometricKeyStorageService';
import {BiometricRSAError} from '../errors';

describe('BiometricKeyStorageService', () => {
  const save = jest.fn(() => Promise.resolve());
  const get = jest.fn(() => Promise.resolve(null));
  const remove = jest.fn(() => Promise.resolve());
  const clear = jest.fn(() => Promise.resolve());
  const mockSecureStorage: SecureStorageService = {
    save,
    get,
    remove,
    clear,
  };
  const authenticate = jest.fn(() => Promise.resolve());
  const mockBiometricAuth: BiometricAuthService = {
    getAvailability: jest.fn(),
    authenticate,
  };
  const service = new BiometricKeyStorageService(
    mockSecureStorage,
    mockBiometricAuth,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    get.mockResolvedValue(null);
  });

  it('savePrivateKey elimina entrada previa antes de guardar', async () => {
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);
    await service.savePrivateKey('pem');
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'com.bbapp.biometric.rsa.private.v2',
    });
    expect(remove).toHaveBeenCalledWith(
      SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND,
    );
    expect(remove).toHaveBeenCalledWith(
      SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM,
    );
    expect(Keychain.setGenericPassword).toHaveBeenCalled();
  });
  it('savePrivateKey lanza si setGenericPassword devuelve false', async () => {
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(false);
    await expect(service.savePrivateKey('pem')).rejects.toMatchObject({
      code: 'keychain_error',
      message: 'No se pudo guardar la clave privada',
    });
  });

  it('savePrivateKey propaga opciones de prompt (Android con subtitle)', async () => {
    const prev = Platform.OS;
    Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);
    await service.savePrivateKey('my-pem');
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      expect.any(String),
      'my-pem',
      expect.objectContaining({
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        authenticationPrompt: expect.objectContaining({
          subtitle: expect.any(String),
        }),
      }),
    );
    Object.defineProperty(Platform, 'OS', {value: prev, configurable: true});
  });

  it('getPrivateKey lanza no_private_key si no hay credenciales', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);
    await expect(service.getPrivateKey()).rejects.toMatchObject({
      code: 'no_private_key',
    });
  });

  it('getPrivateKey lanza no_private_key si password vacío', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
      username: 'u',
      password: '   ',
    });
    await expect(service.getPrivateKey()).rejects.toMatchObject({
      code: 'no_private_key',
    });
  });

  it('getPrivateKey devuelve password cuando existe', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
      username: 'u',
      password: 'pem-content',
    });
    await expect(service.getPrivateKey()).resolves.toBe('pem-content');
  });

  it('getPrivateKey mapea cancelación del usuario', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('User canceled the operation'),
    );
    await expect(service.getPrivateKey()).rejects.toMatchObject({
      code: 'user_cancelled',
    });
  });

  it('getPrivateKey mapea fallo de biometría', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Biometry is not enrolled'),
    );
    await expect(service.getPrivateKey()).rejects.toMatchObject({
      code: 'prompt_failed',
    });
  });

  it('getPrivateKey re-lanza BiometricRSAError sin envolver', async () => {
    const err = new BiometricRSAError('x', 'no_private_key');
    (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(err);
    await expect(service.getPrivateKey()).rejects.toBe(err);
  });

  it('getPrivateKey mapea errores genéricos del keychain', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Keychain read failed'),
    );
    await expect(service.getPrivateKey()).rejects.toMatchObject({
      code: 'keychain_error',
    });
  });

  it('getPrivateKey mapea cambio de conjunto biométrico', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Key permanently invalidated'),
    );
    await expect(service.getPrivateKey()).rejects.toMatchObject({
      code: 'biometric_enrollment_changed',
    });
  });

  it('getPrivateKey mapea IllegalBlockSize como cambio biométrico (re-registro)', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Wrapped error: javax.crypto.IllegalBlockSizeException'),
    );
    await expect(service.getPrivateKey()).rejects.toMatchObject({
      code: 'biometric_enrollment_changed',
    });
  });

  it('savePrivateKey en iOS con IllegalBlockSize falla (sin fallback)', async () => {
    const prev = Platform.OS;
    Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
    (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Wrapped error: javax.crypto.IllegalBlockSizeException'),
    );
    await expect(service.savePrivateKey('pem')).rejects.toMatchObject({
      code: 'keychain_error',
    });
    Object.defineProperty(Platform, 'OS', {value: prev, configurable: true});
  });

  it('savePrivateKey en Android ante IllegalBlockSize usa EncryptedStorage', async () => {
    const prev = Platform.OS;
    Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
    (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Wrapped error: javax.crypto.IllegalBlockSizeException'),
    );
    await service.savePrivateKey('my-pem-key');
    expect(save).toHaveBeenCalledWith(
      SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND,
      'encrypted_storage',
    );
    expect(save).toHaveBeenCalledWith(
      SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM,
      'my-pem-key',
    );
    Object.defineProperty(Platform, 'OS', {value: prev, configurable: true});
  });

  it('getPrivateKey en Android lee PEM tras biometría si backend es encrypted_storage', async () => {
    const prev = Platform.OS;
    Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
    get.mockImplementation((key: string) => {
      if (key === SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND) {
        return Promise.resolve('encrypted_storage');
      }
      if (key === SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM) {
        return Promise.resolve('stored-pem');
      }
      return Promise.resolve(null);
    });
    await expect(service.getPrivateKey()).resolves.toBe('stored-pem');
    expect(authenticate).toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', {value: prev, configurable: true});
  });

  it('mapKeychainError IllegalBlockSize en save vs read', () => {
    const err = new Error('javax.crypto.IllegalBlockSizeException');
    expect(mapKeychainError(err, 'save').code).toBe('keychain_error');
    expect(mapKeychainError(err, 'read').code).toBe(
      'biometric_enrollment_changed',
    );
  });

  it('savePrivateKey en Android usa STORAGE_TYPE.AES_GCM para PEM largo', async () => {
    const prev = Platform.OS;
    Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);
    await service.savePrivateKey('pem');
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      expect.any(String),
      'pem',
      expect.objectContaining({
        storage: Keychain.STORAGE_TYPE.AES_GCM,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      }),
    );
    Object.defineProperty(Platform, 'OS', {value: prev, configurable: true});
  });

  it('savePrivateKey en iOS no envía storage (opción solo Android)', async () => {
    const prev = Platform.OS;
    Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);
    await service.savePrivateKey('pem');
    const call = (Keychain.setGenericPassword as jest.Mock).mock.calls[0];
    const opts = call[2] as Record<string, unknown>;
    expect(opts.storage).toBeUndefined();
    Object.defineProperty(Platform, 'OS', {value: prev, configurable: true});
  });

  it('mapKeychainError clasifica enrollment', () => {
    const e = mapKeychainError(new Error('NSFaceIDUsageDescription errSecInteractionNotAllowed -25308'));
    expect(e.code).toBe('biometric_enrollment_changed');
  });
  it('hasPrivateKey delega en Keychain', async () => {
    (Keychain.hasGenericPassword as jest.Mock).mockResolvedValueOnce(true);
    await expect(service.hasPrivateKey()).resolves.toBe(true);
  });

  it('hasPrivateKey en Android con encrypted_storage usa SecureStorage', async () => {
    const prev = Platform.OS;
    Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
    get.mockImplementation((key: string) => {
      if (key === SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND) {
        return Promise.resolve('encrypted_storage');
      }
      if (key === SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM) {
        return Promise.resolve('pem');
      }
      return Promise.resolve(null);
    });
    await expect(service.hasPrivateKey()).resolves.toBe(true);
    Object.defineProperty(Platform, 'OS', {value: prev, configurable: true});
  });

  it('deletePrivateKey delega en resetGenericPassword', async () => {
    await service.deletePrivateKey();
    expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(
      SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND,
    );
    expect(remove).toHaveBeenCalledWith(
      SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM,
    );
  });
});
