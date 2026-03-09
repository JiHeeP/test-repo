/**
 * data/students/types.ts — StudentService 인터페이스 (TDD §6.3)
 * 
 * 구현체 교체 전략:
 *   PoC  → LocalStudentService  (studentsData.json, in-memory)
 *   차후 → FirebaseStudentService (Firestore students 컬렉션)
 */

/**
 * @typedef {Object} Student
 * @property {string}  student_id       - "S00001"
 * @property {string}  name
 * @property {string}  grade_class      - "5-1"
 * @property {boolean} is_multicultural
 */

/**
 * @typedef {Object} StudentService
 * 
 * @property {(studentId: string) => Student|null} getByStudentId
 *   학생 코드로 단일 조회.
 * 
 * @property {(gradeClass: string) => Student[]} getByGradeClass
 *   학급별 학생 목록.
 * 
 * @property {() => Student[]} getAll
 *   전체 학생 목록.
 * 
 * @property {(studentCode: string) => Student|null} validateStudentCode
 *   학생 코드 유효성 검증 (로그인 시 사용).
 */

export {};
