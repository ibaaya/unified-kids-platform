/**
 * App.tsx — بدون تغيير في الهيكل
 * التعديل الوحيد: إضافة AudioUnlockProvider يلفّ AppShell
 */
import { BrowserRouter } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { FirstVisitDedication } from './components/Dedication'
import { AudioUnlockProvider } from './components/AudioUnlockProvider'

function App() {
  return (
    <BrowserRouter>
      {/* ✅ يلتقط أول تفاعل في أي مكان ويفتح نافذة الصوت للجلسة كلها */}
      <AudioUnlockProvider>
        <AppShell />
        <FirstVisitDedication />
      </AudioUnlockProvider>
    </BrowserRouter>
  )
}

export default App