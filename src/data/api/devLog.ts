/**
 * Logs solo en desarrollo. No usar para datos sensibles (claves, secretos, IV, payloads cifrados).
 */
export function devLog(
  area: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  if (__DEV__) {
    const prefix = `[BBApp][${area}]`;
    if (details && Object.keys(details).length > 0) {
      console.log(prefix, message, details);
    } else {
      console.log(prefix, message);
    }
  }
}

export function devWarn(
  area: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  if (__DEV__) {
    const prefix = `[BBApp][${area}]`;
    if (details && Object.keys(details).length > 0) {
      console.warn(prefix, message, details);
    } else {
      console.warn(prefix, message);
    }
  }
}
