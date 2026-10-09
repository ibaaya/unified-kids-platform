import { useState } from 'react';
import type { PaintQ } from '../../data/types';
import { TEMPLATES, type Shape } from '../paintTemplates';
import type { RendererProps } from './types';

const STROKE = { stroke: '#475569', strokeWidth: 3, strokeLinejoin: 'round' as const };

function El({ s, fill, onClick }: { s: Shape; fill: string; onClick: () => void }) {
  const common = { fill, ...STROKE, onClick, className: 'cursor-pointer transition-colors' };
  switch (s.k) {
    case 'rect':    return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 0} {...common} />;
    case 'circle':  return <circle cx={s.cx} cy={s.cy} r={s.r} {...common} />;
    case 'ellipse': return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...common} />;
    case 'poly':    return <polygon points={s.pts} {...common} />;
    case 'path':    return <path d={s.d} {...common} />;
  }
}

export default function PaintRenderer({ q, onSolved }: RendererProps<PaintQ>) {
  const tpl = TEMPLATES[q.template];
  const [color, setColor] = useState(q.palette[0]);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const painted = Object.keys(fills).length;

  const paint = (id: string) => !done && setFills((f) => ({ ...f, [id]: color }));
  const finish = () => { setDone(true); onSolved(true); };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2 rounded-3xl bg-white/80 p-2 shadow" role="group" aria-label="أَلْوَانٌ">
        {q.palette.map((c) => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label="لَوْنٌ"
            className={`h-11 w-11 rounded-full border-4 transition active:scale-90 ${color === c ? 'scale-125 border-slate-800' : 'border-white'} shadow`} style={{ background: c }} />
        ))}
      </div>
      <svg viewBox={tpl.viewBox} className="w-full max-w-lg rounded-3xl border-4 border-white bg-sky-50 shadow-xl" role="img" aria-label="رَسْمَةٌ">
        {tpl.ground && <rect x="0" y="140" width="200" height="20" fill="#bbf7d0" />}
        {tpl.parts.map((p) => p.shapes.map((s, i) => <El key={`${p.id}${i}`} s={s} fill={fills[p.id] ?? '#f8fafc'} onClick={() => paint(p.id)} />))}
      </svg>
      <p className="text-lg font-extrabold text-fuchsia-700" aria-hidden="true">{painted} / {tpl.parts.length} 🎨</p>
      <button type="button" disabled={painted < tpl.parts.length || done} onClick={finish}
        className="rounded-3xl bg-fuchsia-500 px-8 py-3 text-xl font-black text-white shadow-lg disabled:opacity-40">الرَّسْمَةُ جَاهِزَةٌ 🎉</button>
    </div>
  );
}
