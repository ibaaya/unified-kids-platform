/**
 * discoverQuizData.ts — بنك الاختبار الشامل لقسم «اكتشف ما حولك»
 *
 * - 3 مستويات: سهل → متوسط → صعب.
 * - كل مستوى: 30 سؤالًا مستقلًا.
 * - الأنواع المدعومة:
 *   • mcq        — اختيار من متعدد (افتراضي)
 *   • trueFalse  — صح أم خطأ (يُستخدم في السهل)
 * - حقل hint اختياري يظهر في المستوى الصعب.
 * - لا يعاد استخدام السؤال نفسه بين المستويات.
 */
import type { DiscoverItem } from './discoverData.ts'
import { DISCOVER_WORLDS } from './discoverData.ts'

export type DiscoverTestLevel = 'easy' | 'medium' | 'hard'
export type DiscoverQuestionType = 'mcq' | 'trueFalse'

export interface DiscoverQuizQuestion {
  id: string
  level: DiscoverTestLevel
  worldId: string
  prompt: string
  correctId: string
  optionIds: string[]
  type?: DiscoverQuestionType     // افتراضي: 'mcq'
  hint?: string                   // يظهر في المستوى الصعب
  explanation?: string
}

const q = (
  id: string,
  level: DiscoverTestLevel,
  worldId: string,
  prompt: string,
  correctId: string,
  optionIds: string[],
  explanation?: string,
  type?: DiscoverQuestionType,
  hint?: string,
): DiscoverQuizQuestion => ({
  id, level, worldId, prompt, correctId, optionIds, explanation, type, hint,
})

