/**
 * NumbersParentPage — لوحة ولي الأمر لقسم مغامرة الأرقام
 * - محمية بـ PIN
 * - تتبع تقدم الطفل في كل مهارة
 * - إعدادات: فتح المسارات، شكل الأرقام، الصوت، اللغة
 * - فتح جميع المسارات أو حتى مرحلة معينة
 * - زر العودة لمغامرة الأرقام في الأعلى
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { BADGES, STAGES } from "../data/content";
import { useProgress } from "../lib/progress";
import { fmt, loc } from "../lib/arabic";
import PinGate from "../components/PinGate";
import NumbersControls from "../components/NumbersControls";
import NumbersVoiceStudio from "./NumbersVoiceStudio";
import { STUDIO_ENABLED } from "../../config/features";
import "../numbers.css";

// أسماء المهارات
const SKILL_NAMES: Record<string, string> = {
  recognize: "التعرف على الأرقام",
  count: "العد",
  compare: "المقارنة",
  neighbors: "السابق واللاحق",
  add: "الجمع",
  subtract: "الطرح",
  hear: "الاستماع",
};

// تقدير مستوى المهارة
const grade = (ok: number, total: number) => {
  if (total < 3) return { text: "لم يبدأ بعد", color: "text-gray-400" };
  const ratio = ok / total;
  if (ratio > 0.85) return { text: "مُمْتَاز ⭐", color: "text-emerald-600" };
  if (ratio > 0.65) return { text: "جيد جدًا 👍", color: "text-blue-600" };
  return { text: "يحتاج مراجعة 📚", color: "text-orange-600" };
};

export function NumbersParentPage() {
  const [p, up] = useProgress();
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);

  // عرض استوديو التسجيل إذا طلبه ولي الأمر
  if (showVoiceStudio) {
    return (
      <div className="relative min-h-screen">
        <button
          onClick={() => setShowVoiceStudio(false)}
          className="fixed top-4 right-4 z-[70] flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-violet-600/90 px-3 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-105"
        >
          ← العودة للإعدادات
        </button>
        <NumbersVoiceStudio />
      </div>
    );
  }

  const completedActivities = p.completed.filter(
    (id) => id.startsWith("practice:") || id.startsWith("game:")
  ).length;

  const totalActivities = 19;

  return (
    <div
      className="numbers-root relative min-h-screen"
      dir="rtl"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.08), rgba(255,255,255,.08)), url("/images/numbers-bg.webp")',
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
        backgroundColor: "#d9f1ff",
        "--numbers-scale": p.textScale ?? 1,
      } as CSSProperties}
    >
      <NumbersControls />

      {/* ترويسة */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 px-4 py-3">
        <Link
          to="/numbers"
          className="flex items-center gap-1.5 rounded-2xl border-2 border-white/80 bg-white/70 px-3 py-2 text-sm font-bold text-violet-800 shadow-lg backdrop-blur-sm transition hover:scale-105"
        >
          🔢 مغامرة الأرقام
        </Link>
        <h1 className="rounded-2xl bg-white/70 px-4 py-2 text-center text-lg font-extrabold text-violet-800 shadow backdrop-blur-sm">
          ⚙️ لوحة ولي الأمر
        </h1>
        <Link
          to="/"
          className="flex items-center gap-1 rounded-2xl border-2 border-white/80 bg-white/70 px-3 py-2 text-sm font-bold text-violet-800 shadow-lg backdrop-blur-sm transition hover:scale-105"
        >
          🏠
        </Link>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-2">

        {/* ——— إنجازات الطفل ——— */}
        <div
          className="rounded-3xl border-2 border-white/60 p-5 shadow-xl"
          style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(6px)" }}
        >
          <h2 className="mb-3 text-2xl font-extrabold text-violet-800">⭐ إنجازات الطفل</h2>

          {/* تقدم الأرقام */}
          <div className="mb-3">
            <p className="font-bold text-gray-700">
              الأرقام المتعلَّمة: {fmt(p.learned.length, p.eastern)} من {fmt(20, p.eastern)}
            </p>
            <div className="mt-1 h-4 rounded-full bg-gray-200">
              <div
                className="h-4 rounded-full bg-violet-500 transition-all"
                style={{ width: `${p.learned.length * 5}%` }}
              />
            </div>
          </div>

          {/* تقدم الأنشطة */}
          <div className="mb-3">
            <p className="font-bold text-gray-700">
              الأنشطة المكتملة: {fmt(completedActivities, p.eastern)} من {fmt(totalActivities, p.eastern)}
            </p>
            <div className="mt-1 h-4 rounded-full bg-gray-200">
              <div
                className="h-4 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(completedActivities / totalActivities) * 100}%` }}
              />
            </div>
          </div>

          {/* النجوم */}
          <p className="mb-3 text-xl font-bold text-amber-600">
            النجوم المجموعة: {fmt(p.stars, p.eastern)} ⭐
          </p>

          {/* الأوسمة */}
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <span
                key={b.id}
                className={`rounded-xl px-3 py-1 text-sm font-bold ${
                  p.stars >= b.need
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                🏅 {b.name}
              </span>
            ))}
          </div>
        </div>

        {/* ——— لوحة الإعدادات (محمية بـ PIN) ——— */}
        <PinGate>
          <div
            className="rounded-3xl border-2 border-white/60 p-5 shadow-xl"
            style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(6px)" }}
          >
            <h2 className="mb-4 text-xl font-extrabold text-violet-800">
              👨‍👩‍👧 إعدادات ولي الأمر
            </h2>

            {/* ——— تقدم المهارات ——— */}
            <div className="mb-5">
              <h3 className="mb-2 font-bold text-gray-700">📊 تقدم المهارات</h3>
              <div className="space-y-2">
                {Object.entries(SKILL_NAMES).map(([key, name]) => {
                  const skill = p.skills[key];
                  const ok = skill?.ok ?? 0;
                  const total = skill?.total ?? 0;
                  const g = grade(ok, total);
                  return (
                    <div key={key} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                      <span className="text-sm font-bold text-gray-700">{name}</span>
                      <span className={`text-sm font-bold ${g.color}`}>{g.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ——— أرقام تحتاج مراجعة ——— */}
            {Object.keys(p.weak).filter((k) => p.weak[+k] >= 3).length > 0 && (
              <div className="mb-4 rounded-2xl bg-orange-50 border border-orange-200 px-4 py-3">
                <p className="font-bold text-orange-700">
                  🔁 أرقام تحتاج مزيداً من التدريب:
                </p>
                <p className="mt-1 text-lg font-extrabold text-orange-600">
                  {Object.keys(p.weak)
                    .filter((k) => p.weak[+k] >= 3)
                    .map((k) => fmt(+k, p.eastern))
                    .join("، ")}
                </p>
              </div>
            )}

            {/* ——— شكل الأرقام ——— */}
            <div className="mb-4">
              <p className="mb-2 font-bold text-gray-700">شكل الأرقام في الموقع:</p>
              <div className="flex gap-2">
                {[
                  [true, "الأرقام الهندية (١٢٣)"],
                  [false, "الأرقام الانجليزية (123)"],
                ] .map(([v, t]) => (
                  <button
                    key={String(v)}
                    onClick={() => up((s) => ({ ...s, eastern: v as boolean }))}
                    className={`flex-1 rounded-2xl border-2 px-3 py-2 text-sm font-bold transition ${
                      p.eastern === v
                        ? "border-violet-500 bg-violet-500 text-white"
                        : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    {t as string}
                  </button>
                ))}
              </div>
            </div>

            {/* ——— الصوت ——— */}
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
              <span className="font-bold text-gray-700">تشغيل الصوت</span>
              <button
                onClick={() => up((s) => ({ ...s, sound: !s.sound }))}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  p.sound ? "bg-violet-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    p.sound ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* ——— عدد الأسئلة ——— */}
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-violet-50 px-4 py-3">
              <div><p className="font-bold text-gray-700">إعادة المحاولة في الاختبار الكبير</p><p className="text-sm text-gray-500">يُطبق هذا الخيار على الاختبار الكبير فقط.</p></div>
              <button type="button" role="switch" aria-checked={p.finalExamAllowRetry} onClick={() => up((s) => ({ ...s, finalExamAllowRetry: !s.finalExamAllowRetry }))} className={`h-8 w-14 rounded-full p-1 transition ${p.finalExamAllowRetry ? "bg-emerald-500" : "bg-gray-400"}`}><span className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${p.finalExamAllowRetry ? "translate-x-6" : "translate-x-0"}`} /></button>
            </div>

            {/* ——— عدد الأسئلة ——— */}
            <div className="mb-4 rounded-2xl bg-violet-50 px-4 py-3">
              <p className="mb-2 font-bold text-gray-700">🔢 عدد الأسئلة في تدريبات الطفل والألعاب:</p>
              <div className="grid grid-cols-2 gap-2">
                {[7, 10].map((count) => (
                  <button key={count} type="button" onClick={() => up((s) => ({ ...s, questionCount: count as 7 | 10 }))} className={`rounded-2xl border-2 px-3 py-2 font-extrabold transition ${p.questionCount === count ? "border-violet-500 bg-violet-500 text-white" : "border-violet-100 bg-white text-violet-700"}`}>
                    {count} أسئلة {count === 7 ? "(افتراضي)" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* ——— فتح المسارات ——— */}
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="font-bold text-gray-700">فتح جميع المسارات</span>
                <button
                  onClick={() => up((s) => ({ ...s, openAll: !s.openAll }))}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    p.openAll ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      p.openAll ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {!p.openAll && (
                <div>
                  <p className="mb-2 text-sm font-bold text-gray-600">
                    فتح المسارات حتى المرحلة المحددة:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => up((x) => ({ ...x, openTo: i }))}
                        className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                          p.openTo === i
                            ? "bg-violet-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {s.icon} {loc(s.title)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ——— استوديو التسجيل (للتطوير فقط) ——— */}
            {STUDIO_ENABLED && (
            <div className="mb-4 rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 py-4">
              <h3 className="mb-1 text-base font-extrabold text-violet-800">🎙️ استوديو تسجيل الأصوات</h3>
              <p className="mb-3 text-sm text-violet-600">
                سجّل أصواتك الخاصة للأرقام والأسئلة لتحل محل الصوت الآلي للمتصفح.
              </p>
              <button
                type="button"
                onClick={() => setShowVoiceStudio(true)}
                className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:scale-105 hover:bg-violet-700"
              >
                🎙️ فتح الاستوديو
              </button>
            </div>
            )}

            {/* ——— إعادة ضبط التقدم ——— */}
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="mb-2 text-sm font-bold text-red-700">⚠️ إعادة ضبط التقدم</p>
              <button
                onClick={() => {
                  if (confirm("هل أنت متأكد من إعادة ضبط تقدم الأرقام؟ لا يمكن التراجع عن هذا.")) {
                    localStorage.removeItem("adad-progress-v1");
                    window.location.reload();
                  }
                }}
                className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                🗑️ مسح تقدم الأرقام
              </button>
            </div>
          </div>
        </PinGate>

      </div>

    </div>
  );
}
