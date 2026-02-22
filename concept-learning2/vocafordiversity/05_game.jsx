import React, { useState, useEffect } from 'react';
import { 
  Shuffle, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Trophy, 
  ArrowRight, 
  BookOpen, 
  Lightbulb,
  Puzzle,
  Star,
  Play,
  Lock,
  Unlock
} from 'lucide-react';

// ----------------------------------------------------------------------
// 1. DATA SET (Contextualized + Vocab Distractors)
// ----------------------------------------------------------------------
const GAME_DATA = [
  {
    id: 1,
    word: "움직임",
    meaning: "자세나 자리 등이 바뀜",
    chunks: ["나는", "체육 시간에", "친구의 움직임을", "관찰했다."],
    targetIndex: 2, 
    // [Step 1] 같은 조사('을'), 다른 단어('믿음') -> 맥락으로 풀어야 함
    vocabDistractor: "친구의 믿음을", 
    hints: ["누가?", "언제?", "무엇을?", "어찌했나?"],
    // [Step 2] 문장 조립용 오답
    fullDistractors: ["친구의 움직임이", "무시했다."] 
  },
  {
    id: 2,
    word: "방식",
    meaning: "일정한 방법이나 형식",
    chunks: ["우리는", "친구들에게", "해결 방식을", "설명했다."],
    targetIndex: 2,
    vocabDistractor: "해결 방석을", // 방식 vs 방석 (소리 유사)
    hints: ["누가?", "누구에게?", "무엇을?", "어찌했나?"],
    fullDistractors: ["해결 방식이", "포기했다."] 
  },
  {
    id: 3,
    word: "영향",
    meaning: "어떤 것의 효과나 작용",
    chunks: ["날씨는", "우리 생활에", "큰 영향을", "준다."],
    targetIndex: 2,
    vocabDistractor: "큰 영양을", // 영향 vs 영양
    hints: ["무엇은?", "어디에?", "어떤 것을?", "어찌하나?"],
    fullDistractors: ["큰 영향이", "받는다."] 
  },
  {
    id: 4,
    word: "환경",
    meaning: "생물에게 영향을 주는 조건",
    chunks: ["우리는", "미래를 위해", "깨끗한 환경을", "만든다."],
    targetIndex: 2,
    vocabDistractor: "깨끗한 안경을", // 환경 vs 안경
    hints: ["누가?", "왜?", "무엇을?", "어찌하나?"],
    fullDistractors: ["깨끗한 환경이", "부순다."] 
  },
  {
    id: 5,
    word: "재다",
    meaning: "길이, 무게 등을 헤아리다",
    chunks: ["나는", "수학 시간에", "자로 길이를", "재어 보았다."],
    targetIndex: 2,
    vocabDistractor: "자로 무게를", // 길이 vs 무게 (자로 잴 수 없는 것)
    hints: ["누가?", "언제?", "무엇을?", "어찌했나?"],
    fullDistractors: ["자로 길이가", "세어 보았다."] 
  },
  {
    id: 6,
    word: "측정",
    meaning: "양을 재어서 정함",
    chunks: ["나는", "양호실에서", "몸무게 측정을", "하고 왔다."],
    targetIndex: 2,
    vocabDistractor: "몸무게 걱정을", // 측정 vs 걱정
    hints: ["누가?", "어디서?", "무엇을?", "어찌했나?"],
    fullDistractors: ["몸무게 측정이", "놀러 갔다."] 
  },
  {
    id: 7,
    word: "추측",
    meaning: "미루어 생각하여 헤아림",
    chunks: ["우리는", "이야기를 듣고", "정답을 추측해", "보았다."],
    targetIndex: 2, 
    vocabDistractor: "정답을 추천해", // 추측 vs 추천
    hints: ["누가?", "무엇을 하고?", "무엇을?", "어찌했나?"],
    fullDistractors: ["정답이", "기억해 보았다."] 
  },
  {
    id: 8,
    word: "단서",
    meaning: "어떤 일의 실마리",
    chunks: ["탐정이", "바닥에서", "범인의 단서를", "찾았다."],
    targetIndex: 2,
    vocabDistractor: "범인의 단추를", // 단서 vs 단추 (소리/상황 유사)
    hints: ["누가?", "어디서?", "무엇을?", "어찌했나?"],
    fullDistractors: ["범인의 단서가", "잃어버렸다."] 
  },
  {
    id: 9,
    word: "짐작",
    meaning: "사정이나 형편을 어림잡음",
    chunks: ["나는", "목소리로", "친구의 기분을", "짐작했다."],
    targetIndex: 2,
    vocabDistractor: "친구의 기운을", // 기분 vs 기운
    hints: ["누가?", "무엇으로?", "무엇을?", "어찌했나?"],
    fullDistractors: ["친구의 기분이", "질문했다."] 
  },
  {
    id: 10,
    word: "계획",
    meaning: "앞으로 할 일의 절차",
    chunks: ["나는", "방학 동안", "실천할 계획을", "세웠다."],
    targetIndex: 2,
    vocabDistractor: "실천할 기회를", // 계획 vs 기회
    hints: ["누가?", "언제?", "무엇을?", "어찌했나?"],
    fullDistractors: ["실천할 계획이", "지웠다."] 
  }
];

