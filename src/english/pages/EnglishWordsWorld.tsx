import { ParentButton } from '../../components/ui/ParentButton'
/**
 * EnglishWordsWorld — عالم الكلمات الإنجليزية
 * التحسينات:
 * - زر "التالي" بعد إكمال كل قسم (start/middle/end)
 * - انتقال تلقائي مع تشجيع صوتي
 * - علامة ✅ على الأقسام المكتملة
 * - قراءة الكلمات بضغطة
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import lettersData from '../data/letters.json'
import wordsData from '../data/words.json'
import { speakWord, speakEnglish } from '../engine/soundManager'
import { QuizRunner } from '../components/QuizRunner'
import { buildLetterQuiz } from '../engine/quizEngine'
import type { EnglishLetter as EnglishLetterFull } from '../engine/quizEngine'

type EnglishLetter = { id: string; name: string; uppercase: string; lowercase: string; imageEmoji: string; exampleWord: string; order: number }
type EnglishWord = { id: string; text: string; letterId: string; position: 'start' | 'middle' | 'end'; imageEmoji: string; soundId: string; difficulty: number }

const letters = lettersData as EnglishLetter[]
const words = wordsData as EnglishWord[]

const POS_ORDER: ('start' | 'middle' | 'end')[] = ['start', 'middle', 'end']
const posLabels = { start: 'At the Beginning', middle: 'In the Middle', end: 'At the End' }

export function EnglishWordsWorld() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [activePos, setActivePos] = useState<'start' | 'middle' | 'end'>('start')
  const [completedPos, setCompletedPos] = useState<string[]>([])
  const [gameMode, setGameMode] = useState(false)

  if (gameMode && selectedLetter) {
    return <WordMatchGame letterId={selectedLetter} onBack={() => setGameMode(false)} />
  }

  if (selectedLetter) {
    const letter = letters.find((l) => l.id === selectedLetter)!
    const posWords = words.filter((w) => w.letterId === selectedLetter && w.position === activePos)
    const allDone = POS_ORDER.every((p) => completedPos.includes(p))

    const markDone = () => {
      if (completedPos.includes(activePos)) return
      const updated = [...completedPos, activePos]
      setCompletedPos(updated)
      speakEnglish('Great job!')
      // انتقال تلقائي للقسم التالي
      const nextIdx = POS_ORDER.indexOf(activePos) + 1
      if (nextIdx < POS_ORDER.length) {
        setTimeout(() => setActivePos(POS_ORDER[nextIdx]), 800)
      }
    }

    return (
      <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #e8fef0 0%, #e8f0fe 100%)' }} dir="ltr">
        
        <div className="mx-auto max-w-2xl px-4 py-6">

          {/* العنوان */}
          <div className="relative mb-5 overflow-hidden rounded-3xl border-2 bg-white/85 p-4 text-center shadow-xl"
            style={{ borderColor: 'rgba(47,182,140,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl" style={{ background: 'linear-gradient(90deg,#2fb68c,#4f80e2)' }} />
            <h1 className="text-2xl font-extrabold" style={{ color: '#065f46' }}>
              Words with Letter {letter.uppercase} {letter.imageEmoji}
            </h1>
            {allDone && (
              <p className="mt-1 text-sm font-bold text-emerald-600">✅ All positions completed!</p>
            )}
          </div>

          {/* تبويبات المواضع */}
          <div className="mb-4 flex gap-2">
            {POS_ORDER.map((pos) => (
              <button key={pos} onClick={() => setActivePos(pos)}
                className="relative flex-1 rounded-2xl py-2 text-xs font-bold transition-all sm:text-sm"
                style={{
                  background: activePos === pos ? '#2fb68c' : 'rgba(255,255,255,0.7)',
                  color: activePos === pos ? 'white' : '#374151',
                }}>
                {posLabels[pos]}
                {completedPos.includes(pos) && (
                  <span className="absolute -top-1 -right-1 text-sm">✅</span>
                )}
              </button>
            ))}
          </div>

          {/* شبكة الكلمات */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {posWords.length > 0 ? posWords.map((word) => (
              <button key={word.id} onClick={() => speakWord(word.text)}
                className="flex flex-col items-center rounded-2xl border-2 bg-white/85 p-4 text-center transition-all hover:scale-105"
                style={{ borderColor: 'rgba(47,182,140,0.25)' }}>
                <span className="text-5xl">{word.imageEmoji}</span>
                <span className="mt-2 text-base font-bold" style={{ color: '#065f46' }}>
                  {word.text.split('').map((char, i) => (
                    char.toUpperCase() === letter.id
                      ? <span key={i} className="font-extrabold underline" style={{ color: '#2fb68c' }}>{char}</span>
                      : <span key={i}>{char}</span>
                  ))}
                </span>
                <span className="mt-1 text-xs text-gray-400">🔊 tap to hear</span>
              </button>
            )) : (
              <div className="col-span-3 rounded-2xl bg-white/70 p-4 text-center text-gray-500">
                No words found for this position
              </div>
            )}
          </div>

          {/* زر التالي / الإكمال */}
          {posWords.length > 0 && (
            <div className="mt-5 text-center">
              {!completedPos.includes(activePos) ? (
                <button onClick={markDone}
                  className="rounded-2xl px-6 py-3 font-bold text-white shadow-md transition hover:scale-105"
                  style={{ background: '#2fb68c' }}>
                  ✅ Done! Next Section →
                </button>
              ) : (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                  ✅ {posLabels[activePos]} completed!
                </div>
              )}
            </div>
          )}

          {/* أزرار الأسفل */}
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setGameMode(true)}
              className="rounded-2xl px-5 py-3 font-bold text-white shadow transition hover:scale-105"
              style={{ background: '#4f80e2' }}>
              🎮 Word Match Game
            </button>
            <button onClick={() => { setSelectedLetter(null); setCompletedPos([]) }}
              className="rounded-2xl border-2 bg-white/80 px-5 py-3 text-sm font-bold shadow transition hover:scale-105"
              style={{ borderColor: '#2fb68c', color: '#065f46' }}>
              ← All Letters
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ——— شبكة اختيار الحرف ———
  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #e8fef0 0%, #e8f0fe 100%)' }} dir="ltr">
      
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 rounded-3xl border-2 bg-white/85 p-4 text-center shadow-xl" style={{ borderColor: 'rgba(47,182,140,0.3)' }}>
          <h1 className="text-3xl font-extrabold" style={{ color: '#065f46' }}>📝 Words World</h1>
          <p className="mt-1 text-sm text-gray-500">Choose a letter to explore its words</p>
        </header>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-7">
          {letters.map((letter) => {
            const wordCount = words.filter((w) => w.letterId === letter.id).length
            return (
              <button key={letter.id}
                onClick={() => { setSelectedLetter(letter.id); setActivePos('start'); setCompletedPos([]); speakWord(letter.exampleWord) }}
                className="flex flex-col items-center rounded-2xl border-2 bg-white/85 p-2 text-center transition-all hover:scale-110"
                style={{ borderColor: 'rgba(47,182,140,0.3)' }}>
                <span className="text-2xl font-extrabold" style={{ color: '#2fb68c' }}>{letter.uppercase}</span>
                <span className="text-lg">{letter.imageEmoji}</span>
                <span className="text-xs text-gray-400">{wordCount}w</span>
              </button>
            )
          })}
        </div>
        <div className="mt-8 text-center">
          <Link to="/english"
            className="inline-flex items-center gap-2 rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
            style={{ borderColor: '#2fb68c', color: '#065f46' }}>
            🌍 English Menu
          </Link>
        </div>
      </div>
    </div>
  )
}

// ——— لعبة مطابقة الكلمات ———
// الأسئلة تُبنى من محرك الأسئلة المشترك:
//  - كل الخيارات كلمات فريدة (بدون تكرار)، وكلمة واحدة فقط تطابق السؤال
//  - المشتّتات لا تحتوي الحرف المسؤول عنه إطلاقاً
//  - إعادة المحاولة عند الخطأ دون كشف الإجابة
function WordMatchGame({ letterId, onBack }: { letterId: string; onBack: () => void }) {
  const letter = letters.find((l) => l.id === letterId)!
  return (
    <>
      <QuizRunner
        build={() => buildLetterQuiz(letter as EnglishLetterFull, {
          kinds: ['contains', 'start', 'contains', 'middle', 'end', 'contains'],
          total: 6,
          optionCount: 4,
        })}
        accent="#2fb68c"
        background="linear-gradient(135deg, #e8fef0 0%, #e8f0fe 100%)"
        onExit={onBack}
        exitLabel="Exit game"
        emptyMessage="No words available for this game yet."
      />
      {/* زر ولي الأمر */}
      <ParentButton section="english" />
    </>
  )
}
