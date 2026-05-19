import {Otp} from '../entities/Otp';
import type {RegisterAliasResult} from '../entities/RegisterAliasResult';
import {PublicKey} from '../entities/PublicKey';
import {
  TransactionAmountValidation,
  ValidateTransactionAmountParams,
} from '../entities/TransactionAmountValidation';

export interface SecurityRepository {
  getPublicKey(): Promise<PublicKey>;
  validateOtp(otp: string): Promise<Otp>;
  registerAlias(encryptedAlias: string): Promise<RegisterAliasResult>;
  validateTransactionAmount(
    input: ValidateTransactionAmountParams,
  ): Promise<TransactionAmountValidation>;
}
