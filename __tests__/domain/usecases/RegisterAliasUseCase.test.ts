import {RegisterAliasUseCase} from '../../../src/domain/usecases/RegisterAliasUseCase';
import type {SecurityRepository} from '../../../src/domain/repositories/SecurityRepository';
import type {GetPublicKeyUseCase} from '../../../src/domain/usecases/GetPublicKeyUseCase';
import {SERVER_PUBLIC_KEY_PEM_BASE64} from '../../../src/security/certificate/keys.constants';

describe('RegisterAliasUseCase', () => {
  it('cifra el alias y delega en el repositorio', async () => {
    const registerAlias = jest.fn().mockResolvedValue({userMessage: 'OK'});
    const securityRepository = {registerAlias} as unknown as SecurityRepository;
    const getPublicKeyUseCase = {
      execute: jest.fn().mockResolvedValue({value: SERVER_PUBLIC_KEY_PEM_BASE64}),
    } as unknown as GetPublicKeyUseCase;

    const useCase = new RegisterAliasUseCase(
      securityRepository,
      getPublicKeyUseCase,
    );

    const result = await useCase.execute('  miAlias  ');

    expect(getPublicKeyUseCase.execute).toHaveBeenCalledTimes(1);
    expect(registerAlias).toHaveBeenCalledTimes(1);
    const encrypted = registerAlias.mock.calls[0][0] as string;
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(16);
    expect(result.userMessage).toBe('OK');
  });
});
