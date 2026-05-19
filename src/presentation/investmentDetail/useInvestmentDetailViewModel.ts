import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useDI} from '../../di';
import type {InvestmentBalance} from '../../domain/entities/ContractBalance';
import type {InvestmentDetail} from '../../domain/entities/InvestmentDetail';
import {HOME_CONTRACT_BALANCE_QUERY_KEY} from '../home/useHomeViewModel';
import {buildInvestmentDetail} from './buildInvestmentDetail';

export function useInvestmentDetailViewModel(
  investmentGuid: string,
  investmentBalanceFromRoute?: InvestmentBalance,
) {
  const {getHomeContractBalanceUseCase} = useDI();

  const query = useQuery({
    queryKey: HOME_CONTRACT_BALANCE_QUERY_KEY,
    queryFn: () => getHomeContractBalanceUseCase.execute(),
  });

  const detail: InvestmentDetail | null = useMemo(() => {
    if (
      investmentBalanceFromRoute?.investmentGuid === investmentGuid
    ) {
      return buildInvestmentDetail(investmentBalanceFromRoute);
    }
    if (!query.data?.investments?.length) {
      return null;
    }
    const inv = query.data.investments.find(
      i => i.investmentGuid === investmentGuid,
    );
    if (!inv) {
      return null;
    }
    return buildInvestmentDetail(inv);
  }, [investmentBalanceFromRoute, investmentGuid, query.data]);

  const errorMessage = useMemo(() => {
    if (query.error) {
      return query.error instanceof Error
        ? query.error.message
        : 'No se pudo cargar la información.';
    }
    if (!query.isLoading && query.data !== undefined && !detail) {
      return 'No se encontró la inversión.';
    }
    return '';
  }, [detail, query.data, query.error, query.isLoading]);

  return {
    detail,
    isLoading: query.isLoading,
    errorMessage,
  };
}
