import type {CertificateEnvelopeResponse} from '../../../data/models/CertificateModels';
import {Buffer} from 'buffer';
import crypto from 'react-native-quick-crypto';
import {aes256CbcEncrypt} from '../aesHelper';
import * as rsaUtils from '../rsaUtils';
import {
  buildCertificateRequest,
  deriveAes256KeyHexFromSecretMaterial,
  deriveIvHexFromIvMaterial,
  generateCertificateSession,
  materialHex16FromUuidV4,
  startCertificateValidation,
  validateCertificateResponse,
  type CertificateSession,
} from '../certificatesValidation';

function sessionFixture(): CertificateSession {
  return {
    secretMaterial: '0101010101010101',
    ivMaterial: '0202020202020202',
  };
}

describe('materialHex16FromUuidV4', () => {
  it('produce base64 no vacío', () => {
    expect(materialHex16FromUuidV4()).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('devuelve exactamente 16 caracteres', () => {
    expect(materialHex16FromUuidV4()).toHaveLength(16);
  });
});

describe('derivación de clave e IV', () => {
  it('deriveAes256KeyHexFromSecretMaterial produce 32 bytes', () => {
    const key = deriveAes256KeyHexFromSecretMaterial('secret-material-16');
    expect(key).toHaveLength(32);
  });

  it('deriveIvHexFromIvMaterial produce IV de 16 bytes', () => {
    const iv = deriveIvHexFromIvMaterial('iv-material-16ch');
    expect(iv).toHaveLength(16);
  });
});

describe('generateCertificateSession y startCertificateValidation', () => {
  it('generateCertificateSession incluye materiales de 16 caracteres', () => {
    const s = generateCertificateSession();
    expect(s.secretMaterial).toHaveLength(16);
    expect(s.ivMaterial).toHaveLength(16);
  });

  it('startCertificateValidation invoca postCertificate y devuelve sesión', async () => {
    const post = jest.fn().mockResolvedValue({
      code: 0,
      responseType: 'Success',
      message: '',
      content: {
        certificate: {hashEncrypt: 'h', hashEncryptSign: 's'},
        validateHash: true,
        userMessage: 'ok',
      },
    });
    const {response, session} = await startCertificateValidation(post);
    expect(post).toHaveBeenCalledTimes(1);
    expect(session.secretMaterial).toHaveLength(16);
    expect(response.responseType).toBe('Success');
  });
});

describe('validateCertificateResponse', () => {
  it('throws when responseType is Error', () => {
    const envelope: CertificateEnvelopeResponse = {
      code: 1,
      responseType: 'Error',
      message: 'fallo',
    };
    expect(() =>
      validateCertificateResponse(envelope, sessionFixture()),
    ).toThrow('fallo');
  });

  it('throws mensaje por defecto cuando Error sin message', () => {
    const envelope: CertificateEnvelopeResponse = {
      code: 1,
      responseType: 'Error',
      message: '',
    };
    expect(() =>
      validateCertificateResponse(envelope, sessionFixture()),
    ).toThrow('Error en validación de certificado');
  });

  it('throws when content is missing', () => {
    const envelope: CertificateEnvelopeResponse = {
      code: 0,
      responseType: 'Success',
      message: 'sin content',
    };
    expect(() =>
      validateCertificateResponse(envelope, sessionFixture()),
    ).toThrow();
  });

  it('buildCertificateRequest codifica los 3 campos en doble Base64', () => {
    const request = buildCertificateRequest(sessionFixture());
    const fields = [
      request.secretEncryptBase64,
      request.secretIvEncryptBase64,
      request.secretEncryptSignBase64,
    ];

    for (const value of fields) {
      // 2do nivel Base64 -> texto UTF-8 que debe ser el 1er nivel Base64.
      const innerBase64 = Buffer.from(value, 'base64').toString('utf8');
      expect(innerBase64).toMatch(/^[A-Za-z0-9+/=]+$/);
    }
  });

  it('acepta envelope con data en lugar de content', () => {
    const session = sessionFixture();
    const key = deriveAes256KeyHexFromSecretMaterial(session.secretMaterial);
    const iv = deriveIvHexFromIvMaterial(session.ivMaterial);
    const plaintext = 'hash-desde-servidor';
    const ciphertext = aes256CbcEncrypt(Buffer.from(plaintext, 'utf8'), key, iv);

    const verifySpy = jest
      .spyOn(rsaUtils, 'rsaVerifySha256PublicKeyPemBase64OnBase64')
      .mockReturnValue(true);
    const decryptSpy = jest
      .spyOn(rsaUtils, 'rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8')
      .mockReturnValue(ciphertext.toString('hex'));

    const envelope: CertificateEnvelopeResponse = {
      code: 0,
      responseType: 'Success',
      message: '',
      data: {
        certificate: {hashEncrypt: 'enc', hashEncryptSign: 'sig'},
        validateHash: false,
        userMessage: 'Bienvenido',
      },
    };

    const result = validateCertificateResponse(envelope, session);
    expect(result.certificateHashHex).toBe(plaintext);
    expect(result.userMessage).toBe('Bienvenido');
    expect(result.pinningEnabled).toBe(false);

    verifySpy.mockRestore();
    decryptSpy.mockRestore();
  });

  it('acepta payload RSA como base64 del ciphertext AES (no solo hex)', () => {
    const session = sessionFixture();
    const key = deriveAes256KeyHexFromSecretMaterial(session.secretMaterial);
    const iv = deriveIvHexFromIvMaterial(session.ivMaterial);
    const plaintext = 'hash-base64-path';
    const ciphertext = aes256CbcEncrypt(Buffer.from(plaintext, 'utf8'), key, iv);
    const payload = ciphertext.toString('base64');

    jest.spyOn(rsaUtils, 'rsaVerifySha256PublicKeyPemBase64OnBase64').mockReturnValue(true);
    jest
      .spyOn(rsaUtils, 'rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8')
      .mockReturnValue(payload);

    const envelope: CertificateEnvelopeResponse = {
      code: 0,
      responseType: 'Success',
      message: '',
      content: {
        certificate: {hashEncrypt: 'enc', hashEncryptSign: 'sig'},
        validateHash: true,
        userMessage: '',
      },
    };

    expect(validateCertificateResponse(envelope, session).certificateHashHex).toBe(
      plaintext,
    );

    jest.restoreAllMocks();
  });

  it('lanza si falta certificate en el contenido', () => {
    const envelope = {
      code: 0,
      responseType: 'Success',
      message: 'incompleto',
      content: {
        validateHash: true,
        userMessage: 'x',
      },
    } as CertificateEnvelopeResponse;

    expect(() =>
      validateCertificateResponse(envelope, sessionFixture()),
    ).toThrow('incompleto');
  });

  it('lanza si la firma RSA no verifica', () => {
    jest.spyOn(rsaUtils, 'rsaVerifySha256PublicKeyPemBase64OnBase64').mockReturnValue(false);

    const envelope: CertificateEnvelopeResponse = {
      code: 0,
      responseType: 'Success',
      message: '',
      content: {
        certificate: {hashEncrypt: 'enc', hashEncryptSign: 'sig'},
        validateHash: true,
        userMessage: '',
      },
    };

    expect(() =>
      validateCertificateResponse(envelope, sessionFixture()),
    ).toThrow('Firma del servidor inválida (hashEncrypt)');

    jest.restoreAllMocks();
  });

  it('propaga error si la verificación RSA lanza', () => {
    jest
      .spyOn(rsaUtils, 'rsaVerifySha256PublicKeyPemBase64OnBase64')
      .mockImplementation(() => {
        throw new Error('clave corrupta');
      });

    const envelope: CertificateEnvelopeResponse = {
      code: 0,
      responseType: 'Success',
      message: '',
      content: {
        certificate: {hashEncrypt: 'enc', hashEncryptSign: 'sig'},
        validateHash: true,
        userMessage: '',
      },
    };

    expect(() =>
      validateCertificateResponse(envelope, sessionFixture()),
    ).toThrow('clave corrupta');

    jest.restoreAllMocks();
  });

  it('lanza cuando ninguna estrategia AES logra descifrar el payload', () => {
    // secretMaterial de 15 chars genera clave de 15 bytes para AES-128 → longitud inválida;
    // las estrategias AES-256 con SHA-256 producen "bad decrypt" porque el payload es aleatorio.
    const session: CertificateSession = {
      secretMaterial: 'exactly15chars!',
      ivMaterial: 'abcdefghijklmnop',
    };
    jest.spyOn(rsaUtils, 'rsaVerifySha256PublicKeyPemBase64OnBase64').mockReturnValue(true);
    jest
      .spyOn(rsaUtils, 'rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8')
      .mockReturnValue('ab'.repeat(16));

    const envelope: CertificateEnvelopeResponse = {
      code: 0,
      responseType: 'Success',
      message: '',
      content: {
        certificate: {hashEncrypt: 'enc', hashEncryptSign: 'sig'},
        validateHash: true,
        userMessage: '',
      },
    };

    expect(() => validateCertificateResponse(envelope, session)).toThrow();

    jest.restoreAllMocks();
  });

  it('descifra vía AES-128 directo cuando AES-256 derivado falla', () => {
    // Plaintext largo (> 48 bytes) para minimizar falsos positivos con claves incorrectas.
    const plaintext = 'cert-hash-aes128-direct-strategy-validated-output';
    const session: CertificateSession = {
      secretMaterial: '1234567890123456',
      ivMaterial: 'abcdefghijklmnop',
    };
    const key16 = Buffer.from(session.secretMaterial, 'utf8').subarray(0, 16);
    const iv16 = Buffer.from(session.ivMaterial, 'utf8').subarray(0, 16);
    const cipher = crypto.createCipheriv('aes-128-cbc', key16, iv16);
    const ciphertext = Buffer.concat([
      cipher.update(Buffer.from(plaintext, 'utf8')),
      cipher.final(),
    ]);

    jest.spyOn(rsaUtils, 'rsaVerifySha256PublicKeyPemBase64OnBase64').mockReturnValue(true);
    jest
      .spyOn(rsaUtils, 'rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8')
      .mockReturnValue(ciphertext.toString('hex'));

    const envelope: CertificateEnvelopeResponse = {
      code: 0,
      responseType: 'Success',
      message: '',
      content: {
        certificate: {hashEncrypt: 'enc', hashEncryptSign: 'sig'},
        validateHash: true,
        userMessage: 'ok',
      },
    };

    const result = validateCertificateResponse(envelope, session);
    expect(result.certificateHashHex).toBe(plaintext);

    jest.restoreAllMocks();
  });

});
