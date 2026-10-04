import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { listChildren, switchActiveChild } from '../../services/progressService'
import type { ChildProfile } from '../../types/progress'
import { ChildAvatar } from '../../components/character/AvatarPicker'

/**
 * شاشة "اختر اسمك" — نقطة الدخول لأي جهاز عليه أكثر من طالب واحد.
 * لا تتطلب أي حماية (اختيار الاسم فقط)، بعكس لوحة ولي الأمر المحمية بسؤال حسابي.
 */
export function StudentLogin() {
  const [children, setChildren] = useState<ChildProfile[] | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listChildren().then(setChildren)
  }, [])

  async function handleSelect(id?: number) {
    if (!id) return
    await switchActiveChild(id)
    navigate('/', { replace: true })
  }

  if (children === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--color-ink-soft)] font-bold text-xl">
        ✨ لحظة من فضلك...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <Mascot message="أهلًا! من الذي سيتعلم اليوم؟ 🌟" size={100} />
        </div>

        <h1 className="font-display text-2xl font-extrabold text-[var(--color-ink)] mb-6">
          اختر اسمك
        </h1>

        {children.length === 0 ? (
          <p className="text-[var(--color-ink-soft)] mb-6">لا يوجد طلاب محفوظون على هذا الجهاز بعد.</p>
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            {children.map((c) => (
              <Button
                key={c.id}
                variant="secondary"
                size="lg"
                onClick={() => handleSelect(c.id)}
              >
                <span className="flex items-center justify-between gap-4 w-full">
                  <ChildAvatar avatar={c.avatar} name={c.name} size={48} />
                  <span>{c.name}</span>
                </span>
              </Button>
            ))}
          </div>
        )}

        <Button onClick={() => navigate('/onboarding')}>+ طالب جديد</Button>
      </Card>
    </div>
  )
}
