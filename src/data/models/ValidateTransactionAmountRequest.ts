export interface ValidateTransactionAmountRequest {
  amount: number;
  beneficiaryContactGuid: string;
  accountGuid: string;
  concept: string;
}
