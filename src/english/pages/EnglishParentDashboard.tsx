/**
 * EnglishParentDashboard — لوحة ولي الأمر لقسم تعلم الإنجليزية
 * تشمل:
 * - فتح جميع المحتوى أو مسار محدد مع نسبة إنجاز
 * - قراءة السؤال تلقائياً
 * - إعدادات الصوت وسرعة النطق
 * - تتبع تقدم الطفل
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import wordsData from '../data/words.json'
import sentencesData from '../data/sentences.json'
import storiesData from '../data/stories.json'
import { STUDIO_ENABLED } from '../../config/features'

// ——— نوع إعدادات تعلم الإنجليزية ———
export type EnglishSettings = {
  /** فتح جميع العوالم دفعة واحدة أم بالترتيب */
  unlockMode: 'sequential' | 'all'
  /** نسبة الإنجاز المطلوبة للانتقال للعالم التالي (0-100) */
  masteryThreshold: number
  /** قراءة السؤال تلقائياً عند ظهوره */
  autoReadQuestion: boolean
  /** تشغيل الصوت */
  soundEnabled: boolean
  /** سرعة النطق: slow | normal | fast */
  speechRate: 'slow' | 'normal' | 'fast'
  /** إعادة المحاولة عند الخطأ */
  allowRetry: boolean
  /** عرض التشجيع الصوتي بعد الإجابة الصحيحة */
  encouragementSound: boolean
}

const DEFAULT_SETTINGS: EnglishSettings = {
  unlockMode: 'sequential',
  masteryThreshold: 70,
  autoReadQuestion: true,
  soundEnabled: true,
  speechRate: 'slow',
  allowRetry: true,
  encouragementSound: true,
}

const STORAGE_KEY = 'english-parent-settings-v1'

export function loadEnglishSettings(): EnglishSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...DEFAULT_SETTINGS, ...saved }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveEnglishSettings(s: EnglishSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

// ——— تتبع تقدم الإنجليزية ———
export type EnglishProgress = {
  completedLetters: string[]   // حروف تمّ تعلّمها
  completedWords: string[]     // كلمات تمّ تعلّمها
  completedSentences: string[] // جمل تمّت
  completedStories: string[]   // قصص تمّت
  quizScores: Record<string, number> // معرف → نسبة
}

const PROGRESS_KEY = 'english-progress-v1'

function emptyProgress(): EnglishProgress {
  return {
    completedLetters: [], completedWords: [], completedSentences: [],
    completedStories: [], quizScores: {},
  }
}

/**
 * تحميل التقدم بشكل آمن:
 * سابقاً كان '{}' (كائن فارغ) يُعتبر قيمة صحيحة فلا تُضاف القيم الافتراضية،
 * فيصبح completedLetters = undefined ويحدث الخطأ: reading 'length'.
 * الآن ندمج دائماً مع القيم الافتراضية ونتأكد أن كل حقل مصفوفة.
 */
export function loadEnglishProgress(): EnglishProgress {
  const base = emptyProgress()
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    if (!saved || typeof saved !== 'object') return base
    const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [])
    return {
      completedLetters: list(saved.completedLetters),
      completedWords: list(saved.completedWords),
      completedSentences: list(saved.completedSentences),
      completedStories: list(saved.completedStories),
      quizScores: saved.quizScores && typeof saved.quizScores === 'object' && !Array.isArray(saved.quizScores)
        ? saved.quizScores : base.quizScores,
    }
  } catch {
    return base
  }
}

