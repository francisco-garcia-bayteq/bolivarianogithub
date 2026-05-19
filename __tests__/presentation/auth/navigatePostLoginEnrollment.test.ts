import {navigatePostLoginEnrollment} from '../../../src/presentation/auth/navigatePostLoginEnrollment';
import {SecureStorageKeys} from '../../../src/data/datasources/storage/SecureStorageKeys';

describe('navigatePostLoginEnrollment', () => {
  const user = {
    id: '1',
    email: 'a@b.com',
    name: 'Test',
    token: 't',
    sessionExpiresAt: Date.now() + 60_000,
    inactivityTimeoutSeconds: 300,
  };

  function makeDeps(overrides?: {
    hasBiometricRegistration?: boolean;
    getDeclined?: string | null;
  }) {
    return {
      biometricRSAAuthOrchestrator: {
        hasBiometricRegistration: jest
          .fn()
          .mockResolvedValue(overrides?.hasBiometricRegistration ?? false),
      },
      secureStorageService: {
        get: jest.fn(async (key: string) => {
          if (key === SecureStorageKeys.BIOMETRIC_OFFER_DECLINED) {
            return overrides?.getDeclined ?? null;
          }
          return null;
        }),
      },
      login: jest.fn().mockResolvedValue(undefined),
    };
  }

  it('con forceShowBiometricOffer ignora hasBiometricRegistration y va a BiometricOffer', async () => {
    const replace = jest.fn();
    const navigation = {replace} as never;
    const deps = makeDeps({hasBiometricRegistration: true, getDeclined: null});

    await navigatePostLoginEnrollment(
      navigation,
      user,
      user.email,
      deps as never,
      {forceShowBiometricOffer: true},
    );

    expect(deps.login).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('BiometricOffer', {
      user,
      email: user.email,
    });
  });

  it('sin forceShow y con biometría registrada hace login y no navega', async () => {
    const replace = jest.fn();
    const navigation = {replace} as never;
    const deps = makeDeps({hasBiometricRegistration: true});

    await navigatePostLoginEnrollment(
      navigation,
      user,
      user.email,
      deps as never,
    );

    expect(deps.login).toHaveBeenCalledWith(user);
    expect(replace).not.toHaveBeenCalled();
  });
});
