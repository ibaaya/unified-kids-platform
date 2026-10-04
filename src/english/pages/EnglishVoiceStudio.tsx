import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import lettersData from '../data/letters.json'
import wordsData from '../data/words.json'
import sentencesData from '../data/sentences.json'

type RecordingItem = {
  id: string; group: 'letters'|'words'|'sentences'|'stories'
  label: string; hint: string
}

const letters = lettersData as Array<{ id: string; name: string; uppercase: string; imageEmoji: string }>
const words = wordsData as Array<{ id: string; text: string; imageEmoji: string }>
const sentences = sentencesData as Array<{ id: string; text: string; imageEmoji: string }>

function buildItems(): RecordingItem[] {
  const items: RecordingItem[] = []
  for (const l of letters) {
    items.push({ id: l.id, group: 'letters', label: `Letter ${l.uppercase} (${l.name})`, hint: `Say: "${l.name}" ${l.imageEmoji}` })
  }
  for (const w of words.slice(0, 40)) {
    items.push({ id: w.id, group: 'words', label: w.text, hint: `Say the word: "${w.text}" ${w.imageEmoji}` })
  }
  for (const s of sentences) {
    items.push({ id: s.id, group: 'sentences', label: s.text.slice(0, 30) + '…', hint: `Read: "${s.text}"` })
  }
  return items
}

const ALL_ITEMS = buildItems()

type Filter = 'all' | RecordingItem['group']

const GROUP_LABELS: Record<string, string> = {
  letters: 'Letters',
  words: 'Words',
  sentences: 'Sentences',
  stories: 'Stories',
}

export function EnglishVoiceStudio() {
  const [filter, setFilter] = useState<Filter>('all')
  const [recording, setRecording] = useState<string | null>(null)
  const [recorded, setRecorded] = useState<Record<string, string>>({}) // id → objectURL
  const [playing, setPlaying] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const displayed = filter === 'all' ? ALL_ITEMS : ALL_ITEMS.filter((i) => i.group === filter)

  const startRecording = useCallback(async (id: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecorded((r) => ({ ...r, [id]: url }))
        stream.getTracks().forEach((t) => t.stop())
        setRecording(null)
      }
      mr.start()
      mediaRef.current = mr
      setRecording(id)
    } catch {
      alert('Could not access microphone. Please allow microphone access.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
  }, [])

  const playRecording = (id: string) => {
    const url = recorded[id]
    if (!url) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const audio = new Audio(url)
    audio.onended = () => setPlaying(null)
    audio.play()
    audioRef.current = audio
    setPlaying(id)
  }

  const deleteRecording = (id: string) => {
    setRecorded((r) => { const n = { ...r }; delete n[id]; return n })
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fff0f6 100%)' }} dir="ltr">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 rounded-3xl bg-white/85 p-4 text-center shadow-xl border-2" style={{ borderColor: 'rgba(79,128,226,0.3)' }}>
          <h1 className="text-3xl font-extrabold" style={{ color: '#1e3a8a' }}>🎙️ English Voice Studio</h1>
          <p className="mt-1 text-sm text-gray-500">Record your voice to replace browser speech</p>
          <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
            💡 In development mode, recordings are saved in memory. Export them to <code>public/audio/english/</code>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', 'letters', 'words', 'sentences'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="rounded-2xl px-4 py-2 text-sm font-bold transition-all"
              style={{
                background: filter === f ? '#4f80e2' : 'rgba(255,255,255,0.8)',
                color: filter === f ? 'white' : '#374151',
              }}>
              {f === 'all' ? `All (${ALL_ITEMS.length})` : `${GROUP_LABELS[f]} (${ALL_ITEMS.filter((i) => i.group === f).length})`}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-4 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold" style={{ color: '#374151' }}>
          ✅ Recorded: {Object.keys(recorded).length} / {ALL_ITEMS.length}
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {displayed.map((item) => {
            const hasRecording = !!recorded[item.id]
            const isRecordingNow = recording === item.id
            const isPlayingNow = playing === item.id

            return (
              <div key={item.id}
                className="flex items-center gap-3 rounded-2xl border-2 bg-white/85 px-3 py-2 shadow-sm"
                style={{ borderColor: hasRecording ? 'rgba(47,182,140,0.4)' : 'rgba(79,128,226,0.15)' }}>
                {/* Group badge */}
                <span className="rounded-xl px-2 py-0.5 text-xs font-bold"
                  style={{ background: item.group === 'letters' ? '#e8f0fe' : item.group === 'words' ? '#e8fef0' : '#fef0f8',
                    color: item.group === 'letters' ? '#1e3a8a' : item.group === 'words' ? '#065f46' : '#881337' }}>
                  {GROUP_LABELS[item.group]}
                </span>

                {/* Label */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-800">{item.label}</p>
                  <p className="truncate text-xs text-gray-400">{item.hint}</p>
                </div>

                {/* Controls */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  {hasRecording && (
                    <>
                      <button onClick={() => playRecording(item.id)}
                        className="rounded-xl px-2 py-1 text-xs font-bold text-white shadow"
                        style={{ background: isPlayingNow ? '#8b5fbf' : '#2fb68c' }}>
                        {isPlayingNow ? '⏸' : '▶ Play'}
                      </button>
                      <button onClick={() => deleteRecording(item.id)}
                        className="rounded-xl px-2 py-1 text-xs font-bold text-red-500 shadow border border-red-200">
                        🗑
                      </button>
                    </>
                  )}
                  {isRecordingNow ? (
                    <button onClick={stopRecording}
                      className="animate-pulse rounded-xl px-3 py-1.5 text-sm font-bold text-white shadow"
                      style={{ background: '#ef4444' }}>
                      ⏹ Stop
                    </button>
                  ) : (
                    <button onClick={() => startRecording(item.id)}
                      className="rounded-xl px-3 py-1.5 text-sm font-bold text-white shadow transition hover:scale-105"
                      style={{ background: hasRecording ? '#ff9f45' : '#4f80e2' }}>
                      {hasRecording ? '🔄 Re-record' : '🎙 Record'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/parent"
            className="inline-flex items-center gap-2 rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
            style={{ borderColor: '#4f80e2', color: '#1e3a8a' }}>
            ← Parent Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
