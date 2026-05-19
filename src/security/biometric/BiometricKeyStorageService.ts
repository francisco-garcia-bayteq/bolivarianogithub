import * as Keychain from 'react-native-keychain';
import {Platform} from 'react-native';
import {
  BiometricAuthError,
  type BiometricAuthService,
} from '../../domain/services/BiometricAuthService';
import type {SecureStorageService} from '../../domain/services/SecureStorageService';
import {SecureStorageKeys} from '../../data/datasources/storage/SecureStorageKeys';
import {BiometricRSAError} from './errors';

/** v2: AES_GCM explícito; v1 podía quedar con entradas RSA incompatibles con PEM largo. */
const KEYCHAIN_SERVICE = 'com.bbapp.biometric.rsa.private.v2';
const KEYCHAIN_USERNAME = 'bb_biometric_rsa_private';

export type KeychainErrorContext = 'save' | 'read';

const ENCRYPTED_BACKEND = 'encrypted_storage' as const;

function isIllegalBlockSizeError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.toLowerCase().includes('illegalblocksize');
}

/** Detecta cambio en huellas/Face ID (p. ej. BiometryCurrentSet invalidado). */
export function mapKeychainError(
  err: unknown,
  context: KeychainErrorContext = 'read',
): BiometricRSAError {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (
    lower.includes('cancel') ||
    lower.includes('user canceled') ||
    lower.includes('user_cancel')
  ) {
    return new BiometricRSAError(
      'Autenticación biométrica cancelada',
      'user_cancelled',
      err,
    );
  }
  if (
    lower.includes('enrollment') ||
    (lower.includes('biometry') && lower.includes('chang')) ||
    lower.includes('current set') ||
    lower.includes('biometrycurrentset') ||
    lower.includes('interactionnotallowed') ||
    lower.includes('interaction not allowed') ||
    lower.includes('errsecinteractionnotallowed') ||
    lower.includes('-25308') ||
    lower.includes('permanently invalidated') ||
    lower.includes('keypermanentlyinvalidated') ||
    lower.includes('invalidatedbybiometricenrollment') ||
    lower.includes('android.security.keystore') ||
    lower.includes('biometric has been changed') ||
    lower.includes('biometric changed')
  ) {
    return new BiometricRSAError(
      'El conjunto biométrico del dispositivo cambió. Debes iniciar sesión con usuario y contraseña.',
      'biometric_enrollment_changed',
      err,
    );
  }
  if (lower.includes('biometry') || lower.includes('authentication failed')) {
    return new BiometricRSAError(
      'No se pudo verificar la biometría',
      'prompt_failed',
      err,
    );
  }
  /**
   * Android: cifrado RSA del Keystore limita ~384 B; PEM largo o datos corruptos → IllegalBlockSize.
   * En guardado: mensaje orientado a reintento (emulador). En lectura: revocar registro local.
   */
  if (lower.includes('illegalblocksize')) {
    if (context === 'save') {
      return new BiometricRSAError(
        'No se pudo guardar la clave con biometría en este dispositivo. Si usas un emulador Android, borra los datos de la app, vuelve a iniciar sesión e inténtalo de nuevo.',
        'keychain_error',
        err,
      );
    }
    return new BiometricRSAError(
      'El conjunto biométrico del dispositivo cambió. Debes iniciar sesión con usuario y contraseña.',
      'biometric_enrollment_changed',
      err,
    );
  }
  return new BiometricRSAError(
    'No se pudo validar el biométrico. Intenta nuevamente más tarde',
    'keychain_error',
    err,
  );
}

/**
 * Persiste la clave privada RSA (PEM) en Keychain / Keystore con control biométrico.
 * En Android, si el Keystore biométrico falla (p. ej. IllegalBlockSize en emulador), guarda el PEM
 * cifrado por EncryptedStorage y exige biometría en app antes de leer.
 */
