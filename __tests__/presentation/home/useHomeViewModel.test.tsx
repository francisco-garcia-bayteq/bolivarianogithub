import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {
  QueryClient,
  QueryClientProvider,
  notifyManager,
} from '@tanstack/react-query';
import {useDI} from '../../../src/di';
import {useHomeViewModel} from '../../../src/presentation/home/useHomeViewModel';

jest.mock('../../../src/di', () => ({
  useDI: jest.fn(),
}));

const mockedUseDI = useDI as jest.MockedFunction<typeof useDI>;

function flushPromises(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve));
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

describe('useHomeViewModel', () => {
  let latest: ReturnType<typeof useHomeViewModel> | undefined;
  let queryClient: QueryClient;

  const originalScheduler = notifyManager.setScheduler;

  function Harness() {
    latest = useHomeViewModel();
    return null;
  }

  function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    latest = undefined;
    queryClient = createTestQueryClient();
    notifyManager.setScheduler(cb => cb());
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    notifyManager.setScheduler(originalScheduler);
  });

  test('loads contract balance on mount', async () => {
    const homeBalance = {
      accounts: [],
      creditCards: [],
      loans: [],
      investments: [],
      frequentPayments: [],
      banners: [],
      homeDashboardIcons: [],
      recentTransactions: [],
    };
    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue(homeBalance),
      },
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Wrapper>
          <Harness />
        </Wrapper>,
      );
      await flushPromises();
    });

    expect(latest?.data).toEqual(homeBalance);
    expect(latest?.isLoading).toBe(false);
    expect(latest?.isRefreshing).toBe(false);
    expect(latest?.error).toBe('');
  });

  test('refresh vuelve a pedir saldo sin activar isLoading inicial', async () => {
    const homeBalance = {
      accounts: [],
      creditCards: [],
      loans: [],
      investments: [],
      frequentPayments: [],
      banners: [],
      homeDashboardIcons: [],
      recentTransactions: [],
    };
    const execute = jest.fn().mockResolvedValue(homeBalance);

    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {execute},
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Wrapper>
          <Harness />
        </Wrapper>,
      );
      await flushPromises();
    });

    expect(execute).toHaveBeenCalledTimes(1);

    await act(async () => {
      await latest?.refresh();
      await flushPromises();
    });

    expect(execute).toHaveBeenCalledTimes(2);
    expect(latest?.isRefreshing).toBe(false);
    expect(latest?.isLoading).toBe(false);
  });

  test('surfaces errors and supports retry', async () => {
    const execute = jest
      .fn()
      .mockRejectedValueOnce(new Error('Sin conexión'))
      .mockResolvedValueOnce({
        accounts: [],
        creditCards: [],
        loans: [],
        investments: [],
        frequentPayments: [],
        banners: [],
        homeDashboardIcons: [],
        recentTransactions: [],
      });

    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {execute},
    } as never);

    await act(async () => {
      ReactTestRenderer.create(
        <Wrapper>
          <Harness />
        </Wrapper>,
      );
      await flushPromises();
    });

    expect(latest?.error).toBe('Sin conexión');

    await act(async () => {
      await latest?.retry();
      await flushPromises();
    });

    expect(latest?.error).toBe('');
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
