// أسماء الأرقام والأرقام الشرقية والنطق (Web Speech API + Custom Audio)
import { playRecordedAudioText, stopRecordedAudio } from '../../engine/recordedAudioManager'
import { normalizeAnswerFeedback } from '../../utils/feedbackPrompts'
export const NAMES = ["", "وَاحِد", "اثْنَان", "ثَلَاثَة", "أَرْبَعَة", "خَمْسَة", "سِتَّة", "سَبْعَة", "ثَمَانِيَة", "تِسْعَة", "عَشَرَة", "أَحَدَ عَشَر", "اثْنَا عَشَر", "ثَلَاثَةَ عَشَر", "أَرْبَعَةَ عَشَر", "خَمْسَةَ عَشَر", "سِتَّةَ عَشَر", "سَبْعَةَ عَشَر", "ثَمَانِيَةَ عَشَر", "تِسْعَةَ عَشَر", "عِشْرُون"];
export const toEastern = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
let EAST = true; export const setDigits = (e: boolean) => { EAST = e; };
export const loc = (s: string) => (EAST ? s.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]) : s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))));
export const fmt = (n: number, eastern: boolean = EAST) => (eastern ? toEastern(n) : String(n));

const AUDIO_KEY = "adad-audio-v1";

function loadAudioMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(AUDIO_KEY) || "{}"); } catch { return {}; }
}

// قاموس النص → معرّف الصوت (مبسَّط للبحث السريع)
function findAudioId(text: string): string | null {
  const map = loadAudioMap();
  const STATIC: Record<string, string> = {
    "مَا هَذَا الرَّقْمُ؟": "q_recognize",
    "كَمْ عَدَدُ الْأَشْيَاءِ؟": "q_count",
    "مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟": "q_compare",
    "أَيُّ الْعَدَدَيْنِ أَكْبَرُ؟": "q_bigger",
    "أَيُّ رَقْمٍ نَاقِص؟": "q_missing",
    "أَحْسَنْتَ": "cheer_correct",
    "حاول مرة أخرى": "cheer_try",
    "مَرْحَبًا بِكَ فِي مُغَامَرَةِ الْأَرْقَامِ! هَلْ أَنْتَ مُسْتَعِدٌّ؟": "welcome",
  };
  NAMES.forEach((name, n) => { if (name) STATIC[name] = `num_${n}`; });
  NAMES.forEach((name, n) => { if (name) STATIC[`أَيْنَ الرَّقْمُ ${name}؟`] = `hear_${n}`; });
  NAMES.forEach((name, n) => {
    if (name) {
      STATIC[`مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${name}؟`] = `before_${n}`;
      STATIC[`مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${name}؟`] = `after_${n}`;
    }
  });
  const id = STATIC[text];
  if (id && map[id]) return id;
  return null;
}

// ——— متتبع الصوت الحالي ———
let currentAudio: HTMLAudioElement | null = null;
let speechRequestId = 0;

/**
 * إيقاف أي صوت قيد التشغيل (سواء مسجّل مخصص أو نطق آلي).
 * تُستدعى تلقائياً في بداية `speak` لمنع التداخل.
 */
export function stopSpeaking() {
  speechRequestId += 1;
  stopRecordedAudio();
  // أوقف الصوت المسجّل إن وُجد
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch { /* ignore */ }
    currentAudio = null;
  }
  // أوقف النطق الآلي
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function speak(text: string, on = true) {
  if (!on || typeof window === "undefined") return;
  const speechText = normalizeAnswerFeedback(text);

  // 1) أوقف أي صوت جارٍ أولاً (يمنع التداخل بين سؤال وآخر أو تشجيع وسؤال)
  stopSpeaking();
  const requestId = speechRequestId;

  // النصوص المركبة تستخدم العبارات الثابتة المسجلة، ويُنطق الجزء المتغير آليًا.
  const numberOnly = NAMES.some((name) => name && name === speechText);
  if (playRecordedAudioText(
    speechText,
    undefined,
    () => fallbackSpeak(speechText, undefined, requestId),
    (missing, done) => fallbackSpeak(missing, done, requestId),
    { composeNumbers: !numberOnly },
  )) return;

  // 2) جرّب التسجيل المخصص
  const map = loadAudioMap();
  const id = findAudioId(speechText);
  if (id && map[id]) {
    try {
      const audio = new Audio(map[id]);
      currentAudio = audio;
      audio.addEventListener("ended", () => {
        if (currentAudio === audio) currentAudio = null;
      });
      audio.play().catch(() => {
        if (requestId === speechRequestId) fallbackSpeak(speechText, undefined, requestId);
      });
      return;
    } catch { /* fallback below */ }
  }

  // 3) احتياطي: النطق الآلي
  fallbackSpeak(speechText, undefined, requestId);
}

function fallbackSpeak(text: string, onEnd?: () => void, requestId = speechRequestId) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.onend = () => { if (requestId === speechRequestId) onEnd?.(); };
  u.onerror = () => { if (requestId === speechRequestId) onEnd?.(); };
  u.lang = "ar-SA"; u.rate = 0.8;
  window.speechSynthesis.speak(u);
}
