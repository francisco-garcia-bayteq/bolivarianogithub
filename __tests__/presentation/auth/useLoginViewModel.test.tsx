import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {useDI} from '../../../src/di';
import {
  useLoginViewModel,
  type UseLoginViewModelOptions,
} from '../../../src/presentation/auth/useLoginViewModel';
import {BiometricRSAError} from '../../../src/security/biometric/errors';

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getVersion: jest.fn(() => '1.0.0'),
    getBuildNumber: jest.fn(() => '1'),
  },
}));

jest.mock('../../../src/di', () => ({
  useDI: jest.fn(),
}));

const mockedUseDI = useDI as jest.MockedFunction<typeof useDI>;

const defaultOrchestrator = {
  loginWithBiometric: jest.fn(),
  registerBiometricForUser: jest.fn(),
  hasBiometricRegistration: jest.fn(),
};

describe('useLoginViewModel', () => {
  let latest: ReturnType<typeof useLoginViewModel> | undefined;

  function Harness({
    onCredentialLoginSuccess,
    onBiometricLoginSuccess,
    options,
  }: {
    onCredentialLoginSuccess: (user: {
      id: string;
      email: string;
      name: string;
      token: string;
    }) => void;
    onBiometricLoginSuccess: (user: {
      id: string;
      email: string;
      name: string;
      token: string;
    }) => void;
    options?: UseLoginViewModelOptions;
  }) {
    latest = useLoginViewModel(
      onCredentialLoginSuccess,
      onBiometricLoginSuccess,
      options,
    );
    return null;
  }

  beforeEach(() => {
    latest = undefined;
    jest.clearAllMocks();
  });

  test('sanitizes caracteres no permitidos en usuario y muestra error de campo', async () => {
    mockedUseDI.mockReturnValue({
      loginUseCase: {execute: jest.fn()},
      biometricRSAAuthOrchestrator: defaultOrchestrator,
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Harness
          onCredentialLoginSuccess={jest.fn()}
          onBiometricLoginSuccess={jest.fn()}
        />,
      );
    });

    act(() => {
      latest?.setEmail('usuario\u200B-demo12');
    });

    expect(latest?.email).toBe('usuario-demo12');
    expect(latest?.emailError).toBe(
      'El usuario contiene caracteres no permitidos',
    );
  });

  test('blocks submit when fields are invalid and does not call login use case', async () => {
    const execute = jest.fn();

    mockedUseDI.mockReturnValue({
      loginUseCase: {execute},
      biometricRSAAuthOrchestrator: defaultOrchestrator,
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Harness
          onCredentialLoginSuccess={jest.fn()}
          onBiometricLoginSuccess={jest.fn()}
        />,
      );
    });

    act(() => {
      latest?.setEmail('usuario-demo12');
      latest?.setPassword('123');
    });

    await act(async () => {
      await latest?.handleLogin();
    });

    expect(latest?.passwordError).toBe(
      'La contraseña debe tener al menos 8 caracteres',
    );
    expect(execute).not.toHaveBeenCalled();
  });

  test('submits trimmed credentials and invokes credential success callback', async () => {
    const execute = jest.fn().mockResolvedValue({
      id: 'usuario-demo12',
      email: 'usuario-demo12',
      firstName: 'Usuario',
      name: 'Usuario Demo',
      token: 'jwt-token',
    });
    const onCredentialLoginSuccess = jest.fn();
    const onBiometricLoginSuccess = jest.fn();

    mockedUseDI.mockReturnValue({
      loginUseCase: {execute},
      biometricRSAAuthOrchestrator: defaultOrchestrator,
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Harness
          onCredentialLoginSuccess={onCredentialLoginSuccess}
          onBiometricLoginSuccess={onBiometricLoginSuccess}
        />,
      );
    });

    act(() => {
      latest?.setEmail('  usuario-demo12  ');
      latest?.setPassword('  12345678  ');
    });

    await act(async () => {
      await latest?.handleLogin();
    });

    expect(execute).toHaveBeenCalledWith('usuario-demo12', '12345678');
    expect(onCredentialLoginSuccess).toHaveBeenCalledWith({
      id: 'usuario-demo12',
      email: 'usuario-demo12',
      firstName: 'Usuario',
      name: 'Usuario Demo',
      token: 'jwt-token',
    });
    expect(onBiometricLoginSuccess).not.toHaveBeenCalled();
    expect(latest?.emailError).toBeNull();
    expect(latest?.passwordError).toBeNull();
  });

  test('biometric login invokes biometric success callback', async () => {
    const loginWithBiometric = jest.fn().mockResolvedValue({
      id: 'cliente@banco.com',
      email: 'cliente@banco.com',
      firstName: 'María',
      name: 'María',
      token: 'bio-token',
      sessionExpiresAt: Date.now() + 3600 * 1000,
      inactivityTimeoutSeconds: 300,
    });
    const onCredentialLoginSuccess = jest.fn();
    const onBiometricLoginSuccess = jest.fn();

    mockedUseDI.mockReturnValue({
      loginUseCase: {execute: jest.fn()},
      biometricRSAAuthOrchestrator: {
        ...defaultOrchestrator,
        loginWithBiometric,
      },
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Harness
          onCredentialLoginSuccess={onCredentialLoginSuccess}
          onBiometricLoginSuccess={onBiometricLoginSuccess}
        />,
      );
    });

    await act(async () => {
      await latest?.handleBiometricLogin();
    });

    expect(loginWithBiometric).toHaveBeenCalled();
    expect(onBiometricLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'cliente@banco.com',
        email: 'cliente@banco.com',
        firstName: 'María',
        name: 'María',
        token: 'bio-token',
        inactivityTimeoutSeconds: 300,
      }),
    );
    const bioUser = onBiometricLoginSuccess.mock.calls[0][0];
    expect(bioUser.sessionExpiresAt).toEqual(expect.any(Number));
    expect(onCredentialLoginSuccess).not.toHaveBeenCalled();
  });

  test('handleLogin muestra error de red cuando loginUseCase lanza RSA network_error', async () => {
    const execute = jest
      .fn()
      .mockRejectedValue(
        new BiometricRSAError('Servidor caído', 'network_error'),
      );

    mockedUseDI.mockReturnValue({
      loginUseCase: {execute},
      biometricRSAAuthOrchestrator: defaultOrchestrator,
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Harness
          onCredentialLoginSuccess={jest.fn()}
          onBiometricLoginSuccess={jest.fn()}
        />,
      );
    });

    act(() => {
      latest?.setEmail('usuario-demo12');
      latest?.setPassword('12345678');
    });

    await act(async () => {
      await latest?.handleLogin();
    });

    expect(latest?.error).toBe('Servidor caído');
    expect(latest?.isLoadingLogin).toBe(false);
  });

  test('modo dispositivo vinculado ignora setEmail y fija usuario para envío', async () => {
    const execute = jest.fn().mockResolvedValue({
      id: 'usuario-demo12',
      email: 'usuario-demo12',
      firstName: 'Usuario',
      name: 'Usuario Demo',
      token: 'jwt-token',
    });
    const onCredentialLoginSuccess = jest.fn();

    mockedUseDI.mockReturnValue({
      loginUseCase: {execute},
      biometricRSAAuthOrchestrator: defaultOrchestrator,
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Harness
          onCredentialLoginSuccess={onCredentialLoginSuccess}
          onBiometricLoginSuccess={jest.fn()}
          options={{deviceBoundLoginId: 'usuario-demo12'}}
        />,
      );
    });

    act(() => {
      latest?.setEmail('otro');
    });
    expect(latest?.email).toBe('usuario-demo12');
    expect(latest?.isDeviceBoundCompact).toBe(true);

    act(() => {
      latest?.setPassword('12345678');
    });

    await act(async () => {
      await latest?.handleLogin();
    });

    expect(execute).toHaveBeenCalledWith('usuario-demo12', '12345678');
    expect(onCredentialLoginSuccess).toHaveBeenCalled();
  });

  test('resetForDifferentUser limpia credenciales', async () => {
    mockedUseDI.mockReturnValue({
      loginUseCase: {execute: jest.fn()},
      biometricRSAAuthOrchestrator: defaultOrchestrator,
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Harness
          onCredentialLoginSuccess={jest.fn()}
          onBiometricLoginSuccess={jest.fn()}
          options={{deviceBoundLoginId: 'usuario-demo12'}}
        />,
      );
    });

    act(() => {
      latest?.setPassword('12345678');
      latest?.resetForDifferentUser();
    });

    expect(latest?.email).toBe('');
    expect(latest?.password).toBe('');
  });

  test('contraseña demasiado larga muestra error de campo', async () => {
    mockedUseDI.mockReturnValue({
      loginUseCase: {execute: jest.fn()},
      biometricRSAAuthOrchestrator: defaultOrchestrator,
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Harness
          onCredentialLoginSuccess={jest.fn()}
          onBiometricLoginSuccess={jest.fn()}
        />,
      );
    });

    const longPw = 'a'.repeat(30);
    act(() => {
      latest?.setPassword(longPw);
    });

    expect(latest?.passwordError).toBeTruthy();
    expect(latest?.password?.length).toBe(16);
  });
});
