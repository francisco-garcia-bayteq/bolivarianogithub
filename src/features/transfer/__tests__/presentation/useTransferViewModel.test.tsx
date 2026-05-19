import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Platform} from 'react-native';
import type {AccountBalance} from '../../../../domain/entities/ContractBalance';
import type {BeneficiaryContact} from '../../../../domain/entities/BeneficiaryContact';
import {useTransferViewModel} from '../../presentation/useTransferViewModel';
import {formatMoneyUsdDisplay} from '../../../../utils/formatMoneyUsdDisplay';

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

jest.mock('../../../../providers', () => ({
  useAuth: () => ({user: {name: 'Titular Demo', email: 'titular@demo.com'}, logout: jest.fn()}),
  useTheme: () => ({colors: {}}),
}));

const mockHomeData: {
  data: {accounts: AccountBalance[]} | null;
  isLoading: boolean;
  error: string;
  retry: jest.Mock;
} = {
  data: null,
  isLoading: false,
  error: '',
  retry: jest.fn(),
};

jest.mock('../../../../presentation/home/useHomeViewModel', () => ({
  useHomeViewModel: () => mockHomeData,
}));

let latest: ReturnType<typeof useTransferViewModel> | undefined;

function Harness() {
  latest = useTransferViewModel();
  return null;
}

async function mount() {
  await act(async () => {
    ReactTestRenderer.create(<Harness />);
  });
}

function mockBen(id: string, name: string): BeneficiaryContact {
  return {
    beneficiaryGuid: id,
    contactName: name,
    bankName: 'Banco Test',
    accountType: 'savings',
    accountTypeLabel: 'Ahorros',
    beneficiaryAccountNumber: '1234567890',
    lastFourDigits: '4321',
  };
}

const savingsAccount: AccountBalance = {
  accountGuid: 'acc-savings',
  maskedAccountNumber: '****1111',
  accountKind: 'savings',
  accountTypeLabel: 'Ahorros',
  balance: 1000,
  beneficiary: mockBen('ben-savings', 'Cuenta propia A'),
};

const checkingAccount: AccountBalance = {
  accountGuid: 'acc-checking',
  maskedAccountNumber: '****2222',
  accountKind: 'checking',
  accountTypeLabel: 'Corriente',
  balance: 500,
  beneficiary: mockBen('ben-checking', 'Cuenta propia B'),
};

