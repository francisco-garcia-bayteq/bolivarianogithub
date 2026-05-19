import {
  composeSanitizers,
  filterCharacters,
  removeCharacters,
} from './rules';

export const INVISIBLE_CHAR_PATTERN = /[\u200B-\u200D\u2060\uFEFF]/g;

export function isControlCharacter(character: string): boolean {
  const code = character.codePointAt(0);
if (code === undefined) {
  return false;
}
  return (code >= 0 && code <= 31) || (code >= 127 && code <= 159);
}

export const sanitizeUnsafeTextInput = composeSanitizers(
  filterCharacters(isControlCharacter),
  removeCharacters(INVISIBLE_CHAR_PATTERN),
);
