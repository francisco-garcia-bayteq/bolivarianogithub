import {CryptoService} from '../CryptoService';
import {BiometricRSAError} from '../errors';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generateKeyPair devuelve PEM y guarda en memoria', async () => {
    const pair = await service.generateKeyPair();
    expect(pair.publicKeyPem).toContain('BEGIN PUBLIC KEY');
    expect(pair.privateKeyPem).toContain('BEGIN PRIVATE KEY');
    expect(service.getMemoryPrivatePem()).toBe(pair.privateKeyPem);
    expect(service.getMemoryPublicPem()).toBe(pair.publicKeyPem);
  });

  it('getPublicKeyBase64FromPem codifica UTF-8 a Base64', () => {
    const pem = '-----BEGIN PUBLIC KEY-----\nabc\n-----END PUBLIC KEY-----';
    expect(service.getPublicKeyBase64FromPem(pem)).toBe(
      Buffer.from(pem, 'utf8').toString('base64'),
    );
  });

  it('getPublicKeyBase64 lanza si no hay clave en memoria', () => {
    expect(() => service.getPublicKeyBase64()).toThrow(BiometricRSAError);
    expect(() => service.getPublicKeyBase64()).toThrow(
      'No hay clave pública en memoria',
    );
  });

  it('signChallenge firma y devuelve Base64', async () => {
    const {privateKeyPem, publicKeyPem} = await service.generateKeyPair();
    const sig = await service.signChallenge('challenge-utf8', privateKeyPem);
    expect(typeof sig).toBe('string');
    expect(sig.length).toBeGreaterThan(10);
    const crypto = require('react-native-quick-crypto');
    const ok = crypto.verify(
      'sha256',
      Buffer.from('challenge-utf8', 'utf8'),
      publicKeyPem,
      Buffer.from(sig, 'base64'),
    );
    expect(ok).toBe(true);
  });

  it('signChallenge envuelve fallos de crypto en BiometricRSAError', async () => {
    const crypto = require('react-native-quick-crypto');
    jest.spyOn(crypto, 'sign').mockImplementation(() => {
      throw new Error('bad key');
    });
    await expect(
      service.signChallenge('x', '-----BEGIN PRIVATE KEY-----\ninvalid\n-----END PRIVATE KEY-----'),
    ).rejects.toMatchObject({
      name: 'BiometricRSAError',
      code: 'crypto_error',
    });
  });

  it('generateKeyPair envuelve errores en BiometricRSAError', async () => {
    const crypto = require('react-native-quick-crypto');
    jest.spyOn(crypto, 'generateKeyPairSync').mockImplementation(() => {
      throw new Error('no openssl');
    });
    await expect(service.generateKeyPair()).rejects.toMatchObject({
      code: 'crypto_error',
      message: 'No se pudo generar el par de claves RSA',
    });
  });

  it('clearMemoryKeys limpia PEM en memoria', async () => {
    await service.generateKeyPair();
    service.clearMemoryKeys();
    expect(service.getMemoryPrivatePem()).toBeNull();
    expect(service.getMemoryPublicPem()).toBeNull();
  });
});
