import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SpeakButton } from '../../components/ui/SpeakButton';
import storiesData from '../../data/stories.json';
import type { Story } from '../../types/content';
import { EmojiIllustration } from '../../components/ui/EmojiIllustration';
import { useSound } from '../../hooks/useSound';
import { useChildProfile } from '../../hooks/useChildProfile';
import { useAutoReadQuestion } from '../../hooks/useAutoReadQuestion';

export const StoriesWorld: React.FC = () => {
  const { speak } = useSound();
  const { child } = useChildProfile();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // حالة التحكم بحجم الخط (عادي، كبير، أكبر)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [storyPage, setStoryPage] = useState(0);

  const stories = storiesData as unknown as Story[];
  const activeStoryPage = selectedStory?.pages[currentPageIndex];
  const activeQuestionText = selectedStory?.comprehensionQuestions?.[0]?.question ?? '';
  useAutoReadQuestion(
    activeStoryPage?.text ?? '',
    Boolean(selectedStory && activeStoryPage && !showQuestion),
    `${selectedStory?.id ?? 'story-picker'}:${showQuestion ? 'question' : currentPageIndex}`,
    400,
    undefined,
    activeStoryPage ? `story-page:${selectedStory?.id}:page:${currentPageIndex + 1}` : undefined,
  );
  useAutoReadQuestion(activeQuestionText, Boolean(selectedStory && showQuestion && (child?.settings?.autoReadQuestions ?? true)), selectedStory?.id ?? 'story-picker', 400);
  const handleOpenStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentPageIndex(0);
    setShowQuestion(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setFontSize('large'); // إعادة تعيين الحجم الافتراضي عند فتح قصة جديدة
  };

  const handleNextPage = () => {
    if (selectedStory && currentPageIndex < selectedStory.pages.length - 1) {
      setCurrentPageIndex((prev: number) => prev + 1);
    } else if (selectedStory && selectedStory.comprehensionQuestions && selectedStory.comprehensionQuestions.length > 0) {
      setShowQuestion(true);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (!selectedStory || !selectedStory.comprehensionQuestions || selectedStory.comprehensionQuestions.length === 0) return;
    setSelectedOption(index);
    const currentQ = selectedStory.comprehensionQuestions[0];
    const correct = index === currentQ.correctIndex;
    setIsCorrect(correct);
    if (correct && isCorrect !== true) speak('أَحْسَنْتَ! إِجَابَةٌ صَحِيحَةٌ.');
  };

  // تبديل حجم الخط
  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  // كلاس حجم الخط الفعلي للنص
  const fontSizeClass = 
    fontSize === 'normal' ? 'text-xl' : 
    fontSize === 'large' ? 'text-3xl' : 'text-4xl';

  if (selectedStory) {
    const page = selectedStory.pages[currentPageIndex];
    const q = selectedStory.comprehensionQuestions?.[0];

    return (
      <div className="max-w-2xl mx-auto p-4 text-center" dir="rtl">
        {/* شريط علوي يحتوي على زر الرئيسية وزر العودة لقائمة القصص ورقم القصة */}
        <div className="flex justify-between items-center mb-4 bg-white/60 p-3 rounded-2xl border border-white/80 shadow-md backdrop-blur-md">
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedStory(null)}
              className="text-xs text-amber-800 bg-white px-3 py-1.5 rounded-xl hover:bg-amber-100 transition shadow-sm border border-amber-300 font-bold"
            >
              ← عالم القصص
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
              قصة رقم ({selectedStory.id})
            </span>
          </div>
        </div>

        <Card className="p-6 shadow-xl rounded-3xl border-2 border-white/80 relative backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,.2)' }}>
          
          {/* زر التحكم بحجم الخط */}
          <div className="flex justify-start mb-4">
            <button
              onClick={cycleFontSize}
              className="bg-amber-100 text-amber-900 border-2 border-amber-300 px-3 py-1.5 rounded-xl text-xs font-extrabold hover:bg-amber-200 transition shadow-sm flex items-center gap-1"
            >
              🔤 حجم الخط: {fontSize === 'normal' ? 'عادي' : fontSize === 'large' ? 'كبير' : 'كبير جداً'}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-amber-800 mb-2">{selectedStory.title}</h2>
          
          {!showQuestion ? (
            <div className="my-6">
              <EmojiIllustration emoji={page.imageEmoji} size="large" className="mb-6 animate-bounce" />
              
              {/* النص مع تطبيق حجم الخط المتغير */}
              <p className={`${fontSizeClass} text-gray-800 leading-relaxed mb-6 font-bold transition-all duration-200`}>
                {page.text}
              </p>
              
              <div className="flex justify-center items-center gap-4">
                <SpeakButton text={page.text} audioId={`story-page:${selectedStory.id}:page:${currentPageIndex + 1}`} />
                <Button onClick={handleNextPage} variant="primary">
                  {currentPageIndex < selectedStory.pages.length - 1 ? 'الصفحة التالية ➔' : 'سؤال القصة ✨'}
                </Button>
              </div>
              <div className="mt-4 text-sm text-gray-400 font-bold">
                صفحة {currentPageIndex + 1} من {selectedStory.pages.length}
              </div>
            </div>
          ) : (
            <div className="my-6">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">🧠 اختبر فهمك للقصة:</h3>
              
              {/* عرض السؤال مع زر قراءة الصوت (SpeakButton) بجانبه مباشرة */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-6 bg-white/65 p-4 rounded-2xl border border-white/80 shadow-sm backdrop-blur-sm">
                <p className="text-lg font-bold text-gray-800 m-0">{q?.question}</p>
                {q?.question && <SpeakButton text={q.question} audioId={`story-question:${selectedStory.id}:question:1`} />}
              </div>
              
              <div className="space-y-3 mb-6">
                {q?.options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={isCorrect === true}
                    className={`w-full p-4 rounded-xl text-lg font-bold transition border-2 text-right ${
                      selectedOption === idx
                        ? isCorrect
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : 'bg-rose-100 border-rose-400 text-rose-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-amber-50 text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {isCorrect === true && (
                <div className="text-green-600 font-bold text-lg mb-4 animate-pulse">
                  أَحْسَنْتَ يا بطل! إجابة صحيحة ⭐🎉
                </div>
              )}
              {isCorrect === false && (
                <div className="text-amber-600 font-medium mb-4 text-base">
                  اقتربت! فكّر قليلًا وحاول مرة أخرى 🌟
                </div>
              )}

              <div className="flex justify-between mt-4">
                <Button onClick={() => setShowQuestion(false)} variant="secondary">
                  العودة للقصة
                </Button>
                {isCorrect === true && (
                  <Button onClick={() => setSelectedStory(null)} variant="primary">
                    العودة للقصص 📚
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="sr-only">عَالَمُ الْقِصَصِ</h1>
      </div>
      <p className="text-center text-gray-800 font-bold mb-8 rounded-2xl border border-white/80 bg-white/55 px-4 py-3 shadow-md backdrop-blur-md">قصص قصيرة معبّرة، كل واحدة مرتبطة بحرف من حروف الهجاء</p>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_250px] gap-5 items-start">
      <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stories.slice(storyPage * 6, storyPage * 6 + 6).map((story: Story) => (
          <button
            key={story.id}
            onClick={() => handleOpenStory(story)}
            className="p-5 text-right hover:shadow-md transition bg-white/60 border border-white/85 shadow-lg backdrop-blur-md rounded-2xl flex items-center justify-between"
          >
            <div>
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                قصة رقم ({story.id})
              </span>
              <h3 className="text-lg font-bold text-gray-800 mt-2">{story.title}</h3>
            </div>
            <EmojiIllustration emoji={story.pages[0]?.imageEmoji || '📖'} size="small" />
          </button>
        ))}
      </div>
      <div className="flex justify-center items-center gap-4 mt-5" aria-label="التنقل بين صفحات القصص">
        <Button variant="secondary" disabled={storyPage === 0} onClick={() => setStoryPage((page) => Math.max(0, page - 1))}>السابق</Button>
        <span className="font-bold text-sm">صفحة {storyPage + 1} من {Math.ceil(stories.length / 6)}</span>
        <Button variant="secondary" disabled={(storyPage + 1) * 6 >= stories.length} onClick={() => setStoryPage((page) => Math.min(Math.ceil(stories.length / 6) - 1, page + 1))}>التالي</Button>
      </div>
      </section>
      <aside className="bg-white/65 rounded-2xl border border-white/85 p-3 max-h-[75vh] overflow-y-auto shadow-lg backdrop-blur-md">
        <h2 className="font-bold text-amber-900 mb-2">كل القصص ({stories.length})</h2>
        <ol className="space-y-1">
          {stories.map((story, index) => <li key={story.id}>
            <button onClick={() => { setStoryPage(Math.floor(index / 6)); handleOpenStory(story) }} className="w-full flex items-center gap-2 text-right p-2 rounded-xl hover:bg-amber-50">
              <EmojiIllustration emoji={story.pages[0]?.imageEmoji || '📖'} size="small" />
              <span className="text-sm font-semibold"><span className="text-amber-700">{index + 1}.</span> {story.title}</span>
            </button>
          </li>)}
        </ol>
      </aside>
      </div>
    </div>
  );
};
