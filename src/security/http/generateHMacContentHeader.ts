import {Buffer} from 'node:buffer';
import crypto from 'react-native-quick-crypto';
import type {InternalAxiosRequestConfig} from 'axios';
import axios from 'axios';

/**
 * Cuerpo serializado como en Dart `json.encode` compacto: sin espacios extra.
 */
export function serializeBodyForContentHeader(data: unknown): string {
  if (data === null || data === undefined) {
    return '';
  }
  return JSON.stringify(data);
}

export function bodyHashForContentHeader(body: string): string {
  if (body === '') {
    return '';
  }
  return crypto.createHash('sha256').update(body).digest('hex');
}

/**
 * Equivale a `options.uri.query` en Dio: solo el query string (sin `?`).
 */
export function extractQueryStringFromAxiosConfig(
  config: InternalAxiosRequestConfig,
): string {
  try {
    const uri = axios.getUri(config);
    const u = new URL(uri);
    return u.search ? u.search.slice(1) : '';
  } catch {
    return '';
  }
}

export interface GenerateHMacContentHeaderParams {
  secretKey: string;
  method: string;
  queryString: string;
  body: string;
  timeStamp: string;
}

/**
 * Paridad con CryptoUtil.generateHMacForContentHeaderApi (Flutter).
 * Salida: digest HMAC-SHA256 en hexadecimal (minúsculas).
 */
export function generateHMacForContentHeaderApi(
  params: GenerateHMacContentHeaderParams,
): string {
  const method = params.method.toUpperCase();
  const bodyHash = bodyHashForContentHeader(params.body);
  const nonce = `${method}||${params.queryString}||${bodyHash}||${params.timeStamp}`;

  const hmac = crypto.createHmac('sha256', Buffer.from(params.secretKey, 'utf8'));
  hmac.update(nonce);
  return hmac.digest('hex');
}

/** Variante que recibe el body crudo (serializa y hashea internamente). */
export function generateHMacForContentHeaderFromAxios(
  secretKey: string,
  timeStamp: string,
  config: InternalAxiosRequestConfig,
): string {
  const body = serializeBodyForContentHeader(config.data);
  const queryString = extractQueryStringFromAxiosConfig(config);
  const method = config.method ?? 'GET';
  return generateHMacForContentHeaderApi({
    secretKey,
    method,
    queryString,
    body,
    timeStamp,
  });
}
