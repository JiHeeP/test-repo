import React, { useState, useEffect } from 'react';
import {
  Play, Volume2, RotateCcw, CheckCircle, HelpCircle, ArrowRight, Quote, Image as ImageIcon, Hand,
  FlaskConical, Activity, ArrowRightLeft, Atom, ListOrdered, MessageSquareText, Waves, Search, Trees, BookOpen
} from 'lucide-react';

const VOCAB_DATA = [
  { id: 1, word: "용액", icon: FlaskConical, zh: "溶液", ru: "раствор", def: "두 가지 이상의 물질이 골고루 섞여 있는 액체.", example: "소금물은 짠맛이 나는 용액이에요.", color: "e0f2fe" },
  { id: 2, word: "움직임", icon: Activity, zh: "动作", ru: "движение", def: "멈추어 있지 않고 자세나 위치를 바꾸는 것.", example: "강아지의 움직임이 아주 빨라요.", color: "fef3c7" },
  { id: 3, word: "번갈다", icon: ArrowRightLeft, zh: "轮流", ru: "чередоваться", def: "한 번씩 차례를 바꾸다.", example: "친구와 번갈아 그네를 탔어요.", color: "dcfce7" },
  { id: 4, word: "입자", icon: Atom, zh: "粒子", ru: "частица", def: "눈에 보이지 않을 만큼 아주 작은 알갱이.", example: "공기 중에는 작은 입자가 떠다녀요.", color: "f3e8ff" },
  { id: 5, word: "방식", icon: ListOrdered, zh: "方式", ru: "способ", def: "어떤 일을 해 나가는 일정한 방법.", example: "문제를 푸는 방식이 서로 달라요.", color: "ffedd5" },
  { id: 6, word: "설명", icon: MessageSquareText, zh: "说明", ru: "объяснение", def: "어떤 내용을 상대방이 잘 알도록 밝혀 말하는 것.", example: "선생님이 놀이 규칙을 설명해 주셨어요.", color: "fee2e2" },
  { id: 7, word: "영향", icon: Waves, zh: "影响", ru: "влияние", def: "어떤 것의 힘이 다른 것에 미치는 것.", example: "날씨는 우리 생활에 많은 영향을 줘요.", color: "e0e7ff" },
  { id: 8, word: "관찰", icon: Search, zh: "观察", ru: "наблюдение", def: "사물이나 현상을 주의 깊게 자세히 살펴보는 것.", example: "개미가 움직이는 것을 관찰했어요.", color: "ccfbf1" },
  { id: 9, word: "환경", icon: Trees, zh: "环境", ru: "окружающая среда", def: "생물이 살아가는 데 영향을 주는 주변의 모든 것.", example: "우리는 깨끗한 환경을 보호해야 해요.", color: "d1fae5" },
  { id: 10, word: "주제", icon: BookOpen, zh: "主题", ru: "тема", def: "대화나 글의 중심이 되는 문제나 생각.", example: "오늘 토론의 주제는 '급식'입니다.", color: "fce7f3" }
];

