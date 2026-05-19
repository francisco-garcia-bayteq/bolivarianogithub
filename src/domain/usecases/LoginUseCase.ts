import {rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64} from '../../security/certificate/rsaUtils';
import {User} from '../entities/User';
import {AuthRepository} from '../repositories/AuthRepository';
import {validateLoginPassword, validateLoginUsername} from '../validation';
import {SecureStorageService} from '../services/SecureStorageService';
import {GetPublicKeyUseCase} from './GetPublicKeyUseCase';
import {RunCertificateHandshakeUseCase} from './RunCertificateHandshakeUseCase';

export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly secureStorageService: SecureStorageService,
    private readonly storageKey: string,
    private readonly runCertificateHandshakeUseCase: RunCertificateHandshakeUseCase,
    private readonly getPublicKeyUseCase: GetPublicKeyUseCase,
    /** Misma clave que usa el interceptor HTTP para `Authorization` (debe persistirse antes de llamadas posteriores al login, p. ej. biometric-registration). */
    private readonly authTokenStorageKey: string,
  ) {}

  async execute(email: string, password: string): Promise<User> {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const usernameError = validateLoginUsername(trimmedEmail);
    const passwordError = validateLoginPassword(trimmedPassword);

    if (usernameError) {
      throw new Error(usernameError);
    }

    if (passwordError) {
      throw new Error(passwordError);
    }

    await this.runCertificateHandshakeUseCase.execute();
    const {value: serverPublicKeyPemBase64} =
      await this.getPublicKeyUseCase.execute(true);
    const encryptedUsername = rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
      serverPublicKeyPemBase64,
      trimmedEmail,
    );
    const encryptedPassword = rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
      serverPublicKeyPemBase64,
      trimmedPassword,
    );

    const userLoginData = await this.authRepository.login(
      trimmedEmail,
      encryptedUsername,
      encryptedPassword,
    );

    await this.secureStorageService.save(
      this.storageKey,
      JSON.stringify(userLoginData),
    );
    await this.secureStorageService.save(
      this.authTokenStorageKey,
      userLoginData.token,
    );

    return userLoginData;
  }
}