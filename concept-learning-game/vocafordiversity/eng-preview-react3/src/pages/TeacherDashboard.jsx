/**
 * TeacherDashboard — 교사 대시보드 (PoC: 간단한 학급 현황)
 */
import React from 'react';
import { useAuth } from '../modules/core/auth/AuthContext.jsx';
import { studentService } from '../modules/data/students/index.js';
import { learningRecordService } from '../modules/data/learning-records/index.js';
import { LogOut, Users, BarChart3 } from 'lucide-react';

const TIER_COLORS = {
  mastered: { bg: 'bg-green-100', text: 'text-green-700', label: '습득' },
  development: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '발달' },
  tier2: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Tier 2' },
  tier3: { bg: 'bg-red-100', text: 'text-red-700', label: 'Tier 3' },
};

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const students = studentService.getAll();
  const allRecords = learningRecordService.getAllRecords();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-8">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Gaegu, cursive' }}>어휘의 징검다리</h1>
            <p className="text-blue-200 mt-1">교사 대시보드 · {user.displayName}</p>
          </div>
          <button
            onClick={logout}
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} className="text-blue-500" />
              <span className="text-sm text-slate-500 font-bold">학생 수</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{students.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={20} className="text-green-500" />
              <span className="text-sm text-slate-500 font-bold">학습 기록</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{allRecords.length}</p>
          </div>
        </div>

        {/* 학생 목록 + 기록 */}
        <h2 className="text-lg font-bold text-slate-700 mb-4">학급 현황</h2>
        <div className="flex flex-col gap-3">
          {students.map((student) => {
            const records = learningRecordService.getRecordsByStudent(student.student_id);
            const latestRecord = records.length > 0 ? records[records.length - 1] : null;
            const tier = latestRecord?.tier;
            const tierInfo = tier ? TIER_COLORS[tier] : null;

            return (
              <div
                key={student.student_id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      student.is_multicultural ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {student.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{student.name}</span>
                        {student.is_multicultural && (
                          <span className="text-xs bg-purple-50 text-purple-500 px-2 py-0.5 rounded-full font-bold">다문화</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{student.student_id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {latestRecord ? (
                      <div className="flex flex-col items-end gap-1">
                        {tierInfo && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierInfo.bg} ${tierInfo.text}`}>
                            {tierInfo.label}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          오류율 {latestRecord.error_rate.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">미학습</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
