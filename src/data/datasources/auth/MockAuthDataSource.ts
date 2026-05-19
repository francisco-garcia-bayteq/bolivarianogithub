import {LoginRequestModel} from '../../models/LoginRequestModel';
import {LoginResponseModel} from '../../models/LoginResponseModel';
import {AuthDataSource} from './AuthDataSource';

const MOCK_CREDENTIALS = {
  username: 'usuario-demo12',
  password: '123456',
};

const MOCK_USER_RESPONSE: LoginResponseModel = {
  accessToken: 'mock-jwt-token-xyz123',
  firstName: 'Demo',
  alias: null,
  sessionTimeSeconds: 3600,
  inactivityTimeoutSeconds: 300,
};

const SIMULATED_DELAY_MS = 1500;

/** Credenciales en texto plano; no coincide con el flujo real que usa `LoginUseCase` + cifrado RSA. */
export class MockAuthDataSource implements AuthDataSource {
  async login(request: LoginRequestModel): Promise<LoginResponseModel> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          request.username === MOCK_CREDENTIALS.username &&
          request.password === MOCK_CREDENTIALS.password
        ) {
          resolve(MOCK_USER_RESPONSE);
        } else {
          reject(new Error('Credenciales inválidas'));
        }
      }, SIMULATED_DELAY_MS);
    });
  }
}
