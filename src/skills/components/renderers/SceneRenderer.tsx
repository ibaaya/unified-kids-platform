import { useState } from 'react';
import type { Backdrop, SceneQ } from '../../data/types';
import { toAr } from '../../data/kit';
import { Visual } from '../Visual';
import type { RendererProps } from './types';

const BACKDROPS: Record<Backdrop, string> = {
  garden: 'bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-300',
  sea:    'bg-gradient-to-b from-sky-200 via-cyan-300 to-blue-500',
  desert: 'bg-gradient-to-b from-sky-200 via-amber-100 to-amber-300',
  night:  'bg-gradient-to-b from-indigo-950 via-indigo-800 to-indigo-600',
  sky:    'bg-gradient-to-b from-sky-300 via-sky-200 to-white',
};
interface Placed { uid: number; token: string; x: number; y: number }

export default function SceneRenderer({ q, onSolved }: RendererProps<SceneQ>) {
  const [selected, setSelected] = useState<string | null>(q.stickers[0] ?? null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [done, setDone] = useState(false);

  const put = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selected || done) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPlaced((p) => [...p, { uid: Date.now() + p.length, token: selected, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }]);
  };
  const remove = (uid: number) => !done && setPlaced((p) => p.filter((x) => x.uid !== uid));
  const finish = () => { setDone(true); onSolved(true); };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2 rounded-3xl bg-white/80 p-2 shadow">
        {q.stickers.map((s) => (
          <button key={s} type="button" onClick={() => setSelected(s)} aria-label="صُورَةٌ"
            className={`grid h-14 w-14 place-items-center rounded-2xl border-4 transition active:scale-90 ${selected === s ? 'border-fuchsia-500 bg-fuchsia-100 scale-110' : 'border-transparent bg-white'}`}>
            <Visual token={s} size={40} />
          </button>
        ))}
      </div>
      <div onClick={put} dir="ltr" role="img" aria-label="لَوْحَةٌ"
        className={`relative h-72 w-full cursor-pointer overflow-hidden rounded-3xl border-4 border-white shadow-xl md:h-96 ${BACKDROPS[q.backdrop]}`}>
        {placed.map((p) => (
          <button key={p.uid} type="button" onClick={(e) => { e.stopPropagation(); remove(p.uid); }} aria-label="إِزَالَةٌ"
            className="absolute -translate-x-1/2 -translate-y-1/2 transition hover:scale-110" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <Visual token={p.token} size={44} />
          </button>
        ))}
        {placed.length === 0 && <span className="absolute inset-0 grid place-items-center text-xl font-extrabold text-slate-500/70">اضْغَطْ هُنَا لِتَضَعَ الصُّورَةَ</span>}
      </div>
      <p className="text-lg font-extrabold text-fuchsia-700">وَضَعْتَ {toAr(placed.length)} مِنْ {toAr(q.need)}</p>
      <button type="button" disabled={placed.length < q.need || done} onClick={finish}
        className="rounded-3xl bg-fuchsia-500 px-8 py-3 text-xl font-black text-white shadow-lg disabled:opacity-40">اللَّوْحَةُ جَاهِزَةٌ 🎉</button>
    </div>
  );
}
