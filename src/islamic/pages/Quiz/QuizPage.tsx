import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SpeakButton from '../../components/SpeakButton';
import BadgeToast from '../../components/BadgeToast';
import { getQuizByWorld } from '../../data/quizzes';
import type { QuizQuestion } from '../../data/types';
import { getIslamicProgress, saveQuizResult } from '../../engine/islamicProgress';
import { getEncouragement, getTryAgain, speakArabic, speakSequence } from '../../engine/islamicSound';
import { useAutoSpeak } from '../../engine/useAutoSpeak';


// =====================================================
// الاختبارات: ٣ مستويات، تنطق كل سؤال تلقائياً مع الخيارات
// تصميم محسّن للأطفال 6-8 سنوات + إيموجي توضيحية
// =====================================================

type Level = 'easy' | 'medium' | 'hard';

const WORLDS: Record<string, { title: string; icon: string; color: string }> = {
  values: { title: 'أَخلاقي', icon: '❤️', color: '#E91E63' },
  family: { title: 'أُسرَتي', icon: '👨‍👩‍👧', color: '#FF9800' },
  manners: { title: 'آدَابِي', icon: '🕌', color: '#009688' },
  worship: { title: 'عِباداتي', icon: '💧', color: '#2196F3' },
  faith: { title: 'دِينِي الجَميل', icon: '☪️', color: '#4CAF50' },
  stories: { title: 'قِصَصٌ وَقِيَم', icon: '📖', color: '#9C27B0' },
  culture: { title: 'ثَقافَتُنا', icon: '🏜️', color: '#795548' },
};

const LEVELS: {
  key: Level;
  label: string;
  icon: string;
  desc: string;
  color: string;
  soft: string;
}[] = [
  {
    key: 'easy',
    label: 'سَهل',
    icon: '🟢',
    desc: 'أَسئِلَةٌ بَسيطَة',
    color: '#4CAF50',
    soft: '#E8F5E9',
  },
  {
    key: 'medium',
    label: 'مُتَوَسِّط',
    icon: '🟡',
    desc: 'أَسئِلَةٌ مُتَوَسِّطَة',
    color: '#FF9800',
    soft: '#FFF3E0',
  },
  {
    key: 'hard',
    label: 'مُتَقَدِّم',
    icon: '🔵',
    desc: 'أَسئِلَةٌ أَكثَرُ تَفكيراً',
    color: '#2196F3',
    soft: '#E3F2FD',
  },
];

const LETTERS = ['أ', 'ب', 'ج', 'د'];

const shuffle = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

// ─── اشتقاق إيموجي توضيحي للسؤال من نصّه/تصنيفه (بدون تعديل البيانات) ───
const EMOJI_RULES: { keys: string[]; emoji: string }[] = [
  { keys: ['وُضوء', 'وضوء', 'الوضوء'], emoji: '💧' },
  { keys: ['صلاة', 'الصلاة', 'أصلي', 'يصلي', 'ركعة'], emoji: '🕌' },
  { keys: ['مسجد', 'المسجد'], emoji: '🕌' },
  { keys: ['قرآن', 'القرآن', 'سورة', 'آية'], emoji: '📖' },
  { keys: ['أم', 'أب', 'أخت', 'أخ', 'أسرة', 'الأسرة', 'عائلة', 'والد', 'والدة'], emoji: '👨‍👩‍👧' },
  { keys: ['سلام', 'السلام', 'تحية', 'يسلم'], emoji: '👋' },
  { keys: ['طعام', 'أكل', 'الطعام', 'يأكل', 'الغداء', 'الفطور'], emoji: '🍽️' },
  { keys: ['شراب', 'ماء', 'يشرب', 'الحليب'], emoji: '🥤' },
  { keys: ['نظافة', 'صابون', 'أسنان', 'اغتسال', 'وضوء'], emoji: '🧼' },
  { keys: ['نوم', 'ينام', 'النوم', 'سرير'], emoji: '😴' },
  { keys: ['شكر', 'الحمد', 'يشكر', 'شكراً'], emoji: '🙏' },
  { keys: ['صدق', 'صادق', 'كذب', 'يكذب'], emoji: '💬' },
  { keys: ['أمانة', 'أمين', 'الأمانة'], emoji: '🔒' },
  { keys: ['احترام', 'يحترم', 'الاحترام'], emoji: '🤝' },
  { keys: ['مساعدة', 'يساعد', 'المساعدة', 'عون'], emoji: '🫶' },
  { keys: ['والدين', 'بر', 'الوالدين', 'إحسان'], emoji: '❤️' },
  { keys: ['عيد', 'رمضان', 'الفطر', 'الأضحى'], emoji: '🌙' },
  { keys: ['كعبة', 'الكعبة', 'مكة', 'حج', 'عمرة'], emoji: '🕋' },
  { keys: ['شمس', 'قمر', 'نجم', 'خلق', 'الله'], emoji: '🌤️' },
  { keys: ['نظافة', 'ترتيب', 'ينظف'], emoji: '🧹' },
];

