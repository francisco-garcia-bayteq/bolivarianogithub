import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {AppState} from 'react-native';
import {User} from '../domain/entities/User';
import {SecureStorageKeys} from '../data/datasources/storage/SecureStorageKeys';
import {useDI} from '../di';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LogoutOptions {
  /**
   * Si es true, la próxima vez que monte el login compacto no se dispara el
   * prompt biométrico automático (p. ej. tras cerrar sesión desde el home).
   */
  suppressCompactLoginAutoBiometricOnce?: boolean;
}

interface AuthContextValue extends AuthState {
  login: (user: User) => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
  /**
   * Se incrementa en cada cierre de sesión con `suppressCompactLoginAutoBiometricOnce`.
   * Login compacto compara con un ref local para activar la supresión una vez por evento,
   * incluso si React remonta la pantalla (Strict Mode / navegación).
   */
  suppressCompactAutoBiometricGeneration: number;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function resolveDeviceBoundGreetingName(user: User): string {
  const fromFirst = user.firstName?.trim();
  if (fromFirst) {
    return fromFirst;
  }
  const fromName = user.name.trim();
  if (fromName) {
    return fromName;
  }
  const email = user.email.trim();
  const at = email.indexOf('@');
  if (at > 0) {
    return email.slice(0, at);
  }
  return email;
}

export function AuthProvider({
  children,
}: Readonly<{children: React.ReactNode}>) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [suppressCompactAutoBiometricGeneration, setSuppressCompactAutoBiometricGeneration] =
    useState(0);

  const {secureStorageService: secureStorage} = useDI();

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      // Solo background: en `inactive` aparece la UI de Face ID y no debe borrarse aquí.
      if (nextState === 'background') {
        void secureStorage.remove(SecureStorageKeys.USER_LOGIN_DATA);
      }
    });
    return () => subscription.remove();
  }, [secureStorage]);

  async function restoreSession() {
    // Banca: no restaurar sesión tras reinicio en frío — siempre pantalla de login.
    // Si falla el remove de una clave puntual (intermitente en iOS), no debemos borrar
    // tdo el almacén porque perderíamos datos persistentes del login compacto/biometría.
    await Promise.allSettled([
      secureStorage.remove(SecureStorageKeys.USER_SESSION),
      secureStorage.remove(SecureStorageKeys.AUTH_TOKEN),
    ]);
    setState({user: null, isAuthenticated: false, isLoading: false});
  }

  const login = useCallback(
    async (user: User) => {
      await secureStorage.save(
        SecureStorageKeys.USER_SESSION,
        JSON.stringify(user),
      );
      await secureStorage.save(SecureStorageKeys.AUTH_TOKEN, user.token);
      const existingBound = await secureStorage.get(
        SecureStorageKeys.DEVICE_BOUND_LOGIN_ID,
      );
      if (!existingBound?.trim()) {
        const loginId = user.email.trim();
        await secureStorage.save(
          SecureStorageKeys.DEVICE_BOUND_LOGIN_ID,
          loginId,
        );
        const greetingName = resolveDeviceBoundGreetingName(user);
        await secureStorage.save(
          SecureStorageKeys.DEVICE_BOUND_GREETING_NAME,
          greetingName,
        );
        await secureStorage.save(
          SecureStorageKeys.DEVICE_BOUND_GREETING_FIRST_NAME,
          user.firstName.trim(),
        );
      }
      setState({user, isAuthenticated: true, isLoading: false});
    },
    [secureStorage],
  );

  const logout = useCallback(
    async (options?: LogoutOptions) => {
      if (options?.suppressCompactLoginAutoBiometricOnce) {
        setSuppressCompactAutoBiometricGeneration(g => g + 1);
      } else {
        setSuppressCompactAutoBiometricGeneration(0);
      }
      await secureStorage.remove(SecureStorageKeys.USER_SESSION);
      await secureStorage.remove(SecureStorageKeys.AUTH_TOKEN);
      setState({user: null, isAuthenticated: false, isLoading: false});
    },
    [secureStorage],
  );

  const value: AuthContextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
      suppressCompactAutoBiometricGeneration,
    }),
    [state, login, logout, suppressCompactAutoBiometricGeneration],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
