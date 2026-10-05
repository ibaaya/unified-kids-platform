# دليل: موقع + PWA + تطبيق Android / iOS (من كود واحد)

الفكرة: **مشروع واحد** (React + Vite)، ومنه ثلاثة مخرجات:

| المخرج | أمر البناء | النتيجة |
|---|---|---|
| موقع + PWA | `npm run build` | مجلد `dist` يُرفع على استضافة HTTPS |
| تطبيق Android / iOS | `npm run build:native` ثم `cap sync` | مجلد `dist` نفسه داخل غلاف Capacitor (بدون Service Worker) |

---

## 1) أين أضع الملفات؟

الملف المضغوط `kids-platform-native-patch.zip` يحمل **نفس هيكل مجلدات مشروعك**.
فك الضغط **فوق مجلد المشروع** (الذي فيه `package.json`) ووافق على الاستبدال.

| الملف | الحالة | ماذا يفعل |
|---|---|---|
| `package.json` | معدّل | مكتبات PWA وCapacitor والخطوط + أوامر جديدة |
| `vite.config.ts` | معدّل | إضافة PWA، ووضع `--mode native` بدون PWA (جزء `voiceStudioPlugin` كما هو) |
| `index.html` | معدّل | `viewport-fit=cover`، وسوم PWA وiOS، وإزالة Google Fonts |
| `src/main.tsx` | معدّل | استيراد الخطوط المدمجة وتشغيل `initPlatform()` |
| `src/engine/recordedAudioManager.ts` | معدّل | الإنتاج يقرأ `audio-manifest.json` المضمّن، والتطوير كما كان |
| `src/app/routes.tsx` | معدّل | مسارا الاستوديو العربي والإنجليزي للتطوير فقط |
| `src/numbers/pages/NumbersParentPage.tsx` | معدّل | زر استوديو الأرقام للتطوير فقط |
| `src/config/features.ts` | جديد | `STUDIO_ENABLED` مفعّل في وضع التطوير فقط |
| `src/platform/initPlatform.ts` | جديد | يميّز تطبيق/PWA/موقع، ويسجّل Service Worker للويب فقط |
| `src/platform/pwa-env.d.ts` | جديد | تعريفات TypeScript لـ PWA |
| `src/styles/platform.css` | جديد | المساحات الآمنة (النوتش) وسلوك اللمس |
| `capacitor.config.ts` | جديد | إعداد التطبيق (الاسم، المعرّف، الشاشة الأولى) |
| `public/pwa-192.png` و`pwa-512.png` و`pwa-maskable-512.png` و`apple-touch-icon.png` | جديد | **أيقونات مؤقتة** |
| `public/_redirects` | جديد | إعادة توجيه المسارات للاستضافات (Netlify / Cloudflare Pages) |
| `assets/` (5 صور) | جديد | مصدر أيقونة التطبيق وشاشة البداية (**مؤقتة**) |
| `.env.example` | جديد | ملاحظات إعداد البيئة؛ لا يفعّل الاستوديو في الإنتاج |

> **مهم قبل البناء:** أعد مجلدات الصور والصوت والفيديو التي حذفتها إلى `public/` (`public/images` و`public/audio` و`public/video`).

### بعد الاستبدال

```powershell
npm install
```

يلزم **Node 22 أو أحدث** (متطلب Capacitor 8). تحقق بـ `node -v`.

---

## 2) ما الذي تغيّر فعلاً في السلوك؟

