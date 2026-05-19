/**
 * Hosts donde no se aplica pinning (mapas, terceros, etc.).
 * Comparación sin distinguir mayúsculas.
 */
export const DEFAULT_PINNING_EXCLUDED_HOSTS: readonly string[] = [
  'maps.googleapis.com',
  'maps.gstatic.com',
];

export function isPinningExcludedHost(hostname: string): boolean {
  const h = hostname.trim().toLowerCase();
  return DEFAULT_PINNING_EXCLUDED_HOSTS.some(
    excluded => excluded === h || h.endsWith(`.${excluded}`),
  );
}
