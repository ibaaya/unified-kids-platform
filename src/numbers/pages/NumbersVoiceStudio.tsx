/**
 * NumbersVoiceStudio — استوديو تسجيل الأصوات لمغامرة الأرقام
 * يكتشف تلقائياً جميع الجمل الصوتية التي تحتاج تسجيلاً مخصصاً،
 * ويتيح تسجيلها وحفظها محلياً. بعد الحفظ تستخدمها speak() تلقائياً
 * قبل الرجوع لـ Web Speech API.
 *
 * التخزين: localStorage بمفتاح "adad-audio-v1"
 * كل تسجيل محفوظ كـ base64 dataURL.
 */
import { useRef, useState } from "react";
import { NAMES } from "../lib/arabic";

// ——— قاعدة بيانات الجمل المطلوب تسجيلها ———
type AudioItem = { id: string; category: string; text: string };

function buildAudioList(): AudioItem[] {
  const items: AudioItem[] = [];

  // أسماء الأرقام 1–20
  for (let n = 1; n <= 20; n++) {
    items.push({ id: `num_${n}`, category: "أسماء الأرقام", text: NAMES[n] });
  }

  // أسئلة التعرف
  items.push({ id: "q_recognize", category: "أسئلة التعرف", text: "مَا هَذَا الرَّقْمُ؟" });
  items.push({ id: "q_count", category: "أسئلة العد", text: "كَمْ عَدَدُ الْأَشْيَاءِ؟" });
  items.push({ id: "q_compare", category: "أسئلة المقارنة", text: "مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟" });
  items.push({ id: "q_bigger", category: "أسئلة المقارنة", text: "أَيُّ الْعَدَدَيْنِ أَكْبَرُ؟" });
  items.push({ id: "q_missing", category: "أسئلة المتسلسل", text: "أَيُّ رَقْمٍ نَاقِص؟" });

  // أسئلة الاستماع: "أَيْنَ الرَّقْمُ X؟"
  for (let n = 1; n <= 20; n++) {
    items.push({ id: `hear_${n}`, category: "استمع واختر", text: `أَيْنَ الرَّقْمُ ${NAMES[n]}؟` });
  }

  // أسئلة قبل/بعد
  for (let n = 2; n <= 19; n++) {
    items.push({ id: `before_${n}`, category: "قبل وبعد", text: `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${NAMES[n]}؟` });
    items.push({ id: `after_${n}`, category: "قبل وبعد", text: `مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${NAMES[n]}؟` });
  }

  // جمل التشجيع
  items.push({ id: "cheer_correct", category: "تشجيع", text: "أَحْسَنْتَ" });
  items.push({ id: "cheer_try", category: "تشجيع", text: "حاول مرة أخرى" });
  items.push({ id: "welcome", category: "تشجيع", text: "مَرْحَبًا بِكَ فِي مُغَامَرَةِ الْأَرْقَامِ! هَلْ أَنْتَ مُسْتَعِدٌّ؟" });

  return items;
}

const AUDIO_KEY = "adad-audio-v1";

function loadAudioMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(AUDIO_KEY) || "{}"); } catch { return {}; }
}
function saveAudioMap(map: Record<string, string>) {
  localStorage.setItem(AUDIO_KEY, JSON.stringify(map));
}

// دالة speak() المحسَّنة تستخدم التسجيل المخصص أولاً
export function speakWithCustomAudio(text: string, on = true, audioId?: string) {
  if (!on) return;
  const map = loadAudioMap();
  const id = audioId ?? Object.keys(map).find((k) => {
    // بحث بالنص المطابق
    const list = buildAudioList();
    return list.find((item) => item.id === k)?.text === text;
  });
  if (id && map[id]) {
    const audio = new Audio(map[id]);
    audio.play().catch(() => fallbackSpeak(text));
    return;
  }
  fallbackSpeak(text);
}

function fallbackSpeak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-SA"; u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

