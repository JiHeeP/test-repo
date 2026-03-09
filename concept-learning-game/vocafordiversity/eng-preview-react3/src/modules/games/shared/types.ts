/**
 * games/shared/types.ts — 게임 → 데이터 레이어 공통 타입 (TDD §6.7)
 */

/**
 * @typedef {Object} ScoringContext
 * @property {number} word_count
 * @property {number} max_score
 */

/**
 * @typedef {Object} StageResult
 * @property {number}         stage
 * @property {number}         score
 * @property {ScoringContext} scoring_context
 * @property {number}         time_spent
 * @property {Object}         [additional_datapoint]
 */

/**
 * @typedef {Object} GameStepProps
 * @property {import('../../data/vocab/types').VocabWord[]} words
 * @property {string}                                       cycleId
 * @property {import('../../core/config/stageConfig').StageScoreRule} stageConfig
 * @property {(result: StageResult) => void}                onComplete
 */

export {};
