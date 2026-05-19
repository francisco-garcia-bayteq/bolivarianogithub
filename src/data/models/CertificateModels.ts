/**
 * DTOs for POST /Security/certificate (handshake previo al login).
 */

export interface CertificateRequest {
  secretEncryptBase64: string;
  secretEncryptSignBase64: string;
  secretIvEncryptBase64: string;
}

export interface CertificatePayload {
  hashEncrypt: string;
  hashEncryptSign: string;
}

export interface CertificateContent {
  certificate: CertificatePayload;
  validateHash: boolean;
  userMessage: string;
}

/**
 * Envelope del API. Algunos entornos pueden devolver `data` en lugar de `content`;
 * el cliente acepta ambos.
 */
export interface CertificateEnvelopeResponse {
  code: number;
  responseType: string;
  message: string;
  content?: CertificateContent;
  /** Alias posible del backend; preferir `content` si ambos existen */
  data?: CertificateContent;
  additionalData?: string;
}
