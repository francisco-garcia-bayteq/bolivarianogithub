import { NativeModules, Platform } from 'react-native';
import { SecureStorageService } from '../../domain/services/SecureStorageService';
import { SecureStorageKeys } from '../../data/datasources/storage/SecureStorageKeys';
import { BiometricRSAError } from './errors';

type BiometricEnrollmentNativeModule = {
  getBiometryDomainStateBase64?: () => Promise<string | null>;
  installProbe?: () => Promise<void>;
  isProbeValid?: () => Promise<boolean>;
  removeProbe?: () => Promise<void>;
};

const native = NativeModules
  .BiometricEnrollmentModule as BiometricEnrollmentNativeModule | undefined;

/**
 * Enlace explícito con el conjunto biométrico del SO:
 * - iOS: `evaluatedPolicyDomainState` (cambia al añadir/quitar huella o Face ID).
 * - Android: clave Keystore propia con `setInvalidatedByBiometricEnrollment(true)`.
 *
 * Keychain/Keystore del tercero no basta en todos los dispositivos; esto fuerza la detección.
 */
export class BiometricEnrollmentBinding {
  constructor(private readonly secureStorage: SecureStorageService) {}

  async snapshot(): Promise<void> {
    if (Platform.OS === 'ios' && native?.getBiometryDomainStateBase64) {
      const b64 = await native.getBiometryDomainStateBase64();
      if (b64) {
        await this.secureStorage.save(
          SecureStorageKeys.BIOMETRIC_ENROLLMENT_SNAPSHOT,
          b64,
        );
      }
      return;
    }
    if (Platform.OS === 'android' && native?.installProbe) {
      await native.installProbe();
    }
  }

  async verify(): Promise<void> {
    if (Platform.OS === 'ios') {
      if (!native?.getBiometryDomainStateBase64) {
        return;
      }
      const stored = await this.secureStorage.get(
        SecureStorageKeys.BIOMETRIC_ENROLLMENT_SNAPSHOT,
      );
      if (!stored?.trim()) {
        return;
      }
      const current = await native.getBiometryDomainStateBase64();
      if (current == null || current !== stored) {
        throw new BiometricRSAError(
          'El conjunto biométrico del dispositivo cambió.',
          'biometric_enrollment_changed',
        );
      }
      return;
    }
    if (Platform.OS === 'android' && native?.isProbeValid) {
      const valid = await native.isProbeValid();
      if (valid === false) {
        throw new BiometricRSAError(
          'El conjunto biométrico del dispositivo cambió.',
          'biometric_enrollment_changed',
        );
      }
    }
  }

  async clear(): Promise<void> {
    try {
      await this.secureStorage.remove(
        SecureStorageKeys.BIOMETRIC_ENROLLMENT_SNAPSHOT,
      );
    } catch {
      // best effort
    }
    if (Platform.OS === 'android' && native?.removeProbe) {
      try {
        await native.removeProbe();
      } catch {
        // best effort
      }
    }
  }
}
