import {v4 as uuidv4} from 'uuid';
import {LoginUseCase} from '../domain/usecases/LoginUseCase';
import {GetAccountMovementsUseCase} from '../domain/usecases/GetAccountMovementsUseCase';
import {RunCertificateHandshakeUseCase} from '../domain/usecases/RunCertificateHandshakeUseCase';
import {GetPublicKeyUseCase} from '../domain/usecases/GetPublicKeyUseCase';
import {SecureStorageService} from '../domain/services/SecureStorageService';
import {BiometricAuthService} from '../domain/services/BiometricAuthService';
import type {DeviceSecurityService} from '../domain/services/DeviceSecurityService';

import {API_BASE_URL} from '../config/apiEnvironment';
import {AxiosHttpClient} from '../data/api/apiClient';
import {AuthRepositoryImpl} from '../data/repositories/AuthRepositoryImpl';
import {AccountMovementRepositoryImpl} from '../data/repositories/AccountMovementRepositoryImpl';
import {SecurityRepositoryImpl} from '../data/repositories/SecurityRepositoryImpl';
import {AuthRemoteDataSource} from '../data/datasources/auth';
import {SecurityRemoteDataSource} from '../data/datasources/security';
import {TransactionListRemoteDataSource} from '../data/datasources/transaction/TransactionListRemoteDataSource';
import {SecureStorageKeys} from '../data/datasources/storage';
import {SecureStorageServiceImpl} from '../data/services/SecureStorageServiceImpl';
import {ServerPublicKeySessionStoreImpl} from '../data/services/ServerPublicKeySessionStoreImpl';
import {CertificateHandshakePersistenceServiceImpl} from '../data/services/CertificateHandshakePersistenceServiceImpl';
import {BiometricAuthServiceImpl} from '../data/services/BiometricAuthServiceImpl';
import {DeviceSecurityServiceImpl} from '../data/services/DeviceSecurityServiceImpl';
import {createApiSecretKey} from '../security/http';
import {SERVER_PUBLIC_KEY_PEM_BASE64} from '../security/certificate';
import {GetUserLoggedUseCase} from '../domain/usecases/GetUserLoggedUseCase';
import {ValidateOtpUseCase} from '../domain/usecases/ValidateOtpUseCase';
import {RegisterAliasUseCase} from '../domain/usecases/RegisterAliasUseCase';
import {GetHomeContractBalanceUseCase} from '../domain/usecases/GetHomeContractBalanceUseCase';
import {GetBeneficiaryContactsUseCase} from '../domain/usecases/GetBeneficiaryContactsUseCase';
import {ValidateTransactionAmountUseCase} from '../domain/usecases/ValidateTransactionAmountUseCase';
import {ExecuteTransferUseCase} from '../domain/usecases/ExecuteTransferUseCase';
import {createTransferFeatureModule} from '../features/transfer';
import {BiometricRemoteDataSource} from '../data/datasources/biometric';
import {
  BiometricRSAAuthOrchestrator,
  BiometricEnrollmentBinding,
  CryptoService,
  BiometricKeyStorageService,
} from '../security/biometric';

export interface AppContainer {
  loginUseCase: LoginUseCase;
  getAccountMovementsUseCase: GetAccountMovementsUseCase;
  runCertificateHandshakeUseCase: RunCertificateHandshakeUseCase;
  getPublicKeyUseCase: GetPublicKeyUseCase;
  secureStorageService: SecureStorageService;
  biometricAuthService: BiometricAuthService;
  authRemoteDataSource: AuthRemoteDataSource;
  getUserLoggedUseCase: GetUserLoggedUseCase;
  validateOtpUseCase: ValidateOtpUseCase;
  registerAliasUseCase: RegisterAliasUseCase;
  getHomeContractBalanceUseCase: GetHomeContractBalanceUseCase;
  getBeneficiaryContactsUseCase: GetBeneficiaryContactsUseCase;
  validateTransactionAmountUseCase: ValidateTransactionAmountUseCase;
  executeTransferUseCase: ExecuteTransferUseCase;
  biometricRSAAuthOrchestrator: BiometricRSAAuthOrchestrator;
  deviceSecurityService: DeviceSecurityService;
}

