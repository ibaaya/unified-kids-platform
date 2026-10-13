/**
 * HarakatSyllablesDetail.tsx  ·  src/pages/Worlds/HarakatSyllablesDetail.tsx
 * ════════════════════════════════════════════════════════════════════════════
 * صفحة تفاصيل حركة واحدة — تحل محل HarakaDetail و SyllableDetail.
 *
 * القسم الأول — بطاقة الحركة:
 *   إيموجي + رمز كبير + اسم + شرح منطوق
 *
 * القسم الثاني — الأمثلة:
 *   بطاقة لكل كلمة: إيموجي + الكلمة مع تلوين المقطع + زر استماع
 *
 * القسم الثالث — الجملة الكاملة:
 *   جملة مشكولة مع تمييز الحركة + زر استماع
 *
 * القسم الرابع — أزرار التنقل واللعبة:
 *   ← السابقة | التالية →  +  زر "العب الآن"
 *
 * المسار: /arabic/world/harakat/:harakaId
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { SpeakButton } from '../../components/ui/SpeakButton'
import {
  HARAKAT_WORLD_MAP,
  HARAKA_WORLD_ORDER,
  harakaWorldSoundId,
} from '../../data/harakatWorld'
import type { HarakaWorldId } from '../../data/harakatWorld'
import { stripEmojiForSpeech } from '../../utils/arabicSpeech'

// ─── تمييز المقطع بلون ───────────────────────────────────────────────────────

function HighlightedWord({
  word,
  highlight,
  color,
  size = 'clamp(2.8rem, 10vw, 4rem)',
}: {
  word: string
  highlight: string
  color: string
  size?: string
}) {
  const idx = word.indexOf(highlight)
  if (idx === -1) {
    return (
      <span className="font-display font-black" style={{ fontSize: size }}>
        {word}
      </span>
    )
  }
  return (
    <span className="font-display font-black" style={{ fontSize: size }}>
      {word.slice(0, idx)}
      <span
        style={{
          color,
          textDecoration: 'underline',
          textDecorationColor: color,
          textDecorationThickness: '3px',
          textUnderlineOffset: '5px',
        }}
      >
        {word.slice(idx, idx + highlight.length)}
      </span>
      {word.slice(idx + highlight.length)}
    </span>
  )
}

// ─── بطاقة سؤال واحد ─────────────────────────────────────────────────────────

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────

export function HarakatSyllablesDetail() {
  const { harakaId } = useParams<{ harakaId: HarakaWorldId }>()
  const navigate     = useNavigate()
  const entry        = harakaId ? HARAKAT_WORLD_MAP.get(harakaId) : undefined
  const currentIndex = HARAKA_WORLD_ORDER.indexOf(harakaId as HarakaWorldId)
  const prevId       = currentIndex > 0 ? HARAKA_WORLD_ORDER[currentIndex - 1] : null
  const nextId       = currentIndex < HARAKA_WORLD_ORDER.length - 1 ? HARAKA_WORLD_ORDER[currentIndex + 1] : null

  // صفحة 404
  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center">
          <p className="mb-4 text-[var(--color-ink)]">لم يتم العثور على هذه الحركة.</p>
          <Button onClick={() => navigate('/arabic/world/harakat')}>← عالم الحركات والمقاطع</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-6 pb-24" dir="rtl">

      {/* ── شريط التنقل العلوي ── */}
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" onClick={() => navigate('/arabic/world/harakat')}>
          ← عالم الحركات
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-ink-soft)] font-bold">
            {currentIndex + 1} / {HARAKA_WORLD_ORDER.length}
          </span>
        </div>
      </div>

      {/* ── بطاقة الحركة الرئيسية ── */}
      <div
        className="rounded-3xl border-2 p-7 sm:p-9 text-center shadow-2xl backdrop-blur-md mb-6"
        style={{ backgroundColor: 'rgba(255,255,255,.94)', borderColor: entry.color + '70' }}
      >
        {/* إيموجي */}
        <div className="text-6xl sm:text-7xl mb-3 select-none" aria-hidden="true">
          {entry.emoji}
        </div>

        {/* رمز الحركة الكبير */}
        <div
          className="font-display font-black drop-shadow-lg select-none"
          style={{ fontSize: 'clamp(4.5rem, 16vw, 6.5rem)', color: entry.color, lineHeight: 1.1 }}
          aria-hidden="true"
        >
          {entry.symbol}
        </div>

        {/* الاسم */}
        <h1
          className="font-display font-extrabold text-3xl sm:text-4xl mt-2 mb-4"
          style={{ color: entry.color }}
        >
          {entry.label}
        </h1>

        {/* الشرح + زر الصوت */}
        <div className="flex items-start justify-center gap-2">
          <SpeakButton
            text={stripEmojiForSpeech(entry.descriptionSpeech)}
            audioId={harakaWorldSoundId(entry.id, 'desc')}
            label="استمع للشرح"
            size="md"
          />
          <p className="font-display text-lg sm:text-xl text-[var(--color-ink)] max-w-xl text-right leading-relaxed">
            {entry.description}
          </p>
        </div>
      </div>

      {/* ── الماسكوت ── */}
      <div className="flex justify-center mb-5">
        <Mascot
          message={`الحرف المُلوَّن هو "${entry.symbol}" — لاحظه في كل كلمة! 🎨`}
          size={72}
        />
      </div>

      {/* ── أمثلة الكلمات ── */}
      <section className="mb-6">
        <h2 className="font-display font-extrabold text-[var(--color-ink)] text-xl sm:text-2xl mb-4 flex items-center gap-2">
          <span aria-hidden="true">📖</span> أمثلة من كلمات حقيقية
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4">
          {entry.examples.map((ex, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-3xl border-2 p-5 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: 'rgba(255,255,255,.94)', borderColor: entry.color + '55' }}
            >
              {/* إيموجي الكلمة */}
              <span className="text-5xl sm:text-6xl select-none" aria-hidden="true">
                {ex.emoji}
              </span>

              {/* الكلمة مع تمييز المقطع */}
              <HighlightedWord
                word={ex.word}
                highlight={ex.highlight}
                color={entry.color}
              />

              {/* مقطع مُعزَّز */}
              <div
                className="rounded-xl px-4 py-2 font-display font-black text-lg sm:text-xl"
                style={{ backgroundColor: entry.color + '25', color: entry.color }}
              >
                {ex.highlight}
              </div>

              {/* زر الاستماع */}
              <div className="flex items-center gap-1.5">
                <SpeakButton
                  text={stripEmojiForSpeech(ex.speechText)}
                  audioId={harakaWorldSoundId(entry.id, `ex_${i}`)}
                  label={`استمع لـ ${ex.word}`}
                  size="sm"
                />
                <span className="font-display font-bold text-base sm:text-lg text-[var(--color-ink-soft)]">
                  {ex.word}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── الجملة الكاملة ── */}
      <section className="mb-6">
        <h2 className="font-display font-extrabold text-[var(--color-ink)] text-xl sm:text-2xl mb-4 flex items-center gap-2">
          <span aria-hidden="true">📝</span> جملة كاملة
        </h2>

        <div
          className="rounded-2xl border-2 border-white/50 p-4 shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(255,255,255,.94)', borderColor: entry.color + '70' }}
        >
          <div className="flex items-center gap-3">
            <SpeakButton
              text={stripEmojiForSpeech(entry.sentenceSpeech)}
              audioId={harakaWorldSoundId(entry.id, 'sentence')}
              label="استمع للجملة"
              size="md"
            />
            <p
              className="font-display font-bold text-[var(--color-ink)] text-xl leading-relaxed"
              style={{ direction: 'rtl' }}
            >
              {entry.sentence}
            </p>
          </div>
        </div>
      </section>

      {/* ── زر اللعب ── */}
      <div className="flex justify-center mb-6">
        <Button
          size="lg"
          className="w-full sm:max-w-sm text-lg"
          onClick={() => navigate(`/arabic/world/harakat/${harakaId}/play`)}
        >
          🎮 العب واختبر نفسك!
        </Button>
      </div>

      {/* ── شريط التنقل بين الحركات ── */}
      <div
        className="flex justify-between items-center pt-4 border-t border-white/20"
      >
        <Button
          variant="secondary"
          disabled={!prevId}
          onClick={() => prevId && navigate(`/arabic/world/harakat/${prevId}`)}
          className="!text-sm"
        >
          {prevId ? `${HARAKAT_WORLD_MAP.get(prevId)?.emoji} ← السابقة` : '← السابقة'}
        </Button>

        {/* نقاط ترقيم سريعة للتنقل */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[7rem]">
          {HARAKA_WORLD_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-label={`انتقل إلى ${HARAKAT_WORLD_MAP.get(id)?.label}`}
              onClick={() => navigate(`/arabic/world/harakat/${id}`)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-150"
              style={{
                backgroundColor:
                  id === harakaId
                    ? entry.color
                    : 'rgba(255,255,255,0.3)',
                transform: id === harakaId ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <Button
          variant="primary"
          disabled={!nextId}
          onClick={() => nextId && navigate(`/arabic/world/harakat/${nextId}`)}
          className="!text-sm"
        >
          {nextId ? `التالية → ${HARAKAT_WORLD_MAP.get(nextId)?.emoji}` : 'التالية →'}
        </Button>
      </div>
    </div>
  )
}
