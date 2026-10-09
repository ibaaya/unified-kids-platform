// أَشْكَالِي
import type { SkillGame } from '../types';
import { multi } from '../kit';
import { shapeName, silhouette, sides, sizeOrder, identical, shapeObjectMatch } from '../generators/shapes';
import { S } from '../kit';

const houseShapes = () => multi('sh_house', 'أَيُّ الْأَشْكَالِ نَسْتَعْمِلُ لِنَرْسُمَ بَيْتًا؟ اخْتَرْ شَكْلَيْنِ.', [
  ['مُرَبَّعٌ', S('square', 'yellow')], ['مُثَلَّثٌ', S('triangle', 'red')], ['دَائِرَةٌ', S('circle', 'blue')], ['قَلْبٌ', S('heart', 'pink')]], [0, 1],
  { pictureRows: [['🏠']] });

export const shapesGame: SkillGame = {
  id: 'shapes', icon: '🔷', theme: 'cyan',
  title: 'أَشْكَالِي',
  subtitle: 'مُطَابَقَةُ الْأَشْكَالِ وَتَرْتِيبُهَا',
  skill: 'الْإِدْرَاكُ الْمَكَانِيُّ وَالْأَشْكَالُ',
  desc: 'تَعَرَّفْ عَلَى الْأَشْكَالِ وَطَابِقْهَا وَرَتِّبْهَا.',
  levels: [
    { level: 1, title: 'أَعْرِفُ الْأَشْكَالَ', goal: 'أُسَمِّي الشَّكْلَ وَأُطَابِقُ الظِّلَّ',
      build: () => [shapeName(), shapeName(), shapeObjectMatch(4), silhouette(), silhouette()] },
    { level: 2, title: 'أُقَارِنُ الْأَشْكَالَ', goal: 'أَعُدُّ الْأَضْلَاعَ وَأَجِدُ الْمُتَطَابِقَ',
      build: () => [sides(), sides(), silhouette(), identical(), shapeObjectMatch(5)] },
    { level: 3, title: 'أُرَتِّبُ وَأَبْنِي', goal: 'أُرَتِّبُ حَسَبَ الْحَجْمِ وَأَخْتَارُ الْأَشْكَالَ لِلْبِنَاءِ',
      build: () => [sizeOrder(3), sizeOrder(4, false), identical(), houseShapes(), sides()] },
  ],
};
