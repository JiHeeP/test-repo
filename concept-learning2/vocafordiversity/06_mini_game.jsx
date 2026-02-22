import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Award } from 'lucide-react';

// --- 1. 데이터셋 (v4.0 데이터 유지) ---
const VOCAB_DATA = [
  {
    word: "재다",
    good: ["키", "몸무게", "자", "줄자", "길이", "시간", "발 사이즈", "맞추다", "눈금", "크기"],
    bad: ["사과", "노래", "잠", "춤", "하늘"]
  },
  {
    word: "표시",
    good: ["스티커", "동그라미", "별표", "밑줄", "간판", "신호등", "표지판", "체크", "이름표", "깃발"],
    bad: ["투명", "바람", "숨기기", "비밀", "공기"]
  },
  {
    word: "측정",
    good: ["실험", "온도계", "저울", "체온", "비커", "기록", "숫자", "양", "높이", "과학"],
    bad: ["기분", "꿈", "친구", "놀이", "소설"]
  },
  {
    word: "정확히",
    good: ["딱 맞다", "정답", "실수 없이", "똑같이", "바르게", "100점", "시계", "약속", "꼭", "분명히"],
    bad: ["대충", "아마도", "글쎄", "몰라", "엉터리"]
  },
  {
    word: "추측",
    good: ["탐정", "범인", "이유", "생각하기", "아마도", "힌트", "까닭", "미스터리", "물음표", "상상"],
    bad: ["사실", "뉴스", "사진", "거울", "눈앞"]
  },
  {
    word: "의미",
    good: ["뜻", "말", "사전", "내용", "이해", "마음", "설명", "메시지", "중요", "해석"],
    bad: ["껍질", "종이", "그릇", "모자", "신발"]
  },
  {
    word: "단서",
    good: ["힌트", "발자국", "지문", "열쇠", "증거", "돋보기", "범인", "수수께끼", "조각", "흔적"],
    bad: ["정답", "끝", "결론", "처음", "선물"]
  },
  {
    word: "상황",
    good: ["분위기", "지금", "장면", "모습", "일", "사건", "경우", "때", "시간", "장소"],
    bad: ["필통", "지우개", "책상", "의자", "컴퓨터"]
  },
  {
    word: "짐작",
    good: ["눈치", "느낌", "대략", "왠지", "감", "찍기", "어림", "예상", "보기에", "생각"],
    bad: ["자", "저울", "시계", "계산기", "확인"]
  }
];

