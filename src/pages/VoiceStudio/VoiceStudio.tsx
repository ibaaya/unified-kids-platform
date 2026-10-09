import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as lamejs from '@breezystack/lamejs'
import type { VoiceRecordingItem } from '../../types/voiceStudio'
import { deleteVoiceRecording, loadVoiceItems, saveVoiceRecording } from '../../services/voiceStudioService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

type Filter = 'all' | VoiceRecordingItem['group']

const groupLabels: Record<string, string> = {
  letters: 'الحروف',
  harakat: 'الحركات',
  syllables: 'المقاطع',
  words: 'الكلمات',
  sentences: 'الجمل',
  stories: 'القصص',
  'letters-prompts': 'أسئلة عالم الحروف',
  'harakat-prompts': 'أسئلة عالم الحركات',
  'syllables-prompts': 'أسئلة عالم المقاطع',
  'words-prompts': 'أسئلة عالم الكلمات',
  'sentences-prompts': 'أسئلة عالم الجمل',
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

/**
 * إزالة الصمت من البداية والنهاية اعتمادًا على طاقة إطار قصير بدل عينة واحدة.
 * هذا يقلل التقاط ذيول الصدى الهادئة، مع هامش 60ms لحماية بدايات ونهايات الكلام.
 */
function trimSilence(samples: Float32Array, sampleRate: number): Float32Array {
  if (!samples.length) return samples

  const frameSize = Math.max(1, Math.round(sampleRate * 0.01))
  const thresholdRms = 0.006
  let firstFrame = -1
  let lastFrame = -1
  for (let start = 0; start < samples.length; start += frameSize) {
    const end = Math.min(samples.length, start + frameSize)
    let energy = 0
    for (let i = start; i < end; i += 1) energy += samples[i] * samples[i]
    const rms = Math.sqrt(energy / (end - start))
    if (rms >= thresholdRms) {
      if (firstFrame < 0) firstFrame = start
      lastFrame = end - 1
    }
  }

  if (firstFrame < 0 || lastFrame < 0) {
    return new Float32Array(Math.min(samples.length, Math.round(sampleRate * 0.12)))
  }

  const padding = Math.round(sampleRate * 0.06)
  const start = Math.max(0, firstFrame - padding)
  const end = Math.min(samples.length, lastFrame + 1 + padding)
  return samples.slice(start, end)
}

/**
 * Normalize إلى Peak = -1 dBFS مع حد أقصى للكسب لتجنب تضخيم ضوضاء الغرفة.
 */
function normalizeVolume(samples: Float32Array): Float32Array {
  let peak = 0
  for (let i = 0; i < samples.length; i += 1) peak = Math.max(peak, Math.abs(samples[i]))
  if (peak < 0.0001) return samples

  const target = Math.pow(10, -1 / 20)
  const gain = Math.min(target / peak, Math.pow(10, 12 / 20))
  const result = new Float32Array(samples.length)
  for (let i = 0; i < samples.length; i += 1) {
    result[i] = Math.max(-1, Math.min(1, samples[i] * gain))
  }
  return result
}

/** تحويل معدل التسجيل من AudioContext غالبًا 44.1/48k إلى 24kHz. */
function resampleLinear(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return samples
  const newLength = Math.max(1, Math.round(samples.length * toRate / fromRate))
  const result = new Float32Array(newLength)
  const ratio = fromRate / toRate

  for (let i = 0; i < newLength; i += 1) {
    const position = i * ratio
    const left = Math.floor(position)
    const right = Math.min(left + 1, samples.length - 1)
    const fraction = position - left
    result[i] = samples[left] * (1 - fraction) + samples[right] * fraction
  }
  return result
}

/** ترميز Mono 24kHz / 64kbps MP3 باستخدام lamejs داخل المتصفح. */
function encodeMp3(samples: Float32Array, sampleRate: number): Blob {
  const targetRate = 24000
  const prepared = resampleLinear(samples, sampleRate, targetRate)
  const encoder = new lamejs.Mp3Encoder(1, targetRate, 64)
  const mp3Data: BlobPart[] = []
  const samplesPerFrame = 1152
  const pcm = new Int16Array(prepared.length)

  for (let i = 0; i < prepared.length; i += 1) {
    const value = Math.max(-1, Math.min(1, prepared[i]))
    pcm[i] = value < 0 ? value * 0x8000 : value * 0x7fff
  }

  for (let i = 0; i < pcm.length; i += samplesPerFrame) {
    const chunk = pcm.subarray(i, Math.min(i + samplesPerFrame, pcm.length))
    const encoded = encoder.encodeBuffer(chunk)
    if (encoded.length > 0) mp3Data.push(Uint8Array.from(encoded))
  }

  const final = encoder.flush()
  if (final.length > 0) mp3Data.push(Uint8Array.from(final))

  return new Blob(mp3Data, { type: 'audio/mpeg' })
}

function processRecording(samples: Float32Array, sampleRate: number): { blob: Blob; durationMs: number } {
  const trimmed = trimSilence(samples, sampleRate)
  const normalized = normalizeVolume(trimmed)
  const blob = encodeMp3(normalized, sampleRate)
  return {
    blob,
    durationMs: Math.round(normalized.length / sampleRate * 1000),
  }
}

export function VoiceStudio({ section = 'arabic' }: { section?: 'arabic' | 'english' | 'numbers' | 'discover' | 'islamic' | 'skills' }) {
  const navigate = useNavigate()
  const parentDashboardPath = section === 'english' ? '/parent/english' : section === 'numbers' ? '/parent?section=numbers' : section === 'discover' ? '/parent?section=discover' : section === 'islamic' || section === 'skills' ? '/parent' : '/parent/arabic'
  const [items, setItems] = useState<VoiceRecordingItem[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [onlyMissing, setOnlyMissing] = useState(false)
  const [autoNext, setAutoNext] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [processedDurationMs, setProcessedDurationMs] = useState(0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedInputDeviceId, setSelectedInputDeviceId] = useState('')
  const [recordingMimeType, setRecordingMimeType] = useState('')

  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingMimeTypeRef = useRef('')
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const startedAtRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const loaded = (await loadVoiceItems()).filter((item) => item.meta?.section === section)
      setItems(loaded)
      setSelectedId((current) =>
        loaded.some((item) => item.id === current)
          ? current
          : loaded.find((item) => item.status === 'missing' || item.status === 'stale')?.id || loaded[0]?.id || '',
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل بيانات الاستوديو.')
    } finally {
      setLoading(false)
    }
  }, [section])

  useEffect(() => { void refresh() }, [refresh])

  const loadInputDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const inputs = devices.filter((device) => device.kind === 'audioinput')
      setInputDevices(inputs)

      // إذا كان المستخدم قد اختار جهازًا سابقًا نحافظ عليه.
      // وإلا نختار جهاز الإدخال الافتراضي الذي يقدمه المتصفح.
      setSelectedInputDeviceId((current) => {
        if (current && inputs.some((device) => device.deviceId === current)) return current
        return inputs.find((device) => device.deviceId === 'default')?.deviceId || inputs[0]?.deviceId || ''
      })
    } catch {
      // بعض المتصفحات لا تعرض أسماء الأجهزة قبل منح صلاحية الميكروفون.
    }
  }, [])

  useEffect(() => {
    void loadInputDevices()
    const handler = () => { void loadInputDevices() }
    navigator.mediaDevices?.addEventListener?.('devicechange', handler)
    return () => navigator.mediaDevices?.removeEventListener?.('devicechange', handler)
  }, [loadInputDevices])

  const releasePreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setPreviewBlob(null)
    setProcessedDurationMs(0)
  }, [previewUrl])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (audioContextRef.current) void audioContextRef.current.close()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((item) => {
      if (filter !== 'all' && item.group !== filter) return false
      if (onlyMissing && item.status !== 'missing' && item.status !== 'stale') return false
      if (!term) return true
      return item.text.includes(search.trim()) || item.filename.toLowerCase().includes(term)
    })
  }, [filter, items, onlyMissing, search])

  const current = items.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null
  const currentIndex = current ? filteredItems.findIndex((item) => item.id === current.id) : -1

  const selectedInputLabel = inputDevices.find((device) => device.deviceId === selectedInputDeviceId)?.label || ''

  const counts = useMemo(() => {
    const approved = items.filter((item) => item.status === 'approved').length
    const stale = items.filter((item) => item.status === 'stale').length
    return { total: items.length, approved, stale, missing: items.length - approved }
  }, [items])

  const groupCounts = useMemo(() => Array.from(new Set(items.map((item) => item.group))).map((key) => {
    const groupItems = items.filter((item) => item.group === key)
    const done = groupItems.filter((item) => item.status === 'approved').length
    return { key, label: groupLabels[key] ?? groupItems[0]?.groupLabel ?? key, total: groupItems.length, done }
  }), [items])

  const clearRecordingState = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      try { recorder.stop() } catch { /* already stopped */ }
    }
    mediaRecorderRef.current = null
    recordedChunksRef.current = []
    if (audioContextRef.current) void audioContextRef.current.close()
    audioContextRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const selectItem = (id: string) => {
    if (isRecording || saving || deleting) return
    setSelectedId(id)
    releasePreview()
    setMessage('')
    setError('')
  }

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return

    setIsRecording(false)
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    await new Promise<void>((resolve) => {
      const finish = () => resolve()
      recorder.addEventListener('stop', finish, { once: true })
      try { recorder.stop() } catch { resolve() }
    })

    mediaRecorderRef.current = null
    const rawBlob = new Blob(recordedChunksRef.current, { type: recordingMimeTypeRef.current || recordingMimeType || 'audio/webm' })
    recordedChunksRef.current = []
    const stream = streamRef.current
    stream?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    try {
      const context = audioContextRef.current ?? new AudioContext()
      if (context.state === 'suspended') await context.resume()
      const arrayBuffer = await rawBlob.arrayBuffer()
      const decoded = await context.decodeAudioData(arrayBuffer.slice(0))
      const input = decoded.getChannelData(0)
      const processed = processRecording(input, decoded.sampleRate)
      setPreviewBlob(processed.blob)
      setProcessedDurationMs(processed.durationMs)
      setPreviewUrl(URL.createObjectURL(processed.blob))
      setMessage('تمت المعالجة بنجاح: Trim Silence + Normalize Volume + MP3.')
      await context.close()
      audioContextRef.current = null
    } catch (e) {
      setError(e instanceof Error ? `تعذر معالجة التسجيل: ${e.message}` : 'تعذر معالجة التسجيل.')
      if (audioContextRef.current) void audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [recordingMimeType])

  const startRecording = async () => {
    if (!current || saving || deleting) return
    setError('')
    setMessage('')
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
    }
    releasePreview()

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('هذا المتصفح لا يدعم تسجيل الصوت من الصفحة.')
      }
      if (!window.MediaRecorder) {
        throw new Error('هذا المتصفح لا يدعم MediaRecorder.')
      }

      const audioConstraints: MediaTrackConstraints = {
        channelCount: { ideal: 1 },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
      }
      if (selectedInputDeviceId && selectedInputDeviceId !== 'default') {
        audioConstraints.deviceId = { exact: selectedInputDeviceId }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints })
      streamRef.current = stream

      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
      ]
      const mime = candidates.find((value) => MediaRecorder.isTypeSupported(value)) || ''
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      const actualMime = recorder.mimeType || mime || 'audio/webm'
      recordingMimeTypeRef.current = actualMime
      setRecordingMimeType(actualMime)
      recordedChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        setError('حدث خطأ أثناء التسجيل من الميكروفون.')
      }
      // تسجيل مقطع واحد متصل؛ تقسيم WebM إلى أجزاء كل 100ms قد ينتج
      // حاوية مجزأة تختلف طريقة فكها بين المتصفحات وتسبب نقرات/تكرارًا.
      recorder.start()
      mediaRecorderRef.current = recorder
      startedAtRef.current = Date.now()
      setElapsedMs(0)
      setIsRecording(true)

      timerRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current)
      }, 100)
    } catch (e) {
      clearRecordingState()
      setError(e instanceof Error ? e.message : 'تعذر تشغيل الميكروفون. تأكد من السماح بالوصول إلى الميكروفون.')
    }
  }

  const saveCurrent = async () => {
    if (!current || !previewBlob || saving || deleting) return
    setSaving(true)
    setError('')
    try {
      await saveVoiceRecording(current, previewBlob, processedDurationMs)
      setMessage(`تم حفظ MP3 مباشرة داخل المشروع: ${current.relativePath}`)
      releasePreview()
      await refresh()

      if (autoNext) {
        const next = filteredItems.slice(currentIndex + 1).find((item) => item.status === 'missing' || item.status === 'stale')
        if (next) window.setTimeout(() => selectItem(next.id), 150)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر حفظ التسجيل.')
    } finally {
      setSaving(false)
    }
  }

  const exportMp3 = () => {
    if (!previewBlob || !current) return
    const url = URL.createObjectURL(previewBlob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = current.filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 500)
    setMessage(`تم تصدير ${current.filename} إلى مجلد التنزيلات.`)
  }

  const deleteCurrent = async () => {
    if (!current || deleting || saving || isRecording) return
    if (current.status !== 'approved' && current.status !== 'recorded' && current.status !== 'stale') return

    const ok = window.confirm(`حذف التسجيل الصوتي لـ «${current.text}»؟\nلن يتم حذف الحرف/الكلمة من محتوى المشروع.`)
    if (!ok) return

    setDeleting(true)
    setError('')
    try {
      await deleteVoiceRecording(current.id)
      releasePreview()
      setMessage(`تم حذف التسجيل فقط. المحتوى «${current.text}» ما زال موجودًا.`)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر حذف التسجيل.')
    } finally {
      setDeleting(false)
    }
  }

  const nextItem = () => {
    if (!filteredItems.length || isRecording) return
    selectItem(filteredItems[(currentIndex + 1) % filteredItems.length].id)
  }

  const previousItem = () => {
    if (!filteredItems.length || isRecording) return
    const index = currentIndex <= 0 ? filteredItems.length - 1 : currentIndex - 1
    selectItem(filteredItems[index].id)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (event.code === 'Space') {
        event.preventDefault()
        if (isRecording) stopRecording()
        else if (previewBlob) void saveCurrent()
        else void startRecording()
      } else if (event.key === 'Enter' && previewBlob) {
        event.preventDefault()
        void saveCurrent()
      } else if (event.key.toLowerCase() === 'r' && previewBlob) {
        event.preventDefault()
        releasePreview()
      } else if (event.key === 'ArrowRight' && !isRecording) {
        nextItem()
      } else if (event.key === 'ArrowLeft' && !isRecording) {
        previousItem()
      } else if (event.key.toLowerCase() === 'p' && previewUrl) {
        void document.querySelector<HTMLAudioElement>('#voice-preview')?.play()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">جارٍ تجهيز استوديو التسجيل…</div>
  }

  const statusLabel = current?.status === 'approved'
    ? 'مسجل ومعتمد'
    : current?.status === 'stale'
      ? 'التسجيل القديم غير صالح'
      : current?.status === 'recorded'
        ? 'ملف صوتي موجود'
        : 'غير مسجل'

  return (
    <div dir="rtl" className="min-h-screen px-4 py-6 md:px-8 bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-sm font-bold text-[var(--color-sky)]">منطقة الإدارة • غير ظاهرة للطفل</p>
            <h1 className="font-display text-3xl font-extrabold mt-1">🎙️ {section === 'english' ? 'English Voice Studio' : section === 'numbers' ? 'استوديو الأرقام' : section === 'discover' ? 'استوديو اكتشف ما حولك' : section === 'islamic' ? 'استوديو أخلاقي الجميلة' : section === 'skills' ? 'استوديو مدينة المهارات' : 'استوديو التسجيل الصوتي'}</h1>
            <p className="text-[var(--color-ink-soft)] mt-1">
              التسجيل من محتوى المشروع نفسه • MP3 • Trim Silence • Normalize Volume • حفظ مباشر
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate(parentDashboardPath)}>العودة للوحة ولي الأمر</Button>
        </header>

        {error && <Card className="mb-4 p-4 border-2 border-[var(--color-coral)]/30 bg-[var(--color-coral)]/5">
          <p className="font-bold text-[var(--color-coral)]">{error}</p>
        </Card>}
        {message && <Card className="mb-4 p-4 border-2 border-[var(--color-sky)]/20">
          <p className="font-bold text-[var(--color-sky)]">{message}</p>
        </Card>}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Stat title="كل العناصر" value={counts.total} />
          <Stat title="تسجيلات معتمدة" value={counts.approved} />
          <Stat title="تحتاج تسجيل/تحديث" value={counts.missing} />
          <Stat title="نسبة الإنجاز" value={`${counts.total ? Math.round((counts.approved / counts.total) * 100) : 0}%`} />
        </section>

        {counts.stale > 0 && (
          <Card className="mb-5 p-4 border-2 border-amber-300 bg-amber-50">
            <p className="font-bold text-amber-900">
              ⚠️ يوجد {counts.stale} تسجيل قديم لأن محتوى بعض العناصر تغيّر. سجّلها من جديد أو احذف التسجيل القديم.
            </p>
          </Card>
        )}

        <section className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
          <aside className="space-y-4">
            <Card className="p-4">
              <h2 className="font-extrabold mb-3">الأقسام</h2>
              <button onClick={() => setFilter('all')} className={`w-full text-right rounded-xl px-3 py-2 mb-1 ${filter === 'all' ? 'bg-[var(--color-sky)]/10 font-extrabold' : ''}`}>
                الكل <span className="float-left">{items.length}</span>
              </button>
              {groupCounts.map((group) => (
                <button key={group.key} onClick={() => setFilter(group.key as Filter)} className={`w-full text-right rounded-xl px-3 py-2 mb-1 ${filter === group.key ? 'bg-[var(--color-sky)]/10 font-extrabold' : ''}`}>
                  {group.label}<span className="float-left text-xs">{group.done}/{group.total}</span>
                </button>
              ))}
              <label className="flex items-center gap-2 mt-3 pt-3 border-t border-black/10 cursor-pointer">
                <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
                <span>عرض غير المسجل / القديم</span>
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} />
                <span>الانتقال للتالي بعد الحفظ</span>
              </label>
            </Card>

            <Card className="p-4">
              <h2 className="font-extrabold mb-3">تقدم الأقسام</h2>
              <div className="space-y-3">
                {groupCounts.map((group) => (
                  <div key={group.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{group.label}</span><span>{group.total ? Math.round((group.done / group.total) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--color-sky)]" style={{ width: `${group.total ? (group.done / group.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>

          <main className="min-w-0">
            <Card className="p-4 mb-4">
              <div className="flex flex-wrap gap-3 items-center">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث في الكلمات أو الجمل…" className="flex-1 min-w-[220px] rounded-xl border border-black/10 px-4 py-3 bg-white outline-none focus:border-[var(--color-sky)]" />
                <span className="text-sm text-[var(--color-ink-soft)]">{filteredItems.length} عنصر</span>
                <Button variant="ghost" onClick={() => void refresh()}>🔄 تحديث المحتوى</Button>
              </div>
            </Card>

            <div className="grid xl:grid-cols-[minmax(0,1fr)_330px] gap-4">
              <Card className="p-5 md:p-8">
                {current ? (
                  <>
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div>
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-[var(--color-sky)]/10 text-[var(--color-sky)]">{current.groupLabel}</span>
                        <p className="text-xs text-[var(--color-ink-soft)] mt-2">{current.filename}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        current.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        current.status === 'stale' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>{statusLabel}</span>
                    </div>

                    <div className="min-h-[230px] flex flex-col items-center justify-center text-center">
                      <p className="text-xs text-[var(--color-ink-soft)] mb-3">النص المطلوب تسجيله</p>
                      <div className="text-5xl md:text-7xl font-display font-extrabold leading-relaxed max-w-4xl">{current.text}</div>
                      {current.meta?.title && <p className="mt-4 text-sm text-[var(--color-ink-soft)]">{String(current.meta.title)}</p>}
                      {isRecording && (
                        <div className="mt-5 flex items-center gap-2 text-[var(--color-coral)] font-extrabold">
                          <span className="w-3 h-3 rounded-full bg-[var(--color-coral)] animate-pulse" />
                          جاري التسجيل • {formatTime(elapsedMs)}
                        </div>
                      )}
                    </div>

                    {current.status === 'approved' && !previewUrl && (
                      <div className="mb-5 p-4 rounded-2xl bg-emerald-50/60">
                        <p className="text-sm font-bold mb-2">التسجيل المحفوظ حاليًا</p>
                        <audio controls src={current.relativePath} className="w-full" />
                        <p className="text-xs text-[var(--color-ink-soft)] mt-2">MP3 • Mono • 24kHz • 64kbps</p>
                      </div>
                    )}

                    {current.status === 'stale' && !previewUrl && (
                      <div className="mb-5 p-4 rounded-2xl bg-amber-50">
                        <p className="font-bold text-amber-900">هذا العنصر تغيّر بعد تسجيله. أعد التسجيل حتى يتطابق الصوت مع المحتوى الحالي.</p>
                      </div>
                    )}

                    {previewUrl && (
                      <div className="mb-5 p-4 rounded-2xl bg-black/[0.03]">
                        <p className="text-sm font-bold mb-2">معاينة النسخة المعالجة</p>
                        <audio ref={previewAudioRef} id="voice-preview" controls src={previewUrl} className="w-full" />
                        <div className="text-xs text-[var(--color-ink-soft)] mt-2 flex flex-wrap gap-3">
                          <span>المدة الأصلية: {formatTime(elapsedMs)}</span>
                          <span>بعد Trim: {formatTime(processedDurationMs)}</span>
                          <span>Normalize: -1 dBFS</span>
                          <span>MP3: 24kHz / 64kbps / Mono</span>
                          <span>الحجم: {(previewBlob ? previewBlob.size / 1024 : 0).toFixed(1)} KB</span>
                        </div>
                      </div>
                    )}

                    <div className="mb-5 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                      <label className="mb-2 block text-sm font-extrabold">الميكروفون المستخدم للتسجيل</label>
                      <select
                        value={selectedInputDeviceId}
                        onChange={(event) => setSelectedInputDeviceId(event.target.value)}
                        disabled={isRecording || saving || deleting}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-sky)]"
                      >
                        <option value="">اختيار تلقائي — جهاز الإدخال الافتراضي</option>
                        {inputDevices.map((device, index) => (
                          <option key={device.deviceId || `input-${index}`} value={device.deviceId}>
                            {device.label || `ميكروفون ${index + 1}`}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
                        {selectedInputLabel
                          ? `الجهاز المحدد: ${selectedInputLabel}`
                          : 'بعد السماح بالميكروفون ستظهر أسماء الأجهزة، ومنها Jabra Link 380 إذا كان متاحًا.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                      <Button variant="ghost" disabled={isRecording || saving || deleting} onClick={previousItem}>السابق ←</Button>

                      {!isRecording && !previewBlob && (
                        <Button disabled={saving || deleting} onClick={() => void startRecording()}>🔴 بدء التسجيل</Button>
                      )}
                      {isRecording && <Button onClick={stopRecording}>⏹️ إيقاف ومعالجة</Button>}

                      {!isRecording && previewBlob && (
                        <>
                          <Button variant="ghost" disabled={saving} onClick={releasePreview}>🔄 إعادة التسجيل</Button>
                          <Button variant="ghost" disabled={saving} onClick={exportMp3}>⬇️ Export MP3</Button>
                          <Button disabled={saving} onClick={() => void saveCurrent()}>{saving ? 'جاري الحفظ…' : '✅ اعتماد وحفظ MP3'}</Button>
                        </>
                      )}

                      {!isRecording && !previewBlob && (current.status === 'approved' || current.status === 'recorded' || current.status === 'stale') && (
                        <Button variant="ghost" disabled={saving || deleting} onClick={() => void deleteCurrent()}>
                          {deleting ? 'جاري الحذف…' : '🗑️ حذف التسجيل'}
                        </Button>
                      )}

                      <Button variant="ghost" disabled={isRecording || saving || deleting} onClick={nextItem}>التالي →</Button>
                    </div>

                    <div className="mt-5 text-center text-xs text-[var(--color-ink-soft)]">
                      Space تسجيل/إيقاف/اعتماد • Enter اعتماد • R إعادة • P معاينة • ← → تنقل
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-xl font-extrabold">لا توجد عناصر تطابق الفلتر.</p>
                    <Button variant="ghost" className="mt-4" onClick={() => { setFilter('all'); setOnlyMissing(false); setSearch('') }}>إظهار الكل</Button>
                  </div>
                )}
              </Card>

              <Card className="p-3 max-h-[720px] overflow-auto">
                <div className="sticky top-0 bg-[var(--color-cream)]/95 backdrop-blur z-10 p-2 mb-2 rounded-xl">
                  <h2 className="font-extrabold">قائمة التسجيل</h2>
                  <p className="text-xs text-[var(--color-ink-soft)]">المحتوى يُقرأ تلقائيًا من ملفات المشروع</p>
                </div>
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <button key={item.id} onClick={() => selectItem(item.id)} className={`w-full text-right rounded-xl p-3 transition ${item.id === current?.id ? 'bg-[var(--color-sky)]/10 ring-1 ring-[var(--color-sky)]/20' : 'hover:bg-black/[0.03]'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.status === 'approved' ? 'bg-emerald-500' : item.status === 'stale' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                        <span className="font-bold truncate">{item.text}</span>
                      </div>
                      <div className="text-[10px] text-[var(--color-ink-soft)] mt-1 truncate">{item.filename}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </main>
        </section>
      </div>
    </div>
  )
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-[var(--color-ink-soft)]">{title}</p>
      <p className="text-2xl font-display font-extrabold mt-1">{value}</p>
    </Card>
  )
}
