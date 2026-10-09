// أَلْوَانِي
import type { SkillGame } from '../types';
import { colorName, objectColor, colorMix, rainbowOrder, tintOrder, colorMatch } from '../generators/colors';

export const colorsGame: SkillGame = {
  id: 'colors', icon: '🎨', theme: 'rose',
  title: 'أَلْوَانِي',
  subtitle: 'تَرْتِيبُ الْأَلْوَانِ وَخَلْطُهَا',
  skill: 'تَمْيِيزُ الْأَلْوَانِ وَتَرْتِيبُهَا',
  desc: 'سَمِّ الْأَلْوَانَ وَرَتِّبْهَا وَاخْلِطْهَا.',
  levels: [
    { level: 1, title: 'أَعْرِفُ الْأَلْوَانَ', goal: 'أُسَمِّي الْأَلْوَانَ وَأَرْبِطُهَا بِالْأَشْيَاءِ',
      build: () => [colorName(), colorName(), objectColor(), objectColor(), objectColor()] },
    { level: 2, title: 'أُرَتِّبُ وَأَخْلِطُ', goal: 'أُرَتِّبُ الْأَلْوَانَ وَأَعْرِفُ نَاتِجَ الْخَلْطِ',
      build: () => [colorMix(), rainbowOrder(4), tintOrder(3), colorMix(), objectColor()] },
    { level: 3, title: 'خَبِيرُ الْأَلْوَانِ', goal: 'أُرَتِّبُ قَوْسَ المَطَر وَأُطَابِقُ الْأَسْمَاءَ',
      build: () => [colorMatch(4), rainbowOrder(6), tintOrder(4), colorMix(), colorMix()] },
  ],
};
