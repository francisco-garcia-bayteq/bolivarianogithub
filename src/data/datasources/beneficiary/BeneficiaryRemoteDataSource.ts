import {HttpClient} from '../../api/HttpClient';
import {ApiResponseModel} from '../../models/ApiResponseModel';
import {BeneficiaryContactsContentModel} from '../../models/BeneficiaryContactsContentModel';
import {BeneficiaryDataSource} from './BeneficiaryDataSource';

export class BeneficiaryRemoteDataSource implements BeneficiaryDataSource {
  constructor(private readonly httpClient: HttpClient) {}

  async getContacts(): Promise<BeneficiaryContactsContentModel> {
    try {
      const response = await this.httpClient.get<
        ApiResponseModel<BeneficiaryContactsContentModel>
      >('Beneficiary/contacts');

      if (response.data.responseType === 'Error' || !response.data.content) {
        throw new Error(
          response.data.message || 'No se pudieron cargar los contactos',
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
