export interface TransactionAmountValidation {
  isValid: boolean;
}

export type ValidateTransactionAmountParams = {
  amount: number;
  beneficiaryGuid: string;
  accountGuid: string;
  concept: string;
};
