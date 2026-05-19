import {SecurityRepository} from '../repositories/SecurityRepository';
import {
  TransactionAmountValidation,
  ValidateTransactionAmountParams,
} from '../entities/TransactionAmountValidation';

export class ValidateTransactionAmountUseCase {
  constructor(private readonly securityRepository: SecurityRepository) {}

  execute(
    input: ValidateTransactionAmountParams,
  ): Promise<TransactionAmountValidation> {
    return this.securityRepository.validateTransactionAmount(input);
  }
}
