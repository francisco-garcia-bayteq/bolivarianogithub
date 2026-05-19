import axios from 'axios';
import {RunCertificateHandshakeUseCase} from '../../domain/usecases/RunCertificateHandshakeUseCase';
import {GetPublicKeyUseCase} from '../../domain/usecases/GetPublicKeyUseCase';
import {
  BiometricAuthError,
  type BiometricAuthService,
} from '../../domain/services/BiometricAuthService';
import {SecureStorageService} from '../../domain/services/SecureStorageService';
import {SecureStorageKeys} from '../../data/datasources/storage/SecureStorageKeys';
import {BiometricRemoteDataSource} from '../../data/datasources/biometric/BiometricRemoteDataSource';
import {CryptoService} from './CryptoService';
import {BiometricKeyStorageService} from './BiometricKeyStorageService';
import {encryptUserIdentifierForBiometricApi} from './userEncryptHelper';
import {BiometricRSAError, BiometricRSAErrorCode} from './errors';
import type {BiometricEnrollmentBinding} from './BiometricEnrollmentBinding';
import type {User} from '../../domain/entities/User';
import {mapLoginResponseToUser} from '../../data/mappers/UserMapper';

export class BiometricRSAAuthOrchestrator {
  constructor(
    private readonly biometricRemote: BiometricRemoteDataSource,
    private readonly cryptoService: CryptoService,
    private readonly keyStorage: BiometricKeyStorageService,
    private readonly secureStorage: SecureStorageService,
    private readonly runCertificateHandshakeUseCase: RunCertificateHandshakeUseCase,
    private readonly getPublicKeyUseCase: GetPublicKeyUseCase,
    private readonly biometricAuth: BiometricAuthService,
    private readonly enrollmentBinding: BiometricEnrollmentBinding,
  ) {}

  private async resolveServerPublicKeyPemBase64(): Promise<string> {
    const pk = await this.getPublicKeyUseCase.execute();
    return pk.value.trim();
  }

  /** Limpia clave local y usuario biométrico tras cambio de enrolamiento en el dispositivo. */
  private async clearBiometricRegistrationLocal(): Promise<void> {
    try {
      await this.keyStorage.deletePrivateKey();
    } catch {
      // best effort
    }
    try {
      await this.secureStorage.remove(SecureStorageKeys.BIOMETRIC_USERNAME);
    } catch {
      // best effort
    }
    try {
      await this.enrollmentBinding.clear();
    } catch {
      // best effort
    }
  }

  /**
   * Limpia registro biométrico local (p. ej. cambio de usuario en login compacto).
   */
  async clearBiometricRegistration(): Promise<void> {
    await this.clearBiometricRegistrationLocal();
  }

  private mapUnknownError(e: unknown): BiometricRSAError {
    if (e instanceof BiometricRSAError) {
      return e;
    }
    
    if (e instanceof BiometricAuthError) {
      let code;
      if (e.code === 'user_cancelled') {
        code = 'user_cancelled';
      } else if (e.code === 'not_available') {
        code = 'not_available';
      } else {
        code = 'prompt_failed';
      }
      return new BiometricRSAError(e.message, code as BiometricRSAErrorCode, e);
    }
    if (axios.isAxiosError(e)) {
      return new BiometricRSAError(
        e.response?.data?.message == null
          ? 'Error de red'
          : String(e.response.data.message),
        'network_error',
        e,
      );
    }
    if (e instanceof Error) {
      return new BiometricRSAError(e.message, 'unknown', e);
    }
    return new BiometricRSAError('Error inesperado', 'unknown', e);
  }

