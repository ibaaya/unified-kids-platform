import type {
  CollectItemDef,
  GameMeta,
  MatchPairDef,
  MemoryPairDef,
  OrderGameDef,
  PicturePuzzleDef,
  ScenarioDef,
} from './types';
import { worshipLessons } from './worship';
import { islamPillars, imanPillars } from './islamPillars';

// =====================================================
// بيانات الألعاب - لإضافة لعبة أو مرحلة عدّل هَذَا الملف فقط
// =====================================================

const lessonItems = (lessonId: string, from = 0, to?: number) => {
  const lesson = worshipLessons.find((l) => l.id === lessonId);
  return (lesson ? lesson.steps.slice(from, to) : []).map((s) => ({ id: s.id, text: s.title }));
};

// ─── ألعاب الترتيب ───
export const orderGames: Record<string, OrderGameDef> = {
  game_wudu_order: {
    id: 'game_wudu_order',
    prompt: 'رَتِّب خُطُواتِ الوُضوءِ مِنَ الأُولى إِلى الأَخيرَة',
    items: lessonItems('wudu_01'),
  },
  game_prayer_order: {
    id: 'game_prayer_order',
    prompt: 'رَتِّب خُطُواتِ الصَّلاةِ مِنَ البِدايَةِ إِلى النِّهايَة',
    items: lessonItems('prayer_01', 1, 8),
  },
  game_islam_pillars: {
    id: 'game_islam_pillars',
    prompt: 'رَتِّب أَركانَ الإِسلامِ الخَمسَة',
    items: islamPillars.map((p) => ({ id: p.id, text: p.title })),
  },
  game_iman_pillars: {
    id: 'game_iman_pillars',
    prompt: 'رَتِّب أَركانَ الإِيمانِ السِّتَّة',
    items: imanPillars.map((p) => ({ id: p.id, text: p.title })),
  },
};

// ─── المَوَاقِف: مَاذَا أفعل؟ / أكمل القصة ───
const whatDoIDo: ScenarioDef[] = [
  { id: 'sc_01', situation: 'وَجَدتَ قَلَماً في الفَصلِ وَلا تَعرِفُ صاحِبَه', options: ['آخُذُهُ لِنَفسي', 'أُعطيهِ لِلمُعَلِّمَة', 'أَترُكُهُ وَأَذهَب'], correctIndex: 1, explanation: 'الأَمينُ يُعطي ما يَجِدُهُ لِلمُعَلِّمَةِ لِتُعيدَهُ لِصاحِبِه.' },
  { id: 'sc_02', situation: 'صَديقُكَ حَزينٌ جِدّاً', options: ['أَتَجاهَلُه', 'أَجلِسُ مَعَهُ وَأَسأَلُهُ عَن حالِه', 'أَضحَكُ مِنهُ'], correctIndex: 1, explanation: 'الرَّحيمُ يَقِفُ مَعَ صَديقِهِ عِندَ الحُزن.' },
  { id: 'sc_03', situation: 'أَعطاكَ أَحَدٌ هَدِيَّة', options: ['آخُذُها وَلا أَقولُ شَيئاً', 'أَقولُ: شُكراً جَزيلاً', 'أَرمي الهَدِيَّة'], correctIndex: 1, explanation: 'نَقولُ شُكراً لِكُلِّ مَن يُعطينا شَيئاً.' },
  { id: 'sc_04', situation: 'أَخطَأتَ في حَقِّ أَخيك', options: ['أَهرُب', 'أَقولُ: أَنا آسِف يا أَخي', 'أَلومُهُ هُوَ'], correctIndex: 1, explanation: 'الاِعتِذارُ شَجاعَةٌ جَميلَة.' },
  { id: 'sc_05', situation: 'أُمُّكَ تَحمِلُ أَشياءَ كَثيرَة', options: ['أُكمِلُ لَعِبي', 'أَقولُ: أَنا مَشغول', 'أَقومُ وَأُساعِدُها'], correctIndex: 2, explanation: 'مُساعَدَةُ الأُمِّ مِن أَجمَلِ الأَخلاق.' },
  { id: 'sc_06', situation: 'حانَ وَقتُ الأَكل', options: ['أَقولُ: بِسمِ اللَّه، وَآكُلُ بِيَميني', 'آكُلُ وَأَنا أَركُض', 'آكُلُ بِسُرعَةٍ كَبيرَة'], correctIndex: 0, explanation: 'نَبدَأُ الأَكلَ بِاسمِ اللَّه وَنَأكُلُ بِاليَمين.' },
  { id: 'sc_07', situation: 'قابَلتَ جارَكَ في الطَّريق', options: ['أَقولُ: السَّلامُ عَلَيكُم', 'أُديرُ وَجهي', 'أَركُضُ بَعيداً'], correctIndex: 0, explanation: 'السَّلامُ تَحِيَّةُ الإِسلامِ الجَميلَة.' },
  { id: 'sc_08', situation: 'بابُ غُرفَةِ والِدَيكَ مُغلَق', options: ['أَفتَحُهُ فَوراً', 'أَطرُقُ البابَ وَأَنتَظِرُ الإِذن', 'أَصرُخُ لِيَفتَحوا'], correctIndex: 1, explanation: 'نَستَأذِنُ قَبلَ الدُّخول.' },
];

