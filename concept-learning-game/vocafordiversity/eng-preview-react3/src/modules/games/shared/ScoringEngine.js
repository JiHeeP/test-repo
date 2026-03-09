/**
 * ScoringEngine — 공통 채점 로직 (TDD §6.8)
 * ─────────────────────────────────────────
 * StageScoreRule 기반으로 점수 산출.
 * Config에서 받은 규칙으로 점수를 매기고,
 * ScoringContext(write-time snapshot)를 생성한다.
 */

/** 단일 문항 채점 */
export function scoreItem(config, isCorrect, hintUsed) {
  if (!isCorrect) return config.scorePerWrong;
  return hintUsed ? config.scorePerHintedCorrect : config.scorePerCorrect;
}

/** Step 1 자기평가 채점: (전체 - 모르는) / 전체 × 만점 */
export function scoreSelfAssessment(config, unknownCount) {
  const knownCount = config.wordCount - unknownCount;
  return Math.round((knownCount / config.wordCount) * config.maxScore);
}

/** 오류율 계산 */
export function calculateErrorRate(score, maxScore) {
  if (maxScore === 0) return 0;
  return (1 - score / maxScore) * 100;
}

/** Tier 분류 (TDD §3.5 FR-R7) */
export function classifyTier(errorRate) {
  if (errorRate <= 20) return 'mastered';
  if (errorRate <= 35) return 'development';
  if (errorRate <= 50) return 'tier2';
  return 'tier3';
}

/** ScoringContext 생성 — StageResult에 포함할 스냅샷 */
export function createScoringContext(config) {
  return {
    word_count: config.wordCount,
    max_score: config.maxScore,
  };
}
