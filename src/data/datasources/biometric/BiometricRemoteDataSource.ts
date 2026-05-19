import {HttpClient} from '../../api/HttpClient';
import {ApiResponseModel} from '../../models/ApiResponseModel';
import type {
  BiometricChallengeContent,
  BiometricChallengeRequest,
  BiometricLoginContent,
  BiometricLoginRequest,
  BiometricRegistrationRequest,
} from '../../models/BiometricApiModels';

export class BiometricRemoteDataSource {
  constructor(private readonly httpClient: HttpClient) {}

  async postBiometricChallenge(
    body: BiometricChallengeRequest,
  ): Promise<BiometricChallengeContent> {
    const response = await this.httpClient.post<
      ApiResponseModel<BiometricChallengeContent>
    >('Security/biometric-challenge', body);

    if (response.data.responseType === 'Error' || !response.data.content?.challenge) {
      throw new Error(
        response.data.message || 'No se pudo obtener el challenge biométrico',
      );
    }

    return response.data.content;
  }

  async postBiometricRegistration(
    body: BiometricRegistrationRequest,
  ): Promise<void> {
    const response = await this.httpClient.post<ApiResponseModel<unknown>>(
      'Security/biometric-registration',
      body,
    );

    if (response.data.responseType === 'Error') {
      throw new Error(
        response.data.message || 'No se pudo completar el registro biométrico',
      );
    }
  }

  async postBiometricLogin(
    body: BiometricLoginRequest,
  ): Promise<BiometricLoginContent> {
    const response = await this.httpClient.post<
      ApiResponseModel<BiometricLoginContent>
    >('Authentication/biometric-login', body);

    if (response.data.responseType === 'Error' || !response.data.content?.accessToken) {
      throw new Error(
        response.data.message || 'No se pudo iniciar sesión con biometría',
      );
    }

    return response.data.content;
  }
}
