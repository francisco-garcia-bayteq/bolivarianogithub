export const SecureStorageKeys = {
  AUTH_TOKEN: '@bb_auth_token',
  USER_SESSION: '@bb_user_session',
  /** Id de dispositivo estable (paridad Flutter `keyDeviceId`) */
  KEY_DEVICE_ID: '@bb_key_device_id',
  /** Preferencia de idioma: `es` u otro (mapeo a Spanish/English en headers) */
  LANGUAGE: '@bb_language',
  /** Hash SHA-256 del certificado en DER (hex) tras handshake exitoso */
  CERTIFICATE_HASH: '@bb_certificate_hash',
  /** `validateHash` del API: activar pinning TLS estricto (doCertValidation) */
  CERTIFICATE_PINNING_ENABLED: '@bb_certificate_pinning_enabled',
  SERVER_PUBLIC_KEY: '@bb_server_public_key',
  /** @deprecated No guardar contraseña para biometría; usar flujo RSA + BIOMETRIC_USERNAME */
  BIOMETRIC_CREDENTIALS: '@bb_biometric_credentials',
  /** Email/usuario para cifrado en challenge/login biométrico (sin contraseña) */
  BIOMETRIC_USERNAME: '@bb_biometric_username',
  /**
   * Android: PEM de clave RSA cuando el Keychain con cifrado biométrico falla (p. ej. emulador).
   * La lectura exige biometría vía BiometricAuthService antes de usar el PEM.
   */
  BIOMETRIC_RSA_PRIVATE_KEY_PEM: '@bb_biometric_rsa_private_key_pem',
  /** `encrypted_storage` | ausente = ruta Keychain */
  BIOMETRIC_RSA_KEY_BACKEND: '@bb_biometric_rsa_key_backend',
  /** Snapshot iOS: `LAContext.evaluatedPolicyDomainState` en base64 (cambio de huellas/Face) */
  BIOMETRIC_ENROLLMENT_SNAPSHOT: '@bb_biometric_enrollment_snapshot',
  USER_LOGIN_DATA: '@bb_user_login_data',
  /** Primer login exitoso en este dispositivo (identificador de usuario / email de login) */
  DEVICE_BOUND_LOGIN_ID: '@bb_device_bound_login_id',
  /** Nombre para saludo en login compacto (típicamente `User.name`) */
  DEVICE_BOUND_GREETING_NAME: '@bb_device_bound_greeting_name',
  /** Nombre de pila del API (`User.firstName`) para prefijar el saludo compacto */
  DEVICE_BOUND_GREETING_FIRST_NAME: '@bb_device_bound_greeting_first_name',
  /** Usuario rechazó registrar biometría en oferta post-OTP; no volver a mostrar BiometricOffer */
  BIOMETRIC_OFFER_DECLINED: '@bb_biometric_offer_declined',
} as const;
