import {useState, useCallback, useEffect, useMemo} from 'react';
import type {AccountBalance} from '../../domain/entities/ContractBalance';
import type {AccountMovement} from '../../domain/entities/AccountMovement';
import {useDI} from '../../di';
import {formatCurrency} from './TransactionItem';
import {
  labelForMovementEnumType,
  type MovementTransactionEnumType,
} from './transactionTypeFilterOptions';

export type {MovementTransactionEnumType} from './transactionTypeFilterOptions';

const PAGE_SIZE = 20;

/** Retraso antes de consultar el API al escribir en el buscador (evita ráfagas). */
const MOVEMENTS_SEARCH_DEBOUNCE_MS = 400;

/** Máximo absoluto alineado con reglas de transferencia (README). */
export const MAX_MOVEMENTS_FILTER_AMOUNT = 999_999_999.99;

/** Rango aplicado al API (fechas locales normalizadas a medianoche). */
export type AppliedDateRange = {
  from: Date;
  to: Date;
};

export type AppliedAmountRange = {
  min: number;
  max: number;
};

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalDateKey(key: string): Date {
  const [ys, ms, ds] = key.split('-');
  return new Date(Number(ys), Number(ms) - 1, Number(ds));
}

function normalizeDateOnly(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoStartOfDay(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function isoEndOfDay(d: Date): string {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function rangeKeysToQuery(range: {from: string; to: string} | null): {
  dateFrom?: string;
  dateTo?: string;
} {
  if (!range) {
    return {};
  }
  const fromD = parseLocalDateKey(range.from);
  const toD = parseLocalDateKey(range.to);
  return {
    dateFrom: isoStartOfDay(fromD),
    dateTo: isoEndOfDay(toD),
  };
}

function buildMovementsQuery(
  dateKeys: {from: string; to: string} | null,
  amountRange: AppliedAmountRange | null,
  movementTransactionType: MovementTransactionEnumType | null,
  textSearch: string,
): {
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  transactionType?: string;
  textSearch?: string;
} {
  const dates = rangeKeysToQuery(dateKeys);
  let base: {
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    transactionType?: string;
    textSearch?: string;
  } = {...dates};
  if (amountRange) {
    base = {
      ...base,
      minAmount: amountRange.min,
      maxAmount: amountRange.max,
    };
  }
  if (movementTransactionType) {
    base = {...base, transactionType: movementTransactionType};
  }
  const trimmedSearch = textSearch.trim();
  if (trimmedSearch) {
    base = {...base, textSearch: trimmedSearch};
  }
  return base;
}

export function isValidMovementsAmountRange(min: number, max: number): boolean {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    return false;
  }
  if (
    min < -MAX_MOVEMENTS_FILTER_AMOUNT ||
    min > MAX_MOVEMENTS_FILTER_AMOUNT ||
    max < -MAX_MOVEMENTS_FILTER_AMOUNT ||
    max > MAX_MOVEMENTS_FILTER_AMOUNT
  ) {
    return false;
  }
  return true;
}

/** Evita filas duplicadas (misma respuesta o solapamiento al paginar). */
function dedupeAccountMovements(items: AccountMovement[]): AccountMovement[] {
  const map = new Map<string, AccountMovement>();
  for (const item of items) {
    const guid = item.transactionGuid?.trim();
    const key =
      guid ||
      `${item.transactionIdentifier}|${item.transferDate}|${item.amount}|${item.beneficiaryName}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return [...map.values()];
}

export function useAccountMovementsViewModel(accountGuidFromRoute?: string) {
  const {getHomeContractBalanceUseCase, getAccountMovementsUseCase} = useDI();

  const [selectedAccount, setSelectedAccount] = useState<AccountBalance | null>(
    null,
  );
  const [accountError, setAccountError] = useState<string | null>(null);
  const [items, setItems] = useState<AccountMovement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [appliedRangeKeys, setAppliedRangeKeys] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [appliedAmountRange, setAppliedAmountRange] =
    useState<AppliedAmountRange | null>(null);
  const [appliedEnumType, setAppliedEnumType] =
    useState<MovementTransactionEnumType | null>(null);

  const appliedDateRange = useMemo((): AppliedDateRange | null => {
    if (!appliedRangeKeys) {
      return null;
    }
    return {
      from: parseLocalDateKey(appliedRangeKeys.from),
      to: parseLocalDateKey(appliedRangeKeys.to),
    };
  }, [appliedRangeKeys]);

  const dateFilterLabel = useMemo(() => {
    if (!appliedRangeKeys) {
      return 'Fecha';
    }
    const fmt = new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return `${fmt.format(parseLocalDateKey(appliedRangeKeys.from))} - ${fmt.format(parseLocalDateKey(appliedRangeKeys.to))}`;
  }, [appliedRangeKeys]);

  const amountFilterLabel = useMemo(() => {
    if (!appliedAmountRange) {
      return 'Monto';
    }
    return `${formatCurrency(appliedAmountRange.min)} - ${formatCurrency(appliedAmountRange.max)}`;
  }, [appliedAmountRange]);

  const typeFilterLabel = useMemo(() => {
    if (!appliedEnumType) {
      return 'Tipo';
    }
    return labelForMovementEnumType(appliedEnumType);
  }, [appliedEnumType]);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearchText(searchQuery.trim());
    }, MOVEMENTS_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const resolveAccount = useCallback(
    async (guidParam?: string) => {
      setIsLoadingAccount(true);
      setAccountError(null);
      try {
        const data = await getHomeContractBalanceUseCase.execute();
        if (!data.accounts.length) {
          setSelectedAccount(null);
          setAccountError('No hay cuentas disponibles');
          return null;
        }
        const preferred = guidParam
          ? data.accounts.find(a => a.accountGuid === guidParam)
          : undefined;
        const acc = preferred ?? data.accounts[0];
        setSelectedAccount(acc);
        return acc;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar la cuenta';
        setAccountError(message);
        setSelectedAccount(null);
        return null;
      } finally {
        setIsLoadingAccount(false);
      }
    },
    [getHomeContractBalanceUseCase],
  );

  useEffect(() => {
    resolveAccount(accountGuidFromRoute).catch(() => {});
  }, [accountGuidFromRoute, resolveAccount]);

  const fetchPage = useCallback(
    async (
      account: AccountBalance,
      page: number,
      range: {
        dateFrom?: string;
        dateTo?: string;
        minAmount?: number;
        maxAmount?: number;
        transactionType?: string;
        textSearch?: string;
      },
      mode: 'replace' | 'append',
    ) => {
      if (page === 1 && mode === 'replace') {
        setIsLoadingMovements(true);
      } else if (page > 1) {
        setIsLoadingMore(true);
      }
      setMovementsError(null);
      try {
        const result = await getAccountMovementsUseCase.execute({
          accountGuid: account.accountGuid,
          ...range,
          pageNumber: page,
          pageSize: PAGE_SIZE,
        });
        setTotalCount(result.totalCount);
        setPageNumber(result.pageNumber);
        setItems(prev => {
          const merged =
            page === 1 || mode === 'replace'
              ? result.items
              : [...prev, ...result.items];
          return dedupeAccountMovements(merged);
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar movimientos';
        setMovementsError(message);
        if (page === 1) {
          setItems([]);
        }
      } finally {
        setIsLoadingMovements(false);
        setIsLoadingMore(false);
      }
    },
    [getAccountMovementsUseCase],
  );

  useEffect(() => {
    if (!selectedAccount || isLoadingAccount) {
      return;
    }
    const range = buildMovementsQuery(
      appliedRangeKeys,
      appliedAmountRange,
      appliedEnumType,
      debouncedSearchText,
    );
    fetchPage(selectedAccount, 1, range, 'replace').catch(() => {});
  }, [
    selectedAccount,
    isLoadingAccount,
    appliedRangeKeys,
    appliedAmountRange,
    appliedEnumType,
    debouncedSearchText,
    fetchPage,
  ]);

  const applyDateRange = useCallback((from: Date, to: Date) => {
    let f = normalizeDateOnly(from);
    let t = normalizeDateOnly(to);
    if (t < f) {
      const tmp = f;
      f = t;
      t = tmp;
    }
    setAppliedRangeKeys({from: localDateKey(f), to: localDateKey(t)});
  }, []);

  const clearDateRange = useCallback(() => {
    setAppliedRangeKeys(null);
  }, []);

  const applyAmountRange = useCallback((min: number, max: number) => {
    if (!isValidMovementsAmountRange(min, max)) {
      return;
    }
    setAppliedAmountRange({min, max});
  }, []);

  const clearAmountRange = useCallback(() => {
    setAppliedAmountRange(null);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const acc = await resolveAccount(accountGuidFromRoute);
      if (acc) {
        const range = buildMovementsQuery(
          appliedRangeKeys,
          appliedAmountRange,
          appliedEnumType,
          debouncedSearchText,
        );
        await fetchPage(acc, 1, range, 'replace');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [
    accountGuidFromRoute,
    appliedRangeKeys,
    appliedAmountRange,
    appliedEnumType,
    debouncedSearchText,
    resolveAccount,
    fetchPage,
  ]);

  const loadMore = useCallback(async () => {
    if (!selectedAccount || isLoadingMore || isLoadingMovements) {
      return;
    }
    if (items.length >= totalCount) {
      return;
    }
    const nextPage = pageNumber + 1;
    const range = buildMovementsQuery(
      appliedRangeKeys,
      appliedAmountRange,
      appliedEnumType,
      debouncedSearchText,
    );
    await fetchPage(selectedAccount, nextPage, range, 'append');
  }, [
    selectedAccount,
    isLoadingMore,
    isLoadingMovements,
    items.length,
    totalCount,
    pageNumber,
    appliedRangeKeys,
    appliedAmountRange,
    appliedEnumType,
    debouncedSearchText,
    fetchPage,
  ]);

  const applyTransactionEnumType = useCallback(
    (value: MovementTransactionEnumType | null) => {
      setAppliedEnumType(value);
    },
    [],
  );

  const clearTransactionEnumType = useCallback(() => {
    setAppliedEnumType(null);
  }, []);

  const clearAllFilters = useCallback(() => {
    setAppliedRangeKeys(null);
    setAppliedAmountRange(null);
    setAppliedEnumType(null);
    setSearchQuery('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    if (searchQuery.trim()) {
      return true;
    }
    if (appliedRangeKeys !== null) {
      return true;
    }
    if (appliedAmountRange !== null) {
      return true;
    }
    if (appliedEnumType !== null) {
      return true;
    }
    return false;
  }, [
    searchQuery,
    appliedRangeKeys,
    appliedAmountRange,
    appliedEnumType,
  ]);

  return {
    selectedAccount,
    accountError,
    isLoadingAccount,
    items,
    rawCount: items.length,
    totalCount,
    isLoadingMovements,
    isLoadingMore,
    isRefreshing,
    movementsError,
    searchQuery,
    setSearchQuery,
    appliedDateRange,
    dateFilterLabel,
    applyDateRange,
    clearDateRange,
    appliedAmountRange,
    amountFilterLabel,
    applyAmountRange,
    clearAmountRange,
    appliedEnumType,
    typeFilterLabel,
    applyTransactionEnumType,
    clearTransactionEnumType,
    clearAllFilters,
    hasActiveFilters,
    refresh,
    loadMore,
    hasMore: selectedAccount !== null && items.length < totalCount,
  };
}
