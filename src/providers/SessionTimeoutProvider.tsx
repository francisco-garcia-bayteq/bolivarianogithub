import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {AppState, StyleSheet, View} from 'react-native';
import {useAuth} from './AuthProvider';
import {SessionTimeoutWarningModal} from '../presentation/components/SessionTimeoutWarningModal';
import {SessionExpiredModal} from '../presentation/components/SessionExpiredModal';

/** Segundos antes del cierre por inactividad en que se muestra la advertencia. */
const WARNING_LEAD_SECONDS = 60;

/** Mínimo efectivo de inactividad aceptado del servidor (previene logout instantáneo en staging). */
const MIN_INACTIVITY_SECONDS = 30;

interface SessionTimeoutContextValue {
  /** Reinicia el contador de inactividad. Llámalo en acciones significativas del usuario. */
  resetInactivityTimer: () => void;
}

const SessionTimeoutContext = createContext<
  SessionTimeoutContextValue | undefined
>(undefined);

export function SessionTimeoutProvider({
  children,
}: Readonly<{children: React.ReactNode}>) {
  const {user, isAuthenticated, logout} = useAuth();

  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Refs: no disparan re-render, seguros en closures de setInterval
  const lastActivityAt = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundedAt = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    lastActivityAt.current = Date.now();
    setShowWarning(false);
  }, []);

  const checkExpiry = useCallback(
    (now: number) => {
      if (!user) {
        return;
      }

      // 1. Expiración absoluta de la sesión
      if (now >= user.sessionExpiresAt) {
        clearTimers();
        setShowWarning(false);
        setShowExpired(true);
        return;
      }

      const effectiveInactivityMs =
        Math.max(user.inactivityTimeoutSeconds, MIN_INACTIVITY_SECONDS) * 1000;
      const inactivityDeadline =
        lastActivityAt.current + effectiveInactivityMs;
      const warningDeadline = inactivityDeadline - WARNING_LEAD_SECONDS * 1000;

      // 2. Expiración por inactividad
      if (now >= inactivityDeadline) {
        clearTimers();
        setShowWarning(false);
        setShowExpired(true);
        return;
      }

      // 3. Ventana de advertencia
      if (now >= warningDeadline) {
        const remaining = Math.ceil((inactivityDeadline - now) / 1000);
        setSecondsRemaining(remaining);
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    },
    [user, clearTimers],
  );

  const startTimers = useCallback(() => {
    clearTimers();
    lastActivityAt.current = Date.now();
    intervalRef.current = setInterval(() => {
      checkExpiry(Date.now());
    }, 1000);
  }, [clearTimers, checkExpiry]);

  // Arrancar/detener timers según estado de autenticación
  useEffect(() => {
    if (isAuthenticated && user) {
      startTimers();
    } else {
      clearTimers();
      setShowWarning(false);
    }
    return () => clearTimers();
  }, [isAuthenticated, user, startTimers, clearTimers]);

  // Gestión de foreground/background con wall-clock
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAt.current = Date.now();
        clearTimers();
      } else if (nextState === 'active') {
        backgroundedAt.current = null;
        if (isAuthenticated && user) {
          // Verificación inmediata usando el tiempo real transcurrido
          checkExpiry(Date.now());
          // Si no expiró, arrancar de nuevo el intervalo
          if (intervalRef.current === null) {
            startTimers();
          }
        }
      }
    });
    return () => subscription.remove();
  }, [isAuthenticated, user, clearTimers, checkExpiry, startTimers]);

  const handleExpiredAccept = useCallback(() => {
    setShowExpired(false);
    void logout();
  }, [logout]);

  const contextValue = useMemo(
    () => ({resetInactivityTimer}),
    [resetInactivityTimer],
  );

  return (
    <SessionTimeoutContext.Provider value={contextValue}>
      <View
        style={styles.fill}
        onStartShouldSetResponderCapture={() => {
          // Capture phase: dispara en tdo touch antes de que llegue a los hijos.
          // Retornar false es obligatorio para no bloquear eventos a los hijos.
          if (isAuthenticated) {
            resetInactivityTimer();
          }
          return false;
        }}>
        {children}
      </View>
      {isAuthenticated && (
        <SessionTimeoutWarningModal
          visible={showWarning}
          secondsRemaining={secondsRemaining}
          onContinue={resetInactivityTimer}
        />
      )}
      <SessionExpiredModal
        visible={showExpired}
        onAccept={handleExpiredAccept}
      />
    </SessionTimeoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
});

export function useSessionTimeout(): SessionTimeoutContextValue {
  const ctx = useContext(SessionTimeoutContext);
  if (!ctx) {
    throw new Error(
      'useSessionTimeout must be used within SessionTimeoutProvider',
    );
  }
  return ctx;
}
