import {TransactionModel} from '../../models/TransactionModel';
import { TransferContentModel } from '../../models/TransferContentModel';
import { TransferRequest } from '../../models/TransferRequest';

export interface TransactionDataSource {
  getTransactions(): Promise<TransactionModel[]>;
  transfer(request: TransferRequest): Promise<TransferContentModel>;
}
