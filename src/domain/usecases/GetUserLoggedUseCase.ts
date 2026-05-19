import { User } from '../entities/User';
import {SecureStorageService} from '../services/SecureStorageService';

export class GetUserLoggedUseCase {
  constructor(
    private readonly secureStorage: SecureStorageService,
    private readonly storageKey: string,
  ) {}

  async execute(): Promise<User> {
    const userLoginData = await this.secureStorage.get(this.storageKey);
    if (!userLoginData) {
      throw new Error('No se encontró el usuario.');
    }
    const parsed = JSON.parse(userLoginData) as User;
    return {
      ...parsed,
      firstName: parsed.firstName ?? '',
    };
  }
}
