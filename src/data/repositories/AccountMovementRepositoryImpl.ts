import {AccountMovementRepository} from '../../domain/repositories/AccountMovementRepository';
import type {
  GetAccountMovementsParams,
  AccountMovementsPage,
} from '../../domain/repositories/AccountMovementRepository';
import {TransactionListRemoteDataSource} from '../datasources/transaction/TransactionListRemoteDataSource';
import {mapTransactionListItemsToEntities} from '../mappers/accountMovementMapper';

/** Representación decimal sin separadores de miles para query string. */
function amountToQueryString(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return String(value);
}

export class AccountMovementRepositoryImpl implements AccountMovementRepository {
  constructor(
    private readonly remoteDataSource: TransactionListRemoteDataSource,
  ) {}

  async getMovements(params: GetAccountMovementsParams): Promise<AccountMovementsPage> {
    const content = await this.remoteDataSource.getTransactionPage({
      AccountGuid: params.accountGuid,
      DateFrom: params.dateFrom,
      DateTo: params.dateTo,
      TransactionType: params.transactionType,
      TextSearch: params.textSearch,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      ...(params.minAmount === undefined
        ? {}
        : {MinAmount: amountToQueryString(params.minAmount)}),
      ...(params.maxAmount === undefined
        ? {}
        : {MaxAmount: amountToQueryString(params.maxAmount)}),
    });

    return {
      totalCount: content.totalCount,
      pageNumber: content.pageNumber,
      pageSize: content.pageSize,
      items: mapTransactionListItemsToEntities(content.items),
    };
  }
}
