import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {SecureStorageKeys} from '../../data/datasources/storage/SecureStorageKeys';
import type {User} from '../../domain/entities/User';
import type {SecureStorageService} from '../../domain/services/SecureStorageService';
import type {RootStackParamList} from '../../navigation/AppNavigator';
import type {BiometricRSAAuthOrchestrator} from '../../security/biometric';

export interface PostLoginEnrollmentDeps {
  biometricRSAAuthOrchestrator: BiometricRSAAuthOrchestrator;
  secureStorageService: SecureStorageService;
  login: (user: User) => Promise<void>;
}

export interface NavigatePostLoginEnrollmentOptions {
  /**
   * Si es true, no usa `hasBiometricRegistration` y sigue la rama de oferta
   * biométrica (útil solo en casos excepcionales o tests).
   */
  forceShowBiometricOffer?: boolean;
}

/**
 * Tras OTP y registro de alias: misma rama que antes vivía en OtpValidationScreen
 * (biometría existente, declinación previa u oferta biométrica).
 */
export async function navigatePostLoginEnrollment(
  _navigation: NativeStackNavigationProp<RootStackParamList>,
  user: User,
  _email: string,
  deps: PostLoginEnrollmentDeps,
  _options?: NavigatePostLoginEnrollmentOptions,
): Promise<void> {
  const {login} = deps;
  await login(user);
}