  /**
   * Tras login con contraseña exitoso: obtiene challenge, genera RSA, registra en servidor y guarda clave privada con biometría.
   */
  async registerBiometricForUser(email: string): Promise<void> {
    const trimmed = email.trim();
    if (!trimmed) {
      throw new BiometricRSAError('El usuario es requerido', 'unknown');
    }

    try {
      const availability = await this.biometricAuth.getAvailability();
      if (!availability.available) {
        throw new BiometricRSAError(
          availability.error?.trim() ||
            'La autenticación biométrica no está disponible en este dispositivo.',
          'not_available',
        );
      }

      await this.biometricAuth.authenticate(
        'Confirma tu identidad para activar el acceso con huella o Face ID.',
      );

      const serverPem = await this.resolveServerPublicKeyPemBase64();
      const userEncryptBase64 = encryptUserIdentifierForBiometricApi(
        serverPem,
        trimmed,
      );

      const {challenge} = await this.biometricRemote.postBiometricChallenge({
        userEncryptBase64,
      });

      const keys = await this.cryptoService.generateKeyPair();
      const challengeSignBase64 = await this.cryptoService.signChallenge(
        challenge,
        keys.privateKeyPem,
      );
      const mobilePublicKeyBase64 = this.cryptoService.getPublicKeyBase64FromPem(
        keys.publicKeyPem,
      );

      await this.biometricRemote.postBiometricRegistration({
        challenge,
        challengeSignBase64,
        mobilePublicKeyBase64,
      });

      await this.keyStorage.savePrivateKey(keys.privateKeyPem);
      await this.secureStorage.save(
        SecureStorageKeys.BIOMETRIC_USERNAME,
        trimmed,
      );
      await this.enrollmentBinding.snapshot();
      this.cryptoService.clearMemoryKeys();
    } catch (e) {
      this.cryptoService.clearMemoryKeys();
      throw this.mapUnknownError(e);
    }
  }

  /**
   * Login solo con biometría: challenge, firma, token de sesión.
   * Misma entidad `User` que el login por credenciales (incluye `firstName` del API).
   */
  async loginWithBiometric(): Promise<User> {
    try {
      const emailStored = await this.secureStorage.get(
        SecureStorageKeys.BIOMETRIC_USERNAME,
      );
      if (!emailStored?.trim()) {
        throw new BiometricRSAError(
          'No hay usuario para acceso biométrico. Inicia sesión con contraseña y activa biometría.',
          'no_stored_username',
        );
      }

      const hasKey = await this.keyStorage.hasPrivateKey();
      if (!hasKey) {
        await this.clearBiometricRegistrationLocal();
        throw new BiometricRSAError(
          'El conjunto biométrico del dispositivo cambió o la clave ya no está disponible.',
          'biometric_enrollment_changed',
        );
      }

      await this.enrollmentBinding.verify();

      await this.runCertificateHandshakeUseCase.execute();
      const serverPem = await this.resolveServerPublicKeyPemBase64();
      const usernameEncryptBase64 = encryptUserIdentifierForBiometricApi(
        serverPem,
        emailStored,
      );

      const {challenge} = await this.biometricRemote.postBiometricChallenge({
        userEncryptBase64: usernameEncryptBase64,
      });

      let privateKeyPem: string;
      try {
        privateKeyPem = await this.keyStorage.getPrivateKey();
      } catch (e) {
        if (e instanceof BiometricRSAError && e.code === 'no_private_key') {
          await this.clearBiometricRegistrationLocal();
          throw new BiometricRSAError(
            'El conjunto biométrico del dispositivo cambió o la clave ya no está disponible.',
            'biometric_enrollment_changed',
          );
        }
        throw e;
      }
      const challengeSignBase64 = await this.cryptoService.signChallenge(
        challenge,
        privateKeyPem,
      );

      const content = await this.biometricRemote.postBiometricLogin({
        usernameEncryptBase64,
        challenge,
        challengeSignBase64,
      });

      const user = mapLoginResponseToUser(
        {
          accessToken: content.accessToken,
          firstName: content.firstName?.trim() ?? '',
          sessionTimeSeconds: content.sessionTimeSeconds ?? 3600,
          inactivityTimeoutSeconds: content.inactivityTimeoutSeconds ?? 300,
        },
        emailStored.trim(),
      );

      await this.secureStorage.save(
        SecureStorageKeys.USER_LOGIN_DATA,
        JSON.stringify(user),
      );

      return user;
    } catch (e) {
      const mapped = this.mapUnknownError(e);
      if (mapped.code === 'biometric_enrollment_changed') {
        await this.clearBiometricRegistrationLocal();
      }
      throw mapped;
    }
  }

  async hasBiometricRegistration(): Promise<boolean> {
    const user = await this.secureStorage.get(
      SecureStorageKeys.BIOMETRIC_USERNAME,
    );
    if (!user?.trim()) {
      return false;
    }
    return this.keyStorage.hasPrivateKey();
  }
}
