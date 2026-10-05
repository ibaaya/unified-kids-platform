import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// الخطوط مدمجة مع التطبيق (بدون Google Fonts): تعمل بدون إنترنت، وتناسب سياسات تطبيقات الأطفال.
// تُستورد بعد index.css عمداً حتى تتقدّم على @font-face المحلي هناك.
import '@fontsource/cairo/arabic-400.css'
import '@fontsource/cairo/arabic-500.css'
import '@fontsource/cairo/arabic-600.css'
import '@fontsource/cairo/arabic-700.css'
import '@fontsource/cairo/arabic-800.css'
import '@fontsource/cairo/latin-400.css'
import '@fontsource/cairo/latin-600.css'
import '@fontsource/cairo/latin-700.css'
import '@fontsource/baloo-bhaijaan-2/arabic-500.css'
import '@fontsource/baloo-bhaijaan-2/arabic-600.css'
import '@fontsource/baloo-bhaijaan-2/arabic-700.css'
import '@fontsource/baloo-bhaijaan-2/arabic-800.css'
import '@fontsource/baloo-bhaijaan-2/latin-600.css'
import '@fontsource/baloo-bhaijaan-2/latin-700.css'
import './styles/platform.css'
import { initPlatform } from './platform/initPlatform'
import { hydrateRecordedAudioManifest } from './engine/recordedAudioManager'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

initPlatform()
void hydrateRecordedAudioManifest()
