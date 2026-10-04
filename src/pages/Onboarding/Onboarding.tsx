import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Mascot } from '../../components/character/Mascot'
import { useChildProfile } from '../../hooks/useChildProfile'
import { AvatarPicker } from '../../components/character/AvatarPicker'
import { DEFAULT_AVATAR_ID } from '../../types/progress'

export function Onboarding() {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR_ID)
  const { createProfile, hasAnyChildren } = useChildProfile()
  const navigate = useNavigate()

  async function handleStart(overrideName?: string) {
    await createProfile(overrideName ?? name, avatar)
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-4">
          <Mascot message="أهلًا بك! هيا نبدأ رحلتنا معًا 🌟" size={110} />
        </div>

        <h1 className="font-display text-2xl font-extrabold text-[var(--color-ink)] mb-2">
          مرحبًا يا بطل 🌟
        </h1>
        <p className="text-[var(--color-ink-soft)] mb-6">هل أنت مستعد لتعلم العربية؟</p>

        <label htmlFor="child-name" className="block text-right font-semibold mb-2">
          ما اسمك؟
        </label>
        <input
          id="child-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب اسمك هنا"
          className="w-full text-lg text-center rounded-[var(--radius-md)] border-2 border-black/10 px-4 py-3 mb-5 focus:border-[var(--color-sky)] outline-none"
        />

        <div className="mb-6"><AvatarPicker value={avatar} onChange={setAvatar} /></div>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => handleStart()}>
            هيا نبدأ 🚀
          </Button>
          <Button variant="ghost" onClick={() => handleStart('بطل')}>
            تخطّي هذه الخطوة
          </Button>
          {hasAnyChildren && (
            <Button variant="ghost" onClick={() => navigate('/login')}>
              لديّ حساب بالفعل — عودة لاختيار الاسم
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
