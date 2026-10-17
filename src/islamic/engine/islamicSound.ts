// =====================================================
// محرك الصوت - أخلاقي الجميلة
// نطق آلي عبر Web Speech (ar-SA) مع تنظيف النص من الإيموجي والرموز.
// لاستبداله بمحرك الصوت المشترك في المنصة عدّل الدالة speakArabic فقط.
// =====================================================

import { playRecordedAudioText, stopRecordedAudio } from '../../engine/recordedAudioManager';
import { normalizeAnswerFeedback, SUCCESS_FEEDBACK, RETRY_FEEDBACK } from '../../utils/feedbackPrompts';

const SOUND_KEY = 'islamic-sound-enabled';

const readEnabled = (): boolean => {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
};

let soundEnabled = readEnabled();
let token = 0;

const supported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** إزالة الإيموجي والرموز والأسهم قبل النطق */
export const stripForSpeech = (text: string): string =>
  text
    // ✅ احذف أي رمز ليس حرفاً عربياً أو لاتينياً أو رقماً أو ترقيماً عربياً
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s.,،؛:؟!()\-]/gu, '')
    // حذف variation selectors و ZWJ
    .replace(/[\uFE0F\uFE0E\u200D\u200C\u200B]/g, '')
    // تنظيف المسافات
    .replace(/\s+/g, ' ')
    .trim();
export const isSoundEnabled = (): boolean => soundEnabled;

export const setSoundEnabled = (value: boolean): void => {
  soundEnabled = value;
  try {
    localStorage.setItem(SOUND_KEY, value ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (!value) stopSpeech();
};

export const stopSpeech = (): void => {
  token += 1;
  stopRecordedAudio();
  if (supported()) window.speechSynthesis.cancel();
};

let arabicVoice: SpeechSynthesisVoice | null = null;
const pickVoice = (): SpeechSynthesisVoice | null => {
  if (!supported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang.toLowerCase().startsWith('ar')) ?? null;
};
if (supported()) {
  arabicVoice = pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    arabicVoice = pickVoice();
  });
}

interface SpeakOptions {
  /** يُنفَّذ عند انتهاء النطق طبيعياً */
  onEnd?: () => void;
  /** يُنفَّذ عند مقاطعة النطق أو فشله */
  onStop?: () => void;
  /** النطق حتى لو كان الصوت مكتوماً (عند الضغط على زر الاستماع) */
  force?: boolean;
}

export const speakArabic = (text: string, options: SpeakOptions = {}): void => {
  const { onEnd, onStop, force = false } = options;
  if (!soundEnabled && !force) {
    onStop?.();
    return;
  }
  const speechText = normalizeAnswerFeedback(text);
  const clean = stripForSpeech(speechText);
  if (!clean) {
    onStop?.();
    return;
  }

  token += 1;
  const mine = token;
  const speakWithSynthesis = () => {
    if (mine !== token) return;
    stopRecordedAudio();
    if (!supported()) { onStop?.(); return; }
    window.speechSynthesis.cancel();
    window.setTimeout(() => {
      if (mine !== token) { onStop?.(); return; }
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = 'ar-SA';
      utter.rate = 0.85;
      utter.pitch = 1.05;
      if (arabicVoice) utter.voice = arabicVoice;
      utter.onend = () => { if (mine === token) onEnd?.(); else onStop?.(); };
      utter.onerror = () => onStop?.();
      window.speechSynthesis.speak(utter);
    }, 60);
  };
  if (playRecordedAudioText(speechText, onEnd, speakWithSynthesis)) {
    if (supported()) window.speechSynthesis.cancel();
    return;
  }
  speakWithSynthesis();
};

/** نطق قائمة نصوص بالتتابع؛ تتوقف السلسلة إن بدأ نطقٌ آخر */
export const speakSequence = (texts: string[], gapMs = 250): void => {
  const queue = texts.filter(Boolean);
  const run = (i: number) => {
    if (i >= queue.length) return;
    speakArabic(queue[i], { onEnd: () => window.setTimeout(() => run(i + 1), gapMs) });
  };
  run(0);
};

// ─── عبارات التشجيع (بدون عقوبات أو كلمات سلبية) ───

const ENCOURAGEMENTS = [...SUCCESS_FEEDBACK]
const TRY_AGAIN = [...RETRY_FEEDBACK]
const GENTLE_MISS = [
  'لا بَأس! تَعَلَّمنا شَيئاً جَديداً.',
  'هَيّا نَتَعَلَّمُ مَعاً!',
  'مُحاوَلَةٌ جَميلَة! .',
];

let counter = 0;
const pick = (list: string[]): string => {
  counter += 1;
  return list[counter % list.length];
};

export const getEncouragement = (): string => pick(ENCOURAGEMENTS);
export const getTryAgain = (): string => pick(TRY_AGAIN);
export const getGentleMiss = (): string => pick(GENTLE_MISS);
