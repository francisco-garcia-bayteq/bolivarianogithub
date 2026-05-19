export type InputSanitizer = (value: string) => string;
export type InputValidator = (value: string) => string | null;
export type CharacterMatcher = (character: string) => boolean;

export function composeSanitizers(
  ...sanitizers: InputSanitizer[]
): InputSanitizer {
  return value => sanitizers.reduce((currentValue, sanitize) => sanitize(currentValue), value);
}

export function composeValidators(
  ...validators: InputValidator[]
): InputValidator {
  return value => {
    for (const validator of validators) {
      const error = validator(value);

      if (error) {
        return error;
      }
    }

    return null;
  };
}

export function removeCharacters(pattern: RegExp): InputSanitizer {
  return value => value.replaceAll(pattern, '');
}

export function filterCharacters(
  matcher: CharacterMatcher,
): InputSanitizer {
  return value =>
    Array.from(value)
      .filter(character => !matcher(character))
      .join('');
}

export function requireTrimmedValue(message: string): InputValidator {
  return value => (value.trim() ? null : message);
}

export function requireMinLength(
  minLength: number,
  message: string,
): InputValidator {
  return value => (value.trim().length >= minLength ? null : message);
}

export function requireMaxLength(
  maxLength: number,
  message: string,
): InputValidator {
  return value => (value.length <= maxLength ? null : message);
}

export function rejectCharacters(
  pattern: RegExp,
  message: string,
): InputValidator {
  return value => (value.search(pattern) >= 0 ? message : null);
}

export function rejectMatchingCharacters(
  matcher: CharacterMatcher,
  message: string,
): InputValidator {
  return value => (containsMatchingCharacters(matcher, value) ? message : null);
}

export function requirePattern(
  pattern: RegExp,
  message: string,
): InputValidator {
  return value => (pattern.test(value.trim()) ? null : message);
}

export function containsCharacters(pattern: RegExp, value: string): boolean {
  return value.search(pattern) >= 0;
}

export function containsMatchingCharacters(
  matcher: CharacterMatcher,
  value: string,
): boolean {
  return Array.from(value).some(character => matcher(character));
}
