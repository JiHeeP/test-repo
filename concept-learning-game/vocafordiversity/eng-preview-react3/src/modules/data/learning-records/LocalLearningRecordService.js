/**
 * LocalLearningRecordService — in-memory + localStorage 학습 기록 서비스
 * ─────────────────────────────────────────────────────────────────────
 * 인터페이스: data/learning-records/types.ts (LearningRecordService)
 * 
 * 저장소: localStorage key = "vocabridge_learning_records"
 * 버퍼:   Map<bufferKey, StageResult[]>  (flush 전 메모리 누적)
 */

const STORAGE_KEY = 'vocabridge_learning_records';

function classifyTier(errorRate) {
  if (errorRate <= 20) return 'mastered';
  if (errorRate <= 35) return 'development';
  if (errorRate <= 50) return 'tier2';
  return 'tier3';
}

function calcErrorRate(stageResults) {
  if (stageResults.length === 0) return 0;
  let totalScore = 0;
  let totalMax = 0;
  for (const r of stageResults) {
    totalScore += r.score;
    totalMax += r.scoring_context.max_score;
  }
  if (totalMax === 0) return 0;
  return (1 - totalScore / totalMax) * 100;
}

/** @implements {LearningRecordService} */
class LocalLearningRecordService {
  constructor() {
    /** @type {Map<string, import('./types').StageResult[]>} */
    this._buffer = new Map();
    /** @type {Map<string, import('./types').LearningRecord>} */
    this._records = new Map();
    this._loadFromStorage();
  }

  // ── 쓰기 ──

  bufferStageResult(studentId, cycleId, result) {
    const key = `${studentId}_${cycleId}`;
    if (!this._buffer.has(key)) {
      this._buffer.set(key, []);
    }
    this._buffer.get(key).push(result);
  }

  flush(studentId, cycleId) {
    const bufferKey = `${studentId}_${cycleId}`;
    const buffered = this._buffer.get(bufferKey) || [];
    const recordId = `${studentId}_${cycleId}_1`;

    const existing = this._records.get(recordId);

    if (existing) {
      // 기존 레코드에 추가
      existing.stage_results = [...existing.stage_results, ...buffered];
      existing.error_rate = calcErrorRate(existing.stage_results);
      existing.tier = classifyTier(existing.error_rate);
    } else {
      // 새 레코드 생성
      const errorRate = calcErrorRate(buffered);
      /** @type {import('./types').LearningRecord} */
      const record = {
        record_id: recordId,
        student_id: studentId,
        cycle_id: cycleId,
        attempt: 1,
        stage_results: [...buffered],
        error_rate: errorRate,
        tier: classifyTier(errorRate),
        started_at: new Date().toISOString(),
        completed_at: null,
      };
      this._records.set(recordId, record);
    }

    // 버퍼 비우기
    this._buffer.delete(bufferKey);
    // 영속화
    this._saveToStorage();
  }

  // ── 읽기 ──

  getLatestRecord(studentId, cycleId) {
    const recordId = `${studentId}_${cycleId}_1`;
    return this._records.get(recordId) ?? null;
  }

  getRecordsByStudent(studentId) {
    return [...this._records.values()].filter(
      (r) => r.student_id === studentId
    );
  }

  getAllRecords() {
    return [...this._records.values()];
  }

  // ── localStorage 영속화 ──

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        for (const record of arr) {
          this._records.set(record.record_id, record);
        }
      }
    } catch (e) {
      console.warn('[LearningRecordService] localStorage 로딩 실패:', e);
    }
  }

  _saveToStorage() {
    try {
      const arr = [...this._records.values()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('[LearningRecordService] localStorage 저장 실패:', e);
    }
  }
}

export const learningRecordService = new LocalLearningRecordService();
export default LocalLearningRecordService;
