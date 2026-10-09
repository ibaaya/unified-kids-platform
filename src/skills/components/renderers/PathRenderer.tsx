import { useMemo, useState } from 'react';
import type { PathQ } from '../../data/types';
import { speak } from '../../engine/speech';
import type { RendererProps } from './types';

type Pos = [number, number];

export default function PathRenderer({ q, onMistake, onSolved }: RendererProps<PathQ>) {
  const grid = useMemo(() => q.grid.map((r) => r.split('')), [q]);
  const start = useMemo<Pos>(() => {
    for (let r = 0; r < grid.length; r++) { const c = grid[r].indexOf('S'); if (c >= 0) return [r, c]; }
    return [0, 0];
  }, [grid]);
  const totalStars = useMemo(() => grid.flat().filter((c) => c === '*').length, [grid]);
  const [pos, setPos] = useState<Pos>(start);
  const [got, setGot] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [shake, setShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const cols = grid[0].length;

  const flash = (k: string) => { setShake(k); window.setTimeout(() => setShake(null), 400); };
  const say = (t: string) => { setNote(t); speak(t); };

  const tap = (r: number, c: number) => {
    if (done) return;
    if (Math.abs(r - pos[0]) + Math.abs(c - pos[1]) !== 1) { flash(`${r},${c}`); return; }
    const cell = grid[r][c];
    if (cell === '#') { flash(`${r},${c}`); say('هُنَاكَ صَخْرَةٌ، اخْتَرْ طَرِيقًا آخَرَ.'); return; }
    if (cell === 'X') { setPos(start); setGot([]); say('وَقَعْتَ فِي حُفْرَةٍ! نَبْدَأُ مِنْ جَدِيدٍ.'); onMistake(true); return; }
    if (cell === 'G') {
      if (q.mustCollect && got.length < totalStars) { say('اجْمَعْ كُلَّ النُّجُومِ أَوَّلًا.'); flash(`${r},${c}`); return; }
      setPos([r, c]); setDone(true); onSolved(); return;
    }
    if (cell === '*' && !got.includes(`${r},${c}`)) setGot((g) => [...g, `${r},${c}`]);
    setNote(''); setPos([r, c]);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="grid gap-1.5 rounded-3xl border-4 border-amber-300 bg-amber-100 p-3 shadow-lg" dir="ltr"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {grid.map((row, r) => row.map((cell, c) => {
          const here = pos[0] === r && pos[1] === c;
          const k = `${r},${c}`;
          const hasStar = cell === '*' && !got.includes(k);
          return (
            <button key={k} type="button" onClick={() => tap(r, c)} aria-label="مُرَبَّعٌ"
              className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl transition active:scale-90 sm:h-16 sm:w-16 ${cell === '#' ? 'bg-stone-400' : cell === 'X' ? 'bg-rose-200' : cell === 'G' ? 'bg-emerald-200' : 'bg-amber-50'} ${shake === k ? 'skills-shake' : ''}`}>
              <span aria-hidden="true">{here ? '🐪' : cell === '#' ? '🪨' : cell === 'X' ? '🕳️' : cell === 'G' ? '🌴' : hasStar ? '⭐' : ''}</span>
            </button>
          );
        }))}
      </div>
      {totalStars > 0 && <p className="text-lg font-extrabold text-amber-700" aria-hidden="true">{'⭐'.repeat(got.length)}{'☆'.repeat(totalStars - got.length)}</p>}
      {note && <p className="rounded-2xl bg-white px-4 py-2 text-lg font-extrabold text-rose-600 shadow">{note}</p>}
    </div>
  );
}
