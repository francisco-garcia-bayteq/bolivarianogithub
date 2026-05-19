import {Buffer} from 'node:buffer';
import crypto from 'react-native-quick-crypto';
import {BiometricRSAError} from './errors';

const RSA_KEY_BITS = 2048;

export interface RsaKeyPairPem {
  readonly publicKeyPem: string;
  readonly privateKeyPem: string;
}

/**
 * RSA 2048 (SPKI / PKCS#8 PEM) y firma RSASSA-PKCS1-v1_5 + SHA-256 vía react-native-quick-crypto
 * (OpenSSL), sustituyendo react-native-rsa-native (Android deprecado).
 */
export class CryptoService {
  private memoryPrivatePem: string | null = null;
  private memoryPublicPem: string | null = null;

  async generateKeyPair(): Promise<RsaKeyPairPem> {
    try {
      const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
        modulusLength: RSA_KEY_BITS,
        publicExponent: 0x10001,
        publicKeyEncoding: {type: 'spki', format: 'pem'},
        privateKeyEncoding: {type: 'pkcs8', format: 'pem'},
      });
      if (typeof publicKey !== 'string' || typeof privateKey !== 'string') {
        throw new TypeError('Claves RSA no devueltas en PEM');
      }
      this.memoryPrivatePem = privateKey;
      this.memoryPublicPem = publicKey;
      return {
        publicKeyPem: publicKey,
        privateKeyPem: privateKey,
      };
    } catch (e) {
      throw new BiometricRSAError(
        'No se pudo generar el par de claves RSA',
        'crypto_error',
        e,
      );
    }
  }

  /**
   * Clave pública para el registro biométrico: PEM codificado en Base64 (UTF-8).
   */
  getPublicKeyBase64FromPem(publicKeyPem: string): string {
    return Buffer.from(publicKeyPem, 'utf8').toString('base64');
  }

  getPublicKeyBase64(): string {
    if (!this.memoryPublicPem) {
      throw new BiometricRSAError(
        'No hay clave pública en memoria',
        'crypto_error',
      );
    }
    return this.getPublicKeyBase64FromPem(this.memoryPublicPem);
  }

  /**
   * Firma el challenge (UTF-8) con la clave privada PEM (PKCS#8).
   * Salida Base64 del binario de la firma (equivalente a SHA256withRSA del API Java).
   */
  async signChallenge(
    challenge: string,
    privateKeyPem: string,
  ): Promise<string> {
    try {
      const signature = crypto.sign(
        'sha256',
        Buffer.from(challenge, 'utf8'),
        privateKeyPem,
      );
      return Buffer.from(signature).toString('base64');
    } catch (e) {
      throw new BiometricRSAError(
        'No se pudo firmar el challenge',
        'crypto_error',
        e,
      );
    }
  }

  clearMemoryKeys(): void {
    this.memoryPrivatePem = null;
    this.memoryPublicPem = null;
  }

  getMemoryPrivatePem(): string | null {
    return this.memoryPrivatePem;
  }

  getMemoryPublicPem(): string | null {
    return this.memoryPublicPem;
  }
}
