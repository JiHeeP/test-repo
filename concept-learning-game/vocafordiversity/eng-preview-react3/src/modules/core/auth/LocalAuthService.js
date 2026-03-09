/**
 * LocalAuthService — 로컬 JSON 기반 인증 구현체
 * ──────────────────────────────────────────────
 * 인터페이스: core/auth/types.ts (AuthService)
 * 
 * PoC 전용. 차후 FirebaseAuthService로 교체 예정.
 * - 교사: teacherA / 4908
 * - 학생: studentsData.json 에 등록된 student_id 코드
 */
import studentsData from '../../data/students/studentsData.json';

// ── 하드코딩 교사 credential ──
const TEACHER_CREDENTIALS = {
  username: 'teacherA',
  password: '4908',
  user: {
    uid: 'teacher-001',
    role: 'teacher',
    displayName: '박선생님',
    email: 'teacherA@vocabridge.local',
  },
};

/** @implements {AuthService} */
class LocalAuthService {
  constructor() {
    /** @type {import('./types').AuthUser|null} */
    this._currentUser = null;
    /** @type {Set<Function>} */
    this._listeners = new Set();
  }

  async loginTeacher(username, password) {
    if (
      username === TEACHER_CREDENTIALS.username &&
      password === TEACHER_CREDENTIALS.password
    ) {
      this._setUser({ ...TEACHER_CREDENTIALS.user });
      return this._currentUser;
    }
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  async loginStudent(studentCode) {
    const student = studentsData.students.find(
      (s) => s.student_id === studentCode
    );
    if (!student) {
      throw new Error('존재하지 않는 학생 코드입니다.');
    }
    const user = {
      uid: `student-${student.student_id}`,
      role: 'student',
      displayName: student.name,
      studentId: student.student_id,
    };
    this._setUser(user);
    return this._currentUser;
  }

  async logout() {
    this._setUser(null);
  }

  getCurrentUser() {
    return this._currentUser;
  }

  onAuthStateChanged(callback) {
    this._listeners.add(callback);
    // 구독 즉시 현재 상태 전달
    callback(this._currentUser);
    return () => this._listeners.delete(callback);
  }

  // ── private ──
  _setUser(user) {
    this._currentUser = user;
    this._listeners.forEach((cb) => cb(user));
  }
}

// 싱글턴
export const authService = new LocalAuthService();
export default LocalAuthService;
