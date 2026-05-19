import EncryptedStorage from 'react-native-encrypted-storage';
import {SecureStorageService} from '../../domain/services/SecureStorageService';

export class SecureStorageServiceImpl implements SecureStorageService {
  async save(key: string, value: string): Promise<void> {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      throw new Error(
        `SecureStorage: failed to save key "${key}" — ${error}`,
      );
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value ?? null;
    } catch {
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      throw new Error(
        `SecureStorage: failed to remove key "${key}" — ${error}`,
      );
    }
  }

  async clear(): Promise<void> {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      throw new Error(`SecureStorage: failed to clear — ${error}`);
    }
  }
}
