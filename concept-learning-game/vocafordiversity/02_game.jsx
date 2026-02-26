import React, { useState, useEffect, useRef } from 'react';
import { 
  FlaskConical, 
  Search, 
  Trees, 
  Grip, 
  Workflow, 
  MessageSquare, 
  BookOpen, 
  ArrowRightLeft, 
  Activity, 
  Repeat,
  Volume2,
  Trash2,
  Hand,
  Lightbulb,
  Puzzle
} from 'lucide-react';

/**
 * [Sound Manager]
 * 외부 MP3 파일 없이 브라우저 내장 AudioContext로 효과음을 합성하는 함수입니다.
 */
const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'correct') {
    // 딩동댕: 도-미-솔
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // 도
    osc.frequency.setValueAtTime(659.25, now + 0.1); // 미
    osc.frequency.setValueAtTime(783.99, now + 0.2); // 솔
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'wrong') {
    // 띠용: 주파수가 떨어지는 톱니파
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'eat') {
    // 와그작: 노이즈 버스트
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(20, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.2);
    // 꿀꺽 소리
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(200, now + 0.2);
    osc2.frequency.linearRampToValueAtTime(50, now + 0.4);
    gain2.gain.setValueAtTime(0.2, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.4);
  }
};

/**
 * [Game Data Expanded]
 * 총 5라운드로 확장하여 반복 학습(Spaced Repetition)을 유도합니다.
 */
const GAME_DATA = [
  // Round 1: 과학과 관찰 (기본)
  {
    id: 1,
    title: "Round 1: 과학 탐구의 기초",
    targets: [
      { id: 't1', word: '용액', icon: FlaskConical, hint_audio: "소금물은 짠맛이 나는 (  )이에요." },
      { id: 't2', word: '관찰', icon: Search, hint_audio: "돋보기로 개미를 자세히 (  )해요." },
      { id: 't3', word: '입자', icon: Grip, hint_audio: "눈에 보이지 않는 아주 작은 (  )예요." },
      { id: 't4', word: '환경', icon: Trees, hint_audio: "우리는 깨끗한 (  )을 보호해야 해요." },
    ],
    distractors: [
      { id: 'd1', word: '물', hint: "'용액'은 물보다 더 과학적인 말이에요." },
      { id: 'd2', word: '보다', hint: "'관찰'은 그냥 보는 게 아니라 자세히 보는 거예요." },
    ]
  },
  // Round 2: 생각과 표현 (추상어)
  {
    id: 2,
    title: "Round 2: 생각하고 말하기",
    targets: [
      { id: 't5', word: '방식', icon: Workflow, hint_audio: "문제를 푸는 (  )이 서로 달라요." },
      { id: 't6', word: '설명', icon: MessageSquare, hint_audio: "선생님이 놀이 규칙을 (  )해 주셨어요." },
      { id: 't7', word: '주제', icon: BookOpen, hint_audio: "오늘 토론의 (  )는 '급식'입니다." },
      { id: 't8', word: '영향', icon: ArrowRightLeft, hint_audio: "날씨는 우리 생활에 많은 (  )을 줘요." },
    ],
    distractors: [
      { id: 'd3', word: '순서', hint: "'방식'은 순서보다 더 넓은 뜻이에요." },
      { id: 'd4', word: '제목', hint: "'주제'는 제목 속에 담긴 깊은 뜻이에요." },
    ]
  },
  // Round 3: 움직임과 변화 (동사성 명사)
  {
    id: 3,
    title: "Round 3: 움직임과 변화",
    targets: [
      { id: 't9', word: '움직임', icon: Activity, hint_audio: "강아지의 (  )이 아주 빨라요." },
      { id: 't10', word: '번갈다', icon: Repeat, hint_audio: "친구와 (  ) 그네를 탔어요." },
      // 복습 단어 (앞에서 틀리기 쉬운 것 재등장)
      { id: 't1_r', word: '용액', icon: FlaskConical, hint_audio: "두 가지 물질이 섞인 액체인 (  )." },
      { id: 't5_r', word: '방식', icon: Workflow, hint_audio: "나만의 (  )으로 로봇을 조립해요." },
    ],
    distractors: [
      { id: 'd5', word: '멈춤', hint: "'움직임'의 반대말이에요." },
      { id: 'd6', word: '혼자', hint: "'번갈다'는 혼자 할 수 없어요." },
    ]
  },
  // Round 4: [심화] 헷갈리는 말 섞어 풀기 A
  {
    id: 4,
    title: "Round 4: 섞어서 풀어봐요 (심화)",
    targets: [
      { id: 't4_r', word: '환경', icon: Trees, hint_audio: "생물이 살아가는 주변, (  )." },
      { id: 't8_r', word: '영향', icon: ArrowRightLeft, hint_audio: "서로 힘을 주고받는 (  )." },
      { id: 't2_r', word: '관찰', icon: Search, hint_audio: "자세히 살펴보는 (  )." },
      { id: 't6_r', word: '설명', icon: MessageSquare, hint_audio: "알기 쉽게 말해주는 (  )." },
    ],
    distractors: [
      { id: 'd7', word: '자연', hint: "'환경'은 자연보다 더 넓은 뜻이에요." },
      { id: 'd8', word: '힘', hint: "'영향'은 힘이 미치는 것이에요." },
    ]
  },
  // Round 5: [심화] 헷갈리는 말 섞어 풀기 B (Final)
  {
    id: 5,
    title: "Round 5: 마지막 도전! (완성)",
    targets: [
      { id: 't3_r', word: '입자', icon: Grip, hint_audio: "아주 작은 알갱이, (  )." },
      { id: 't7_r', word: '주제', icon: BookOpen, hint_audio: "글의 중심 생각, (  )." },
      { id: 't9_r', word: '움직임', icon: Activity, hint_audio: "위치를 바꾸는 (  )." },
      { id: 't10_r', word: '번갈다', icon: Repeat, hint_audio: "차례를 바꾸며 (  )." },
    ],
    distractors: [
      { id: 'd9', word: '먼지', hint: "'입자'는 먼지보다 더 작은 것도 포함해요." },
      { id: 'd10', word: '이야기', hint: "'주제'는 이야기의 핵심이에요." },
    ]
  }
];