const emojiForQuestion = (q: QuizQuestion, worldIcon: string): string => {
  const haystack = `${q.text} ${q.category}`;
  for (const rule of EMOJI_RULES) {
    if (rule.keys.some((k) => haystack.includes(k))) return rule.emoji;
  }
  return worldIcon;
};

// ─── صفحة الأسئلة ───

const Questions: React.FC<{
  questions: QuizQuestion[];
  color: string;
  worldId: string;
  level: Level;
  worldIcon: string;
  onExit: () => void;
}> = ({ questions, color, worldId, level, worldIcon, onExit }) => {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  // ✅ تتبع حالة الإجابة: null=لم يجب، 'wrong'=خطأ، 'correct'=صحيح
  const [answerState, setAnswerState] = useState<null | 'correct' | 'wrong'>(null)

  const q = questions[idx];
  const answered = answerState === 'correct' // ✅ يُقفل الأزرار فقط عند الإجابة الصحيحة
  const qSpeech = `${q.text}. ${q.options.join('، أَو ')}`;

  // ✅ إصلاح السؤال الأول: نطق فوري عند mount + عند تغيّر idx
  useEffect(() => {
    const timer = window.setTimeout(() => {
      speakArabic(qSpeech)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [idx]) // ✅ idx فقط — يعمل للسؤال الأول لأنه يُشغَّل عند mount

  const answer = (i: number) => {
    if (answered) return // مقفل فقط بعد الإجابة الصحيحة
    const ok = i === q.correctIndex;
    setPicked(i);

    if (ok) {
      setScore((s) => s + 1);
      setAnswerState('correct')
      window.setTimeout(() => {
        speakSequence([getEncouragement(), q.explanation])
      }, 100)
    } else {
      setAnswerState('wrong')
      window.setTimeout(() => {
        speakArabic(getTryAgain()) // ✅ ينطق "حاول مرة أخرى" فقط — بدون الشرح
      }, 100)
    }
  };

  const retryAnswer = () => {
    // ✅ إعادة المحاولة عند الإجابة الخاطئة
    setPicked(null)
    setAnswerState(null)
  }

  const next = () => {
    if (idx + 1 >= questions.length) {
      const fresh = saveQuizResult(`${worldId}_${level}`, score, level);
      if (fresh.length) setNewBadges(fresh);
      setFinished(true);
      window.setTimeout(() => {
        speakArabic(
          score / questions.length >= 0.7
            ? 'مُمتاز! نَتيجَةٌ رائِعَة!'
            : 'أَحسَنتَ المُحاوَلَة! جَرِّب مَرَّةً أُخرى',
        )
      }, 100)
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setAnswerState(null) // ✅ إعادة تعيين الحالة للسؤال الجديد
  };

  // باقي الكود (شاشة النتيجة والـ JSX) بدون تغيير...

  // ─── شاشة النتيجة ───
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
    const rating =
      pct >= 90
        ? '⭐ مُمتاز!'
        : pct >= 70
        ? '🌟 أَحسَنت!'
        : '💡 حاوِل مَرَّةً أُخرى';
    return (
      <div
        className="result-screen fade-in"
        style={{
          background: `linear-gradient(160deg, ${color}22, #ffffff 60%)`,
          borderRadius: 26,
          padding: '26px 20px',
          textAlign: 'center',
          boxShadow: `0 14px 34px ${color}22`,
        }}
      >
        <div style={{ fontSize: '4.5rem', lineHeight: 1, marginBottom: 6 }}>
          {pct >= 70 ? '🏆' : '🌟'}
        </div>
        <div style={{ fontSize: '1.8rem', letterSpacing: 4, marginBottom: 6 }}>
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
        <h2 style={{ color, margin: '0 0 8px', fontSize: '1.6rem' }}>{rating}</h2>
        <p style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 10px', color: '#333' }}>
          {score} / {questions.length}
        </p>
        <div
          className="progress-bar-wrap"
          style={{ margin: '12px 0 22px', height: 14, borderRadius: 10 }}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1, minWidth: 140, fontSize: '1.05rem', padding: '14px 18px', borderRadius: 16 }}
            onClick={onExit}
          >
            🔁 مُستَوى آخَر
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{
              flex: 1,
              minWidth: 140,
              fontSize: '1.05rem',
              padding: '14px 18px',
              borderRadius: 16,
              background: `linear-gradient(135deg, ${color}, ${color}bb)`,
            }}
            onClick={() => navigate('/islamic')}
          >
            🏠 الرَّئيسِيَّة
          </button>
        </div>
        {newBadges.length > 0 && (
          <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />
        )}
      </div>
    );
  }

  const qEmoji = emojiForQuestion(q, worldIcon);

  return (
    <div>
      {/* شريط التقدم — بدون تغيير */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '.95rem', marginBottom: 10, color: '#555' }}>
        <span style={{ background: '#fff', border: `2px solid ${color}30`, borderRadius: 14, padding: '4px 12px' }}>
          سُؤال {idx + 1} / {questions.length}
        </span>
        <span style={{ background: `${color}18`, color, borderRadius: 14, padding: '4px 12px', border: `2px solid ${color}30` }}>
          ✓ {score}
        </span>
      </div>
      <div className="progress-bar-wrap" style={{ height: 12, borderRadius: 10 }}>
        <div className="progress-bar-fill" style={{ width: `${(idx / questions.length) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
      </div>

      {/* كارت السؤال */}
      <div className="quiz-question fade-in" style={{ marginTop: 16, background: '#fff', borderRadius: 22, padding: '18px 16px 20px', boxShadow: `0 12px 30px ${color}1f, 0 2px 6px rgba(0,0,0,.05)`, border: `2px solid ${color}22` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, background: `linear-gradient(135deg, ${color}14, #ffffff)`, borderRadius: 18, padding: '12px 12px' }}>
          <div aria-hidden="true" style={{ width: 64, height: 64, flexShrink: 0, borderRadius: '50%', background: `linear-gradient(135deg, ${color}30, ${color}15)`, border: `3px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: `0 6px 16px ${color}2a` }}>
            {qEmoji}
          </div>
          <p className="q-text" style={{ flex: 1, margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2b3540', lineHeight: 1.8 }}>
            {q.text}
          </p>
          <SpeakButton text={qSpeech} />
        </div>

        {q.options.map((opt, i) => {
          // ✅ تلوين الأزرار حسب الحالة الجديدة
          
          const isPickedWrong = answerState === 'wrong' && picked === i
          const isPickedCorrect = answerState === 'correct' && i === q.correctIndex

          let cls = 'quiz-option';
          if (answerState === 'correct') cls += ' disabled';
          if (isPickedCorrect) cls += ' correct';
          if (isPickedWrong) cls += ' retry';

          return (
            <button
              type="button"
              key={opt}
              className={cls}
              onClick={() => answer(i)}
              style={{
                fontSize: '1.05rem', padding: '14px 14px', borderRadius: 16, marginBottom: 10, borderWidth: 2.5,
                transition: 'transform .15s ease, box-shadow .2s ease',
                boxShadow: isPickedCorrect
                  ? '0 6px 16px rgba(76,175,80,.28)'
                  : isPickedWrong
                  ? '0 6px 16px rgba(255,152,0,.25)'
                  : '0 2px 6px rgba(0,0,0,.04)',
              }}
            >
              <span style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: isPickedCorrect ? '#4CAF50' : isPickedWrong ? '#FF9800' : `${color}18`,
                color: isPickedCorrect || isPickedWrong ? '#fff' : color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1rem',
                border: `2px solid ${isPickedCorrect ? '#4CAF50' : isPickedWrong ? '#FF9800' : `${color}40`}`,
              }}>
                {LETTERS[i]}
              </span>
              <span style={{ flex: 1, fontWeight: 700 }}>{opt}</span>
              {isPickedCorrect && <span style={{ fontSize: '1.2rem' }}>✅</span>}
              {isPickedWrong && <span style={{ fontSize: '1.2rem' }}>💡</span>}
            </button>
          );
        })}

        {/* ✅ شرح الإجابة — يظهر فقط عند الإجابة الصحيحة */}
        {answerState === 'correct' && (
          <div className="fade-in" style={{ background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)', borderRadius: 16, padding: '12px 14px', marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', border: '2px solid #A5D6A7' }}>
            <span style={{ fontSize: '1.6rem' }}>🎉</span>
            <p style={{ margin: 0, flex: 1, fontSize: '.95rem', color: '#444', lineHeight: 1.8, fontWeight: 600 }}>
              {q.explanation}
            </p>
            <SpeakButton text={q.explanation} size="sm" />
          </div>
        )}

        {/* ✅ رسالة الخطأ مع زر إعادة المحاولة */}
        {answerState === 'wrong' && (
          <div className="fade-in" style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFFDE7)', borderRadius: 16, padding: '12px 14px', marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', border: '2px solid #FFE082' }}>
            <span style={{ fontSize: '1.6rem' }}>💡</span>
            <p style={{ margin: 0, flex: 1, fontSize: '.95rem', color: '#444', lineHeight: 1.8, fontWeight: 600 }}>
              حاوِل مَرَّةً أُخرى!
            </p>
            <button
              type="button"
              onClick={retryAnswer}
              style={{ background: '#FF9800', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 16px', fontFamily: 'inherit', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer' }}
            >
              🔄 حاوِل
            </button>
          </div>
        )}
      </div>

      {/* ✅ زر التالي — يظهر فقط عند الإجابة الصحيحة */}
      {answerState === 'correct' && (
        <div style={{ textAlign: 'center', marginTop: 16 }} className="fade-in">
          <button
            type="button"
            className="btn-primary"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, fontSize: '1.1rem', padding: '14px 28px', borderRadius: 18, fontWeight: 900, boxShadow: `0 10px 24px ${color}55` }}
            onClick={next}
          >
            {idx + 1 >= questions.length ? 'النَّتيجَة 🎉' : 'التّالي ←'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── صفحة اختيار المستوى ───
const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { worldId = 'values' } = useParams<{ worldId: string }>();
  const meta = WORLDS[worldId] ?? WORLDS.values;
  const [level, setLevel] = useState<Level | null>(null);
  const [round, setRound] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const progress = getIslamicProgress();

  const chooseLevel = (l: Level) => {
  const pool = getQuizByWorld(worldId, l);
  const source = pool.length ? pool : getQuizByWorld(worldId);
  const selectedQuestions = shuffle(source).slice(0, Math.min(7, source.length));
  setActiveQuestions(selectedQuestions);
  setRound((r) => r + 1);
  setLevel(l);
  // ✅ احذف speakArabic من هنا — useEffect في Questions سيتولى النطق
};

  useAutoSpeak(level ? null : 'اخْتَر مُستَوى الاختِبار', worldId);

  // أفضل نتيجة سابقة لكل مستوى (إن وُجدت)
  const bestFor = (l: Level): number | null => {
    const rec = progress.completedQuizzes?.[`${worldId}_${l}`];
    if (!rec) return null;
    return typeof rec.score === 'number' ? rec.score : null;
  };

  return (
    <PageShell
      onBack={() => (level ? setLevel(null) : navigate(-1))}
      icon={meta.icon}
      title={`اختِبارُ ${meta.title}`}
      subtitle={level ? undefined : 'اخْتَر المُستَوى'}
      maxWidth={520}
    >
      {!level && (
        <div className="fade-in">
          {/* هيدر تحفيزي */}
          <div
            style={{
              background: `linear-gradient(135deg, ${meta.color}25, ${meta.color}10, #ffffff)`,
              borderRadius: 22,
              padding: '18px 18px',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: `2px solid ${meta.color}30`,
              boxShadow: `0 10px 26px ${meta.color}1f`,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                fontSize: '2.6rem',
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${meta.color}35, ${meta.color}15)`,
                border: `3px solid ${meta.color}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 8px 18px ${meta.color}30`,
              }}
            >
              {meta.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem', color: meta.color }}>
                هَيّا نَلعَب وَنَتَعَلَّم! 🎈
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '.95rem', color: '#555', fontWeight: 600 }}>
                اِختَرْ مُستَواكَ وَابدَأِ الاختِبار
              </p>
            </div>
          </div>

          {LEVELS.map((l) => {
            const best = bestFor(l.key);
            return (
              <button
                type="button"
                key={l.key}
                onClick={() => chooseLevel(l.key)}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: `3px solid ${l.color}40`,
                  borderRadius: 20,
                  padding: '16px 16px',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'right',
                  boxShadow: `0 8px 22px ${l.color}22`,
                  transition: 'transform .15s ease, box-shadow .2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${l.soft}, #ffffff)`,
                    border: `3px solid ${l.color}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.9rem',
                    flexShrink: 0,
                  }}
                >
                  {l.icon}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 900,
                      fontSize: '1.25rem',
                      color: l.color,
                      marginBottom: 2,
                    }}
                  >
                    {l.label}
                  </span>
                  <span style={{ display: 'block', fontSize: '.9rem', color: '#666', fontWeight: 600 }}>
                    {l.desc}
                  </span>
                  {best !== null && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 6,
                        fontSize: '.82rem',
                        fontWeight: 800,
                        color: '#2E7D32',
                        background: '#E8F5E9',
                        border: '1.5px solid #A5D6A7',
                        borderRadius: 12,
                        padding: '2px 10px',
                      }}
                    >
                      ★ أَفضَلُ نَتيجَة: {best}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '1.4rem', color: l.color }}>›</span>
              </button>
            );
          })}
        </div>
      )}
      {level && activeQuestions.length > 0 && (
        <Questions
          key={round}
          questions={activeQuestions}
          color={meta.color}
          worldId={worldId}
          level={level}
          worldIcon={meta.icon}
          onExit={() => setLevel(null)}
        />
      )}
    </PageShell>
  );
};

export default QuizPage;
