import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, HelpCircle, CheckCircle, AlertCircle, Play, RotateCcw } from 'lucide-react';

const VOCAB_DATA = [
  { id: 1, dictionaryForm: "움직임", targetWord: "움직임", syllables: ["움", "직", "임"], sentencePre: "강아지의 ", sentencePost: "이 빨라요.", definition: "멈추어 있지 않고 자세나 위치를 바꾸는 것", distractors: ["짐", "이"], imageIcon: "🐕" },
  { id: 2, dictionaryForm: "번갈다", targetWord: "번갈아", syllables: ["번", "갈", "아"], sentencePre: "친구와 순서를 ", sentencePost: " 놀아요.", definition: "한 번씩 차례를 바꾸다", distractors: ["다", "라"], imageIcon: "🔄" },
  { id: 3, dictionaryForm: "방식", targetWord: "방식", syllables: ["방", "식"], sentencePre: "문제를 푸는 ", sentencePost: "이 서로 달라요.", definition: "일정한 방법", distractors: ["반", "시"], imageIcon: "📝" },
  { id: 4, dictionaryForm: "설명", targetWord: "설명", syllables: ["설", "명"], sentencePre: "선생님이 규칙을 ", sentencePost: "해 주셨어요.", definition: "알기 쉽게 밝혀 말하는 것", distractors: ["서", "면"], imageIcon: "🗣️" },
  { id: 5, dictionaryForm: "영향", targetWord: "영향", syllables: ["영", "향"], sentencePre: "날씨는 우리 생활에 ", sentencePost: "을 줘요.", definition: "어떤 것의 힘이 다른 것에 미치는 것", distractors: ["양", "앙"], imageIcon: "☀️" },
  { id: 6, dictionaryForm: "관찰", targetWord: "관찰", syllables: ["관", "찰"], sentencePre: "개미가 움직이는 것을 ", sentencePost: "해요.", definition: "자세히 살펴보는 것", distractors: ["권", "살"], imageIcon: "🔍" },
  { id: 7, dictionaryForm: "환경", targetWord: "환경", syllables: ["환", "경"], sentencePre: "우리는 깨끗한 ", sentencePost: "을 보호해요.", definition: "생물에게 영향을 주는 주변의 모든 것", distractors: ["한", "겅"], imageIcon: "🌳" },
  { id: 8, dictionaryForm: "주제", targetWord: "주제", syllables: ["주", "제"], sentencePre: "오늘 토론의 ", sentencePost: "는 '급식'입니다.", definition: "대화나 글의 중심 생각", distractors: ["조", "재"], imageIcon: "💡" }
];

