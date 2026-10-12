import { BrowserRouter } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { FirstVisitDedication } from './components/Dedication'

function App() {
  return (
    <BrowserRouter>
      <AppShell />
      <FirstVisitDedication />
    </BrowserRouter>
  )
}

export default App
