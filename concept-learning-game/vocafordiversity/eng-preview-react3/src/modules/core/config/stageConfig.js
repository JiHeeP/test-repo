/**
 * stageConfig.js — StageConfig JSON 로더 + 검증 (TDD §6.2)
 * ─────────────────────────────────────────────────────────
 * JSON 파일을 로딩하고, 스키마 검증 후 타입 안전한 객체로 제공.
 */
import rawConfig from './stageConfig.json';

const REQUIRED_STAGES = [1, 2, 3, 4, 5, 6];
const REQUIRED_FIELDS = ['wordCount', 'maxScore', 'scorePerCorrect', 'scorePerHintedCorrect', 'scorePerWrong'];

/**
 * @typedef {Object} StageScoreRule
 * @property {number} stage
 * @property {number} wordCount
 * @property {number} maxScore
 * @property {number} scorePerCorrect
 * @property {number} scorePerHintedCorrect
 * @property {number} scorePerWrong
 */

/** 검증 */
export function validateStageConfig(raw) {
  const errors = [];
  if (!raw?.stages) {
    return { valid: false, errors: ['stages 키가 없습니다.'] };
  }
  for (const stageNum of REQUIRED_STAGES) {
    const key = String(stageNum);
    if (!raw.stages[key]) {
      errors.push(`Stage ${key} 누락`);
      continue;
    }
    const stage = raw.stages[key];
    for (const field of REQUIRED_FIELDS) {
      if (stage[field] === undefined) {
        errors.push(`Stage ${key}: ${field} 누락`);
      }
    }
    if (stage.wordCount !== undefined && stage.wordCount <= 0) {
      errors.push(`Stage ${key}: wordCount는 0보다 커야 합니다.`);
    }
    if (stage.maxScore !== undefined && stage.maxScore <= 0) {
      errors.push(`Stage ${key}: maxScore는 0보다 커야 합니다.`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/** 로딩 + 검증 + stage 필드 주입 */
function loadStageConfigs() {
  const result = validateStageConfig(rawConfig);
  if (!result.valid) {
    console.error('[stageConfig] 검증 실패:', result.errors);
    throw new Error(`stageConfig.json 검증 실패: ${result.errors.join(', ')}`);
  }

  /** @type {Record<number, StageScoreRule>} */
  const configs = {};
  for (const [key, value] of Object.entries(rawConfig.stages)) {
    const stageNum = Number(key);
    configs[stageNum] = { stage: stageNum, ...value };
  }
  return configs;
}

// 앱 초기화 시 1회 로딩 + 캐싱
let _cached = null;

function ensureLoaded() {
  if (!_cached) {
    _cached = loadStageConfigs();
  }
  return _cached;
}

/** @returns {StageScoreRule} */
export function getStageConfig(stage) {
  const all = ensureLoaded();
  if (!all[stage]) throw new Error(`Stage ${stage} 설정이 없습니다.`);
  return all[stage];
}

/** @returns {Record<number, StageScoreRule>} */
export function getAllStageConfigs() {
  return { ...ensureLoaded() };
}
