import {HttpClient} from '../../api/HttpClient';
import {ApiResponseModel} from '../../models/ApiResponseModel';
import {TransactionListContentApiModel} from '../../models/TransactionListApiModels';

export type TransactionListQueryParams = {
  AccountGuid: string;
  DateFrom?: string;
  DateTo?: string;
  TransactionType?: string;
  MinAmount?: string;
  MaxAmount?: string;
  TextSearch?: string;
  PageNumber: number;
  PageSize: number;
};

export class TransactionListRemoteDataSource {
  constructor(private readonly httpClient: HttpClient) {}

  async getTransactionPage(
    params: TransactionListQueryParams,
  ): Promise<TransactionListContentApiModel> {
    const query: Record<string, string> = {
      AccountGuid: params.AccountGuid,
      PageNumber: String(params.PageNumber),
      PageSize: String(params.PageSize),
    };
    if (params.DateFrom) {
      query.DateFrom = params.DateFrom;
    }
    if (params.DateTo) {
      query.DateTo = params.DateTo;
    }
    if (params.TransactionType) {
      query.TransactionType = params.TransactionType;
    }
    if (params.MinAmount !== undefined) {
      query.MinAmount = params.MinAmount;
    }
    if (params.MaxAmount !== undefined) {
      query.MaxAmount = params.MaxAmount;
    }
    if (params.TextSearch) {
      query.TextSearch = params.TextSearch;
    }

    try {
      const response = await this.httpClient.get<
        ApiResponseModel<TransactionListContentApiModel>
      >('Transaction', {params: query});

      if (response.data.responseType === 'Error' || !response.data.content) {
        throw new Error(
          response.data.message || 'No se pudieron cargar los movimientos',
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
