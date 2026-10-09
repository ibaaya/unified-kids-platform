import { useMemo, useState } from 'react';
import type { MatchQ, Opt } from '../../data/types';
import { shuffle } from '../../data/kit';
import { Visual } from '../Visual';
import type { RendererProps } from './types';

const DONE_COLORS = [
  'border-emerald-400 bg-emerald-50', 'border-sky-400 bg-sky-50', 'border-amber-400 bg-amber-50',
  'border-pink-400 bg-pink-50', 'border-violet-400 bg-violet-50', 'border-orange-400 bg-orange-50',
];

function Face({ o }: { o: Opt }) {
  return (
    <span className="flex flex-col items-center gap-1">
      {o.visual && <Visual token={o.visual} size={52} />}
      {o.label && <span className="text-xl font-extrabold">{o.label}</span>}
    </span>
  );
}

export default function MatchRenderer({ q, onMistake, onSolved }: RendererProps<MatchQ>) {
  const lefts = useMemo(() => q.pairs.map((p) => p.left), [q]);
  const rights = useMemo(() => shuffle(q.pairs.map((p) => p.right)), [q]);
  const [sel, setSel] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({}); // leftId -> rightId
  const [shake, setShake] = useState<string | null>(null);

  const tapRight = (rid: string) => {
    if (!sel) return;
    const pair = q.pairs.find((p) => p.left.id === sel)!;
    if (pair.right.id === rid) {
      const next = { ...matched, [sel]: rid };
      setMatched(next); setSel(null);
      if (Object.keys(next).length === q.pairs.length) onSolved();
    } else {
      setShake(rid); window.setTimeout(() => setShake(null), 500); setSel(null); onMistake();
    }
  };
  const leftIdx = (id: string) => lefts.findIndex((l) => l.id === id);
  const rightOwner = (rid: string) => Object.entries(matched).find(([, r]) => r === rid)?.[0];

  return (
    <div className="grid w-full grid-cols-2 gap-6">
      <div className="flex flex-col gap-3">
        {lefts.map((l, i) => {
          const m = matched[l.id] !== undefined;
          return (
            <button key={l.id} type="button" disabled={m} onClick={() => setSel(l.id)}
              className={`rounded-3xl border-4 p-3 shadow-md transition active:scale-95 ${m ? DONE_COLORS[i % 6] : sel === l.id ? 'border-indigo-500 bg-indigo-100 scale-105' : 'border-indigo-200 bg-white hover:bg-indigo-50'}`}>
              <Face o={l} />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-3">
        {rights.map((r) => {
          const owner = rightOwner(r.id);
          return (
            <button key={r.id} type="button" disabled={owner !== undefined} onClick={() => tapRight(r.id)}
              className={`rounded-3xl border-4 p-3 shadow-md transition active:scale-95 ${owner ? DONE_COLORS[leftIdx(owner) % 6] : shake === r.id ? 'border-rose-400 bg-rose-100 skills-shake' : 'border-indigo-200 bg-white hover:bg-indigo-50'}`}>
              <Face o={r} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
