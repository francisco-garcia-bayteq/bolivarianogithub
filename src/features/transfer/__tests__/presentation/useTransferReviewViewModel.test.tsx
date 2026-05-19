import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {useTransferReviewViewModel} from '../../presentation/TransferReview/useTransferReviewViewModel';
import {formatMoneyEc} from '../../../../utils/formatMoneyEc';

// ── Módulos nativos ──────────────────────────────────────────────────────────
jest.mock('react-native-encrypted-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-native-biometrics', () =>
  jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn(() => Promise.resolve({available: false})),
  })),
);

// ── Mocks de navegación ──────────────────────────────────────────────────────
const defaultRouteParams = {
  amountCents: 5000,
  displayAmount: '$50.00',
  beneficiary: {
    id: 'ben-001',
    name: 'Ana Pérez',
    kind: 'contact' as const,
    bankName: 'Banco Pichincha',
    accountHint: '****4321',
  },
  fromHolderName: 'Titular Demo',
  fromAccountLine: 'Ahorros ****1111',
  fromAccountTitle: 'Ahorros',
  fromAccountSubtitle: 'Cuenta de Ahorros ****1111',
  fromAccountSubtitleMasked: 'Ahorros ****1111',
  toAccountTitle: 'Ana Pérez',
  toAccountSubtitle: 'Cta. corriente ****4321',
  toAccountSubtitleMasked: 'Cta. corriente ****4321',
  fromBalanceDisplay: formatMoneyEc(1000),
  toBalanceDisplay: formatMoneyEc(500),
  accountId: 'acc-savings-001',
  concept: 'Pago servicios',
};

let mockRouteParams = {...defaultRouteParams};

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({params: mockRouteParams}),
  useNavigation: () => ({navigate: jest.fn()}),
}));

// ── DI ───────────────────────────────────────────────────────────────────────
const mockValidateTransactionAmount = {execute: jest.fn()};
const mockExecuteTransfer = {execute: jest.fn()};

jest.mock('../../../../di', () => ({
  useDI: () => ({
    validateTransactionAmountUseCase: mockValidateTransactionAmount,
    executeTransferUseCase: mockExecuteTransfer,
  }),
}));

// ── Providers ────────────────────────────────────────────────────────────────
let mockUserEmail: string | undefined = 'usuario@banco.com';

jest.mock('../../../../providers', () => ({
  useAuth: () => ({
    user: mockUserEmail ? {name: 'Titular Demo', email: mockUserEmail} : null,
    logout: jest.fn(),
  }),
  useTheme: () => ({colors: {}}),
}));

// ── Harness ──────────────────────────────────────────────────────────────────
let latest: ReturnType<typeof useTransferReviewViewModel> | undefined;
let navigateOtpMock: jest.Mock;

function Harness({onTransferSuccess}: {onTransferSuccess?: jest.Mock}) {
  navigateOtpMock = navigateOtpMock ?? jest.fn();
  latest = useTransferReviewViewModel(navigateOtpMock, {onTransferSuccess});
  return null;
}

async function mount(onTransferSuccess?: jest.Mock) {
  navigateOtpMock = jest.fn();
  await act(async () => {
    ReactTestRenderer.create(<Harness onTransferSuccess={onTransferSuccess} />);
  });
}

