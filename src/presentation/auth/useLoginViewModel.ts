import {useState, useCallback, useEffect, useMemo} from 'react';
import DeviceInfo from 'react-native-device-info';
import {User} from '../../domain/entities/User';
import {useDI} from '../../di';
import {BiometricAuthError} from '../../domain/services/BiometricAuthService';
import {BiometricRSAError} from '../../security/biometric';

import {
  hasDisallowedLoginPasswordCharacters,
  LOGIN_PASSWORD_MAX_LENGTH,
  LOGIN_USERNAME_MAX_LENGTH,
  loginValidationMessages,  
  sanitizeLoginUsernameInput,
  validateLoginPassword,
  validateLoginUsername,
} from '../../domain/validation';

export const BIOMETRIC_ENROLLMENT_CHANGED_MESSAGE =
  'Detectamos un cambio en los registros biométricos de tu dispositivo. Por seguridad, inicia sesión con tu usuario y contraseña. Luego podrás volver a activar el acceso con huella o Face ID.';

export interface UseLoginViewModelOptions {
  /** Usuario ya vinculado al dispositivo: email fijo, sin edición del campo usuario. */
  deviceBoundLoginId?: string;
}

interface LoginState {
  email: string;
  password: string;
  emailError: string | null;
  passwordError: string | null;
  isLoadingLogin: boolean;
  isLoadingBiometric: boolean;
  error: string | null;
  biometricEnrollmentRevoked: boolean;
}

function mapBiometricRSAError(err: BiometricRSAError): string | null {
  if (err.code === 'user_cancelled') {
    return null;
  }
  if (err.code === 'biometric_enrollment_changed') {
    return BIOMETRIC_ENROLLMENT_CHANGED_MESSAGE;
  }
  if (err.code === 'not_available') {
    return 'La autenticación biométrica no está disponible en este dispositivo.';
  }
  const isCryptoRelated =
    err.code === 'prompt_failed' ||
    err.code === 'keychain_error' ||
    err.code === 'crypto_error';
  if (isCryptoRelated) {
    return err.message || 'No se pudo completar la operación biométrica.';
  }
  if (err.code === 'no_private_key' || err.code === 'no_stored_username') {
    return err.message;
  }
  if (err.code === 'network_error') {
    return (
      err.message ||
      'Error de conexión. Verifica tu red e inténtalo de nuevo.'
    );
  }
  return err.message || 'No se pudo completar la autenticación biométrica.';
}

function mapBiometricAuthErrorToMessage(err: BiometricAuthError): string | null {
  if (err.code === 'user_cancelled') {
    return null;
  }
  if (err.code === 'not_available') {
    return 'La autenticación biométrica no está disponible en este dispositivo.';
  }
  if (err.code === 'prompt_failed') {
    return 'No se pudo verificar tu identidad. Inténtalo de nuevo.';
  }
  return err.message || 'No se pudo completar la autenticación biométrica.';
}