const completeStory: ScenarioDef[] = [
  { id: 'cs_01', situation: 'كانَ عُمَرُ يَلعَبُ مَعَ أَخيهِ فَخَسِر. مَاذَا فَعَل؟', options: ['تَنَفَّسَ وَقالَ: سَأُحاوِلُ مَرَّةً أُخرى', 'رَمى اللُّعبَةَ وَبَكى', 'تَشاجَرَ مَعَ أَخيه'], correctIndex: 0, explanation: 'هَذا هُوَ الصَّبرُ الجَميل.' },
  { id: 'cs_02', situation: 'وَجَدَت سَلمى مَحفَظَةً في الحَديقَة. مَاذَا فَعَلَت؟', options: ['أَخَذَتها لِنَفسِها', 'أَعطَتها لِأُمِّها لِتُعيدَها لِصاحِبِها', 'أَخفَتها'], correctIndex: 1, explanation: 'الأَمينَةُ تَرُدُّ ما لَيسَ لَها.' },
  { id: 'cs_03', situation: 'كَسَرَ سالِمٌ كوباً بِالخَطَأ ثُمَّ جاءَت أُمُّه. مَاذَا قَالَ؟', options: ['قالَ لَها الحَقيقَة', 'قالَ: لَم أَفعَل شَيئاً', 'هَرَبَ مِنَ البَيت'], correctIndex: 0, explanation: 'الصِّدقُ يُريحُ القَلب.' },
  { id: 'cs_04', situation: 'لَم تَجِد رَنا مَن يَلعَبُ مَعَها، فَجاءَت سَلمى. مَاذَا قالَت رَنا؟', options: ['تَعالَي نَلعَبُ مَعاً', 'اِذهَبي بَعيداً', 'لا شَيء'], correctIndex: 0, explanation: 'التَّعاوُنُ يَجعَلُنا أَسعَد.' },
];

export const scenarioSets: Record<string, ScenarioDef[]> = {
  what_do_i_do: whatDoIDo,
  complete_story: completeStory,
  moral_challenge: [...whatDoIDo, ...completeStory],
};

// ─── المطابقة: القيمة ← التصرف ───
export const matchPairs: MatchPairDef[] = [
  { id: 'm1', left: 'الصِّدق', right: 'نَقولُ الحَقيقَةَ دائِماً' },
  { id: 'm2', left: 'الأَمانَة', right: 'نَرُدُّ ما أُعطيناه' },
  { id: 'm3', left: 'الرَّحمَة', right: 'نُساعِدُ مَن يَحزَن' },
  { id: 'm4', left: 'الصَّبر', right: 'لا نَغضَبُ عِندَ الخَسارَة' },
  { id: 'm5', left: 'الشُّكر', right: 'نَقولُ: شُكراً لِمَن يُساعِدُنا' },
  { id: 'm6', left: 'التَّعاوُن', right: 'نَعمَلُ مَعاً لِنَنجَح' },
];

