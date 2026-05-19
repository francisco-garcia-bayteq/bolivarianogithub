import {v4 as uuidv4} from 'uuid';
import type {SecureStorageService} from '../../domain/services/SecureStorageService';
import {SecureStorageKeys} from '../datasources/storage/SecureStorageKeys';

/**
 * Garantiza un id de dispositivo persistido (una vez por instalación).
 */
export async function ensureDeviceId(
  storage: SecureStorageService,
): Promise<string> {
  const existing = await storage.get(SecureStorageKeys.KEY_DEVICE_ID);
  if (existing?.trim()) {
    return existing;
  }
  const id = uuidv4();
  await storage.save(SecureStorageKeys.KEY_DEVICE_ID, id);
  return id;
}
