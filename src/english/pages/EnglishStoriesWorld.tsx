import { ParentButton } from '../../components/ui/ParentButton'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import storiesData from '../data/stories.json'
import { speakSentence, speakEnglish } from '../engine/soundManager'
import { loadEnglishSettings } from './EnglishParentDashboard'

type StoryPage = { text: string; imageEmoji: string; soundId: string }
type CompQ = { question: string; options: string[]; correctIndex: number }
type EnglishStory = { id: string; title: string; theme: string; pages: StoryPage[]; comprehensionQuestions: CompQ[]; newWordIds: string[] }

const stories = storiesData as EnglishStory[]
const PAGE_SIZE = 6

export function EnglishStoriesWorld() {
  const [page, setPage] = useState(0)
  const [selectedStory, setSelectedStory] = useState<EnglishStory | null>(null)
  const [completed, setCompleted] = useState<string[]>([])

  const totalPages = Math.ceil(stories.length / PAGE_SIZE)
  const pageStories = stories.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  if (selectedStory) {
    return (
      <StoryReader
        story={selectedStory}
        onBack={() => setSelectedStory(null)}
        onComplete={() => setCompleted((c) => [...new Set([...c, selectedStory.id])])}
      />
    )
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #fef0f8 0%, #e8f0fe 100%)' }} dir="ltr">
      
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 rounded-3xl bg-white/85 p-4 text-center shadow-xl border-2" style={{ borderColor: 'rgba(232,93,117,0.3)' }}>
          <h1 className="text-3xl font-extrabold" style={{ color: '#881337' }}>📚 Stories World</h1>
          <p className="mt-1 text-sm text-gray-500">Read fun stories and answer questions!</p>
        </header>

        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="hidden w-40 flex-shrink-0 overflow-y-auto rounded-2xl bg-white/75 p-3 shadow-md sm:block" style={{ maxHeight: '520px' }}>
            <p className="mb-2 text-xs font-bold text-gray-500 uppercase">All Stories</p>
            {stories.map((s, i) => (
              <button key={s.id} onClick={() => setSelectedStory(s)}
                className={`mb-1 w-full rounded-xl px-2 py-1.5 text-left text-xs font-semibold transition hover:scale-105 ${
                  completed.includes(s.id) ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600'
                }`}>
                {completed.includes(s.id) ? '✅ ' : `${i+1}. `}{s.title.slice(0, 18)}...
              </button>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pageStories.map((story) => (
                <button key={story.id} onClick={() => setSelectedStory(story)}
                  className={`relative flex flex-col overflow-hidden rounded-3xl border-2 p-4 text-left transition-all hover:scale-105 hover:-translate-y-1 ${
                    completed.includes(story.id) ? 'border-green-300' : 'border-pink-200'
                  }`}
                  style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
                  {completed.includes(story.id) && (
                    <span className="absolute right-3 top-3 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">✅ Done</span>
                  )}
                  <div className="mb-3 text-5xl">{story.pages[0].imageEmoji}</div>
                  <h3 className="text-base font-extrabold" style={{ color: '#881337' }}>{story.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{story.pages.length} pages · {story.comprehensionQuestions.length} questions</p>
                  <div className="mt-3 rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-semibold" style={{ color: '#e85d75' }}>
                    📖 Read Story →
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className="h-9 w-9 rounded-xl text-sm font-bold shadow transition hover:scale-110"
                    style={{ background: page === i ? '#e85d75' : 'rgba(255,255,255,0.8)', color: page === i ? 'white' : '#374151' }}>
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
            style={{ borderColor: '#e85d75', color: '#881337' }}>
            🌍 English Menu
          </Link>
        </div>
      </div>
    </div>
  )
}

function StoryReader({ story, onBack, onComplete }: { story: EnglishStory; onBack: () => void; onComplete: () => void }) {
  const [pageIdx, setPageIdx] = useState(0)
  const [mode, setMode] = useState<'read'|'quiz'>('read')
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const settings = useMemo(() => loadEnglishSettings(), [])
  const soundOn = settings.soundEnabled !== false
  const [wrongIdx, setWrongIdx] = useState<number[]>([])
  const [solved, setSolved] = useState(false)

  const currentPage = story.pages[pageIdx]
  const isLastPage = pageIdx === story.pages.length - 1
  const currentQ = story.comprehensionQuestions[qIdx]

  // قراءة نص الصفحة تلقائياً عند دخول القصة وعند كل انتقال لصفحة أخرى
  // (زر 🔊 Listen يبقى متاحاً لإعادة السماع)
  useEffect(() => {
    if (mode !== 'read' || finished || !soundOn || !currentPage) return
    const t = window.setTimeout(() => speakSentence(currentPage.text), 500)
    return () => window.clearTimeout(t)
  }, [story.id, pageIdx, mode, finished, soundOn])

  // قراءة سؤال الفهم تلقائياً
  useEffect(() => {
    if (mode !== 'quiz' || finished || !soundOn || !settings.autoReadQuestion || !currentQ) return
    const t = window.setTimeout(() => speakEnglish(currentQ.question), 500)
    return () => window.clearTimeout(t)
  }, [mode, qIdx, finished])

  // إيقاف الصوت عند مغادرة القصة
  useEffect(() => () => { window.speechSynthesis?.cancel() }, [])

  // إجابة خاطئة: نظلل الخيار فقط ونطلب إعادة المحاولة دون كشف الإجابة الصحيحة
  const pickAnswer = (i: number) => {
    if (solved || wrongIdx.includes(i)) return
    if (i !== currentQ.correctIndex) {
      setWrongIdx((w) => [...w, i])
      if (soundOn) speakEnglish('Try again!')
      return
    }
    setSolved(true)
    if (wrongIdx.length === 0) setScore((s) => s + 1)
    if (soundOn) speakEnglish('Correct! Well done!')
    setTimeout(() => {
      setSolved(false)
      setWrongIdx([])
      if (qIdx + 1 >= story.comprehensionQuestions.length) { setFinished(true); onComplete() }
      else setQIdx((q) => q + 1)
    }, 1300)
  }

  if (finished) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #fef0f8 0%, #e8f0fe 100%)' }} dir="ltr">
        <div className="mx-auto max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="text-7xl">🌟</div>
          <h2 className="mt-4 text-3xl font-extrabold" style={{ color: '#881337' }}>Story Complete!</h2>
          <p className="mt-2 text-xl text-gray-600">Score: {score}/{story.comprehensionQuestions.length}</p>
          <button onClick={onBack}
            className="mt-6 rounded-2xl px-6 py-3 font-bold text-white shadow transition hover:scale-105"
            style={{ background: '#e85d75' }}>
            📚 Back to Stories
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'quiz') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #fef0f8 0%, #e8f0fe 100%)' }} dir="ltr">
        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-3 flex-1 rounded-full bg-gray-100">
              <div className="h-3 rounded-full bg-pink-400 transition-all" style={{ width: `${(qIdx / story.comprehensionQuestions.length) * 100}%` }} />
            </div>
            <span className="text-sm font-bold text-gray-500">{qIdx + 1}/{story.comprehensionQuestions.length}</span>
          </div>
          <h2 className="mb-4 text-center text-xl font-extrabold" style={{ color: '#881337' }}>
            {currentQ.question}
          </h2>
          <button onClick={() => speakEnglish(currentQ.question)}
            className="mx-auto mb-4 flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold text-white"
            style={{ background: '#e85d75' }}>🔊 Hear Question</button>
          {wrongIdx.length > 0 && !solved && (
            <p className="mb-3 text-center text-sm font-bold text-orange-500">🔄 Not quite — try again!</p>
          )}
          <div className="space-y-3">
            {currentQ.options.map((opt, i) => {
              let cls = 'border-gray-200 bg-white text-gray-700'
              if (solved && i === currentQ.correctIndex) cls = 'border-green-400 bg-green-50 text-green-700'
              else if (wrongIdx.includes(i)) cls = 'border-red-400 bg-red-50 text-red-700 opacity-75'
              return (
                <button key={i} onClick={() => pickAnswer(i)}
                  disabled={solved || wrongIdx.includes(i)}
                  className={`w-full rounded-2xl border-2 p-4 text-left text-base font-bold transition-all hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 ${cls}`}>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #fef0f8 0%, #e8f0fe 100%)' }} dir="ltr">
      
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onBack}
            className="rounded-2xl border-2 bg-white/80 px-3 py-1.5 text-sm font-bold shadow"
            style={{ borderColor: '#e85d75', color: '#881337' }}>
            ← Back
          </button>
          <h1 className="text-lg font-extrabold" style={{ color: '#881337' }}>{story.title}</h1>
          <div className="rounded-xl bg-white/80 px-3 py-1.5 text-sm font-bold" style={{ color: '#e85d75' }}>
            {pageIdx + 1}/{story.pages.length}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-pink-400 transition-all" style={{ width: `${((pageIdx + 1) / story.pages.length) * 100}%` }} />
        </div>

        {/* Story Page */}
        <div className="overflow-hidden rounded-3xl bg-white/88 shadow-xl border-2" style={{ borderColor: 'rgba(232,93,117,0.2)' }}>
          <div className="flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-10 text-8xl">
            {currentPage.imageEmoji}
          </div>
          <div className="p-6">
            <p className="text-xl font-bold leading-relaxed" style={{ color: '#1f2937' }}>
              {currentPage.text}
            </p>
            <button onClick={() => speakSentence(currentPage.text)}
              className="mt-4 flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105"
              style={{ background: '#e85d75' }}>
              🔊 Listen
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
            disabled={pageIdx === 0}
            className="rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105 disabled:opacity-40"
            style={{ borderColor: '#e85d75', color: '#881337' }}>
            ← Previous
          </button>
          {isLastPage ? (
            story.comprehensionQuestions.length > 0 ? (
              <button onClick={() => setMode('quiz')}
                className="rounded-2xl px-5 py-2 font-bold text-white shadow-md transition hover:scale-105"
                style={{ background: '#8b5fbf' }}>
                🎯 Answer Questions →
              </button>
            ) : (
              <button onClick={() => { onComplete(); onBack() }}
                className="rounded-2xl px-5 py-2 font-bold text-white shadow-md transition hover:scale-105"
                style={{ background: '#2fb68c' }}>
                ✅ Finish Story
              </button>
            )
          ) : (
            <button onClick={() => setPageIdx((p) => p + 1)}
              className="rounded-2xl px-5 py-2 font-bold text-white shadow-md transition hover:scale-105"
              style={{ background: '#e85d75' }}>
              Next Page →
            </button>
          )}
        </div>
      </div>
    
      {/* زر ولي الأمر */}
      <ParentButton section="english" />
    </div>
  )
}
