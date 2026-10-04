import { ParentButton } from '../../components/ui/ParentButton'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import sentencesData from '../data/sentences.json'
import { speakSentence, speakEnglish } from '../engine/soundManager'
import { HomeButton } from '../../components/ui/HomeButton'

type EnglishSentence = {
  id: string; letterId: string; text: string; words: string[]
  imageEmoji: string; audioPrompt: string
}

const sentences = sentencesData as EnglishSentence[]
const PAGE_SIZE = 10

export function EnglishSentencesWorld() {
  const [page, setPage] = useState(0)
  const [completed, setCompleted] = useState<string[]>([])
  const [quizSentence, setQuizSentence] = useState<EnglishSentence | null>(null)

  const totalPages = Math.ceil(sentences.length / PAGE_SIZE)
  const pageSentences = sentences.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  if (quizSentence) {
    return <SentenceQuiz sentence={quizSentence} onBack={() => setQuizSentence(null)}
      onComplete={() => { setCompleted((c) => [...new Set([...c, quizSentence.id])]); setQuizSentence(null) }} />
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #e8f4fe 0%, #fef0f8 100%)' }} dir="ltr">
      <HomeButton />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 rounded-3xl bg-white/85 p-4 text-center shadow-xl border-2" style={{ borderColor: 'rgba(58,160,217,0.3)' }}>
          <h1 className="text-3xl font-extrabold" style={{ color: '#0c4a6e' }}>💬 Sentences World</h1>
          <p className="mt-1 text-sm text-gray-500">Read, listen, and understand English sentences!</p>
          <div className="mt-2 text-sm font-semibold" style={{ color: '#3aa0d9' }}>
            Completed: {completed.length} / {sentences.length}
          </div>
        </header>

        {/* Side list + main grid layout */}
        <div className="flex gap-4">
          {/* Sidebar: all sentences list */}
          <div className="hidden w-48 flex-shrink-0 overflow-y-auto rounded-2xl bg-white/75 p-3 shadow-md sm:block" style={{ maxHeight: '600px' }}>
            <p className="mb-2 text-xs font-bold text-gray-500 uppercase">All Sentences</p>
            {sentences.map((s, i) => (
              <button key={s.id}
                onClick={() => { setPage(Math.floor(i / PAGE_SIZE)); setQuizSentence(s) }}
                className={`mb-1 w-full rounded-xl px-2 py-1.5 text-left text-xs font-semibold transition hover:scale-105 ${
                  completed.includes(s.id) ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600'
                }`}>
                {completed.includes(s.id) ? '✅ ' : `${i+1}. `}{s.imageEmoji} {s.text.slice(0, 20)}...
              </button>
            ))}
          </div>

          {/* Main Sentences Grid */}
          <div className="flex-1">
            <div className="space-y-3">
              {pageSentences.map((sentence) => (
                <div key={sentence.id}
                  className="flex items-center gap-3 overflow-hidden rounded-2xl border-2 bg-white/85 p-3 shadow-md transition-all hover:shadow-lg"
                  style={{ borderColor: completed.includes(sentence.id) ? '#2fb68c' : 'rgba(58,160,217,0.2)' }}>
                  <span className="flex-shrink-0 text-4xl">{sentence.imageEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold" style={{ color: '#0c4a6e' }}>{sentence.text}</p>
                    <p className="text-xs text-gray-400">Letter: {sentence.letterId}</p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <button onClick={() => speakSentence(sentence.text)}
                      className="rounded-xl p-2 text-sm font-bold text-white shadow transition hover:scale-110"
                      style={{ background: '#3aa0d9' }}>
                      🔊
                    </button>
                    <button onClick={() => setQuizSentence(sentence)}
                      className={`rounded-xl px-2 py-1 text-xs font-bold shadow transition hover:scale-105 ${
                        completed.includes(sentence.id) ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
                      }`}>
                      {completed.includes(sentence.id) ? '✅' : '🎮'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className="h-9 w-9 rounded-xl text-sm font-bold shadow transition hover:scale-110"
                    style={{
                      background: page === i ? '#3aa0d9' : 'rgba(255,255,255,0.8)',
                      color: page === i ? 'white' : '#374151',
                    }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/english"
            className="inline-flex items-center gap-2 rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
            style={{ borderColor: '#3aa0d9', color: '#0c4a6e' }}>
            🌍 English Menu
          </Link>
        </div>
      </div>
    </div>
  )
}

function SentenceQuiz({ sentence, onBack, onComplete }: {
  sentence: EnglishSentence; onBack: () => void; onComplete: () => void
}) {
  const [step, setStep] = useState<'listen'|'arrange'|'done'>('listen')
  const [arranged, setArranged] = useState<string[]>([])
  const [remaining, setRemaining] = useState(() => [...sentence.words].sort(() => Math.random() - 0.5))
  const [error, setError] = useState(false)

  const addWord = (word: string, index: number) => {
    setArranged((a) => [...a, word])
    setRemaining((r) => r.filter((_, i) => i !== index))
    setError(false)
  }

  const removeWord = (index: number) => {
    const word = arranged[index]
    setArranged((a) => a.filter((_, i) => i !== index))
    setRemaining((r) => [...r, word])
  }

  const checkAnswer = () => {
    const correct = sentence.words.join(' ').toLowerCase()
    const given = arranged.join(' ').toLowerCase()
    if (correct === given) { setStep('done'); speakEnglish('Excellent! Well done!') }
    else { setError(true); speakEnglish('Try again!') }
  }

  if (step === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #e8f4fe 0%, #fef0f8 100%)' }} dir="ltr">
        <div className="mx-auto max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="text-7xl">🌟</div>
          <h2 className="mt-4 text-3xl font-extrabold" style={{ color: '#0c4a6e' }}>Perfect!</h2>
          <p className="mt-2 text-lg font-bold" style={{ color: '#3aa0d9' }}>{sentence.text}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => { onComplete(); speakSentence(sentence.text) }}
              className="rounded-2xl px-5 py-3 font-bold text-white shadow" style={{ background: '#2fb68c' }}>
              ✅ Next
            </button>
            <button onClick={onBack}
              className="rounded-2xl px-5 py-3 font-bold text-white shadow" style={{ background: '#4f80e2' }}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #e8f4fe 0%, #fef0f8 100%)' }} dir="ltr">
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        {step === 'listen' && (
          <>
            <h2 className="mb-4 text-center text-xl font-extrabold" style={{ color: '#0c4a6e' }}>
              Listen to the sentence 👂
            </h2>
            <div className="mb-4 text-center text-6xl">{sentence.imageEmoji}</div>
            <button onClick={() => speakSentence(sentence.text)}
              className="mx-auto mb-6 flex items-center gap-2 rounded-2xl px-6 py-3 font-bold text-white shadow-md transition hover:scale-105"
              style={{ background: '#3aa0d9' }}>
              🔊 Listen Again
            </button>
            <p className="mb-4 text-center text-lg font-bold" style={{ color: '#0c4a6e' }}>{sentence.text}</p>
            <button onClick={() => { setStep('arrange'); setArranged([]); setRemaining([...sentence.words].sort(() => Math.random() - 0.5)) }}
              className="mx-auto flex rounded-2xl px-6 py-3 font-bold text-white shadow transition hover:scale-105"
              style={{ background: '#8b5fbf' }}>
              🧩 Arrange the Words →
            </button>
          </>
        )}

        {step === 'arrange' && (
          <>
            <h2 className="mb-4 text-center text-xl font-extrabold" style={{ color: '#0c4a6e' }}>
              Put the words in order! 🧩
            </h2>
            <button onClick={() => speakSentence(sentence.text)}
              className="mx-auto mb-3 flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
              style={{ background: '#3aa0d9' }}>
              🔊 Hint
            </button>

            {/* Answer area */}
            <div className="mb-4 min-h-16 rounded-2xl border-2 border-dashed p-3 flex flex-wrap gap-2"
              style={{ borderColor: error ? '#ef4444' : 'rgba(58,160,217,0.4)', background: 'rgba(232,244,254,0.5)' }}>
              {arranged.length === 0
                ? <span className="text-sm text-gray-400">Tap words below to build the sentence</span>
                : arranged.map((w, i) => (
                    <button key={`arr-${i}`} onClick={() => removeWord(i)}
                      className="rounded-xl bg-blue-500 px-3 py-1 text-sm font-bold text-white shadow transition hover:bg-red-400">
                      {w} ✕
                    </button>
                  ))
              }
            </div>
            {error && <p className="mb-2 text-center text-sm font-bold text-red-500">Not quite right — try again! 😊</p>}

            {/* Word bank */}
            <div className="mb-4 flex flex-wrap gap-2">
              {remaining.map((w, i) => (
                <button key={`rem-${i}`} onClick={() => addWord(w, i)}
                  className="rounded-xl border-2 bg-white px-3 py-1.5 text-sm font-bold shadow transition hover:scale-105"
                  style={{ borderColor: '#3aa0d9', color: '#0c4a6e' }}>
                  {w}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              {arranged.length === sentence.words.length && (
                <button onClick={checkAnswer}
                  className="rounded-2xl px-5 py-2 font-bold text-white shadow transition hover:scale-105"
                  style={{ background: '#2fb68c' }}>
                  ✓ Check
                </button>
              )}
              <button onClick={() => { setArranged([]); setRemaining([...sentence.words].sort(() => Math.random() - 0.5)); setError(false) }}
                className="rounded-2xl border-2 bg-white px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
                style={{ borderColor: '#e85d75', color: '#e85d75' }}>
                🔄 Reset
              </button>
            </div>

            <div className="mt-4 text-center">
              <button onClick={onBack} className="text-sm text-gray-500 underline">Exit</button>
            </div>
          </>
        )}
      </div>
    
      {/* زر ولي الأمر */}
      <ParentButton section="english" />
    </div>
  )
}
