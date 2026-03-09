/**
 * StudentHome — 학생 홈 화면
 * 사이클 목록 → Step 1 진입
 */
import React, { useState } from 'react';
import { useAuth } from '../modules/core/auth/AuthContext.jsx';
import { vocabService } from '../modules/data/vocab/index.js';
import { learningRecordService } from '../modules/data/learning-records/index.js';
import { getStageConfig } from '../modules/core/config/stageConfig.js';
import { Step01 } from '../modules/games/step1-multimodal/index.js';
import { BookOpen, LogOut, ChevronRight, CheckCircle } from 'lucide-react';

export default function StudentHome() {
  const { user, logout } = useAuth();
  const [activeCycleId, setActiveCycleId] = useState(null);
  const cycles = vocabService.getAllCycles();

  // Step 1 완료 핸들러
  const handleStep1Complete = (result) => {
    // 버퍼에 저장 → 즉시 flush (PoC: Step 1만이므로)
    learningRecordService.bufferStageResult(user.studentId, activeCycleId, result);
    learningRecordService.flush(user.studentId, activeCycleId);
    setActiveCycleId(null);
  };

  // Step 1 게임 중
  if (activeCycleId) {
    const words = vocabService.getWordsByCycle(activeCycleId);
    const stageConfig = getStageConfig(1);

    return (
      <div className="relative min-h-screen">
        <div className="fixed top-3 left-3 z-[100]">
          <button
            onClick={() => setActiveCycleId(null)}
            className="bg-white/90 backdrop-blur-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-sm font-bold"
          >
            ← 홈으로
          </button>
        </div>
        <Step01
          words={words}
          cycleId={activeCycleId}
          stageConfig={stageConfig}
          onComplete={handleStep1Complete}
        />
      </div>
    );
  }

  // 홈 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-8">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Gaegu, cursive' }}>어휘의 징검다리</h1>
            <p className="text-green-100 mt-1">안녕, <span className="font-bold">{user.displayName}</span>!</p>
          </div>
          <button
            onClick={logout}
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
          >
            <LogOut size={16} /> 나가기
          </button>
        </div>
      </div>

      {/* 사이클 목록 */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-slate-700 mb-4">학습할 단원을 선택하세요</h2>
        <div className="flex flex-col gap-3">
          {cycles.map((cycle) => {
            const record = learningRecordService.getLatestRecord(user.studentId, cycle.cycle_id);
            const hasStep1 = record?.stage_results?.some((r) => r.stage === 1);

            return (
              <button
                key={cycle.cycle_id}
                onClick={() => setActiveCycleId(cycle.cycle_id)}
                className={`w-full text-left bg-white rounded-2xl p-5 shadow-sm border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  hasStep1 ? 'border-green-200' : 'border-slate-100 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    hasStep1 ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {hasStep1 ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <BookOpen size={24} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{cycle.cycle_name}</p>
                    <p className="text-sm text-slate-500">{cycle.words.length}개 단어 · Step 1</p>
                    {hasStep1 && record && (
                      <p className="text-xs text-green-600 font-bold mt-1">
                        완료! 점수: {record.stage_results.find((r) => r.stage === 1)?.score}/{record.stage_results.find((r) => r.stage === 1)?.scoring_context.max_score}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="text-slate-300" size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
