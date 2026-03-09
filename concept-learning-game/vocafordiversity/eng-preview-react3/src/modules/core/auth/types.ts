/**
 * core/auth/types.ts
 * ─────────────────
 * AuthService 인터페이스 정의 (TDD §6.1)
 * 
 * 구현체 교체 전략:
 *   PoC  → LocalAuthService  (하드코딩 credential, in-memory)
 *   차후 → FirebaseAuthService (Firebase Auth)
 *        → GoogleAuthService   (Google OAuth)
 */

/** @typedef {'teacher' | 'student'} UserRole */

/**
 * @typedef {Object} AuthUser
 * @property {string}    uid         - 고유 식별자
 * @property {UserRole}  role        - 'teacher' | 'student'
 * @property {string}    displayName - 표시 이름
 * @property {string}    [studentId] - role==='student'일 때만 (예: "S00001")
 * @property {string}    [email]     - role==='teacher'일 때만
 */

/**
 * @typedef {Object} AuthService
 * 
 * @property {(username: string, password: string) => Promise<AuthUser>} loginTeacher
 *   교사 로그인. 실패 시 throw Error.
 * 
 * @property {(studentCode: string) => Promise<AuthUser>} loginStudent
 *   학생 코드 로그인. 존재하지 않는 코드면 throw Error.
 * 
 * @property {() => Promise<void>} logout
 *   로그아웃.
 * 
 * @property {() => AuthUser|null} getCurrentUser
 *   현재 인증 사용자 (null이면 미인증).
 * 
 * @property {(cb: (user: AuthUser|null) => void) => () => void} onAuthStateChanged
 *   인증 상태 변경 리스너. unsubscribe 함수 반환.
 */

export {};