// ——— المكوّن الرئيسي ———
export function EnglishParentDashboard() {
  const [settings, setSettings] = useState<EnglishSettings>(loadEnglishSettings)
  const [progress] = useState<EnglishProgress>(loadEnglishProgress)
  const [saved, setSaved] = useState(false)

  // حفظ تلقائي عند تغيير الإعدادات
  useEffect(() => {
    saveEnglishSettings(settings)
    setSaved(true)
    const t = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(t)
  }, [settings])

  const update = <K extends keyof EnglishSettings>(key: K, val: EnglishSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: val }))

  // إحصائيات الإنجاز
  const stats = [
    { label: 'Letters', done: progress.completedLetters.length, total: 26, emoji: '🔤' },
    { label: 'Words', done: progress.completedWords.length, total: new Set((wordsData as { text: string }[]).map((w) => w.text.toLowerCase())).size, emoji: '📝' },
    { label: 'Sentences', done: progress.completedSentences.length, total: (sentencesData as unknown[]).length, emoji: '💬' },
    { label: 'Stories', done: progress.completedStories.length, total: (storiesData as unknown[]).length, emoji: '📚' },
  ]

  return (
    <div
      className="min-h-screen px-4 py-6"
      dir="ltr"
      style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #f3e8ff 100%)' }}
    >
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="mb-6 rounded-3xl border-2 border-blue-200 bg-white/85 p-4 text-center shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg,#4f80e2,#8b5fbf,#2fb68c)' }} />
          <h1 className="text-2xl font-extrabold" style={{ color: '#1e3a8a' }}>
            🔤 English — Parent Settings
          </h1>
          {saved && (
            <p className="mt-1 text-xs font-bold text-green-600">✅ Settings saved!</p>
          )}
        </header>

        {/* ——— إحصائيات التقدم ——— */}
        <section className="mb-5 rounded-3xl border-2 border-blue-100 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-extrabold text-blue-900">📊 Progress Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label}
                className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center">
                <div className="text-2xl">{s.emoji}</div>
                <div className="text-sm font-bold text-blue-800">{s.label}</div>
                <div className="mt-1 text-lg font-extrabold text-blue-900">
                  {s.done} / {s.total}
                </div>
                <div className="mt-1 h-2 rounded-full bg-blue-100">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${s.total > 0 ? Math.min(100, (s.done / s.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ——— إعدادات فتح المحتوى ——— */}
        <section className="mb-5 rounded-3xl border-2 border-blue-100 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-extrabold text-blue-900">🔓 Content Unlock</h2>

          {/* وضع الفتح */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700">Unlock Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => update('unlockMode', 'sequential')}
                className={`flex-1 rounded-2xl border-2 py-2 text-sm font-bold transition ${
                  settings.unlockMode === 'sequential'
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                🔒 Step by Step
              </button>
              <button
                onClick={() => update('unlockMode', 'all')}
                className={`flex-1 rounded-2xl border-2 py-2 text-sm font-bold transition ${
                  settings.unlockMode === 'all'
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                🔓 Open All
              </button>
            </div>
          </div>

          {/* نسبة الإنجاز للانتقال */}
          {settings.unlockMode === 'sequential' && (
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Mastery Required to Unlock Next World: <span className="text-blue-600">{settings.masteryThreshold}%</span>
              </label>
              <input
                type="range" min={50} max={100} step={5}
                value={settings.masteryThreshold}
                onChange={(e) => update('masteryThreshold', Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>50% (Easy)</span><span>75% (Medium)</span><span>100% (Perfect)</span>
              </div>
            </div>
          )}
        </section>

        {/* ——— إعدادات الصوت والسؤال ——— */}
        <section className="mb-5 rounded-3xl border-2 border-blue-100 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-extrabold text-blue-900">🔊 Sound & Reading</h2>

          {/* قراءة السؤال تلقائياً */}
          <ToggleRow
            label="Auto-read Questions"
            description="Read each question aloud when it appears"
            value={settings.autoReadQuestion}
            onChange={(v) => update('autoReadQuestion', v)}
          />

          {/* تشغيل الصوت عموماً */}
          <ToggleRow
            label="Sound Effects"
            description="Enable all sounds and speech"
            value={settings.soundEnabled}
            onChange={(v) => update('soundEnabled', v)}
          />

          {/* تشجيع صوتي */}
          <ToggleRow
            label="Encouragement Voice"
            description="Play voice praise after correct answers"
            value={settings.encouragementSound}
            onChange={(v) => update('encouragementSound', v)}
          />

          {/* سرعة النطق */}
          <div className="mt-3">
            <label className="mb-2 block text-sm font-bold text-gray-700">Reading Speed</label>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => update('speechRate', speed)}
                  className={`flex-1 rounded-2xl border-2 py-2 text-sm font-bold capitalize transition ${
                    settings.speechRate === speed
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {speed === 'slow' ? '🐢 Slow' : speed === 'normal' ? '🚶 Normal' : '🚀 Fast'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ——— إعدادات الأسئلة ——— */}
        <section className="mb-5 rounded-3xl border-2 border-blue-100 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-extrabold text-blue-900">❓ Quiz Settings</h2>

          <ToggleRow
            label="Allow Retry on Wrong Answer"
            description="Let the child try again instead of moving on"
            value={settings.allowRetry}
            onChange={(v) => update('allowRetry', v)}
          />
        </section>

        {/* ——— استوديو الصوت ——— */}
        {STUDIO_ENABLED && <section className="mb-5 rounded-3xl border-2 border-purple-100 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-2 text-lg font-extrabold text-purple-900">🎙️ Voice Studio</h2>
          <p className="mb-3 text-sm text-gray-500">
            Record custom audio to replace browser speech for all content.
          </p>
          <Link
            to="/english/voice-studio"
            className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105"
          >
            🎙️ Open English Voice Studio
          </Link>
        </section>}

        {/* ——— إعادة ضبط التقدم ——— */}
        <section className="mb-6 rounded-3xl border-2 border-red-100 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-2 text-lg font-extrabold text-red-800">⚠️ Reset</h2>
          <p className="mb-3 text-sm text-gray-500">
            Clear all English learning progress. This cannot be undone.
          </p>
          <button
            onClick={() => {
              if (confirm('Reset all English progress? This cannot be undone.')) {
                localStorage.removeItem(PROGRESS_KEY)
                window.location.reload()
              }
            }}
            className="rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            🗑️ Reset English Progress
          </button>
        </section>

      </div>
    </div>
  )
}

// ——— مساعد: صف إعداد تبديل ———
function ToggleRow({
  label, description, value, onChange,
}: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
          value ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
