import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import type {ReactTestRendererJSON} from 'react-test-renderer';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import {TransferScreen} from '../../presentation/TransferScreen';
import {formatMoneyUsdDisplay} from '../../../../utils/formatMoneyUsdDisplay';
import type {AccountBalance} from '../../../../domain/entities/ContractBalance';

/** Evita JSON.stringify sobre el árbol (referencias circulares en algunos nodos). */
function renderedText(
  node: ReactTestRendererJSON | ReactTestRendererJSON[] | string | number | null | undefined,
): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(renderedText).join('');
  }
  if (typeof node === 'object' && node && 'children' in node) {
    return renderedText(
      node.children as ReactTestRendererJSON | ReactTestRendererJSON[],
    );
  }
  return '';
}

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
    simplePrompt: jest.fn(),
    createKeys: jest.fn(),
    deleteKeys: jest.fn(),
  })),
);

// ── Hooks usados por BeneficiarySelectModal ───────────────────────────────────
jest.mock('../../../../presentation/home/useHomeViewModel', () => ({
  useHomeViewModel: () => ({
    data: {accounts: [], creditCards: [], loans: [], investments: [], frequentPayments: []},
    isLoading: false,
    error: null,
    retry: jest.fn(),
  }),
}));

jest.mock('../../../../presentation/beneficiary/useBeneficiaryContactsViewModel', () => ({
  useBeneficiaryContactsViewModel: () => ({
    contacts: [],
    isLoading: false,
    error: null,
    retry: jest.fn(),
  }),
}));

function findAncestorWithOnPress(
  start: ReactTestRenderer.ReactTestInstance | null,
): ReactTestRenderer.ReactTestInstance | null {
  let node: ReactTestRenderer.ReactTestInstance | null = start;
  while (node) {
    if (typeof node.props?.onPress === 'function') {
      return node;
    }
    node = node.parent;
  }
  return null;
}

function findPressableByTextLabel(
  root: ReactTestRenderer.ReactTestRenderer,
  label: string,
) {
  const matches = root.root.findAll(
    (n: ReactTestRenderer.ReactTestInstance) =>
      n.props?.children === label,
  );
  if (matches.length === 0) {
    return null;
  }
  return findAncestorWithOnPress(matches[0]);
}

const mockUseTransferViewModel = jest.fn();

const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
const mockTabNavigate = jest.fn();

// Previene que providers/index.ts cargue AuthProvider → di/container → módulos nativos
jest.mock('../../../../providers', () => ({
  useAuth: () => ({user: {name: 'Titular Demo'}, logout: jest.fn()}),
  useTheme: () => ({
    colors: require('../../../../providers/theme/colors').LightColors,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setParams: mockSetParams,
    getParent: () => ({navigate: mockTabNavigate}),
  }),
  useRoute: () => ({params: {}}),
}));

jest.mock('../../presentation/useTransferViewModel', () => ({
  useTransferViewModel: () => mockUseTransferViewModel(),
}));

