// src/skills/components/LevelRunner.tsx
// محرّك المستوى: يسحب الأسئلة، يوزّع العرض حسب النوع، ينطق السؤال تلقائيًا، ويحسب النجوم.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question, SkillGame, GameLevel } from '../data/types';
import { pickOne } from '../data/kit';
import { speak, stopSpeaking } from '../engine/speech';
import { scoreToStars } from '../engine/scoring';
import { saveLevelResult } from '../engine/progress';
import ChoiceRenderer from './renderers/ChoiceRenderer';
import OrderRenderer from './renderers/OrderRenderer';
import MatchRenderer from './renderers/MatchRenderer';
import MemoryRenderer from './renderers/MemoryRenderer';
import PathRenderer from './renderers/PathRenderer';
import SceneRenderer from './renderers/SceneRenderer';
import PaintRenderer from './renderers/PaintRenderer';
import ResultPanel from './ResultPanel';

const OK = ['أَحْسَنْتَ! ','إِجَابَةٌ صَحِيحَةٌ.', 'رَائِعٌ! ','عَمَلٌ مُمْتَازٌ.', 'اسْتَمِرَّ.'];
const OPEN = ['فِكْرَةٌ جَمِيلَةٌ! ','خَيَالٌ جَمِيلٌ.'];
const CREATE = ['عَمَلٌ مُبْدِعٌ.','إِبْدَاعَ!'];
const BAD =['لَا بَأْسَ، حَاوِلْ مٌجَدَداً.','فَكِّرْ جَيِّدًا ','قَرِيبٌ جِدًّا.','جَرِّبْ مَرَّةً ثَانِيَةً'];


type Feedback = { kind: 'good' | 'bad' | 'hint'; text: string } | null;

export default function LevelRunner({ game, level }: { game: SkillGame; level: GameLevel }) {
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo<Question[]>(() => level.build(), [level, attempt]);
  const [idx, setIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [perfectCount, setPerfectCount] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [result, setResult] = useState<{ score: number; stars: number } | null>(null);
  const qMistakes = useRef(0);
  const q = questions[idx];

  // النطق التلقائي لكل سؤال جديد
  useEffect(() => { if (q && !result) speak(q.speech ?? q.prompt); }, [q, idx, result]);
  useEffect(() => () => stopSpeaking(), []);

  const onMistake = (silent?: boolean) => {
    qMistakes.current += 1;
    setTotalMistakes((t) => t + 1);
    if (silent) return;
    const useHint = qMistakes.current >= 2 && !!q.hint;
    const text = useHint ? q.hint! : pickOne(BAD);
    setFeedback({ kind: useHint ? 'hint' : 'bad', text });
    speak(text);
  };

  const onSolved = (perfect?: boolean) => {
    const ok = perfect ?? qMistakes.current === 0;
    if (ok) setPerfectCount((c) => c + 1);
    const praise = q.type === 'scene' || q.type === 'paint' ? pickOne(CREATE)
      : q.type === 'choice' && q.openEnded ? pickOne(OPEN) : pickOne(OK);
    setFeedback({ kind: 'good', text: q.explain ? `${praise} ${q.explain}` : praise });
    speak(q.explain ? `${praise} ${q.explain}` : praise);
    setSolved(true);
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      qMistakes.current = 0; setIdx(idx + 1); setSolved(false); setFeedback(null);
      return;
    }
    const score = (perfectCount / questions.length) * 100;
    const stars = scoreToStars(score);
    saveLevelResult(game.id, level.level, { score, stars, mistakes: totalMistakes });
    setResult({ score, stars });
  };

  const retry = () => {
    qMistakes.current = 0; setAttempt((a) => a + 1); setIdx(0); setSolved(false);
    setPerfectCount(0); setTotalMistakes(0); setFeedback(null); setResult(null);
  };

  if (result) {
    return <ResultPanel score={result.score} stars={result.stars} mistakes={totalMistakes} gameId={game.id} level={level.level} hasNext={level.level < 3} onRetry={retry} />;
  }

  const props = { onMistake, onSolved };
  const k = `${attempt}-${idx}`; // مفتاح يعيد تهيئة اللعبة عند كل سؤال جديد
  return (
    <div className="flex flex-col items-center gap-4">
      {/* التقدّم */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {questions.map((_, i) => (
          <span key={i} className={`h-3 w-8 rounded-full ${i < idx ? 'bg-emerald-400' : i === idx ? 'bg-amber-400' : 'bg-slate-300'}`} />
        ))}
      </div>

      {/* بطاقة السؤال + أيقونة إعادة السماع */}
      <div className="flex w-full items-center gap-3 rounded-3xl border-4 border-indigo-200 bg-white/90 p-5 shadow-xl">
        <p className="flex-1 text-center text-2xl font-extrabold leading-loose text-indigo-950 md:text-3xl">{q.prompt}</p>
        <button type="button" onClick={() => speak(q.speech ?? q.prompt, { force: true })} aria-label="أَعِدِ السَّمَاعَ" title="أَعِدِ السَّمَاعَ"
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-indigo-500 text-3xl text-white shadow-lg transition hover:scale-110 active:scale-95">🔊</button>
      </div>

      {/* منطقة اللعب */}
      <div className="w-full">
        {q.type === 'choice' && <ChoiceRenderer key={k} q={q} {...props} />}
        {q.type === 'order' && <OrderRenderer key={k} q={q} {...props} />}
        {q.type === 'match' && <MatchRenderer key={k} q={q} {...props} />}
        {q.type === 'memory' && <MemoryRenderer key={k} q={q} {...props} />}
        {q.type === 'path' && <PathRenderer key={k} q={q} {...props} />}
        {q.type === 'scene' && <SceneRenderer key={k} q={q} {...props} />}
        {q.type === 'paint' && <PaintRenderer key={k} q={q} {...props} />}
      </div>

      {feedback && (
        <div role="status" className={`w-full rounded-3xl border-4 p-4 text-center text-xl font-black md:text-2xl skills-pop ${feedback.kind === 'good' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : feedback.kind === 'hint' ? 'border-amber-300 bg-amber-100 text-amber-900' : 'border-rose-300 bg-rose-100 text-rose-800'}`}>
          {feedback.kind === 'hint' && <span aria-hidden="true">💡 </span>}{feedback.text}
        </div>
      )}

      {solved && (
        <button type="button" onClick={next} className="rounded-3xl bg-gradient-to-r from-amber-400 to-orange-400 px-10 py-4 text-2xl font-black text-slate-900 shadow-xl transition hover:scale-105 skills-pop">
          {idx + 1 < questions.length ? 'التَّالِي ⬅️' : 'أَنْهَيْتُ الْمُسْتَوَى 🏁'}
        </button>
      )}
    </div>
  );
}
