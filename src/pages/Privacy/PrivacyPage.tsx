import { useState } from 'react'
import { Link } from 'react-router-dom'

type Language = 'ar' | 'en'

const content = {
  ar: {
    dir: 'rtl', name: 'رحلتي (Rehlaty)', title: 'سياسة الخصوصية', updated: 'آخر تحديث: 6 نوفمبر 2026',
    introTitle: 'خصوصية الأطفال أولويتنا',
    intro: 'لا تجمع منصة رحلتي ولا ترفع أسماء الأطفال أو صورهم أو أصواتهم أو إجاباتهم أو تقدمهم التعليمي. ملفات الأطفال والتقدم والإعدادات تُحفظ على الجهاز المستخدم فقط.',
    sections: [
      ['ما الذي يُحفظ على الجهاز؟', 'قد يحفظ التطبيق محليًا اسم الملف الذي يدخله ولي الأمر، والصورة الرمزية، والتقدم والنجوم والنقاط والإعدادات. يُستخدم ذلك لتشغيل أنشطة التعلم وتذكّر التقدم على الجهاز نفسه، ولا يُرسل إلى خوادمنا. قد تُحفظ تفضيلات الصوت وبعض إعدادات التطبيق في تخزين المتصفح المحلي.'],
      ['العداد المجهول للمنصة', 'لإحصاء عدد مرات استخدام المنصة على الويب وPWA وAndroid وiOS، يرسل التطبيق إلى Cloud Firestore معرّف تثبيت عشوائيًا، ونوع المنصة (web أو pwa أو android أو ios)، ووقت آخر استخدام. يُنشأ معرّف عشوائي محليًا ولا يحتوي على اسم أو بريد أو رقم هاتف أو معرّف إعلان، ويُحدّث السجل بحد أقصى مرة واحدة يوميًا لكل تثبيت. لا نستخدم هذا العداد لتحديد هوية الطفل أو تتبع نشاطه التعليمي.'],
      ['خدمات Google Firebase', 'يُستخدم Firebase Cloud Firestore للعداد المجهول فقط، عند إعداد مفاتيح الخدمة في نسخة التطبيق. لا تُرسل إليه ملفات الأطفال أو أنشطتهم. وكأي اتصال شبكي، قد تعالج Google معلومات تقنية لازمة لتقديم الخدمة وحمايتها، مثل عنوان IP ومعلومات الاتصال؛ راجع سياسة خصوصية Google وبيان خصوصية وأمان Firebase.'],
      ['الصوت والوسائط', 'يستخدم التطبيق الأصوات والصور والفيديوهات التعليمية لتقديم المحتوى. تشغيل النطق يعتمد على الصوت المسجل المرفق أو ميزة تحويل النص إلى كلام في الجهاز/المتصفح. لا نسجل صوت الطفل ولا نرسله. قد تستخدم المنصة خدمات خارجية لتوليد أصوات المحتوى عند استعمال أدوات إعداد المحتوى من قبل ولي الأمر أو المشرف.'],
      ['التخزين دون اتصال', 'قد يخزن التطبيق ملفات التطبيق والوسائط التي يفتحها المستخدم في ذاكرة التخزين المؤقت، كما يمكن تنزيل محتوى محدد عند توفر هذه الميزة. تبقى بيانات التعلم المحلية على الجهاز، ويمكن حذفها بمسح بيانات التطبيق أو الموقع من إعدادات الجهاز أو المتصفح؛ حذف التطبيق أو بيانات الموقع قد يزيلها نهائيًا.'],
      ['الأطفال وولي الأمر', 'المنصة تعليمية للأطفال، ويُفترض أن ينشئ ولي الأمر الملفات المحلية ويشرف على الاستخدام. لا تتطلب أنشطة التعلم إنشاء حساب أو إدخال بيانات تعريفية عن الطفل. نرجو عدم إدخال معلومات حساسة في الاسم أو أي حقل نصي.'],
      ['التغييرات والتواصل', 'قد نحدّث هذه السياسة عند تغيير طريقة عمل المنصة، وسنحدّث تاريخ المراجعة أعلاه. للاستفسارات المتعلقة بالخصوصية، استخدم بيانات التواصل المنشورة في صفحة التطبيق على المتجر أو موقع المنصة.'],
    ],
    thirdParty: 'روابط مرجعية: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">سياسة خصوصية Google</a> · <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noreferrer">خصوصية وأمان Firebase</a>',
    home: 'العودة إلى المنصة', footer: 'جميع الحقوق محفوظة © 2026 رحلتي',
  },
  en: {
    dir: 'ltr', name: 'Rehlaty', title: 'Privacy Policy', updated: 'Last updated: November 6, 2026',
    introTitle: "Children's privacy comes first",
    intro: 'Rehlaty does not collect or upload children’s names, photos, voices, answers, or learning progress. Child profiles, progress, and settings are stored only on the device in use.',
    sections: [
      ['What is stored on the device?', 'The app may store locally a profile name entered by a parent, an avatar, learning progress, stars, points, and settings. This supports learning activities and remembers progress on that same device; this information is not sent to our servers. Audio preferences and some app settings may also be saved in local browser storage.'],
      ['Anonymous platform counter', 'To count platform use across web, PWA, Android, and iOS, the app sends a random installation identifier, platform type (web, pwa, android, or ios), and last-use time to Cloud Firestore. The identifier is randomly generated locally and contains no name, email, phone number, or advertising ID. The record is updated at most once per day per installation. We do not use this counter to identify a child or track learning activity.'],
      ['Google Firebase services', 'Firebase Cloud Firestore is used only for the anonymous counter when service keys are configured in the app build. Child profiles and activities are not sent to it. As with any network connection, Google may process technical information needed to provide and protect the service, such as IP address and connection information; see Google’s Privacy Policy and Firebase Privacy and Security information.'],
      ['Audio and media', 'The app uses educational audio, images, and videos to deliver its content. Speech uses bundled recordings or the device/browser text-to-speech feature. We do not record or send a child’s voice. External services may be used to generate content audio when a parent or administrator uses the content-authoring tools.'],
      ['Offline storage', 'The app may cache app files and media that a user opens, and specific content may be downloaded when that feature is available. Learning data remains on the device. It can be removed by clearing the app or website data in device or browser settings; uninstalling the app or clearing site data may permanently delete it.'],
      ['Children and parents', 'Rehlaty is an educational platform for children. A parent should create local profiles and supervise use. Learning activities do not require an account or identifying information about a child. Please do not enter sensitive information in a profile name or other text field.'],
      ['Changes and contact', 'We may update this policy if the platform’s practices change and will revise the date above. For privacy questions, use the contact details published on the app store listing or platform website.'],
    ],
    thirdParty: 'References: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a> · <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noreferrer">Firebase Privacy and Security</a>',
    home: 'Back to the platform', footer: 'All Rights Reserved © 2026 com.ayasrah.rehlaty',
  },
}

