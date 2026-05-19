import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import type {ReactTestRendererJSON} from 'react-test-renderer';
import {ActivityIndicator, RefreshControl, Text, TouchableOpacity} from 'react-native';
import {HomeScreen} from '../../../src/presentation/home/HomeScreen';
import {
  FALLBACK_HOME_BANNERS,
  FALLBACK_HOME_FREQUENT_PAYMENTS,
  MOCK_RECENT_ACTIVITY,
  MOCK_UPCOMING_PAYMENTS_SUMMARY,
} from '../../../src/presentation/home/homeDashboardMocks';

const emptyBalance = {
  accounts: [] as [],
  creditCards: [] as [],
  loans: [] as [],
  investments: [] as [],
  frequentPayments: [] as [],
  banners: [] as [],
  homeDashboardIcons: [] as [],
  recentTransactions: [] as [],
};

const mockUseHomeViewModel = jest.fn();

function buildHomeVm(overrides: {
  data?: typeof emptyBalance | Record<string, unknown> | null;
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  refresh?: jest.Mock;
  retry?: jest.Mock;
}) {
  const refresh = overrides.refresh ?? jest.fn();
  const retry = overrides.retry ?? jest.fn();
  const data = overrides.data ?? null;
  const base = {
    data,
    isLoading: overrides.isLoading ?? false,
    isRefreshing: overrides.isRefreshing ?? false,
    error: overrides.error ?? '',
    refresh,
    retry,
    bannersForHome: [] as unknown[],
    frequentPaymentsForHome: [] as unknown[],
    upcomingPaymentsSummary: MOCK_UPCOMING_PAYMENTS_SUMMARY,
    recentActivityItems: MOCK_RECENT_ACTIVITY,
  };
  if (data && typeof data === 'object' && 'banners' in data) {
    const d = data as {
      banners?: unknown[];
      frequentPayments?: unknown[];
    };
    base.bannersForHome =
      d.banners && d.banners.length > 0 ? d.banners : FALLBACK_HOME_BANNERS;
    base.frequentPaymentsForHome =
      d.frequentPayments && d.frequentPayments.length > 0
        ? d.frequentPayments
        : FALLBACK_HOME_FREQUENT_PAYMENTS;
  }
  return base;
}

/** Evita JSON.stringify sobre el árbol (p. ej. RefreshControl puede introducir referencias circulares). */
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

jest.mock('../../../src/presentation/home/useHomeViewModel', () => ({
  useHomeViewModel: () => mockUseHomeViewModel(),
}));

jest.mock('../../../src/providers', () => {
  const {LightColors} = require('../../../src/providers/theme/colors');
  return {
    useAuth: () => ({user: {name: 'Usuario Demo', email: 'u@b.com'}}),
    useTheme: () => ({colors: LightColors}),
  };
});

