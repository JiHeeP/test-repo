/**
 * data/learning-records/types.ts — LearningRecordService 인터페이스 (TDD §6.5)
 * 
 * 구현체 교체 전략:
 *   PoC  → LocalLearningRecordService (in-memory + localStorage)
 *   차후 → FirebaseLearningRecordService (Firestore learning_records 컬렉션)
 */

/**
 * @typedef {Object} ScoringContext
 * @property {number} word_count  - 해당 Stage 단어 수
 * @property {number} max_score   - 해당 Stage 만점
 */

/**
 * @typedef {Object} StageResult
 * @property {number}         stage           - 1~6
 * @property {number}         score           - 실제 획득 점수
 * @property {ScoringContext} scoring_context - Config write-time capture
 * @property {number}         time_spent      - 초 단위
 * @property {Object}         [additional_datapoint]
 * @property {string[]}       [additional_datapoint.unknownWords]      - Step 1
 * @property {Array<{trial_index: number, result: boolean}>} [additional_datapoint.historical_results] - Step 2~5
 */

/**
 * @typedef {'mastered'|'development'|'tier2'|'tier3'} Tier
 */

/**
 * @typedef {Object} LearningRecord
 * @property {string}        record_id      - "{studentId}_{cycleId}_{attempt}"
 * @property {string}        student_id
 * @property {string}        cycle_id
 * @property {number}        attempt
 * @property {StageResult[]} stage_results
 * @property {number}        error_rate
 * @property {Tier}          tier
 * @property {string}        started_at     - ISO
 * @property {string|null}   completed_at   - ISO or null
 */

/**
 * @typedef {Object} LearningRecordService
 * 
 * @property {(studentId: string, cycleId: string, result: StageResult) => void} bufferStageResult
 *   메모리 버퍼에 StageResult 누적.
 * 
 * @property {(studentId: string, cycleId: string) => void} flush
 *   버퍼를 영속 스토리지에 flush.
 * 
 * @property {(studentId: string, cycleId: string) => LearningRecord|null} getLatestRecord
 *   특정 (student, cycle)의 최신 학습 기록 조회.
 * 
 * @property {(studentId: string) => LearningRecord[]} getRecordsByStudent
 *   학생의 전체 학습 기록 조회.
 * 
 * @property {() => LearningRecord[]} getAllRecords
 *   전체 학습 기록 (교사 대시보드용).
 */

export {};
