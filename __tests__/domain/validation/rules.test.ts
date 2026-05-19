import {
  composeSanitizers,
  composeValidators,
  containsMatchingCharacters,
  filterCharacters,
  rejectMatchingCharacters,
  requireMaxLength,
} from '../../../src/domain/validation/rules';

describe('validation rules helpers', () => {
  test('composeSanitizers applies sanitizers in sequence', () => {
    const sanitize = composeSanitizers(
      value => value.trim(),
      value => value.replaceAll('-', ''),
    );

    expect(sanitize(' 12-34-56 ')).toBe('123456');
  });

  test('composeValidators returns the first failing validation', () => {
    const validate = composeValidators(
      requireMaxLength(5, 'Demasiado largo'),
      () => 'Nunca debería ejecutarse',
    );

    expect(validate('123456')).toBe('Demasiado largo');
  });

  test('filterCharacters and rejectMatchingCharacters share the same matcher contract', () => {
    const isDigit = (character: string) => /\d/.test(character);
    const sanitize = filterCharacters(isDigit);
    const validate = rejectMatchingCharacters(
      isDigit,
      'No se permiten dígitos',
    );

    expect(sanitize('ab1c2')).toBe('abc');
    expect(validate('ab1c2')).toBe('No se permiten dígitos');
    expect(containsMatchingCharacters(isDigit, 'abc')).toBe(false);
  });
});
