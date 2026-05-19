# Validación de certificados (handshake previo al login)

Flujo criptográfico alineado con `POST /api/v{version}/Security/certificate`. Este módulo **no** registra claves privadas, secretos AES ni IV en consola.

## Tamaños de material

| Campo | Formato | Uso |
| ----- | ------- | --- |
| `secretMaterial` / `ivMaterial` | String hex, 16 caracteres (8 bytes al decodificar) | Sesión de handshake; RSA cifra esos 8 bytes |
| Clave AES derivada | String hex, 64 caracteres | `deriveAes256KeyHexFromSecretMaterial` → `SHA-256` del material hex |
| IV derivado | String hex, 32 caracteres | `deriveIvHexFromIvMaterial` → primeros 16 bytes del `SHA-256` en hex |

En código solo se exponen **strings** (hex / Base64); el binario queda dentro de `encoding`, `rsaUtils` y `aesHelper`. Constantes: `AES_KEY_LENGTH_BYTES`, `AES_IV_LENGTH_BYTES` en `aesHelper.ts`.

## Algoritmos

### RSA

- **Cifrado hacia servidor / hacia cliente:** RSA-OAEP con **SHA-1** (OAEP y MGF1), paridad con .NET `RSAEncryptionPadding.OaepSHA1`. El request usa PEM en Base64 y material **hex string** de 16 caracteres (`rsaOaepEncryptHex16MaterialPemBase64ToBase64`). Texto UTF-8 genérico: `rsaEncryptPublicKeyPemBase64Utf8ToBase64`. Ver `RSA_OAEP_OPTIONS` en `rsaUtils.ts`.
- **Firma del cliente (`secretEncryptSignBase64`):** RSA con **SHA-256** y **PKCS#1 v1.5** sobre el **ciphertext del secret** (`rsaSignSha256PrivateKeyPemBase64OnCipherBase64`). Los bytes firmados son el binario del secret cifrado, no el IV.
- **Firma del servidor (`hashEncryptSign`):** `rsaVerifySha256PublicKeyPemBase64OnBase64` — `hashEncrypt` y `hashEncryptSign` como **Base64**.

Si el backend usa **RSA-PSS** u otro esquema, hay que ajustar la verificación en `rsaUtils` y alinear el servidor.

### AES

- **Modo:** `aes-256-cbc`
- **Padding:** PKCS#7
- **Descifrado en cadena hex:** `aes256CbcDecryptHex(ciphertextHex, keyHex, ivHex)` → plaintext en **hex** (`certificateHashHex`).

## Respuesta del API

El envelope usa el campo **`content`** (y opcionalmente `data` como alias). Ver `CertificateEnvelopeResponse` en `src/data/models/CertificateModels.ts`.

### Campo `validateHash`

En el `content` del handshake, **`validateHash` no indica error criptográfico**: se usa como **flag de pinning TLS** (equivalente a `doCertValidation` en otros clientes). Si es `false`, el handshake puede completarse igualmente y la app confía en la cadena del SO para HTTPS; si es `true`, se persiste el hash y se activa la validación estricta del certificado en la capa TLS (ver `src/security/tls/README.md`).

Tras verificar la firma del servidor y descifrar RSA, el plaintext intermedio se trata como **ciphertext AES** y se descifra con el `secret` e `IV` de la sesión. El resultado se expone como **`certificateHashHex`** (hex de los bytes en claro) para almacenamiento/pinning; si el backend entrega UTF-8 u otro encoding, ajustar la interpretación en `validateCertificateResponse`.

## Integración

1. `startCertificateValidation(postCertificate)` — genera sesión, construye el body y llama al API.
2. `validateCertificateResponse(envelope, session)` — valida y devuelve el hash en claro.

En la app, `RunCertificateHandshakeUseCase` encapsula ambos pasos vía `SecurityRemoteDataSource`.

## Preguntas abiertas con backend

- Confirmar **RSA-PSS vs PKCS#1 v1.5** para firmas en ambos sentidos.
- Confirmar que la firma del cliente es sobre los **bytes raw** del ciphertext RSA del secret.
- Confirmar encoding del hash final (hex, Base64, UTF-8).
