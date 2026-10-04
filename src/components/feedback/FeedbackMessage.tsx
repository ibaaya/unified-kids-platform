// رسائل التحفيز عند الإجابة — بدون ذكر اسم الطفل وبدون وصف للأيقونة.
// نتناوب بين الصيغ المختلفة في كل مرة (وليس عشوائيًا) حتى لا يسمع
// الطفل نفس الجملة مرتين متتاليتين.

function successTemplates(): string[] {
  return ['أَحْسَنْتَ! رَائِعٌ!', 'رَائِعٌ! أَحْسَنْتَ!', 'مُمْتَازٌ! أَحْسَنْتَ!']
}

function tryAgainTemplates(): string[] {
  return ['حَاوِلْ مُجَدَّدًا', 'حَاوِلْ مَرَّةً أُخْرَى']
}

/**
 * index تصاعدي (عدد مرات الإجابة الصحيحة/الخاطئة السابقة مثلًا) يحدد أي
 * صيغة تُستخدم، فتتناوب الرسائل بالتبادل بدل التكرار العشوائي.
 */
export function pickSuccessMessage(alternateIndex: number): string {
  const options = successTemplates()
  return options[alternateIndex % options.length]
}

export function pickTryAgainMessage(alternateIndex: number): string {
  const options = tryAgainTemplates()
  return options[alternateIndex % options.length]
}

interface FeedbackMessageProps {
  status: 'success' | 'retry'
  message: string
}

export function FeedbackMessage({ status, message }: FeedbackMessageProps) {
  const isSuccess = status === 'success'
  return (
    <div
      role="status"
      className={`text-center font-display font-extrabold text-xl py-3 px-4 rounded-2xl ${
        isSuccess
          ? 'bg-[var(--color-leaf)]/10 text-[var(--color-leaf)]'
          : 'bg-[var(--color-amber)]/15 text-[var(--color-sun-dark)]'
      }`}
    >
      {message}
    </div>
  )
}
