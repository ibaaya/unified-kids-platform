import type { CapacitorConfig } from '@capacitor/cli'

/**
 * إعداد Capacitor.
 * معرّف التطبيق النهائي المستخدم في Android وiOS والمتاجر.
 */
const config: CapacitorConfig = {
  appId: 'com.ayasrah.rehlaty',
  appName: 'رحلتي',
  webDir: 'dist',
  backgroundColor: '#edf8f5',

  android: {
    // اجعلها true فقط عند تجربة التطبيق وفحصه من Chrome (chrome://inspect)
    webContentsDebuggingEnabled: false,
  },

  ios: {
    contentInset: 'never', // نتحكم بالمساحات الآمنة من CSS (src/styles/platform.css)
    // اجعلها true مؤقتاً لفحص التطبيق من Safari (Develop menu) ثم أعدها false قبل النشر
    webContentsDebuggingEnabled: false,
    backgroundColor: '#edf8f5',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#6d28d9',
      showSpinner: false,
    },
    SystemBars: {
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
    },
  },
}

export default config
