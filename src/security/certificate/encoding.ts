import {Buffer} from 'node:buffer';
import base64 from 'react-native-base64';

/**
 * Base64 (RFC 4648) con `react-native-base64`, equivalente a `base64.encode(bytes)` en Dart:
 * el binario se pasa como string Latin-1 (un carácter por byte 0–255), sin `Uint8Array` en la API.
 */

/** Binario como string Latin-1 → Base64 (misma idea que `base64.encode(Uint8List)` en Dart). */
export function binaryLatin1ToBase64(binaryLatin1: string): string {
  return base64.encode(binaryLatin1);
}

/** Base64 → binario como string Latin-1. */
export function base64ToBinaryLatin1(b64: string): string {
  return base64.decode(b64);
}

/** `Buffer` (salida típica de RSA/AES en Node) → Base64. */
export function bufferToBase64(buf: Buffer): string {
  return binaryLatin1ToBase64(buf.toString('latin1'));
}

/** Base64 → `Buffer` para operaciones crypto. */
export function base64ToBuffer(b64: string): Buffer {
  return Buffer.from(base64ToBinaryLatin1(b64), 'latin1');
}

export function base64ToHex(b64: string): string {
  return base64ToBuffer(b64).toString('hex');
}

export function hexToBase64(hex: string): string {
  return bufferToBase64(Buffer.from(hex, 'hex'));
}

export function utf8ToHex(s: string): string {
  return Buffer.from(s, 'utf8').toString('hex');
}

export function bufferToHex(buf: Buffer): string {
  return buf.toString('hex');
}

export function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}
