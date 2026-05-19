import {Buffer} from 'node:buffer';
import crypto from 'react-native-quick-crypto';
import {bufferToHex} from './encoding';

/** AES-256-CBC + PKCS#7 (padding por defecto de Node/OpenSSL). */
export const AES_MODE = 'aes-256-cbc' as const;

export const AES_KEY_LENGTH_BYTES = 32;
export const AES_IV_LENGTH_BYTES = 16;

/**
 * Descifra AES-256-CBC con padding PKCS#7.
 * Usa `Buffer` (interfaz binaria de Node/RN), no `Uint8Array`.
 */
export function aes256CbcDecrypt(
  ciphertext: Buffer,
  key: Buffer,
  iv: Buffer,
): Buffer {
  if (key.length !== AES_KEY_LENGTH_BYTES) {
    throw new Error('AES: la clave debe tener 32 bytes (AES-256).');
  }
  if (iv.length !== AES_IV_LENGTH_BYTES) {
    throw new Error('AES: el IV debe tener 16 bytes');
  }

  const decipher = crypto.createDecipheriv(AES_MODE, key, iv);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
}

/**
 * Ciphertext, clave e IV como strings **hex**; plaintext en **hex**.
 */
export function aes256CbcDecryptHex(
  ciphertextHex: string,
  keyHex: string,
  ivHex: string,
): string {
  const plain = aes256CbcDecrypt(
    Buffer.from(ciphertextHex),
    Buffer.from(keyHex),
    Buffer.from(ivHex),
  );
  return bufferToHex(plain);
}

/**
 * Cifra AES-256-CBC (tests / round-trip).
 */
export function aes256CbcEncrypt(
  plaintext: Buffer,
  key: Buffer,
  iv: Buffer,
): Buffer {
  if (key.length !== AES_KEY_LENGTH_BYTES) {
    throw new Error('AES: la clave debe tener 32 bytes (AES-256).');
  }
  if (iv.length !== AES_IV_LENGTH_BYTES) {
    throw new Error('AES: el IV debe tener 16 bytes');
  }

  const cipher = crypto.createCipheriv(AES_MODE, key, iv);
  return Buffer.concat([cipher.update(plaintext), cipher.final()]);
}