export function createContainer(): AppContainer {
  const secureStorageService = new SecureStorageServiceImpl();
  const serverPublicKeySessionStore = new ServerPublicKeySessionStoreImpl();
  const deviceSecurityService = new DeviceSecurityServiceImpl();
  const secretKey = createApiSecretKey();
  const requestId = uuidv4();

  const httpClient = new AxiosHttpClient({
    baseURL: API_BASE_URL,
    secretKey,
    requestId,
    secureStorage: secureStorageService,
    serverPublicKeySessionStore,
    serverPublicPemBase64: SERVER_PUBLIC_KEY_PEM_BASE64,
    deviceSecurityService,
  });

  const biometricAuthService = new BiometricAuthServiceImpl();
  const authRemoteDataSource = new AuthRemoteDataSource(httpClient);
  const securityRemoteDataSource = new SecurityRemoteDataSource(httpClient);
  const transactionListRemoteDataSource = new TransactionListRemoteDataSource(
    httpClient,
  );
  const biometricRemoteDataSource = new BiometricRemoteDataSource(httpClient);

  const authRepository = new AuthRepositoryImpl(authRemoteDataSource);
  const securityRepository = new SecurityRepositoryImpl(securityRemoteDataSource);
  const accountMovementRepository = new AccountMovementRepositoryImpl(
    transactionListRemoteDataSource,
  );
  const transferFeature = createTransferFeatureModule(
    httpClient,
    securityRepository,
  );

  const getPublicKeyUseCase = new GetPublicKeyUseCase(
    securityRepository,
    serverPublicKeySessionStore,
  );

  const certificateHandshakePersistenceService =
    new CertificateHandshakePersistenceServiceImpl(secureStorageService);
  const runCertificateHandshakeUseCase = new RunCertificateHandshakeUseCase(
    securityRemoteDataSource,
    certificateHandshakePersistenceService,
  );

  const loginUseCase = new LoginUseCase(
    authRepository,
    secureStorageService,
    SecureStorageKeys.USER_LOGIN_DATA,
    runCertificateHandshakeUseCase,
    getPublicKeyUseCase,
    SecureStorageKeys.AUTH_TOKEN,
  );

  const getUserLoggedUseCase = new GetUserLoggedUseCase(
    secureStorageService,
    SecureStorageKeys.USER_LOGIN_DATA,
  );

  const getAccountMovementsUseCase = new GetAccountMovementsUseCase(
    accountMovementRepository,
  );

  const cryptoService = new CryptoService();
  const biometricKeyStorageService = new BiometricKeyStorageService(
    secureStorageService,
    biometricAuthService,
  );
  const biometricEnrollmentBinding = new BiometricEnrollmentBinding(
    secureStorageService,
  );
  const biometricRSAAuthOrchestrator = new BiometricRSAAuthOrchestrator(
    biometricRemoteDataSource,
    cryptoService,
    biometricKeyStorageService,
    secureStorageService,
    runCertificateHandshakeUseCase,
    getPublicKeyUseCase,
    biometricAuthService,
    biometricEnrollmentBinding,
  );

  const validateOtpUseCase = new ValidateOtpUseCase(
    securityRepository,
    getPublicKeyUseCase,
  );

  const registerAliasUseCase = new RegisterAliasUseCase(
    securityRepository,
    getPublicKeyUseCase,
  );

  const {
    getHomeContractBalanceUseCase,
    getBeneficiaryContactsUseCase,
    validateTransactionAmountUseCase,
    executeTransferUseCase,
  } = transferFeature;

  return {
    loginUseCase,
    getAccountMovementsUseCase,
    runCertificateHandshakeUseCase,
    getPublicKeyUseCase,
    secureStorageService,
    biometricAuthService,
    authRemoteDataSource,
    getUserLoggedUseCase,
    validateOtpUseCase,
    registerAliasUseCase,
    getHomeContractBalanceUseCase,
    getBeneficiaryContactsUseCase,
    validateTransactionAmountUseCase,
    executeTransferUseCase,
    biometricRSAAuthOrchestrator,
    deviceSecurityService,
  };
}
