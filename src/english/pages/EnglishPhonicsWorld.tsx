import { ParentButton } from '../../components/ui/ParentButton'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import lettersData from '../data/letters.json'
import wordsData from '../data/words.json'
import { speakEnglish, speakWord } from '../engine/soundManager'
import { QuizRunner } from '../components/QuizRunner'
import { buildLetterQuiz } from '../engine/quizEngine'

type EnglishLetter = {
  id: string; name: string; uppercase: string; lowercase: string
  phonicSound: string; imageEmoji: string; exampleWord: string; order: number
}
type EnglishWord = {
  id: string; text: string; letterId: string; position: 'start'|'middle'|'end'
  imageEmoji: string; soundId: string; difficulty: number
}

const letters = lettersData as EnglishLetter[]
const words = wordsData as EnglishWord[]

// Phonics grouping: CVC words, blends, etc.
const PHONIC_GROUPS = [
  { id: 'vowels', label: 'Vowels', emoji: '🎵', letters: ['A','E','I','O','U'], color: '#8b5fbf' },
  { id: 'consonants-soft', label: 'Soft Sounds', emoji: '🌬️', letters: ['F','H','L','M','N','R','S','V','W'], color: '#2fb68c' },
  { id: 'consonants-hard', label: 'Hard Sounds', emoji: '💥', letters: ['B','D','G','J','K','P','T'], color: '#e85d75' },
  { id: 'special', label: 'Special Sounds', emoji: '✨', letters: ['C','Q','X','Y','Z'], color: '#ff9f45' },
]

