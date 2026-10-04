import { useMemo, useState, type ReactNode } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { HomeButton } from '../components/ui/HomeButton'

/**
 * حماية بسيطة تمنع الطفل من الدخول للوحة ولي الأمر بالخطأ:
 * سؤال حسابي بسيط لا يستطيع طفل عمر 6-7 سنوات حله بسهولة عشوائيًا.
 */
export function ProtectedParentRoute({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(false)

  const { a, b } = useMemo(
    () => ({ a: 4 + Math.floor(Math.random() * 5), b: 6 + Math.floor(Math.random() * 6) }),
    [],
  )

  if (unlocked) return <>{children}</>

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Number(answer) === a * b) {
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-sm w-full p-8 text-center">
        <h1 className="font-display text-lg font-extrabold mb-1">منطقة ولي الأمر</h1>
        <p className="text-[var(--color-ink-soft)] mb-5">للتأكيد، ما ناتج العملية التالية؟</p>
        <p className="text-3xl font-display font-extrabold mb-4">
          {a} × {b}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value)
              setError(false)
            }}
            className="w-full text-center text-xl rounded-[var(--radius-md)] border-2 border-black/10 px-4 py-3 focus:border-[var(--color-sky)] outline-none"
            autoFocus
          />
          {error && <p className="text-[var(--color-coral)] text-sm">حاول مرة أخرى.</p>}
          <Button type="submit">دخول</Button>
          <HomeButton label="الْعَوْدَةُ" />
        </form>
      </Card>
    </div>
  )
}
