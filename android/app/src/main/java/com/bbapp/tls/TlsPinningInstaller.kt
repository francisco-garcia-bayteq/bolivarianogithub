package com.bbapp.tls

import android.content.Context
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.OkHttpClient

object TlsPinningInstaller {
  fun install(context: Context) {
    val appContext = context.applicationContext
    OkHttpClientProvider.setOkHttpClientFactory(
      OkHttpClientFactory {
        OkHttpClientProvider.createClientBuilder(appContext)
          .addNetworkInterceptor(PinningInterceptor())
          .build()
      },
    )
  }
}