describe('useTransferViewModel', () => {
  beforeEach(() => {
    latest = undefined;
    jest.clearAllMocks();
    mockHomeData.data = null;
    mockHomeData.isLoading = false;
    mockHomeData.error = '';
  });

  test('estado inicial: amountCents null, amountInputText vacío, concepto vacío, modales cerrados', async () => {
    await mount();
    expect(latest?.amountCents).toBeNull();
    expect(latest?.amountInputText).toBe('');
    expect(latest?.concept).toBe('');
    expect(latest?.validationMessage).toBeNull();
    expect(latest?.fromAccountModalVisible).toBe(false);
    expect(latest?.toAccountModalVisible).toBe(false);
    expect(latest?.accountBeneficiaryModalVisible).toBe(false);
  });

  test('expone isLoading y error del homeViewModel', async () => {
    mockHomeData.isLoading = true;
    mockHomeData.error = 'Sin conexión';
    await mount();
    expect(latest?.isLoading).toBe(true);
    expect(latest?.error).toBe('Sin conexión');
  });

  test('onAmountChange interpreta dígitos sin punto como dólares enteros', async () => {
    await mount();
    act(() => {
      latest?.onAmountChange('500');
    });
    expect(latest?.amountInputText).toBe('500');
    expect(latest?.amountCents).toBe(50000);
  });

  test('onAmountChange con texto vacío resetea amountCents a null', async () => {
    await mount();
    act(() => {
      latest?.onAmountChange('1');
    });
    act(() => {
      latest?.onAmountChange('');
    });
    expect(latest?.amountCents).toBeNull();
    expect(latest?.amountInputText).toBe('');
  });

  test('onAmountChange filtra caracteres no numéricos', async () => {
    await mount();
    act(() => {
      latest?.onAmountChange('$1,234.56');
    });
    expect(latest?.amountCents).toBe(123456);
  });

  describe('onAmountChange coma decimal (iOS)', () => {
    let prevOs: typeof Platform.OS;

    beforeEach(() => {
      prevOs = Platform.OS;
    });

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', {value: prevOs, configurable: true});
    });

    test('iOS convierte coma en separador decimal', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
      await mount();
      act(() => {
        latest?.onAmountChange('12,34');
      });
      expect(latest?.amountInputText).toBe('12.34');
      expect(latest?.amountCents).toBe(1234);
    });

    test('Android elimina coma sin convertir a punto', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
      await mount();
      act(() => {
        latest?.onAmountChange('12,34');
      });
      expect(latest?.amountInputText).toBe('1234');
      expect(latest?.amountCents).toBe(123400);
    });

    test('iOS mantiene $1,234.56 como miles y decimales', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
      await mount();
      act(() => {
        latest?.onAmountChange('$1,234.56');
      });
      expect(latest?.amountCents).toBe(123456);
    });
  });

  test('onAmountChange limita al máximo permitido', async () => {
    await mount();
    act(() => {
      latest?.onAmountChange('9999999999999');
    });
    expect(latest?.amountCents).toBe(500_000);
  });

  test('onAmountChange limpia validationMessage al cambiar', async () => {
    await mount();
    act(() => {
      latest?.setValidationMessage('Monto requerido');
    });
    act(() => {
      latest?.onAmountChange('2');
    });
    expect(latest?.validationMessage).toBeNull();
  });

  test('onConceptChange sanitiza la entrada', async () => {
    await mount();
    act(() => {
      latest?.onConceptChange('Pago de servicios');
    });
    expect(latest?.concept).toBe('Pago de servicios');
  });

  test('inicializa el índice de origen en la cuenta de ahorros por defecto', async () => {
    mockHomeData.data = {accounts: [checkingAccount, savingsAccount]};
    await mount();
    expect(latest?.fromAccountIndex).toBe(1);
    expect(latest?.selectedFromAccount?.accountKind).toBe('savings');
  });

  test('cuando hay más de una cuenta, destino distinto al origen', async () => {
    mockHomeData.data = {accounts: [checkingAccount, savingsAccount]};
    await mount();
    expect(latest?.fromAccountIndex).toBe(1);
    expect(latest?.toAccountIndex).toBe(0);
    expect(latest?.selectedToAccount?.accountGuid).toBe(checkingAccount.accountGuid);
  });

  test('usa índice 0 cuando no hay cuenta de ahorros', async () => {
    mockHomeData.data = {accounts: [checkingAccount]};
    await mount();
    expect(latest?.fromAccountIndex).toBe(0);
  });

  test('selectedFromAccount es null cuando no hay cuentas', async () => {
    mockHomeData.data = {accounts: []};
    await mount();
    expect(latest?.selectedFromAccount).toBeNull();
    expect(latest?.selectedToAccount).toBeNull();
  });

  test('openFromAccountPicker abre el modal cuando hay más de una cuenta', async () => {
    mockHomeData.data = {accounts: [savingsAccount, checkingAccount]};
    await mount();
    act(() => {
      latest?.openFromAccountPicker();
    });
    expect(latest?.fromAccountModalVisible).toBe(true);
  });

  test('openFromAccountPicker no abre el modal con una sola cuenta', async () => {
    mockHomeData.data = {accounts: [savingsAccount]};
    await mount();
    act(() => {
      latest?.openFromAccountPicker();
    });
    expect(latest?.fromAccountModalVisible).toBe(false);
  });

  test('selectFromAccount actualiza índice y cierra modal', async () => {
    mockHomeData.data = {accounts: [savingsAccount, checkingAccount]};
    await mount();
    act(() => {
      latest?.openFromAccountPicker();
    });
    act(() => {
      latest?.selectFromAccount(1);
    });
    expect(latest?.fromAccountIndex).toBe(1);
    expect(latest?.fromAccountModalVisible).toBe(false);
  });

  test('prepareTransferReview falla cuando el monto es cero', async () => {
    mockHomeData.data = {accounts: [savingsAccount]};
    await mount();
    const result = latest?.prepareTransferReview();
    expect(result?.ok).toBe(false);
    if (!result?.ok) {
      expect(result?.message).toMatch(/monto/i);
    }
  });

  test('prepareTransferReview falla por saldo cuando no hay cuentas y hay monto', async () => {
    mockHomeData.data = {accounts: []};
    await mount();
    act(() => {
      latest?.onAmountChange('1');
    });
    const result = latest?.prepareTransferReview();
    expect(result?.ok).toBe(false);
    if (!result?.ok) {
      expect(result?.message).toMatch(/saldo|monto/i);
    }
  });

  test('prepareTransferReview retorna ok con params cuando es válido', async () => {
    mockHomeData.data = {accounts: [checkingAccount, savingsAccount]};
    await mount();
    act(() => {
      latest?.onAmountChange('5');
    });
    const result = latest?.prepareTransferReview();
    expect(result?.ok).toBe(true);
    if (result?.ok) {
      expect(result.params.amountCents).toBe(500);
      expect(result.params.displayAmount).toBe(formatMoneyUsdDisplay(5));
      expect(result.params.beneficiary.name).toBe('Cuenta propia B');
      expect(result.params.beneficiary.id).toBe('ben-checking');
      expect(result.params.fromAccountTitle).toBe('Ahorros');
      expect(result.params.fromAccountSubtitle).toBe('Ahorros ****1111');
      expect(result.params.fromBalanceDisplay).toBe(formatMoneyUsdDisplay(1000));
      expect(result.params.toBalanceDisplay).toBe(formatMoneyUsdDisplay(500));
    }
  });

  test('prepareTransferReview incluye concepto en los params', async () => {
    mockHomeData.data = {accounts: [checkingAccount, savingsAccount]};
    await mount();
    act(() => {
      latest?.onAmountChange('3');
      latest?.onConceptChange('Pago renta');
    });
    const result = latest?.prepareTransferReview();
    expect(result?.ok).toBe(true);
    if (result?.ok) {
      expect(result.params.concept).toBe('Pago renta');
    }
  });

  test('fromAccountDescription retorna cadena vacía cuando no hay cuenta', async () => {
    mockHomeData.data = {accounts: []};
    await mount();
    expect(latest?.fromAccountDescription).toBe('');
  });

  test('fromAccountDescription retorna descripción de la cuenta seleccionada', async () => {
    mockHomeData.data = {accounts: [savingsAccount]};
    await mount();
    expect(typeof latest?.fromAccountDescription).toBe('string');
    expect(latest?.fromAccountDescription.length).toBeGreaterThan(0);
  });

  test('amountFieldError es null cuando el monto es válido', async () => {
    mockHomeData.data = {accounts: [savingsAccount]};
    await mount();
    act(() => {
      latest?.onAmountChange('100'); // US$100
    });
    expect(latest?.amountFieldError).toBeNull();
  });

  test('amountFieldError cuando el monto supera el saldo', async () => {
    mockHomeData.data = {accounts: [{...savingsAccount, balance: 0.5}]};
    await mount();
    act(() => {
      latest?.onAmountChange('100'); // US$100 > US$0.50
    });
    expect(latest?.amountFieldError).not.toBeNull();
  });

  test('canContinueToReview es false con monto cero aunque origen y destino sean distintos', async () => {
    mockHomeData.data = {accounts: [checkingAccount, savingsAccount]};
    await mount();
    expect(latest?.canContinueToReview).toBe(false);
  });

  test('canContinueToReview es true con origen y destino distintos y monto válido', async () => {
    mockHomeData.data = {accounts: [checkingAccount, savingsAccount]};
    await mount();
    act(() => {
      latest?.onAmountChange('500'); // US$500
    });
    expect(latest?.canContinueToReview).toBe(true);
  });

  test('canContinueToReview es false con una sola cuenta (origen y destino coinciden)', async () => {
    mockHomeData.data = {accounts: [savingsAccount]};
    await mount();
    act(() => {
      latest?.onAmountChange('1');
    });
    expect(latest?.canContinueToReview).toBe(false);
  });

  test('canContinueToReview es false cuando el monto supera el saldo', async () => {
    mockHomeData.data = {accounts: [{...savingsAccount, balance: 0.5}, checkingAccount]};
    await mount();
    act(() => {
      latest?.onAmountChange('100'); // US$100 > US$0.50
    });
    expect(latest?.canContinueToReview).toBe(false);
  });

  test('setFromAccountModalVisible controla la visibilidad del modal de origen', async () => {
    await mount();
    act(() => {
      latest?.setFromAccountModalVisible(true);
    });
    expect(latest?.fromAccountModalVisible).toBe(true);
    act(() => {
      latest?.setFromAccountModalVisible(false);
    });
    expect(latest?.fromAccountModalVisible).toBe(false);
  });

  test('setToAccountModalVisible controla la visibilidad del modal de destino', async () => {
    await mount();
    act(() => {
      latest?.setToAccountModalVisible(true);
    });
    expect(latest?.toAccountModalVisible).toBe(true);
  });

  test('retry delega al homeViewModel', async () => {
    const retryMock = jest.fn().mockResolvedValue(undefined);
    mockHomeData.retry = retryMock;
    await mount();
    await act(async () => {
      await latest?.retry();
    });
    expect(retryMock).toHaveBeenCalled();
  });
});