export class BiometricKeyStorageService {
  constructor(
    private readonly secureStorage: SecureStorageService,
    private readonly biometricAuth: BiometricAuthService,
  ) {}

  private async savePrivateKeyAndroidEncryptedFallback(
    privateKeyPem: string,
  ): Promise<void> {
    await Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE});
    await this.secureStorage.save(
      SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND,
      ENCRYPTED_BACKEND,
    );
    await this.secureStorage.save(
      SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM,
      privateKeyPem,
    );
  }

  async savePrivateKey(privateKeyPem: string): Promise<void> {
    await this.deletePrivateKey();
    let result: boolean | Keychain.Result;
    try {
      result = await Keychain.setGenericPassword(
        KEYCHAIN_USERNAME,
        privateKeyPem,
        {
          service: KEYCHAIN_SERVICE,
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          ...(Platform.OS === 'android'
            ? {
                storage: Keychain.STORAGE_TYPE.AES_GCM,
                /** Emulador / sin StrongBox: evita fallos raros del Keystore “hardware”. */
                securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
              }
            : {}),
          authenticationPrompt: {
            title: 'Proteger acceso biométrico',
            subtitle:
              Platform.OS === 'android'
                ? 'Se guardará la clave con huella digital o Face ID'
                : undefined,
            description: 'Autentícate para guardar la clave de forma segura',
            cancel: 'Cancelar',
          },
        },
      );
    } catch (e) {
      if (e instanceof BiometricRSAError) {
        throw e;
      }
      if (
        Platform.OS === 'android' &&
        isIllegalBlockSizeError(e)
      ) {
        await this.savePrivateKeyAndroidEncryptedFallback(privateKeyPem);
        return;
      }
      throw mapKeychainError(e, 'save');
    }
    if (result === false) {
      throw new BiometricRSAError(
        'No se pudo guardar la clave privada',
        'keychain_error',
      );
    }
  }

  async getPrivateKey(): Promise<string> {
    try {
      if (Platform.OS === 'android') {
        const backend = await this.secureStorage.get(
          SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND,
        );
        if (backend === ENCRYPTED_BACKEND) {
          await this.biometricAuth.authenticate(
            'Usa huella o Face ID para continuar',
          );
          const pem = await this.secureStorage.get(
            SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM,
          );
          if (!pem?.trim()) {
            throw new BiometricRSAError(
              'No hay clave biométrica registrada',
              'no_private_key',
            );
          }
          return pem;
        }
      }

      const credentials = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE,
        authenticationPrompt: {
          title: 'Acceso biométrico',
          subtitle:
            Platform.OS === 'android'
              ? 'Usa huella o Face ID para continuar'
              : undefined,
          description: 'Desbloquea tu clave privada',
          cancel: 'Cancelar',
        },
      });
      if (credentials === false || !credentials.password?.trim()) {
        throw new BiometricRSAError(
          'No hay clave biométrica registrada',
          'no_private_key',
        );
      }
      return credentials.password;
    } catch (e) {
      if (e instanceof BiometricRSAError) {
        throw e;
      }
      if (e instanceof BiometricAuthError) {
        throw e;
      }
      throw mapKeychainError(e, 'read');
    }
  }

  async hasPrivateKey(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const backend = await this.secureStorage.get(
        SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND,
      );
      if (backend === ENCRYPTED_BACKEND) {
        const pem = await this.secureStorage.get(
          SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM,
        );
        return !!pem?.trim();
      }
    }
    return Keychain.hasGenericPassword({service: KEYCHAIN_SERVICE});
  }

  async deletePrivateKey(): Promise<void> {
    await Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE});
    try {
      await this.secureStorage.remove(SecureStorageKeys.BIOMETRIC_RSA_KEY_BACKEND);
      await this.secureStorage.remove(
        SecureStorageKeys.BIOMETRIC_RSA_PRIVATE_KEY_PEM,
      );
    } catch {
      // best effort
    }
  }
}
