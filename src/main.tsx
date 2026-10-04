import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { hydrateRecordedAudioManifest } from './engine/recordedAudioManager'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

void hydrateRecordedAudioManifest()
