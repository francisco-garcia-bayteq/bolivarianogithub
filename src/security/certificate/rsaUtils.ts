import {Buffer} from 'node:buffer';
import {devLog} from '../../data/api/devLog';
import crypto from 'react-native-quick-crypto';
import {base64ToBinaryLatin1,  bufferToHex} from './encoding';

const LOG_RSA = 'Security/rsa';

type RsaPublicKey = ReturnType<typeof crypto.createPublicKey>;
type RsaPrivateKey = ReturnType<typeof crypto.createPrivateKey>;

export const RSA_OAEP_OPTIONS = {
  padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  oaepHash: 'sha1',
} as const;

export const CLIENT_PRIVATE_SIGN_SCHEME = 'sha256' as const;
export const SERVER_SIGNATURE_VERIFY_SCHEME = 'sha256' as const;

export function pemFromBase64PemBlock(base64Pem: string): string {
  return Buffer.from(base64Pem, 'base64').toString('utf8');
}

/**
 * Unifica material PEM (público o privado) al formato esperado por `base64ToBinaryLatin1`:
 * Base64(UTF-8(PEM)). El API puede devolver PEM en texto o ya en Base64.
 * Sin esto, PEM plano provoca "invalid base64 characters" al decodificar.
 */
export function normalizePemKeyMaterialBase64(raw: string): string {
  const trimmed = raw.trim().replace(/^\uFEFF/u, '');
  if (!trimmed) {
    throw new Error('El material PEM está vacío');
  }
  if (trimmed.includes('-----BEGIN')) {
    return Buffer.from(trimmed, 'utf8').toString('base64');
  }
  const compact = trimmed.replaceAll(/\s/g, '');
  return compact.replaceAll('-', '+').replaceAll('_', '/');
}

export function createPublicKeyFromPemBase64(base64Pem: string): RsaPublicKey {
  const normalized = normalizePemKeyMaterialBase64(base64Pem);
  return crypto.createPublicKey({
    key: base64ToBinaryLatin1(normalized),
    format: 'pem',
  });
}

export function createPrivateKeyFromPemBase64(
  base64Pem: string,
): RsaPrivateKey {
  const normalized = normalizePemKeyMaterialBase64(base64Pem);
  return crypto.createPrivateKey(base64ToBinaryLatin1(normalized));
}

function rsaOaepEncryptWithPublicKey(
  publicKey: RsaPublicKey,
  plaintext: Buffer,
): Buffer {
  return Buffer.from(
    crypto.publicEncrypt(
      {
        key: publicKey,
        ...RSA_OAEP_OPTIONS,
      },
      plaintext,
    ),
  );
}

function rsaOaepDecryptWithPrivateKey(
  privateKey: RsaPrivateKey,
  ciphertext: Buffer,
): Buffer {
  return Buffer.from(
    crypto.privateDecrypt(
      {
        key: privateKey,
        ...RSA_OAEP_OPTIONS,
      },
      ciphertext,
    ),
  );
}

function rsaSignSha256WithPrivateKey(
  privateKey: RsaPrivateKey,
  message: Buffer,
): Buffer {
  return Buffer.from(
    crypto.sign(CLIENT_PRIVATE_SIGN_SCHEME, message, privateKey),
  );
}

/**
 * Convención heredada del backend móvil:
 * 1) bytes binarios -> Base64
 * 2) ese Base64 como texto UTF-8 -> Base64
 */
export function toDoubleBase64FromBuffer(value: Buffer): string {
  const firstBase64 = value.toString('base64');
  return Buffer.from(firstBase64, 'utf8').toString('base64');
}

function rsaVerifySha256WithPublicKey(
  publicKey: RsaPublicKey,
  message: Buffer,
  signature: Buffer,
): boolean {
  devLog(LOG_RSA, 'rsaVerifySha256: entrada', {
    messageBytes: message.length,
    signatureBytes: signature.length,
    scheme: SERVER_SIGNATURE_VERIFY_SCHEME,
  });
  const ok = crypto.verify(
    SERVER_SIGNATURE_VERIFY_SCHEME,
    message,
    publicKey,
    signature,
  );
  devLog(LOG_RSA, 'rsaVerifySha256: salida', {ok});
  return ok;
}

export function base64ToCipherBuffer(cipherBase64: string): Buffer {
  return Buffer.from(cipherBase64, 'base64');
}

function looksLikeBase64Ascii(raw: Buffer): boolean {
  const text = raw.toString('utf8').trim();
  if (!text || text.length % 4 !== 0) {
    return false;
  }
  return /^[A-Za-z0-9+/=]+$/.test(text);
}

/**
 * Backend puede devolver Base64 simple o doble Base64 (Base64 de un string Base64).
 * Esta función normaliza a bytes binarios reales del ciphertext/firma.
 */
export function decodeApiBase64ToBinary(inputBase64: string): Buffer {
  const first = Buffer.from(inputBase64, 'base64');
  if (!looksLikeBase64Ascii(first)) {
    return first;
  }
  try {
    const second = Buffer.from(first.toString('utf8'), 'base64');
    if (second.length > 0) {
      return second;
    }
  } catch {
    // fallback a decodificación simple si no aplica doble.
  }
  return first;
}

