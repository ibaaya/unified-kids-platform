import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Quiz from "../components/Quiz";
import CompletionActions from "../components/CompletionActions";
import { EMOJIS, STAGES } from "../data/content";
import { NAMES, fmt, loc, speak } from "../lib/arabic";
import { rangeChallengeSet } from "../lib/questions";
import { useProgress } from "../lib/progress";
import { NumbersPageFrame } from "../components/NumbersPageFrame";
export function NumbersChallengePage() {
  const { id } = useParams<{ id: string }>(); const stage = STAGES.find((item) => item.id === id && item.range); const range = stage?.range; const [p] = useProgress(); const [target,setTarget]=useState<number|null>(null); const [emoji,setEmoji]=useState("🍎"); const [added,setAdded]=useState(0); const [ready,setReady]=useState(false); const questions=useMemo(()=>rangeChallengeSet(range?.[0]??1,range?.[1]??5,p.questionCount),[range,p.questionCount]);
  useEffect(()=>{if(!range)return;setTarget(range[0]+Math.floor(Math.random()*(range[1]-range[0]+1)));setEmoji(EMOJIS[Math.floor(Math.random()*EMOJIS.length)]);setAdded(0);setReady(false)},[range,p.questionCount]);
  if(!stage||!range)return <NumbersPageFrame><div className="numbers-card text-center"><p className="mb-4 text-2xl font-extrabold">هذه المغامرة غير متاحة.</p><Link to="/numbers/map" className="btn bg-yellow-300">العودة إلى مسار المغامرة</Link></div></NumbersPageFrame>;
  if(ready)return <NumbersPageFrame><Quiz questions={questions.slice(0,p.questionCount)} next="/numbers/map" topic="range-review"/></NumbersPageFrame>;
  if(target===null)return <NumbersPageFrame><div className="numbers-card min-h-40" aria-busy="true"/></NumbersPageFrame>;
  const addOne=()=>{if(added>=target)return;const next=added+1;setAdded(next);speak(NAMES[next],p.sound)};
  return <NumbersPageFrame background={stage.background}><div className="numbers-card text-center"><div className="text-5xl">🎉</div><h1 className="my-2 text-2xl font-extrabold">تَحَدِّي مَجْمُوعَةِ {loc(stage.title)}</h1><p className="text-xl font-bold">أَضِفْ {fmt(target,p.eastern)} مِنَ {emoji}، وَاضْغَطْ عَدَدَهَا مَرَّاتٍ</p><div className="my-4 flex min-h-20 flex-wrap items-center justify-center gap-2 rounded-3xl bg-sky-50/85 p-3">{Array.from({length:added},(_,i)=><span key={i} className="text-4xl">{emoji}</span>)}</div><p className="mb-3 text-xl font-extrabold text-violet-700">{fmt(added,p.eastern)} / {fmt(target,p.eastern)}</p>{added<target?<button className="btn numbers-action-button bg-amber-300" onClick={addOne}>➕ أَضِفْ {emoji}</button>:<><p className="text-xl font-extrabold text-emerald-700">أَحْسَنْتَ! عَدَدْتَها كُلَّها 🌟</p><CompletionActions onNext={()=>setReady(true)} nextLabel="ابدأ الأسئلة ▶" replayLabel="🔄 أعِد العدّ" onReplay={()=>setAdded(0)}/></>}</div></NumbersPageFrame>;
}
