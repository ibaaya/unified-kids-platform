import { useEffect } from 'react';
import { speakArabic } from './islamicSound';

/**
 * ينطق النص تلقائياً عند ظهوره (ويعيد النطق عند تغيّر key).
 * الصوت اختياري: زر الكتم يوقفه، وزر الاستماع يعيده.
 */
export const useAutoSpeak = (text: string | null | undefined, key: unknown = text, delay = 350): void => {
  useEffect(() => {
    if (!text) return undefined;
    const id = window.setTimeout(() => speakArabic(text), delay);
    return () => window.clearTimeout(id);
  }, [text, key, delay]);
};
