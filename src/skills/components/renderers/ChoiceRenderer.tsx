import { useEffect, useMemo, useState } from 'react';
import type { ChoiceQ } from '../../data/types';
import { shuffle, toAr } from '../../data/kit';
import { PictureRow, Visual } from '../Visual';
import type { RendererProps } from './types';

export default function ChoiceRenderer({ q, onMistake, onSolved }: RendererProps<ChoiceQ>) {
  const options = useMemo(() => shuffle(q.options), [q]);
  const answers = useMemo(() => (Array.isArray(q.answer) ? q.answer : [q.answer]), [q]);
  const [phase, setPhase] = useState<'flash' | 'answer'>(q.flash ? 'flash' : 'answer');
  const [left, setLeft] = useState(q.flash?.seconds ?? 0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (phase !== 'flash') return;
    const t = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);
  useEffect(() => { if (phase === 'flash' && left <= 0) setPhase('answer'); }, [left, phase]);

  const tap = (id: string) => {
    if (done) return;
    if (q.multi) { setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])); return; }
    if (q.openEnded) { setPicked([id]); setDone(true); onSolved(true); return; }
    if (answers.includes(id)) { setPicked([id]); setDone(true); onSolved(); }
    else { setWrong((w) => [...w, id]); onMistake(); }
  };
  const check = () => {
    const ok = picked.length === answers.length && answers.every((a) => picked.includes(a));
    if (ok) { setDone(true); onSolved(); } else { onMistake(); setPicked([]); }
  };

  if (phase === 'flash' && q.flash) {
    return (
      <div className="w-full rounded-3xl border-4 border-indigo-300 bg-white/80 p-6 text-center shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
          {q.flash.items.map((t, i) => <Visual key={i} token={t} size={72} />)}
        </div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-500 text-3xl font-black text-white animate-pulse" aria-hidden="true">{toAr(Math.max(left, 0))}</div>
        <p className="mt-3 text-lg font-extrabold text-indigo-800">تَذَكَّرْ جَيِّدًا!</p>
      </div>
    );
  }

  const hasVisual = options.some((o) => o.visual);
  const imageOnly = options.every((o) => o.visual && !o.label);
  const cols = !hasVisual ? 'grid-cols-1 md:grid-cols-2'
    : options.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4';

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {q.pictureRows?.map((row, i) => <PictureRow key={i} tokens={row} />)}
      {q.sequence && <PictureRow tokens={q.sequence.length && !q.sequence.includes('?') ? [...q.sequence, '?'] : q.sequence} />}
      <div className={`grid w-full gap-3 ${cols}`}>
        {options.map((o) => {
          const isPicked = picked.includes(o.id);
          const isWrong = wrong.includes(o.id);
          const isRight = done && answers.includes(o.id) && (isPicked || !q.multi);
          let cls = 'border-indigo-200 bg-white text-indigo-950 hover:bg-indigo-50';
          if (isPicked && !done) cls = 'border-indigo-500 bg-indigo-100 text-indigo-950 scale-105';
          if (isWrong) cls = 'border-rose-400 bg-rose-100 text-rose-900 skills-shake';
          if (isRight || (done && q.openEnded && isPicked)) cls = 'border-emerald-500 bg-emerald-100 text-emerald-900 scale-105';
          return (
            <button key={o.id} type="button" disabled={done || isWrong} onClick={() => tap(o.id)}
              className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-3xl border-4 p-3 text-center text-xl font-extrabold shadow-md transition active:scale-95 md:text-2xl ${cls}`}>
              {o.visual && <Visual token={o.visual} size={imageOnly ? 72 : 52} />}
              {o.label && <span className="leading-relaxed">{o.label}</span>}
            </button>
          );
        })}
      </div>
      {q.multi && !done && (
        <button type="button" onClick={check} disabled={picked.length === 0}
          className="rounded-3xl bg-emerald-500 px-8 py-3 text-xl font-black text-white shadow-lg disabled:opacity-40">تَحَقَّقْ ✅</button>
      )}
    </div>
  );
}