export function EnglishPhonicsWorld() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedLetter, setSelectedLetter] = useState<EnglishLetter | null>(null)
  const [quizActive, setQuizActive] = useState(false)

  const currentGroup = PHONIC_GROUPS.find((g) => g.id === selectedGroup)
  const groupLetters = currentGroup ? letters.filter((l) => currentGroup.letters.includes(l.id)) : []

  if (quizActive && selectedLetter) {
    return <PhonicsQuiz letter={selectedLetter} onBack={() => setQuizActive(false)} />
  }

  if (selectedLetter) {
    const letterWords = words.filter((w) => w.letterId === selectedLetter.id).slice(0, 6)
    return (
      <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #e8f0fe 100%)' }} dir="ltr">
        
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-6 rounded-3xl bg-white/85 p-6 text-center shadow-xl border-2"
            style={{ borderColor: 'rgba(139,95,191,0.3)' }}>
            <button onClick={() => speakEnglish(`${selectedLetter.name}. ${selectedLetter.phonicSound}. ${selectedLetter.exampleWord}`)}
              className="transition hover:scale-110">
              <div className="text-8xl font-extrabold" style={{ color: '#8b5fbf' }}>{selectedLetter.uppercase}</div>
            </button>
            <div className="text-5xl font-bold" style={{ color: '#6d4ea6' }}>{selectedLetter.lowercase}</div>
            <p className="mt-2 text-xl font-bold" style={{ color: '#1e3a8a' }}>{selectedLetter.name}</p>
            <p className="text-sm font-semibold text-gray-500">{selectedLetter.phonicSound}</p>
            <div className="mt-3 flex justify-center gap-3">
              <button onClick={() => speakEnglish(selectedLetter.name)}
                className="rounded-2xl px-4 py-2 text-sm font-bold text-white shadow"
                style={{ background: '#8b5fbf' }}>🔊 Say Letter</button>
              <button onClick={() => speakWord(selectedLetter.exampleWord)}
                className="rounded-2xl px-4 py-2 text-sm font-bold text-white shadow"
                style={{ background: '#2fb68c' }}>🔊 {selectedLetter.exampleWord}</button>
              <button onClick={() => setQuizActive(true)}
                className="rounded-2xl px-4 py-2 text-sm font-bold text-white shadow"
                style={{ background: '#e85d75' }}>🎮 Quiz</button>
            </div>
          </div>

          <h3 className="mb-3 text-lg font-extrabold" style={{ color: '#1e3a8a' }}>
            Words with letter {selectedLetter.uppercase}:
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {letterWords.map((word) => (
              <button key={word.id} onClick={() => speakWord(word.text)}
                className="flex flex-col items-center rounded-2xl border-2 bg-white/85 p-3 text-center transition hover:scale-105"
                style={{ borderColor: 'rgba(139,95,191,0.2)' }}>
                <span className="text-3xl">{word.imageEmoji}</span>
                <span className="mt-1 text-sm font-bold">{word.text}</span>
                <span className="text-xs text-gray-400">🔊</span>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => setSelectedLetter(null)}
              className="rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
              style={{ borderColor: '#8b5fbf', color: '#8b5fbf' }}>
              ← Back to Group
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGroup && currentGroup) {
    return (
      <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #e8f0fe 100%)' }} dir="ltr">
        
        <div className="mx-auto max-w-2xl px-4 py-6">
          <h1 className="mb-2 text-center text-2xl font-extrabold" style={{ color: '#1e3a8a' }}>
            {currentGroup.emoji} {currentGroup.label}
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">Tap a letter to learn its sound</p>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
            {groupLetters.map((letter) => (
              <button key={letter.id} onClick={() => { setSelectedLetter(letter); speakEnglish(letter.name) }}
                className="flex flex-col items-center rounded-3xl border-2 p-4 text-center transition-all hover:scale-105"
                style={{ background: `color-mix(in srgb, ${currentGroup.color} 12%, white)`, borderColor: `color-mix(in srgb, ${currentGroup.color} 35%, white)` }}>
                <div className="text-5xl font-extrabold" style={{ color: currentGroup.color }}>{letter.uppercase}</div>
                <div className="text-3xl font-bold" style={{ color: `color-mix(in srgb, ${currentGroup.color} 70%, #555)` }}>{letter.lowercase}</div>
                <div className="mt-1 text-2xl">{letter.imageEmoji}</div>
                <div className="mt-1 text-xs font-semibold text-gray-500">{letter.exampleWord}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => setSelectedGroup(null)}
              className="rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
              style={{ borderColor: currentGroup.color, color: currentGroup.color }}>
              ← Back to Groups
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #e8f0fe 100%)' }} dir="ltr">
      
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-6 rounded-3xl bg-white/85 p-4 text-center shadow-xl border-2" style={{ borderColor: 'rgba(139,95,191,0.3)' }}>
          <h1 className="text-3xl font-extrabold" style={{ color: '#1e3a8a' }}>🎵 Sounds World</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Learn how letters sound — Phonics!</p>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {PHONIC_GROUPS.map((group) => (
            <button key={group.id} onClick={() => setSelectedGroup(group.id)}
              className="flex flex-col items-center rounded-3xl border-2 p-6 text-center transition-all hover:scale-105"
              style={{ background: `color-mix(in srgb, ${group.color} 10%, white)`, borderColor: `color-mix(in srgb, ${group.color} 35%, white)`, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
              <div className="text-5xl">{group.emoji}</div>
              <h2 className="mt-3 text-lg font-extrabold" style={{ color: group.color }}>{group.label}</h2>
              <p className="mt-1 text-xs text-gray-500">{group.letters.length} letters</p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/english"
            className="inline-flex items-center gap-2 rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
            style={{ borderColor: '#8b5fbf', color: '#8b5fbf' }}>
            🌍 English Menu
          </Link>
        </div>
      </div>
    </div>
  )
}

// اختبار Sounds World — يستخدم محرك الأسئلة المشترك:
// خيارات ثابتة، إجابة صحيحة واحدة، وإعادة محاولة دون كشف الإجابة
function PhonicsQuiz({ letter, onBack }: { letter: EnglishLetter; onBack: () => void }) {
  return (
    <>
      <QuizRunner
        build={() => buildLetterQuiz(letter, {
          kinds: ['start', 'start', 'contains', 'end', 'whereIs'],
          total: 5,
          optionCount: 4,
        })}
        accent="#8b5fbf"
        background="linear-gradient(135deg, #f3e8ff 0%, #e8f0fe 100%)"
        onExit={onBack}
        exitLabel="Exit quiz"
        emptyMessage="No quiz available for this letter yet."
      />
      {/* زر ولي الأمر */}
      <ParentButton section="english" />
    </>
  )
}
