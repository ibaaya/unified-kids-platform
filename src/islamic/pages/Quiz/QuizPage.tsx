import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SpeakButton from '../../components/SpeakButton';
import BadgeToast from '../../components/BadgeToast';
import { getQuizByWorld } from '../../data/quizzes';
import type { QuizQuestion } from '../../data/types';
import { saveQuizResult } from '../../engine/islamicProgress';
import { getEncouragement, getGentleMiss, speakArabic, speakSequence } from '../../engine/islamicSound';
import { useAutoSpeak } from '../../engine/useAutoSpeak';

// =====================================================
// الاختبارات: ٣ مستويات، تنطق كل سؤال تلقائياً مع الخيارات
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

const LEVELS: { key: Level; label: string; icon: string; desc: string }[] = [
  { key: 'easy', label: 'سَهل', icon: '🟢', desc: 'أَسئِلَةٌ بَسيطَة' },
  { key: 'medium', label: 'مُتَوَسِّط', icon: '🟡', desc: 'أَسئِلَةٌ مُتَوَسِّطَة' },
  { key: 'hard', label: 'مُتَقَدِّم', icon: '🔵', desc: 'أَسئِلَةٌ أَكثَرُ تَفكيراً' },
];

const LETTERS = ['أ', 'ب', 'ج', 'د'];

const shuffle = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

const Questions: React.FC<{
  questions: QuizQuestion[];
  color: string;
  worldId: string;
  level: Level;
  onExit: () => void;
}> = ({ questions, color, worldId, level, onExit }) => {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const q = questions[idx];
  const answered = picked !== null;
  const qSpeech = `${q.text}. ${q.options.join('، أَو ')}`;
  useAutoSpeak(finished ? null : qSpeech, idx);

  const answer = (i: number) => {
    if (answered) return;
    setPicked(i);
    const ok = i === q.correctIndex;
    if (ok) setScore((s) => s + 1);
    speakSequence([ok ? getEncouragement() : getGentleMiss(), q.explanation]);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const fresh = saveQuizResult(`${worldId}_${level}`, score, level);
      if (fresh.length) setNewBadges(fresh);
      setFinished(true);
      speakArabic(score / questions.length >= 0.7 ? 'مُمتاز! نَتيجَةٌ رائِعَة!' : 'أَحسَنتَ المُحاوَلَة! جَرِّب مَرَّةً أُخرى');
      return;
    }
    setIdx(idx + 1);
    setPicked(null);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const rating = pct >= 90 ? '⭐ مُمتاز!' : pct >= 70 ? '🌟 َأَحْسَنْت!' : '💡 حاوِل مَرَّةً أُخرى';
    return (
      <div className="result-screen fade-in">
        <div className="result-emoji">🌟</div>
        <h2 style={{ color }}>{rating}</h2>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px' }}>
          {score} / {questions.length}
        </p>
        <div className="progress-bar-wrap" style={{ margin: '12px 0 22px' }}>
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onExit}>
            مُستَوى آخَر
          </button>
          <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={() => navigate('/islamic')}>
            الرَّئيسِيَّة
          </button>
        </div>
        {newBadges.length > 0 && <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontWeight: 600, fontSize: '.85rem', marginBottom: 8 }}>
        <span>سُؤال {idx + 1} / {questions.length}</span>
        <span style={{ color }}>✓ {score}</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${(idx / questions.length) * 100}%`, background: color }} />
      </div>

      <div className="quiz-question fade-in" style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
          <p className="q-text" style={{ flex: 1, margin: 0 }}>{q.text}</p>
          <SpeakButton text={qSpeech} />
        </div>
        {q.options.map((opt, i) => {
          let cls = 'quiz-option';
          if (answered) {
            cls += ' disabled';
            if (i === q.correctIndex) cls += ' correct';
            else if (i === picked) cls += ' retry';
          }
          return (
            <button type="button" key={opt} className={cls} onClick={() => answer(i)}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.85rem' }}>
                {LETTERS[i]}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          );
        })}
        {answered && (
          <div className="fade-in" style={{ background: picked === q.correctIndex ? '#E8F5E9' : '#FFF8E1', borderRadius: 14, padding: '12px 14px', marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
            <SpeakButton text={q.explanation} size="sm" />
            <p style={{ margin: 0, flex: 1, fontSize: '.9rem', color: '#444', lineHeight: 1.7 }}>
              {picked === q.correctIndex ? '✓ ' : '💡 '}
              {q.explanation}
            </p>
          </div>
        )}
      </div>

      {answered && (
        <div style={{ textAlign: 'center', marginTop: 14 }} className="fade-in">
          <button type="button" className="btn-primary" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }} onClick={next}>
            {idx + 1 >= questions.length ? 'النَّتيجَة 🎉' : 'التّالي ←'}
          </button>
        </div>
      )}
    </div>
  );
};

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { worldId = 'values' } = useParams<{ worldId: string }>();
  const meta = WORLDS[worldId] ?? WORLDS.values;
  const [level, setLevel] = useState<Level | null>(null);
  const [round, setRound] = useState(0);

  const questions = useMemo(() => {
    if (!level) return [];
    const pool = getQuizByWorld(worldId, level);
    const source = pool.length ? pool : getQuizByWorld(worldId);
    return shuffle(source).slice(0, Math.min(7, source.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, worldId, round]);

  const chooseLevel = (l: Level) => {
    setRound((r) => r + 1);
    setLevel(l);
  };

  useAutoSpeak(level ? null : 'اخْتَر مُستَوى الاختِبار', worldId);

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
          {LEVELS.map((l) => (
            <button
              type="button"
              key={l.key}
              onClick={() => chooseLevel(l.key)}
              style={{ width: '100%', background: '#fff', border: '2.5px solid #e8e8e8', borderRadius: 16, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right' }}
            >
              <span style={{ fontSize: '1.6rem' }}>{l.icon}</span>
              <span>
                <span style={{ display: 'block', fontWeight: 800, color: '#333' }}>{l.label}</span>
                <span style={{ fontSize: '.82rem', color: '#888' }}>{l.desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {level && questions.length > 0 && (
        <Questions key={round} questions={questions} color={meta.color} worldId={worldId} level={level} onExit={() => setLevel(null)} />
      )}
    </PageShell>
  );
};

export default QuizPage;
