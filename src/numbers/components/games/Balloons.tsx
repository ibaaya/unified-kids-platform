
import { useEffect, useRef, useState } from "react";
import { fmt, NAMES, speak, stopSpeaking } from "../../lib/arabic";
import { uniq, useStar, r, TRY } from "./shared";
// بالونات الأرقام: بالون حقيقي (شكله من CSS في globals.css)
const COLORS = ["#ff5d8f", "#ffd93d", "#4cc9f0", "#6bcf7f", "#9b8cff", "#ff9f43"];
export default function Balloons({ onDone }: { onDone: () => void }) {
  const { p, star } = useStar(); const [round, setRound] = useState(0); const [nums, setNums] = useState<number[]>([]); const [t, setT] = useState(1); const [msg, setMsg] = useState(""); const [popped, setPopped] = useState<number | null>(null); const [settled, setSettled] = useState(false); const busy = useRef(false);
  const say = (x: number) => speak(`فَرْقِعِ الْبَالُونَ رَقْمَ ${NAMES[x]}`, p.sound);
  useEffect(() => { busy.current = false; setSettled(false); const n = uniq(6); const target = n[r(0, 5)]; setNums(n); setT(target); setPopped(null); say(target); }, [round]);
  const popSound = () => {
    if (!p.sound) return;
    try {
      const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
      if (!Audio) return;
      const ctx = new Audio(); void ctx.resume();
      const length = Math.floor(ctx.sampleRate * 0.16); const buffer = ctx.createBuffer(1, length, ctx.sampleRate); const samples = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const noise = ctx.createBufferSource(); noise.buffer = buffer; const filter = ctx.createBiquadFilter(); const crack = ctx.createGain();
      filter.type = "lowpass"; filter.frequency.value = 1500; crack.gain.setValueAtTime(0.65, ctx.currentTime); crack.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      noise.connect(filter); filter.connect(crack); crack.connect(ctx.destination); noise.start();
      const osc = ctx.createOscillator(); const thump = ctx.createGain(); osc.type = "sine"; osc.frequency.setValueAtTime(180, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.14);
      thump.gain.setValueAtTime(0.45, ctx.currentTime); thump.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(thump); thump.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.17); osc.onended = () => void ctx.close();
    } catch { /* الصوت الإضافي تحسين اختياري */ }
  };
  const tap = (n: number) => { if (busy.current || settled) return; stopSpeaking(); if (n !== t) { setMsg(TRY); return; } busy.current = true; popSound(); setPopped(n); setMsg("أَحْسَنْتَ! ⭐"); setSettled(true); star(); };
  const next = () => { if (round + 1 >= p.questionCount) onDone(); else setRound((value) => value + 1); };
  return (<div className="numbers-card numbers-game-card text-center"><h2 className="text-2xl font-extrabold">فَرْقِعِ الْبَالُونَ رَقْمَ {fmt(t, p.eastern)} <button aria-label="اسْتَمِع" onClick={() => say(t)}>🔊</button></h2>
    <div className="numbers-balloon-area mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">{nums.map((n, i) => <div key={n} className="flex justify-center"><button type="button" disabled={settled} onClick={() => tap(n)} aria-label={String(n)} className="numbers-balloon disabled:cursor-default" style={{ background: COLORS[i % COLORS.length], opacity: popped === n ? .45 : 1, transform: popped === n ? 'scale(.85)' : undefined }}><span className="numbers-balloon-label">{fmt(n, p.eastern)}</span></button></div>)}</div>
    <p className="mt-3 min-h-8 text-xl font-extrabold">السؤال {fmt(round + 1, p.eastern)} / {fmt(p.questionCount, p.eastern)} · {msg}</p>
    {settled && <button type="button" className="btn numbers-action-button mx-auto mt-3 bg-emerald-500 text-white" onClick={next}>{round + 1 >= p.questionCount ? "إنهاء اللعبة" : "السؤال التالي ←"}</button>}</div>);
}