1. **الصوت المسجّل:** كان `recordedAudioManager` يجلب المانيفست من خادم Vite (`/__voice-studio/manifest`)، وهو غير موجود في الموقع المنشور أو التطبيق. الآن يُضمَّن `src/data/audio-manifest.json` وقت البناء. **بعد تسجيل أصوات جديدة في الاستوديو أعد البناء** حتى تدخل المانيفست الجديد.
2. **استوديوهات التسجيل الثلاثة** تظهر في `npm run dev` فقط؛ `STUDIO_ENABLED` مرتبط بوضع التطوير ولا يوجد متغير بيئة لتفعيلها في بناء الإنتاج. تستخدم الاستوديوهات خادم Vite المحلي لحفظ الملفات.
3. **الخطوط:** صارت مدمجة (`@fontsource`) بدل Google Fonts، فتعمل بدون إنترنت ولا ترسل طلبات لطرف ثالث (يناسب سياسات تطبيقات الأطفال).
4. **Service Worker:** يعمل في الموقع المنشور فقط، لا في وضع التطوير ولا داخل التطبيق.
5. **تخزين دائم:** يُطلب `navigator.storage.persist()` في الويب لتقليل احتمال مسح تقدّم الطفل.

---

## 3) كيف أشتغل يومياً؟

| أريد | الأمر |
|---|---|
| التطوير والتجربة السريعة | `npm run dev` |
| التطوير ورؤية الموقع من الجوال (نفس الشبكة) | `npm run dev:lan` |
| بناء الموقع/PWA | `npm run build` |
| معاينة نسخة الإنتاج محلياً | `npm run preview` (أو `npm run preview:lan` للجوال) |
| تحديث مشروع Android وفتحه | `npm run cap:android` |
| تحديث مشروع iOS وفتحه (Mac) | `npm run cap:ios` |
| توليد أيقونات التطبيق من `assets/` | `npm run cap:assets` |

> بعد **أي تعديل كود** يخص التطبيق: `npm run cap:sync` ثم شغّل من Android Studio / Xcode. التطبيق يحمل نسخة من `dist` داخله، فلا يرى التعديل تلقائياً.

---

## 4) الاختبار — خطوة بخطوة

### أ) المتصفح (وضع التطوير)

1. `npm run dev` ثم افتح `http://localhost:5173`.
2. جرّب الأقسام الأربعة، وراجع الصوت والتقدم.
3. استوديوهات العربية والإنجليزية والأرقام تعمل هنا، وتسجل MP3 في مجلد القسم تحت `public/audio/` وتحدّث `src/data/audio-manifest.json`.
4. من Chrome: `F12` ثم أيقونة الجوال (Device Toolbar) لمحاكاة الأحجام واتجاه الشاشة.

### ب) الموقع بنسخة الإنتاج (أهم اختبار قبل أي نشر)

```powershell
npm run build
npm run preview
```
افتح `http://localhost:4173` وتحقق من:
- فتح `/english` مباشرة وعمل تحديث للصفحة (F5) بدون خطأ 404.
- الصوت المسجّل يعمل (يؤكد أن المانيفست المضمّن سليم).
- لا تظهر أزرار/صفحات استوديو التسجيل في لوحة ولي الأمر.
- بعد حفظ تسجيلات جديدة أثناء التطوير، أعد البناء لتضمين الملفات والمانيفست في النسخة المنشورة أو التطبيق.
- `F12` ثم Network: لا طلبات إلى `fonts.googleapis.com`.

### ج) PWA

الـ Service Worker لا يعمل في `npm run dev`، فاختبر دائماً على `npm run preview`.

**على الكمبيوتر (Chrome):**
1. `F12` ← **Application**:
   - *Manifest*: يجب أن تظهر الأيقونات بدون أخطاء.
   - *Service Workers*: الحالة **activated and running**.
   - *Cache Storage*: ستجد `workbox-precache...` وبعد استخدام الصوت `kids-audio-v1`.
2. اختبار بدون إنترنت: *Service Workers* ثم علّم **Offline**، وحدّث الصفحة. يجب أن يفتح التطبيق (الصوت الذي لم يُشغَّل من قبل لن يعمل حتى يُحمَّل مرة).
3. **Lighthouse** ثم فئة *Progressive Web App* للتأكد من قابلية التثبيت.
4. أيقونة التثبيت تظهر في شريط العنوان.

