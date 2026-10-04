import { useRef, useState } from 'react'
import { AVATAR_PRESETS } from '../../data/avatars'

export function ChildAvatar({ avatar, name, size = 48 }: { avatar?: string; name: string; size?: number }) {
  const customImage = avatar?.startsWith('data:image/') ? avatar : null
  const preset = AVATAR_PRESETS.find((item) => item.id === avatar) ?? AVATAR_PRESETS[0]
  const dimension = `${size}px`

  return (
    <span
      className="child-avatar-float inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-amber-100 via-white to-sky-200"
      style={{ width: dimension, height: dimension, fontSize: `${Math.round(size * 0.58)}px`, boxShadow: '0 10px 20px rgba(28,58,75,.28), inset 0 3px 5px rgba(255,255,255,.95), inset 0 -4px 7px rgba(49,112,143,.16)' }}
    >
      {customImage ? <img src={customImage} alt={`صورة ${name}`} className="h-full w-full object-cover" /> : <span aria-label={preset.name}>{preset.emoji}</span>}
    </span>
  )
}

export function AvatarPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  function handleFile(file?: File) {
    setError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('اختر صورة بصيغة JPG أو PNG أو WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الصورة أكبر من 2 ميغابايت. اختر صورة أصغر.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
      else setError('تعذر قراءة الصورة. حاول اختيارها مرة أخرى.')
    }
    reader.onerror = () => setError('تعذر قراءة الصورة. حاول اختيارها مرة أخرى.')
    reader.readAsDataURL(file)
  }

  return (
    <fieldset className="text-right">
      <legend className="font-bold mb-3">اختر صديق رحلتك</legend>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {AVATAR_PRESETS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            aria-label={`اختيار ${avatar.name}`}
            aria-pressed={value === avatar.id}
            onClick={() => { setError(''); onChange(avatar.id) }}
            className={`min-h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all hover:-translate-y-1 ${value === avatar.id ? 'border-[var(--color-sky)] bg-[var(--color-sky)]/10 shadow-md' : 'border-black/10 bg-white'}`}
          >
            <span className="text-3xl" aria-hidden="true">{avatar.emoji}</span>
            <span className="text-[11px] font-bold">{avatar.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-bold hover:bg-sky-50">
          📷 رفع صورة
        </button>
        <ChildAvatar avatar={value} name="الصورة المختارة" size={72} />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => { handleFile(event.target.files?.[0]); event.currentTarget.value = '' }}
        />
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-rose-700">{error}</p>}
      <p className="mt-2 text-xs text-[var(--color-ink-soft)]">تبقى الصورة على هذا الجهاز، وبحجم لا يتجاوز 2 ميغابايت.</p>
    </fieldset>
  )
}
