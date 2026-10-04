import { Link } from "react-router-dom";

export default function CompletionActions({ nextHref, onNext, nextLabel = "التَّالِي ▶", replayLabel = "🔄 إِعَادَة", onReplay }: {
  nextHref?: string; onNext?: () => void; nextLabel?: string; replayLabel?: string; onReplay: () => void;
}) {
  return <div className="numbers-completion-actions" dir="rtl">
    {nextHref ? <Link className="numbers-next-button" to={nextHref}>{nextLabel}</Link> : <button type="button" className="numbers-next-button" onClick={onNext}>{nextLabel}</button>}
    <button type="button" className="numbers-replay-button" onClick={onReplay}>{replayLabel}</button>
  </div>;
}
