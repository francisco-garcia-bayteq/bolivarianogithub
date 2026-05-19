import type {SecureStorageService} from '../../domain/services/SecureStorageService';
import {SecureStorageKeys} from '../../data/datasources/storage/SecureStorageKeys';
import {isPinningExcludedHost} from './pinningExcludedHosts';
import {normalizeSha256Hex} from './normalizeHex';

export interface TlsPinningState {
  pinningEnabled: boolean;
  expectedSha256Hex: string | null;
}

/**
 * Lee la política desde almacenamiento seguro (valores escritos tras el handshake).
 */
export async function readTlsPinningState(
  storage: SecureStorageService,
): Promise<TlsPinningState> {
  const [hashRaw, flagRaw] = await Promise.all([
    storage.get(SecureStorageKeys.CERTIFICATE_HASH),
    storage.get(SecureStorageKeys.CERTIFICATE_PINNING_ENABLED),
  ]);

  const normalized = hashRaw ? normalizeSha256Hex(hashRaw) : '';
  const expectedSha256Hex =
    normalized.length > 0 ? normalized : null;
  const pinningEnabled = flagRaw === 'true';

  return {pinningEnabled, expectedSha256Hex};
}

/**
 * Si para esta URL el cliente nativo debe verificar SHA-256(DER) del certificado.
 */
export function shouldApplyTlsPinningForUrl(
  urlString: string,
  state: TlsPinningState,
): boolean {
  if (!state.pinningEnabled || !state.expectedSha256Hex) {
    return false;
  }
  try {
    const u = new URL(urlString);
    if (u.protocol !== 'https:') {
      return false;
    }
    const host = u.hostname;
    if (isPinningExcludedHost(host)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
