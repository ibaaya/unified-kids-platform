import { ParentButton } from '../../components/ui/ParentButton'
import { Link } from 'react-router-dom'
import lettersData from '../data/letters.json'
import { speakLetter } from '../engine/soundManager'

type EnglishLetter = {
  id: string; name: string; uppercase: string; lowercase: string
  phonicSound: string; imageEmoji: string; exampleWord: string; order: number
}

const letters = lettersData as EnglishLetter[]

const LETTER_COLORS = [
  '#4f80e2','#e85d75','#2fb68c','#ff9f45','#8b5fbf',
  '#3aa0d9','#ffd166','#06d6a0','#ef476f','#118ab2',
  '#ffd166','#06d6a0','#4f80e2','#e85d75','#2fb68c',
  '#ff9f45','#8b5fbf','#3aa0d9','#ffd166','#06d6a0',
  '#ef476f','#118ab2','#4f80e2','#e85d75','#2fb68c','#ff9f45',
]

export function EnglishLettersWorld() {
  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #fef9e7 100%)' }} dir="ltr">
      
      <div className="relative mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <header className="mb-6 rounded-3xl border-2 p-4 text-center"
          style={{ background: 'rgba(255,255,255,0.82)', borderColor: 'rgba(79,128,226,0.4)', boxShadow: '0 8px 24px rgba(79,128,226,0.12)' }}>
          <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #4f80e2, #8b5fbf)' }} />
          <h1 className="text-3xl font-extrabold" style={{ color: '#1e3a8a' }}>🔤 Letters World</h1>
          <p className="mt-1 text-base font-semibold" style={{ color: '#4b5563' }}>
            Learn all 26 letters of the English alphabet!
          </p>
        </header>

        {/* Letters Grid */}
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
          {letters.map((letter, index) => {
            const color = LETTER_COLORS[index % LETTER_COLORS.length]
            return (
              <Link
                key={letter.id}
                to={`/english/letters/${letter.id}`}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 p-2 text-center transition-all hover:scale-110 hover:-translate-y-1"
                style={{
                  background: `color-mix(in srgb, ${color} 12%, white)`,
                  borderColor: `color-mix(in srgb, ${color} 40%, white)`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
                onClick={(e) => {
                  e.preventDefault()
                  speakLetter(letter.name)
                  setTimeout(() => window.location.href = `/english/letters/${letter.id}`, 300)
                }}
              >
                <div className="text-3xl font-extrabold leading-none" style={{ color }}>{letter.uppercase}</div>
                <div className="text-lg font-bold" style={{ color: `color-mix(in srgb, ${color} 60%, #666)` }}>{letter.lowercase}</div>
                <div className="mt-1 text-lg">{letter.imageEmoji}</div>
              </Link>
            )
          })}
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link to="/english"
            className="inline-flex items-center gap-2 rounded-2xl border-2 bg-white/80 px-5 py-3 text-sm font-bold shadow-md transition hover:scale-105"
            style={{ borderColor: '#4f80e2', color: '#1e3a8a' }}>
            🌍 English Menu
          </Link>
        </div>
      </div>
    
      {/* زر ولي الأمر */}
      <ParentButton section="english" />
    </div>
  )
}
