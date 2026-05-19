import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import {DIProvider, useDI} from '../../src/di/DIProvider';
import type {AppContainer} from '../../src/di/container';

const mockCreateContainer = jest.fn();
const mockEnsureDeviceId = jest.fn();

jest.mock('../../src/di/container', () => ({
  createContainer: () => mockCreateContainer(),
}));

jest.mock('../../src/data/bootstrap/ensureDeviceId', () => ({
  ensureDeviceId: (...args: unknown[]) => mockEnsureDeviceId(...args),
}));

function minimalContainer(): AppContainer {
  return {
    loginUseCase: {} as AppContainer['loginUseCase'],
    getAccountMovementsUseCase: {} as AppContainer['getAccountMovementsUseCase'],
    runCertificateHandshakeUseCase:
      {} as AppContainer['runCertificateHandshakeUseCase'],
    getPublicKeyUseCase: {} as AppContainer['getPublicKeyUseCase'],
    secureStorageService: {id: 'ss'} as AppContainer['secureStorageService'],
    biometricAuthService: {} as AppContainer['biometricAuthService'],
    authRemoteDataSource: {} as AppContainer['authRemoteDataSource'],
    getUserLoggedUseCase: {} as AppContainer['getUserLoggedUseCase'],
    validateOtpUseCase: {} as AppContainer['validateOtpUseCase'],
    getHomeContractBalanceUseCase:
      {} as AppContainer['getHomeContractBalanceUseCase'],
    getBeneficiaryContactsUseCase:
      {} as AppContainer['getBeneficiaryContactsUseCase'],
    validateTransactionAmountUseCase:
      {} as AppContainer['validateTransactionAmountUseCase'],
    executeTransferUseCase: {} as AppContainer['executeTransferUseCase'],
    biometricRSAAuthOrchestrator:
      {} as AppContainer['biometricRSAAuthOrchestrator'],
    deviceSecurityService: {} as AppContainer['deviceSecurityService'],
  };
}

describe('DIProvider y useDI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateContainer.mockReturnValue(minimalContainer());
    mockEnsureDeviceId.mockResolvedValue(undefined);
  });

  it('provee el contenedor a los hijos y llama ensureDeviceId al montar', async () => {
    let resolved: AppContainer | undefined;
    function Child() {
      resolved = useDI();
      return <Text>ok</Text>;
    }

    await act(async () => {
      ReactTestRenderer.create(
        <DIProvider>
          <Child />
        </DIProvider>,
      );
    });

    expect(resolved).toBeDefined();
    expect(resolved?.secureStorageService).toEqual({id: 'ss'});
    expect(mockCreateContainer).toHaveBeenCalledTimes(1);
    expect(mockEnsureDeviceId).toHaveBeenCalledWith({id: 'ss'});
  });

  it('useDI fuera de DIProvider expone mensaje de error claro', () => {
    let caught = '';
    function Bad() {
      try {
        useDI();
      } catch (e) {
        caught = (e as Error).message;
      }
      return null;
    }
    act(() => {
      ReactTestRenderer.create(<Bad />);
    });
    expect(caught).toBe('useDI must be used within a DIProvider');
  });

  it('ensureDeviceId rechazado no rompe el montaje', async () => {
    mockEnsureDeviceId.mockRejectedValueOnce(new Error('device'));
    await act(async () => {
      ReactTestRenderer.create(
        <DIProvider>
          <Text>x</Text>
        </DIProvider>,
      );
    });
    expect(mockEnsureDeviceId).toHaveBeenCalled();
  });
});