// ——— المكوّن الرئيسي ———
export default function NumbersVoiceStudio() {
  const allItems = buildAudioList();
  const [audioMap, setAudioMap] = useState<Record<string, string>>(loadAudioMap);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [filter, setFilter] = useState<string>("الكل");
  const [search, setSearch] = useState("");

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const categories = ["الكل", ...Array.from(new Set(allItems.map((i) => i.category)))];

  const filtered = allItems.filter((item) => {
    const matchCat = filter === "الكل" || item.category === filter;
    const matchSearch = !search || item.text.includes(search);
    return matchCat && matchSearch;
  });

  const recorded = Object.keys(audioMap).length;

  // بدء التسجيل
  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false, channelCount: 1 },
      });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: mr.mimeType });
        setBlob(b);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setIsRecording(true);
      setBlob(null);
    } catch {
      alert("لم نتمكن من الوصول للميكروفون. تأكد من منح الإذن.");
    }
  }

  function stopRec() {
    mediaRef.current?.stop();
    setIsRecording(false);
  }

  // تشغيل المعاينة
  function playBlob() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    new Audio(url).play();
  }

  // اعتماد وحفظ
  function approveRec() {
    if (!blob || !activeId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newMap = { ...audioMap, [activeId]: dataUrl };
      setAudioMap(newMap);
      saveAudioMap(newMap);
      setBlob(null);
      // انتقل للعنصر التالي تلقائياً
      const idx = filtered.findIndex((i) => i.id === activeId);
      if (idx < filtered.length - 1) setActiveId(filtered[idx + 1].id);
    };
    reader.readAsDataURL(blob);
  }

  // حذف تسجيل
  function deleteRec(id: string) {
    const newMap = { ...audioMap };
    delete newMap[id];
    setAudioMap(newMap);
    saveAudioMap(newMap);
  }

  // تشغيل التسجيل الموجود
  function playExisting(id: string) {
    const url = audioMap[id];
    if (!url) return;
    new Audio(url).play();
  }

  // تشغيل Web Speech API
  function previewTTS(text: string) {
    fallbackSpeak(text);
  }

  const activeItem = allItems.find((i) => i.id === activeId);

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e3a8a)" }}>
      {/* ترويسة */}
      <header className="sticky top-0 z-20 px-4 py-3 backdrop-blur-sm" style={{ background: "rgba(30,27,75,0.85)" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <h1 className="text-lg font-extrabold text-white">🎙️ استوديو الأرقام</h1>
          <div className="flex items-center gap-2 text-sm text-indigo-200">
            <span className="rounded-xl bg-white/10 px-3 py-1 font-bold">
              {recorded} / {allItems.length} مُسجَّل
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">

        {/* ——— قسم التسجيل ——— */}
        {activeItem && (
          <div className="rounded-3xl border-2 border-white/20 p-5 shadow-xl" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
            <h2 className="mb-2 text-sm font-bold text-indigo-200">قيد التسجيل</h2>
            <p className="mb-4 text-center text-2xl font-extrabold text-white leading-relaxed">{activeItem.text}</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* TTS معاينة */}
              <button
                type="button"
                onClick={() => previewTTS(activeItem.text)}
                className="rounded-2xl bg-sky-500/80 px-4 py-2 text-sm font-bold text-white transition hover:scale-105"
              >
                🔊 استمع للنطق الآلي
              </button>

              {/* تسجيل */}
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRec}
                  className="rounded-2xl bg-red-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:scale-105"
                >
                  ⏺ ابدأ التسجيل
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRec}
                  className="animate-pulse rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg"
                >
                  ⏹ إيقاف التسجيل
                </button>
              )}

              {/* معاينة + اعتماد */}
              {blob && (
                <>
                  <button
                    type="button"
                    onClick={playBlob}
                    className="rounded-2xl bg-emerald-500/80 px-4 py-2 text-sm font-bold text-white transition hover:scale-105"
                  >
                    ▶ معاينة التسجيل
                  </button>
                  <button
                    type="button"
                    onClick={approveRec}
                    className="rounded-2xl bg-violet-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:scale-105"
                  >
                    ✅ اعتماد وحفظ
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ——— فلاتر وبحث ——— */}
        <div className="rounded-2xl border border-white/10 p-3" style={{ background: "rgba(255,255,255,0.07)" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ابحث عن نص..."
            className="mb-3 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-violet-400"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                  filter === cat
                    ? "bg-violet-500 text-white"
                    : "bg-white/10 text-indigo-200 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ——— قائمة العناصر ——— */}
        <div className="space-y-2">
          {filtered.map((item) => {
            const hasRec = !!audioMap[item.id];
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                  isActive
                    ? "border-violet-400 bg-violet-500/20"
                    : hasRec
                    ? "border-emerald-400/40 bg-emerald-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {/* حالة التسجيل */}
                <span className="text-lg flex-shrink-0">
                  {hasRec ? "✅" : "⬜"}
                </span>

                {/* النص */}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold leading-relaxed ${isActive ? "text-white" : "text-indigo-100"}`}>
                    {item.text}
                  </p>
                  <p className="text-xs text-indigo-300">{item.category}</p>
                </div>

                {/* أزرار */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {hasRec && (
                    <>
                      <button
                        type="button"
                        onClick={() => playExisting(item.id)}
                        className="rounded-xl bg-emerald-500/30 p-2 text-sm text-emerald-300 transition hover:bg-emerald-500/50"
                        title="تشغيل التسجيل"
                      >
                        ▶
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRec(item.id)}
                        className="rounded-xl bg-red-500/20 p-2 text-sm text-red-300 transition hover:bg-red-500/40"
                        title="حذف التسجيل"
                      >
                        🗑
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => { setActiveId(item.id); setBlob(null); }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition hover:scale-105 ${
                      isActive
                        ? "bg-violet-500 text-white"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    {hasRec ? "إعادة التسجيل" : "سجّل"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ——— تعليمات ——— */}
        <div className="rounded-2xl border border-white/10 p-4 text-sm text-indigo-200" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="mb-2 font-bold text-white">📋 كيفية الاستخدام:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>اضغط على <strong className="text-white">"سجّل"</strong> بجانب أي نص لاختياره</li>
            <li>اضغط <strong className="text-white">"ابدأ التسجيل"</strong> وانطق النص بوضوح</li>
            <li>اضغط <strong className="text-white">"إيقاف التسجيل"</strong> ثم استمع للمعاينة</li>
            <li>اضغط <strong className="text-white">"اعتماد وحفظ"</strong> ليُستخدم التسجيل تلقائياً في التطبيق</li>
          </ol>
          <p className="mt-2 text-xs text-indigo-300">
            💡 التسجيلات محفوظة في المتصفح (localStorage) وتُستخدم تلقائياً بدلاً من صوت المتصفح.
          </p>
        </div>
      </div>
    </div>
  );
}