export const DISCOVER_QUIZ_QUESTIONS: DiscoverQuizQuestion[] = [
  // ═══════════════════════════════════════════════
  // سهل — 30 سؤالاً
  // ═══════════════════════════════════════════════
  q('easy-01','easy','home','أَيْنَ نَنَامُ؟','bed',['bed','sofa','table','chair'],'نَنَامُ عَلَى السَّرِيرِ.'),
  q('easy-02','easy','colors','أَيُّ لَوْنٍ يُشْبِهُ لَوْنَ الْعُشْبِ؟','green',['green','red','purple','black'],'الْعُشْبُ غَالِبًا أَخْضَرُ.'),
  q('easy-03','easy','transport','أَيُّ وَسِيلَةٍ تَطِيرُ فِي السَّمَاءِ؟','airplane',['airplane','bus','train','bicycle'],'الطَّائِرَةُ تَطِيرُ فِي السَّمَاءِ.'),
  q('easy-04','easy','farm','أَيُّ حَيَوَانٍ يُعْطِينَا الْحَلِيبَ؟','cow',['cow','rabbit','rooster','horse'],'الْبَقَرَةُ تُعْطِينَا الْحَلِيبَ.'),
  q('easy-05','easy','animals','مَنْ هُوَ مَلِكُ الْحَيَوَانَاتِ فِي الْقِصَصِ؟','lion',['lion','rabbit2','fish','turtle'],'الْأَسَدُ يُسَمَّى مَلِكَ الْحَيَوَانَاتِ.'),
  q('easy-06','easy','food','أَيٌّ مِنْ هَذِهِ فَاكِهَةٌ صَفْرَاءُ؟','banana',['banana','apple','grape','bread'],'الْمَوْزُ لَوْنُهُ أَصْفَرُ.'),
  q('easy-07','easy','clothes','مَاذَا نَلْبَسُ فِي الْقَدَمِ؟','shoes',['shoes','hat','shirt','coat'],'نَلْبَسُ الْحِذَاءَ فِي الْقَدَمِ.'),
  q('easy-08','easy','nature','مَا الَّذِي يُضِيءُ لَنَا فِي النَّهَارِ؟','sun',['sun','moon','star','cloud'],'الشَّمْسُ تُضِيءُ فِي النَّهَارِ.'),
  q('easy-09','easy','school','بِمَاذَا نَكْتُبُ فِي الْمَدْرَسَةِ؟','pen',['pen','ruler','eraser','bag'],'نَسْتَخْدِمُ الْقَلَمَ لِلْكِتَابَةِ.'),
  q('easy-10','easy','jobs','مَنْ يُعَالِجُ الْمَرْضَى؟','doctor',['doctor','pilot','chef','farmer'],'الطَّبِيبُ يُعَالِجُ الْمَرْضَى.'),
  q('easy-11','easy','body','بِمَاذَا نَرَى؟','eye',['eye','ear','nose','hand'],'نَرَى بِالْعَيْنِ.'),
  q('easy-12','easy','city','أَيْنَ نَذْهَبُ لِلْعِلَاجِ؟','hospital',['hospital','park','market','library'],'الْمُسْتَشْفَى مَكَانٌ لِلْعِلَاجِ.'),
  q('easy-13','easy','weather','فِي أَيِّ طَقْسٍ يَنْزِلُ الْمَطَرُ؟','rainy',['rainy','sunny','snowy','windy'],'الطَّقْسُ الْمُمْطِرُ فِيهِ مَطَرٌ.'),
  q('easy-14','easy','safety','مَاذَا نَضَعُ عَلَى الرَّأْسِ لِحِمَايَتِهِ؟','helmet',['helmet','seatbelt','lifebuoy','warning'],'الْخُوذَةُ تَحْمِي الرَّأْسَ.'),
  q('easy-15','easy','shapes','أَيُّ شَكْلٍ لَيْسَ لَهُ زَوَايَا؟','circle',['circle','triangle','square','rectangle'],'الدَّائِرَةُ بِلَا زَوَايَا.'),
  q('easy-16','easy','plants','أَيُّ جُزْءٍ مِنَ النَّبَاتِ تَحْتَ التُّرْبَةِ؟','root',['root','flower2','leaf2','fruit'],'الْجِذْرُ تَحْتَ التُّرْبَةِ.'),
  q('easy-17','easy','home','بِمَاذَا نَرَى صُورَتَنَا؟','mirror',['mirror','lamp','fridge','clock'],'نَرَى انْعِكَاسَنَا فِي الْمِرْآةِ.'),
  q('easy-18','easy','transport','أَيُّ وَسِيلَةٍ تَسِيرُ عَلَى سِكَّةِ حَدِيدٍ؟','train',['train','car','boat','helicopter'],'الْقِطَارُ عَلَى سِكَّةِ الْحَدِيدِ.'),
  q('easy-19','easy','farm','أَيُّ طَائِرٍ يَصِيحُ فِي الصَّبَاحِ؟','rooster',['rooster','duck','cow','sheep'],'الدِّيكُ يَصِيحُ فِي الصَّبَاحِ.'),
  q('easy-20','easy','food','أَيُّ شَرَابٍ أَبْيَضَ نَشْرَبُهُ؟','milk',['milk','water','honey','bread'],'الْحَلِيبُ أَبْيَضُ.'),
  q('easy-21','easy','school','أَيْنَ نَحْمِلُ كُتُبَنَا؟','bag',['bag','board','ruler','book'],'نَضَعُ الْكُتُبَ فِي الْحَقِيبَةِ.'),
  q('easy-22','easy','jobs','مَنْ يُطْفِئُ الْحَرَائِقَ؟','firefighter',['firefighter','engineer','teacher2','artist'],'رَجُلُ الْإِطْفَاءِ يُخْمِدُ الْحَرَائِقَ.'),
  q('easy-23','easy','body','بِمَاذَا نَسْمَعُ الْأَصْوَاتَ؟','ear',['ear','eye','mouth','foot'],'نَسْمَعُ بِالْأُذُنِ.'),
  q('easy-24','easy','nature','مَا الَّذِي نَرَاهُ فِي السَّمَاءِ لَيْلًا؟','moon',['moon','sun','grass','river'],'نَرَى الْقَمَرَ لَيْلًا.'),
  q('easy-25','easy','shapes','أَيُّ شَكْلٍ لَهُ ثَلَاثَةُ أَضْلَاعٍ؟','triangle',['triangle','circle','square','oval'],'الْمُثَلَّثُ ثَلَاثَةُ أَضْلَاعٍ.'),
  // ——— إضافات جديدة للسهل ———
  q('easy-26','easy','time','مَا الْوَحْدَةُ الَّتِي تُسَاوِي ٦٠ دَقِيقَةً؟','hour',['hour','minute','second','day'],'السَّاعَةُ = ٦٠ دَقِيقَةً.'),
  q('easy-27','easy','time','مَا الَّذِي نَسْتَخْدِمُهُ لِمَعْرِفَةِ الْوَقْتِ؟','clock2',['clock2','book','cup','chair'],'السَّاعَةُ تُخْبِرُنَا بِالْوَقْتِ.'),
  q('easy-28','easy','weather','فِي أَيِّ فَصْلٍ تَتَسَاقَطُ أَوْرَاقُ الشَّجَرِ؟','autumn',['autumn','summer','spring','winter'],'الْخَرِيفُ فَصْلُ تَسَاقُطِ الْأَوْرَاقِ.'),
  q('easy-29','easy','weather','فِي أَيِّ فَصْلٍ يَكُونُ الْجَوُّ حَارًّا؟','summer',['summer','winter','autumn','spring'],'الصَّيْفُ حَارٌّ.'),
  q('easy-30','easy','time','مَا اسْمُ الْيَوْمِ الَّذِي يَلِي الْيَوْمَ؟','tomorrow',['tomorrow','yesterday','today','week'],'غَدًا هُوَ الْيَوْمُ التَّالِي.',undefined,'trueFalse'),

  // ═══════════════════════════════════════════════
  // متوسط — 30 سؤالاً
  // ═══════════════════════════════════════════════
  q('medium-01','medium','home','أَيُّ شَيْءٍ يُسَاعِدُنَا عَلَى مَعْرِفَةِ الْوَقْتِ؟','clock',['clock','pillow','carpet','plate'],'السَّاعَةُ تُخْبِرُنَا بِالْوَقْتِ.'),
  q('medium-02','medium','home','أَيْنَ نَضَعُ الْمَلَابِسَ الْمُرَتَّبَةَ؟','closet',['closet','fridge','kitchen','window'],'الْخِزَانَةُ لِحِفْظِ الْمَلَابِسِ.'),
  q('medium-03','medium','colors','مَاذَا يَنْتُجُ عَنْ خَلْطِ الْأَصْفَرِ وَالْأَحْمَرِ؟','orange',['orange','green','blue','black'],'يَنْتُجُ الْبُرْتُقَالِيُّ.'),
  q('medium-04','medium','transport','أَيُّ وَسِيلَةٍ تُنَاسِبُ السَّفَرَ فِي الْمَاءِ؟','boat',['boat','subway','scooter','airplane'],'الْقَارِبُ فِي الْمَاءِ.'),
  q('medium-05','medium','farm','أَيُّ شَيْءٍ يُسَاعِدُ الْمُزَارِعَ فِي الْحَقْلِ؟','tractor',['tractor','pillow','school2','lamp'],'الْجَرَّارُ الزِّرَاعِيُّ.'),
  q('medium-06','medium','animals','أَيُّ حَيَوَانٍ بَحْرِيٌّ ذَكِيٌّ؟','dolphin',['dolphin','giraffe','horse','cat'],'الدُّلْفِينُ ذَكِيٌّ.'),
  q('medium-07','medium','food','أَيُّ طَعَامٍ نَحْصُلُ عَلَيْهِ مِنَ النَّحْلِ؟','honey',['honey','rice','cheese','bread'],'النَّحْلُ يُنْتِجُ الْعَسَلَ.'),
  q('medium-08','medium','clothes','مَاذَا نَلْبَسُ فِي الْجَوِّ الْبَارِدِ؟','coat',['coat','sandals','tshirt','hat'],'الْمِعْطَفُ لِلدِّفْءِ.'),
  q('medium-09','medium','nature','مَا الَّذِي يَظْهَرُ بَعْدَ الْمَطَرِ بِأَلْوَانٍ؟','rainbow',['rainbow','mountain','seed','wind'],'قَوْسُ قُزَحَ بَعْدَ الْمَطَرِ.'),
  q('medium-10','medium','school','مَا الْأَدَاةُ لِرَسْمِ خَطٍّ مُسْتَقِيمٍ؟','ruler',['ruler','eraser','scissors','glue'],'الْمِسْطَرَةُ لِلْخَطِّ الْمُسْتَقِيمِ.'),
  q('medium-11','medium','jobs','مَنْ يُعَالِجُ أَسْنَانَنَا؟','dentist',['dentist','nurse','pilot','carpenter'],'طَبِيبُ الْأَسْنَانِ.'),
  q('medium-12','medium','body','أَيُّ عُضْوٍ يُسَاعِدُ عَلَى مَضْغِ الطَّعَامِ؟','teeth',['teeth','ear','leg','hair'],'الْأَسْنَانُ تَمْضَغُ.'),
  q('medium-13','medium','city','مَا الْمَكَانُ لِلَّعِبِ وَالرَّاحَةِ؟','park',['park','hospital','road','bridge'],'الْحَدِيقَةُ لِلَّعِبِ.'),
  q('medium-14','medium','weather','مَاذَا نَسْتَخْدِمُ لِلْحِمَايَةِ مِنَ الْمَطَرِ؟','umbrella',['umbrella','cloudy','helmet','lifebuoy'],'الْمِظَلَّةُ تَحْمِينَا.'),
  q('medium-15','medium','safety','مَاذَا نَرْبِطُ دَاخِلَ السَّيَّارَةِ؟','seatbelt',['seatbelt','helmet','warning','crosswalk'],'حِزَامُ الْأَمَانِ.'),
  q('medium-16','medium','shapes','أَيُّ شَكْلٍ لَهُ أَرْبَعَةُ أَضْلَاعٍ مُتَسَاوِيَةٍ؟','square',['square','triangle','circle','oval'],'الْمُرَبَّعُ.'),
  q('medium-17','medium','plants','أَيُّ جُزْءٍ يَحْمِلُ الْأَوْرَاقَ وَالْأَزْهَارَ؟','stem',['stem','root','fruit','seed'],'السَّاقُ.'),
  q('medium-18','medium','transport','أَيُّ وَسِيلَةٍ تُقْلِعُ وَتَهْبِطُ فِي الْمَطَارِ؟','airplane',['airplane','taxi','train','boat'],'الطَّائِرَةُ.'),
  q('medium-19','medium','jobs','مَنْ يَصْنَعُ الْأَشْيَاءَ مِنَ الْخَشَبِ؟','carpenter',['carpenter','doctor','pilot','baker'],'النَّجَّارُ.'),
  q('medium-20','medium','food','أَيُّ طَعَامٍ يَأْتِي مِنْ شَجَرَةِ النَّخِيلِ؟','dates',['dates','cheese','milk','egg'],'التَّمْرُ.'),
  q('medium-21','medium','nature','مَا الَّذِي يَتَحَرَّكُ فِي الْهَوَاءِ وَلَا نَرَاهُ؟','wind',['wind','mountain','flower','river'],'الرِّيَاحُ.'),
  q('medium-22','medium','body','أَيُّ جُزْءٍ نُمْسِكُ بِهِ الْقَلَمَ؟','hand',['hand','foot','hair','ear'],'الْيَدُ.'),
  q('medium-23','medium','city','مَا الَّذِي يُنَظِّمُ حَرَكَةَ السَّيَّارَاتِ؟','trafficlight',['trafficlight','library','market','building'],'إِشَارَةُ الْمُرُورِ.'),
  q('medium-24','medium','school','أَيْنَ نَجِدُ الْكَثِيرَ مِنَ الْكُتُبِ؟','library',['library','playground','hospital','road'],'الْمَكْتَبَةُ.'),
  q('medium-25','medium','safety','أَيْنَ نَعْبُرُ الطَّرِيقَ بِأَمَانٍ؟','crosswalk',['crosswalk','road','market','bridge'],'مَمَرُّ الْمُشَاةِ.'),
  // ——— إضافات جديدة للمتوسط ———
  q('medium-26','medium','time','مَا الْوَحْدَةُ الَّتِي تُمَثِّلُ سَبْعَةَ أَيَّامٍ؟','week',['week','day','month','year'],'الْأُسْبُوعُ = ٧ أَيَّامٍ.'),
  q('medium-27','medium','time','مَا الْوَحْدَةُ الَّتِي تُمَثِّلُ اثْنَيْ عَشَرَ شَهْرًا؟','year',['year','month','week','day'],'السَّنَةُ = ١٢ شَهْرًا.'),
  q('medium-29','medium','animals','أَيُّ حَيَوَانٍ لَهُ ثَمَانِيَةُ أَذْرُعٍ؟','octopus',['octopus','whale','shark','crab'],'الْأَخْطَبُوطُ.'),
  q('medium-30','medium','plants','مَا الَّذِي يَحْتَاجُهُ النَّبَاتُ لِيَنْمُوَ؟','rain',['rain','mountain','star','cloud'],'الْمَاءُ مِنَ الْمَطَرِ.'),

  // ═══════════════════════════════════════════════
  // صعب — 30 سؤالاً (مع تلميحات)
  // ═══════════════════════════════════════════════
  q('hard-01','hard','home','تَسْتَعِدُّ لِلنَّوْمِ. أَيُّ شَيْءٍ تَحْتَاجُهُ أَكْثَرَ؟','bed',['bed','table','tv','window'],'السَّرِيرُ لِلنَّوْمِ.',undefined,'فَكِّرْ فِي مَكَانِ النَّوْمِ.'),
  q('hard-02','hard','colors','تُفَّاحَةٌ حَمْرَاءُ وَمَوْزَةٌ صَفْرَاءُ. أَيُّ لَوْنٍ غَيْرُ مَوْجُودٍ؟','blue',['blue','red','yellow','orange'],'الْأَحْمَرُ وَالْأَصْفَرُ مَوْجُودَانِ.',undefined,'اللَّوْنُ الْمَذْكُورُ فِي التُّفَّاحَةِ وَالْمَوْزَةِ فَقَطْ.'),
  q('hard-03','hard','transport','أَيُّ خِيَارٍ يَطِيرُ؟','airplane',['airplane','train','bus','bicycle'],'الطَّائِرَةُ تَطِيرُ.',undefined,'انْظُرْ لِلْأَعْلَى.'),
  q('hard-04','hard','farm','أَيُّ حَيَوَانٍ لَيْسَ طَائِرًا؟','goat',['goat','duck','chicken','rooster'],'الْمَاعِزُ ثَدْيِيٌّ.',undefined,'الطَّائِرُ لَهُ رِيشٌ وَمِنْقَارٌ.'),
  q('hard-05','hard','animals','أَيُّ حَيَوَانٍ يَعِيشُ فِي الْبَحْرِ؟','dolphin',['dolphin','tiger','fox','deer'],'الدُّلْفِينُ بَحْرِيٌّ.',undefined,'يَسْبَحُ وَلَا يَمْشِي.'),
  q('hard-06','hard','food','أَيُّهَا لَيْسَ طَعَامًا صَلْبًا؟','milk',['milk','bread','cheese','rice'],'الْحَلِيبُ سَائِلٌ.',undefined,'يُشْرَبُ وَلَا يُمْضَغُ.'),
  q('hard-07','hard','clothes','يَوْمٌ مُمْطِرٌ وَبَارِدٌ. أَيُّ قِطْعَةٍ أَنْسَبُ؟','coat',['coat','sandals','scarf','tshirt'],'الْمِعْطَفُ لِلْبَرْدِ وَالْمَطَرِ.',undefined,'يَحْمِي الْجِسْمَ كُلَّهُ.'),
  q('hard-08','hard','nature','مَا الَّذِي يَحْتَاجُهُ النَّبَاتُ مِنَ السَّمَاءِ؟','rain',['rain','mountain','star','cloud'],'الْمَطَرُ مَاءٌ.',undefined,'يَنْزِلُ مِنَ السَّمَاءِ.'),
  q('hard-09','hard','school','تُرِيدُ قَصَّ وَرَقَةٍ. أَيُّ أَدَاةٍ؟','scissors',['scissors','ruler','eraser','book'],'الْمِقَصُّ لِلْقَصِّ.',undefined,'لَهُ نَصْلَانِ.'),
  q('hard-10','hard','jobs','مَنْ يَعْمَلُ مَعَ الْحَاسُوبِ وَالْبَرَامِجِ؟','programmer',['programmer','farmer','chef','firefighter'],'الْمُبَرْمِجُ.',undefined,'يَكْتُبُ أَكْوَادًا.'),
  q('hard-11','hard','body','تَسْمَعُ صَوْتًا دُونَ رُؤْيَتِهِ. أَيُّ عُضْوٍ؟','ear',['ear','eye','hand','foot'],'الْأُذُنُ لِلسَّمْعِ.',undefined,'عُضْوُ السَّمْعِ.'),
  q('hard-12','hard','city','تُرِيدُ عُبُورَ الطَّرِيقِ. أَيْنَ تَذْهَبُ؟','crosswalk',['crosswalk','hospital','library','market'],'مَمَرُّ الْمُشَاةِ.',undefined,'خُطُوطٌ بَيْضَاءُ عَلَى الطَّرِيقِ.'),
  q('hard-13','hard','weather','السَّمَاءُ مُلْبَدَّةٌ وَالْمَطَرُ يَنْزِلُ. الطَّقْسُ؟','rainy',['rainy','sunny','snowy','windy'],'مُمْطِرٌ.',undefined,'الْمَاءُ يَنْزِلُ.'),
  q('hard-14','hard','safety','رَاكِبُ دَرَّاجَةٍ يُرِيدُ حِمَايَةَ رَأْسِهِ؟','helmet',['helmet','seatbelt','umbrella','plate'],'الْخُوذَةُ.',undefined,'تُوضَعُ عَلَى الرَّأْسِ.'),
  q('hard-15','hard','shapes','شَكْلٌ بِأَرْبَعَةِ أَضْلَاعٍ غَيْرِ مُتَسَاوِيَةٍ؟','rectangle',['rectangle','triangle','circle','square'],'الْمُسْتَطِيلُ.',undefined,'ضِلْعَانِ أَطْوَلُ مِنَ الْآخَرَيْنِ.'),
  q('hard-16','hard','plants','جُزْءٌ تَحْتَ الْأَرْضِ وَآخَرُ يَحْمِلُ الْأَوْرَاقَ. مَا تَحْتَ الْأَرْضِ؟','root',['root','flower2','leaf2','fruit'],'الْجِذْرُ.',undefined,'يَخْتَبِئُ فِي التُّرْبَةِ.'),
  q('hard-17','hard','home','وَضَعْتَ الطَّعَامَ عَلَى شَيْءٍ ثُمَّ جَلَسْتَ عَلَى آخَرَ. الْأَوَّلُ؟','table',['table','bed','pillow','lamp'],'الطَّاوِلَةُ.',undefined,'نَضَعُ عَلَيْهِ الطَّعَامَ.'),
  q('hard-18','hard','transport','عُبُورُ الْبَحْرِ دُونَ طَيَرَانٍ؟','ship',['ship','airplane','subway','bicycle'],'السَّفِينَةُ.',undefined,'تَسِيرُ فِي الْمَاءِ.'),
  q('hard-19','hard','jobs','مَنْ يَخْبِزُ الْخُبْزَ؟','baker',['baker','doctor','pilot','engineer'],'الْخَبَّازُ.',undefined,'يَسْتَخْدِمُ الْفُرْنَ وَالدَّقِيقَ.'),
  q('hard-20','hard','food','أَيٌّ مِنْهَا لَيْسَ فَاكِهَةً؟','bread',['bread','apple','banana','grape'],'الْخُبْزُ لَيْسَ فَاكِهَةً.',undefined,'يُصْنَعُ مِنَ الدَّقِيقِ.'),
  q('hard-21','hard','nature','مَا نَرَاهُ لَيْلًا فِي السَّمَاءِ؟','moon',['moon','river','mountain','forest'],'الْقَمَرُ.',undefined,'يَظْهَرُ مَعَ النُّجُومِ.'),
  q('hard-22','hard','body','لِلْمَشْيِ لِلْأَمَامِ، أَيُّ جُزْءٍ؟','foot',['foot','eye','ear','mouth'],'الْقَدَمُ.',undefined,'عُضْوٌ أَسْفَلَ السَّاقِ.'),
  q('hard-23','hard','school','لِمَعْرِفَةِ طُولِ خَطٍّ، أَيُّ أَدَاةٍ؟','ruler',['ruler','pen','book','bag'],'الْمِسْطَرَةُ.',undefined,'لَهَا أَرْقَامٌ.'),
  q('hard-24','hard','city','لِشِرَاءِ شَيْءٍ مِنَ الْمَدِينَةِ، أَيْنَ؟','market',['market','library','road','trafficlight'],'السُّوقُ.',undefined,'مَكَانُ الْبَيْعِ وَالشِّرَاءِ.'),
  q('hard-25','hard','safety','خَطَرٌ مُحْتَمَلٌ وَتُرِيدُ تَنْبِيهَ الْآخَرِينَ؟','warning',['warning','stop','helmet','lifebuoy'],'التَّحْذِيرُ.',undefined,'مُثَلَّثٌ أَصْفَرُ.'),
  // ——— إضافات جديدة للصعب ———
  q('hard-26','hard','time','إِذَا كَانَ الْيَوْمُ الثُّلَاثَاءَ، فَمَا بَعْدَ غَدٍ؟','thursday',['thursday','wednesday','friday','monday'],'بَعْدَ الثُّلَاثَاءِ يَأْتِي الْأَرْبِعَاءُ ثُمَّ الْخَمِيسُ.',undefined,'امْشِ خُطْوَتَيْنِ فِي الْأُسْبُوعِ.'),
  q('hard-27','hard','time','مَا الَّذِي يَأْتِي قَبْلَ الظُّهْرِ؟','morning',['morning','evening','night','noon'],'الصَّبَاحُ قَبْلَ الظُّهْرِ.',undefined,'يَبْدَأُ بِهِ الْيَوْمُ.'),
  q('hard-28','hard','weather','فِي أَيِّ فَصْلٍ تَتَفَتَّحُ الْأَزْهَارُ؟','spring',['spring','autumn','winter','summer'],'الرَّبِيعُ.',undefined,'فَصْلُ الْجَمَالِ وَالِاعْتِدَالِ.'),
  q('hard-29','hard','animals','أَيُّ حَيَوَانٍ لَيْسَتْ لَهُ أَرْجُلٌ؟','fish',['fish','crab','ant','spider'],'السَّمَكَةُ تَسْبَحُ.',undefined,'يَعِيشُ فِي الْمَاءِ.'),
  q('hard-30','hard','weather','مَا الَّذِي نَسْمَعُهُ بَعْدَ الْبَرْقِ؟','thunder',['thunder','fog','dew','rain'],'الرَّعْدُ.',undefined,'صَوْتٌ قَوِيٌّ فِي السَّمَاءِ.'),
]
// ——— فهرس العناصر ———
const itemIndex = new Map<string, DiscoverItem>()
for (const world of DISCOVER_WORLDS) {
  for (const item of world.items) {
    itemIndex.set(`${world.id}:${item.id}`, item)
    itemIndex.set(item.id, item)
  }
}

export function getDiscoverQuizQuestionItems(question: DiscoverQuizQuestion): DiscoverItem[] {
  return question.optionIds
    .map((id) => itemIndex.get(`${question.worldId}:${id}`) ?? itemIndex.get(id))
    .filter((item): item is DiscoverItem => Boolean(item))
}

export function getDiscoverQuestionsByLevel(level: DiscoverTestLevel): DiscoverQuizQuestion[] {
  return DISCOVER_QUIZ_QUESTIONS.filter((q) => q.level === level)
}

export function getDiscoverTestLevelCount(level: DiscoverTestLevel): number {
  return getDiscoverQuestionsByLevel(level).length
}