jest.mock('../../../../providers/theme', () => ({
  useTheme: () => ({
    colors: require('../../../../providers/theme/colors').LightColors,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

function makeBeneficiaryContact(
  overrides: Partial<AccountBalance['beneficiary']> = {},
): AccountBalance['beneficiary'] {
  return {
    beneficiaryGuid: 'guid-default',
    contactName: 'Contacto',
    bankName: 'Banco',
    accountType: 'savings',
    accountTypeLabel: 'Ahorros',
    beneficiaryAccountNumber: '0000000000',
    lastFourDigits: '0000',
    ...overrides,
  };
}

function makeAccount(
  overrides: Partial<AccountBalance> & {balance?: number} = {},
): AccountBalance {
  const guid = overrides.accountGuid ?? 'acc-default';
  return {
    accountGuid: guid,
    maskedAccountNumber: '****1234',
    accountKind: 'savings',
    accountTypeLabel: 'Ahorros',
    balance: 0,
    beneficiary: makeBeneficiaryContact({
      beneficiaryGuid: `${guid}-bene`,
      ...overrides.beneficiary,
    }),
    ...overrides,
  };
}

function baseVm(overrides: Record<string, unknown> = {}) {
  return {
    user: {name: 'Titular Demo'},
    isLoading: false,
    error: null,
    retry: jest.fn().mockResolvedValue(undefined),
    accounts: [],
    selectedFromAccount: null,
    selectedToAccount: null,
    fromAccountDescription: '',
    toAccountDescription: '',
    fromAccountModalVisible: false,
    setFromAccountModalVisible: jest.fn(),
    toAccountModalVisible: false,
    setToAccountModalVisible: jest.fn(),
    amountCents: null,
    amountInputText: '',
    onAmountChange: jest.fn(),
    concept: '',
    onConceptChange: jest.fn(),
    validationMessage: null,
    setValidationMessage: jest.fn(),
    openFromAccountPicker: jest.fn(),
    openToAccountPicker: jest.fn(),
    selectFromAccount: jest.fn(),
    selectToAccount: jest.fn(),
    fromAccountIndex: 0,
    toAccountIndex: 0,
    canContinueToReview: true,
    prepareTransferReview: jest.fn(() => ({
      ok: false,
      message: 'Selecciona un beneficiario.',
    })),
    openAccountBeneficiaryPicker: jest.fn(),
    accountBeneficiaryModalVisible: false,
    ...overrides,
  };
}

describe('TransferScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTransferViewModel.mockReturnValue(baseVm());
  });

  test('muestra el saldo disponible de la cuenta destino (Hacia)', async () => {
    const accountFrom = makeAccount({
      accountGuid: 'from-1',
      balance: 1000.5,
      beneficiary: makeBeneficiaryContact({contactName: 'Origen'}),
    });
    const accountTo = makeAccount({
      accountGuid: 'to-1',
      balance: 250.75,
      beneficiary: makeBeneficiaryContact({contactName: 'Destino'}),
    });
    mockUseTransferViewModel.mockReturnValue(
      baseVm({
        accounts: [accountFrom, accountTo],
        selectedFromAccount: accountFrom,
        selectedToAccount: accountTo,
        fromAccountIndex: 0,
        toAccountIndex: 1,
      }),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferScreen />);
    });
    const flat = renderedText(root!.toJSON());
    expect(flat).toContain(formatMoneyUsdDisplay(250.75));
    expect(flat).toContain('Hacia');
  });

  test('muestra el título TRANSFERIR', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferScreen />);
    });
    const flat = renderedText(root!.toJSON());
    expect(flat).toContain('TRANSFERIR');
  });

  test('muestra carga cuando isLoading es true', async () => {
    mockUseTransferViewModel.mockReturnValue(baseVm({isLoading: true}));

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferScreen />);
    });
    expect(
      root!.root.findAllByType(ActivityIndicator as never).length,
    ).toBeGreaterThan(0);
  });

  test('muestra error y Reintentar; retry al pulsar', async () => {
    const retry = jest.fn().mockResolvedValue(undefined);
    mockUseTransferViewModel.mockReturnValue(
      baseVm({error: 'Sin conexión', retry}),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferScreen />);
    });

    const flat = renderedText(root!.toJSON());
    expect(flat).toContain('Sin conexión');
    expect(flat).toContain('Reintentar');

    const retryBtn = findPressableByTextLabel(root!, 'Reintentar');
    expect(retryBtn).toBeTruthy();
    await act(async () => {
      retryBtn!.props.onPress?.();
    });
    expect(retry).toHaveBeenCalled();
  });

  test('el botón atrás navega al tab posición consolidada', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferScreen />);
    });

    const back = root!.root.findAllByType(TouchableOpacity as never)[0];
    await act(async () => {
      back.props.onPress?.();
    });
    expect(mockTabNavigate).toHaveBeenCalledWith('Home');
  });

  test('Continuar está deshabilitado cuando canContinueToReview es false', async () => {
    mockUseTransferViewModel.mockReturnValue(
      baseVm({canContinueToReview: false}),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferScreen />);
    });

    const continuar = root!.root.findByProps({
      testID: 'transfer-continue-button',
    });
    expect(continuar.props.disabled).toBe(true);
  });

  test('Continuar con validación fallida llama setValidationMessage', async () => {
    const setValidationMessage = jest.fn();
    const prepareTransferReview = jest.fn(() => ({
      ok: false,
      message: 'Ingresa un monto mayor a cero.',
    }));
    mockUseTransferViewModel.mockReturnValue(
      baseVm({setValidationMessage, prepareTransferReview}),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferScreen />);
    });

    const continuarCta = findPressableByTextLabel(root!, 'Continuar');
    expect(continuarCta).toBeTruthy();
    await act(async () => {
      continuarCta!.props.onPress?.();
    });
    expect(prepareTransferReview).toHaveBeenCalled();
    expect(setValidationMessage).toHaveBeenCalledWith(
      'Ingresa un monto mayor a cero.',
    );
    expect(mockNavigate).not.toHaveBeenCalledWith(
      'TransferReview',
      expect.anything(),
    );
  });

  test('Continuar con validación ok navega a TransferReview', async () => {
    const setValidationMessage = jest.fn();
    const params = {amountCents: 100};
    const prepareTransferReview = jest.fn(() => ({
      ok: true,
      params,
    }));
    mockUseTransferViewModel.mockReturnValue(
      baseVm({setValidationMessage, prepareTransferReview}),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferScreen />);
    });

    const continuarCta = findPressableByTextLabel(root!, 'Continuar');
    expect(continuarCta).toBeTruthy();
    await act(async () => {
      continuarCta!.props.onPress?.();
    });
    expect(setValidationMessage).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith('TransferReview', params);
  });
});
