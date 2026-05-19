import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {useDI} from '../../../src/di';
import {useAccountMovementsViewModel} from '../../../src/presentation/transactions/useAccountMovementsViewModel';

jest.mock('../../../src/di', () => ({
  useDI: jest.fn(),
}));

const mockedUseDI = useDI as jest.MockedFunction<typeof useDI>;

const ASYNC_DRAIN_ROUNDS = 15;

/** Debe coincidir con `MOVEMENTS_SEARCH_DEBOUNCE_MS` en el ViewModel. */
const SEARCH_DEBOUNCE_MS = 400;

describe('useAccountMovementsViewModel', () => {
  let latest: ReturnType<typeof useAccountMovementsViewModel> | undefined;
  let testRenderer: ReactTestRenderer.ReactTestRenderer | undefined;

  async function mountHarness(ui: React.ReactElement): Promise<void> {
    await act(async () => {
      testRenderer = ReactTestRenderer.create(ui);
      for (let i = 0; i < ASYNC_DRAIN_ROUNDS; i++) {
        await new Promise<void>(resolve => setImmediate(resolve));
      }
    });
  }

  async function actAndDrain(syncWork: () => void): Promise<void> {
    await act(async () => {
      syncWork();
      for (let i = 0; i < ASYNC_DRAIN_ROUNDS; i++) {
        await new Promise<void>(resolve => setImmediate(resolve));
      }
    });
  }

  async function actAndDrainAfter(asyncWork: () => Promise<void>): Promise<void> {
    await act(async () => {
      await asyncWork();
      for (let i = 0; i < ASYNC_DRAIN_ROUNDS; i++) {
        await new Promise<void>(resolve => setImmediate(resolve));
      }
    });
  }

  function Harness({guid}: {guid?: string}) {
    latest = useAccountMovementsViewModel(guid);
    return null;
  }

  beforeEach(() => {
    latest = undefined;
    testRenderer = undefined;
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      testRenderer?.unmount();
      testRenderer = undefined;
    });
  });

  test('loads home account and first page of movements', async () => {
    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****8829',
              accountKind: 'savings',
              balance: 314.78,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: jest.fn().mockResolvedValue({
          totalCount: 1,
          pageNumber: 1,
          pageSize: 20,
          items: [
            {
              transactionGuid: 't1',
              transactionIdentifier: 'x',
              beneficiaryName: 'Ricardo Gomez',
              beneficiaryAccountType: 'Savings',
              beneficiaryAccountTypeLabel: 'Ahorros',
              beneficiaryAccountNumber: '****1234',
              ownerAccountType: 'Savings',
              ownerAccountLabel: 'Cuenta propia',
              accountNumber: '****8829',
              accountType: 'Savings',
              accountTypeLabel: 'Cta. ahorros',
              amount: -91.02,
              transferDate: '2026-04-04T15:00:00.000Z',
              transactionTypeLabel: 'Transferencia realizada',
              transactionType: 'SentTransfers',
              concept: null,
              balanceAfterTransaction: 12450.8,
              allowedShared: true,
            },
          ],
        }),
      },
    } as never);

    await mountHarness(<Harness />);

    expect(latest?.selectedAccount?.accountGuid).toBe('acc-1');
    expect(latest?.items).toHaveLength(1);
    expect(latest?.items[0].beneficiaryName).toBe('Ricardo Gomez');
    expect(latest?.movementsError).toBeNull();
    expect(latest?.isLoadingMovements).toBe(false);
  });

  test('surfaces movements error and allows refresh', async () => {
    const executeMovements = jest
      .fn()
      .mockRejectedValueOnce(new Error('Sin conexión'))
      .mockResolvedValueOnce({
        totalCount: 0,
        pageNumber: 1,
        pageSize: 20,
        items: [],
      });

    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****1111',
              accountKind: 'checking',
              balance: 100,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: executeMovements,
      },
    } as never);

    await mountHarness(<Harness />);

    expect(latest?.movementsError).toBe('Sin conexión');

    await actAndDrainAfter(async () => {
      await latest?.refresh();
    });

    expect(latest?.movementsError).toBeNull();
    expect(executeMovements).toHaveBeenCalledTimes(2);
  });

  test('applyDateRange passes DateFrom and DateTo as ISO date-time to the use case', async () => {
    const executeMovements = jest.fn().mockResolvedValue({
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      items: [],
    });

    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****8829',
              accountKind: 'savings',
              balance: 314.78,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: executeMovements,
      },
    } as never);

    await mountHarness(<Harness />);

    const from = new Date(2026, 1, 10);
    const to = new Date(2026, 1, 13);

    await actAndDrain(() => {
      latest?.applyDateRange(from, to);
    });

    const withRange = executeMovements.mock.calls.find(
      args =>
        args[0].dateFrom !== undefined && args[0].dateTo !== undefined,
    );
    expect(withRange).toBeDefined();
    expect(withRange?.[0].dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(withRange?.[0].dateTo).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(withRange?.[0].accountGuid).toBe('acc-1');
  });

  test('applyAmountRange passes minAmount and maxAmount to the use case', async () => {
    const executeMovements = jest.fn().mockResolvedValue({
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      items: [],
    });

    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****8829',
              accountKind: 'savings',
              balance: 314.78,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: executeMovements,
      },
    } as never);

    await mountHarness(<Harness />);

    await actAndDrain(() => {
      latest?.applyAmountRange(10.5, 500);
    });

    const withAmount = executeMovements.mock.calls.find(
      args =>
        args[0].minAmount === 10.5 && args[0].maxAmount === 500,
    );
    expect(withAmount).toBeDefined();
    expect(withAmount?.[0].accountGuid).toBe('acc-1');
  });

  test('applyTransactionEnumType passes transactionType to the use case', async () => {
    const executeMovements = jest.fn().mockResolvedValue({
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      items: [],
    });

    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****8829',
              accountKind: 'savings',
              balance: 314.78,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: executeMovements,
      },
    } as never);

    await mountHarness(<Harness />);

    await actAndDrain(() => {
      latest?.applyTransactionEnumType('SentTransfers');
    });

    const withEnum = executeMovements.mock.calls.find(
      args => args[0].transactionType === 'SentTransfers',
    );
    expect(withEnum).toBeDefined();
    expect(withEnum?.[0].accountGuid).toBe('acc-1');
  });

  test('debounced search passes textSearch to getAccountMovementsUseCase', async () => {
    jest.useFakeTimers();
    try {
      const executeMovements = jest.fn().mockResolvedValue({
        totalCount: 0,
        pageNumber: 1,
        pageSize: 20,
        items: [],
      });
      mockedUseDI.mockReturnValue({
        getHomeContractBalanceUseCase: {
          execute: jest.fn().mockResolvedValue({
            accounts: [
              {
                accountGuid: 'acc-1',
                maskedAccountNumber: '****8829',
                accountKind: 'savings',
                balance: 314.78,
              },
            ],
            creditCards: [],
            loans: [],
            investments: [],
            frequentPayments: [],
            banners: [],
            homeDashboardIcons: [],
            recentTransactions: [],
          }),
        },
        getAccountMovementsUseCase: {
          execute: executeMovements,
        },
      } as never);

      await act(async () => {
        testRenderer = ReactTestRenderer.create(<Harness />);
        for (let i = 0; i < 40; i++) {
          await Promise.resolve();
        }
      });

      await act(async () => {
        jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
        for (let i = 0; i < 40; i++) {
          await Promise.resolve();
        }
      });

      executeMovements.mockClear();

      await act(() => {
        latest?.setSearchQuery('María');
      });

      await act(async () => {
        jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
        for (let i = 0; i < 40; i++) {
          await Promise.resolve();
        }
      });

      expect(executeMovements).toHaveBeenCalledWith(
        expect.objectContaining({
          accountGuid: 'acc-1',
          textSearch: 'María',
          pageNumber: 1,
          pageSize: 20,
        }),
      );
    } finally {
      jest.useRealTimers();
    }
  });

  test('selecciona cuenta por guid de ruta cuando existe', async () => {
    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-a',
              maskedAccountNumber: '****1111',
              accountKind: 'savings',
              balance: 1,
            },
            {
              accountGuid: 'acc-b',
              maskedAccountNumber: '****2222',
              accountKind: 'checking',
              balance: 2,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: jest.fn().mockResolvedValue({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 20,
          items: [],
        }),
      },
    } as never);

    await mountHarness(<Harness guid="acc-b" />);

    expect(latest?.selectedAccount?.accountGuid).toBe('acc-b');
  });

  test('sin cuentas deja accountError y no movimientos', async () => {
    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: jest.fn(),
      },
    } as never);

    await mountHarness(<Harness />);

    expect(latest?.accountError).toBe('No hay cuentas disponibles');
    expect(latest?.selectedAccount).toBeNull();
    expect(latest?.items).toEqual([]);
  });

  test('error al cargar cuenta expone mensaje genérico si no es Error', async () => {
    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockRejectedValue('fallo'),
      },
      getAccountMovementsUseCase: {
        execute: jest.fn(),
      },
    } as never);

    await mountHarness(<Harness />);

    expect(latest?.accountError).toBe('Error al cargar la cuenta');
  });

  test('loadMore pide la página siguiente y concatena ítems', async () => {
    const executeMovements = jest
      .fn()
      .mockResolvedValueOnce({
        totalCount: 3,
        pageNumber: 1,
        pageSize: 20,
        items: [
          {
            transactionGuid: 'g1',
            transactionIdentifier: 'i1',
            beneficiaryName: 'A',
            beneficiaryAccountType: 'Savings',
            beneficiaryAccountTypeLabel: 'Ahorros',
            beneficiaryAccountNumber: '****1',
            ownerAccountType: 'Savings',
            ownerAccountLabel: 'x',
            accountNumber: '****9',
            accountType: 'Savings',
            accountTypeLabel: 'x',
            amount: -1,
            transferDate: '2026-01-01T00:00:00.000Z',
            transactionTypeLabel: 'T',
            transactionType: 'SentTransfers',
            concept: null,
            balanceAfterTransaction: 0,
            allowedShared: true,
          },
        ],
      })
      .mockResolvedValueOnce({
        totalCount: 3,
        pageNumber: 2,
        pageSize: 20,
        items: [
          {
            transactionGuid: 'g2',
            transactionIdentifier: 'i2',
            beneficiaryName: 'B',
            beneficiaryAccountType: 'Savings',
            beneficiaryAccountTypeLabel: 'Ahorros',
            beneficiaryAccountNumber: '****2',
            ownerAccountType: 'Savings',
            ownerAccountLabel: 'x',
            accountNumber: '****9',
            accountType: 'Savings',
            accountTypeLabel: 'x',
            amount: -2,
            transferDate: '2026-01-02T00:00:00.000Z',
            transactionTypeLabel: 'T',
            transactionType: 'SentTransfers',
            concept: null,
            balanceAfterTransaction: 0,
            allowedShared: true,
          },
        ],
      });

    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****8829',
              accountKind: 'savings',
              balance: 1,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: executeMovements,
      },
    } as never);

    await mountHarness(<Harness />);

    expect(latest?.items).toHaveLength(1);
    expect(latest?.hasMore).toBe(true);

    await actAndDrainAfter(async () => {
      await latest?.loadMore();
    });

    expect(executeMovements).toHaveBeenLastCalledWith(
      expect.objectContaining({pageNumber: 2, accountGuid: 'acc-1'}),
    );
    expect(latest?.items).toHaveLength(2);
  });

  test('clearAllFilters y hasActiveFilters', async () => {
    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****8829',
              accountKind: 'savings',
              balance: 1,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: jest.fn().mockResolvedValue({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 20,
          items: [],
        }),
      },
    } as never);

    await mountHarness(<Harness />);

    await actAndDrain(() => {
      latest?.applyDateRange(new Date(2026, 0, 1), new Date(2026, 0, 5));
    });
    expect(latest?.hasActiveFilters).toBe(true);

    await actAndDrain(() => {
      latest?.clearAllFilters();
    });
    expect(latest?.hasActiveFilters).toBe(false);
  });

  test('applyDateRange invierte fechas si to < from', async () => {
    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****8829',
              accountKind: 'savings',
              balance: 1,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: jest.fn().mockResolvedValue({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 20,
          items: [],
        }),
      },
    } as never);

    await mountHarness(<Harness />);

    await actAndDrain(() => {
      latest?.applyDateRange(new Date(2026, 5, 20), new Date(2026, 5, 10));
    });

    expect(latest?.dateFilterLabel).toMatch(/10/);
    expect(latest?.dateFilterLabel).toMatch(/20/);
  });

  test('applyAmountRange ignora rangos inválidos', async () => {
    mockedUseDI.mockReturnValue({
      getHomeContractBalanceUseCase: {
        execute: jest.fn().mockResolvedValue({
          accounts: [
            {
              accountGuid: 'acc-1',
              maskedAccountNumber: '****8829',
              accountKind: 'savings',
              balance: 1,
            },
          ],
          creditCards: [],
          loans: [],
          investments: [],
          frequentPayments: [],
          banners: [],
          homeDashboardIcons: [],
          recentTransactions: [],
        }),
      },
      getAccountMovementsUseCase: {
        execute: jest.fn().mockResolvedValue({
          totalCount: 0,
          pageNumber: 1,
          pageSize: 20,
          items: [],
        }),
      },
    } as never);

    await mountHarness(<Harness />);

    const execBefore = (
      mockedUseDI().getAccountMovementsUseCase as {execute: jest.Mock}
    ).execute.mock.calls.length;

    await actAndDrain(() => {
      latest?.applyAmountRange(100, 50);
    });

    const execAfter = (
      mockedUseDI().getAccountMovementsUseCase as {execute: jest.Mock}
    ).execute.mock.calls.length;
    expect(execAfter).toBe(execBefore);
  });
});
