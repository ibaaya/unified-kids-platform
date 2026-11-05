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
    <div dir="rtl" className="skills-root min-h-screen bg-gradient-to-br from-sky-100 via-pink-50 to-indigo-100 pt-16 pb-28 font-arabic text-slate-800" style={{ backgroundImage: 'linear-gradient(135deg, rgba(224,242,254,.70), rgba(253,242,248,.72), rgba(224,231,255,.74)), url("/images/skills_bg.webp")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <header className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between">
       <Link
            to={back?.to ?? '/'}
            className="group relative col-span-1 inline-flex min-h-11 items-center justify-center gap-1.5 overflow-hidden rounded-full border-2 border-indigo-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 py-2 text-sm font-black text-white shadow-[0_4px_0_0_rgba(67,56,202,0.6)] transition-all duration-200 hover:-translate-y-0.5 sm:gap-2 sm:border-4 sm:px-6 sm:py-3 sm:text-lg"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            {/* الأيقونة الثابتة */}
            <span className="relative text-lg transition-transform duration-200 group-hover:-translate-x-1 sm:text-2xl">
              ⬅️
            </span>

            <span className="relative drop-shadow-md">
              {back?.label ?? 'الْمَنَصَّةُ'}
            </span>

            <span className="relative hidden text-2xl transition-transform duration-200 group-hover:rotate-12 sm:inline">
              ⭐
            </span>
          </Link>
  
        {title && <h1 className="col-span-2 order-last rounded-2xl bg-white/80 px-3 py-2 text-center text-lg font-black text-indigo-900 shadow-sm sm:order-none sm:bg-transparent sm:px-2 sm:text-xl md:text-2xl">{title}</h1>}
        <div className="flex items-center justify-end gap-2">
          <span className="rounded-2xl bg-white px-2 py-2 text-sm font-black text-amber-600 shadow sm:px-3 sm:text-lg" aria-label="النُّجُومُ">⭐ {toAr(getTotalStars())}</span>
          <SoundToggle />
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 pb-24">{children}</main>
    </div>
  );
}
