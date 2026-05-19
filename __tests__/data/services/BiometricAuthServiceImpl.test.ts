import {BiometricAuthServiceImpl} from '../../../src/data/services/BiometricAuthServiceImpl';
import {BiometricAuthError} from '../../../src/domain/services/BiometricAuthService';

const mockIsSensorAvailable = jest.fn();
const mockSimplePrompt = jest.fn();

jest.mock('react-native-biometrics', () =>
  jest.fn().mockImplementation(() => ({
    isSensorAvailable: mockIsSensorAvailable,
    simplePrompt: mockSimplePrompt,
  })),
);

describe('BiometricAuthServiceImpl', () => {
  let service: BiometricAuthServiceImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BiometricAuthServiceImpl();
  });

  test('getAvailability maps sensor result', async () => {
    mockIsSensorAvailable.mockResolvedValue({
      available: true,
      biometryType: 'FaceID',
      error: undefined,
    });

    await expect(service.getAvailability()).resolves.toEqual({
      available: true,
      biometryType: 'FaceID',
      error: undefined,
    });
  });

  test('authenticate resolves when prompt succeeds without error', async () => {
    mockSimplePrompt.mockResolvedValue({success: true, error: undefined});

    await expect(service.authenticate('Hola')).resolves.toBeUndefined();
    expect(mockSimplePrompt).toHaveBeenCalledWith({promptMessage: 'Hola'});
  });

  test('authenticate throws when user cancels', async () => {
    mockSimplePrompt.mockResolvedValue({success: false, error: undefined});

    await expect(service.authenticate('x')).rejects.toBeInstanceOf(
      BiometricAuthError,
    );
    await expect(service.authenticate('x')).rejects.toMatchObject({
      code: 'user_cancelled',
    });
  });

  test('authenticate throws prompt_failed when native error is set', async () => {
    mockSimplePrompt.mockResolvedValue({success: true, error: 'Sensor busy'});

    await expect(service.authenticate('x')).rejects.toMatchObject({
      code: 'prompt_failed',
      message: 'Sensor busy',
    });
  });
});
