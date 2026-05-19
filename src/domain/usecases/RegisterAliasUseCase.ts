import {rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64} from '../../security/certificate/rsaUtils';
import type {RegisterAliasResult} from '../entities/RegisterAliasResult';
import {SecurityRepository} from '../repositories/SecurityRepository';
import {GetPublicKeyUseCase} from './GetPublicKeyUseCase';

export class RegisterAliasUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly getPublicKeyUseCase: GetPublicKeyUseCase,
  ) {}

  async execute(plainAlias: string): Promise<RegisterAliasResult> {
    const trimmed = plainAlias.trim();
    const {value: serverPublicKeyPemBase64} =
      await this.getPublicKeyUseCase.execute();
    const encryptedAlias = rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
      serverPublicKeyPemBase64,
      trimmed,
    );
    return await this.securityRepository.registerAlias(encryptedAlias);
  }
}