// ----------------------------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------------------------
export default function App() {
  const [stage, setStage] = useState(1); // 1: Vocab Quiz (Blind), 2: Sentence Builder
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, transition, complete

  // --- Step 1 States ---
  const [grammarSelection, setGrammarSelection] = useState(null); 
  const [grammarFeedback, setGrammarFeedback] = useState('idle'); 
  const [currentOptions, setCurrentOptions] = useState([]); 
  
  // --- Step 2 States ---
  const [slots, setSlots] = useState([]);       
  const [bank, setBank] = useState([]);         
  const [feedback, setFeedback] = useState('idle'); 
  const [lockedIndices, setLockedIndices] = useState([]); 
  const [removedDistractors, setRemovedDistractors] = useState([]); 
  const [hintsUsedCount, setHintsUsedCount] = useState(0); 

  const [score, setScore] = useState(0);

  // Initialize Logic
  useEffect(() => {
    if (gameState === 'playing') {
      initializeProblem(currentProblemIndex, stage);
    }
  }, [currentProblemIndex, stage, gameState]);

  const initializeProblem = (pIdx, currentStage) => {
    const problem = GAME_DATA[pIdx];

    if (currentStage === 1) {
      // Stage 1 Init: Blind Vocab Selection
      setGrammarSelection(null);
      setGrammarFeedback('idle');
      
      const options = [problem.chunks[problem.targetIndex], problem.vocabDistractor];
      const shuffled = options.sort(() => Math.random() - 0.5);
      setCurrentOptions(shuffled);

    } else {
      // Stage 2 Init: Sentence Builder
      const allCards = [...problem.chunks, ...problem.fullDistractors];
      const shuffled = allCards.sort(() => Math.random() - 0.5);
      
      setBank(shuffled);
      setSlots(new Array(problem.chunks.length).fill(null));
      setFeedback('idle');
      setLockedIndices([]);
      setRemovedDistractors([]);
      setHintsUsedCount(0);
    }
  };

  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------
  const handleVocabCheck = (selectedOption) => {
    const problem = GAME_DATA[currentProblemIndex];
    const correctOption = problem.chunks[problem.targetIndex];

    setGrammarSelection(selectedOption);

    if (selectedOption === correctOption) {
      setGrammarFeedback('correct');
      setScore(prev => prev + 1); 
      setTimeout(() => {
        if (currentProblemIndex < GAME_DATA.length - 1) {
            setCurrentProblemIndex(prev => prev + 1);
        } else {
            setGameState('transition');
        }
      }, 1000);
    } else {
      setGrammarFeedback('wrong');
      setTimeout(() => {
        setGrammarSelection(null);
        setGrammarFeedback('idle');
      }, 1000);
    }
  };

  const handleBankClick = (card, bankIndex) => {
    if (feedback === 'correct') return;
    const emptySlotIndex = slots.findIndex(s => s === null);
    if (emptySlotIndex === -1) {
        setFeedback('full');
        setTimeout(() => setFeedback('idle'), 1000);
        return; 
    }
    const newBank = [...bank];
    newBank.splice(bankIndex, 1);
    const newSlots = [...slots];
    newSlots[emptySlotIndex] = card;
    setBank(newBank);
    setSlots(newSlots);
    setFeedback('idle');
  };

  const handleSlotClick = (card, slotIndex) => {
    if (feedback === 'correct') return;
    if (lockedIndices.includes(slotIndex)) return; 
    const newSlots = [...slots];
    newSlots[slotIndex] = null; 
    setBank([...bank, card]); 
    setSlots(newSlots);
    setFeedback('idle');
  };

  const handleReset = () => {
    if (feedback === 'correct') return;
    const cardsToReturn = [];
    const newSlots = [...slots];
    newSlots.forEach((card, index) => {
      if (card && !lockedIndices.includes(index)) {
        cardsToReturn.push(card);
        newSlots[index] = null;
      }
    });
    if (cardsToReturn.length === 0) return;
    setSlots(newSlots);
    setBank([...bank, ...cardsToReturn]);
    setFeedback('idle');
  };

  const checkAnswer = () => {
    const problem = GAME_DATA[currentProblemIndex];
    const correctChunks = problem.chunks;
    
    if (slots.some(s => s === null)) {
      setFeedback('incomplete');
      setTimeout(() => setFeedback('idle'), 1000);
      return;
    }

    const newLocked = [];
    const wrongIndices = [];
    slots.forEach((card, index) => {
      if (card === correctChunks[index]) {
        newLocked.push(index);
      } else {
        wrongIndices.push(index);
      }
    });

    if (wrongIndices.length === 0) {
      setFeedback('correct');
      const roundScore = hintsUsedCount === 0 ? 2 : 1; 
      setScore(prev => prev + roundScore); 
      
      setTimeout(() => {
        if (currentProblemIndex < GAME_DATA.length - 1) {
          setCurrentProblemIndex(prev => prev + 1);
        } else {
          setGameState('complete');
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setLockedIndices([...lockedIndices, ...newLocked]); 
      const cardsToReturn = wrongIndices.map(idx => slots[idx]);
      const newSlots = [...slots];
      wrongIndices.forEach(idx => newSlots[idx] = null);
      setTimeout(() => {
        setSlots(newSlots);
        setBank([...bank, ...cardsToReturn]);
        setFeedback('idle');
      }, 800);
    }
  };

  const useHint = () => {
    const problem = GAME_DATA[currentProblemIndex];
    const availableDistractors = problem.fullDistractors.filter(d => !removedDistractors.includes(d));
    if (availableDistractors.length === 0) return; 
    const targetDistractor = availableDistractors[0];

    if (bank.includes(targetDistractor)) {
      setBank(bank.filter(c => c !== targetDistractor));
    } else if (slots.includes(targetDistractor)) {
      const slotIndex = slots.indexOf(targetDistractor);
      if (!lockedIndices.includes(slotIndex)) {
        const newSlots = [...slots];
        newSlots[slotIndex] = null;
        setSlots(newSlots);
      }
    }
    setRemovedDistractors([...removedDistractors, targetDistractor]);
    setHintsUsedCount(prev => prev + 1);
  };

  const startStage2 = () => {
      setStage(2);
      setCurrentProblemIndex(0);
      setGameState('playing');
  };

  // ----------------------------------------------------------------------
  // RENDER HELPERS
  // ----------------------------------------------------------------------
  const problem = GAME_DATA[currentProblemIndex];
  const maxScore = GAME_DATA.length * 3; 

  // --- RENDER: COMPLETE ---
  if (gameState === 'complete') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 animate-in zoom-in duration-500">
           <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 p-4 rounded-full animate-bounce">
              <Trophy className="w-20 h-20 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">모든 미션 클리어!</h1>
          <p className="text-slate-600 mb-8 font-medium">단어와 문장을 완벽하게 익혔어요.</p>
          <div className="bg-blue-50 p-6 rounded-2xl mb-8">
            <p className="text-sm text-blue-500 uppercase font-bold tracking-wider mb-2">최종 점수</p>
            <div className="flex items-end justify-center gap-2">
              <span className="text-6xl font-black text-blue-600">{score}</span>
              <span className="text-2xl font-bold text-blue-300 mb-3">/ {maxScore}</span>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-lg">
            처음부터 다시 하기
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: TRANSITION ---
  if (gameState === 'transition') {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 font-sans text-white">
        <div className="max-w-md w-full text-center animate-in slide-in-from-bottom duration-700">
            <div className="flex justify-center mb-6">
                <Star className="w-24 h-24 text-yellow-300 animate-spin-slow" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-black mb-4">1단계 성공!</h1>
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
                단어의 뜻을 잘 알고 있네요.<br/>
                이제 배운 단어로 <b>문장</b>을 만들어 볼까요?
            </p>
            
            <div className="bg-white/10 p-6 rounded-2xl mb-10 backdrop-blur-sm">
                <p className="text-indigo-200 font-bold mb-2">현재 점수</p>
                <p className="text-5xl font-black">{score}점</p>
            </div>

            <button 
                onClick={startStage2}
                className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-5 rounded-2xl transition-all shadow-xl text-xl flex items-center justify-center gap-2"
            >
                2단계 시작하기 <Play fill="currentColor" />
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER: PLAYING ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${stage === 1 ? 'bg-orange-100' : 'bg-indigo-100'}`}>
              <Puzzle size={20} className={stage === 1 ? 'text-orange-600' : 'text-indigo-600'} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">문해력 사다리</h1>
              <p className="text-xs text-slate-500 font-medium">
                {stage === 1 ? 'Step 1. 알맞은 말 고르기' : 'Step 2. 문장 만들기'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">Score: {score}</div>
             <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                <span className="text-xs font-bold text-slate-400">진행</span>
                <span className={`text-xs font-bold ${stage === 1 ? 'text-orange-600' : 'text-indigo-600'}`}>
                    {currentProblemIndex + 1} / {GAME_DATA.length}
                </span>
             </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
             <div 
                className={`h-full transition-all duration-500 ease-out ${stage === 1 ? 'bg-orange-500' : 'bg-indigo-500'}`} 
                style={{ width: `${((currentProblemIndex) / GAME_DATA.length) * 100}%` }} 
            />
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col">
        {/* Context - BLIND MODE IMPLEMENTED HERE */}
        <div className="mt-4 mb-6 text-center">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 tracking-wide uppercase ${stage === 1 ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {stage === 1 ? <Lock size={12}/> : <Unlock size={12} />} 
            {stage === 1 ? ' 낱말 퀴즈' : ' 핵심 어휘'}
          </div>
          
          <h2 className={`text-4xl font-black mb-3 tracking-tight ${stage === 1 ? 'text-slate-300 tracking-widest' : 'text-slate-800'}`}>
            {stage === 1 ? '?????' : problem.word}
          </h2>
          
          {/* Meaning is emphasized in Stage 1 as the key hint */}
          <div className={`transition-all duration-500 ${stage === 1 ? 'transform scale-110' : ''}`}>
             <p className={`font-medium text-lg leading-relaxed word-keep-all ${stage === 1 ? 'text-slate-700 bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm' : 'text-slate-500'}`}>
                "{problem.meaning}"
             </p>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* STAGE 1: Vocabulary Quiz UI                        */}
        {/* -------------------------------------------------- */}
        {stage === 1 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sentence with Blank */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 text-center mb-8">
               <div className="flex flex-wrap justify-center items-center gap-3 text-xl font-bold text-slate-700 leading-loose">
                  {problem.chunks.map((chunk, idx) => (
                    idx === problem.targetIndex ? (
                      <div key={idx} className="w-32 h-10 border-b-4 border-orange-200 bg-orange-50 rounded mx-1 animate-pulse flex items-center justify-center text-orange-200">
                        <HelpCircle size={20} />
                      </div>
                    ) : (
                      <span key={idx}>{chunk}</span>
                    )
                  ))}
               </div>
               <p className="text-slate-400 text-sm mt-6 font-medium">뜻을 생각하며 빈칸에 알맞은 말을 골라보세요.</p>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-4">
               {currentOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVocabCheck(option)}
                      disabled={grammarFeedback !== 'idle'}
                      className={`
                        py-6 rounded-2xl text-xl font-bold shadow-sm border-2 transition-all
                        ${grammarSelection === option 
                            ? (grammarFeedback === 'correct' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800')
                            : 'bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:bg-orange-50'
                        }
                      `}
                    >
                      {option}
                      {grammarSelection === option && grammarFeedback === 'correct' && <CheckCircle className="inline-block ml-2 w-6 h-6"/>}
                    </button>
                  ))
               }
            </div>
            
             <div className="h-8 mt-4 text-center">
                {grammarFeedback === 'correct' && <span className="text-green-600 font-bold animate-bounce">정답입니다!</span>}
                {grammarFeedback === 'wrong' && <span className="text-rose-500 font-bold animate-shake">뜻을 다시 한번 읽어보세요.</span>}
             </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* STAGE 2: Sentence Builder UI (Revealed Word)       */}
        {/* -------------------------------------------------- */}
        {stage === 2 && (
          <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Slot Area */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 mb-6 relative min-h-[160px] flex flex-col justify-center">
                <button onClick={handleReset} className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 p-2 rounded-full hover:bg-slate-50 transition-colors" title="초기화">
                    <RotateCcw size={18} />
                </button>

                <div className="flex flex-wrap gap-2 justify-center items-center mt-4">
                    {slots.map((card, index) => (
                    <div key={`slot-container-${index}`} className="relative group">
                        {!card && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300 pointer-events-none select-none z-0">
                                {problem.hints[index]}
                            </div>
                        )}
                        <button
                            onClick={() => card && handleSlotClick(card, index)}
                            disabled={lockedIndices.includes(index) || feedback === 'correct'}
                            className={`
                            relative h-14 min-w-[90px] px-4 rounded-xl text-lg font-bold transition-all duration-300 z-10
                            flex items-center justify-center border-2
                            ${card 
                                ? (lockedIndices.includes(index) 
                                    ? 'bg-green-50 text-green-700 border-green-200 cursor-default shadow-none' 
                                    : 'bg-white text-slate-800 border-indigo-200 shadow-md translate-y-[-2px] hover:border-indigo-300 hover:bg-indigo-50') 
                                : 'bg-slate-50 border-dashed border-slate-200 text-transparent hover:border-slate-300' 
                            }
                            ${feedback === 'wrong' && !lockedIndices.includes(index) && card ? 'animate-shake border-red-300 bg-red-50 text-red-500' : ''}
                            `}
                        >
                            {card || "."} 
                            {lockedIndices.includes(index) && (
                            <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-green-100">
                                <CheckCircle size={14} className="text-green-500" />
                            </div>
                            )}
                        </button>
                    </div>
                    ))}
                </div>
                
                <div className="absolute inset-x-0 -bottom-4 flex justify-center pointer-events-none z-20">
                    {feedback === 'correct' && (
                    <div className="bg-green-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-green-200 flex items-center gap-2 animate-bounce">
                        <CheckCircle size={18} /> 참 잘했어요!
                    </div>
                    )}
                    {feedback === 'wrong' && (
                    <div className="bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-rose-200 flex items-center gap-2 animate-shake">
                        <AlertCircle size={18} /> 틀린 부분이 있어요
                    </div>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <button 
                onClick={useHint}
                disabled={hintsUsedCount >= problem.fullDistractors.length || feedback === 'correct'}
                className={`col-span-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border
                  ${hintsUsedCount > 0 ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 active:scale-95'}
                `}
              >
                <HelpCircle size={20} />
                {hintsUsedCount > 0 ? '힌트 씀' : '함정 제거'}
              </button>

              <button
                onClick={checkAnswer}
                disabled={feedback === 'correct'}
                className={`col-span-2 py-3.5 rounded-2xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2
                  ${slots.some(s => s === null) ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-200'}
                `}
              >
                정답 확인 <ArrowRight size={20} />
              </button>
            </div>

            {/* Word Bank */}
            <div className="bg-slate-100 p-6 rounded-3xl flex-1 flex flex-col border border-slate-200 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Shuffle size={14} /> 단어 카드
                </span>
                <span className="text-xs font-medium text-slate-400">{bank.length}개 남음</span>
              </div>
              <div className="flex flex-wrap gap-2.5 content-start">
                {bank.map((card, index) => (
                  <button
                    key={`bank-${index}`}
                    onClick={() => handleBankClick(card, index)}
                    className="bg-white border-b-[3px] border-slate-300 active:border-b-0 active:translate-y-[3px] active:mt-[3px] px-4 py-2.5 rounded-xl text-lg font-bold text-slate-700 shadow-sm hover:shadow transition-all"
                  >
                    {card}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
      `}</style>
    </div>
  );
}