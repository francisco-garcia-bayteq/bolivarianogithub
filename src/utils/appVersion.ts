/**
 * Versión de app: marketing (`CFBundleShortVersionString` / `versionName`) + build
 * (`CFBundleVersion` / `versionCode`).
 *
 * - Presentación: `1.0.0 +1` (último número = build).
 * - Header HTTP `X-Version`: `1.0.0.1` (mismos datos, build como cuarto segmento).
 *
 * Valores nativos: ver `package.json` (`version`), `android/app/build.gradle`
 * (`versionName` / `versionCode`), Xcode `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`.
 */

export function formatAppVersionDisplay(
  marketingVersion: string,
  buildNumber: string,
): string {
  const v = marketingVersion.trim();
  const b = buildNumber.trim();
  if (!b) {
    return v;
  }
  return `${v}`;
}

/** Valor para header `X-Version`, p. ej. marketing `1.0.0` y build `1` → `1.0.0.1`. */
export function formatAppVersionHeader(
  marketingVersion: string,
  buildNumber: string,
): string {
  const v = marketingVersion.trim();
  const b = buildNumber.trim();
  if (!b) {
    return v;
  }
  return `${v}.${b}`;
}
