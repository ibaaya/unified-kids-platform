import { Capacitor } from '@capacitor/core'
import { registerSW } from 'virtual:pwa-register'

/** true عندما يعمل الكود داخل تطبيق Android / iOS (Capacitor) */
export const isNativeApp: boolean = Capacitor.isNativePlatform()

/** true عندما يكون الموقع مثبّتاً كـ PWA (يعمل في نافذة مستقلة) */
export function isInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** يُستدعى مرة واحدة من main.tsx */
export function initPlatform(): void {
  const root = document.documentElement
  root.classList.add(isNativeApp ? 'is-native' : 'is-web')
  if (!isNativeApp && isInstalledPwa()) root.classList.add('is-pwa')

  if (isNativeApp) return // داخل التطبيق: لا Service Worker (الملفات محلية أصلاً)

  // طلب تخزين دائم حتى لا يمسح المتصفح بيانات التقدم (IndexedDB) عند ضيق المساحة
  void navigator.storage?.persist?.().catch(() => undefined)

  // PWA: يعمل في النسخة المنشورة فقط، وليس أثناء التطوير
  if (import.meta.env.PROD) {
    const updateSW = registerSW({
      immediate: true,
      // اترك القرار لولي الأمر، ثم أعد تحميل الصفحة بعد تثبيت النسخة الجديدة.
      onNeedRefresh() {
        if (window.confirm('يتوفر تحديث جديد للمنصة. هل تريد تثبيته الآن؟')) {
          void updateSW(true)
        }
      },
    })
  }
}
