export interface TransferExecution {
  transactionIdentifier: string;
}

export type ExecuteTransferParams = {
  amount: number;
  beneficiaryContactGuid: string;
  accountGuid: string;
  concept: string;
};
