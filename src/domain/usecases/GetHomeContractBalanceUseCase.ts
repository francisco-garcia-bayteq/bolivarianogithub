import {ContractBalance} from '../entities/ContractBalance';
import {ContractBalanceRepository} from '../repositories/ContractBalanceRepository';

export class GetHomeContractBalanceUseCase {
  constructor(
    private readonly contractBalanceRepository: ContractBalanceRepository,
  ) {}

  async execute(): Promise<ContractBalance> {
    return this.contractBalanceRepository.getHomeBalance();
  }
}