const App = () => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [cards, setCards] = useState([]); 
  const [matches, setMatches] = useState({}); 
  const [selectedCard, setSelectedCard] = useState(null); 
  const [feedback, setFeedback] = useState({ type: 'info', msg: '카드를 끌어서 그림에 넣어보세요!' });
  const [shakeId, setShakeId] = useState(null); 
  const [gameState, setGameState] = useState('playing'); // playing, clearing, round_end, all_clear
  const [draggedItem, setDraggedItem] = useState(null); 
  const [monsterEating, setMonsterEating] = useState(false);

  const currentRound = GAME_DATA[currentRoundIdx];

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; 
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    initRound();
  }, [currentRoundIdx]);

  const initRound = () => {
    const round = GAME_DATA[currentRoundIdx];
    const targetCards = round.targets.map(t => ({ ...t, type: 'target' }));
    const distractorCards = round.distractors.map(d => ({ ...d, type: 'distractor' }));
    const mixed = [...targetCards, ...distractorCards].sort(() => Math.random() - 0.5);
    
    setCards(mixed);
    setMatches({});
    setSelectedCard(null);
    setFeedback({ type: 'info', msg: '그림을 누르면 힌트 소리가 나와요.' });
    setGameState('playing');
  };

  // --- Logic Helpers ---

  const handleCorrect = (targetId, card) => {
    playSound('correct');
    speak("맞아요! " + card.word);
    
    const newMatches = { ...matches, [targetId]: card.word };
    setMatches(newMatches);
    setCards(cards.filter(c => c.id !== card.id)); 
    setSelectedCard(null);
    setFeedback({ type: 'success', msg: '참 잘했어요!' });

    if (Object.keys(newMatches).length === currentRound.targets.length) {
      setGameState('clearing');
      setFeedback({ type: 'warning', msg: '남은 카드는 몬스터에게 버려주세요!' });
      setTimeout(() => speak("와! 다 맞췄네요. 남은 가짜 카드는 몬스터에게 주세요."), 1000);
    }
  };

  const handleWrong = (targetId, card) => {
    playSound('wrong');
    setShakeId(targetId);
    setTimeout(() => setShakeId(null), 500);

    if (card.type === 'distractor') {
      speak("비슷하지만 아니에요.");
      setFeedback({ type: 'error', msg: card.hint || "뜻이 조금 달라요." });
    } else {
      speak("그 그림이 아니에요.");
      setFeedback({ type: 'error', msg: "그 그림이 아니에요." });
    }
    setSelectedCard(null); 
  };

  const handleMonsterEat = (card) => {
    if (gameState !== 'clearing') return;
    if (card.type !== 'distractor') {
        speak("그건 정답 카드예요!");
        return;
    }

    playSound('eat');
    setMonsterEating(true);
    setTimeout(() => setMonsterEating(false), 500);
    speak("꺼억!");
    
    const newCards = cards.filter(c => c.id !== card.id);
    setCards(newCards);
    setSelectedCard(null);

    if (newCards.length === 0) {
      setGameState('round_end');
      setFeedback({ type: 'success', msg: '완벽해요! 다음 단계로 갈까요?' });
      speak("완벽해요! 다음 단계로 출발!");
    }
  };

  // --- Interaction Handlers ---
  
  const handleCardClick = (card) => {
    speak(card.word);
    setSelectedCard(card);
    setFeedback({ type: 'neutral', msg: '어디에 들어갈까요? 그림을 눌러보세요.' });
  };

  const handleSlotClick = (target) => {
    if (matches[target.id]) return;

    if (!selectedCard) {
      speak(target.hint_audio);
      setFeedback({ type: 'info', msg: `힌트: ${target.hint_audio}` });
      return;
    }

    if (selectedCard.word === target.word) {
      handleCorrect(target.id, selectedCard);
    } else {
      handleWrong(target.id, selectedCard);
    }
  };

  const onDragStart = (e, card) => {
    setDraggedItem(card);
    speak(card.word);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault(); 
  };

  const onDropSlot = (e, target) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (matches[target.id]) return;

    if (draggedItem.word === target.word) {
      handleCorrect(target.id, draggedItem);
    } else {
      handleWrong(target.id, draggedItem);
    }
    setDraggedItem(null);
  };

  const onDropMonster = (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    handleMonsterEat(draggedItem);
    setDraggedItem(null);
  };

  const nextRound = () => {
    if (currentRoundIdx < GAME_DATA.length - 1) {
      setCurrentRoundIdx(currentRoundIdx + 1);
    } else {
      setGameState('all_clear');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans mx-auto shadow-xl overflow-hidden select-none max-w-3xl">
      
      {/* Header */}
      <header className="bg-white p-3 shadow-sm z-10 flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🧩</span> 어휘의 징검다리
        </h1>
        <div className="flex gap-2 items-center">
             <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Step 2: {currentRoundIdx + 1}/{GAME_DATA.length}
          </div>
        </div>
      </header>
      
      {/* Feedback Bar */}
      <div className={`text-center text-sm font-medium py-2 transition-colors duration-300 shadow-inner px-2 min-h-[40px] flex items-center justify-center
          ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 
            feedback.type === 'success' ? 'bg-green-100 text-green-700' : 
            feedback.type === 'warning' ? 'bg-orange-100 text-orange-800' :
            'bg-slate-200 text-slate-600'}`}>
          {feedback.msg}
      </div>

      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        
        {/* --- Area 1: Target Slots --- */}
        <section className="flex-1 flex items-center justify-center w-full min-h-[200px]">
           {gameState === 'all_clear' ? (
              <div className="text-center animate-bounce">
                <h2 className="text-3xl font-bold text-indigo-600 mb-4">참 잘했어요! 🎉</h2>
                <p>모든 라운드를 통과했습니다.</p>
                <div className="mt-8 flex justify-center gap-2">
                    <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
                        <Lightbulb className="text-yellow-500 mb-2" />
                        <span className="text-sm font-bold">10개 단어</span>
                        <span className="text-xs text-slate-500">완벽 암기</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
                        <Puzzle className="text-blue-500 mb-2" />
                        <span className="text-sm font-bold">블록 조립</span>
                        <span className="text-xs text-slate-500">도전 준비</span>
                    </div>
                </div>
              </div>
           ) : (
            <div className="grid grid-cols-4 gap-2 w-full h-full max-h-[250px]">
              {currentRound.targets.map((target) => {
                const isMatched = matches[target.id];
                const Icon = target.icon;
                const isShaking = shakeId === target.id;

                return (
                  <div 
                    key={target.id}
                    onClick={() => handleSlotClick(target)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDropSlot(e, target)}
                    className={`
                      relative flex flex-col items-center justify-center rounded-xl border-4 transition-all duration-200
                      ${isMatched 
                        ? 'bg-indigo-50 border-indigo-400 shadow-inner' 
                        : 'bg-white border-slate-300 hover:border-indigo-300 shadow-md'}
                      ${isShaking ? 'animate-shake border-red-400 bg-red-50' : ''}
                      cursor-pointer active:scale-95 touch-manipulation
                    `}
                  >
                    <Icon 
                      size={isMatched ? 40 : 32} 
                      className={`mb-2 transition-all ${isMatched ? 'text-indigo-600 scale-110' : 'text-slate-400'}`} 
                    />
                    
                    {isMatched ? (
                      <span className="text-lg sm:text-xl font-bold text-indigo-700 animate-pop-in break-keep text-center leading-tight">
                        {isMatched}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-8 sm:w-16 border-2 border-dashed border-slate-300 rounded flex items-center justify-center mb-1">
                          <span className="text-slate-300 text-[10px] sm:text-xs">여기</span>
                        </div>
                        <Volume2 size={14} className="text-slate-400 animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
           )}
        </section>

        {/* --- Area 2: Monster Zone --- */}
        <section className={`h-20 sm:h-24 w-full transition-all duration-500 flex justify-center items-center ${ (gameState === 'clearing' || gameState === 'round_end') ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
             {gameState === 'clearing' && (
                <div 
                  onClick={() => handleMonsterClick(selectedCard)}
                  onDragOver={onDragOver}
                  onDrop={onDropMonster}
                  className={`
                    w-full max-w-sm h-full bg-orange-100 rounded-2xl border-4 border-dashed border-orange-300 
                    flex items-center justify-center gap-4 cursor-pointer hover:bg-orange-200 transition-all
                    ${monsterEating ? 'scale-90 bg-orange-300' : 'animate-bounce-slight'}
                  `}
                >
                    <div className="text-4xl transition-transform duration-200" style={{ transform: monsterEating ? 'scale(1.5) rotate(10deg)' : 'scale(1)' }}>
                        {monsterEating ? '😋' : '👹'}
                    </div>
                    <div className="flex flex-col text-orange-800">
                        <span className="font-bold text-lg">가짜 단어 먹기</span>
                        <span className="text-xs">이곳으로 드래그하세요!</span>
                    </div>
                </div>
             )}
              {gameState === 'round_end' && (
               <button 
                onClick={nextRound}
                className="w-full max-w-sm h-16 bg-indigo-600 text-white rounded-2xl text-xl font-bold shadow-lg animate-pulse hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                다음 단계로 출발! <Hand className="rotate-90" />
              </button>
            )}
        </section>

        {/* --- Area 3: Card Deck --- */}
        <section className="bg-white p-4 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] min-h-[160px]">
           <div className="flex flex-wrap justify-center gap-3">
             {gameState !== 'all_clear' && gameState !== 'round_end' && cards.map((card) => {
               const isSelected = selectedCard && selectedCard.id === card.id;
               return (
                 <div
                   key={card.id}
                   draggable={true}
                   onDragStart={(e) => onDragStart(e, card)}
                   onClick={() => handleCardClick(card)}
                   className={`
                     px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-md text-lg sm:text-xl font-bold border-b-4 transition-all duration-200 cursor-grab active:cursor-grabbing select-none touch-manipulation
                     ${isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-800 -translate-y-2 ring-2 ring-indigo-300' 
                        : 'bg-white text-slate-700 border-slate-300 hover:-translate-y-1 hover:border-indigo-400'}
                   `}
                 >
                   {card.word}
                 </div>
               );
             })}
             {cards.length === 0 && gameState === 'clearing' && (
                 <div className="text-slate-400 font-medium">남은 카드가 없어요!</div>
             )}
           </div>
        </section>

      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.4s ease-out;
        }
        @keyframes bounce-slight {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-5px); }
        }
        .animate-bounce-slight {
          animation: bounce-slight 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;