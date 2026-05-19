import EncryptedStorage from 'react-native-encrypted-storage';
import {SecureStorageServiceImpl} from '../../../src/data/services/SecureStorageServiceImpl';

jest.mock('react-native-encrypted-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

const storage = EncryptedStorage as jest.Mocked<typeof EncryptedStorage>;

describe('SecureStorageServiceImpl', () => {
  let service: SecureStorageServiceImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SecureStorageServiceImpl();
  });

  test('save delegates to EncryptedStorage.setItem', async () => {
    storage.setItem.mockResolvedValue(undefined);

    await service.save('k', 'v');

    expect(storage.setItem).toHaveBeenCalledWith('k', 'v');
  });

  test('save wraps errors with context', async () => {
    storage.setItem.mockRejectedValue(new Error('fail'));

    await expect(service.save('my-key', 'v')).rejects.toThrow(
      'SecureStorage: failed to save key "my-key"',
    );
  });

  test('get returns null when key is missing', async () => {
    storage.getItem.mockResolvedValue(undefined);

    await expect(service.get('k')).resolves.toBeNull();
  });

  test('get returns string value', async () => {
    storage.getItem.mockResolvedValue('stored');

    await expect(service.get('k')).resolves.toBe('stored');
  });

  test('get swallows read errors and returns null', async () => {
    storage.getItem.mockRejectedValue(new Error('read fail'));

    await expect(service.get('k')).resolves.toBeNull();
  });

  test('remove delegates to removeItem', async () => {
    storage.removeItem.mockResolvedValue(undefined);

    await service.remove('k');

    expect(storage.removeItem).toHaveBeenCalledWith('k');
  });

  test('remove wraps errors', async () => {
    storage.removeItem.mockRejectedValue('x');

    await expect(service.remove('rk')).rejects.toThrow(
      'SecureStorage: failed to remove key "rk"',
    );
  });

  test('clear delegates to EncryptedStorage.clear', async () => {
    storage.clear.mockResolvedValue(undefined);

    await service.clear();

    expect(storage.clear).toHaveBeenCalled();
  });

  test('clear wraps errors', async () => {
    storage.clear.mockRejectedValue(new Error('no'));

    await expect(service.clear()).rejects.toThrow('SecureStorage: failed to clear');
  });
});
