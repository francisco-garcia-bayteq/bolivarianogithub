import {LoginResponseModel} from '../models/LoginResponseModel';
import {User} from '../../domain/entities/User';

export function mapLoginResponseToUser(
  model: LoginResponseModel,
  email: string,
): User {
  const firstName = model.firstName?.trim() ?? '';
  const fallbackLocal = email.split('@')[0] || 'User';
  const displayName = firstName || fallbackLocal;
  return {
    id: email,
    email,
    firstName,
    name: displayName,
    token: model.accessToken,
    sessionExpiresAt: Date.now() + model.sessionTimeSeconds * 1000,
    inactivityTimeoutSeconds: model.inactivityTimeoutSeconds,
    ...('alias' in model ? {alias: model.alias} : {}),
  };
}
