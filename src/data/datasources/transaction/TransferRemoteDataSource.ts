import {HttpClient} from '../../api/HttpClient';
import {ApiResponseModel} from '../../models/ApiResponseModel';
import {TransferContentModel} from '../../models/TransferContentModel';
import {TransferRequest} from '../../models/TransferRequest';
import {TransactionDataSource} from "./TransactionDataSource.ts";
import {TransactionModel} from "../../models/TransactionModel.ts";

export class TransferRemoteDataSource implements TransactionDataSource{
  constructor(private readonly httpClient: HttpClient) {}

  async transfer(request: TransferRequest): Promise<TransferContentModel> {
    try {
      const response = await this.httpClient.post<
        ApiResponseModel<TransferContentModel>
      >('Transaction/transfer', request);

      if (response.data.responseType === 'Error' || !response.data.content) {
        throw new Error(
          response.data.message ||
            'No se pudo completar la transferencia. Por favor intente nuevamente.',
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

  getTransactions(): Promise<TransactionModel[]> {
    return Promise.resolve([]);
  }
}
