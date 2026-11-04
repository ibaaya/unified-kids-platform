// src/skills/components/SkillsShell.tsx
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isSoundOn, setSoundOn, speechSupported } from '../engine/speech';
import { getTotalStars } from '../engine/progress';
import { toAr } from '../data/kit';

export function SoundToggle() {
  const [on, setOn] = useState(isSoundOn());
  if (!speechSupported()) return null;
  return (
    <button type="button" onClick={() => { setSoundOn(!on); setOn(!on); }} aria-pressed={on}
      aria-label={on ? 'كَتْمُ الصَّوْتِ' : 'تَشْغِيلُ الصَّوْتِ'}
      className="rounded-2xl border-2 border-indigo-200 bg-white px-3 py-2 text-2xl shadow transition hover:scale-105">
      {on ? '🔊' : '🔇'}
    </button>
  );
}

export default function SkillsShell({ children, title, back }: { children: ReactNode; title?: string; back?: { to: string; label: string } }) {
  return (
    <div dir="rtl" className="skills-root min-h-screen bg-gradient-to-br from-sky-100 via-pink-50 to-indigo-100 pt-16 font-arabic text-slate-800">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-2 p-4">
       <Link
            to={back?.to ?? '/'}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border-4 border-indigo-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-xl font-black text-white shadow-[0_8px_0_0_rgba(67,56,202,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_12px_0_0_rgba(67,56,202,0.6)] active:translate-y-1 active:shadow-[0_4px_0_0_rgba(67,56,202,0.6)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            {/* الأيقونة الثابتة */}
            <span className="relative text-2xl transition-transform duration-200 group-hover:-translate-x-1">
              ⬅️
            </span>

            <span className="relative drop-shadow-md">
              {back?.label ?? 'الْمَنَصَّةُ'}
            </span>

            <span className="relative text-2xl transition-transform duration-200 group-hover:rotate-12">
              ⭐
            </span>
          </Link>
  
        {title && <h1 className="text-center text-xl font-black text-indigo-900 md:text-2xl">{title}</h1>}
        <div className="flex items-center gap-2">
          <span className="rounded-2xl bg-white px-3 py-2 text-lg font-black text-amber-600 shadow" aria-label="النُّجُومُ">⭐ {toAr(getTotalStars())}</span>
          <SoundToggle />
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 pb-16">{children}</main>
    </div>
  );
}
