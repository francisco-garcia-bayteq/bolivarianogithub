import {AccountMovementRepository} from '../repositories/AccountMovementRepository';
import type {
  GetAccountMovementsParams,
  AccountMovementsPage,
} from '../repositories/AccountMovementRepository';

export class GetAccountMovementsUseCase {
  constructor(private readonly repository: AccountMovementRepository) {}

  execute(params: GetAccountMovementsParams): Promise<AccountMovementsPage> {
    return this.repository.getMovements(params);
  }
}
