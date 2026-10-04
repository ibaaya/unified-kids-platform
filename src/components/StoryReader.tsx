import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SpeakButton } from './ui/SpeakButton';
import type { Story } from '../types/content';

interface StoryReaderProps {
  story: Story & { question?: string; options?: string[]; correctIndex?: number; storyNumber?: number };
  onFinish: () => void;
  onBack: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({ story, onFinish, onBack }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // حالة التحكم بحجم الخط (عادي، كبير، أكبر)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  const page = story.pages[currentPageIndex];
  
  const questionText = story.comprehensionQuestions?.[0]?.question || story.question;
  const optionsList = story.comprehensionQuestions?.[0]?.options || story.options || [];
  const correctIdx = story.comprehensionQuestions?.[0]?.correctIndex ?? story.correctIndex ?? 0;

  const handleNextPage = () => {
    if (currentPageIndex < story.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else if (questionText) {
      setShowQuestion(true);
    } else {
      onFinish();
    }
  };

  const handlePrevPage = () => {
    if (showQuestion) {
      setShowQuestion(false);
    } else if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedOption(index);
    const correct = index === correctIdx;
    setIsCorrect(correct);
  };

  // تبديل حجم الخط
  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  // كلاس حجم الخط الفعلي
  const fontSizeClass = 
    fontSize === 'normal' ? 'text-2xl' : 
    fontSize === 'large' ? 'text-3xl' : 'text-4xl';

  return (
    <div className="max-w-2xl mx-auto p-4 text-center" dir="rtl">
      {/* شريط التنقل العلوي: يضم زر الرئيسية، وزر العودة للقائمة، ورقم القصة */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4 bg-amber-50 p-3 rounded-2xl border border-amber-200">
        <div className="flex gap-2">
          <button 
            onClick={onBack}
            className="text-xs text-amber-800 bg-white px-3 py-2 rounded-xl shadow-sm hover:bg-amber-100 transition font-extrabold border border-amber-300 flex items-center gap-1"
          >
            ← القائمة
          </button>
        </div>

        <div className="flex items-center gap-2">
          {story.storyNumber && (
            <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
              قصة رقم ({story.storyNumber})
            </span>
          )}
          <span className="text-amber-900 font-bold text-sm">{story.title}</span>
        </div>
      </div>

      <Card className="p-8 bg-white shadow-lg rounded-3xl border-2 border-amber-200 relative">
        
        {/* أداة التحكم بحجم الخط (واضحة وفي أعلى البطاقة مباشرة) */}
        <div className="flex justify-start mb-4">
          <button
            onClick={cycleFontSize}
            className="bg-amber-100 text-amber-900 border-2 border-amber-300 px-4 py-2 rounded-xl text-sm font-extrabold hover:bg-amber-200 transition shadow-sm flex items-center gap-2"
          >
            🔤 حجم الخط: {fontSize === 'normal' ? 'عادي' : fontSize === 'large' ? 'كبير' : 'كبير جداً'}
          </button>
        </div>

        {!showQuestion ? (
          <div className="my-2">
            <div className="text-8xl mb-6 animate-bounce">{page.imageEmoji}</div>
            
            {/* النص بحجم متغير حسب اختيار المستخدم */}
            <p className={`${fontSizeClass} text-gray-800 leading-relaxed mb-8 font-extrabold transition-all duration-200`}>
              {page.text}
            </p>
            
            <div className="flex justify-center items-center gap-4 mb-6">
              <SpeakButton text={page.text} audioId={`story-page:${story.id}:page:${currentPageIndex + 1}`} />
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <Button onClick={handlePrevPage} variant="secondary">
                السابق
              </Button>
              <span className="text-sm text-gray-400 font-bold">
                صفحة {currentPageIndex + 1} من {story.pages.length}
              </span>
              <Button onClick={handleNextPage} variant="primary">
                {currentPageIndex < story.pages.length - 1 ? 'التالي ➔' : 'سؤال القصة ✨'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="my-2">
            <h3 className="text-2xl font-bold text-amber-900 mb-4">🧠 اختبر فهمك للقصة:</h3>
            
            {/* عرض السؤال مع زر قراءة الصوت (SpeakButton) */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-6 bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <p className="text-xl font-bold text-gray-800 m-0">{questionText}</p>
              {questionText && <SpeakButton text={questionText} audioId={`story-question:${story.id}:question:1`} />}
            </div>
            
            <div className="space-y-3 mb-6">
              {optionsList.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-4 rounded-xl text-xl font-bold transition border-2 text-right ${
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
              <div className="text-green-600 font-bold text-xl mb-4 animate-pulse">
                أَحْسَنْتَ يا بطل! إجابة صحيحة ⭐🎉
              </div>
            )}
            {isCorrect === false && (
              <div className="text-amber-600 font-medium mb-4 text-lg">
                اقتربت! فكّر قليلًا وحاول مرة أخرى 🌟
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button onClick={() => setShowQuestion(false)} variant="secondary">
                العودة للقصة
              </Button>
              {isCorrect === true && (
                <Button onClick={onFinish} variant="primary">
                  إنهاء القصة 🎉
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
