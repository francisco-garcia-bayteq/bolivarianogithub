import {
  ExecuteTransferParams,
  TransferExecution,
} from '../../domain/entities/TransferExecution';
import {TransferRepository} from '../../domain/repositories/TransferRepository';
import {TransferRemoteDataSource} from '../datasources/transaction/TransferRemoteDataSource';

export class TransferRepositoryImpl implements TransferRepository {
  constructor(private readonly remoteDataSource: TransferRemoteDataSource) {}

  async executeTransfer(params: ExecuteTransferParams): Promise<TransferExecution> {
    const content = await this.remoteDataSource.transfer({
      amount: params.amount,
      beneficiaryContactGuid: params.beneficiaryContactGuid,
      accountGuid: params.accountGuid,
      concept: params.concept,
    });
    return {transactionIdentifier: content.transactionIdentifier};
  }
}
