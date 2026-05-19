import {Buffer} from 'buffer';
import {
  base64ToHex,
  bufferToHex,
  hexToBase64,
} from '../encoding';

describe('encoding (react-native-base64 + hex)', () => {
  it('hex ↔ Base64 round-trip', () => {
    const hex = '00ff0a14';
    expect(base64ToHex(hexToBase64(hex))).toBe(hex);
  });

  it('bufferToHex', () => {
    expect(bufferToHex(Buffer.from([0xab, 0xcd]))).toBe('abcd');
  });
});
