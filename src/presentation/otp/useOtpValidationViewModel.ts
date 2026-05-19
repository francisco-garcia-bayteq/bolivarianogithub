import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDI} from '../../di';

export type OtpValidationFlow = 'login' | 'transfer';

export interface UseOtpValidationOptions {
  flow?: OtpValidationFlow;
}

const OTP_EXPIRATION_SECONDS_LOGIN = 120;
const MAX_RESENDS_LOGIN = 3;

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function useOtpValidationViewModel(
  onSuccess: () => Promise<void>,
  options: UseOtpValidationOptions = {},
) {
  const flow = options.flow ?? 'transfer';
  const isLoginFlow = flow === 'login';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    isLoginFlow ? OTP_EXPIRATION_SECONDS_LOGIN : 0,
  );
  const [resendCount, setResendCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const {validateOtpUseCase} = useDI();

  /** Un solo intervalo en flujo login; al reenviar solo se reinicia `secondsLeft`. */
  useEffect(() => {
    if (!isLoginFlow) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [isLoginFlow]);

  const onChangeCode = useCallback((nextCode: string) => {
    setCode(nextCode);
    if (error) {
      setError(null);
    }
  }, [error]);

  const canSubmit = code.length === 6 && !isLoading;

  const showResendControl =
    isLoginFlow && resendCount < MAX_RESENDS_LOGIN;

  const canResend =
    isLoginFlow &&
    secondsLeft === 0 &&
    resendCount < MAX_RESENDS_LOGIN &&
    !isLoading;

  const formattedCountdown = useMemo(() => {
    if (!isLoginFlow) {
      return '';
    }
    return formatMmSs(secondsLeft);
  }, [isLoginFlow, secondsLeft]);

  const handleValidate = useCallback(async () => {
    if (code.length !== 6) {
      setError('Ingresa los 6 digitos del codigo.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await validateOtpUseCase.execute(code);
      await onSuccess();
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [validateOtpUseCase, code, onSuccess]);

  const handleResend = useCallback(() => {
    if (!canResend) {
      return;
    }
    setError(null);
    setCode('');
    setResendCount(c => c + 1);
    setSecondsLeft(OTP_EXPIRATION_SECONDS_LOGIN);
  }, [canResend]);

  return {
    code,
    error,
    isLoading,
    canSubmit,
    canResend,
    showResendControl,
    formattedCountdown,
    onChangeCode,
    handleValidate,
    handleResend,
    flow,
  };
}
