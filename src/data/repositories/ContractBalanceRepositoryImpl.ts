import {ContractBalance} from '../../domain/entities/ContractBalance';
import {ContractBalanceRepository} from '../../domain/repositories/ContractBalanceRepository';
import {ContractBalanceDataSource} from '../datasources/contractBalance/ContractBalanceDataSource';
import {mapContractBalanceContentToEntity} from '../mappers/contractBalanceMapper';

export class ContractBalanceRepositoryImpl implements ContractBalanceRepository {
  constructor(private readonly dataSource: ContractBalanceDataSource) {}

  async getHomeBalance(): Promise<ContractBalance> {
    const content = await this.dataSource.getHome();
    return mapContractBalanceContentToEntity(content);
  }
}
