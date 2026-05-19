import React from 'react';
import {AppState} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {
  SessionTimeoutProvider,
  useSessionTimeout,
} from '../../src/providers/SessionTimeoutProvider';
import {SessionTimeoutWarningModal} from '../../src/presentation/components/SessionTimeoutWarningModal';

const warningProps = {visible: false, secondsRemaining: 0};

jest.mock('../../src/presentation/components/SessionTimeoutWarningModal', () => ({
  SessionTimeoutWarningModal: (p: {
    visible: boolean;
    secondsRemaining: number;
    onContinue: () => void;
  }) => {
    warningProps.visible = p.visible;
    warningProps.secondsRemaining = p.secondsRemaining;
    return null;
  },
}));

const sessionExpiredProps: {
  visible: boolean;
  onAccept?: () => void;
} = {visible: false};

jest.mock('../../src/presentation/components/SessionExpiredModal', () => ({
  SessionExpiredModal: (p: {visible: boolean; onAccept: () => void}) => {
    sessionExpiredProps.visible = p.visible;
    sessionExpiredProps.onAccept = p.onAccept;
    return null;
  },
}));

const mockUseAuth = jest.fn();

jest.mock('../../src/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('SessionTimeoutProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    warningProps.visible = false;
    warningProps.secondsRemaining = 0;
    sessionExpiredProps.visible = false;
    sessionExpiredProps.onAccept = undefined;
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('expone resetInactivityTimer cuando hay sesión', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'a@b.com',
        firstName: 'A',
        name: 'A',
        token: 't',
        sessionExpiresAt: Date.now() + 3_600_000,
        inactivityTimeoutSeconds: 300,
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    let latest: ReturnType<typeof useSessionTimeout> | undefined;
    function Harness() {
      latest = useSessionTimeout();
      return null;
    }

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <SessionTimeoutProvider>
          <Harness />
        </SessionTimeoutProvider>,
      );
    });

    expect(latest?.resetInactivityTimer).toEqual(expect.any(Function));
    await act(async () => {
      latest?.resetInactivityTimer();
    });
    act(() => tree.unmount());
  });

  it('con sesión ya expirada activa el modal de sesión expirada', async () => {
    jest.useFakeTimers();
    sessionExpiredProps.visible = false;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'a@b.com',
        firstName: 'A',
        name: 'A',
        token: 't',
        sessionExpiresAt: Date.now() - 5_000,
        inactivityTimeoutSeconds: 300,
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <SessionTimeoutProvider>
          <React.Fragment />
        </SessionTimeoutProvider>,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(1100);
    });

    expect(sessionExpiredProps.visible).toBe(true);
    act(() => tree.unmount());
    jest.useRealTimers();
  });

  it('muestra advertencia antes del umbral de inactividad', async () => {
    jest.useFakeTimers({now: 1_700_000_000_000});
    const base = Date.now();
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'a@b.com',
        firstName: 'A',
        name: 'A',
        token: 't',
        sessionExpiresAt: base + 3_600_000,
        inactivityTimeoutSeconds: 120,
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <SessionTimeoutProvider>
          <React.Fragment />
        </SessionTimeoutProvider>,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(61_000);
    });

    expect(warningProps.visible).toBe(true);
    expect(warningProps.secondsRemaining).toBeGreaterThan(0);
    act(() => tree.unmount());
    jest.useRealTimers();
  });

  it('onContinue en el modal de advertencia reinicia el temporizador', async () => {
    jest.useFakeTimers({now: 1_700_000_000_000});
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'a@b.com',
        firstName: 'A',
        name: 'A',
        token: 't',
        sessionExpiresAt: Date.now() + 3_600_000,
        inactivityTimeoutSeconds: 120,
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <SessionTimeoutProvider>
          <React.Fragment />
        </SessionTimeoutProvider>,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(61_000);
    });
    expect(warningProps.visible).toBe(true);

    await act(async () => {
      const inst = tree.root.findByType(SessionTimeoutWarningModal as never);
      inst.props.onContinue();
    });

    expect(warningProps.visible).toBe(false);
    act(() => tree.unmount());
    jest.useRealTimers();
  });

  it('al aceptar sesión expirada invoca logout', async () => {
    jest.useFakeTimers();
    const logout = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'a@b.com',
        firstName: 'A',
        name: 'A',
        token: 't',
        sessionExpiresAt: Date.now() - 1,
        inactivityTimeoutSeconds: 300,
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout,
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <SessionTimeoutProvider>
          <React.Fragment />
        </SessionTimeoutProvider>,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(1100);
    });
    expect(sessionExpiredProps.visible).toBe(true);

    await act(async () => {
      sessionExpiredProps.onAccept?.();
    });

    expect(sessionExpiredProps.visible).toBe(false);
    expect(logout).toHaveBeenCalled();
    act(() => tree.unmount());
    jest.useRealTimers();
  });

  it('al pasar a background limpia timers y al volver active reanuda', async () => {
    const remove = jest.fn();
    let listener: ((s: string) => void) | undefined;
    const addSpy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, cb) => {
        listener = cb;
        return {remove} as never;
      });

    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'a@b.com',
        firstName: 'A',
        name: 'A',
        token: 't',
        sessionExpiresAt: Date.now() + 3_600_000,
        inactivityTimeoutSeconds: 300,
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <SessionTimeoutProvider>
          <React.Fragment />
        </SessionTimeoutProvider>,
      );
    });

    await act(async () => {
      listener?.('background');
    });

    await act(async () => {
      listener?.('active');
    });

    expect(addSpy).toHaveBeenCalled();
    act(() => tree.unmount());
    addSpy.mockRestore();
  });
});