// ─── بطاقات الذاكرة ───
export const memoryPairs: MemoryPairDef[] = [
  { id: 'mem1', label: 'الصِّدق', icon: '✨' },
  { id: 'mem2', label: 'الأَمانَة', icon: '🔐' },
  { id: 'mem3', label: 'الرَّحمَة', icon: '❤️' },
  { id: 'mem4', label: 'الصَّبر', icon: '🌟' },
  { id: 'mem5', label: 'الشُّكر', icon: '🙏' },
  { id: 'mem6', label: 'التَّعاوُن', icon: '🤝' },
];

// ─── ألغاز الصور (رسومات SVG برمجية) ───
export const picturePuzzles: PicturePuzzleDef[] = [
  { id: 'pz_sharing', scene: 'sharing', question: 'مَاذَا يَفعَلُ الطِّفلان؟', options: ['يَتَشارَكان الحَلوى', 'يَتَشاجَران', 'يَصرُخَان'], correctIndex: 0, explanation: 'المُشارَكَةُ تَجعَلُنا نَفرَحُ مَعاً.' },
  { id: 'pz_helping', scene: 'helping', question: 'كَيفَ تَبَرُّ البِنتُ والِدَتَها؟', options: ['تَلعَبُ وَحدَها', 'تَحمِلُ السَّلَّةَ وَتُساعِدُها', 'تَهرُب'], correctIndex: 1, explanation: 'مُساعَدَةُ الأُمِّ مِن بِرِّ الوالِدَين.' },
  { id: 'pz_washing', scene: 'washing', question: 'ما الأَدَبُ في هَذِهِ الصّورَة؟', options: ['اللَّعِبُ بِالماء', 'غَسلُ اليَدَين لِلنَّظافَة', 'إِغلاقُ الحَنَفِيَّة وَالتَّرك'], correctIndex: 1, explanation: 'نَغسِلُ أَيدِيَنا لِنَبقى نَظيفين.' },
  { id: 'pz_greeting', scene: 'greeting', question: 'مَاذَا يَقولُ الوَلَدُ لِصَديقِه؟', options: ['السَّلامُ عَلَيكُم', 'لا شَيء', 'اِذهَب'], correctIndex: 0, explanation: 'نَبدَأُ اللِّقاءَ بِالسَّلام.' },
  { id: 'pz_mosque', scene: 'mosque', question: 'كَيفَ نَتَصَرَّفُ في المَسجِد؟', options: ['نَركُضُ وَنَصرُخ', 'نَتَكَلَّمُ بِهُدوء', 'نَلعَبُ بِالكُرَة'], correctIndex: 1, explanation: 'المَسجِدُ بَيتُ اللَّه، نَدخُلُهُ بِهُدوءٍ وَأَدَب.' },
  { id: 'pz_thanks', scene: 'thanks', question: 'مَاذَا تَقولُ البِنتُ بَعدَ أَن أَخَذَت الهَدِيَّة؟', options: ['شُكراً لَك', 'لا أُريدُها', 'لا شَيء'], correctIndex: 0, explanation: 'نَشكُرُ كُلَّ مَن يُعطينا.' },
];