// ────────────────────────────────────────────────────────────────────────────
describe('useTransferReviewViewModel', () => {
  beforeEach(() => {
    latest = undefined;
    jest.clearAllMocks();
    mockRouteParams = {...defaultRouteParams};
    mockUserEmail = 'usuario@banco.com';
  });

  // ── Estado inicial ───────────────────────────────────────────────────────
  test('expone los parámetros de ruta correctamente', async () => {
    await mount();
    expect(latest?.amountCents).toBe(5000);
    expect(latest?.displayAmount).toBe('$50.00');
    expect(latest?.beneficiary.name).toBe('Ana Pérez');
    expect(latest?.fromHolderName).toBe('Titular Demo');
    expect(latest?.fromAccountLine).toBe('Ahorros ****1111');
    expect(latest?.toAccountTitle).toBe('Ana Pérez');
    expect(latest?.toAccountSubtitle).toBe('Cta. corriente ****4321');
    expect(latest?.accountId).toBe('acc-savings-001');
    expect(latest?.concept).toBe('Pago servicios');
  });

  test('comisión se establece en "Sin cargo" después del montaje', async () => {
    await mount();
    expect(latest?.commission).toBe('Sin cargo');
    expect(latest?.commissionLoading).toBe(false);
  });

  test('confirmLoading y confirmError son false/null inicialmente', async () => {
    await mount();
    expect(latest?.confirmLoading).toBe(false);
    expect(latest?.confirmError).toBeNull();
  });

  // ── paraSubline ──────────────────────────────────────────────────────────
  test('paraSubline usa accountHint cuando está disponible', async () => {
    await mount();
    expect(latest?.paraSubline).toBe('****4321');
  });

  test('paraSubline usa bankName cuando no hay accountHint', async () => {
    mockRouteParams = {
      ...defaultRouteParams,
      beneficiary: {
        id: 'ben-001',
        name: 'Ana',
        kind: 'contact',
        bankName: 'Banco XYZ',
        accountHint: '',
      },
    };
    await mount();
    expect(latest?.paraSubline).toBe('Banco XYZ');
  });

  test('paraSubline es undefined cuando no hay accountHint ni bankName', async () => {
    mockRouteParams = {
      ...defaultRouteParams,
      beneficiary: {
        id: 'ben-001',
        name: 'Ana',
        kind: 'contact',
      },
    };
    await mount();
    expect(latest?.paraSubline).toBeUndefined();
  });

  // ── conceptDisplay ───────────────────────────────────────────────────────
  test('conceptDisplay muestra el concepto cuando existe', async () => {
    await mount();
    expect(latest?.conceptDisplay).toBe('Pago servicios');
  });

  test('conceptDisplay muestra "—" cuando el concepto está vacío', async () => {
    mockRouteParams = {...defaultRouteParams, concept: '  '};
    await mount();
    expect(latest?.conceptDisplay).toBe('—');
  });

  // ── commissionDisplay (literal del VM en features cuando no es Con cargo) ──
  test('commissionDisplay muestra placeholder monetario cuando es Sin cargo', async () => {
    await mount();
    expect(latest?.commissionDisplay).toBe('$0.00');
  });

  // ── onConfirm — cuenta propia (el VM de features no bloquea own_account) ───
  test('onConfirm con beneficiario cuenta propia llama a validate y navigateOtp cuando isValid es true', async () => {
    mockRouteParams = {
      ...defaultRouteParams,
      beneficiary: {
        id: 'own-001',
        name: 'Mi cuenta',
        kind: 'own_account',
        bankName: 'Banco',
        accountHint: '****4321',
      },
    };
    mockValidateTransactionAmount.execute.mockResolvedValue({isValid: true});
    await mount();
    await act(async () => {
      await latest?.onConfirm();
    });
    expect(mockValidateTransactionAmount.execute).toHaveBeenCalledWith({
      amount: 50,
      beneficiaryGuid: 'own-001',
      accountGuid: 'acc-savings-001',
      concept: 'Pago servicios',
    });
    expect(navigateOtpMock).toHaveBeenCalled();
  });

  // ── onConfirm — sin email ────────────────────────────────────────────────
  test('onConfirm muestra error cuando no hay email en sesión', async () => {
    mockUserEmail = '';
    await mount();
    await act(async () => {
      await latest?.onConfirm();
    });
    expect(latest?.confirmError).toContain('correo');
    expect(mockValidateTransactionAmount.execute).not.toHaveBeenCalled();
  });

  // ── onConfirm — validación exitosa → OTP ────────────────────────────────
  test('onConfirm llama a navigateOtp cuando isValid es true', async () => {
    mockValidateTransactionAmount.execute.mockResolvedValue({isValid: true});
    await mount();
    await act(async () => {
      await latest?.onConfirm();
    });
    expect(mockValidateTransactionAmount.execute).toHaveBeenCalledWith({
      amount: 50,
      beneficiaryGuid: 'ben-001',
      accountGuid: 'acc-savings-001',
      concept: 'Pago servicios',
    });
    expect(navigateOtpMock).toHaveBeenCalled();
    expect(latest?.confirmLoading).toBe(false);
    expect(latest?.confirmError).toBeNull();
  });

  // ── onConfirm — sin validación OTP → transferencia directa ──────────────
  test('onConfirm ejecuta transferencia cuando isValid es false', async () => {
    mockValidateTransactionAmount.execute.mockResolvedValue({isValid: false});
    mockExecuteTransfer.execute.mockResolvedValue({
      transactionIdentifier: 'TXN-999',
    });
    const onTransferSuccess = jest.fn();
    await mount(onTransferSuccess);
    await act(async () => {
      await latest?.onConfirm();
    });
    expect(mockExecuteTransfer.execute).toHaveBeenCalled();
    expect(onTransferSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionIdentifier: 'TXN-999',
        amountCents: '5000',
        fromAccountTitle: 'Ahorros',
        fromAccountSubtitle: 'Ahorros ****1111',
        toAccountTitle: 'Ana Pérez',
        toAccountSubtitle: 'Cta. corriente ****4321',
      }),
    );
    expect(navigateOtpMock).not.toHaveBeenCalled();
  });

  // ── onConfirm — error en validación ─────────────────────────────────────
  test('onConfirm muestra error cuando validateTransactionAmount lanza excepción', async () => {
    mockValidateTransactionAmount.execute.mockRejectedValue(
      new Error('Saldo insuficiente'),
    );
    await mount();
    await act(async () => {
      await latest?.onConfirm();
    });
    expect(latest?.confirmError).toBe('Saldo insuficiente');
    expect(latest?.confirmLoading).toBe(false);
  });

  test('onConfirm muestra mensaje genérico cuando el error no es Error', async () => {
    mockValidateTransactionAmount.execute.mockRejectedValue('unknown error');
    await mount();
    await act(async () => {
      await latest?.onConfirm();
    });
    expect(latest?.confirmError).toBe('No se pudo validar el monto.');
  });

  // ── doTransacction ───────────────────────────────────────────────────────
  test('doTransacction llama executeTransfer y dispara onTransferSuccess', async () => {
    mockExecuteTransfer.execute.mockResolvedValue({
      transactionIdentifier: 'TXN-123',
    });
    const onTransferSuccess = jest.fn();
    await mount(onTransferSuccess);
    await act(async () => {
      await latest?.doTransacction();
    });
    expect(mockExecuteTransfer.execute).toHaveBeenCalledWith({
      amount: 50,
      beneficiaryContactGuid: 'ben-001',
      accountGuid: 'acc-savings-001',
      concept: 'Pago servicios',
    });
    expect(onTransferSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionIdentifier: 'TXN-123',
        displayAmount: '$50.00',
        fromAccountTitle: 'Ahorros',
        fromAccountSubtitle: 'Ahorros ****1111',
        toAccountTitle: 'Ana Pérez',
        toAccountSubtitle: 'Cta. corriente ****4321',
      }),
    );
  });

  test('doTransacction muestra confirmError cuando executeTransfer lanza excepción', async () => {
    mockExecuteTransfer.execute.mockRejectedValue(new Error('Servicio no disponible'));
    await mount();
    await act(async () => {
      await latest?.doTransacction();
    });
    expect(latest?.confirmError).toBe('Servicio no disponible');
    expect(latest?.confirmLoading).toBe(false);
  });

  test('doTransacction muestra mensaje genérico cuando el error no es Error', async () => {
    mockExecuteTransfer.execute.mockRejectedValue(null);
    await mount();
    await act(async () => {
      await latest?.doTransacction();
    });
    expect(latest?.confirmError).toBe('No se pudo validar el monto.');
  });

  // ── setConfirmError ──────────────────────────────────────────────────────
  test('setConfirmError permite limpiar el error manualmente', async () => {
    mockValidateTransactionAmount.execute.mockRejectedValue(new Error('Error'));
    await mount();
    await act(async () => {
      await latest?.onConfirm();
    });
    expect(latest?.confirmError).not.toBeNull();
    act(() => {
      latest?.setConfirmError(null);
    });
    expect(latest?.confirmError).toBeNull();
  });
});
