/**
 * AuthContext — React Context로 AuthService 노출
 * ─────────────────────────────────────────────────
 * 구현체는 여기서 결정. 현재: LocalAuthService
 * 차후: import { authService } from './FirebaseAuthService' 로 한 줄 교체
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from './LocalAuthService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginTeacher = useCallback(async (username, password) => {
    return authService.loginTeacher(username, password);
  }, []);

  const loginStudent = useCallback(async (studentCode) => {
    return authService.loginStudent(studentCode);
  }, []);

  const logout = useCallback(async () => {
    return authService.logout();
  }, []);

  const value = { user, loading, loginTeacher, loginStudent, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** @returns {{ user: AuthUser|null, loading: boolean, loginTeacher, loginStudent, logout }} */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 <AuthProvider> 안에서 사용해야 합니다.');
  return ctx;
}
