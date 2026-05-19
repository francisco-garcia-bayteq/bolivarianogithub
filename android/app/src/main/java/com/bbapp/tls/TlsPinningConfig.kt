package com.bbapp.tls

import org.json.JSONArray

/**
 * Estado mutable leído por [PinningInterceptor] en cada request; actualizado desde JS vía
 * [TlsPinningModule].
 */
object TlsPinningConfig {
  @Volatile
  @JvmField
  var enabled: Boolean = false

  @Volatile
  @JvmField
  var expectedSha256Hex: String? = null

  private val excludedHosts: MutableSet<String> = mutableSetOf()

  @Synchronized
  fun setFromJs(
    enabledFlag: Boolean,
    expectedHex: String?,
    excludedHostsJson: String,
  ) {
    enabled = enabledFlag
    expectedSha256Hex = expectedHex?.trim()?.lowercase()
    excludedHosts.clear()
    try {
      val arr = JSONArray(excludedHostsJson)
      for (i in 0 until arr.length()) {
        excludedHosts.add(arr.getString(i).trim().lowercase())
      }
    } catch (_: Exception) {
      // ignore malformed JSON
    }
  }

  fun isExcludedHost(host: String): Boolean {
    val h = host.trim().lowercase()
    return excludedHosts.any { ex -> h == ex || h.endsWith(".$ex") }
  }

  fun shouldVerify(host: String): Boolean {
    if (!enabled) return false
    val hex = expectedSha256Hex
    if (hex.isNullOrBlank()) return false
    if (isExcludedHost(host)) return false
    return true
  }
}
