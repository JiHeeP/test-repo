/**
 * data/vocab/types.ts — VocabDataService 인터페이스 (TDD §6.4)
 * 
 * 구현체 교체 전략:
 *   PoC  → LocalVocabDataService  (vocabData.json, 정적 import)
 *   차후 → FirebaseVocabDataService (Firestore words 컬렉션)
 */

/**
 * @typedef {Object} VocabWord
 * @property {string}   id
 * @property {string}   word
 * @property {string}   zh
 * @property {string}   ru
 * @property {string}   meaning
 * @property {string[]} examples
 * @property {string}   icon           - lucide-react 아이콘명
 * @property {string}   color          - hex (without #)
 * @property {string[]} relatedWords
 * @property {string[]} unrelatedWords
 */

/**
 * @typedef {Object} QuizCycle
 * @property {string}     cycle_id
 * @property {string}     cycle_name
 * @property {VocabWord[]} words       - 10개
 */

/**
 * @typedef {Object} VocabDataService
 * 
 * @property {() => QuizCycle[]} getAllCycles
 * @property {(cycleId: string) => QuizCycle|null} getCycleById
 * @property {(cycleId: string) => VocabWord[]} getWordsByCycle
 * @property {(wordId: string) => VocabWord|null} getWordById
 * @property {() => number} getCycleCount
 */

export {};
