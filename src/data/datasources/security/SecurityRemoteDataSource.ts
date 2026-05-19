import {HttpClient} from '../../api/HttpClient';
import {ApiResponseModel} from '../../models/ApiResponseModel';
import {OtpValidationRequest} from '../../models/OtpValidationRequest';
import {OtpValidationResponse} from '../../models/OtpValidationResponse';
import {PublicKeyContentModel} from '../../models/PublicKeyContentModel';
import axios from 'axios';
import {devLog, devWarn} from '../../api/devLog';
import type {
  CertificateEnvelopeResponse,
  CertificateRequest,
} from '../../models/CertificateModels';
import {ValidateTransactionAmountRequest} from '../../models/ValidateTransactionAmountRequest';
import {ValidateTransactionAmountContentModel} from '../../models/ValidateTransactionAmountContentModel';
import type {RegisterAliasRequest} from '../../models/RegisterAliasRequest';
import type {RegisterAliasContentModel} from '../../models/RegisterAliasContentModel';

const LOG_AREA = 'Security/certificate';

export class SecurityRemoteDataSource {
  constructor(private readonly httpClient: HttpClient) {}

  async postCertificate(
    body: CertificateRequest,
  ): Promise<CertificateEnvelopeResponse> {
    const path = 'security/certificate';
    devLog(LOG_AREA, 'POST iniciado', {
      path,
      // Solo metadatos; no se registran los Base64 del body
      bodyFieldsPresent: {
        secretEncryptBase64: body.secretEncryptBase64,
        secretEncryptSignBase64: body.secretEncryptSignBase64,
        secretIvEncryptBase64: body.secretIvEncryptBase64,
      },
    });

    try {
      const response = await this.httpClient.post<CertificateEnvelopeResponse>(
        path,
        body,
      );
      const envelope = response.data;
      devLog(LOG_AREA, 'POST respuesta OK', {
        httpStatus: response.status,
        code: envelope.code,
        responseType: envelope.responseType,
        message: envelope.message,
        hasContent: Boolean(envelope.content ?? envelope.data),
        validateHash: envelope.content?.validateHash ?? envelope.data?.validateHash,
      });
      return envelope;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        devWarn(LOG_AREA, 'POST error HTTP', {
          message: error.message,
          httpStatus: error.response?.status,
          responseType:
            typeof error.response?.data === 'object' &&
            error.response?.data !== null &&
            'responseType' in error.response.data
              ? (error.response.data as {responseType?: string}).responseType
              : undefined,
          serverMessage:
            typeof error.response?.data === 'object' &&
            error.response?.data !== null &&
            'message' in error.response.data
              ? String((error.response.data as {message?: unknown}).message)
              : undefined,
        });
      } else {
        devWarn(LOG_AREA, 'POST error', {
          message: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  }
  async getPublicKey(): Promise<PublicKeyContentModel> {
    try {
      const response = await this.httpClient.get<
        ApiResponseModel<PublicKeyContentModel>
      >('Security/public-key');

      if (response.data.responseType === 'Error' || !response.data.content) {
        throw new Error(
          response.data.message || 'No se pudo obtener la clave pública',
        );
      }

      return response.data.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }
  async validateOtp(request: OtpValidationRequest): Promise<OtpValidationResponse> {
    try {
      const response = await this.httpClient.post<
        ApiResponseModel<OtpValidationResponse>
      >('Security/validate-otp', request);

      if (response.data.responseType === 'Error' || !response.data.content) {
        throw new Error(
          response.data.message || 'Error al validar el OTP. Por favor intente nuevamente.',
        );
      }

      return response.data.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  async validateTransactionAmount(
    request: ValidateTransactionAmountRequest,
  ): Promise<ValidateTransactionAmountContentModel> {
    try {
      const response = await this.httpClient.post<
        ApiResponseModel<ValidateTransactionAmountContentModel>
      >('Security/validate-transaction-amount', request);

      if (response.data.responseType === 'Error' || !response.data.content) {
        throw new Error(
          response.data.message ||
            'No se pudo validar el monto. Por favor intente nuevamente.',
        );
      }

      return response.data.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  async registerAlias(
    request: RegisterAliasRequest,
  ): Promise<RegisterAliasContentModel> {
    try {
      const response = await this.httpClient.post<
        ApiResponseModel<RegisterAliasContentModel>
      >('Security/register-alias', request);

      if (response.data.responseType === 'Error' || !response.data.content) {
        throw new Error(
          response.data.message ||
            'No se pudo registrar el alias. Por favor intente nuevamente.',
        );
      }

      return response.data.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }
}
