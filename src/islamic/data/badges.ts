import type { Badge } from './types';

// =====================================================
// نظام الشارات
// =====================================================

export const islamicBadges: Badge[] = [
  // أخلاق
  { id: 'badge_sidq', title: 'بَطَلُ الصِّدق', description: 'أَكمَلتَ دَرسَ الصِّدق', icon: '✨', color: '#4CAF50', worldId: 'values', condition: 'complete_value_sidq' },
  { id: 'badge_amanah', title: 'حارِسُ الأَمانَة', description: 'أَكمَلتَ دَرسَ الأَمانَة', icon: '🔐', color: '#2196F3', worldId: 'values', condition: 'complete_value_amanah' },
  { id: 'badge_rahmah', title: 'قَلبُ الرَّحمَة', description: 'أَكمَلتَ دَرسَ الرَّحمَة', icon: '❤️', color: '#E91E63', worldId: 'values', condition: 'complete_value_rahmah' },
  { id: 'badge_sabr', title: 'نَجمُ الصَّبر', description: 'أَكمَلتَ دَرسَ الصَّبر', icon: '🌟', color: '#FF9800', worldId: 'values', condition: 'complete_value_sabr' },
  { id: 'badge_shukr', title: 'صَديقُ الشُّكر', description: 'أَكمَلتَ دَرسَ الشُّكر', icon: '🙏', color: '#9C27B0', worldId: 'values', condition: 'complete_value_shukr' },
  { id: 'badge_tawon', title: 'بَطَلُ التَّعاوُن', description: 'أَكمَلتَ دَرسَ التَّعاوُن', icon: '🤝', color: '#8BC34A', worldId: 'values', condition: 'complete_value_tawon' },
  { id: 'badge_ihsan', title: 'مُحسِنُ اليَوم', description: 'أَكمَلتَ دَرسَ الإِحسان', icon: '⭐', color: '#FFC107', worldId: 'values', condition: 'complete_value_ihsan' },
  { id: 'badge_afw', title: 'فارِسُ العَفو', description: 'أَكمَلتَ دَرسَ العَفو', icon: '🕊️', color: '#00BCD4', worldId: 'values', condition: 'complete_value_afw' },
  { id: 'badge_tawadu', title: 'وَردَةُ التَّواضُع', description: 'أَكمَلتَ دَرسَ التَّواضُع', icon: '🌸', color: '#FF5722', worldId: 'values', condition: 'complete_value_tawadu' },
  { id: 'badge_wafa', title: 'أَمينُ الوَفاء', description: 'أَكمَلتَ دَرسَ الوَفاء', icon: '💎', color: '#3F51B5', worldId: 'values', condition: 'complete_value_wafa' },

  // أسرة
  { id: 'badge_birr', title: 'قُرَّةُ العَين', description: 'أَكمَلتَ دَرسَ بِرِّ الوالِدَين', icon: '💝', color: '#E91E63', worldId: 'family', condition: 'complete_family_birr' },
  { id: 'badge_ikram', title: 'مُكرِمُ الكِبار', description: 'أَكمَلتَ دَرسَ احتِرامِ الكَبير', icon: '👴', color: '#795548', worldId: 'family', condition: 'complete_family_ikram' },
  { id: 'badge_musaadah', title: 'يَدُ العَون', description: 'أَكمَلتَ دَرسَ مُساعَدَةِ الأُسرَة', icon: '🏠', color: '#FF9800', worldId: 'family', condition: 'complete_family_musaadah' },
  { id: 'badge_silah', title: 'واصِلُ الرَّحِم', description: 'أَكمَلتَ دَرسَ صِلَةِ الرَّحِم', icon: '👨‍👩‍👧‍👦', color: '#4CAF50', worldId: 'family', condition: 'complete_family_silah' },

  // آداب
  { id: 'badge_salam', title: 'مُنشِرُ السَّلام', description: 'أَكمَلتَ دَرسَ السَّلام', icon: '👋', color: '#4CAF50', worldId: 'manners', condition: 'complete_manner_salam' },
  { id: 'badge_istidhan', title: 'صاحِبُ الأَدَب', description: 'أَكمَلتَ دَرسَ الاِستِئذان', icon: '🚪', color: '#FF9800', worldId: 'manners', condition: 'complete_manner_istidhan' },
  { id: 'badge_taam', title: 'مُؤَدِّبُ الطَّعام', description: 'أَكمَلتَ آدابَ الطَّعام', icon: '🍽️', color: '#FF5722', worldId: 'manners', condition: 'complete_manner_taam' },
  { id: 'badge_nazafah', title: 'بَطَلُ النَّظافَة', description: 'أَكمَلتَ دَرسَ النَّظافَة', icon: '🧼', color: '#8BC34A', worldId: 'manners', condition: 'complete_manner_nazafah' },
  { id: 'badge_masjid', title: 'زائِرُ المَسجِد', description: 'أَكمَلتَ آدابَ المَسجِد', icon: '🕌', color: '#009688', worldId: 'manners', condition: 'complete_manner_masjid' },
  { id: 'badge_hadith', title: 'لَطيفُ الحَديث', description: 'أَكمَلتَ آدابَ الحَديث', icon: '💬', color: '#2196F3', worldId: 'manners', condition: 'complete_manner_hadith' },
  { id: 'badge_nawm', title: 'هانِئُ النَّوم', description: 'أَكمَلتَ آدابَ النَّوم', icon: '😴', color: '#3F51B5', worldId: 'manners', condition: 'complete_manner_nawm' },

  // عبادات
  { id: 'badge_wudu', title: 'طاهِرُ الوُضوء', description: 'أَكمَلتَ دَرسَ الوُضوء', icon: '💧', color: '#2196F3', worldId: 'worship', condition: 'complete_wudu' },
  { id: 'badge_prayer', title: 'مُصَلِّي الخَير', description: 'أَكمَلتَ دَرسَ الصَّلاة', icon: '🕌', color: '#009688', worldId: 'worship', condition: 'complete_prayer' },
  { id: 'badge_dua', title: 'قَريبٌ مِنَ اللَّه', description: 'أَكمَلتَ دَرسَ الدُّعاء', icon: '🤲', color: '#9C27B0', worldId: 'worship', condition: 'complete_dua' },

  // دين
  { id: 'badge_islam_pillars', title: 'عارِفُ الإِسلام', description: 'تَعَلَّمتَ أَركانَ الإِسلام', icon: '☪️', color: '#4CAF50', worldId: 'faith', condition: 'complete_islam_pillars' },
  { id: 'badge_iman_pillars', title: 'رَاسِخُ الإِيمان', description: 'تَعَلَّمتَ أَركانَ الإِيمان', icon: '✨', color: '#FFD700', worldId: 'faith', condition: 'complete_iman_pillars' },
  { id: 'badge_prophet', title: 'مُحِبُّ النَّبي', description: 'تَعَرَّفتَ عَلى نَبِيِّنا', icon: '💛', color: '#FF9800', worldId: 'faith', condition: 'complete_prophet' },

  { id: 'badge_ikhwah', title: 'أَخٌ حَنون', description: 'أَكمَلتَ دَرسَ احتِرامِ الإِخوَة', icon: '👫', color: '#2196F3', worldId: 'family', condition: 'complete_family_ikhwah' },
  { id: 'badge_rahmah_saghir', title: 'رَفيقُ الصِّغار', description: 'أَكمَلتَ دَرسَ الرَّحمَةِ بِالصَّغير', icon: '🐣', color: '#9C27B0', worldId: 'family', condition: 'complete_family_rahmah_saghir' },
  { id: 'badge_shurb', title: 'مُؤَدَّبُ الشَّراب', description: 'أَكمَلتَ آدابَ الشَّراب', icon: '🥤', color: '#00BCD4', worldId: 'manners', condition: 'complete_manner_shurb' },
  { id: 'badge_ikram_akhar', title: 'مُحتَرِمُ الآخَرين', description: 'أَكمَلتَ دَرسَ احتِرامِ الآخَرين', icon: '🤝', color: '#9C27B0', worldId: 'manners', condition: 'complete_manner_ikram_akhar' },
  { id: 'badge_mumtalakat', title: 'حافِظُ الأَشياء', description: 'أَكمَلتَ دَرسَ المُحافَظَةِ عَلى المُمتَلَكات', icon: '🏺', color: '#795548', worldId: 'manners', condition: 'complete_manner_mumtalakat' },
  // قصص
  { id: 'badge_stories', title: 'قارِئُ القِيَم', description: 'أَكمَلتَ ٣ قِصَص', icon: '📖', color: '#9C27B0', worldId: 'stories', condition: 'complete_3_stories' },
  { id: 'badge_all_stories', title: 'بَطَلُ القِصَص', description: 'أَكمَلتَ جَميعَ القِصَص', icon: '🏆', color: '#FF9800', worldId: 'stories', condition: 'complete_all_stories' },

  // الشارة الكبرى
  { id: 'badge_superstar', title: 'بَطَلُ الأَخلاق', description: 'أَكمَلتَ ٢٠ نَشاطاً', icon: '🌟', color: '#FFD700', worldId: 'all', condition: 'complete_20_activities' },
];