export default function Step04({ onComplete }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [difficulty, setDifficulty] = useState('hard');
  const [currentSlots, setCurrentSlots] = useState([]);
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [isComplete, setIsComplete] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shakeSlots, setShakeSlots] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const currentData = VOCAB_DATA[currentStage];

  const speak = (text, rate = 0.9) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR'; u.rate = rate;
    window.speechSynthesis.speak(u);
  };

  const initStage = useCallback(() => {
    const data = VOCAB_DATA[currentStage];
    setCurrentSlots(Array(data.syllables.length).fill(null));
    let blocks = [...data.syllables];
    if (difficulty === 'hard') blocks = [...blocks, ...data.distractors];
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }
    setShuffledBlocks(blocks.map((char, idx) => ({ char, id: `block-${idx}`, status: 'idle' })));
    setFeedback({ type: 'info', msg: difficulty === 'easy' ? '흐린 글자를 따라 블록을 넣어보세요.' : '문장을 완성해 보세요.' });
    setIsComplete(false);
    setIsIncorrect(false);
    setShowHint(false);
    setShakeSlots(false);
    setTimeout(() => speak(`${data.sentencePre} 무엇, ${data.sentencePost}`), 500);
  }, [currentStage, difficulty]);

  useEffect(() => { initStage(); }, [initStage]);

  const handleBlockClick = (block) => {
    if (isComplete || isIncorrect) return;
    const emptySlotIndex = currentSlots.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) return;
    const newSlots = [...currentSlots];
    newSlots[emptySlotIndex] = block;
    setCurrentSlots(newSlots);
    setShuffledBlocks(prev => prev.map(b => b.id === block.id ? { ...b, status: 'used' } : b));
    speak(block.char);
    if (emptySlotIndex === currentData.syllables.length - 1) {
      validateAnswer(newSlots);
    }
  };

  const validateAnswer = (slots) => {
    const formedWord = slots.map(s => s.char).join('');
    if (formedWord === currentData.targetWord) {
      handleStageClear();
    } else {
      setIsIncorrect(true);
      setFeedback({ type: 'error', msg: '틀렸습니다. 다시 시도해 보세요.' });
      speak("틀렸습니다. 다시 해보세요.");
      setShakeSlots(true);
      setTimeout(() => setShakeSlots(false), 500);
    }
  };

  const handleRetry = () => { initStage(); speak("다시 한번 해볼까요?"); };

  const handleSlotClick = (index) => {
    if (isIncorrect || isComplete) return;
    if (!currentSlots[index]) return;
    const blockToReturn = currentSlots[index];
    const newSlots = [...currentSlots];
    newSlots[index] = null;
    setCurrentSlots(newSlots);
    setShuffledBlocks(prev => prev.map(b => b.id === blockToReturn.id ? { ...b, status: 'idle' } : b));
  };

  const handleStageClear = () => {
    setIsComplete(true);
    setFeedback({ type: 'complete', msg: '참 잘했어요! 문장이 완성되었어요.' });
    setTimeout(() => speak(`${currentData.sentencePre} ${currentData.targetWord}, ${currentData.sentencePost}`), 800);
  };

  const nextStage = () => {
    if (currentStage < VOCAB_DATA.length - 1) {
      setCurrentStage(prev => prev + 1);
    } else {
      setAllDone(true);
    }
  };

  if (allDone) {
    return (
      <div className="min-h-screen bg-amber-50 font-sans flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Step 4 완료!</h2>
          <p className="text-slate-600 mb-8">모든 단어를 성공적으로 조립했어요!</p>
          <button onClick={() => onComplete && onComplete()} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 shadow-lg flex items-center justify-center gap-2 mb-3">
            다음 단계로 →
          </button>
          <button onClick={() => { setAllDone(false); setCurrentStage(0); }} className="w-full bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold hover:bg-slate-200 flex items-center justify-center gap-2">
            <RotateCcw size={18} /> 다시 풀기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 font-sans flex flex-col items-center p-4">
      <header className="w-full max-w-2xl flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm mt-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">{currentStage + 1}</div>
          <span className="text-gray-500 text-sm">/ {VOCAB_DATA.length}</span>
        </div>
        <h1 className="text-lg font-bold text-gray-800">어휘의 징검다리 - Step 4</h1>
        <button
          onClick={() => setDifficulty(d => d === 'easy' ? 'hard' : 'easy')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            difficulty === 'easy' ? 'bg-green-100 text-green-700 ring-2 ring-green-400' : 'bg-red-100 text-red-700 ring-2 ring-red-400'
          }`}
        >
          {difficulty === 'easy' ? 'EASY' : 'HARD'}
        </button>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-400"></div>
          <button onClick={() => setShowHint(true)} className="absolute top-4 right-4 text-gray-400 hover:text-indigo-500 transition-colors">
            <HelpCircle size={24} />
          </button>
          <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center text-6xl shadow-inner mb-2 border-4 border-white">
            {currentData.imageIcon}
          </div>
          <div className="flex flex-wrap justify-center items-end gap-2 text-xl md:text-2xl font-medium text-gray-700 leading-relaxed text-center">
            <span>{currentData.sentencePre}</span>
            <div className={`flex gap-1 mx-1 ${shakeSlots ? 'animate-bounce' : ''}`}>
              {currentData.syllables.map((char, idx) => (
                <div key={idx} onClick={() => handleSlotClick(idx)}
                  className={`w-12 h-14 md:w-16 md:h-20 rounded-xl flex items-center justify-center text-2xl font-bold cursor-pointer transition-all border-b-4 relative
                    ${currentSlots[idx]
                      ? (isIncorrect ? 'bg-red-100 border-red-300 text-red-600' : 'bg-indigo-500 text-white border-indigo-700 shadow-lg')
                      : 'bg-gray-100 border-gray-300'
                    }`}
                >
                  {currentSlots[idx] ? currentSlots[idx].char : (difficulty === 'easy' ? <span className="text-gray-300">{char}</span> : '')}
                </div>
              ))}
            </div>
            <span>{currentData.sentencePost}</span>
          </div>
          <div className={`h-8 flex items-center gap-2 text-sm font-bold transition-all ${
            feedback.type === 'error' ? 'text-red-500' : feedback.type === 'complete' ? 'text-green-600' : 'text-gray-400'
          }`}>
            {feedback.type === 'error' && <AlertCircle size={16} />}
            {feedback.type === 'complete' && <CheckCircle size={16} />}
            {feedback.msg}
          </div>
        </div>

        <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center relative min-h-[200px]">
          {isIncorrect ? (
            <div className="text-center">
              <div className="text-4xl mb-2">🤔</div>
              <h3 className="text-lg font-bold text-gray-600 mb-4">다시 한번 생각해 볼까요?</h3>
              <button onClick={handleRetry} className="px-6 py-3 bg-red-500 text-white rounded-full text-lg font-bold shadow-lg hover:bg-red-600 flex items-center gap-2 mx-auto">
                <RotateCcw size={20} /> 다시 풀기
              </button>
            </div>
          ) : isComplete ? (
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-indigo-600 mb-6">참 잘했어요!</h3>
              <button onClick={nextStage} className="px-8 py-3 bg-indigo-600 text-white rounded-full text-lg font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
                다음 문제 <Play size={20} fill="currentColor" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 mb-4 text-sm font-medium">
                {difficulty === 'hard' ? '알맞은 글자를 골라 빈칸을 채우세요.' : '흐린 글자를 보고 똑같은 블록을 찾아보세요.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {shuffledBlocks.map(block => {
                  if (block.status === 'used') return null;
                  return (
                    <button key={block.id} onClick={() => handleBlockClick(block)}
                      className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl shadow-md border-2 border-indigo-100 text-xl font-bold text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:scale-105 active:scale-95 transition-all"
                    >
                      {block.char}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {showHint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowHint(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">도움말</h3>
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="text-6xl bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 shadow-sm">{currentData.imageIcon}</div>
              <p className="text-lg font-bold text-gray-700 leading-snug break-keep bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                {currentData.definition}
              </p>
            </div>
            <button onClick={() => setShowHint(false)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md">
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
