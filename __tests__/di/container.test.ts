jest.mock('react-native-view-shot', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props: object, ref: unknown) =>
      React.createElement(View, {...props, ref}),
    ),
  };
});

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn().mockResolvedValue(undefined),
  },
}));

import {createContainer} from '../../src/di/container';

describe('createContainer', () => {
  it('construye un contenedor con todos los casos de uso y servicios esperados', () => {
    const c = createContainer();
    expect(c.loginUseCase).toBeDefined();
    expect(c.getAccountMovementsUseCase).toBeDefined();
    expect(c.runCertificateHandshakeUseCase).toBeDefined();
    expect(c.getPublicKeyUseCase).toBeDefined();
    expect(c.secureStorageService).toBeDefined();
    expect(c.biometricAuthService).toBeDefined();
    expect(c.authRemoteDataSource).toBeDefined();
    expect(c.getUserLoggedUseCase).toBeDefined();
    expect(c.validateOtpUseCase).toBeDefined();
    expect(c.getHomeContractBalanceUseCase).toBeDefined();
    expect(c.getBeneficiaryContactsUseCase).toBeDefined();
    expect(c.validateTransactionAmountUseCase).toBeDefined();
    expect(c.executeTransferUseCase).toBeDefined();
    expect(c.biometricRSAAuthOrchestrator).toBeDefined();
    expect(c.deviceSecurityService).toBeDefined();
  });
});
