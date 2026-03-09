/**
 * LocalVocabDataService — JSON 기반 어휘 데이터 서비스
 * ───────────────────────────────────────────────────
 * 인터페이스: data/vocab/types.ts (VocabDataService)
 */
import vocabData from './vocabData.json';

/** @implements {VocabDataService} */
class LocalVocabDataService {
  constructor() {
    this._data = vocabData;
  }

  getAllCycles() {
    return this._data.cycles;
  }

  getCycleById(cycleId) {
    return this._data.cycles.find((c) => c.cycle_id === cycleId) ?? null;
  }

  getWordsByCycle(cycleId) {
    const cycle = this.getCycleById(cycleId);
    return cycle ? cycle.words : [];
  }

  getWordById(wordId) {
    for (const cycle of this._data.cycles) {
      const word = cycle.words.find((w) => w.id === wordId);
      if (word) return word;
    }
    return null;
  }

  getCycleCount() {
    return this._data.cycles.length;
  }
}

export const vocabService = new LocalVocabDataService();
export default LocalVocabDataService;
