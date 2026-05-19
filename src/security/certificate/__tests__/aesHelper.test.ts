import {Buffer} from 'buffer';
import {
  aes256CbcDecrypt,
  aes256CbcEncrypt,
  AES_MODE,
  AES_IV_LENGTH_BYTES,
  AES_KEY_LENGTH_BYTES,
} from '../aesHelper';

describe('aesHelper', () => {
  it('uses aes-256-cbc mode', () => {
    expect(AES_MODE).toBe('aes-256-cbc');
  });

  it('round-trips AES-256-CBC with PKCS#7', () => {
    const key = Buffer.alloc(AES_KEY_LENGTH_BYTES, 7);
    const iv = Buffer.alloc(AES_IV_LENGTH_BYTES, 3);
    const plaintext = Buffer.from('payload-de-certificado', 'utf8');

    const ct = aes256CbcEncrypt(plaintext, key, iv);
    const pt = aes256CbcDecrypt(ct, key, iv);

    expect(pt.toString('utf8')).toBe('payload-de-certificado');
  });

  it('throws on wrong key length', () => {
    const key = Buffer.alloc(16);
    const iv = Buffer.alloc(AES_IV_LENGTH_BYTES);
    expect(() => aes256CbcDecrypt(Buffer.alloc(32), key, iv)).toThrow(
      '32 bytes',
    );
  });
});
