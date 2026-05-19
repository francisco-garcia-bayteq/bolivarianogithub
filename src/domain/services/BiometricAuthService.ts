export type BiometryKind = 'TouchID' | 'FaceID' | 'Biometrics';

export interface BiometricAvailability {
  available: boolean;
  biometryType?: BiometryKind;
  error?: string;
}

export type BiometricAuthFailureCode =
  | 'user_cancelled'
  | 'not_available'
  | 'prompt_failed';

export class BiometricAuthError extends Error {
  constructor(
    message: string,
    public readonly code: BiometricAuthFailureCode,
  ) {
    super(message);
    this.name = 'BiometricAuthError';
  }
}

export interface BiometricAuthService {
  getAvailability(): Promise<BiometricAvailability>;
  authenticate(promptMessage: string): Promise<void>;
}
