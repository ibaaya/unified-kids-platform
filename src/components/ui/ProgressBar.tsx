interface ProgressBarProps {
  percent: number // 0-100
  colorVar?: string
  label?: string
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-sm text-[var(--color-ink-soft)]">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className="relative h-4 w-full overflow-hidden rounded-full border border-white/85 bg-slate-900/25 shadow-[inset_0_2px_4px_rgba(25,50,60,.3),0_2px_5px_rgba(25,50,60,.16)]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* غيّر نقاط التدرج هنا لتعديل لون التعبئة الأزرق اللؤلؤي. */}
        <div
          className="relative h-full overflow-hidden rounded-full transition-all duration-700 ease-[var(--ease-bounce)]"
          style={{ width: `${clamped}%`, background: 'linear-gradient(180deg, #f4fdff 0%, #b9efff 16%, #54c9f4 44%, #168fce 76%, #08649f 100%)', boxShadow: 'inset 0 2px 2px rgba(255,255,255,.9), inset 0 -2px 2px rgba(5,67,110,.55), 0 1px 6px rgba(16,145,207,.62)' }}
        >
          {clamped > 0 && <span className="progress-pearl-shine absolute inset-x-1 top-0.5 h-1/3 rounded-full bg-white/75" aria-hidden="true" />}
        </div>
      </div>
    </div>
  )
}
