package com.bbapp.biometric

import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.security.KeyStore
import javax.crypto.KeyGenerator

/**
 * Clave Keystore dedicada para detectar cambios de huellas/Face (invalidación al enrolar).
 * Complementa react-native-keychain: garantiza detección fiable en Android.
 */
class BiometricEnrollmentModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "BiometricEnrollmentModule"

  @ReactMethod
  fun installProbe(promise: Promise) {
    try {
      removeProbeInternal()
      val purposes = KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
      val builder =
        KeyGenParameterSpec.Builder(PROBE_ALIAS, purposes)
          .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
          .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
          .setRandomizedEncryptionRequired(true)
          .setKeySize(256)
          .setUserAuthenticationRequired(true)
          .setInvalidatedByBiometricEnrollment(true)
      @Suppress("DEPRECATION")
      builder.setUserAuthenticationValidityDurationSeconds(0)
      val keyGenerator =
        KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
      keyGenerator.init(builder.build())
      keyGenerator.generateKey()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_PROBE_INSTALL", e.message, e)
    }
  }

  @ReactMethod
  fun isProbeValid(promise: Promise) {
    try {
      val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
      keyStore.load(null)
      if (!keyStore.containsAlias(PROBE_ALIAS)) {
        promise.resolve(true)
        return
      }
      keyStore.getKey(PROBE_ALIAS, null)
      promise.resolve(true)
    } catch (_: KeyPermanentlyInvalidatedException) {
      promise.resolve(false)
    } catch (e: Exception) {
      promise.reject("E_PROBE_CHECK", e.message, e)
    }
  }

  @ReactMethod
  fun removeProbe(promise: Promise) {
    try {
      removeProbeInternal()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_PROBE_REMOVE", e.message, e)
    }
  }

  private fun removeProbeInternal() {
    val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
    keyStore.load(null)
    if (keyStore.containsAlias(PROBE_ALIAS)) {
      keyStore.deleteEntry(PROBE_ALIAS)
    }
  }

  companion object {
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val PROBE_ALIAS = "bbapp_biometric_enrollment_probe_v1"
  }
}
