/**
 * DiscoverParentSettings — إعدادات ولي الأمر لقسم "اكتشف ما حولك"
 * - عرض تقدم الطفل في كل عالم
 * - إعادة ضبط التقدم
 * - إعدادات الصوت
 */
import { Link } from 'react-router-dom'
import { STUDIO_ENABLED } from '../../config/features'
import { DISCOVER_WORLDS } from '../data/discoverData'
import {
  loadDiscoverProgress,
  getWorldCompletion,
  isWorldComplete,
  resetDiscoverProgress,
  getDiscoverOverallTestPercentage,
  isDiscoverFinalTestComplete,
} from '../engine/discoverProgress'

export function DiscoverParentSettings() {
  const progress = loadDiscoverProgress()

  return (
    <div
      className="min-h-screen px-4 py-6 pb-16"
      dir="rtl"
      style={{ background: 'linear-gradient(160deg, #edf8f5 0%, #f4f7ff 55%, #fff8ec 100%)' }}
    >
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="relative mb-6 overflow-hidden rounded-3xl border-2 border-white/80 bg-white/85 p-4 text-center shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg,#2fb68c,#3aa0d9)' }} />
          <div className="text-4xl mb-2">🌍</div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-ink)' }}>
            إعدادات اكتشف ما حولك
          </h1>
          <p className="text-sm text-gray-500 mt-1">تتبع تقدم الطفل في رحلة الاكتشاف</p>
        </header>

        {STUDIO_ENABLED && (
          <section className="mb-5 rounded-3xl border-2 border-emerald-100 bg-white/85 p-4 shadow-lg">
            <h2 className="mb-2 text-lg font-extrabold text-emerald-900">🎙️ استوديو تسجيل اكتشف ما حولك</h2>
            <p className="mb-3 text-sm text-gray-600">
              سجّل أسماء العوالم والأشياء والأسئلة العربية، واحفظها لتُستخدم بدل النطق الآلي.
            </p>
            <Link
              to="/discover/voice-studio"
              className="inline-flex items-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105"
            >
              🎙️ فتح استوديو الاكتشاف
            </Link>
          </section>
        )}

        {/* إحصائيات إجمالية */}
        <section className="mb-5 rounded-3xl border-2 border-white/70 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-extrabold" style={{ color: 'var(--color-ink)' }}>
            📊 الإحصائيات الإجمالية
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-orange-50 p-3">
              <div className="text-2xl font-extrabold text-orange-600">{progress.totalItemsSeen}</div>
              <div className="text-xs text-gray-500">شيء تعلَّمه</div>
            </div>
            <div className="rounded-2xl bg-green-50 p-3">
              <div className="text-2xl font-extrabold text-green-600">{progress.totalActivitiesDone}</div>
              <div className="text-xs text-gray-500">نشاط مكتمل</div>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3">
              <div className="text-2xl font-extrabold text-blue-600">
                {DISCOVER_WORLDS.filter((w) => isWorldComplete(w.id, w.items.length)).length}
                <span className="text-sm text-gray-400"> / {DISCOVER_WORLDS.length}</span>
              </div>
              <div className="text-xs text-gray-500">عالم مكتمل</div>
            </div>
          </div>
        </section>

        {/* الاختبار الشامل */}
        <section className="mb-5 rounded-3xl border-2 border-white/70 bg-white/80 p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold" style={{ color: 'var(--color-ink)' }}>
                🏆 الاختبار الشامل
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                25 سؤالًا في كل مستوى، مع فتح تدريجي للمستويات
              </p>
            </div>
            <Link
              to="/discover/test"
              className="rounded-2xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow"
            >
              فتح الاختبار
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {(['easy', 'medium', 'hard'] as const).map((level) => {
              const result = progress.finalTest.levels[level]
              const title = level === 'easy' ? 'سهل' : level === 'medium' ? 'متوسط' : 'صعب'
              return (
                <div key={level} className="rounded-2xl bg-gray-50 p-3">
                  <div className="text-sm font-extrabold text-gray-700">{title}</div>
                  <div className="mt-1 text-lg font-black text-violet-600">
                    {result?.completed ? `${result.score}/${result.total}` : '—'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {result?.attempts ? `${result.attempts} محاولة` : 'لم يبدأ'}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-center">
            <span className="text-xs font-bold text-emerald-700">
              {isDiscoverFinalTestComplete()
                ? `🌟 النتيجة الكلية: ${getDiscoverOverallTestPercentage()}%`
                : `📊 النتيجة الحالية: ${getDiscoverOverallTestPercentage()}%`}
            </span>
          </div>
        </section>

        {/* تقدم كل عالم */}
        <section className="mb-5 rounded-3xl border-2 border-white/70 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-extrabold" style={{ color: 'var(--color-ink)' }}>
            🌍 تقدم العوالم
          </h2>
          <div className="space-y-3">
            {DISCOVER_WORLDS.map((world) => {
              const completion = getWorldCompletion(world.id, world.items.length)
              const wProgress = progress.worlds[world.id]
              const seenCount = wProgress?.seenItems?.length ?? 0
              const activitiesDone = wProgress?.completedActivities?.length ?? 0
              const lastQuiz = wProgress?.lastQuizScore

              return (
                <div
                  key={world.id}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3"
                >
                  <span className="text-3xl">{world.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-800">{world.titleAr}</p>
                      {completion === 100 && (
                        <span className="text-xs font-bold text-green-600">✅ مكتمل</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${completion}%`,
                            background: `linear-gradient(90deg, ${world.color}, ${world.colorEnd})`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{completion}%</span>
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-gray-400">
                      <span>👁️ {seenCount}/{world.items.length} عنصر</span>
                      <span>🎮 {activitiesDone} نشاط</span>
                      {lastQuiz !== undefined && <span>🏆 {lastQuiz}% آخر اختبار</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* روابط سريعة */}
        <section className="mb-5 rounded-3xl border-2 border-white/70 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-extrabold" style={{ color: 'var(--color-ink)' }}>
            🔗 روابط سريعة
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/discover"
              className="rounded-2xl px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105"
              style={{ background: 'linear-gradient(90deg,#2fb68c,#3aa0d9)' }}
            >
              🌍 اذهب للقسم
            </Link>
            {DISCOVER_WORLDS.slice(0, 3).map((w) => (
              <Link
                key={w.id}
                to={`/discover/${w.id}`}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 transition hover:scale-105"
              >
                {w.emoji} {w.titleAr}
              </Link>
            ))}
          </div>
        </section>

        {/* إعادة الضبط */}
        <section className="rounded-3xl border-2 border-red-100 bg-white/80 p-4 shadow-lg">
          <h2 className="mb-2 text-lg font-extrabold text-red-800">⚠️ إعادة الضبط</h2>
          <p className="mb-3 text-sm text-gray-500">
            مسح جميع تقدم الطفل في قسم الاكتشاف. لا يمكن التراجع.
          </p>
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من مسح تقدم الاكتشاف؟ لا يمكن التراجع.')) {
                resetDiscoverProgress()
                window.location.reload()
              }
            }}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            🗑️ مسح تقدم الاكتشاف
          </button>
        </section>

      </div>
    </div>
  )
}
