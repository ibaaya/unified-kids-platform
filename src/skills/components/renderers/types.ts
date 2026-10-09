export interface RendererProps<Q> {
  q: Q;
  /** silent=true: يسجّل الخطأ دون رسالة/نطق (للذاكرة مثلًا) */
  onMistake: (silent?: boolean) => void;
  /** perfect: يحدد هل تُحتسب الإجابة «من أول مرة»؛ الافتراضي = لا أخطاء */
  onSolved: (perfect?: boolean) => void;
}
