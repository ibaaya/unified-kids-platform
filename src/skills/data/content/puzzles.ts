// أَلْغَازُ الصُّوَرِ: ألغاز بالصور فقط
import type { SkillGame } from '../types';
import { generateOddOneOut, generateBelongs, generateDifference, generateCount } from '../generators/puzzles';

export const puzzlesGame: SkillGame = {
  id: 'puzzles', icon: '🖼️', theme: 'teal',
  title: 'أَلْغَازُ الصُّوَرِ',
  subtitle: 'الْفَرْقُ وَالْعَدُّ وَالتَّصْنِيفُ',
  skill: 'الْمُلَاحَظَةُ وَالتَّصْنِيفُ وَالْعَدُّ',
  desc: 'أَلْغَازٌ بِالصُّوَرِ: مَنِ الْمُخْتَلِفُ؟ كَمِ الْعَدَدُ؟ مَاذَا تَغَيَّرَ؟',
  levels: [
    { level: 1, title: 'مَنِ الْمُخْتَلِفُ؟', goal: 'أُمَيِّزُ الصُّورَةَ الْمُخْتَلِفَةَ',
      build: () => [generateOddOneOut(), generateOddOneOut(), generateOddOneOut(), generateBelongs(), generateBelongs()] },
    { level: 2, title: 'أُصَنِّفُ وَأَعُدُّ', goal: 'أُصَنِّفُ الصُّوَرَ وَأَعُدُّ مَا أَرَاهُ',
      build: () => [generateBelongs(), generateBelongs(), generateCount(5), generateCount(5), generateDifference()] },
    { level: 3, title: 'مَاذَا تَغَيَّرَ؟', goal: 'أُقَارِنُ صَفَّيْنِ وَأَجِدُ الْفَرْقَ',
      build: () => [generateDifference(), generateDifference(), generateCount(7), generateOddOneOut(), generateDifference()] },
  ],
};
