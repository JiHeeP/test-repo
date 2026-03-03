import React, { useState } from 'react';
import { Home, ChevronRight, Lock, CheckCircle, BookOpen, Puzzle, Blocks, PenLine, LayoutList, Droplets } from 'lucide-react';
import Step01 from './games/Step01';
import Step02 from './games/Step02';
import Step03 from './games/Step03';
import Step04 from './games/Step04';
import Step05 from './games/Step05';
import Step06 from './games/Step06';

const STEPS = [
  { id: 1, title: '소리와 그림으로 단어 익히기', subtitle: '플래시카드 학습', icon: BookOpen, color: 'bg-blue-500', component: Step01 },
  { id: 2, title: '그림에 단어 매칭하기', subtitle: '드래그 앤 드롭 매칭', icon: Puzzle, color: 'bg-indigo-500', component: Step02 },
  { id: 3, title: '관련어 고르기', subtitle: '관련 단어 4개 선택', icon: LayoutList, color: 'bg-violet-500', component: Step03 },
  { id: 4, title: '글자 블록으로 단어 조립', subtitle: '음절 조립 게임', icon: Blocks, color: 'bg-amber-500', component: Step04 },
  { id: 5, title: '문장 속 단어 퀴즈', subtitle: '어휘 퀴즈 + 문장 만들기', icon: PenLine, color: 'bg-emerald-500', component: Step05 },
  { id: 6, title: '어휘 소나기', subtitle: '관련 단어 캐치 게임', icon: Droplets, color: 'bg-cyan-500', component: Step06 },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(null); // null = home
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    // auto-advance to next or go home
    if (stepId < 6) {
      setCurrentStep(stepId + 1);
    } else {
      setCurrentStep(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(null);
  };

  // Render a game step
  if (currentStep !== null) {
    const stepInfo = STEPS.find(s => s.id === currentStep);
    if (!stepInfo) {
      setCurrentStep(null);
      return null;
    }
    const GameComponent = stepInfo.component;

    return (
      <div className="relative min-h-screen">
        {/* Floating Nav */}
        <div className="fixed top-3 left-3 z-[100] flex gap-2">
          <button
            onClick={handleBack}
            className="bg-white/90 backdrop-blur-sm text-slate-600 hover:text-slate-900 hover:bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-1.5 text-sm font-bold transition-all"
          >
            <Home size={16} /> 홈
          </button>
        </div>

        {/* Step indicator */}
        <div className="fixed top-3 right-3 z-[100]">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2">
            {STEPS.map(s => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  s.id === currentStep
                    ? `${s.color} text-white shadow-md scale-110`
                    : completedSteps.includes(s.id)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {completedSteps.includes(s.id) && s.id !== currentStep ? '✓' : s.id}
              </button>
            ))}
          </div>
        </div>

        <GameComponent
          onComplete={() => handleComplete(currentStep)}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Home screen
  const allCompleted = completedSteps.length === 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: "'Gaegu', cursive" }}>
            어휘의 징검다리
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium">
            다문화 학생을 위한 6단계 어휘 학습 체험
          </p>
          {allCompleted && (
            <div className="mt-6 inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold text-lg shadow-lg animate-bounce">
              🏆 모든 단계를 완료했습니다!
            </div>
          )}
          {/* Progress */}
          <div className="mt-8 flex justify-center gap-2">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`w-10 h-2 rounded-full transition-all ${
                  completedSteps.includes(s.id) ? 'bg-yellow-300' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <p className="text-blue-200 text-sm mt-2">
            {completedSteps.length} / 6 완료
          </p>
        </div>
      </div>

      {/* Step Cards */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-4">
          {STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`
                  w-full text-left bg-white rounded-2xl p-5 md:p-6 shadow-sm border-2 transition-all
                  hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]
                  ${isCompleted ? 'border-green-200' : 'border-slate-100 hover:border-blue-200'}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Step Number / Status */}
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                    ${isCompleted ? 'bg-green-100' : step.color + ' bg-opacity-10'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="text-green-500" size={28} />
                    ) : (
                      <Icon className="text-white" size={28} style={{
                        filter: 'none',
                        color: isCompleted ? undefined : undefined
                      }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-green-50 text-green-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        Step {step.id}
                      </span>
                      {isCompleted && (
                        <span className="text-xs text-green-500 font-bold">완료!</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 truncate">{step.title}</h3>
                    <p className="text-sm text-slate-500">{step.subtitle}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="text-slate-300 shrink-0" size={24} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 pb-8">
        © 2026 어휘의 징검다리 | 다문화 교육을 위한 개념 학습 게임
      </footer>
    </div>
  );
}
