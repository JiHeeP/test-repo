/**
 * LocalStudentService — JSON 기반 학생 서비스 구현체
 * ──────────────────────────────────────────────────
 * 인터페이스: data/students/types.ts (StudentService)
 */
import data from './studentsData.json';

/** @implements {StudentService} */
class LocalStudentService {
  constructor() {
    /** @type {import('./types').Student[]} */
    this._students = [...data.students];
  }

  getByStudentId(studentId) {
    return this._students.find((s) => s.student_id === studentId) ?? null;
  }

  getByGradeClass(gradeClass) {
    return this._students.filter((s) => s.grade_class === gradeClass);
  }

  getAll() {
    return [...this._students];
  }

  validateStudentCode(studentCode) {
    return this.getByStudentId(studentCode);
  }
}

export const studentService = new LocalStudentService();
export default LocalStudentService;