const mockSetParams = jest.fn();
const mockNavigate = jest.fn();
const mockUseRoute = jest.fn(() => ({params: undefined as {refreshHome?: number} | undefined}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useRoute: () => mockUseRoute(),
    useNavigation: () => ({setParams: mockSetParams, navigate: mockNavigate}),
    useFocusEffect: jest.fn(fn => {
      fn();
    }),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const Rn = require('react');
  const {View} = require('react-native');
  return {
    SafeAreaView: ({children, ...props}: {children: Rn.ReactNode}) =>
      Rn.createElement(View, props, children),
    useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  };
});

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoute.mockReturnValue({params: undefined});
  });

  test('muestra el indicador de carga cuando isLoading es true', async () => {
    mockUseHomeViewModel.mockReturnValue(
      buildHomeVm({data: null, isLoading: true, error: ''}),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeScreen />);
    });

    expect(
      root!.root.findAllByType(ActivityIndicator as never).length,
    ).toBeGreaterThan(0);
  });

  test('muestra error y Reintentar cuando hay fallo', async () => {
    const retry = jest.fn();
    mockUseHomeViewModel.mockReturnValue(
      buildHomeVm({data: emptyBalance, error: 'Error de red', retry}),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeScreen />);
    });

    const flat = renderedText(root!.toJSON());
    expect(flat).toContain('Error de red');
    expect(flat).toContain('Reintentar');
  });

  test('muestra secciones y productos cuando hay datos', async () => {
    mockUseHomeViewModel.mockReturnValue(
      buildHomeVm({
        data: {
          accounts: [
            {
              accountGuid: 'a1',
              maskedAccountNumber: '****4242',
              accountKind: 'savings' as const,
              balance: 1500,
              maskedAccountHome: '****4242',
              accountTypeLabel: 'Cta. Ahorros',
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
        },
      }),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeScreen />);
    });

    const flat = renderedText(root!.toJSON());
    expect(flat).toContain('Cuentas');
    expect(flat).toContain('Acciones frecuentes');
    expect(flat).toContain('Cta. Ahorros');
    expect(flat).toContain('****4242');
    expect(flat).toContain('Agua casa');
    expect(flat).toContain('Pago luz');
    expect(flat).toContain('Actividad reciente');
  });

  test('refreshHome en params dispara refresh y limpia el parámetro', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    mockUseRoute.mockReturnValue({params: {refreshHome: 42}});
    mockUseHomeViewModel.mockReturnValue(
      buildHomeVm({data: emptyBalance, refresh}),
    );

    await act(async () => {
      ReactTestRenderer.create(<HomeScreen />);
    });

    expect(refresh).toHaveBeenCalled();
    expect(mockSetParams).toHaveBeenCalledWith({refreshHome: undefined});
  });

  test('muestra tarjetas de crédito en filtro Tarjetas', async () => {
    mockUseHomeViewModel.mockReturnValue(
      buildHomeVm({
        data: {
          accounts: [],
          creditCards: [
            {
              maskedCardNumber: '****9999',
              totalDue: 50,
              maxPaymentDate: '2026-05-01',
            },
          ],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
        },
      }),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeScreen />);
    });

    expect(renderedText(root!.toJSON())).toContain('Cuentas');

    const tarjetasTab = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(inst => {
        try {
          return inst.findByType(Text as never).props.children === 'Tarjetas';
        } catch {
          return false;
        }
      });
    expect(tarjetasTab).toBeDefined();

    await act(async () => {
      tarjetasTab!.props.onPress();
    });

    expect(renderedText(root!.toJSON())).toContain('****9999');
  });

  test('Reintentar llama a retry del view model', async () => {
    const retry = jest.fn();
    mockUseHomeViewModel.mockReturnValue(
      buildHomeVm({data: emptyBalance, error: 'fallo', retry}),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeScreen />);
    });

    const retryBtn = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(t => {
        try {
          return t.findByType(Text as never).props.children === 'Reintentar';
        } catch {
          return false;
        }
      });
    expect(retryBtn).toBeDefined();
    await act(async () => {
      retryBtn!.props.onPress();
    });
    expect(retry).toHaveBeenCalled();
  });

  test('pull-to-refresh invoca refresh', async () => {
    const refresh = jest.fn();
    mockUseHomeViewModel.mockReturnValue(
      buildHomeVm({data: emptyBalance, isRefreshing: true, refresh}),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeScreen />);
    });

    const rc = root!.root.findByType(RefreshControl as never);
    await act(async () => {
      rc.props.onRefresh();
    });
    expect(refresh).toHaveBeenCalled();
  });

  test('muestra créditos en filtro Créditos', async () => {
    mockUseHomeViewModel.mockReturnValue(
      buildHomeVm({
        data: {
          accounts: [],
          creditCards: [],
          loans: [
            {
              loanGuid: 'lg1',
              outstandingBalance: 1000,
              nextInstallmentAmount: 50,
              nextInstallmentDate: '2026-06-01',
            },
          ],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
        },
      }),
    );

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeScreen />);
    });

    const creditosTab = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(inst => {
        try {
          return inst.findByType(Text as never).props.children === 'Préstamos';
        } catch {
          return false;
        }
      });
    expect(creditosTab).toBeDefined();
    await act(async () => {
      creditosTab!.props.onPress();
    });
    const flat = renderedText(root!.toJSON());
    expect(flat).toContain('Préstamo');
    expect(flat).toContain('Cuota');
    expect(flat).toContain('$**.**');
  });

  test('muestra mensaje vacío cuando no hay productos en el filtro', async () => {
    mockUseHomeViewModel.mockReturnValue(buildHomeVm({data: emptyBalance}));

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeScreen />);
    });

    expect(renderedText(root!.toJSON())).toContain(
      'No hay productos en esta categoría',
    );
  });
});