**على الجوال (يحتاج HTTPS):** PWA لا تُثبَّت من `http://192.168...`. لديك طريقتان:
- نشر `dist` على استضافة مجانية (Netlify أو Cloudflare Pages أو Firebase Hosting)، وتأكد أن إعادة التوجيه `/* → /index.html` مفعّلة (ملف `_redirects` يكفي لـ Netlify وCloudflare).
- أو نفق مؤقت للاختبار: `npx localtunnel --port 4173` أو `cloudflared tunnel --url http://localhost:4173`.

ثم:
- **Android (Chrome):** القائمة ⋮ ثم *تثبيت التطبيق*.
- **iPhone/iPad (Safari فقط):** زر المشاركة ثم *إضافة إلى الشاشة الرئيسية*.

**تحديث نسخة PWA:** بعد نشر نسخة جديدة، تُحمَّل عند الفتح التالي وتُفعَّل بعد إغلاق التطبيق تماماً وفتحه. أثناء الاختبار إن لم يظهر التعديل: `F12` ثم Application ثم *Storage* ثم **Clear site data**.

### د) تطبيق Android

**المتطلبات:** Android Studio (يحمل JDK معه).

1. **قبل أول مرة فقط:** غيّر `appId` في `capacitor.config.ts` إلى معرّفك النهائي (مثل `com.yourcompany.kidslearning`). تغييره بعد النشر مؤلم.
2. أول مرة:
   ```powershell
   npm run build:native
   npx cap add android
   npm run cap:assets
   npm run cap:android
   ```
   (الأمر الأخير يفتح Android Studio. انتظر انتهاء Gradle Sync.)
3. اختر جهازاً: محاكي (Device Manager) أو جوالك الحقيقي (فعّل *USB debugging*)، ثم زر ▶ Run.
4. **فحص الأخطاء:** اجعل `android.webContentsDebuggingEnabled: true` مؤقتاً، ثم `npm run cap:sync`، وأعد التشغيل، وافتح في Chrome الصفحة `chrome://inspect` لترى Console وNetwork كما في المتصفح. أعدها `false` قبل النشر.
5. **قائمة فحص على الجهاز:**
   - ملء الشاشة وعدم تداخل المحتوى مع النوتش وشريط الحالة والأزرار السفلية.
   - تدوير الجهاز (إن كان التصميم يدعمه).
   - الصوت المسجّل ونطق الأجهزة العربي (`speechSynthesis`) يعملان.
   - إغلاق التطبيق وفتحه: التقدم باقٍ.
   - زر الرجوع: يرجع صفحة ثم يخرج من التطبيق.
   - وضع الطيران: كل شيء يعمل (التطبيق محلي).
   - تجربة هاتف قديم/ضعيف وجهاز لوحي.

### هـ) تطبيق iOS (يحتاج Mac)

**المتطلبات:** Mac وXcode (آخر إصدار تطلبه أبل للرفع) وحساب مطوّر.

1. ```bash
   npm run build:native
   npx cap add ios
   npm run cap:assets
   npm run cap:ios
   ```
   (Capacitor 8 يستخدم Swift Package Manager، فلا حاجة لـ CocoaPods.)
2. في Xcode: اختر الهدف **App** ثم *Signing & Capabilities* ثم اختر Team، وتأكد من *Bundle Identifier*.
3. شغّل على **Simulator** أولاً، ثم على **جهاز حقيقي** (الاختبار الحقيقي ضروري للصوت).
4. **فحص الأخطاء:** اجعل `ios.webContentsDebuggingEnabled: true` مؤقتاً، ثم من Safari على Mac: قائمة **Develop** ← اسم الجهاز/المحاكي ← الصفحة.
5. **قائمة فحص خاصة بـ iOS:**
   - الصوت مع مفتاح الصامت (Silent switch) مفعّل وغير مفعّل. أحياناً يكتم WebView الصوت مع الصامت، وإن حدث عندك فنعالجه بإعداد صوت أصلي صغير.
   - الصوت لا يبدأ تلقائياً قبل لمسة المستخدم (قيد iOS).
   - المساحات الآمنة في iPhone بنوتش/Dynamic Island وفي iPad.
   - إغلاق التطبيق وفتحه: التقدم باقٍ.
