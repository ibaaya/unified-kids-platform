import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { EmojiIllustration } from '../../components/ui/EmojiIllustration'
import { FeedbackMessage } from '../../components/feedback/FeedbackMessage'
import { useAutoReadQuestion } from '../../hooks/useAutoReadQuestion'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { useChildProfile } from '../../hooks/useChildProfile'
import { awardLessonComplete } from '../../engine/rewardsEngine'
import { checkWorldUnlocks } from '../../engine/curriculumEngine'
import sentencesData from '../../data/sentences.json'
import { getVoicePromptText } from '../../utils/voicePromptCatalog'
import { voicePromptAudioId } from '../../utils/voicePromptIds'

interface SentenceItem { id: string; text: string; translation: string; words: string[]; audioPrompt: string; imageEmoji: string }
const PAGE_SIZE = 10
const sentences = sentencesData as SentenceItem[]

export const SentencesWorld = () => {
  const { child, refresh } = useChildProfile()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [userWords, setUserWords] = useState<string[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const activeSentence = selectedIndex == null ? undefined : sentences[selectedIndex]
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()
  const autoRead = child?.settings?.autoReadQuestions ?? true
  const promptText = getVoicePromptText('sentences', 'sentence-order')
  const promptAudioId = voicePromptAudioId('sentences', 'sentence-order')
  const completedIds = child?.completedLessonIds ?? []
  const isCompleted = activeSentence ? completedIds.includes(`sentence_lesson_${activeSentence.id}`) : false

  const initSentence = (index: number) => {
    const item = sentences[index]
    setSelectedIndex(index)
    setShuffledWords([...item.words].sort(() => Math.random() - 0.5))
    setUserWords([])
    setIsSuccess(false)
    reset()
  }

  useAutoReadQuestion(promptText, autoRead && Boolean(activeSentence), activeSentence?.id ?? 'sentence-picker', 500, activeSentence?.audioPrompt, promptAudioId, activeSentence ? `sentence:${activeSentence.id}` : undefined)

  const handleWordClick = async (word: string, index: number) => {
    if (isSuccess || !activeSentence) return
    const answer = [...userWords, word]
    setUserWords(answer)
    setShuffledWords(shuffledWords.filter((_, i) => i !== index))
    if (answer.length === activeSentence.words.length) {
      if (answer.join(' ') === activeSentence.words.join(' ')) {
        setIsSuccess(true)
        showSuccess()
        if (child?.id && !isCompleted) {
          await awardLessonComplete(child.id, `sentence_lesson_${activeSentence.id}`)
          await checkWorldUnlocks(child.id)
          await refresh()
        }
      } else showRetry()
    }
  }

  const returnToList = () => { setSelectedIndex(null); setUserWords([]); setShuffledWords([]); reset() }
  const goToNextSentence = () => {
    if (selectedIndex === null || selectedIndex + 1 >= sentences.length) {
      returnToList()
      return
    }
    const nextIndex = selectedIndex + 1
    setPage(Math.floor(nextIndex / PAGE_SIZE))
    initSentence(nextIndex)
  }
  const pageCount = Math.ceil(sentences.length / PAGE_SIZE)
  const pageSentences = sentences.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl p-4" dir="rtl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="sr-only">عَالَمُ الْجُمَلِ</h1>
        {activeSentence ? <Button variant="ghost" onClick={returnToList}>← قَائِمَةُ الْجُمَلِ</Button> : <span />}
      </div>

      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
        <main>
          {!activeSentence ? <>
            <p className="mb-5 text-center text-lg font-bold text-indigo-800">اِخْتَرْ جُمْلَةً لِتُرَتِّبَ كَلِمَاتِهَا.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {pageSentences.map((sentence, localIndex) => {
                const index = page * PAGE_SIZE + localIndex
                const done = completedIds.includes(`sentence_lesson_${sentence.id}`)
                return <button key={sentence.id} onClick={() => initSentence(index)} className="flex items-center gap-4 rounded-3xl border-2 border-white/80 bg-white/55 p-4 text-right shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:border-indigo-300 hover:bg-white/70 hover:shadow-xl">
                  <EmojiIllustration emoji={sentence.imageEmoji} size="small" label={`صورة مناسبة للجملة: ${sentence.text}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-extrabold text-indigo-950">{sentence.text}</span>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">{done ? '✓ تَمَّ التَّدَرُّبُ' : 'اِبْدَأِ التَّدَرُّبَ ←'}</span>
                  </span>
                </button>
              })}
            </div>
            <div className="mt-5 flex items-center justify-center gap-4">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage((n) => n - 1)}>السَّابِقَةُ</Button>
              <span className="font-bold">صَفْحَةُ {page + 1} مِنْ {pageCount}</span>
              <Button variant="secondary" disabled={page + 1 >= pageCount} onClick={() => setPage((n) => n + 1)}>التَّالِيَةُ</Button>
            </div>
          </> : <>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-indigo-50 p-3 text-center">
              <SpeakButton text={activeSentence.audioPrompt} audioId={`sentence:${activeSentence.id}`} label="اِسْتَمِعْ إِلَى الْجُمْلَةِ" />
              <span className="font-bold text-indigo-800">{promptText}</span>
              <SpeakButton text={promptText} audioId={promptAudioId} size="sm" label="أَعِدِ التَّعْلِيمَاتِ" />
            </div>
            <Card className="rounded-3xl border-2 border-white/80 p-5 text-center shadow-xl backdrop-blur-md sm:p-7" style={{ backgroundColor: 'rgba(255,255,255,.2)' }}>
              <div className="mb-5 flex flex-col items-center gap-3">
                <EmojiIllustration emoji={activeSentence.imageEmoji} size="large" label={`صورة الجملة: ${activeSentence.text}`} />
                <div className="flex items-center gap-2"><span className="text-2xl font-extrabold text-indigo-900">{activeSentence.text}</span><SpeakButton text={activeSentence.audioPrompt} audioId={`sentence:${activeSentence.id}`} size="sm" label="اِسْتَمِعْ لِلْجُمْلَةِ" /></div>
              </div>
              <div className="mb-5 flex min-h-20 flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-300 bg-gray-50 p-4">
                {userWords.length > 0 ? (
                  userWords.map((word, idx) => (
                    <span key={`${word}-${idx}`} className="rounded-xl bg-indigo-600 px-4 py-2 text-lg font-bold text-white shadow">{word}</span>
                  ))
                ) : (
                  <span className="font-semibold text-gray-500">اِضْغَطْ عَلَى الْكَلِمَاتِ بِالتَّرْتِيبِ</span>
                )}
              </div>
              <div className="mb-5 flex flex-wrap justify-center gap-3">
                {shuffledWords.map((word, idx) => <button key={`${word}-${idx}`} type="button" onClick={() => void handleWordClick(word, idx)} disabled={isSuccess} className="rounded-xl border-2 border-indigo-400 bg-white px-5 py-3 text-xl font-extrabold text-indigo-800 shadow-sm hover:bg-indigo-50 disabled:opacity-60">{word}</button>)}
              </div>
              {feedback && <div className="mb-4"><FeedbackMessage status={feedback.status} message={feedback.message} /></div>}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <Button onClick={() => initSentence(selectedIndex!)} variant="secondary">إِعَادَةُ الْمُحَاوَلَةِ 🔄</Button>
                {isSuccess && <Button size="lg" onClick={goToNextSentence}>✓ الجملة التالية ←</Button>}
              </div>
            </Card>
          </>}
        </main>

        <aside className="max-h-[78vh] overflow-y-auto rounded-3xl border border-white/80 bg-white/60 p-3 shadow-lg backdrop-blur-md">
          <h2 className="mb-2 font-extrabold text-indigo-900">قَائِمَةُ الْجُمَلِ ({sentences.length})</h2>
          <ol className="space-y-1">
            {sentences.map((sentence, index) => {
              const done = completedIds.includes(`sentence_lesson_${sentence.id}`)
              return <li key={sentence.id}><button onClick={() => { setPage(Math.floor(index / PAGE_SIZE)); initSentence(index) }} className={`flex w-full items-center gap-2 rounded-xl p-2 text-right hover:bg-indigo-50 ${selectedIndex === index ? 'bg-indigo-50' : ''}`}>
                <EmojiIllustration emoji={sentence.imageEmoji} size="small" />
                <span className="min-w-0 flex-1 text-sm font-semibold"><span className="text-indigo-700">{index + 1}.</span> {sentence.text}</span>
                {done && <span aria-label="مكتملة" className="text-emerald-700">✓</span>}
              </button></li>
            })}
          </ol>
        </aside>
      </div>
    </div>
  )
}
