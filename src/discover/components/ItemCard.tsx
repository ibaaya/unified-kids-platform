/**
 * ItemCard — بطاقة عرض عنصر الاكتشاف
 * تعرض: إيموجي كبير + اسم عربي + اسم إنجليزي + أزرار صوت
 * تستخدم نظام الصوت الموجود في المشروع (speakArabic) + Web Speech للإنجليزية
 */

import type { DiscoverItem } from '../data/discoverData'
import { speakArabic } from '../../engine/soundManager'
import { speakEnglish } from '../../english/engine/soundManager'

interface ItemCardProps {
  item: DiscoverItem
  /** هل البطاقة في وضع popup منبثق؟ */
  isPopup?: boolean
  /** callback عند إغلاق الـ popup */
  onClose?: () => void
  /** هل تظهر بشكل صغير (شبكة) أم كبير (popup)؟ */
  size?: 'small' | 'large'
  /** التنقل بين عناصر العالم داخل الـPopup */
  onPrevious?: () => void
  onNext?: () => void
  /** موقع العنصر الحالي داخل العالم */
  itemIndex?: number
  itemCount?: number
}

export function ItemCard({ item, isPopup = false, onClose, size = 'large', onPrevious, onNext, itemIndex = 0, itemCount = 1 }: ItemCardProps) {
  const isSmall = size === 'small'

  const handleArabic = (e: React.MouseEvent) => {
    e.stopPropagation()
    speakArabic(item.nameAr, {
      onEnd: () => speakEnglish(item.nameEn, { rate: 0.82 }),
      onError: () => speakEnglish(item.nameEn, { rate: 0.82 }),
    })
  }

  const handleEnglish = (e: React.MouseEvent) => {
    e.stopPropagation()
    speakEnglish(item.nameEn, { rate: 0.82 })
  }

  if (isSmall) {
    // وضع الشبكة — بطاقة صغيرة قابلة للنقر
    return (
      <button
        className="group flex flex-col items-center gap-1 rounded-2xl border-2 border-white/60 bg-white/70 p-3 text-center shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-xl active:scale-95"
        style={{ boxShadow: '0 4px 16px rgba(36,49,58,0.10)' }}
      >
        <span className="text-5xl">{item.emoji}</span>
        <span className="text-sm font-extrabold text-gray-800 leading-tight">{item.nameAr}</span>
        <span className="text-xs font-semibold text-gray-500">{item.nameEn}</span>
      </button>
    )
  }

  // وضع البطاقة الكبيرة / popup
  return (
    <div
      className={`discover-item-card relative flex flex-col items-center rounded-[2rem] border-4 border-white/80 bg-white/95 p-7 text-center shadow-2xl backdrop-blur-md ${
        isPopup ? 'w-[min(560px,94vw)] max-h-[90vh] overflow-y-auto' : 'w-full'
      }`}
      style={{ boxShadow: '0 20px 60px rgba(36,49,58,0.18)' }}
    >
      {/* زر الإغلاق */}
      {isPopup && onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:scale-110"
        >
          ✕
        </button>
      )}

      {/* الإيموجي الرئيسي */}
      <div
        className="discover-item-emoji mb-5 flex h-44 w-44 items-center justify-center rounded-full text-[7.5rem] leading-none shadow-inner sm:h-48 sm:w-48 sm:text-[8rem]"
        style={{
          background: item.color
            ? `${item.color}22`
            : 'linear-gradient(135deg, rgba(255,159,69,0.12), rgba(58,160,217,0.12))',
        }}
      >
        {item.emoji}
      </div>

      {/* الاسم العربي */}
      <div className="discover-item-name-ar mb-2 text-4xl font-extrabold sm:text-5xl text-gray-800" style={{ fontFamily: 'var(--font-display)' }}>
        {item.nameAr}
      </div>

      {/* الاسم الإنجليزي */}
      <div className="discover-item-name-en mb-5 text-2xl font-bold text-blue-600 sm:text-3xl" dir="ltr">
        {item.nameEn}
      </div>

      {/* الوصف إن وُجد */}
      {item.descAr && (
        <p className="mb-5 max-w-lg text-base leading-8 text-gray-600 sm:text-lg">{item.descAr}</p>
      )}

      {/* مؤشر العنصر داخل العالم */}
      {isPopup && itemCount > 1 && (
        <div className="mb-4 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-bold text-gray-500">
          {itemIndex + 1} / {itemCount}
        </div>
      )}

      {/* أزرار الصوت */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleArabic}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
        >
          🔊 عَرَبِيّ
        </button>
        <button
          onClick={handleEnglish}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-400 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
          dir="ltr"
        >
          🔊 English
        </button>
      </div>

      {/* التنقل بين عناصر العالم دون إغلاق الـPopup */}
      {isPopup && itemCount > 1 && (
        <div className="mt-5 flex w-full items-center justify-between gap-3" dir="ltr">
          <button
            onClick={(e) => { e.stopPropagation(); onPrevious?.() }}
            disabled={itemIndex === 0}
            className="flex min-w-28 items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-base font-extrabold text-gray-700 shadow-sm transition hover:bg-gray-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span>←</span> السابق
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext?.() }}
            disabled={itemIndex === itemCount - 1}
            className="flex min-w-28 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 px-4 py-3 text-base font-extrabold text-white shadow-md transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            التالي <span>→</span>
          </button>
        </div>
      )}
    </div>
  )
}
