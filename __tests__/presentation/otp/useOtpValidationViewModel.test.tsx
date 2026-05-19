import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {useDI} from '../../../src/di';
import {useOtpValidationViewModel} from '../../../src/presentation/otp/useOtpValidationViewModel';

jest.mock('../../../src/di', () => ({
  useDI: jest.fn(),
}));

const mockedUseDI = useDI as jest.MockedFunction<typeof useDI>;

describe('useOtpValidationViewModel', () => {
  let latest: ReturnType<typeof useOtpValidationViewModel> | undefined;

  function Harness({
    onSuccess,
    flow = 'transfer',
  }: {
    onSuccess: () => Promise<void>;
    flow?: 'login' | 'transfer';
  }) {
    latest = useOtpValidationViewModel(onSuccess, {flow});
    return null;
  }

  beforeEach(() => {
    latest = undefined;
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('shows an error when the code is incomplete', async () => {
    const validateOtpUseCase = {execute: jest.fn()};
    mockedUseDI.mockReturnValue({validateOtpUseCase} as never);
    const onSuccess = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      ReactTestRenderer.create(<Harness onSuccess={onSuccess} />);
    });

    await act(async () => {
      await latest?.handleValidate();
    });

    expect(latest?.error).toBe('Ingresa los 6 digitos del codigo.');
    expect(validateOtpUseCase.execute).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('calls validateOtp use case and onSuccess with a valid code', async () => {
    const validateOtpUseCase = {
      execute: jest.fn().mockResolvedValue({message: 'OK'}),
    };
    mockedUseDI.mockReturnValue({validateOtpUseCase} as never);
    const onSuccess = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      ReactTestRenderer.create(<Harness onSuccess={onSuccess} />);
    });

    act(() => {
      latest?.onChangeCode('123456');
    });

    await act(async () => {
      await latest?.handleValidate();
    });

    expect(validateOtpUseCase.execute).toHaveBeenCalledWith('123456');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(latest?.error).toBeNull();
    expect(latest?.isLoading).toBe(false);
  });

  test('surfaces validation errors from the use case', async () => {
    const validateOtpUseCase = {
      execute: jest.fn().mockRejectedValue(new Error('OTP inválido')),
    };
    mockedUseDI.mockReturnValue({validateOtpUseCase} as never);

    await act(async () => {
      ReactTestRenderer.create(<Harness onSuccess={jest.fn()} />);
    });

    act(() => {
      latest?.onChangeCode('000000');
    });

    await act(async () => {
      await latest?.handleValidate();
    });

    expect(latest?.error).toBe('OTP inválido');
  });

  test('transfer flow does not enable resend or countdown', async () => {
    const validateOtpUseCase = {execute: jest.fn()};
    mockedUseDI.mockReturnValue({validateOtpUseCase} as never);

    await act(async () => {
      ReactTestRenderer.create(<Harness onSuccess={jest.fn()} flow="transfer" />);
    });

    expect(latest?.showResendControl).toBe(false);
    expect(latest?.canResend).toBe(false);
    expect(latest?.formattedCountdown).toBe('');

    act(() => {
      jest.advanceTimersByTime(120_000);
    });

    expect(latest?.canResend).toBe(false);
  });

  test('login flow enables resend after two minutes', async () => {
    const validateOtpUseCase = {execute: jest.fn()};
    mockedUseDI.mockReturnValue({validateOtpUseCase} as never);

    await act(async () => {
      ReactTestRenderer.create(<Harness onSuccess={jest.fn()} flow="login" />);
    });

    expect(latest?.canResend).toBe(false);
    expect(latest?.showResendControl).toBe(true);
    expect(latest?.formattedCountdown).toBe('02:00');

    act(() => {
      jest.advanceTimersByTime(120_000);
    });

    expect(latest?.canResend).toBe(true);
    expect(latest?.formattedCountdown).toBe('00:00');
  });

  test('login resend restarts the two-minute window', async () => {
    const validateOtpUseCase = {execute: jest.fn()};
    mockedUseDI.mockReturnValue({validateOtpUseCase} as never);

    await act(async () => {
      ReactTestRenderer.create(<Harness onSuccess={jest.fn()} flow="login" />);
    });

    act(() => {
      jest.advanceTimersByTime(120_000);
    });

    await act(async () => {
      latest?.handleResend();
    });

    expect(latest?.formattedCountdown).toBe('02:00');
    expect(latest?.code).toBe('');
    expect(latest?.canResend).toBe(false);
  });

  test('login hides resend control after three resends', async () => {
    const validateOtpUseCase = {execute: jest.fn()};
    mockedUseDI.mockReturnValue({validateOtpUseCase} as never);

    await act(async () => {
      ReactTestRenderer.create(<Harness onSuccess={jest.fn()} flow="login" />);
    });

    for (let i = 0; i < 3; i += 1) {
      act(() => {
        jest.advanceTimersByTime(120_000);
      });
      await act(async () => {
        latest?.handleResend();
      });
    }

    expect(latest?.showResendControl).toBe(false);
    expect(latest?.canResend).toBe(false);
  });
});
