/**
 * EnglishLetterDetail — صفحة تفاصيل الحرف الإنجليزي
 * التحسينات:
 * - أسئلة صحيحة: الكلمة المعروضة تبدأ/تحتوي/تنتهي بالحرف الصحيح
 * - الخيارات ثابتة (لا تتغير مواضعها بعد الإجابة)
 * - إعادة المحاولة عند الخطأ
 * - قراءة السؤال تلقائياً مع زر سماعة
 * - إنجاز tab الكلمات مع زر "التالي"
 * - علامة ✅ عند إكمال القسم
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import lettersData from '../data/letters.json'
import wordsData from '../data/words.json'
import { speakEnglish, speakWord, speakLetter } from '../engine/soundManager'
import { HomeButton } from '../../components/ui/HomeButton'
import { loadEnglishSettings } from './EnglishParentDashboard'
import { QuizRunner } from '../components/QuizRunner'
import { buildLetterQuiz } from '../engine/quizEngine'

type EnglishLetter = {
  id: string; name: string; uppercase: string; lowercase: string
  phonicSound: string; imageEmoji: string; exampleWord: string; order: number
}
type EnglishWord = {
  id: string; text: string; letterId: string; position: 'start' | 'middle' | 'end'
  imageEmoji: string; soundId: string; difficulty: number
}

const letters = lettersData as EnglishLetter[]
const words = wordsData as EnglishWord[]
const POSITIONS = ['start', 'middle', 'end'] as const
const positionLabel: Record<string, string> = {
  start: 'At the Beginning',
  middle: 'In the Middle',
  end: 'At the End',
}
// positionQuestion مُدمج في buildQuestionText

// ——— مفتاح حفظ الإنجاز ———
const PROGRESS_KEY = 'english-progress-v1'
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') } catch { return {} }
}
function saveProgress(data: object) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data))
}

export function EnglishLetterDetail() {
  const { letterId } = useParams<{ letterId: string }>()
  const letter = letters.find((l) => l.id === letterId)
  const settings = loadEnglishSettings()
  const [activePos, setActivePos] = useState<'start' | 'middle' | 'end'>('start')
  const [completedPositions, setCompletedPositions] = useState<string[]>([])
  const [quizMode, setQuizMode] = useState(false)

  // تلاوة اسم الحرف عند الفتح
  useEffect(() => {
    if (letter && settings.autoReadQuestion) {
      setTimeout(() => speakLetter(letter.name), 500)
    }
  }, [letter?.id])

  if (!letter) {
    return (
      <div className="flex min-h-screen items-center justify-center" dir="ltr">
        <div className="text-center">
          <p className="text-2xl">Letter not found</p>
          <Link to="/english/letters" className="mt-4 inline-block rounded-xl bg-blue-500 px-4 py-2 text-white">← Back</Link>
        </div>
      </div>
    )
  }

  const posWords = words.filter((w) => w.letterId === letter.id && w.position === activePos)
  const prevLetter = letters.find((l) => l.order === letter.order - 1)
  const nextLetter = letters.find((l) => l.order === letter.order + 1)

  // إبراز الحرف في الكلمة
  function highlightLetter(word: string, lid: string) {
    return word.split('').map((ch, i) =>
      ch.toUpperCase() === lid.toUpperCase()
        ? <span key={i} className="font-extrabold underline" style={{ color: '#4f80e2' }}>{ch}</span>
        : <span key={i}>{ch}</span>
    )
  }

  // إكمال قسم الكلمات
  const markPositionDone = (pos: string) => {
    if (!completedPositions.includes(pos)) {
      const updated = [...completedPositions, pos]
      setCompletedPositions(updated)
      // حفظ إنجاز الحرف إذا أكمل الثلاثة أقسام
      if (updated.length === 3) {
        const prog = loadProgress()
        const letters = prog.completedLetters || []
        if (!letters.includes(letter.id)) {
          saveProgress({ ...prog, completedLetters: [...letters, letter.id] })
        }
      }
    }
  }

  if (quizMode) {
    return (
      <LetterQuiz letter={letter} onBack={() => setQuizMode(false)} />
    )
  }

  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #fef9e7 100%)' }}
      dir="ltr"
    >
      <HomeButton />
      <div className="mx-auto max-w-2xl px-4 py-6">

        {/* ——— بطاقة الحرف ——— */}
        <div
          className="relative mb-6 overflow-hidden rounded-3xl border-2 p-6 text-center shadow-xl"
          style={{ background: 'rgba(255,255,255,0.88)', borderColor: 'rgba(79,128,226,0.3)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-2" style={{ background: 'linear-gradient(90deg, #4f80e2, #8b5fbf)' }} />

          {/* الحرف الكبير مع زر الاستماع */}
          <button
            onClick={() => speakLetter(letter.name)}
            className="mb-1 block w-full transition-transform hover:scale-110 active:scale-95"
            title="Hear the letter"
          >
            <div className="text-[7rem] font-extrabold leading-none" style={{ color: '#4f80e2' }}>
              {letter.uppercase}
            </div>
          </button>

          <div className="text-[4rem] font-bold leading-none" style={{ color: '#8b5fbf' }}>
            {letter.lowercase}
          </div>
          <p className="mt-2 text-xl font-bold" style={{ color: '#1e3a8a' }}>{letter.name}</p>
          <p className="mt-1 text-sm font-semibold text-gray-500">{letter.phonicSound}</p>
          <p className="mt-2 text-4xl">{letter.imageEmoji}</p>
          <p className="mt-1 text-lg font-bold" style={{ color: '#2fb68c' }}>{letter.exampleWord}</p>

          {/* أزرار الإجراءات */}
          <div className="mt-4 flex justify-center flex-wrap gap-2">
            <button
              onClick={() => speakLetter(letter.name)}
              className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105"
              style={{ background: '#4f80e2' }}
            >
              🔊 Hear Letter
            </button>
            <button
              onClick={() => speakWord(letter.exampleWord)}
              className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105"
              style={{ background: '#2fb68c' }}
            >
              🔊 {letter.exampleWord}
            </button>
            <button
              onClick={() => setQuizMode(true)}
              className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105"
              style={{ background: '#8b5fbf' }}
            >
              🎮 Play Quiz
            </button>
          </div>
        </div>

        {/* ——— تبويبات مواضع الحرف ——— */}
        <div className="mb-4 flex gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setActivePos(pos)}
              className="relative flex-1 rounded-2xl py-2 text-xs font-bold transition-all sm:text-sm"
              style={{
                background: activePos === pos ? '#4f80e2' : 'rgba(255,255,255,0.7)',
                color: activePos === pos ? 'white' : '#374151',
                boxShadow: activePos === pos ? '0 4px 12px rgba(79,128,226,0.3)' : 'none',
              }}
            >
              {positionLabel[pos]}
              {completedPositions.includes(pos) && (
                <span className="absolute -top-1 -right-1 text-sm">✅</span>
              )}
            </button>
          ))}
        </div>

        {/* ——— شبكة الكلمات ——— */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {posWords.length > 0 ? posWords.map((word) => (
            <button
              key={word.id}
              onClick={() => speakWord(word.text)}
              className="flex flex-col items-center rounded-2xl border-2 p-3 text-center transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.85)', borderColor: 'rgba(79,128,226,0.25)' }}
            >
              <span className="mb-1 text-4xl">{word.imageEmoji}</span>
              <span className="text-base font-bold" style={{ color: '#1f2937' }}>
                {highlightLetter(word.text, letter.id)}
              </span>
              <span className="mt-1 text-xs text-gray-400">🔊 tap to hear</span>
            </button>
          )) : (
            <div className="col-span-3 rounded-2xl bg-white/70 p-4 text-center text-gray-500">
              No words in this position yet
            </div>
          )}
        </div>

        {/* ——— زر "التالي / إكمال القسم" ——— */}
        {posWords.length > 0 && (
          <div className="mt-4 text-center">
            {!completedPositions.includes(activePos) ? (
              <button
                onClick={() => {
                  markPositionDone(activePos)
                  speakEnglish('Great job! Section complete!')
                  // الانتقال التلقائي للقسم التالي
                  const nextPos = activePos === 'start' ? 'middle' : activePos === 'middle' ? 'end' : null
                  if (nextPos) setTimeout(() => setActivePos(nextPos), 800)
                }}
                className="rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105"
                style={{ background: '#2fb68c' }}
              >
                ✅ Done with {positionLabel[activePos]} — Next Section →
              </button>
            ) : (
              <div className="rounded-2xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700 border border-green-200">
                ✅ {positionLabel[activePos]} completed!
              </div>
            )}
          </div>
        )}

        {/* ——— تنقل بين الحروف ——— */}
        <div className="mt-6 flex justify-between">
          {prevLetter ? (
            <Link to={`/english/letters/${prevLetter.id}`}
              className="rounded-2xl border-2 bg-white/80 px-4 py-2 font-bold shadow transition hover:scale-105"
              style={{ borderColor: '#4f80e2', color: '#1e3a8a' }}>
              ← {prevLetter.uppercase} — {prevLetter.name}
            </Link>
          ) : <div />}
          {nextLetter && (
            <Link to={`/english/letters/${nextLetter.id}`}
              className="rounded-2xl border-2 bg-white/80 px-4 py-2 font-bold shadow transition hover:scale-105"
              style={{ borderColor: '#4f80e2', color: '#1e3a8a' }}>
              {nextLetter.name} — {nextLetter.uppercase} →
            </Link>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/english/letters"
            className="inline-flex items-center gap-2 rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
            style={{ borderColor: '#4f80e2', color: '#1e3a8a' }}>
            🔤 All Letters
          </Link>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// ——— اختبار الحرف ———
// الأسئلة تُبنى من محرك الأسئلة المشترك (quizEngine):
//  - السؤال عن كلمة ← الخيارات كلمات (وليست حروفاً)
//  - Which word STARTS / has the letter in the MIDDLE / ENDS / CONTAINS
//  - Where is the letter ... in this word?
//  - إجابة صحيحة واحدة فقط، وخيارات ثابتة، وإعادة محاولة دون كشف الإجابة
// ═══════════════════════════════════════════════════
function LetterQuiz({ letter, onBack }: { letter: EnglishLetter; onBack: () => void }) {
  return (
    <QuizRunner
      build={() => buildLetterQuiz(letter, {
        kinds: ['start', 'middle', 'end', 'contains', 'whereIs', 'start'],
        total: 6,
        optionCount: 4,
      })}
      accent="#4f80e2"
      background="linear-gradient(135deg, #e8f0fe 0%, #fef9e7 100%)"
      onExit={onBack}
      exitLabel="Back to letter"
      emptyMessage="No words available yet for this letter."
    />
  )
}
