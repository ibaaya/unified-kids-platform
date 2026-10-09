import type { IslamicManner, StepItem, StepTopic } from './types';
import { worshipLessons } from './worship';
import { islamicManners } from './manners';

// =====================================================
// أتعلم خطوة بخطوة
// المواضيع مبنيّة على بيانات العبادات والآداب نفسها (مصدر واحد للمحتوى)،
// وما عداها يُكتب هنا. لإضافة موضوع: أضف عنصراً إلى stepTopics.
// =====================================================

const ORDINALS = ['الأُولى', 'الثّانِيَة', 'الثّالِثَة', 'الرّابِعَة', 'الخامِسَة', 'السّادِسَة', 'السّابِعَة', 'الثّامِنَة'];

export const mannerToSteps = (manner: IslamicManner): StepItem[] =>
  (manner.steps ?? []).map((text, i) => ({
    id: `${manner.id}_step_${i + 1}`,
    title: `الخُطوَةُ ${ORDINALS[i] ?? i + 1}`,
    description: text,
  }));

const worshipSteps = (id: string): StepItem[] => worshipLessons.find((l) => l.id === id)?.steps ?? [];
const mannerSteps = (id: string): StepItem[] => {
  const m = islamicManners.find((x) => x.id === id);
  return m ? mannerToSteps(m) : [];
};

export const stepTopics: StepTopic[] = [
  { id: 'step_wudu', title: 'كَيفَ أَتَوَضَّأ؟', subtitle: 'خُطُواتُ الوُضوء', icon: '💧', color: '#2196F3', steps: worshipSteps('wudu_01'), source: { kind: 'worship', id: 'wudu_01' } },
  { id: 'step_prayer', title: 'كَيفَ أُصَلّي؟', subtitle: 'خُطُواتُ الصَّلاة', icon: '🕌', color: '#009688', steps: worshipSteps('prayer_01'), source: { kind: 'worship', id: 'prayer_01' } },
  { id: 'step_dua', title: 'كَيفَ أَدعو؟', subtitle: 'أَتَكَلَّمُ مَعَ اللَّه', icon: '🤲', color: '#9C27B0', steps: worshipSteps('dua_01'), source: { kind: 'worship', id: 'dua_01' } },
  { id: 'step_salam', title: 'كَيفَ أُسَلِّم؟', subtitle: 'تَحِيَّةُ الإِسلام', icon: '👋', color: '#4CAF50', steps: mannerSteps('manner_salam'), source: { kind: 'manner', id: 'manner_salam' } },
  { id: 'step_istidhan', title: 'كَيفَ أَستَأذِن؟', subtitle: 'قَبلَ أَن أَدخُل', icon: '🚪', color: '#FF9800', steps: mannerSteps('manner_istidhan'), source: { kind: 'manner', id: 'manner_istidhan' } },
  { id: 'step_taam', title: 'كَيفَ آكُلُ بِآداب؟', subtitle: 'آدابُ الطَّعام', icon: '🍽️', color: '#FF5722', steps: mannerSteps('manner_taam'), source: { kind: 'manner', id: 'manner_taam' } },
  { id: 'step_nawm', title: 'كَيفَ أَستَعِدُّ لِلنَّوم؟', subtitle: 'آدابُ النَّوم', icon: '😴', color: '#3F51B5', steps: mannerSteps('manner_nawm'), source: { kind: 'manner', id: 'manner_nawm' } },
  { id: 'step_masjid', title: 'كَيفَ أَتَصَرَّفُ في المَسجِد؟', subtitle: 'آدابُ المَسجِد', icon: '🕌', color: '#00897B', steps: mannerSteps('manner_masjid'), source: { kind: 'manner', id: 'manner_masjid' } },
  {
    id: 'step_birr',
    title: 'كَيفَ أَبَرُّ والِدَيَّ؟',
    subtitle: 'أُحِبُّ أُمّي وَأَبي',
    icon: '❤️',
    color: '#E91E63',
    source: { kind: 'value', id: 'family_birr' },
    steps: [
      { id: 'birr_step_01', title: 'الخُطوَةُ الأُولى', description: 'أَستَمِعُ لِكَلامِ والِدَيَّ وَأُطيعُهُما فِيمَا يُحِبُّ اللَّه.' },
      { id: 'birr_step_02', title: 'الخُطوَةُ الثّانِيَة', description: 'أَتَكَلَّمُ مَعَهُما بِصَوتٍ هادِئٍ وَأَدَبٍ جَميل.' },
      { id: 'birr_step_03', title: 'الخُطوَةُ الثّالِثَة', description: 'أُساعِدُهُما في البَيتِ قَبلَ أَن يَطلُبا.' },
      { id: 'birr_step_04', title: 'الخُطوَةُ الرّابِعَة', description: 'أَشكُرُهُما وَأَقولُ لَهُما: أُحِبُّكُما.' },
      {
        id: 'birr_step_05',
        title: 'الخُطوَةُ الخامِسَة',
        description: 'أَدعو لَهُما دائِماً. وَهَذا دُعاءٌ جَميلٌ مِنَ القُرآنِ الكَريم:',
        quran: { text: 'رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًا', ref: 'سُورَة الإِسْرَاء، الآيَة ٢٤' },
      },
    ],
  },
  {
    id: 'step_help',
    title: 'كَيفَ أُساعِدُ غَيري؟',
    subtitle: 'التَّعاوُنُ وَالإِحسان',
    icon: '🤝',
    color: '#8BC34A',
    source: { kind: 'value', id: 'value_tawon' },
    steps: [
      { id: 'help_step_01', title: 'الخُطوَةُ الأُولى', description: 'أَنتَبِهُ لِمَن يَحتاجُ إِلى مُساعَدَة.' },
      { id: 'help_step_02', title: 'الخُطوَةُ الثّانِيَة', description: 'أَسأَلُهُ بِلُطف: هَل أُساعِدُك؟' },
      { id: 'help_step_03', title: 'الخُطوَةُ الثّالِثَة', description: 'أُساعِدُهُ بِما أَستَطيعُ بِفَرَح.' },
      { id: 'help_step_04', title: 'الخُطوَةُ الرّابِعَة', description: 'أَفعَلُ ذَلِكَ لِأَنَّ اللَّهَ يُحِبُّ المُحسِنين، وَلا أَنتَظِرُ مُقابِلاً.' },
    ],
  },
];
