import type {AccountApiAccountKind, AccountMovement} from '../../domain/entities/AccountMovement';
import {parseAccountMovementTransactionType} from '../../domain/entities/AccountMovementTransactionType';
import {TransactionListItemApiModel} from '../models/TransactionListApiModels';

function parseAccountKind(raw: string | null | undefined): AccountApiAccountKind {
  if (raw === 'Checking' || raw === 'Savings') {
    return raw;
  }
  return 'Savings';
}

export function mapTransactionListItemToEntity(
  model: TransactionListItemApiModel,
): AccountMovement {
  return {
    transactionGuid: model.transactionGuid,
    transactionIdentifier: model.transactionIdentifier ?? '',
    beneficiaryName: model.beneficiaryName ?? '',
    beneficiaryAccountType: parseAccountKind(model.beneficiaryAccountType),
    beneficiaryAccountTypeLabel: model.beneficiaryAccountTypeLabel ?? '',
    beneficiaryAccountNumber: model.beneficiaryAccountNumber ?? '',
    ownerAccountLabel: model.ownerAccountLabel ?? '',
    ownerAccountType: parseAccountKind(model.ownerAccountType),
    accountNumber: model.accountNumber ?? '',
    accountType: parseAccountKind(model.accountType),
    accountTypeLabel: model.accountTypeLabel ?? '',
    amount: model.amount,
    transferDate: model.transferDate,
    transactionTypeLabel: model.transactionTypeLabel ?? '',
    transactionType: parseAccountMovementTransactionType(model.transactionType),
    concept: model.concept,
    balanceAfterTransaction: model.balanceAfterTransaction ?? 0,
    allowedShared: model.allowedShared ?? false,
  };
}

export function mapTransactionListItemsToEntities(
  models: TransactionListItemApiModel[],
): AccountMovement[] {
  return models.map(mapTransactionListItemToEntity);
}
