// src/skills/components/Visual.tsx
// يعرض «صورة»: إيموجي، شكل SVG ملوّن، عيّنة لون، أو رقم. لا يُنطق أبدًا (aria-hidden).
import React from 'react';
import type { Token } from '../data/types';

const SHAPE_PATHS: Record<string, (c: string) => React.ReactNode> = {
  circle:   (c) => <circle cx="50" cy="50" r="42" fill={c} />,
  square:   (c) => <rect x="10" y="10" width="80" height="80" rx="6" fill={c} />,
  rect:     (c) => <rect x="4" y="25" width="92" height="50" rx="6" fill={c} />,
  triangle: (c) => <polygon points="50,8 93,88 7,88" fill={c} strokeLinejoin="round" />,
  star:     (c) => <polygon points="50,5 61,38 96,38 68,59 78,93 50,72 22,93 32,59 4,38 39,38" fill={c} />,
  heart:    (c) => <path d="M50 88 C10 58 6 30 28 20 C40 15 50 25 50 32 C50 25 60 15 72 20 C94 30 90 58 50 88Z" fill={c} />,
  diamond:  (c) => <polygon points="50,6 92,50 50,94 8,50" fill={c} />,
  hexagon:  (c) => <polygon points="25,10 75,10 98,50 75,90 25,90 2,50" fill={c} />,
  oval:     (c) => <ellipse cx="50" cy="50" rx="45" ry="28" fill={c} />,
  crescent: (c) => <path d="M60 12 A40 40 0 1 0 60 88 A60 60 0 0 1 60 12 Z" fill={c} />,
};

export function Visual({ token, size = 56, scale = 1 }: { token: Token; size?: number; scale?: number }) {
  const px = Math.round(size * scale);
  if (token.startsWith('shape:')) {
    const [, shape, color] = token.split(':');
    const draw = SHAPE_PATHS[shape] ?? SHAPE_PATHS.circle;
    return (
      <svg width={px} height={px} viewBox="0 0 100 100" aria-hidden="true" className="shrink-0 drop-shadow-sm">
        {draw(color)}
      </svg>
    );
  }
  if (token.startsWith('color:')) {
    return <span aria-hidden="true" className="inline-block rounded-2xl border-4 border-white shadow-md shrink-0" style={{ width: px, height: px, background: token.slice(6) }} />;
  }
  if (token.startsWith('num:')) {
    return <span aria-hidden="true" className="font-black text-slate-800 leading-none" style={{ fontSize: px * 0.75 }}>{token.slice(4)}</span>;
  }
  return <span aria-hidden="true" className="leading-none select-none" style={{ fontSize: px * 0.85 }}>{token}</span>;
}

/** صف صور (تسلسل) مع خانة «؟» اختيارية */
export function PictureRow({ tokens, size = 52 }: { tokens: Token[]; size?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
      {tokens.map((t, i) =>
        t === '?' ? (
          <span key={i} aria-hidden="true" className="grid place-items-center rounded-2xl border-4 border-dashed border-indigo-400 bg-white/70 font-black text-indigo-500"
            style={{ width: size + 14, height: size + 14, fontSize: size * 0.7 }}>؟</span>
        ) : (
          <span key={i} className="grid place-items-center rounded-2xl bg-white/80 px-2 shadow-sm" style={{ minWidth: size + 14, height: size + 14 }}>
            <Visual token={t} size={size} />
          </span>
        ),
      )}
    </div>
  );
}
