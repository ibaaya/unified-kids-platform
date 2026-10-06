/**
 * discoverQuizData.ts — بنك الاختبار الشامل لقسم «اكتشف ما حولك»
 *
 * ملاحظات:
 * - 3 مستويات: سهل → متوسط → صعب.
 * - كل مستوى يحتوي 25 سؤالاً مستقلاً.
 * - لا يعاد استخدام السؤال نفسه بين المستويات.
 * - الخيارات محددة لكل سؤال حتى لا تعتمد جودة الاختبار على العشوائية.
 * - لإضافة سؤال: أضف كائناً جديداً إلى المستوى المناسب، مع id فريد.
 */
import type { DiscoverItem } from './discoverData.ts'
import { DISCOVER_WORLDS } from './discoverData.ts'

export type DiscoverTestLevel = 'easy' | 'medium' | 'hard'

export interface DiscoverQuizQuestion {
  id: string
  level: DiscoverTestLevel
  worldId: string
  prompt: string
  correctId: string
  optionIds: string[]
  /** معلومة قصيرة تظهر بعد الإجابة */
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
): DiscoverQuizQuestion => ({
  id, level, worldId, prompt, correctId, optionIds, explanation,
})

export const DISCOVER_QUIZ_QUESTIONS: DiscoverQuizQuestion[] = [
  // ═══════════════════════════════════════════════
  // سهل — تعرف، تسمّي، وتطابق المعلومة المباشرة
  // ═══════════════════════════════════════════════
  q('easy-01','easy','home','أين ننام؟','bed',['bed','sofa','table','chair'],'ننام على السرير.'),
  q('easy-02','easy','colors','أي لون يشبه لون العشب؟','green',['green','red','purple','black'],'العشب غالبًا أخضر.'),
  q('easy-03','easy','transport','أي وسيلة تطير في السماء؟','airplane',['airplane','bus','train','bicycle'],'الطائرة تطير في السماء.'),
  q('easy-04','easy','farm','أي حيوان يعطينا الحليب؟','cow',['cow','rabbit','rooster','horse'],'البقرة من الحيوانات التي تعطينا الحليب.'),
  q('easy-05','easy','animals','من هو ملك الحيوانات في القصص المشهورة؟','lion',['lion','rabbit2','fish','turtle'],'الأسد يُسمّى ملك الحيوانات في كثير من القصص.'),
  q('easy-06','easy','food','أي من هذه فاكهة صفراء؟','banana',['banana','apple','grape','bread'],'الموز لونه أصفر عادةً.'),
  q('easy-07','easy','clothes','ماذا نلبس في القدم؟','shoes',['shoes','hat','shirt','coat'],'نلبس الحذاء في القدم.'),
  q('easy-08','easy','nature','ما الذي يضيء لنا في النهار؟','sun',['sun','moon','star','cloud'],'الشمس تضيء لنا في النهار.'),
  q('easy-09','easy','school','بماذا نكتب في المدرسة؟','pen',['pen','ruler','eraser','bag'],'نستخدم القلم للكتابة.'),
  q('easy-10','easy','jobs','من يعالج المرضى؟','doctor',['doctor','pilot','chef','farmer'],'الطبيب يعالج المرضى.'),
  q('easy-11','easy','body','بماذا نرى؟','eye',['eye','ear','nose','hand'],'نرى بالعين.'),
  q('easy-12','easy','city','أين نذهب للعلاج؟','hospital',['hospital','park','market','library'],'المستشفى مكان للعلاج.'),
  q('easy-13','easy','weather','في أي طقس ينزل المطر؟','rainy',['rainy','sunny','snowy','windy'],'الطقس الممطر يكون فيه المطر.'),
  q('easy-14','easy','safety','ماذا نضع على الرأس لحمايته؟','helmet',['helmet','seatbelt','lifebuoy','warning'],'الخوذة تحمي الرأس.'),
  q('easy-15','easy','shapes','أي شكل ليس له زوايا؟','circle',['circle','triangle','square','rectangle'],'الدائرة مستديرة بلا زوايا.'),
  q('easy-16','easy','plants','أي جزء من النبات يكون تحت التربة غالبًا؟','root',['root','flower2','leaf2','fruit'],'الجذر يمتد تحت التربة.'),
  q('easy-17','easy','home','بماذا نرى صورتنا؟','mirror',['mirror','lamp','fridge','clock'],'نرى انعكاسنا في المرآة.'),
  q('easy-18','easy','transport','أي وسيلة تسير على سكة حديد؟','train',['train','car','boat','helicopter'],'القطار يسير على سكة الحديد.'),
  q('easy-19','easy','farm','أي طائر يصيح في الصباح؟','rooster',['rooster','duck','cow','sheep'],'الديك معروف بصياحه في الصباح.'),
  q('easy-20','easy','food','أي شراب أبيض نشربه؟','milk',['milk','water','honey','bread'],'الحليب شراب أبيض غالبًا.'),
  q('easy-21','easy','school','أين نحمل كتبنا؟','bag',['bag','board','ruler','book'],'نضع الكتب في الحقيبة.'),
  q('easy-22','easy','jobs','من يطفئ الحرائق؟','firefighter',['firefighter','engineer','teacher2','artist'],'رجل الإطفاء يساعد في إخماد الحرائق.'),
  q('easy-23','easy','body','بماذا نسمع الأصوات؟','ear',['ear','eye','mouth','foot'],'نسمع بالأذن.'),
  q('easy-24','easy','nature','ما الذي نراه في السماء ليلًا؟','moon',['moon','sun','grass','river'],'نرى القمر في السماء ليلًا.'),
  q('easy-25','easy','shapes','أي شكل له ثلاثة أضلاع؟','triangle',['triangle','circle','square','oval'],'المثلث له ثلاثة أضلاع.'),

  // ═══════════════════════════════════════════════
  // متوسط — وظيفة، تصنيف، مكان، واختيار يعتمد على أكثر من معلومة
  // ═══════════════════════════════════════════════
  q('medium-01','medium','home','أي شيء يساعدنا على معرفة الوقت؟','clock',['clock','pillow','carpet','plate'],'الساعة تخبرنا بالوقت.'),
  q('medium-02','medium','home','أين نضع الملابس المرتبة؟','closet',['closet','fridge','kitchen','window'],'الخزانة مناسبة لحفظ الملابس.'),
  q('medium-03','medium','colors','أي لون ينتج عادةً عند خلط الأصفر والأحمر؟','orange',['orange','green','blue','black'],'الأصفر مع الأحمر يعطي البرتقالي في مزج الألوان.'),
  q('medium-04','medium','transport','أي وسيلة تناسب السفر في الماء؟','boat',['boat','subway','scooter','airplane'],'القارب وسيلة للنقل في الماء.'),
  q('medium-05','medium','farm','أي شيء يساعد المزارع على العمل في الحقل؟','tractor',['tractor','pillow','school2','lamp'],'الجرار الزراعي يساعد في أعمال الحقل.'),
  q('medium-06','medium','animals','أي حيوان يعيش في الماء ويُعرف بذكائه؟','dolphin',['dolphin','giraffe','horse','cat'],'الدلفين حيوان بحري ذكي.'),
  q('medium-07','medium','food','أي طعام يمكن أن نحصل عليه من النحل؟','honey',['honey','rice','cheese','bread'],'النحل ينتج العسل.'),
  q('medium-08','medium','clothes','ماذا نلبس غالبًا عندما يكون الجو باردًا؟','coat',['coat','sandals','tshirt','hat'],'المعطف يساعد على الدفء.'),
  q('medium-09','medium','nature','ما الذي قد يظهر بعد المطر بألوان متعددة؟','rainbow',['rainbow','mountain','seed','wind'],'قد يظهر قوس قزح بعد المطر.'),
  q('medium-10','medium','school','ما الأداة التي تساعدنا على رسم خط مستقيم؟','ruler',['ruler','eraser','scissors','glue'],'المسطرة تساعدنا على رسم خطوط مستقيمة.'),
  q('medium-11','medium','jobs','من يعالج أسناننا؟','dentist',['dentist','nurse','pilot','carpenter'],'طبيب الأسنان يهتم بالأسنان.'),
  q('medium-12','medium','body','أي عضو يساعدنا على مضغ الطعام؟','teeth',['teeth','ear','leg','hair'],'الأسنان تساعد على مضغ الطعام.'),
  q('medium-13','medium','city','ما المكان المناسب للعب والراحة بين الأشجار؟','park',['park','hospital','road','bridge'],'الحديقة مكان للعب والراحة.'),
  q('medium-14','medium','weather','ماذا نستخدم لحمايتنا من المطر؟','umbrella',['umbrella','cloudy','helmet','lifebuoy'],'المظلة تساعد على الحماية من المطر.'),
  q('medium-15','medium','safety','ماذا نربط داخل السيارة لحماية الراكب؟','seatbelt',['seatbelt','helmet','warning','crosswalk'],'حزام الأمان يُربط داخل السيارة.'),
  q('medium-16','medium','shapes','أي شكل له أربعة أضلاع متساوية؟','square',['square','triangle','circle','oval'],'المربع له أربعة أضلاع متساوية.'),
  q('medium-17','medium','plants','أي جزء يحمل الأوراق والأزهار؟','stem',['stem','root','fruit','seed'],'الساق تحمل الأوراق والأزهار.'),
  q('medium-18','medium','transport','أي وسيلة يمكنها الإقلاع والهبوط في المطار؟','airplane',['airplane','taxi','train','boat'],'الطائرة تستخدم المطار للإقلاع والهبوط.'),
  q('medium-19','medium','jobs','من يصنع الأشياء من الخشب؟','carpenter',['carpenter','doctor','pilot','baker'],'النجار يعمل بالخشب.'),
  q('medium-20','medium','food','أي طعام يأتي من شجرة النخيل؟','dates',['dates','cheese','milk','egg'],'التمر ينمو على النخيل.'),
  q('medium-21','medium','nature','ما الذي يتحرك في الهواء ولا نراه عادةً؟','wind',['wind','mountain','flower','river'],'الرياح تتحرك في الهواء ولا نراها مباشرة.'),
  q('medium-22','medium','body','أي جزء من الجسم نستخدمه للإمساك بالقلم؟','hand',['hand','foot','hair','ear'],'نمسك القلم باليد.'),
  q('medium-23','medium','city','أي شيء ينظم حركة السيارات عند التقاطع؟','trafficlight',['trafficlight','library','market','building'],'إشارة المرور تنظم حركة المرور.'),
  q('medium-24','medium','school','أين يمكن أن نجد الكثير من الكتب ونقرأ بهدوء؟','library',['library','playground','hospital','road'],'المكتبة مكان للكتب والقراءة.'),
  q('medium-25','medium','safety','أين نعبر الطريق بطريقة أكثر أمانًا؟','crosswalk',['crosswalk','road','market','bridge'],'ممر المشاة مخصص لعبور الطريق.'),

  // ═══════════════════════════════════════════════
  // صعب — استنتاج، مقارنة، ربط بين أكثر من مفهوم
  // ═══════════════════════════════════════════════
  q('hard-01','hard','home','أنت تستعد للنوم. أي مجموعة تحتاجها أكثر؟','bed',['bed','table','tv','window'],'السرير هو العنصر المرتبط مباشرة بالنوم.'),
  q('hard-02','hard','colors','إذا كان لديك تفاحة حمراء وموزة صفراء، فما اللون غير الموجود في الوصف؟','blue',['blue','red','yellow','orange'],'الأحمر والأصفر مذكوران، أما الأزرق فغير موجود.'),
  q('hard-03','hard','transport','أي خيار يجمع بين وسيلة تسير على الأرض ووسيلة تطير؟','airplane',['airplane','train','bus','bicycle'],'الطائرة هي الخيار الوحيد الطائر في المجموعة.'),
  q('hard-04','hard','farm','أي حيوان من هذه المجموعة ليس طائرًا؟','goat',['goat','duck','chicken','rooster'],'الماعز حيوان ثديي، والبقية طيور.'),
  q('hard-05','hard','animals','أي حيوان من هذه المجموعة يعيش في البحر؟','dolphin',['dolphin','tiger','fox','deer'],'الدلفين يعيش في البحر.'),
  q('hard-06','hard','food','لديك خبز وجبن وحليب. أيها ليس طعامًا صلبًا؟','milk',['milk','bread','cheese','rice'],'الحليب سائل.'),
  q('hard-07','hard','clothes','خرجت في يوم ممطر وبارد. أي قطعة ملابس أنسب؟','coat',['coat','sandals','scarf','tshirt'],'المعطف هو الخيار الأنسب بين الخيارات للحماية من البرد والمطر؛ ويمكن ارتداء الوشاح أيضًا.'),
  q('hard-08','hard','nature','أي شيء يحتاجه النبات لينمو ويمكن أن يأتي من السماء؟','rain',['rain','mountain','star','cloud'],'المطر يزوّد البيئة بالماء.'),
  q('hard-09','hard','school','لديك ورقة وتريد قصها. أي أداة تختار؟','scissors',['scissors','ruler','eraser','book'],'المقص يستخدم للقص.'),
  q('hard-10','hard','jobs','من هذه المهن يعمل غالبًا مع الحاسوب والبرامج؟','programmer',['programmer','farmer','chef','firefighter'],'المبرمج يعمل على البرمجيات والحاسوب.'),
  q('hard-11','hard','body','تسمع صوتًا قريبًا دون أن تراه. أي عضو تعتمد عليه؟','ear',['ear','eye','hand','foot'],'الأذن مسؤولة عن السمع.'),
  q('hard-12','hard','city','السيارة تسير في الطريق، وأنت تريد عبوره. أين تذهب؟','crosswalk',['crosswalk','hospital','library','market'],'ممر المشاة مخصص لعبور الطريق.'),
  q('hard-13','hard','weather','السماء مليئة بالسحب وبدأ المطر بالنزول. كيف نصف الطقس؟','rainy',['rainy','sunny','snowy','windy'],'نزول المطر يعني أن الطقس ممطر.'),
  q('hard-14','hard','safety','راكب على دراجة ويريد حماية رأسه. ماذا يحتاج؟','helmet',['helmet','seatbelt','umbrella','plate'],'الخوذة تحمي الرأس أثناء ركوب الدراجة.'),
  q('hard-15','hard','shapes','لديك شكل بأربعة أضلاع، لكن ليست كلها متساوية. أي خيار قد يكون صحيحًا؟','rectangle',['rectangle','triangle','circle','square'],'المستطيل له أربعة أضلاع، ويختلف طول ضلعين عن الضلعين الآخرين عادةً.'),
  q('hard-16','hard','plants','أي جزء من النبات يوجد تحت الأرض بينما الجزء الآخر يحمل الأوراق؟','root',['root','flower2','leaf2','fruit'],'الجذر تحت التربة، والساق تحمل الأوراق.'),
  q('hard-17','hard','home','وضعت الطعام على شيء، ثم جلست على شيء آخر. ما الشيء الأول؟','table',['table','bed','pillow','lamp'],'الطاولة نضع الطعام عليها.'),
  q('hard-18','hard','transport','تريد عبور البحر دون الطيران. أي خيار مناسب؟','ship',['ship','airplane','subway','bicycle'],'السفينة وسيلة مناسبة للسفر في البحر.'),
  q('hard-19','hard','jobs','شخص يخبز الخبز، وشخص آخر يعالج المرضى. من الشخص الذي يخبز؟','baker',['baker','doctor','pilot','engineer'],'الخباز يصنع الخبز.'),
  q('hard-20','hard','food','أي خيار ليس من الفواكه في المجموعة؟','bread',['bread','apple','banana','grape'],'الخبز ليس فاكهة.'),
  q('hard-21','hard','nature','أي خيار من هذه نراه في السماء ليلًا؟','moon',['moon','river','mountain','forest'],'القمر في السماء، بينما الخيارات الأخرى في الطبيعة الأرضية.'),
  q('hard-22','hard','body','تريد المشي إلى الأمام. أي جزء نستخدمه مباشرة للمشي؟','foot',['foot','eye','ear','mouth'],'القدم جزء أساسي من المشي.'),
  q('hard-23','hard','school','تريد أن تعرف طول خط. أي أداة تساعدك على قياسه؟','ruler',['ruler','pen','book','bag'],'المسطرة للقياس والرسم، والممحاة لمسح الخطأ؛ من الخيارات المعروضة المسطرة هي أداة القياس.'),
  q('hard-24','hard','city','تريد شراء شيء من المدينة. أين تذهب؟','market',['market','library','road','trafficlight'],'السوق للشراء والمكتبة للقراءة؛ السؤال يختار أول المكانين المطلوبين.'),
  q('hard-25','hard','safety','هناك خطر محتمل وتريد تنبيه الآخرين دون الاقتراب منه. أي مفهوم يناسب الموقف؟','warning',['warning','stop','helmet','lifebuoy'],'علامة التحذير تنبه إلى خطر محتمل.'),
]

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
