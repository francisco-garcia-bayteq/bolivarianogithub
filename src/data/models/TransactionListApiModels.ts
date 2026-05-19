export interface TransactionListItemApiModel {
  transactionGuid: string;
  transactionIdentifier: string | null;
  beneficiaryName: string | null;
  beneficiaryAccountType: string;
  beneficiaryAccountTypeLabel: string | null;
  beneficiaryAccountNumber: string | null;
  ownerAccountType: string;
  ownerAccountLabel: string | null;
  accountNumber: string | null;
  accountType: string;
  accountTypeLabel: string | null;
  amount: number;
  transferDate: string;
  transactionTypeLabel: string | null;
  transactionType: string;
  concept: string | null;
  balanceAfterTransaction: number | null;
  allowedShared?: boolean;
}

export interface TransactionListContentApiModel {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  items: TransactionListItemApiModel[];
}
