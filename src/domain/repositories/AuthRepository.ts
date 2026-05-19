import {User} from '../entities/User';

export interface AuthRepository {
  /**
   * @param plainEmail Email en claro (perfil y almacenamiento local).
   * @param encryptedUsername Valor para `username` en el body (RSA-OAEP doble Base64).
   * @param encryptedPassword Valor para `password` en el body (RSA-OAEP doble Base64).
   */
  login(
    plainEmail: string,
    encryptedUsername: string,
    encryptedPassword: string,
  ): Promise<User>;
}
