import {
  composeSanitizers,
  composeValidators,
  containsCharacters,
  containsMatchingCharacters,
  filterCharacters,
  rejectCharacters,
  rejectMatchingCharacters,
  requireMaxLength,
} from './rules';
import {
  INVISIBLE_CHAR_PATTERN,
  isControlCharacter,
  sanitizeUnsafeTextInput,
} from './textSafety';

export const TRANSFER_CONCEPT_MAX_LENGTH = 30;

export const transferConceptMessages = {
  invalidCharacters: 'El concepto contiene caracteres no permitidos',
  tooLong: `El concepto no puede superar ${TRANSFER_CONCEPT_MAX_LENGTH} caracteres`,
} as const;

const NEWLINE_PATTERN = /[\r\n]/;

/** Secuencias de salto de línea → un solo espacio. Requiere flag `g` para `replaceAll`. */
const NEWLINE_RUN_PATTERN = /\r\n|\n|\r/g;

/** Letras, números, espacio (U+0020), punto y guión. */
const DISALLOWED_CONCEPT_CHAR_PATTERN = /[^\p{L}\p{N} .-]/u;

function replaceNewlinesWithSpace(value: string): string {
  return value.replaceAll(NEWLINE_RUN_PATTERN, ' ');
}

function isDisallowedTransferConceptCharacter(character: string): boolean {
  return !/^[\p{L}\p{N} .-]$/u.test(character);
}

export const sanitizeTransferConceptInput = composeSanitizers(
  replaceNewlinesWithSpace,
  sanitizeUnsafeTextInput,
  filterCharacters(isDisallowedTransferConceptCharacter),
);

const validateNonEmptyTransferConcept = composeValidators(
  requireMaxLength(
    TRANSFER_CONCEPT_MAX_LENGTH,
    transferConceptMessages.tooLong,
  ),
  rejectMatchingCharacters(
    isControlCharacter,
    transferConceptMessages.invalidCharacters,
  ),
  rejectCharacters(
    INVISIBLE_CHAR_PATTERN,
    transferConceptMessages.invalidCharacters,
  ),
  rejectCharacters(
    DISALLOWED_CONCEPT_CHAR_PATTERN,
    transferConceptMessages.invalidCharacters,
  ),
);

export function validateTransferConcept(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === '') {
    return null;
  }

  return validateNonEmptyTransferConcept(value);
}

export function hasDisallowedTransferConceptCharacters(value: string): boolean {
  return (
    containsMatchingCharacters(isControlCharacter, value) ||
    containsCharacters(INVISIBLE_CHAR_PATTERN, value) ||
    containsCharacters(NEWLINE_PATTERN, value) ||
    containsCharacters(DISALLOWED_CONCEPT_CHAR_PATTERN, value)
  );
}
