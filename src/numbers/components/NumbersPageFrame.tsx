import { type CSSProperties, type ReactNode, useEffect } from "react";
import NumbersControls from "./NumbersControls";
import "../numbers.css";
import { useProgress } from "../lib/progress";
import { stopSpeaking } from "../lib/arabic";

export function NumbersPageFrame({ children }: { children: ReactNode; background?: string }) {
  const [p] = useProgress();
  useEffect(() => () => stopSpeaking(), []);
  return (
    <div className="numbers-root numbers-page-bg" dir="rtl" style={{ "--numbers-scale": p.textScale ?? 1, backgroundImage: `linear-gradient(rgba(255,255,255,.08),rgba(255,255,255,.08)),url('/images/numbers-bg.webp')` } as CSSProperties}>
      <NumbersControls />
      <main className="numbers-content">{children}</main>
    </div>
  );
}
