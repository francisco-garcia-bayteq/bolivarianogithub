package com.bbapp.tls

import java.io.IOException
import java.security.MessageDigest
import java.security.cert.X509Certificate
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Tras el handshake TLS, compara SHA-256(DER) del certificado del peer con el hash acordado
 * en capa 1 (hex).
 */
class PinningInterceptor : Interceptor {
  override fun intercept(chain: Interceptor.Chain): Response {
    val request = chain.request()
    val host = request.url.host.lowercase()

    if (!TlsPinningConfig.shouldVerify(host)) {
      return chain.proceed(request)
    }

    val connection =
      chain.connection()
        ?: throw IOException("TLS pinning: missing connection")
    val handshake =
      connection.handshake()
        ?: throw IOException("TLS pinning: missing handshake")
    val cert = handshake.peerCertificates[0] as X509Certificate
    val digest = MessageDigest.getInstance("SHA-256")
    val hashBytes = digest.digest(cert.encoded)
    val hex = bytesToHex(hashBytes)
    val expected = TlsPinningConfig.expectedSha256Hex
    if (expected == null || !hex.equals(expected, ignoreCase = true)) {
      throw IOException("TLS certificate pinning failed")
    }
    return chain.proceed(request)
  }

  private fun bytesToHex(bytes: ByteArray): String {
    return bytes.joinToString("") { b -> "%02x".format(b) }
  }
}
