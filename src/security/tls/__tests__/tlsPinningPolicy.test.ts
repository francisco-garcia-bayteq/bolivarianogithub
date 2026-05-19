import {
  readTlsPinningState,
  shouldApplyTlsPinningForUrl,
} from '../tlsPinningPolicy';
import {normalizeSha256Hex} from '../normalizeHex';
import {isPinningExcludedHost} from '../pinningExcludedHosts';
import {SecureStorageKeys} from '../../../data/datasources/storage/SecureStorageKeys';
import type {SecureStorageService} from '../../../domain/services/SecureStorageService';

describe('normalizeSha256Hex', () => {
  it('lowercases and strips spaces', () => {
    expect(normalizeSha256Hex(' AB CD ')).toBe('abcd');
  });
});

describe('isPinningExcludedHost', () => {
  it('matches maps host', () => {
    expect(isPinningExcludedHost('maps.googleapis.com')).toBe(true);
  });
  it('matches subdomain', () => {
    expect(isPinningExcludedHost('tiles.maps.googleapis.com')).toBe(true);
  });
});

describe('shouldApplyTlsPinningForUrl', () => {
  it('returns false when pinning disabled', () => {
    expect(
      shouldApplyTlsPinningForUrl('https://api.example.com/x', {
        pinningEnabled: false,
        expectedSha256Hex: 'abc',
      }),
    ).toBe(false);
  });

  it('returns false for http', () => {
    expect(
      shouldApplyTlsPinningForUrl('http://api.example.com/x', {
        pinningEnabled: true,
        expectedSha256Hex: 'abc',
      }),
    ).toBe(false);
  });

  it('returns false for excluded host', () => {
    expect(
      shouldApplyTlsPinningForUrl('https://maps.googleapis.com/foo', {
        pinningEnabled: true,
        expectedSha256Hex: 'deadbeef',
      }),
    ).toBe(false);
  });

  it('returns true for pinned api https', () => {
    expect(
      shouldApplyTlsPinningForUrl('https://dev4.bayteq.com/path', {
        pinningEnabled: true,
        expectedSha256Hex: 'aa',
      }),
    ).toBe(true);
  });
});

describe('readTlsPinningState', () => {
  it('reads hash and flag from storage', async () => {
    const storage: SecureStorageService = {
      async get(key: string) {
        if (key === SecureStorageKeys.CERTIFICATE_HASH) {
          return '  AB ';
        }
        if (key === SecureStorageKeys.CERTIFICATE_PINNING_ENABLED) {
          return 'true';
        }
        return null;
      },
      async save() {},
      async remove() {},
      async clear() {},
    };
    const state = await readTlsPinningState(storage);
    expect(state.pinningEnabled).toBe(true);
    expect(state.expectedSha256Hex).toBe('ab');
  });
});
