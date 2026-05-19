import {Buffer} from 'buffer';
import {
  pemFromBase64PemBlock,
  normalizePemKeyMaterialBase64,
  decodeApiBase64ToBinary,
  toDoubleBase64FromBuffer,
  base64ToCipherBuffer,
  rsaEncryptPublicKeyPemBase64Utf8ToBase64,
  rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8,
  rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToHex,
  rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64,
  rsaOaepEncryptHex16MaterialPemBase64ToBase64,
  rsaVerifySha256PublicKeyPemBase64OnBase64,
  rsaSignSha256PrivateKeyPemBase64OnCipherBase64,
  createPublicKeyFromPemBase64,
} from '../rsaUtils';
import {
  CLIENT_PRIVATE_KEY_PEM_BASE64,
  CLIENT_PUBLIC_KEY_PEM_BASE64,
  SERVER_PUBLIC_KEY_PEM_BASE64,
} from '../keys.constants';

jest.mock('../../../data/api/devLog', () => ({
  devLog: jest.fn(),
}));

describe('rsaUtils', () => {
  describe('pemFromBase64PemBlock', () => {
    it('decodifica PEM UTF-8 desde bloque Base64', () => {
      const pemUtf8 = '-----BEGIN PUBLIC KEY-----\nABC\n-----END PUBLIC KEY-----';
      const b64 = Buffer.from(pemUtf8, 'utf8').toString('base64');
      expect(pemFromBase64PemBlock(b64)).toBe(pemUtf8);
    });
  });

  describe('normalizePemKeyMaterialBase64', () => {
    it('lanza si el material está vacío', () => {
      expect(() => normalizePemKeyMaterialBase64('   ')).toThrow(
        'El material PEM está vacío',
      );
    });

    it('elimina BOM y normaliza PEM plano a Base64(UTF-8)', () => {
      const pem = '-----BEGIN PUBLIC KEY-----\nX\n-----END PUBLIC KEY-----';
      const withBom = `\uFEFF${pem}`;
      const out = normalizePemKeyMaterialBase64(withBom);
      expect(out).toBe(Buffer.from(pem, 'utf8').toString('base64'));
    });

    it('acepta Base64 compacto con guiones URL-safe', () => {
      const normalizedPlain = normalizePemKeyMaterialBase64(
        CLIENT_PUBLIC_KEY_PEM_BASE64,
      );
      const fromPemBlock = pemFromBase64PemBlock(CLIENT_PUBLIC_KEY_PEM_BASE64);
      const expected = Buffer.from(fromPemBlock, 'utf8').toString('base64');
      expect(normalizedPlain).toBe(expected);
    });
  });

  describe('decodeApiBase64ToBinary', () => {
    it('devuelve bytes directos si el primer decode no parece Base64 ASCII', () => {
      const raw = Buffer.from([0xff, 0x00, 0xab]);
      const input = raw.toString('base64');
      const out = decodeApiBase64ToBinary(input);
      expect(out.equals(raw)).toBe(true);
    });

    it('desenvuelve doble Base64 cuando aplica', () => {
      const inner = Buffer.from('hello', 'utf8').toString('base64');
      const double = Buffer.from(inner, 'utf8').toString('base64');
      const out = decodeApiBase64ToBinary(double);
      expect(out.toString('utf8')).toBe('hello');
    });
  });

  describe('toDoubleBase64FromBuffer', () => {
    it('aplica la convención doble Base64', () => {
      const buf = Buffer.from('x', 'utf8');
      const d = toDoubleBase64FromBuffer(buf);
      const once = Buffer.from(d, 'base64').toString('utf8');
      const twice = Buffer.from(once, 'base64');
      expect(twice.toString('utf8')).toBe('x');
    });
  });

  describe('base64ToCipherBuffer', () => {
    it('decodifica cipher Base64 a Buffer', () => {
      const b = Buffer.from([1, 2, 3]);
      expect(base64ToCipherBuffer(b.toString('base64')).equals(b)).toBe(true);
    });
  });

  describe('cifrado / descifrado cliente (par PEM demo)', () => {
    it('roundtrip OAEP con clave pública/privada del cliente', () => {
      const plain = 'token-secreto';
      const cipherB64 = rsaEncryptPublicKeyPemBase64Utf8ToBase64(
        CLIENT_PUBLIC_KEY_PEM_BASE64,
        plain,
      );
      const back = rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8(
        CLIENT_PRIVATE_KEY_PEM_BASE64,
        cipherB64,
      );
      expect(back).toBe(plain);
    });

    it('rsaOaepDecrypt…ToHex devuelve hex del plaintext', () => {
      const plain = 'ab';
      const cipherB64 = rsaEncryptPublicKeyPemBase64Utf8ToBase64(
        CLIENT_PUBLIC_KEY_PEM_BASE64,
        plain,
      );
      const hex = rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToHex(
        CLIENT_PRIVATE_KEY_PEM_BASE64,
        cipherB64,
      );
      expect(hex).toMatch(/^[0-9a-f]+$/i);
      expect(Buffer.from(hex, 'hex').toString('utf8')).toBe(plain);
    });

    it('rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64 y descifrado coherente', () => {
      const plain = 'hola';
      const double = rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
        CLIENT_PUBLIC_KEY_PEM_BASE64,
        plain,
      );
      const decrypted = rsaOaepDecryptPrivateKeyPemBase64CipherBase64ToUtf8(
        CLIENT_PRIVATE_KEY_PEM_BASE64,
        double,
      );
      expect(decrypted).toBe(plain);
    });
  });

  describe('validaciones y errores', () => {
    it('rsaEncryptPublicKeyPemBase64Utf8ToBase64 exige texto y llave', () => {
      expect(() =>
        rsaEncryptPublicKeyPemBase64Utf8ToBase64(
          CLIENT_PUBLIC_KEY_PEM_BASE64,
          '',
        ),
      ).toThrow('No hay texto para encriptar');
      expect(() =>
        rsaEncryptPublicKeyPemBase64Utf8ToBase64('  ', 'x'),
      ).toThrow('La llave pública es requerida');
    });

    it('rsaOaepEncryptHex16MaterialPemBase64ToBase64 exige texto', () => {
      expect(() =>
        rsaOaepEncryptHex16MaterialPemBase64ToBase64(
          CLIENT_PUBLIC_KEY_PEM_BASE64,
          '',
        ),
      ).toThrow('No hay texto para encriptar');
    });

    it('rsaSignSha256PrivateKeyPemBase64OnCipherBase64 exige llave privada', () => {
      expect(() =>
        rsaSignSha256PrivateKeyPemBase64OnCipherBase64('  ', 'YWJj'),
      ).toThrow('La llave privada del cliente es requerida');
    });
  });

  describe('firma y verificación', () => {
    it('firma y verifica con clave demo del cliente (mensaje = string cipher base64)', () => {
      const cipherBase64 = Buffer.from('payload', 'utf8').toString('base64');
      const sigDoubleB64 = rsaSignSha256PrivateKeyPemBase64OnCipherBase64(
        CLIENT_PRIVATE_KEY_PEM_BASE64,
        cipherBase64,
      );
      const ok = rsaVerifySha256PublicKeyPemBase64OnBase64(
        CLIENT_PUBLIC_KEY_PEM_BASE64,
        Buffer.from(cipherBase64, 'utf8').toString('base64'),
        sigDoubleB64,
      );
      expect(ok).toBe(true);
    });

    it('rsaVerifySha256PublicKeyPemBase64OnBase64 devuelve false con firma inválida', () => {
      const cipherBase64 = Buffer.from('x', 'utf8').toString('base64');
      const sigDoubleB64 = rsaSignSha256PrivateKeyPemBase64OnCipherBase64(
        CLIENT_PRIVATE_KEY_PEM_BASE64,
        cipherBase64,
      );
      const ok = rsaVerifySha256PublicKeyPemBase64OnBase64(
        CLIENT_PUBLIC_KEY_PEM_BASE64,
        Buffer.from('otro-mensaje', 'utf8').toString('base64'),
        sigDoubleB64,
      );
      expect(ok).toBe(false);
    });
  });

  describe('createPublicKeyFromPemBase64', () => {
    it('crea clave pública válida desde material Base64 del servidor', () => {
      const key = createPublicKeyFromPemBase64(SERVER_PUBLIC_KEY_PEM_BASE64);
      expect(key).toBeDefined();
    });
  });
});
