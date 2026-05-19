import type {SecureStorageService} from '../../domain/services/SecureStorageService';
import {readTlsPinningState} from './tlsPinningPolicy';
import {syncTlsPinningNative} from './tlsPinningNative';

/**
 * Carga estado desde secure storage y sincroniza con el bridge nativo.
 */
export async function syncTlsPinningFromStorage(
  storage: SecureStorageService,
): Promise<void> {
  const state = await readTlsPinningState(storage);
  syncTlsPinningNative(state);
}
