import {
  hasDisallowedLoginPasswordCharacters,
  LOGIN_USERNAME_MIN_LENGTH,
  LOGIN_USERNAME_MAX_LENGTH,
  LOGIN_PASSWORD_MIN_LENGTH,
  LOGIN_PASSWORD_MAX_LENGTH,
  loginValidationMessages,
  
  sanitizeLoginUsernameInput,
  validateLoginPassword,
  validateLoginUsername,
} from '../../../src/domain/validation';

describe('loginCredentials validation', () => {
  test('sanitizes unsafe characters from login username input', () => {
    const raw = ' usuario\u200B-demo12 ';

    expect(sanitizeLoginUsernameInput(raw)).toBe(' usuario-demo12 ');
    expect(hasDisallowedLoginPasswordCharacters(raw)).toBe(true);
  });

  test('accepts username within length range with allowed characters', () => {
    expect(validateLoginUsername('usuario-demo12')).toBeNull();
    expect(validateLoginUsername('user.name_demo1')).toBeNull();
    expect(validateLoginUsername('abcdefghijkl')).toBeNull();
  });

  test('rejects usernames shorter than the minimum length', () => {
    const shortUsername = 'a'.repeat(LOGIN_USERNAME_MIN_LENGTH - 1);

    expect(validateLoginUsername(shortUsername)).toBe(
      loginValidationMessages.usernameTooShort,
    );
  });

  test('rejects usernames longer than the allowed maximum', () => {
    const longUsername = 'a'.repeat(LOGIN_USERNAME_MAX_LENGTH + 1);

    expect(validateLoginUsername(longUsername)).toBe(
      loginValidationMessages.usernameTooLong,
    );
  });

  test('rejects usernames with characters outside the allowed set', () => {
    expect(validateLoginUsername('user@invalid123')).toBe(
      loginValidationMessages.usernameInvalidCharset,
    );
    expect(validateLoginUsername('user space12345')).toBe(
      loginValidationMessages.usernameInvalidCharset,
    );
  });

  test('sanitizes unsafe characters from password input without removing spaces', () => {
    const rawPassword = 'clave \u200Bsegura\u0000';

    expect(sanitizeLoginUsernameInput(rawPassword)).toBe('clave segura');
    expect(hasDisallowedLoginPasswordCharacters(rawPassword)).toBe(true);
  });

  test('requires the minimum password length', () => {
    const shortPassword = 'a'.repeat(LOGIN_PASSWORD_MIN_LENGTH - 1);

    expect(validateLoginPassword(shortPassword)).toBe(
      loginValidationMessages.passwordTooShort,
    );
  });

  test('rejects passwords longer than the allowed maximum', () => {
    const longPassword = 'a'.repeat(LOGIN_PASSWORD_MAX_LENGTH + 1);

    expect(validateLoginPassword(longPassword)).toBe(
      loginValidationMessages.passwordTooLong,
    );
  });

  test('accepts a password within the valid length range', () => {
    expect(validateLoginPassword('12345678')).toBeNull();
    expect(validateLoginPassword('a'.repeat(LOGIN_PASSWORD_MAX_LENGTH))).toBeNull();
  });

  test('password still requires non-empty trimmed value', () => {
    expect(validateLoginPassword('')).toBe(
      loginValidationMessages.passwordRequired,
    );
    expect(validateLoginPassword('   ')).toBe(
      loginValidationMessages.passwordRequired,
    );
  });
});
