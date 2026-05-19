import ReactNativeBiometrics from 'react-native-biometrics';
import {
  BiometricAuthError,
  type BiometricAuthService,
  type BiometricAvailability,
} from '../../domain/services/BiometricAuthService';

export class BiometricAuthServiceImpl implements BiometricAuthService {
  private readonly rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: false,
  });

  async getAvailability(): Promise<BiometricAvailability> {
    const result = await this.rnBiometrics.isSensorAvailable();
    return {
      available: result.available,
      biometryType: result.biometryType,
      error: result.error,
    };
  }

  async authenticate(promptMessage: string): Promise<void> {
    const {success, error} = await this.rnBiometrics.simplePrompt({
      promptMessage,
    });

    if (!success) {
      throw new BiometricAuthError(
        'User cancelled biometric prompt',
        'user_cancelled',
      );
    }

    if (error) {
      throw new BiometricAuthError(error, 'prompt_failed');
    }
  }
}
