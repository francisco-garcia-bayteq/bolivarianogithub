import {TransactionModel} from '../../models/TransactionModel';
import {TransactionDataSource} from './TransactionDataSource';
import {TransferContentModel} from "../../models/TransferContentModel.ts";
import {TransferRequest} from "../../models/TransferRequest.ts";

const MOCK_TRANSACTIONS: TransactionModel[] = [
  {
    id: '2',
    description: 'Supermercado La Comer',
    amount: 1250.5,
    date: '2026-03-27',
    type: 'expense',
    category: 'food',
    status: 'completed',
    createdAt: '2026-03-27T14:30:00Z',
    updatedAt: '2026-03-27T14:30:00Z',
    userId: 'usr_001',
    reference: 'POS-87623',
    metadata: {terminal: 'T-042', merchant: 'La Comer Sucursal Centro'},
  }
];

const SIMULATED_DELAY_MS = 1000;

export class MockTransactionDataSource implements TransactionDataSource {
  async getTransactions(): Promise<TransactionModel[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_TRANSACTIONS);
      }, SIMULATED_DELAY_MS);
    });
  }

  transfer(_: TransferRequest): Promise<TransferContentModel> {
    return Promise.resolve({transactionIdentifier:''});
  }
}
