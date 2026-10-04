import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { HomeButton } from '../../components/ui/HomeButton'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { useChildProfile } from '../../hooks/useChildProfile'
import { getArabicFinalTestProgress, saveArabicFinalTestLevel, type ArabicFinalTestProgress } from '../../services/progressService'
import { ARABIC_FINAL_TEST_LEVELS, type ArabicFinalTestQuestion } from './arabicFinalTestData'

const LABELS = ['سهل', 'متوسط', 'صعب']
const ACCENTS = ['#2fb68c', '#f29b38', '#e85d75']
const BADGES = ['⭐ شارة البداية', '🏅 شارة الاجتهاد', '👑 شارة البطل']

export function ArabicFinalTest() {
  const { child, loading, hasAnyChildren } = useChildProfile()
  const [progress, setProgress] = useState<ArabicFinalTestProgress>({ scores: [] })
  const [loaded, setLoaded] = useState(false)
  const [level, setLevel] = useState<number | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!child?.id) return
    let alive = true
    getArabicFinalTestProgress(child.id).then((value) => { if (alive) { setProgress(value); setLoaded(true) } })
    return () => { alive = false }
  }, [child?.id])

  if (loading) return <div className="min-h-screen grid place-items-center font-bold text-xl">جارٍ تجهيز الاختبار…</div>
  if (!child) return <Navigate to={hasAnyChildren ? '/login' : '/onboarding'} replace />
  if (!loaded) return <div className="min-h-screen grid place-items-center font-bold text-xl">جارٍ تجهيز الاختبار…</div>

  const questionSet = level == null ? undefined : ARABIC_FINAL_TEST_LEVELS[level]
  const question: ArabicFinalTestQuestion | undefined = questionSet?.[questionIndex]
  const startLevel = (index: number) => {
    setLevel(index); setQuestionIndex(0); setAnswers([]); setSavedScore(null)
  }
  const submitLevel = async (selected: string) => {
    if (!question || answers[questionIndex] != null) return
    setAnswers((previous) => [...previous, selected])
  }
  const finishLevel = async () => {
    if (level == null || !child.id || saving) return
    setSaving(true)
    try {
      const score = answers.reduce((total, answer, index) => total + (answer === ARABIC_FINAL_TEST_LEVELS[level][index].answer ? 1 : 0), 0)
      const next = await saveArabicFinalTestLevel(child.id, level, score)
      setProgress(next); setSavedScore(score)
    } finally { setSaving(false) }
  }

  if (level != null && savedScore != null) {
    const final = progress.scores.length === 3
    const total = progress.scores.reduce((sum, score) => sum + score, 0)
    const percent = Math.round((total / 30) * 100)
    const assessment = percent >= 90 ? 'ممتاز! أتقنت معظم ما تعلمته.' : percent >= 70 ? 'رائع! لديك أساس قوي.' : percent >= 50 ? 'جيد، واصل المراجعة والتدريب.' : 'بداية جميلة، عُد إلى الدروس ثم حاول مجددًا.'
    return <main dir="rtl" className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-violet-50 px-4 py-8"><HomeButton to="/arabic" /><section className="mx-auto max-w-xl rounded-3xl border-2 bg-white/90 p-7 text-center shadow-xl" style={{ borderColor: ACCENTS[level] }}>
      <div className="text-6xl">{final ? '🏆' : BADGES[level].split(' ')[0]}</div>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-800">{final ? 'النتيجة النهائية' : `نتيجة المستوى ${LABELS[level]}`}</h1>
      {!final ? <><p className="mt-3 text-2xl font-extrabold" style={{ color: ACCENTS[level] }}>{savedScore} / 10</p><p className="mt-2 rounded-full bg-amber-50 px-4 py-2 font-bold text-amber-800">{BADGES[level]}</p></> : <>
        <p className="mt-3 text-3xl font-extrabold text-violet-700">{total} / 30</p><p className="mt-1 text-xl font-bold text-slate-600">{percent}%</p><p className="mt-3 font-bold text-slate-700">{assessment}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">{progress.scores.map((score, index) => <div key={index} className="rounded-xl bg-slate-50 p-3"><div className="text-sm font-bold">{LABELS[index]}</div><div className="mt-1 font-extrabold" style={{ color: ACCENTS[index] }}>{score} / 10</div><div>{BADGES[index].split(' ')[0]}</div></div>)}</div>
        <p className="mt-4 font-bold text-slate-700">المستوى النهائي: {percent >= 90 ? 'متقدم' : percent >= 70 ? 'متمكن' : percent >= 50 ? 'نامٍ' : 'مبتدئ'}</p>
      </>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">{!final && level < 2 && <button onClick={() => startLevel(level + 1)} className="rounded-xl px-5 py-3 font-bold text-white shadow" style={{ background: ACCENTS[level + 1] }}>ابدأ المستوى {LABELS[level + 1]} ←</button>}<button onClick={() => setLevel(null)} className="rounded-xl bg-slate-700 px-5 py-3 font-bold text-white">عرض المستويات</button><Link to="/arabic" className="rounded-xl bg-sky-700 px-5 py-3 font-bold text-white">العودة إلى العربية</Link></div>
    </section></main>
  }

  if (level != null && question) {
    const selected = answers[questionIndex]
    const last = questionIndex === 9
    return <main dir="rtl" className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-violet-50 px-4 py-8"><HomeButton to="/arabic" /><section className="mx-auto max-w-2xl rounded-3xl border-2 bg-white/95 p-5 shadow-xl sm:p-8" style={{ borderColor: ACCENTS[level] }}>
      <div className="flex items-center justify-between gap-2"><span className="font-extrabold" style={{ color: ACCENTS[level] }}>المستوى {LABELS[level]}</span><span className="text-sm font-bold text-slate-500">السؤال {questionIndex + 1} من 10</span><SpeakButton text={`${question.prompt} ${question.say ?? ''} ${question.stimulus ?? ''} ${question.context ?? ''}`} label="استمع إلى السؤال" /></div>
      <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full transition-all" style={{ width: `${((questionIndex + 1) / 10) * 100}%`, background: ACCENTS[level] }} /></div>
      <h1 className="mt-6 text-center text-2xl font-extrabold leading-relaxed text-slate-800">{question.prompt}</h1>
      {question.context && <div className="mt-4 max-h-48 overflow-y-auto whitespace-pre-line rounded-2xl bg-amber-50 p-4 text-lg font-bold leading-loose text-slate-700">{question.context}</div>}
      {question.stimulus && <div className="mt-4 text-center text-3xl font-extrabold text-violet-700">{question.stimulus}</div>}
      {question.say && <div className="mt-3 flex justify-center"><SpeakButton text={question.say} label="استمع إلى المثال" /></div>}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">{question.options.map((option) => <button key={option} disabled={selected != null} onClick={() => void submitLevel(option)} className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-lg font-extrabold transition ${selected === option ? (option === question.answer ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800') : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400'}`} style={selected !== option ? { borderColor: 'rgba(148,163,184,.35)' } : undefined}>{option}</button>)}</div>
      {selected != null && <div className="mt-5 text-center">{last ? <button disabled={saving} onClick={() => void finishLevel()} className="rounded-xl px-6 py-3 font-extrabold text-white" style={{ background: ACCENTS[level] }}>{saving ? 'جارٍ حفظ النتيجة…' : 'إنهاء المستوى وعرض النتيجة'}</button> : <button onClick={() => { setQuestionIndex((index) => index + 1) }} className="rounded-xl bg-sky-700 px-6 py-3 font-extrabold text-white">السؤال التالي ←</button>}</div>}
    </section></main>
  }

  return <main dir="rtl" className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-violet-50 px-4 py-8"><HomeButton to="/arabic" /><div className="mx-auto max-w-3xl"><header className="rounded-3xl bg-white/90 p-6 text-center shadow-xl"><div className="text-5xl">🏆</div><h1 className="mt-2 text-3xl font-extrabold text-slate-800">الاختبار الكلي في تعلم العربية</h1><p className="mt-2 font-bold text-slate-600">ثلاثة مستويات متدرجة، ١٠ أسئلة في كل مستوى. اختر إجابتك الأولى بعناية.</p></header>
    {progress.scores.length === 3 ? <button onClick={() => { setLevel(2); setSavedScore(progress.scores[2]) }} className="mt-5 w-full rounded-2xl bg-violet-700 p-4 font-extrabold text-white">عرض النتيجة النهائية 🏆</button> : null}
    <div className="mt-5 grid gap-4 sm:grid-cols-3">{LABELS.map((label, index) => { const done = progress.scores[index] != null; const canEnter = index === progress.scores.length; const locked = !done && !canEnter; return <div key={label} className="rounded-3xl border-2 bg-white/90 p-5 text-center shadow-lg" style={{ borderColor: ACCENTS[index], opacity: locked ? .6 : 1 }}><div className="text-4xl">{done ? BADGES[index].split(' ')[0] : locked ? '🔒' : ['⭐', '🏅', '👑'][index]}</div><h2 className="mt-2 text-xl font-extrabold" style={{ color: ACCENTS[index] }}>{label}</h2><p className="mt-1 text-sm font-bold text-slate-500">١٠ أسئلة</p>{done ? <p className="mt-3 font-extrabold text-slate-700">النتيجة: {progress.scores[index]} / 10</p> : locked ? <p className="mt-3 text-sm font-bold text-slate-500">أكمل المستوى السابق لفتحه</p> : null}{!locked && !done && <button onClick={() => startLevel(index)} className="mt-4 rounded-xl px-4 py-2 font-bold text-white" style={{ background: ACCENTS[index] }}>ابدأ الاختبار</button>}</div> })}</div>
    <div className="mt-6 text-center"><Link to="/arabic" className="inline-flex rounded-xl bg-slate-700 px-5 py-3 font-bold text-white">العودة إلى تعلم العربية</Link></div>
  </div></main>
}
