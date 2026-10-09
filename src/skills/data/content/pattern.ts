// مَا النَّمَطُ؟
import type { SkillGame, Question } from '../types';
import { patternLevel1, patternLevel2, patternLevel3 } from '../generators/pattern';

const many = (fn: () => Question, n = 5): Question[] => Array.from({ length: n }, fn);

export const patternGame: SkillGame = {
  id: 'pattern', icon: '🔢', theme: 'orange',
  title: 'مَا النَّمَطُ؟',
  subtitle: 'اكْتِشَافُ الْأَنْمَاطِ',
  skill: 'الْأَنْمَاطُ وَالِاسْتِنْتَاجُ',
  desc: 'اكْتَشِفْ مَا يَتَكَرَّرُ وَأَكْمِلِ التَّسَلْسُلَ.',
  levels: [
    { level: 1, title: 'أَنْمَاطٌ بَسِيطَةٌ', goal: 'أَكْتَشِفُ نَمَطَ اثْنَيْنِ أَوْ ثَلَاثَةٍ', build: () => many(patternLevel1) },
    { level: 2, title: 'أَنْمَاطٌ أَطْوَلُ', goal: 'أُكْمِلُ نَمَطًا مِنْ ثَلَاثَةِ عَنَاصِرَ أَوْ خَانَةً نَاقِصَةً', build: () => many(patternLevel2) },
    { level: 3, title: 'أَنْمَاطُ الْأَعْدَادِ وَالْأَشْكَالِ', goal: 'أَكْتَشِفُ قَاعِدَةَ الزِّيَادَةِ أَوِ النَّقْصِ', build: () => many(patternLevel3) },
  ],
};
