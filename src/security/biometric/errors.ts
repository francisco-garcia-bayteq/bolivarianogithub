export type BiometricRSAErrorCode =
  | 'user_cancelled'
  | 'not_available'
  | 'prompt_failed'
  | 'biometric_enrollment_changed'
  | 'keychain_error'
  | 'no_private_key'
  | 'no_server_public_key'
  | 'no_stored_username'
  | 'crypto_error'
  | 'network_error'
  | 'registration_failed'
  | 'unknown';

export class BiometricRSAError extends Error {
  constructor(
    message: string,
    public readonly code: BiometricRSAErrorCode,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'BiometricRSAError';
  }
}
