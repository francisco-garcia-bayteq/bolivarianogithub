import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {AppState} from 'react-native';
import {AuthProvider, useAuth} from '../../src/providers/AuthProvider';
import {useDI} from '../../src/di';
import {SecureStorageKeys} from '../../src/data/datasources/storage/SecureStorageKeys';

jest.mock('../../src/di', () => ({
  useDI: jest.fn(),
}));

const mockedUseDI = useDI as jest.MockedFunction<typeof useDI>;

describe('AuthProvider', () => {
  const secureStorage = {
    remove: jest.fn(() => Promise.resolve()),
    save: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve(null)),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDI.mockReturnValue({
      secureStorageService: secureStorage,
    } as never);
  });

  it('tras restaurar sesión queda sin usuario e isLoading false', async () => {
    let ctx: ReturnType<typeof useAuth> | undefined;
    function Read() {
      ctx = useAuth();
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Read />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(ctx?.isAuthenticated).toBe(false);
    expect(ctx?.user).toBeNull();
    expect(ctx?.isLoading).toBe(false);
    expect(secureStorage.remove).toHaveBeenCalledWith(
      SecureStorageKeys.USER_SESSION,
    );
  });

  it('login persiste usuario y token', async () => {
    let ctx: ReturnType<typeof useAuth> | undefined;
    function Read() {
      ctx = useAuth();
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Read />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    const user = {
      id: '1',
      email: 'a@b.com',
      firstName: 'Ana',
      name: 'Ana',
      token: 'tok',
      sessionExpiresAt: Date.now() + 60_000,
      inactivityTimeoutSeconds: 300,
    };

    await act(async () => {
      await ctx?.login(user);
    });

    expect(secureStorage.save).toHaveBeenCalledWith(
      SecureStorageKeys.USER_SESSION,
      JSON.stringify(user),
    );
    expect(secureStorage.save).toHaveBeenCalledWith(
      SecureStorageKeys.AUTH_TOKEN,
      'tok',
    );
    expect(secureStorage.get).toHaveBeenCalledWith(
      SecureStorageKeys.DEVICE_BOUND_LOGIN_ID,
    );
    expect(secureStorage.save).toHaveBeenCalledWith(
      SecureStorageKeys.DEVICE_BOUND_LOGIN_ID,
      'a@b.com',
    );
    expect(secureStorage.save).toHaveBeenCalledWith(
      SecureStorageKeys.DEVICE_BOUND_GREETING_NAME,
      'Ana',
    );
    expect(secureStorage.save).toHaveBeenCalledWith(
      SecureStorageKeys.DEVICE_BOUND_GREETING_FIRST_NAME,
      'Ana',
    );
    expect(ctx?.isAuthenticated).toBe(true);
    expect(ctx?.user).toEqual(user);
  });

  it('logout limpia almacén y estado', async () => {
    let ctx: ReturnType<typeof useAuth> | undefined;
    function Read() {
      ctx = useAuth();
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Read />
        </AuthProvider>,
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await ctx?.login({
        id: '1',
        email: 'a@b.com',
        firstName: 'Ana',
        name: 'Ana',
        token: 't',
        sessionExpiresAt: Date.now() + 1000,
        inactivityTimeoutSeconds: 60,
      });
    });

    await act(async () => {
      await ctx?.logout();
    });

    expect(secureStorage.remove).toHaveBeenCalledWith(
      SecureStorageKeys.USER_SESSION,
    );
    expect(secureStorage.remove).toHaveBeenCalledWith(
      SecureStorageKeys.AUTH_TOKEN,
    );
    expect(ctx?.user).toBeNull();
    expect(ctx?.isAuthenticated).toBe(false);
  });

  it('logout con suppressCompactLoginAutoBiometricOnce incrementa generation; logout normal la resetea', async () => {
    let ctx: ReturnType<typeof useAuth> | undefined;
    function Read() {
      ctx = useAuth();
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Read />
        </AuthProvider>,
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(ctx?.suppressCompactAutoBiometricGeneration).toBe(0);

    await act(async () => {
      await ctx?.logout({suppressCompactLoginAutoBiometricOnce: true});
    });

    expect(ctx?.suppressCompactAutoBiometricGeneration).toBe(1);

    await act(async () => {
      await ctx?.logout();
    });

    expect(ctx?.suppressCompactAutoBiometricGeneration).toBe(0);
  });

  it('registra listener de AppState que borra USER_LOGIN_DATA al ir a background', async () => {
    const addSpy = jest.spyOn(AppState, 'addEventListener');

    await act(async () => {
      ReactTestRenderer.create(<AuthProvider>{null}</AuthProvider>);
    });

    const changeCall = addSpy.mock.calls.find(c => c[0] === 'change');
    const handler = changeCall?.[1] as ((s: string) => void) | undefined;
    expect(handler).toBeDefined();

    act(() => {
      handler?.('background');
    });

    expect(secureStorage.remove).toHaveBeenCalledWith(
      SecureStorageKeys.USER_LOGIN_DATA,
    );

    addSpy.mockRestore();
  });
});
