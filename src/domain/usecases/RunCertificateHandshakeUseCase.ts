import {devLog} from '../../data/api/devLog';
import type {SecurityRemoteDataSource} from '../../data/datasources/security/SecurityRemoteDataSource';
import type {CertificateHandshakePersistenceService} from '../services/CertificateHandshakePersistenceService';
import {
  startCertificateValidation,
  validateCertificateResponse,
  type ValidatedCertificateResult,
} from '../../security/certificate';

export class RunCertificateHandshakeUseCase {
  constructor(
    private readonly securityRemoteDataSource: SecurityRemoteDataSource,
    private readonly persistence: CertificateHandshakePersistenceService,
  ) {}

  async execute(): Promise<ValidatedCertificateResult> {
    const {response, session} = await startCertificateValidation(body =>
      this.securityRemoteDataSource.postCertificate(body),
    );
    const result = validateCertificateResponse(response, session);
    await this.persistence.persistValidatedResult(result);
    devLog('Certificate/handshake', 'Handshake criptográfico completado', {
      pinningEnabled: result.pinningEnabled,
      hashHexLength: result.certificateHashHex.length,
    });
    return result;
  }
}
