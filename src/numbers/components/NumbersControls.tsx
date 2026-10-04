import { Link } from "react-router-dom";
import { useProgress } from "../lib/progress";

// أدوات ثابتة في أعلى الصفحة، فوق المحتوى، ولا تحجز مساحة من التخطيط.
export default function NumbersControls() {
  const [p, up] = useProgress();
  const scale = p.textScale ?? 1;
  const increase = () => up((s) => ({ ...s, textScale: Math.min(1.4, Number((scale + 0.1).toFixed(2))) }));
  const reset = () => up((s) => ({ ...s, textScale: 1 }));
  const level = Math.max(1, Math.round((scale - 1) / 0.1));
  const percent = Math.round(scale * 100);
  return (
    <div className="numbers-fixed-controls" dir="ltr">
      <div className="numbers-control-right">
        <Link to="/numbers/parent" className="numbers-control-button numbers-parent-gear" aria-label="لوحة ولي الأمر" title="لوحة ولي الأمر">⚙️</Link>
      </div>
      <div className="numbers-control-left">
        <button type="button" className="numbers-control-button numbers-zoom-button" onClick={increase} aria-label="تكبير النص" title="تكبير النص">
          A{level > 0 ? "+".repeat(level) : "+"}
        </button>
        {scale > 1 && <button type="button" className="numbers-control-scale" onClick={reset} aria-label="إعادة حجم النص" title="إعادة حجم النص">{percent}%</button>}
      </div>
    </div>
  );
}
