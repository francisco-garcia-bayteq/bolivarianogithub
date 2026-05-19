import {TransactionModel} from '../models/TransactionModel';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
} from '../../domain/entities/Transaction';

export function mapTransactionModelToEntity(
  model: TransactionModel,
): Transaction {
  return {
    id: model.id,
    description: model.description,
    amount: model.amount,
    date: model.date,
    type: model.type as TransactionType,
    category: model.category as TransactionCategory,
    status: model.status as TransactionStatus,
  };
}

export function mapTransactionModelsToEntities(
  models: TransactionModel[],
): Transaction[] {
  return models.map(mapTransactionModelToEntity);
}
