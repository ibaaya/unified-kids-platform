# أخلاقي الجميلة (`src/islamic/`)

قسم عربي إسلامي مستقل داخل منصة رِحْلتي للأطفال من ٦ إلى ٨ سنوات. كل المحتوى في ملفات بيانات، والرسومات SVG برمجية، والنطق تلقائي مع زر إعادة السماع.

## الهدف
قصة ← موقف ← اختيار ← تفاعل ← تطبيق ← لعبة ← مراجعة. لا تخويف ولا عقوبات؛ عند الخطأ تُنطق عبارة مثل «حاوِل مَرَّةً أُخرى».

## الهيكل
```text
src/islamic/
├── data/          المحتوى (values, manners, worship, islamPillars, stories, culture, quizzes, badges, games, stepByStep, types)
├── engine/        islamicProgress (التقدم والشارات) · islamicSound (النطق) · useAutoSpeak · validateContent
├── components/    PageShell, StepPlayer, SpeakButton, Modal, BadgeToast, SceneArt (SVG), IslamicSvg
├── pages/         الصفحة الرئيسية + صفحة لكل عالم + الألعاب والاختبارات والشارات
├── islamicRoutes.tsx   مسارات القسم (تحميل كسول)
├── islamic.css
└── index.ts
```

## المسارات
| المسار | الوظيفة |
|---|---|
| `/islamic` | الصفحة الرئيسية للقسم |
| `/islamic/values` · `/islamic/family` | أخلاقي · أسرتي |
| `/islamic/manners` | آدابي |
| `/islamic/worship` | عباداتي (الوضوء، الصلاة، الدعاء، أوقات الصلاة) |
| `/islamic/faith` | ديني الجميل (أركان الإسلام والإيمان، نبينا، الأذكار) |
| `/islamic/stories` | قصص تفاعلية |
| `/islamic/culture` | ثقافتنا العربية |
| `/islamic/steps` | أتعلم خطوة بخطوة (١٠ مواضيع) |
| `/islamic/challenge` | الألعاب (١١ لعبة) |
| `/islamic/quiz/:worldId` | اختبار (سهل/متوسط/متقدم) لـ values, family, manners, worship, faith, stories, culture |
| `/islamic/badges` | الشارات |

## النطق
- `engine/islamicSound.ts`: Web Speech بصوت `ar-SA`، ويحذف الإيموجي والرموز قبل النطق.
- كل سؤال/لعبة/مشهد/خطوة ينطق تلقائياً (`useAutoSpeak`)، وبجانبه زر 🔊 لإعادة السماع.
- زر كتم الصوت أعلى يسار كل صفحة (الصوت اختياري).
- الآيات القرآنية تُعرض بإطار مميز ولا تُنطق آلياً.
- لاستخدام محرك الصوت المشترك أو تسجيلات حقيقية عدّل الدالة `speakArabic` فقط.

## التقدم والشارات
- مفتاح `localStorage`: `islamic-progress-v1` (مستقل عن بقية الأقسام).
- لربطه بملف الطفل النشط استدعِ `setIslamicProfile(childId)` عند تغيير الطفل.
- الشارات تُحتسب تلقائياً من التقدم (`evaluateBadges`)؛ و«بطل الأخلاق» عند ٢٠ نشاطاً.
- `resetIslamicProgress()` متاحة للوحة ولي الأمر.

## التوسّع
- **قيمة جديدة**: أضف عنصراً إلى `islamicValues` أو `familyValues` في `data/values.ts` (معرّف فريد + `badgeId`)، ثم أضف شارتها في `data/badges.ts`.
- **أدب/درس جديد**: أضف عنصراً إلى `islamicManners` (مع `steps`) فيظهر في «آدابي»؛ ولإظهاره في «خطوة بخطوة» أضف موضوعاً في `data/stepByStep.ts`.
- **درس عبادة**: أضف إلى `worshipLessons` في `data/worship.ts`.
- **قصة جديدة**: أضف كائناً إلى `islamicStories` (٥–٨ مشاهد، مشهد واحد على الأقل فيه `choices` بخيار صحيح واحد، و`activity` اختياري). مفتاح `character` يحدد رسمة المشهد (`boy_*`, `girl_*`, `mom_*`, `two_boys_*`...).
- **سؤال جديد**: أضف إلى `islamicQuizzes` في `data/quizzes.ts` مع `worldId` و`level` (`easy|medium|hard`).
- **لعبة/مرحلة**: عدّل `data/games.ts` (مواقف، ألغاز صور، مطابقة، ترتيب، اجمع الخير). لعبة من نوع جديد: أضفها إلى `gameCatalog` ثم مكوّناً في `pages/Games/GamesPage.tsx`.
- **لغز صورة جديد**: أضف مشهداً إلى `PuzzleScene` في `components/SceneArt.tsx` وأضف مفتاحه إلى `SceneKey` في `data/types.ts`.

## الفحص
```bash
node scripts/check-tashkeel.mjs      # كلمات عربية بلا تشكيل
npm run build && npm run lint
```
في وضع التطوير تفحص الصفحة الرئيسية سلامة البيانات (`validateContent`) وتطبع تحذيراً فقط عند وجود مشكلة.

## ضوابط المحتوى
لا تجسيد للأنبياء أو الصحابة، ولا تخويف، ولا فتاوى، وبلا خلافات فقهية (مثل موضع اليدين في الصلاة). النصوص الشرعية قليلة ومنسوبة، **ويُنصح بمراجعتها من مختص قبل النشر**.
