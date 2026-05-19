import {rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64} from '../../security/certificate/rsaUtils';
import {Otp} from '../entities/Otp';
import {SecurityRepository} from '../repositories/SecurityRepository';
import {GetPublicKeyUseCase} from './GetPublicKeyUseCase';

export class ValidateOtpUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly getPublicKeyUseCase: GetPublicKeyUseCase,
  ) {}

  async execute(otp: string): Promise<Otp> {
    const trimmed = otp.trim();
    const {value: serverPublicKeyPemBase64} =
      await this.getPublicKeyUseCase.execute();
    const encryptedOtp = rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
      serverPublicKeyPemBase64,
      trimmed,
    );
    return await this.securityRepository.validateOtp(encryptedOtp);
  }
}
