import type {
  CertificateContent,
  CertificateEnvelopeResponse,
  CertificateRequest,
} from '../../data/models/CertificateModels';
import {
  CLIENT_PRIVATE_KEY_PEM_BASE64,
  SERVER_PUBLIC_KEY_PEM_BASE64,
} from './keys.constants';
import {Buffer} from 'node:buffer';
import {AES_IV_LENGTH_BYTES, AES_KEY_LENGTH_BYTES} from './aesHelper';
import crypto from 'react-native-quick-crypto';
import {devLog, devWarn} from '../../data/api/devLog';
import {
  decodeApiBase64ToBinary,
  rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8,
  rsaOaepEncryptHex16MaterialPemBase64ToBase64,
  rsaSignSha256PrivateKeyPemBase64OnCipherBase64,
  rsaVerifySha256PublicKeyPemBase64OnBase64,
} from './rsaUtils';

const LOG_CERT_VALIDATE = 'Security/certificate/validate';

export interface CertificateSession {
  secretMaterial: string;
  ivMaterial: string;
}

/**
 * Material de sesión de 16 caracteres ASCII (16 bytes UTF-8).
 * Evita incompatibilidades de longitud de IV (AES requiere 16 bytes).
 */
export function materialHex16FromUuidV4(): string {
  const base64url = crypto
    .randomBytes(16)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_');
  return base64url.slice(0, 16);
}

/** Clave AES-256 derivada del material de sesión (SHA-256 sobre UTF-8). */
export function deriveAes256KeyHexFromSecretMaterial(secretMaterial: string): Buffer {
  const hash = crypto.createHash('sha256');
  hash.update(secretMaterial);
  return Buffer.from(hash.digest());
}

/** IV AES derivado de material de sesión (primeros 16 bytes de SHA-256 sobre UTF-8). */
export function deriveIvHexFromIvMaterial(ivMaterial: string): Buffer {
  const hash = crypto.createHash('sha256');
  hash.update(ivMaterial);
  const ivCandidate = Buffer.from(hash.digest()).subarray(0, AES_IV_LENGTH_BYTES);
  return Buffer.from(ivCandidate);
}

/**
 * Descifra AES con el modo, clave e IV indicados.
 * - ECB: IV debe ser un Buffer vacío (el modo lo ignora).
 * - CBC: IV de 16 bytes.
 * Soporta AES-128 (clave 16 bytes) y AES-256 (clave 32 bytes).
 */
function tryAesDecrypt(
  ciphertext: Buffer,
  key: Buffer,
  iv: Buffer,
  mode: 'ecb' | 'cbc',
): string {
  const bits = key.length === AES_KEY_LENGTH_BYTES ? 256 : 128;
  const algorithm = `aes-${bits}-${mode}` as const;
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString('utf8');
}