export function mapBiometricError(err: unknown): string | null {
  if (err instanceof BiometricRSAError) {
    return mapBiometricRSAError(err);
  }
  if (err instanceof BiometricAuthError) {
    return mapBiometricAuthErrorToMessage(err);
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Ocurrió un error inesperado';
}

function getLiveUsernameError(username: string): string | null {
  return username ? validateLoginUsername(username) : null;
}

function getLivePasswordError(password: string): string | null {
  return password ? validateLoginPassword(password) : null;
}

export function useLoginViewModel(
  onCredentialLoginSuccess: (user: User) => void,
  onBiometricLoginSuccess: (user: User) => void,
  options?: UseLoginViewModelOptions,
) {
  const deviceBoundLoginId = options?.deviceBoundLoginId?.trim() ?? '';
  const isDeviceBoundCompact = deviceBoundLoginId.length > 0;

  const appVersion = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const version = `Versión: ${appVersion} (${buildNumber})`;

  const [showDevelopMode, setShowDevelopMode] = useState(false);

  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    emailError: null,
    passwordError: null,
    isLoadingLogin: false,
    isLoadingBiometric: false,
    error: null,
    biometricEnrollmentRevoked: false,
  });

  const {loginUseCase, biometricRSAAuthOrchestrator} = useDI();

  useEffect(() => {
    if (!deviceBoundLoginId) {
      return;
    }
    setState(prev => ({
      ...prev,
      email: deviceBoundLoginId,
      emailError: null,
    }));
  }, [deviceBoundLoginId]);

  const setEmail = useCallback(
    (email: string) => {
      if (isDeviceBoundCompact) {
        return;
      }
      const sanitizedEmail = sanitizeLoginUsernameInput(email);

      if (sanitizedEmail.length > LOGIN_USERNAME_MAX_LENGTH) {
        setState(prev => ({
          ...prev,
          email: sanitizedEmail.slice(0, LOGIN_USERNAME_MAX_LENGTH),
          emailError: loginValidationMessages.usernameTooLong,
          error: null,
        }));
        return;
      }

      const emailError = hasDisallowedLoginPasswordCharacters(email)
        ? loginValidationMessages.usernameInvalidCharacters
        : getLiveUsernameError(sanitizedEmail);

      setState(prev => ({
        ...prev,
        email: sanitizedEmail,
        emailError,
        error: null,
      }));
    },
    [isDeviceBoundCompact],
  );

  const setPassword = useCallback((password: string) => {
    const sanitizedPassword = sanitizeLoginUsernameInput(password);

    if (sanitizedPassword.length > LOGIN_PASSWORD_MAX_LENGTH) {
      setState(prev => ({
        ...prev,
        password: sanitizedPassword.slice(0, LOGIN_PASSWORD_MAX_LENGTH),
        passwordError: loginValidationMessages.passwordTooLong,
        error: null,
      }));
      return;
    }

    const passwordError = hasDisallowedLoginPasswordCharacters(password)
      ? loginValidationMessages.passwordInvalidCharacters
      : getLivePasswordError(sanitizedPassword);

    setState(prev => ({
      ...prev,
      password: sanitizedPassword,
      passwordError,
      error: null,
    }));
  }, []);

  const handleLogin = useCallback(async () => {
    const trimmedEmail = state.email.trim();
    const trimmedPassword = state.password.trim();
    const emailError = validateLoginUsername(trimmedEmail);
    const passwordError = validateLoginPassword(trimmedPassword);

    if (emailError || passwordError) {
      setState(prev => ({
        ...prev,
        email: trimmedEmail,
        password: trimmedPassword,
        emailError,
        passwordError,
        error: null,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      email: trimmedEmail,
      password: trimmedPassword,
      emailError: null,
      passwordError: null,
      isLoadingLogin: true,
      error: null,
    }));

    try {
      const user = await loginUseCase.execute(trimmedEmail, trimmedPassword);
      setState(prev => ({
        ...prev,
        isLoadingLogin: false,
        emailError: null,
        passwordError: null,
      }));
      onCredentialLoginSuccess(user);
    } catch (err) {
      const message = mapBiometricError(err);
      setState(prev => ({
        ...prev,
        isLoadingLogin: false,
        ...(message ? {error: message} : {}),
      }));
    }
  }, [
    loginUseCase,
    state.email,
    state.password,
    onCredentialLoginSuccess,
  ]);

  const handleBiometricLogin = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isLoadingBiometric: true,
      error: null,
      biometricEnrollmentRevoked: false,
    }));

    try {
      const user = await biometricRSAAuthOrchestrator.loginWithBiometric();
      setState(prev => ({
        ...prev,
        isLoadingBiometric: false,
        biometricEnrollmentRevoked: false,
      }));
      onBiometricLoginSuccess(user);
    } catch (err) {
      const revoked =
        err instanceof BiometricRSAError &&
        err.code === 'biometric_enrollment_changed';
      const message = mapBiometricError(err);
      setState(prev => {
        const updates: Partial<LoginState> = {
          isLoadingBiometric: false,
          biometricEnrollmentRevoked: revoked,
        };
        if (revoked) {
          updates.error = null;
        } else if (message) {
          updates.error = message;
        }
        return {...prev, ...updates};
      });
    }
  }, [biometricRSAAuthOrchestrator, onBiometricLoginSuccess]);

  const acknowledgeBiometricEnrollmentRevoked = useCallback(() => {
    setState(prev => ({...prev, biometricEnrollmentRevoked: false}));
  }, []);

  const resetForDifferentUser = useCallback(() => {
    setState(prev => ({
      ...prev,
      email: '',
      password: '',
      emailError: null,
      passwordError: null,
      error: null,
    }));
  }, []);

  const isBusy = state.isLoadingLogin || state.isLoadingBiometric;

  const isCredentialLoginEnabled = useMemo(() => {
    const trimmedEmail = state.email.trim();
    const trimmedPassword = state.password.trim();

    if (state.passwordError !== null) {
      return false;
    }
    if (validateLoginPassword(trimmedPassword) !== null) {
      return false;
    }

    if (isDeviceBoundCompact) {
      return true;
    }

    if (state.emailError !== null) {
      return false;
    }
    return validateLoginUsername(trimmedEmail) === null;
  }, [
    state.email,
    state.password,
    state.emailError,
    state.passwordError,
    isDeviceBoundCompact,
  ]);

  return {
    email: state.email,
    password: state.password,
    emailError: state.emailError,
    passwordError: state.passwordError,
    isLoadingLogin: state.isLoadingLogin,
    isLoadingBiometric: state.isLoadingBiometric,
    isBusy,
    error: state.error,
    biometricEnrollmentRevoked: state.biometricEnrollmentRevoked,
    acknowledgeBiometricEnrollmentRevoked,
    isDeviceBoundCompact,
    resetForDifferentUser,
    isCredentialLoginEnabled,
    showDevelopMode,
    setShowDevelopMode,
    version,
    setEmail,
    setPassword,
    handleLogin,
    handleBiometricLogin,
  };
}
