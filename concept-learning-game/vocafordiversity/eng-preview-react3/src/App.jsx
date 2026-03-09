/**
 * App.jsx — 최상위 라우터
 * ─────────────────────────
 * 인증 상태 + 역할(teacher/student)에 따라 페이지 분기.
 * PoC에서는 react-router 없이 조건부 렌더링으로 처리.
 */
import React from 'react';
import { useAuth } from './modules/core/auth/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import StudentHome from './pages/StudentHome.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  // 미인증 → 로그인
  if (!user) {
    return <LoginPage />;
  }

  // 역할별 분기
  if (user.role === 'teacher') {
    return <TeacherDashboard />;
  }

  return <StudentHome />;
}