export function rsaVerifySha256PublicKeyPemBase64OnBase64(
  serverPublicPemBase64: string,
  messageBase64: string,
  signatureBase64: string,
): boolean {
  devLog(LOG_RSA, 'rsaVerifySha256PublicKeyPemBase64OnBase64: entrada', {
    publicKeyChars: serverPublicPemBase64?.length ?? 0,
    messageBase64Chars: messageBase64?.length ?? 0,
    signatureBase64Chars: signatureBase64?.length ?? 0,
    messageBase64Preview: messageBase64?.slice(0, 12),
    signatureBase64Preview: signatureBase64?.slice(0, 12),
  });
  const serverPub = createPublicKeyFromPemBase64(serverPublicPemBase64);
  const messageBuffer = decodeApiBase64ToBinary(messageBase64);
  const signatureBuffer = decodeApiBase64ToBinary(signatureBase64);
  devLog(LOG_RSA, 'rsaVerifySha256PublicKeyPemBase64OnBase64: decode OK', {
    messageBytes: messageBuffer.length,
    signatureBytes: signatureBuffer.length,
  });
  const verifyOnCipherBytes = rsaVerifySha256WithPublicKey(
    serverPub,
    messageBuffer,
    signatureBuffer,
  );
  if (verifyOnCipherBytes) {
    devLog(LOG_RSA, 'rsaVerifySha256PublicKeyPemBase64OnBase64: OK sobre bytes ciphertext');
    return true;
  }

  // Algunos backends firman el string Base64 (UTF-8), no los bytes del ciphertext.
  const messageBase64Utf8Buffer = Buffer.from(messageBase64, 'utf8');
  devLog(LOG_RSA, 'rsaVerifySha256PublicKeyPemBase64OnBase64: fallback verify sobre UTF-8(base64)', {
    messageBase64Utf8Bytes: messageBase64Utf8Buffer.length,
  });
  const verifyOnBase64Utf8 = rsaVerifySha256WithPublicKey(
    serverPub,
    messageBase64Utf8Buffer,
    signatureBuffer,
  );
  if (verifyOnBase64Utf8) {
    devLog(LOG_RSA, 'rsaVerifySha256PublicKeyPemBase64OnBase64: OK sobre UTF-8(base64)');
    return true;
  }

  // Caso adicional: response doble-Base64 y firma calculada sobre el Base64 interno (string UTF-8).
  const firstDecode = Buffer.from(messageBase64, 'base64');
  if (looksLikeBase64Ascii(firstDecode)) {
    const innerBase64Utf8Buffer = Buffer.from(firstDecode.toString('utf8'), 'utf8');
    devLog(
      LOG_RSA,
      'rsaVerifySha256PublicKeyPemBase64OnBase64: fallback verify sobre UTF-8(base64 interno)',
      {
        innerBase64Utf8Bytes: innerBase64Utf8Buffer.length,
      },
    );
    const verifyOnInnerBase64Utf8 = rsaVerifySha256WithPublicKey(
      serverPub,
      innerBase64Utf8Buffer,
      signatureBuffer,
    );
    if (verifyOnInnerBase64Utf8) {
      devLog(
        LOG_RSA,
        'rsaVerifySha256PublicKeyPemBase64OnBase64: OK sobre UTF-8(base64 interno)',
      );
      return true;
    }
  }

  return false;
}

export function rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8(
  clientPrivatePemBase64: string,
  cipherBase64: string,
): string {
  const clientPriv = createPrivateKeyFromPemBase64(clientPrivatePemBase64);
  const plain = rsaOaepDecryptWithPrivateKey(
    clientPriv,
    decodeApiBase64ToBinary(cipherBase64),
  );
  return plain.toString('utf8');
}

export function rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToHex(
  clientPrivatePemBase64: string,
  cipherBase64: string,
): string {
  const clientPriv = createPrivateKeyFromPemBase64(clientPrivatePemBase64);
  const plain = rsaOaepDecryptWithPrivateKey(
    clientPriv,
    decodeApiBase64ToBinary(cipherBase64),
  );
  return bufferToHex(plain);
}

export function rsaEncryptPublicKeyPemBase64Utf8ToBase64(
  publicKeyPemBase64: string,
  plainText: string,
): string {
  if (!plainText) {
    throw new Error('No hay texto para encriptar');
  }
  if (!publicKeyPemBase64?.trim()) {
    throw new Error('La llave pública es requerida');
  }
  const pub = createPublicKeyFromPemBase64(publicKeyPemBase64);
  const encrypted = rsaOaepEncryptWithPublicKey(pub, Buffer.from(plainText, 'utf8'));
  return encrypted.toString('base64');
}

/**
 * Convención heredada para headers: Base64(RSA) y luego Base64(UTF8(Base64(RSA))).
 */
export function rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
  publicKeyPemBase64: string,
  utf8Plain: string,
): string {
  const firstBase64 = rsaEncryptPublicKeyPemBase64Utf8ToBase64(
    publicKeyPemBase64,
    utf8Plain,
  );
  return Buffer.from(firstBase64, 'utf8').toString('base64');
}

/**
 * Compatibilidad: el nombre histórico incluía "Hex16", pero el backend cifra UTF-8 y devuelve Base64 simple.
 */
export function rsaOaepEncryptHex16MaterialPemBase64ToBase64(
  publicKeyPemBase64: string,
  plainText: string,
): string {
  if (!plainText) {
    throw new Error('No hay texto para encriptar');
  }
  const pub = createPublicKeyFromPemBase64(publicKeyPemBase64);
  const encrypted = rsaOaepEncryptWithPublicKey(pub, Buffer.from(plainText, 'utf8'));
  return encrypted.toString('base64');
}

export function rsaSignSha256PrivateKeyPemBase64OnCipherBase64(
  clientPrivatePemBase64: string,
  cipherBase64: string,
): string {
  if (!clientPrivatePemBase64?.trim()) {
    throw new Error('La llave privada del cliente es requerida');
  }
  const privateKey = createPrivateKeyFromPemBase64(clientPrivatePemBase64);
  const message = Buffer.from(cipherBase64, 'utf8');
  const signature = rsaSignSha256WithPrivateKey(privateKey, message);
  return toDoubleBase64FromBuffer(signature);
}