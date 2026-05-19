import crypto from 'react-native-quick-crypto';

/**
 * Secreto por instancia del cliente HTTP (paridad `createCryptoRandomString` / 16 bytes, base64url).
 */
export function createApiSecretKey(): string {
  const buf = crypto.randomBytes(16);
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_');
}
