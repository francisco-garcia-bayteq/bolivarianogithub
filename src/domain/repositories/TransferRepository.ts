import {
  ExecuteTransferParams,
  TransferExecution,
} from '../entities/TransferExecution';

export interface TransferRepository {
  executeTransfer(params: ExecuteTransferParams): Promise<TransferExecution>;
}
