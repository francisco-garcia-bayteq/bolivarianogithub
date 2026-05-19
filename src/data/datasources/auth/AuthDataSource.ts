import {LoginRequestModel} from '../../models/LoginRequestModel';
import {LoginResponseModel} from '../../models/LoginResponseModel';

export interface AuthDataSource {
  login(request: LoginRequestModel): Promise<LoginResponseModel>;
}