const VocabularyShower = () => {
  // --- Refs (Game Loop Variables - 성능을 위해 Ref 사용) ---
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  // Game State Refs (Loop 안에서 최신값 참조용)
  const gameStateRef = useRef('STOP'); // STOP, PLAYING, END
  const wordsRef = useRef([]);
  const particlesRef = useRef([]);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const currentTopicIdxRef = useRef(0);
  const collectedCountRef = useRef(0);
  const timeLeftRef = useRef(80);
  const baseSpeedRef = useRef(2.5);

  // --- State (UI Rendering용) ---
  const [uiState, setUiState] = useState({
    gameState: 'STOP',
    score: 0,
    timeLeft: 80,
    combo: 0,
    currentTopic: '준비',
    collectedCount: 0,
    showCombo: false,
    feedbackColor: null, // 'green', 'red', null
  });

  const GOAL_COUNT = 4;

  // --- Audio System ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = useCallback((type) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'good') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(); osc.stop(now + 0.3);
    } else if (type === 'bad') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(); osc.stop(now + 0.3);
    } else if (type === 'miss') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(); osc.stop(now + 0.15);
    } else if (type === 'clear') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.start(); osc.stop(now + 0.5);
    }
  }, []);

  // --- Game Logic ---

  const startGame = () => {
    initAudio();
    
    // Reset Refs
    gameStateRef.current = 'PLAYING';
    scoreRef.current = 0;
    timeLeftRef.current = 80;
    currentTopicIdxRef.current = 0;
    collectedCountRef.current = 0;
    comboRef.current = 0;
    wordsRef.current = [];
    particlesRef.current = [];
    lastTimeRef.current = performance.now();
    spawnTimerRef.current = 0;

    // Reset UI State
    setUiState({
      gameState: 'PLAYING',
      score: 0,
      timeLeft: 80,
      combo: 0,
      currentTopic: VOCAB_DATA[0].word,
      collectedCount: 0,
      showCombo: false,
      feedbackColor: null
    });

    // Start Loops
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // 1초마다 타이머 감소 (useEffect 사용)
  useEffect(() => {
    let interval = null;
    if (uiState.gameState === 'PLAYING') {
      interval = setInterval(() => {
        timeLeftRef.current -= 1;
        setUiState(prev => ({ ...prev, timeLeft: timeLeftRef.current }));
        
        if (timeLeftRef.current <= 0) {
          endGame(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [uiState.gameState]);

  const endGame = (isClear) => {
    gameStateRef.current = 'END';
    cancelAnimationFrame(requestRef.current);
    setUiState(prev => ({
      ...prev,
      gameState: 'END',
      isClear: isClear
    }));
  };

  const spawnWord = (canvasWidth) => {
    if (currentTopicIdxRef.current >= VOCAB_DATA.length) return;
    const data = VOCAB_DATA[currentTopicIdxRef.current];

    // 중복 방지 로직
    const activeTexts = wordsRef.current.map(w => w.text);
    let text = "";
    let isCorrect = false;
    let attempts = 0;

    while (attempts < 10) {
      isCorrect = Math.random() < 0.6;
      if (isCorrect) {
        text = data.good[Math.floor(Math.random() * data.good.length)];
      } else {
        text = data.bad[Math.floor(Math.random() * data.bad.length)];
      }
      if (!activeTexts.includes(text)) break;
      attempts++;
    }

    if (activeTexts.includes(text)) return;

    const x = Math.random() * (canvasWidth - 120) + 60;
    let currentSpeed = baseSpeedRef.current + (comboRef.current * 0.2);
    if (currentSpeed > 8) currentSpeed = 8;

    wordsRef.current.push({
      text,
      isCorrect,
      x,
      y: -60,
      width: 0,
      speed: currentSpeed,
      removed: false
    });
  };

  const createParticles = (x, y, color) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  const flashFeedback = (color) => {
    setUiState(prev => ({ ...prev, feedbackColor: color }));
    setTimeout(() => {
      setUiState(prev => ({ ...prev, feedbackColor: null }));
    }, 150);
  };

  const handleInput = (e) => {
    if (gameStateRef.current !== 'PLAYING') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    // 뒤에서부터(화면 앞쪽) 체크
    const words = wordsRef.current;
    for (let i = words.length - 1; i >= 0; i--) {
      let w = words[i];
      if (w.removed) continue;

      // Simple AABB Hitbox with padding
      if (mx > w.x - w.width / 2 - 20 && mx < w.x + w.width / 2 + 20 &&
          my > w.y - 35 && my < w.y + 35) {
        
        if (w.isCorrect) {
          // HIT
          scoreRef.current += 10 + (comboRef.current * 2);
          comboRef.current += 1;
          collectedCountRef.current += 1;
          playSound('good');
          createParticles(w.x, w.y, '#2ecc71');
          flashFeedback('green');
          
          // 미션 체크
          if (collectedCountRef.current >= GOAL_COUNT) {
            playSound('clear');
            currentTopicIdxRef.current += 1;
            
            // 다음 주제로 이동
            if (currentTopicIdxRef.current < VOCAB_DATA.length) {
              const nextWord = VOCAB_DATA[currentTopicIdxRef.current].word;
              setUiState(prev => ({ ...prev, currentTopic: nextWord }));
            } else {
              endGame(true);
            }
            collectedCountRef.current = 0;
          }

        } else {
          // WRONG CLICK
          scoreRef.current = Math.max(0, scoreRef.current - 10);
          comboRef.current = 0;
          playSound('bad');
          createParticles(w.x, w.y, '#e74c3c');
          flashFeedback('red');
        }

        w.removed = true;
        
        // Sync vital UI state
        setUiState(prev => ({
          ...prev,
          score: scoreRef.current,
          combo: comboRef.current,
          collectedCount: collectedCountRef.current,
          showCombo: comboRef.current > 1
        }));
        
        e.preventDefault();
        break;
      }
    }
  };

  const gameLoop = (time) => {
    if (gameStateRef.current !== 'PLAYING') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Resize canvas if needed (responsiveness)
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Spawn Logic
    let spawnRate = Math.max(500, 1200 - (comboRef.current * 100));
    spawnTimerRef.current += dt;
    if (spawnTimerRef.current > spawnRate) {
      spawnWord(canvas.width);
      spawnTimerRef.current = 0;
    }

    // 2. Update & Draw Words
    wordsRef.current.forEach(w => {
      if (w.removed) return;
      w.y += w.speed;

      ctx.font = "bold 35px 'Jua', sans-serif";
      const metrics = ctx.measureText(w.text);
      w.width = metrics.width + 40;

      // Draw Bubble
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      // roundRect polyfill logic equivalent
      ctx.roundRect(w.x - w.width / 2, w.y - 25, w.width, 50, 25);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ecf0f1";
      ctx.stroke();

      // Draw Text
      ctx.fillStyle = "#2c3e50";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(w.text, w.x, w.y);

      // Miss Check
      if (w.y > canvas.height + 30) {
        w.removed = true;
        if (w.isCorrect) {
          // Missed Good Word
          scoreRef.current = Math.max(0, scoreRef.current - 5);
          comboRef.current = 0;
          playSound('miss');
          // Sync UI
          setUiState(prev => ({
             ...prev, 
             score: scoreRef.current, 
             combo: 0, 
             showCombo: false 
          }));
        }
      }
    });

    // 3. Update & Draw Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      let p = particlesRef.current[i];
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.05;
      
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    }
    ctx.globalAlpha = 1;

    requestRef.current = requestAnimationFrame(gameLoop);
  };


  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-300 to-cyan-100 font-sans select-none touch-none">
      {/* Font Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');
        body { font-family: 'Jua', sans-serif; }
      `}</style>

      {/* Feedback Overlay */}
      {uiState.feedbackColor && (
        <div 
          className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-150 ${
            uiState.feedbackColor === 'red' ? 'bg-red-500/30' : 'bg-green-500/20'
          }`} 
        />
      )}

      {/* UI Layer */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
        {/* Left HUD */}
        <div>
          <div className="bg-white/90 px-5 py-2 rounded-2xl shadow-md text-center mb-2">
            <span className="block text-sm text-gray-500">점수</span>
            <span className="text-2xl font-bold text-gray-800">{uiState.score}</span>
          </div>
          <div className="bg-white/90 px-5 py-2 rounded-2xl shadow-md text-center">
            <span className="block text-sm text-gray-500">남은 시간</span>
            <span className={`text-2xl font-bold ${uiState.timeLeft < 10 ? 'text-red-500' : 'text-gray-800'}`}>
              {uiState.timeLeft}
            </span>
          </div>
        </div>

        {/* Right HUD (Combo) */}
        <div className={`transition-all duration-200 transform text-right ${uiState.showCombo ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`}>
          <div className="text-5xl font-black text-orange-400 drop-shadow-md" style={{ WebkitTextStroke: '1px white' }}>
            {uiState.combo}
          </div>
          <div className="text-xl font-bold text-gray-700">COMBO! 🔥</div>
        </div>
      </div>

      {/* Center Display (Topic & Mission) */}
      <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-10 w-full">
        <h1 
          key={uiState.currentTopic} // Key change triggers animation
          className="text-7xl text-white drop-shadow-lg m-0 animate-pop-in transition-all duration-300"
        >
          {uiState.currentTopic}
        </h1>
        
        {/* Mission Gauge */}
        <div className="flex justify-center gap-4 mt-4">
          {[...Array(GOAL_COUNT)].map((_, i) => (
            <div 
              key={i}
              className={`w-6 h-6 rounded-full border-2 border-white transition-all duration-300 ${
                i < uiState.collectedCount 
                  ? 'bg-green-400 scale-125 shadow-[0_0_10px_#2ecc71]' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        <p className="text-white/80 mt-2 text-lg">관련 단어 4개를 모으세요!</p>
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onMouseDown={handleInput}
        onTouchStart={handleInput}
      />

      {/* Start Modal */}
      {uiState.gameState === 'STOP' && (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-[30px] text-center max-w-lg w-[90%] shadow-2xl animate-fade-in">
            <h1 className="text-5xl text-blue-500 mb-2">어휘 소나기 v4.0</h1>
            <p className="text-gray-500 text-lg mb-6">주제와 <strong>관련된 단어</strong>만 골라내세요!</p>
            
            <div className="bg-gray-100 rounded-xl p-6 mb-8 text-left space-y-2">
              <p>✅ <strong>관련 단어:</strong> 터치해서 점수 획득 (+10)</p>
              <p>🚫 <strong>엉뚱한 단어:</strong> 건드리지 말고 패스!</p>
              <p>⚡️ <strong>연속 정답:</strong> 속도가 점점 빨라져요!</p>
            </div>
            
            <button 
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white text-2xl py-4 px-12 rounded-full shadow-lg transform active:translate-y-1 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Play fill="currentColor" /> 게임 시작
            </button>
          </div>
        </div>
      )}

      {/* End Modal */}
      {uiState.gameState === 'END' && (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-[30px] text-center max-w-lg w-[90%] shadow-2xl animate-fade-in">
            <h1 className={`text-5xl mb-4 ${uiState.isClear ? 'text-green-500' : 'text-red-500'}`}>
              {uiState.isClear ? '🏆 미션 클리어!' : '⏰ 시간 종료'}
            </h1>
            
            <div className="mb-8">
              <p className="text-gray-500 text-xl">최종 점수</p>
              <p className="text-6xl font-bold text-red-500">{uiState.score}</p>
            </div>
            
            <p className="text-gray-600 text-lg mb-8">
              {uiState.isClear ? '모든 단어를 마스터했군요!' : '조금만 더 빠르면 할 수 있어요!'}
            </p>
            
            <button 
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white text-2xl py-4 px-12 rounded-full shadow-lg transform active:translate-y-1 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw /> 다시 도전
            </button>
          </div>
        </div>
      )}

      {/* Tailwind Custom Animations */}
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VocabularyShower;