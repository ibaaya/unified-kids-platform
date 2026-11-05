/**
 * ParentButton — زر ولي الأمر العائم الموحّد
 * يظهر في أسفل اليسار في جميع الصفحات الرئيسية
 * يقبل "section" لتحديد أي قسم يُفتح مباشرة
 */
import { Link } from 'react-router-dom'
import { isNativeApp } from '../../platform/initPlatform'

interface ParentButtonProps {
  /** القسم الذي يُفتح مباشرة: arabic | english | numbers | undefined (يفتح الاختيار) */
  section?: 'arabic' | 'english' | 'numbers'
  /** موضع الزر: bottom-left (افتراضي) */
  className?: string
  /** الشاشة الرئيسية وحدها تعرضه داخل تطبيق الهاتف. */
  showOnNativeHome?: boolean
}

export function ParentButton({ section, className = '', showOnNativeHome = false }: ParentButtonProps) {
  if (isNativeApp && !showOnNativeHome) return null
  // بناء رابط لوحة ولي الأمر مع المقطع المحدد
  const to = section ? `/parent?section=${section}` : '/parent'

  return (
    <Link
      to={to}
      aria-label="لوحة ولي الأمر"
      title="لوحة ولي الأمر"
      className={`
        fixed left-4 z-50
        flex h-12 w-12 items-center justify-center
        rounded-full border-2 border-white/90
        bg-gradient-to-br from-indigo-600 to-violet-700
        text-xl text-white shadow-xl backdrop-blur-md
        transition-all hover:scale-110 hover:shadow-indigo-300/50
        active:scale-95
        ${className}
      `}
      style={{ bottom: 'calc(var(--safe-bottom, 0px) + 1rem)', boxShadow: '0 4px 20px rgba(99,60,180,0.45)' }}
    >
      ⚙️
    </Link>
  )
}
