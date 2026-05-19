export interface BiometricChallengeRequest {
  userEncryptBase64: string;
}

export interface BiometricChallengeContent {
  challenge: string;
}

export interface BiometricRegistrationRequest {
  challenge: string;
  challengeSignBase64: string;
  mobilePublicKeyBase64: string;
}

export interface BiometricLoginRequest {
  usernameEncryptBase64: string;
  challenge: string;
  challengeSignBase64: string;
}

/** Misma forma que el login por credenciales; el backend puede devolver `firstName` y tiempos de sesión. */
export interface BiometricLoginContent {
  accessToken: string;
  firstName?: string;
  sessionTimeSeconds?: number;
  inactivityTimeoutSeconds?: number;
}
