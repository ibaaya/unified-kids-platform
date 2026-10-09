// ذَاكِرَتِي القَوِيَّةُ
import type { SkillGame } from '../types';
import { memoryPairs, recallPresent, recallMissing } from '../generators/memory';

export const memoryGame: SkillGame = {
  id: 'memory', icon: '🧠', theme: 'indigo',
  title: 'ذَاكِرَتِي الْقَوِيَّةُ',
  subtitle: 'الذَّاكِرَةُ وَالتَّرْكِيزُ',
  skill: 'الذَّاكِرَةُ الْبَصَرِيَّةُ وَالتَّرْكِيزُ',
  desc: 'اقْلِبِ الْبِطَاقَاتِ وَتَذَكَّرِ الصُّوَرَ الَّتِي رَأَيْتَهَا.',
  levels: [
    { level: 1, title: 'أَتَذَكَّرُ قَلِيلًا', goal: 'أُطَابِقُ ثَلَاثَةَ أَزْوَاجٍ وَأَتَذَكَّرُ ثَلَاثَ صُوَرٍ',
      build: () => [memoryPairs(3), recallPresent(3, 4), recallPresent(3, 4), memoryPairs(3), recallPresent(3, 3)] },
    { level: 2, title: 'أَتَذَكَّرُ أَكْثَرَ', goal: 'أُطَابِقُ أَرْبَعَةَ أَزْوَاجٍ وَأَعْرِفُ مَا اخْتَفَى',
      build: () => [memoryPairs(4), recallMissing(4, 4), recallPresent(4, 4), memoryPairs(4, true), recallMissing(4, 3)] },
    { level: 3, title: 'ذَاكِرَةٌ خَارِقَةٌ', goal: 'أُطَابِقُ سِتَّةَ أَزْوَاجٍ وَأَتَذَكَّرُ خَمْسَ صُوَرٍ',
      build: () => [memoryPairs(6), recallMissing(5, 4), recallPresent(5, 4), memoryPairs(6, true), recallMissing(6, 5)] },
  ],
};