function tryDecryptWithDerivationStrategies(
  ciphertext: Buffer,
  secretMaterial: string,
  ivMaterial: string,
): {plaintext: string; strategy: string} {
  const secretBytes = Buffer.from(secretMaterial, 'utf8'); // 16 bytes
  const ivBytes = Buffer.from(ivMaterial, 'utf8');          // 16 bytes
  const emptyIv = Buffer.alloc(0);                          // ECB no usa IV

  const keySha256 = deriveAes256KeyHexFromSecretMaterial(secretMaterial); // 32 bytes
  const ivSha256 = deriveIvHexFromIvMaterial(ivMaterial);                  // 16 bytes

  const keySha256First16 = Buffer.from(keySha256.subarray(0, AES_IV_LENGTH_BYTES)); // 16 bytes

  // AES-256 sin hash, clave extendida desde los materiales de sesión
  const keySecretConcat = Buffer.concat([secretBytes, ivBytes]);
  const keySecretDoubled = Buffer.concat([secretBytes, secretBytes]);
  const keySecretZeroPad = Buffer.concat([secretBytes, Buffer.alloc(AES_IV_LENGTH_BYTES, 0)]);
  const zeroIv = Buffer.alloc(AES_IV_LENGTH_BYTES, 0);

  type AesAttempt = {
    name: string;
    key: Buffer;
    iv: Buffer;
    mode: 'ecb' | 'cbc';
  };

  const attempts: AesAttempt[] = [
    // ── ECB: el servidor usa Aes.Mode = CipherMode.ECB + PKCS7 ────────────────
    // Key = UTF8(secretMaterial) → 16 bytes → AES-128-ECB
    {name: 'aes128-ecb key=utf8(secret)', key: secretBytes, iv: emptyIv, mode: 'ecb'},
    {name: 'aes256-ecb key=sha256(secret)', key: keySha256, iv: emptyIv, mode: 'ecb'},
    {name: 'aes128-ecb key=sha256(secret)[0..16]', key: keySha256First16, iv: emptyIv, mode: 'ecb'},

    // ── CBC con clave derivada por SHA-256 ────────────────────────────────────
    {name: 'aes256-cbc key=sha256(secret) iv=sha256(iv)', key: keySha256, iv: ivSha256, mode: 'cbc'},
    {name: 'aes256-cbc key=sha256(secret) iv=utf8(iv)', key: keySha256, iv: ivBytes, mode: 'cbc'},
    {name: 'aes256-cbc key=sha256(secret) iv=zeros', key: keySha256, iv: zeroIv, mode: 'cbc'},

    // ── CBC con clave extendida directamente de los materiales ────────────────
    {name: 'aes256-cbc key=secret+iv iv=utf8(iv)', key: keySecretConcat, iv: ivBytes, mode: 'cbc'},
    {name: 'aes256-cbc key=secret*2  iv=utf8(iv)', key: keySecretDoubled, iv: ivBytes, mode: 'cbc'},
    {name: 'aes256-cbc key=secret+0s iv=utf8(iv)', key: keySecretZeroPad, iv: ivBytes, mode: 'cbc'},

    // ── CBC AES-128 ───────────────────────────────────────────────────────────
    {name: 'aes128-cbc key=sha256(secret)[0..16] iv=utf8(iv)', key: keySha256First16, iv: ivBytes, mode: 'cbc'},
    {name: 'aes128-cbc key=utf8(secret) iv=utf8(iv)', key: secretBytes, iv: ivBytes, mode: 'cbc'},
    {name: 'aes128-cbc key=utf8(secret) iv=sha256(iv)', key: secretBytes, iv: ivSha256, mode: 'cbc'},
    {name: 'aes128-cbc key=utf8(secret) iv=zeros', key: secretBytes, iv: zeroIv, mode: 'cbc'},
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      const plaintext = tryAesDecrypt(ciphertext, attempt.key, attempt.iv, attempt.mode);
      return {plaintext, strategy: attempt.name};
    } catch (error) {
      lastError = error;
      devWarn(LOG_CERT_VALIDATE, 'AES decrypt falló con estrategia', {
        strategy: attempt.name,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No se pudo desencriptar AES con estrategias conocidas');
}

export interface CertificateHandshakeKeys {
  clientPrivatePemBase64: string;
  serverPublicPemBase64: string;
}

export const DEFAULT_HANDSHAKE_KEYS: CertificateHandshakeKeys = {
  clientPrivatePemBase64: CLIENT_PRIVATE_KEY_PEM_BASE64,
  serverPublicPemBase64: SERVER_PUBLIC_KEY_PEM_BASE64,
};

function resolveContent(
  envelope: CertificateEnvelopeResponse,
): CertificateContent | undefined {
  return envelope.content ?? envelope.data;
}

function decodeAesCiphertextFromRsaPayload(payload: string): Buffer {
  const trimmed = payload.trim();
  const isHex = trimmed.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(trimmed);
  if (isHex) {
    return Buffer.from(trimmed, 'hex');
  }
  return decodeApiBase64ToBinary(trimmed);
}

export function generateCertificateSession(): CertificateSession {
  return {
    secretMaterial: materialHex16FromUuidV4(),
    ivMaterial: materialHex16FromUuidV4(),
  };
}

export function buildCertificateRequest(
  session: CertificateSession,
  keys: CertificateHandshakeKeys = DEFAULT_HANDSHAKE_KEYS,
): CertificateRequest {
  const secretEncryptBase64Single = rsaOaepEncryptHex16MaterialPemBase64ToBase64(
    keys.serverPublicPemBase64,
    session.secretMaterial,
  );
  const secretIvEncryptBase64Single = rsaOaepEncryptHex16MaterialPemBase64ToBase64(
    keys.serverPublicPemBase64,
    session.ivMaterial,
  );
  const secretEncryptSignBase64 = rsaSignSha256PrivateKeyPemBase64OnCipherBase64(
    keys.clientPrivatePemBase64,
    secretEncryptBase64Single,
  );
  const secretEncryptBase64 = Buffer.from(secretEncryptBase64Single, 'utf8').toString(
    'base64',
  );
  const secretIvEncryptBase64 = Buffer.from(secretIvEncryptBase64Single, 'utf8').toString(
    'base64',
  );
  return {
    secretEncryptBase64,
    secretEncryptSignBase64,
    secretIvEncryptBase64,
  };
}

export type PostCertificateFn = (
  body: CertificateRequest,
) => Promise<CertificateEnvelopeResponse>;

export async function startCertificateValidation(
  postCertificate: PostCertificateFn,
  keys: CertificateHandshakeKeys = DEFAULT_HANDSHAKE_KEYS,
): Promise<{
  response: CertificateEnvelopeResponse;
  session: CertificateSession;
}> {
  const session = generateCertificateSession();
  devLog(LOG_CERT_VALIDATE, 'Generando sesión de handshake', {
    secretMaterial: session.secretMaterial,
    ivMaterial: session.ivMaterial,
  });
  const body = buildCertificateRequest(session, keys);
  const response = await postCertificate(body);
  return {response, session};
}

export interface ValidatedCertificateResult {
  /** Hash del certificado en texto plano (normalmente hex o base64 según backend). */
  certificateHashHex: string;
  userMessage: string;
  /** `validateHash` del API: pinning TLS. */
  pinningEnabled: boolean;
}

export function validateCertificateResponse(
  envelope: CertificateEnvelopeResponse,
  session: CertificateSession,
  keys: CertificateHandshakeKeys = DEFAULT_HANDSHAKE_KEYS,
): ValidatedCertificateResult {
  if (envelope.responseType === 'Error') {
    throw new Error(envelope.message || 'Error en validación de certificado');
  }

  const content = resolveContent(envelope);
  if (!content?.certificate) {
    throw new Error(envelope.message || 'Respuesta de certificado incompleta');
  }

  devLog(LOG_CERT_VALIDATE, 'Verificando firma RSA (hashEncrypt)', {
    hashEncryptChars: content.certificate.hashEncrypt.length,
    hashEncryptSignChars: content.certificate.hashEncryptSign.length,
    hashEncryptPreview: content.certificate.hashEncrypt.slice(0, 12),
    hashEncryptSignPreview: content.certificate.hashEncryptSign.slice(0, 12),
    sessionSecretLen: session.secretMaterial.length,
    sessionIvLen: session.ivMaterial.length,
  });
  let signatureOk = false;
  try {
    signatureOk = rsaVerifySha256PublicKeyPemBase64OnBase64(
      keys.serverPublicPemBase64,
      content.certificate.hashEncrypt,
      content.certificate.hashEncryptSign,
    );
  } catch (error) {
    devWarn(LOG_CERT_VALIDATE, 'Error verificando firma RSA (hashEncrypt)', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
  if (!signatureOk) {
    devWarn(LOG_CERT_VALIDATE, 'Firma del servidor inválida (hashEncrypt)', {
      hashEncryptChars: content.certificate.hashEncrypt.length,
      hashEncryptSignChars: content.certificate.hashEncryptSign.length,
    });
    throw new Error('Firma del servidor inválida (hashEncrypt)');
  }
  devLog(LOG_CERT_VALIDATE, 'Firma RSA (hashEncrypt) OK');

  const aesCiphertextBase64 = rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8(
    keys.clientPrivatePemBase64,
    content.certificate.hashEncrypt,
  );
  devLog(LOG_CERT_VALIDATE, 'RSA decrypt completado (payload AES base64)', {
    aesCiphertextBase64Chars: aesCiphertextBase64.length,
    aesCiphertextBase64Preview: aesCiphertextBase64.slice(0, 16),
  });
  const ciphertext = decodeAesCiphertextFromRsaPayload(aesCiphertextBase64);
  devLog(LOG_CERT_VALIDATE, 'AES decrypt: tamaños de entrada', {
    ciphertextBytes: ciphertext.length,
    secretBytes: session.secretMaterial.length,
    ivBytes: session.ivMaterial.length,
    ciphertextMod16: ciphertext.length % 16,
  });
  const {plaintext, strategy} = tryDecryptWithDerivationStrategies(
    ciphertext,
    session.secretMaterial,
    session.ivMaterial,
  );
  devLog(LOG_CERT_VALIDATE, 'AES decrypt OK', {strategy});

  return {
    certificateHashHex: plaintext,
    userMessage: content.userMessage,
    pinningEnabled: content.validateHash,
  };
}


