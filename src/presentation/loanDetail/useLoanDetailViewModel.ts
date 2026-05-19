import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useDI} from '../../di';
import type {LoanBalance} from '../../domain/entities/ContractBalance';
import type {LoanDetail} from '../../domain/entities/LoanDetail';
import {HOME_CONTRACT_BALANCE_QUERY_KEY} from '../home/useHomeViewModel';
import {buildLoanDetail} from './buildLoanDetail';

export function useLoanDetailViewModel(
  loanGuid: string,
  loanBalanceFromRoute?: LoanBalance,
) {
  const {getHomeContractBalanceUseCase} = useDI();

  const query = useQuery({
    queryKey: HOME_CONTRACT_BALANCE_QUERY_KEY,
    queryFn: () => getHomeContractBalanceUseCase.execute(),
  });

  const detail: LoanDetail | null = useMemo(() => {
    if (loanBalanceFromRoute?.loanGuid === loanGuid) {
      return buildLoanDetail(loanBalanceFromRoute);
    }
    if (!query.data?.loans?.length) {
      return null;
    }
    const loan = query.data.loans.find(l => l.loanGuid === loanGuid);
    if (!loan) {
      return null;
    }
    return buildLoanDetail(loan);
  }, [loanBalanceFromRoute, loanGuid, query.data]);

  const errorMessage = useMemo(() => {
    if (query.error) {
      return query.error instanceof Error
        ? query.error.message
        : 'No se pudo cargar la información.';
    }
    if (!query.isLoading && query.data !== undefined && !detail) {
      return 'No se encontró el préstamo.';
    }
    return '';
  }, [detail, query.data, query.error, query.isLoading]);

  return {
    detail,
    isLoading: query.isLoading,
    errorMessage,
  };
}
