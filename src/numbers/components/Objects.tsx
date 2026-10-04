
import { motion } from "framer-motion";
import { emojiFor } from "../data/content";
// شبكة عناصر بصفوف من ٥ (تسهّل العد ولا تتداخل)؛ عند الضغط على عنصر يُنطق رقمه
export default function Objects({ n, salt = 0, e, onTap }: { n: number; salt?: number; e?: string; onTap?: (i: number) => void }) {
  return (<div className="mx-auto grid w-fit gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(n, 5)}, auto)` }}>
    {Array.from({ length: n }, (_, i) => (<motion.button key={i} whileTap={{ scale: 1.3 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.03 }} className="flex h-14 w-14 items-center justify-center text-4xl" onClick={() => onTap?.(i + 1)}>{e ?? emojiFor(n, salt)}</motion.button>))}
  </div>);
}
// نقاط صغيرة مرتبة تلتف على أسطر (للخيارات والبطاقات)
export function Dots({ n, e }: { n: number; e: string }) {
  return <span className="flex max-w-[11rem] flex-wrap justify-center gap-1 text-2xl leading-none">{Array.from({ length: n }, (_, i) => <span key={i}>{e}</span>)}</span>;
}
