import { useMemo, useState } from 'react';
import type { MemoryQ } from '../../data/types';
import { shuffle, toAr } from '../../data/kit';
import { Visual } from '../Visual';
import type { RendererProps } from './types';

export default function MemoryRenderer({ q, onMistake, onSolved }: RendererProps<MemoryQ>) {
  const cards = useMemo(
    () => shuffle(q.cards.flatMap((c) => [{ uid: `${c.id}a`, base: c.id, visual: c.visual! }, { uid: `${c.id}b`, base: c.id, visual: c.visual! }])),
    [q]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const [locked, setLocked] = useState(false);
  const cols = cards.length <= 6 ? 'grid-cols-3' : cards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-6';

  const flip = (uid: string) => {
    if (locked || open.includes(uid) || matched.includes(cards.find((c) => c.uid === uid)!.base)) return;
    const next = [...open, uid];
    setOpen(next);
    if (next.length === 2) {
      const [a, b] = next.map((u) => cards.find((c) => c.uid === u)!);
      if (a.base === b.base) {
        const m = [...matched, a.base];
        setMatched(m); setOpen([]);
        if (m.length === q.cards.length) onSolved(wrong <= q.cards.length);
      } else {
        setWrong((w) => w + 1); onMistake(true); setLocked(true);
        window.setTimeout(() => { setOpen([]); setLocked(false); }, 800);
      }
    }
  };

  return (
    <div className="w-full">
      <div className={`mx-auto grid max-w-xl gap-3 ${cols}`} dir="ltr">
        {cards.map((c) => {
          const faceUp = open.includes(c.uid) || matched.includes(c.base);
          return (
            <button key={c.uid} type="button" onClick={() => flip(c.uid)} aria-label="بِطَاقَةٌ"
              className={`grid aspect-square place-items-center rounded-3xl border-4 shadow-md transition active:scale-95 ${faceUp ? (matched.includes(c.base) ? 'border-emerald-400 bg-emerald-50' : 'border-indigo-300 bg-white') : 'border-indigo-600 bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
              {faceUp ? <Visual token={c.visual} size={52} /> : <span className="text-4xl font-black text-white/80" aria-hidden="true">؟</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-lg font-extrabold text-indigo-700">الْأَزْوَاجُ: {toAr(matched.length)} / {toAr(q.cards.length)}</p>
    </div>
  );
}