// ─── اجمع الخير ───
export const collectItems: CollectItemDef[] = [
  { id: 'c1', text: 'أَقولُ السَّلامُ عَلَيكُم', icon: '👋', good: true },
  { id: 'c2', text: 'أُساعِدُ أُمّي', icon: '🧺', good: true },
  { id: 'c3', text: 'أَقولُ الحَقيقَة', icon: '✨', good: true },
  { id: 'c4', text: 'أُشارِكُ لُعبَتي', icon: '🧸', good: true },
  { id: 'c5', text: 'أَشكُرُ مَن يُساعِدُني', icon: '🙏', good: true },
  { id: 'c6', text: 'أُرَتِّبُ غُرفَتي', icon: '🛏️', good: true },
  { id: 'c7', text: 'أَقولُ بِسمِ اللَّه قَبلَ الأَكل', icon: '🍽️', good: true },
  { id: 'c8', text: 'أَعتَذِرُ إِذا أَخطَأت', icon: '🕊️', good: true },
  { id: 'c9', text: 'أَصرُخُ في وَجهِ صَديقي', icon: '😠', good: false },
  { id: 'c10', text: 'آخُذُ ما لَيسَ لي', icon: '🚫', good: false },
  { id: 'c11', text: 'أَرمي القُمامَةَ في الشّارِع', icon: '🗑️', good: false },
  { id: 'c12', text: 'أُقاطِعُ مَن يَتَكَلَّم', icon: '🙉', good: false },
];

// ─── فهرس الألعاب ───
export const gameCatalog: GameMeta[] = [
  { id: 'game_scenarios', kind: 'scenario', dataId: 'what_do_i_do', title: 'مَاذَا أَفعَل؟', desc: 'مَوقِفٌ وَثَلاثَةُ اخْتِيارات', icon: '🎯', color: '#FF9800' },
  { id: 'game_picture', kind: 'picture', title: 'أَينَ التَّصَرُّفُ الصَّحيح؟', desc: 'أَلغازُ الصُّوَر', icon: '🔎', color: '#009688' },
  { id: 'game_complete_story', kind: 'scenario', dataId: 'complete_story', title: 'أَكمِلِ القِصَّة', desc: 'اخْتَر التَّصَرُّفَ المُناسِب', icon: '🧠', color: '#9C27B0' },
  { id: 'game_collect', kind: 'collect', title: 'اجمَعِ الخَير', desc: 'المَسِ التَّصَرُّفاتِ الجَميلَة', icon: '🎈', color: '#E91E63' },
  { id: 'game_memory', kind: 'memory', title: 'بِطاقاتُ الذّاكِرَة', desc: 'طابِق بِطاقاتِ القِيَم', icon: '🃏', color: '#4CAF50' },
  { id: 'game_match', kind: 'match', title: 'طابِقِ القِيمَةَ بِالتَّصَرُّف', desc: 'صِل كُلَّ قيمَةٍ بِفِعلِها', icon: '🧩', color: '#3F51B5' },
  { id: 'game_moral_challenge', kind: 'scenario', dataId: 'moral_challenge', title: 'تَحَدِّي الأَخلاق', desc: 'مَواقِفُ قَصيرَةٌ مُتَتابِعَة', icon: '⭐', color: '#FFC107' },
  { id: 'game_wudu_order', kind: 'order', dataId: 'game_wudu_order', title: 'تَحَدِّي الوُضوء', desc: 'رَتِّب خُطُواتِ الوُضوء', icon: '💧', color: '#2196F3' },
  { id: 'game_prayer_order', kind: 'order', dataId: 'game_prayer_order', title: 'رَتِّبِ الصَّلاة', desc: 'خُطُواتُ الصَّلاةِ بِالتَّرتيب', icon: '🕌', color: '#00897B' },
  { id: 'game_islam_pillars', kind: 'order', dataId: 'game_islam_pillars', title: 'تَحَدِّي أَركانِ الإِسلام', desc: 'رَتِّب الأَركانَ الخَمسَة', icon: '☪️', color: '#4CAF50' },
  { id: 'game_iman_pillars', kind: 'order', dataId: 'game_iman_pillars', title: 'تَحَدِّي أَركانِ الإِيمان', desc: 'رَتِّب الأَركانَ السِّتَّة', icon: '🌙', color: '#673AB7' },
];
