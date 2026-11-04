import { Capacitor } from '@capacitor/core'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'

const KEY = 'anon-install-id'
const DAY_KEY = 'anon-last-ping'

/** يسجل تثبيتًا مجهولًا مرة يوميًا؛ أي عطل في العدّاد لا يؤثر في تشغيل التطبيق. */
export async function countUser(): Promise<void> {
  try {
    if (import.meta.env.DEV || typeof window === 'undefined') return
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem(DAY_KEY) === today) return

    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }

    const platform = Capacitor.isNativePlatform()
      ? Capacitor.getPlatform()
      : window.matchMedia('(display-mode: standalone)').matches ? 'pwa' : 'web'
    const config = {
      apiKey: import.meta.env.VITE_FB_API_KEY,
      projectId: import.meta.env.VITE_FB_PROJECT_ID,
      appId: import.meta.env.VITE_FB_APP_ID,
    }
    if (!config.apiKey || !config.projectId || !config.appId) return

    const app = getApps().length ? getApp() : initializeApp(config)
    await setDoc(doc(getFirestore(app), 'installs', id), {
      platform,
      lastSeen: serverTimestamp(),
    }, { merge: true })
    localStorage.setItem(DAY_KEY, today)
  } catch {
    // العدّاد لا يجب أن يعطّل التطبيق أبدًا.
  }
}