export default function Step01({ onComplete }) {
  const [step, setStep] = useState('start');
  const [language, setLanguage] = useState('ko');
  const [deck, setDeck] = useState([]);
  const [unknownDeck, setUnknownDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const playAudio = (text, rate = 0.8) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (step === 'learning' && deck.length > 0) {
      const currentWord = deck[currentIndex];
      if (!isFlipped) {
        playAudio(currentWord.word, 0.7);
      } else {
        const text = `${currentWord.word}. ${currentWord.def}. 예문. ${currentWord.example}`;
        playAudio(text, 0.85);
      }
    }
  }, [currentIndex, isFlipped, step, deck]);

  const handleStart = (selectedLang) => {
    setLanguage(selectedLang);
    setDeck([...VOCAB_DATA]);
    setUnknownDeck([]);
    setCurrentIndex(0);
    setStep('learning');
    setIsFlipped(false);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRate = (isKnown, e) => {
    e.stopPropagation();
    const currentWord = deck[currentIndex];
    if (!isKnown) {
      if (!unknownDeck.some(w => w.id === currentWord.id)) {
        setUnknownDeck(prev => [...prev, currentWord]);
      }
    }
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setStep('completed');
      setShowModal(true);
    }
  };

  const handleRetry = () => {
    setDeck([...unknownDeck]);
    setUnknownDeck([]);
    setCurrentIndex(0);
    setStep('learning');
    setIsFlipped(false);
    setShowModal(false);
  };

  const handleNextStep = () => {
    if (onComplete) onComplete();
  };

  const handleQuit = () => {
    setStep('start');
    setShowModal(false);
  };

  const currentWord = deck[currentIndex];
  const progressPercent = deck.length > 0 ? ((currentIndex + 1) / deck.length) * 100 : 0;

  if (step === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-600 p-4 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center" style={{ fontFamily: 'Gaegu, cursive' }}>어휘의 징검다리</h1>
        <p className="text-lg md:text-xl font-light mb-8 text-center opacity-90">
          Step 1. 소리와 그림으로 단어 익히기<br />
          <span className="text-sm opacity-70">학습할 언어를 선택하세요</span>
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <LanguageButton label="한국어" flag="🇰🇷" onClick={() => handleStart('ko')} />
          <LanguageButton label="중국어 (中文)" flag="🇨🇳" onClick={() => handleStart('zh')} />
          <LanguageButton label="러시아어 (Русский)" flag="🇷🇺" onClick={() => handleStart('ru')} />
        </div>
        <p className="mt-8 text-sm opacity-70 flex items-center gap-2">
          <Volume2 size={16} /> 소리가 자동으로 재생됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md mb-6 mt-12">
        <div className="flex justify-between items-end mb-2 px-2">
          <span className="text-lg font-bold text-slate-700">학습 진행중</span>
          <span className="text-blue-600 font-bold">{currentIndex + 1} / {deck.length}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="w-full max-w-md h-[600px] relative" style={{ perspective: '1000px' }}>
        <div
          onClick={handleFlip}
          className="relative w-full h-full bg-white rounded-3xl shadow-xl border border-slate-200 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl"
        >
          {!isFlipped && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white" style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <div className="absolute top-6 right-6 text-slate-400 text-sm font-bold flex items-center gap-1 animate-pulse">
                <Hand size={16} /> 터치해서 뒤집기
              </div>
              <div
                className="w-64 h-64 rounded-2xl mb-8 flex items-center justify-center border-2 border-blue-100 overflow-hidden shadow-inner"
                style={{ backgroundColor: `#${currentWord.color}` }}
              >
                <currentWord.icon size={120} className="text-slate-700 opacity-80" />
              </div>
              <h2 className="text-6xl font-black text-slate-800 mb-8 tracking-tight">{currentWord.word}</h2>
              <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-6 py-3 rounded-full shadow-sm">
                <Volume2 size={24} />
                <span className="text-lg">소리 듣기</span>
              </div>
            </div>
          )}

          {isFlipped && (
            <div className="absolute inset-0 flex flex-col p-6 bg-slate-50" style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <div className="w-full flex justify-end mb-2">
                <div className="text-slate-400 text-sm font-bold flex items-center gap-1">
                  <RotateCcw size={14} /> 앞면 보기
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center w-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex flex-col items-center justify-center w-full mb-4 mt-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-bold text-slate-800">{currentWord.word}</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); playAudio(currentWord.word, 0.7); }}
                      className="text-blue-500 hover:text-blue-700 bg-blue-100 p-2 rounded-full transition-colors"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  {language !== 'ko' && (
                    <p className="text-slate-400 font-medium text-xl mt-1">
                      {language === 'zh' ? currentWord.zh : currentWord.ru}
                    </p>
                  )}
                </div>
                <div className="w-full bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-sm text-center">
                  <p className="text-slate-600 text-lg leading-snug break-keep">{currentWord.def}</p>
                </div>
                <div className="w-full bg-yellow-50 p-4 rounded-xl border border-yellow-100 shadow-sm mb-6 text-left relative">
                  <span className="text-xs font-bold text-yellow-600 block mb-2 flex items-center gap-1">
                    <Quote size={12} /> 예문
                  </span>
                  <p
                    className="text-xl font-medium text-slate-800 break-keep leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: currentWord.example.replace(currentWord.word, `<span class="text-rose-600 bg-rose-50 px-1 rounded font-black">${currentWord.word}</span>`)
                    }}
                  />
                </div>
                <div className="w-full flex justify-center mb-2">
                  <div
                    className="w-32 h-32 rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center relative"
                    style={{ backgroundColor: `#${currentWord.color}` }}
                  >
                    <span className="absolute top-2 left-2 text-xs text-slate-400 font-bold z-10 flex items-center gap-1">
                      <ImageIcon size={12} /> 그림
                    </span>
                    <currentWord.icon size={64} className="text-slate-700 opacity-80" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-200 w-full">
                <button
                  onClick={(e) => handleRate(false, e)}
                  className="bg-white border-2 border-orange-200 text-orange-500 py-4 rounded-xl font-bold hover:bg-orange-50 transition-colors flex flex-col items-center justify-center gap-1 shadow-sm"
                >
                  <HelpCircle size={24} />
                  <span>몰라요</span>
                </button>
                <button
                  onClick={(e) => handleRate(true, e)}
                  className="bg-blue-600 border-2 border-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex flex-col items-center justify-center gap-1 shadow-md"
                >
                  <CheckCircle size={24} />
                  <span>알아요</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-blue-100 relative">
            {unknownDeck.length > 0 ? (
              <>
                <div className="text-6xl mb-4">💪</div>
                <h2 className="text-3xl font-bold mb-3 text-slate-800" style={{ fontFamily: 'Gaegu, cursive' }}>조금 더 힘내볼까요?</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  총 <span className="font-bold text-blue-600">{deck.length}</span>개 중 <span className="font-bold text-orange-500">{unknownDeck.length}</span>개 단어를<br/>더 공부해야 해요.
                </p>
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-transform hover:scale-105 mb-3 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} /> 틀린 단어 복습하기
                </button>
                <button onClick={handleQuit} className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold hover:bg-slate-200">
                  오늘은 그만하기
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold mb-3 text-slate-800" style={{ fontFamily: 'Gaegu, cursive' }}>완벽해요!</h2>
                <p className="text-lg text-slate-600 mb-8">모든 단어를 마스터했습니다.<br/>참 잘했어요!</p>
                <button
                  onClick={handleNextStep}
                  className="w-full bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 shadow-lg transition-transform hover:scale-105 animate-pulse flex items-center justify-center gap-2"
                >
                  다음 단계로 <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function LanguageButton({ label, flag, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white text-blue-600 px-6 py-4 rounded-xl text-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 border border-blue-100"
    >
      <span className="text-2xl">{flag}</span>
      <span>{label}</span>
    </button>
  );
}