export function PrivacyPage() {
  const [language, setLanguage] = useState<Language>('ar')
  const text = content[language]
  return (
    <main dir={text.dir} lang={language} className="min-h-[100dvh] bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30">
        <header className="bg-gradient-to-l from-violet-700 to-indigo-700 px-6 py-7 text-white sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold tracking-wide">{text.name}</p>
            <button type="button" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="rounded-full border border-white/50 px-4 py-2 text-sm font-bold hover:bg-white/15" aria-label={language === 'ar' ? 'Switch language to English' : 'تغيير اللغة إلى العربية'}>
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
          <h1 className="mt-7 text-3xl font-extrabold sm:text-4xl">{text.title}</h1>
          <p className="mt-2 text-sm text-violet-100">{text.updated}</p>
        </header>
        <div className="space-y-7 px-6 py-7 sm:px-10 sm:py-9">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-xl font-extrabold text-emerald-950">{text.introTitle}</h2>
            <p className="mt-2 leading-8 text-emerald-950">{text.intro}</p>
          </section>
          {text.sections.map(([heading, body]) => <section key={heading}>
            <h2 className="text-lg font-extrabold text-violet-950">{heading}</h2>
            <p className="mt-2 leading-8 text-slate-700">{body}</p>
          </section>)}
          <p className="border-t border-slate-200 pt-5 text-sm leading-7 text-slate-600" dangerouslySetInnerHTML={{ __html: text.thirdParty }} />
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
            <Link to="/" className="rounded-full bg-violet-700 px-5 py-3 font-bold text-white hover:bg-violet-800">{text.home}</Link>
            <p className="text-sm text-slate-500">{text.footer}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
