# TLS pinning (capa 2)

Tras el handshake criptográfico (capa 1), la app puede guardar:

- `CERTIFICATE_HASH`: SHA-256 del certificado en **DER**, en **hex** (mismo criterio que calcula el nativo en TLS).
- `CERTIFICATE_PINNING_ENABLED`: `validateHash` del API → activa comparación estricta en cada conexión HTTPS relevante.

## Comportamiento

| Condición | Efecto |
| --------- | ------ |
| Pinning activo y hash presente | En **Android** (OkHttp) e **iOS** (NSURLSession), tras el handshake TLS se calcula SHA-256(DER) del certificado del peer y se compara con el hex guardado. |
| Pinning desactivado o sin hash | Se usa la cadena de confianza del sistema (desarrollo / pruebas). |
| Host en lista de exclusión | No se aplica pinning (`pinningExcludedHosts.ts`), p. ej. mapas. |

## Nativo

- **Android:** `PinningInterceptor` + `OkHttpClientProvider.setOkHttpClientFactory` en `TlsPinningInstaller` (`android/app/src/main/java/com/bbapp/tls/TlsPinningInstaller.kt`).
- **iOS:** categoría en `RCTHTTPRequestHandler` con `URLSession:task:didReceiveChallenge:` (`ios/BBApp/TlsPinningIOS.m`).

El bridge JS [`tlsPinningNative.ts`](../tlsPinningNative.ts) llama a `TlsPinningModule.setConfig` al arranque y tras el handshake.

## Nota sobre SPKI vs DER

OkHttp **CertificatePinner** estándar usa a menudo huellas de **clave pública (SPKI)**. Esta implementación compara **SHA-256 del certificado completo en DER**, alineado con la descripción de negocio y el hash acordado en capa 1.
