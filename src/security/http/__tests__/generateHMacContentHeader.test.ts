import {Buffer} from 'buffer';
import crypto from 'react-native-quick-crypto';
import {
  bodyHashForContentHeader,
  generateHMacForContentHeaderApi,
  serializeBodyForContentHeader,
} from '../generateHMacContentHeader';

function expectedHmacHex(secretKey: string, nonce: string): string {
  return crypto
    .createHmac('sha256', Buffer.from(secretKey, 'utf8'))
    .update(nonce)
    .digest('hex');
}

describe('generateHMacForContentHeaderApi', () => {
  it('GET sin query ni body: tres separadores || entre método, query, bodyHash y tiempo', () => {
    const secretKey = 'unit-test-secret';
    const timeStamp = '1700000000';
    const body = '';
    const nonce = ['GET', '', '', timeStamp].join('||');
    expect(
      generateHMacForContentHeaderApi({
        secretKey,
        method: 'get',
        queryString: '',
        body,
        timeStamp,
      }),
    ).toBe(expectedHmacHex(secretKey, nonce));
  });

  it('POST con JSON y query: incluye bodyHash SHA-256 hex', () => {
    const secretKey = 'another-secret';
    const timeStamp = '1710000000';
    const data = {a: 1, b: 'z'};
    const body = serializeBodyForContentHeader(data);
    const bodyHash = bodyHashForContentHeader(body);
    expect(bodyHash).toBe(
      crypto.createHash('sha256').update(body).digest('hex'),
    );
    const queryString = 'foo=bar&x=1';
    const nonce = `POST||${queryString}||${bodyHash}||${timeStamp}`;
    expect(
      generateHMacForContentHeaderApi({
        secretKey,
        method: 'POST',
        queryString,
        body,
        timeStamp,
      }),
    ).toBe(expectedHmacHex(secretKey, nonce));
  });
});

describe('serializeBodyForContentHeader', () => {
  it('null y undefined producen cadena vacía', () => {
    expect(serializeBodyForContentHeader(null)).toBe('');
    expect(serializeBodyForContentHeader(undefined)).toBe('');
  });
});
