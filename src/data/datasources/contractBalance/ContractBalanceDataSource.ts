import {ContractBalanceContentModel} from '../../models/ContractBalanceContentModel';

export interface ContractBalanceDataSource {
  getHome(): Promise<ContractBalanceContentModel>;
}
