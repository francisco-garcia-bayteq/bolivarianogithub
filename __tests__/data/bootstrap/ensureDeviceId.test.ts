import {ensureDeviceId} from '../../../src/data/bootstrap/ensureDeviceId';
import {SecureStorageKeys} from '../../../src/data/datasources/storage/SecureStorageKeys';

describe('ensureDeviceId', () => {
  it('reutiliza id existente', async () => {
    const storage = {
      get: jest.fn().mockResolvedValue('  existing-id  '),
      save: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    };
    await expect(ensureDeviceId(storage as never)).resolves.toBe(
      '  existing-id  ',
    );
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('genera y persiste uuid si no hay id', async () => {
    const storage = {
      get: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn(),
      clear: jest.fn(),
    };
    const id = await ensureDeviceId(storage as never);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(storage.save).toHaveBeenCalledWith(
      SecureStorageKeys.KEY_DEVICE_ID,
      id,
    );
  });
});
