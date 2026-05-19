import type {CertificateHandshakePersistenceService} from '../../domain/services/CertificateHandshakePersistenceService';
import type {SecureStorageService} from '../../domain/services/SecureStorageService';
import {SecureStorageKeys} from '../datasources/storage/SecureStorageKeys';
import {syncTlsPinningFromStorage} from '../../security/tls';
import type {ValidatedCertificateResult} from '../../security/certificate';

export class CertificateHandshakePersistenceServiceImpl
  implements CertificateHandshakePersistenceService
{
  constructor(private readonly secureStorage: SecureStorageService) {}

  async persistValidatedResult(result: ValidatedCertificateResult): Promise<void> {
    await this.secureStorage.save(
      SecureStorageKeys.CERTIFICATE_HASH,
      result.certificateHashHex,
    );
    await this.secureStorage.save(
      SecureStorageKeys.CERTIFICATE_PINNING_ENABLED,
      result.pinningEnabled ? 'true' : 'false',
    );
    await syncTlsPinningFromStorage(this.secureStorage);
  }
}
