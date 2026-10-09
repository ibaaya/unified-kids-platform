import { useMemo, useState } from 'react';
import type { OrderQ, Opt } from '../../data/types';
import { shuffle, toAr } from '../../data/kit';
import { Visual } from '../Visual';
import type { RendererProps } from './types';

function Card({ o, big }: { o: Opt; big?: boolean }) {
  return (
    <span className={`flex items-center justify-center gap-3 ${big ? 'flex-row' : 'flex-col'}`}>
      {o.visual && <Visual token={o.visual} size={big ? 44 : 56} scale={o.scale ?? 1} />}
      {o.label && <span className="text-lg font-extrabold leading-relaxed md:text-xl">{o.label}</span>}
    </span>
  );
}

export default function OrderRenderer({ q, onMistake, onSolved }: RendererProps<OrderQ>) {
  const pool = useMemo(() => {
    let s = shuffle(q.items);
    if (s.every((x, i) => x.id === q.items[i].id)) s = [...s].reverse();
    return s;
  }, [q]);
  const [placed, setPlaced] = useState<Opt[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const vertical = q.items.some((i) => (i.label?.length ?? 0) > 14);

  const tap = (item: Opt) => {
    if (placed.length === q.items.length) return;
    if (item.id === q.items[placed.length].id) {
      const next = [...placed, item];
      setPlaced(next);
      if (next.length === q.items.length) onSolved();
    } else {
      setShake(item.id); window.setTimeout(() => setShake(null), 500); onMistake();
    }
  };
  const remaining = pool.filter((p) => !placed.some((x) => x.id === p.id));

  return (
    <div className="flex w-full flex-col gap-5">
      <div className={vertical ? 'flex flex-col gap-2' : 'flex flex-wrap items-end justify-center gap-3'}>
        {q.items.map((_, i) => {
          const it = placed[i];
          return (
            <div key={i} className={`flex items-center gap-3 rounded-3xl border-4 p-2 ${it ? 'border-emerald-400 bg-emerald-50' : 'border-dashed border-slate-300 bg-white/60'} ${vertical ? 'min-h-[64px]' : 'min-h-[84px] min-w-[84px] justify-center'}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-500 text-lg font-black text-white" aria-hidden="true">{toAr(i + 1)}</span>
              {it && <Card o={it} big={vertical} />}
            </div>
          );
        })}
      </div>
      <div className={vertical ? 'flex flex-col gap-2' : 'flex flex-wrap items-end justify-center gap-3'}>
        {remaining.map((o) => (
          <button key={o.id} type="button" onClick={() => tap(o)}
            className={`rounded-3xl border-4 border-indigo-200 bg-white p-3 shadow-md transition hover:bg-indigo-50 active:scale-95 ${shake === o.id ? 'border-rose-400 bg-rose-100 skills-shake' : ''}`}>
            <Card o={o} big={vertical} />
          </button>
        ))}
      </div>
    </div>
  );
}
