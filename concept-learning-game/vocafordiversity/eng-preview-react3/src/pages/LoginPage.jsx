/**
 * LoginPage — 교사/학생 통합 로그인 화면
 */
import React, { useState } from 'react';
import { useAuth } from '../modules/core/auth/AuthContext.jsx';
import { BookOpen, User, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const { loginTeacher, loginStudent } = useAuth();
  const [mode, setMode] = useState('select');   // select | teacher | student
  const [error, setError] = useState('');

  // ── 교사 로그인 ──
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ── 학생 로그인 ──
  const [studentCode, setStudentCode] = useState('');

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginTeacher(username, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginStudent(studentCode.toUpperCase());
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ fontFamily: 'Gaegu, cursive' }}>
          어휘의 징검다리
        </h1>
        <p className="text-blue-200 text-lg">다문화 학생을 위한 어휘 학습</p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">

        {/* 역할 선택 */}
        {mode === 'select' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode('teacher')}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <GraduationCap size={24} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-lg">선생님</p>
                <p className="text-sm text-slate-500">아이디로 로그인</p>
              </div>
            </button>
            <button
              onClick={() => setMode('student')}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <User size={24} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-lg">학생</p>
                <p className="text-sm text-slate-500">학생 코드로 로그인</p>
              </div>
            </button>
          </div>
        )}

        {/* 교사 로그인 폼 */}
        {mode === 'teacher' && (
          <>
            <button onClick={() => { setMode('select'); setError(''); }} className="text-sm text-slate-400 hover:text-slate-600 mb-4">
              ← 뒤로
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <GraduationCap size={20} className="text-blue-600" /> 선생님 로그인
            </h2>
            <form onSubmit={handleTeacherLogin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-2 border-slate-200 rounded-xl px-4 py-3 text-lg focus:border-blue-400 focus:outline-none"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-slate-200 rounded-xl px-4 py-3 text-lg focus:border-blue-400 focus:outline-none"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                로그인
              </button>
            </form>
          </>
        )}

        {/* 학생 로그인 폼 */}
        {mode === 'student' && (
          <>
            <button onClick={() => { setMode('select'); setError(''); }} className="text-sm text-slate-400 hover:text-slate-600 mb-4">
              ← 뒤로
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User size={20} className="text-green-600" /> 학생 로그인
            </h2>
            <form onSubmit={handleStudentLogin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="학생 코드 (예: S00001)"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="border-2 border-slate-200 rounded-xl px-4 py-3 text-lg text-center tracking-widest font-mono focus:border-green-400 focus:outline-none"
                maxLength={6}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors"
              >
                입장하기
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-4 text-center">
              학생 코드는 선생님에게 받으세요.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
