import {BeneficiaryRemoteDataSource} from '../../../data/datasources/beneficiary';
import {ContractBalanceRemoteDataSource} from '../../../data/datasources/contractBalance';
import {TransferRemoteDataSource} from '../../../data/datasources/transaction';
import type {HttpClient} from '../../../data/api/HttpClient';
import {BeneficiaryRepositoryImpl} from '../../../data/repositories/BeneficiaryRepositoryImpl';
import {ContractBalanceRepositoryImpl} from '../../../data/repositories/ContractBalanceRepositoryImpl';
import {TransferRepositoryImpl} from '../../../data/repositories/TransferRepositoryImpl';
import type {SecurityRepository} from '../../../domain/repositories/SecurityRepository';
import {ExecuteTransferUseCase} from '../../../domain/usecases/ExecuteTransferUseCase';
import {GetBeneficiaryContactsUseCase} from '../../../domain/usecases/GetBeneficiaryContactsUseCase';
import {GetHomeContractBalanceUseCase} from '../../../domain/usecases/GetHomeContractBalanceUseCase';
import {ValidateTransactionAmountUseCase} from '../../../domain/usecases/ValidateTransactionAmountUseCase';

export interface TransferFeatureModule {
  getHomeContractBalanceUseCase: GetHomeContractBalanceUseCase;
  getBeneficiaryContactsUseCase: GetBeneficiaryContactsUseCase;
  validateTransactionAmountUseCase: ValidateTransactionAmountUseCase;
  executeTransferUseCase: ExecuteTransferUseCase;
}

export function createTransferFeatureModule(
  httpClient: HttpClient,
  securityRepository: SecurityRepository,
): TransferFeatureModule {
  const contractBalanceRemoteDataSource = new ContractBalanceRemoteDataSource(
    httpClient,
  );
  const beneficiaryRemoteDataSource = new BeneficiaryRemoteDataSource(
    httpClient,
  );
  const transferRemoteDataSource = new TransferRemoteDataSource(httpClient);

  const contractBalanceRepository = new ContractBalanceRepositoryImpl(
    contractBalanceRemoteDataSource,
  );
  const beneficiaryRepository = new BeneficiaryRepositoryImpl(
    beneficiaryRemoteDataSource,
  );
  const transferRepository = new TransferRepositoryImpl(transferRemoteDataSource);

  const getHomeContractBalanceUseCase = new GetHomeContractBalanceUseCase(
    contractBalanceRepository,
  );
  const getBeneficiaryContactsUseCase = new GetBeneficiaryContactsUseCase(
    beneficiaryRepository,
  );
  const validateTransactionAmountUseCase = new ValidateTransactionAmountUseCase(
    securityRepository,
  );
  const executeTransferUseCase = new ExecuteTransferUseCase(transferRepository);

  return {
    getHomeContractBalanceUseCase,
    getBeneficiaryContactsUseCase,
    validateTransactionAmountUseCase,
    executeTransferUseCase,
  };
}