- **بدون Mac:** يمكن البناء عبر Codemagic أو أي CI فيه macOS، لكن الاختبار البصري يبقى على جهاز حقيقي عبر TestFlight.

---

## 5) النشر

### Android (Google Play)
1. في `android/app/build.gradle`: ارفع `versionCode` مع كل رفعة، و`versionName` للعرض.
2. Android Studio ← **Build ← Generate Signed App Bundle (AAB)** وأنشئ keystore واحفظه (بنفس عادتك مع تطبيق Flutter).
3. ارفع إلى **Internal testing** أولاً.
4. في Play Console: فئة الأطفال/سياسة Families، نموذج Data Safety، رابط سياسة الخصوصية.

### iOS (App Store)
1. Xcode ← **Product ← Archive** ← Distribute ← App Store Connect ← **TestFlight**.
2. اختر فئة **Kids** ومدى العمر، وأجب عن خصوصية البيانات (App Privacy).
3. لا تضع روابط خارجية أو شراءً داخل التطبيق دون بوابة والدين.
4. تنبيه: تتشدد أبل أحياناً مع تطبيقات "موقع داخل غلاف". ما يحميك هنا أن التطبيق يعمل بالكامل بدون إنترنت، وفيه محتوى وتقدم وإعدادات حقيقية. اشرح ذلك في ملاحظات المراجعة إن لزم.

---

## 6) مشاكل شائعة

| المشكلة | الحل |
|---|---|
| شاشة بيضاء في التطبيق | افتح فحص الأخطاء (chrome://inspect أو Safari). غالباً ملف ناقص أو `npm run build:native` لم يُنفَّذ قبل `cap sync` |
| تعديلي لا يظهر في التطبيق | `npm run cap:sync` ثم أعد التشغيل من Android Studio / Xcode |
| تعديلي لا يظهر في PWA | Clear site data، أو أغلق التطبيق تماماً وافتحه |
| 404 عند تحديث `/english` على الاستضافة | فعّل إعادة التوجيه `/* → /index.html` |
| الصوت المسجّل لا يعمل في الإنتاج | تأكد أن الملفات داخل `public/audio` وأن `src/data/audio-manifest.json` محدّث ثم أعد البناء |
| لا يظهر استوديو التسجيل في `build` | هذا مقصود. استخدم `npm run dev` |
| أين تُحفظ التسجيلات؟ | في `public/audio/arabic/` أو `public/audio/english/` أو `public/audio/numbers/`، وتُسجّل مساراتها في `src/data/audio-manifest.json` |
| الأيقونة الافتراضية (نجمة بنفسجية) | استبدل صور `public/pwa-*.png` و`apple-touch-icon.png` و`assets/*`، ثم `npm run cap:assets` |

---

## 7) ما لم يُختبر

- كل ما سبق بُني واختُبر على مستوى البناء (`tsc` و`vite build` للوضعين و`cap add/sync` للمنصتين)، وخدمة ملفات الإنتاج محلياً.
- **لم يُشغَّل على جهاز Android أو iPhone فعلي.** شكل المساحات الآمنة والصوت على iOS هما أول ما يجب فحصه.
- الأيقونات وشاشة البداية **مؤقتة** لحين تصميمك الخاص.
- حماية التقدم من المسح (IndexedDB على iOS عند امتلاء الجهاز): أضفنا طلب التخزين الدائم للويب فقط. إن أردت طبقة نسخ احتياطي إضافية (تصدير/استيراد من لوحة ولي الأمر أو `@capacitor/preferences`) فهي خطوة لاحقة.
