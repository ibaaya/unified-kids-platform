import { useEffect, useState } from 'react'

const DEDICATION_SEEN_KEY = 'rehlati-dedication-seen'

function dedicationWasSeen(): boolean {
  try { return window.localStorage.getItem(DEDICATION_SEEN_KEY) === '1' } catch { return false }
}

function markDedicationSeen(): void {
  try { window.localStorage.setItem(DEDICATION_SEEN_KEY, '1') } catch { /* storage may be unavailable */ }
}

export function FirstVisitDedication() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!dedicationWasSeen()) setOpen(true)
  }, [])

  if (!open) return null
  const close = () => {
    markDedicationSeen()
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="dedication-title" dir="rtl" className="w-full max-w-md rounded-3xl border border-amber-100 bg-white p-7 text-center shadow-2xl">
        <div className="mb-3 text-5xl" aria-hidden="true">🤲</div>
        <h2 id="dedication-title" className="mb-3 text-2xl font-extrabold text-indigo-950">رسالة الصدقة الجارية</h2>
        <p className="mb-6 leading-8 text-slate-700">نسأل الله أن يجعل هذا العمل نافعًا للأطفال، وأن يكتب أجره لكل من ساهم فيه، وأن يجعله صدقةً جاريةً خالصةً لوجهه الكريم.</p>
        <button type="button" onClick={close} className="rounded-2xl bg-indigo-700 px-8 py-3 font-extrabold text-white shadow-lg transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">آمين 🤲</button>
      </section>
    </div>
  )
}

export function DedicationCard() {
  return (
    <section dir="rtl" className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-right shadow-sm">
      <h2 className="mb-2 font-extrabold text-amber-950">🤲 الصدقة الجارية</h2>
      <p className="mb-4 text-sm leading-7 text-amber-950/80">نسأل الله أن يجعل رحلتي نافعًا للأطفال، وأن يكتب الأجر لوالدتي  ووالدي  وأهل بيتي  ولكل من ساهم في هذا العمل.</p>
      <p className="text-sm font-bold text-slate-700">للاستفسار والتواصل: <a className="text-indigo-700 underline underline-offset-2" href="mailto:jawab.tik@gmail.com">jawab.tik@gmail.com</a></p>
    </section>
  )
}
