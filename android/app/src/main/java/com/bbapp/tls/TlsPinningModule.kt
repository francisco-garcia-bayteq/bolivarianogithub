package com.bbapp.tls

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class TlsPinningModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = NAME

  @ReactMethod
  fun setConfig(
    enabled: Boolean,
    expectedHex: String?,
    excludedHostsJson: String,
  ) {
    TlsPinningConfig.setFromJs(enabled, expectedHex, excludedHostsJson)
  }

  companion object {
    const val NAME = "TlsPinningModule"
  }
}
