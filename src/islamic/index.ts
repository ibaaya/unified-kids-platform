export { islamicRoutes, islamicRouteElements } from './islamicRoutes';
export { setIslamicProfile, resetIslamicProgress, getIslamicProgress } from './engine/islamicProgress';

/** بيانات بطاقة القسم لإضافتها إلى صفحة Hub الرئيسية (عدّل الحقول لتطابق بنية HubPage) */
export const ISLAMIC_HUB_CARD = {
  id: 'islamic',
  path: '/islamic',
  icon: '🌙',
  title: 'أَخلاقي الجَميلَة',
  subtitle: 'أَتَعَلَّمُ دِينِي وَأَخلاقي وَأَجعَلُ الخَيرَ عادَتي',
} as const;
