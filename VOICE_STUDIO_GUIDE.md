# Voice Recording Studio

## تشغيل

```bash
npm install
npm run dev
```

افتح صفحة ولي الأمر ثم Voice Studio.

## التسجيل

الاستوديو يستخدم `MediaRecorder` بدل `ScriptProcessorNode`، لذلك لا يظهر تحذير ScriptProcessorNode أثناء التسجيل.

يفضل اختيار `Jabra Link 380` من قائمة الميكروفون إذا كان هو جهاز الإدخال المطلوب.

إعدادات الالتقاط:

- Mono قدر الإمكان
- Echo Cancellation
- Noise Suppression
- Auto Gain Control معطل حتى تتم المعالجة يدويًا

لا يتم إرسال صوت الميكروفون إلى سماعات الجهاز من داخل الاستوديو، لمنع الـfeedback.

## المعالجة

بعد إيقاف التسجيل:

1. فك ترميز التسجيل الأصلي.
2. Trim Silence من البداية والنهاية.
3. Normalize Volume إلى Peak قريب من -1 dBFS.
4. تحويل إلى Mono / 24 kHz.
5. ترميز MP3 64 kbps.

## الحفظ

زر `اعتماد وحفظ MP3` يرسل الملف إلى Vite Dev Server، ويكتب فعليًا في:

```text
public/audio/letters/
public/audio/harakat/
public/audio/syllables/
public/audio/words/
public/audio/sentences/
public/audio/stories/
```

ثم يحدث:

```text
src/data/audio-manifest.json
```

ويتحقق الخادم من وجود الملف وحجمه قبل إرجاع نجاح العملية.

## صفحة الطفل

بعد الحفظ، يتم تحديث manifest في الذاكرة وLocalStorage، كما يتم تحميله من endpoint عند بدء التطبيق. لذلك يمكن لصفحة الطفل استخدام التسجيل مباشرة بدل Web Speech API عند توفر `audioId` الصحيح.

إذا لم يوجد تسجيل معتمد، يعود النظام إلى Web Speech API.

## الحذف

حذف التسجيل يحذف ملف MP3 من `public/audio` ويحذف مدخله من manifest، لكنه لا يحذف العنصر التعليمي من ملفات JSON.
