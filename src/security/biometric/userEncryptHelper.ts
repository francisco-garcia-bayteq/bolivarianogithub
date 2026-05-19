import {rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64} from '../certificate/rsaUtils';

/**
 * Cifrado del identificador de usuario para endpoints Security (misma convención que headers / certificados).
 */
export function encryptUserIdentifierForBiometricApi(
  serverPublicKeyPemBase64: string,
  plainUsernameOrEmail: string,
): string {
  return rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
    serverPublicKeyPemBase64,
    plainUsernameOrEmail.trim(),
  );
}
