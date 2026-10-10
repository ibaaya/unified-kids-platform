// src/skills/engine/speech.ts
// النطق العربي: يُنطق النص المشكَّل فقط، وتُحذف الإيموجي والرموز تلقائيًا (لا نطق للصور).

import { playRecordedAudioText, stopRecordedAudio } from '../../engine/recordedAudioManager';
import { normalizeAnswerFeedback } from '../../utils/feedbackPrompts';

const SOUND_KEY = 'skills-sound';

/** يحذف الإيموجي والرموز والصور النصية ويُبقي العربية المشكَّلة والأرقام وعلامات الترقيم */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\u200d\ufe0f\u20e3]/gu, ' ')
    .replace(/[•★☆«»↔←→]/g, ' ')
    .replace(/\u0640/g, '')            // التطويل
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const speechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export function isSoundOn(): boolean {
  try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; }
}
export function setSoundOn(on: boolean): void {
  try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
  if (!on) stopSpeaking();
}

let cachedVoice: SpeechSynthesisVoice | null = null;
function arabicVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang.toLowerCase().replace('_', '-') === 'ar-sa') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('ar')) ?? null;
  return cachedVoice;
}
if (speechSupported()) {
  // الأصوات تُحمَّل بشكل غير متزامن في بعض المتصفحات
  window.speechSynthesis.addEventListener?.('voiceschanged', () => { cachedVoice = null; arabicVoice(); });
}

export function stopSpeaking(): void {
  stopRecordedAudio();
  if (speechSupported()) window.speechSynthesis.cancel();
}

let timer: number | undefined;
/** ينطق النص. force=true يتجاهل زر كتم الصوت (للأيقونة اليدوية «أعد السماع») */
export function speak(text: string, opts: { force?: boolean; rate?: number } = {}): void {
  if (!opts.force && !isSoundOn()) return;
  const speechText = normalizeAnswerFeedback(text);
  const clean = cleanForSpeech(speechText);
  if (!clean) return;
  window.clearTimeout(timer);
  const speakWithSynthesis = () => {
    stopRecordedAudio();
    if (!speechSupported()) return;
    window.speechSynthesis.cancel();
    // تأخير بسيط يتجنب خطأ Chrome عند cancel ثم speak مباشرة
    timer = window.setTimeout(() => {
      const u = new SpeechSynthesisUtterance(clean);
      const v = arabicVoice();
      u.lang = v?.lang ?? 'ar-SA';
      if (v) u.voice = v;
      u.rate = opts.rate ?? 0.85;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    }, 80);
  };
  if (playRecordedAudioText(speechText, undefined, speakWithSynthesis)) {
    if (speechSupported()) window.speechSynthesis.cancel();
    return;
  }
  speakWithSynthesis();
}
