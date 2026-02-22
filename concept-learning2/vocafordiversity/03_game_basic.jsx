import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  RefreshCcw,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';

// Step 3 기본형: 관련어 고르기 (미니게임 분리용)
// 공통 채점 규칙(2~5단계 통일 기준):
// - 정답(힌트 없이): 2점
// - 정답(힌트 사용): 1점
// - 오답: 0점
// - 힌트 1회, 재시도 1회
const VOCAB_DATA = [
  {
    word: '재다',
    good: ['키', '몸무게', '자', '줄자', '길이', '시간', '발 사이즈', '맞추다', '눈금', '크기'],
    bad: ['사과', '노래', '잠', '춤', '하늘'],
  },
  {
    word: '표시',
    good: ['스티커', '동그라미', '별표', '밑줄', '간판', '신호등', '표지판', '체크', '이름표', '깃발'],
    bad: ['투명', '바람', '숨기기', '비밀', '공기'],
  },
  {
    word: '측정',
    good: ['실험', '온도계', '저울', '체온', '비커', '기록', '숫자', '양', '높이', '과학'],
    bad: ['기분', '꿈', '친구', '놀이', '소설'],
  },
  {
    word: '정확히',
    good: ['딱 맞다', '정답', '실수 없이', '똑같이', '바르게', '100점', '시계', '약속', '꼭', '분명히'],
    bad: ['대충', '아마도', '글쎄', '몰라', '엉터리'],
  },
  {
    word: '추측',
    good: ['탐정', '범인', '이유', '생각하기', '아마도', '힌트', '까닭', '미스터리', '물음표', '상상'],
    bad: ['사실', '뉴스', '사진', '거울', '눈앞'],
  },
  {
    word: '의미',
    good: ['뜻', '말', '사전', '내용', '이해', '마음', '설명', '메시지', '중요', '해석'],
    bad: ['껍질', '종이', '그릇', '모자', '신발'],
  },
  {
    word: '단서',
    good: ['힌트', '발자국', '지문', '열쇠', '증거', '돋보기', '범인', '수수께끼', '조각', '흔적'],
    bad: ['정답', '끝', '결론', '처음', '선물'],
  },
  {
    word: '상황',
    good: ['분위기', '지금', '장면', '모습', '일', '사건', '경우', '때', '시간', '장소'],
    bad: ['필통', '지우개', '책상', '의자', '컴퓨터'],
  },
  {
    word: '짐작',
    good: ['눈치', '느낌', '대략', '왠지', '감', '찍기', '어림', '예상', '보기에', '생각'],
    bad: ['자', '저울', '시계', '계산기', '확인'],
  },
];

const REQUIRED_COUNT = 4;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const pick = (arr, count) => shuffle(arr).slice(0, count);

const buildOptions = (topic) => {
  const good = pick(topic.good, REQUIRED_COUNT).map((text, idx) => ({
    id: `g-${topic.word}-${idx}-${text}`,
    text,
    isGood: true,
  }));
  const bad = pick(topic.bad, REQUIRED_COUNT).map((text, idx) => ({
    id: `b-${topic.word}-${idx}-${text}`,
    text,
    isGood: false,
  }));
  return shuffle([...good, ...bad]);
};

export default function App() {
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [lockedMap, setLockedMap] = useState({});
  const [hintUsed, setHintUsed] = useState(false);
  const [retryUsed, setRetryUsed] = useState(false);
  const [roundState, setRoundState] = useState('playing'); // playing | resolved
  const [pendingResult, setPendingResult] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState({ type: 'info', msg: '관련된 단어 4개를 고르세요.' });
  const [isComplete, setIsComplete] = useState(false);

  const topic = VOCAB_DATA[index];
  const maxScore = VOCAB_DATA.length * 2;

  useEffect(() => {
    setOptions(buildOptions(VOCAB_DATA[index]));
    setSelectedMap({});
    setLockedMap({});
    setHintUsed(false);
    setRetryUsed(false);
    setRoundState('playing');
    setPendingResult(null);
    setFeedback({ type: 'info', msg: '관련된 단어 4개를 고르세요.' });
  }, [index]);

  const selectedCount = useMemo(
    () => Object.values(selectedMap).filter(Boolean).length,
    [selectedMap]
  );

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const toggleOption = (option) => {
    if (roundState !== 'playing') return;
    if (lockedMap[option.id]) return;

    const isSelected = !!selectedMap[option.id];
    if (!isSelected && selectedCount >= REQUIRED_COUNT) {
      setFeedback({ type: 'error', msg: '최대 4개까지만 선택할 수 있어요.' });
      return;
    }

    setSelectedMap((prev) => ({ ...prev, [option.id]: !isSelected }));
  };

  const handleHint = () => {
    if (roundState !== 'playing' || hintUsed) return;

    const candidate = options.find((o) => o.isGood && !selectedMap[o.id]);
    if (!candidate) return;

    setHintUsed(true);
    setSelectedMap((prev) => ({ ...prev, [candidate.id]: true }));
    setLockedMap((prev) => ({ ...prev, [candidate.id]: true }));
    setFeedback({ type: 'warning', msg: `힌트 사용: "${candidate.text}"는 정답입니다. (이번 문제 최대 1점)` });
  };

  const handleReset = () => {
    if (roundState !== 'playing') return;
    const lockedSelected = {};
    Object.keys(lockedMap).forEach((id) => {
      if (lockedMap[id]) lockedSelected[id] = true;
    });
    setSelectedMap(lockedSelected);
    setFeedback({ type: 'info', msg: '선택을 초기화했습니다.' });
  };

  const resolveRound = (score, passed) => {
    const result = {
      word: topic.word,
      score,
      passed,
      hintUsed,
      attempts: retryUsed ? 2 : 1,
    };
    setPendingResult(result);
    setRoundState('resolved');
  };

  const handleCheck = () => {
    if (roundState !== 'playing') return;
    if (selectedCount !== REQUIRED_COUNT) {
      setFeedback({ type: 'error', msg: '정확히 4개를 선택한 뒤 채점하세요.' });
      return;
    }

    const selected = options.filter((o) => selectedMap[o.id]);
    const isCorrect = selected.length === REQUIRED_COUNT && selected.every((o) => o.isGood);

    if (isCorrect) {
      const score = hintUsed ? 1 : 2;
      setFeedback({ type: 'success', msg: `정답입니다! 이번 문제 ${score}점` });
      resolveRound(score, true);
      return;
    }

    if (!retryUsed) {
      setRetryUsed(true);
      setFeedback({ type: 'error', msg: '오답입니다. 재시도 1회가 남아 있어요.' });
      return;
    }

    setFeedback({ type: 'error', msg: '오답입니다. 이번 문제는 0점으로 넘어갑니다.' });
    resolveRound(0, false);
  };

  const goNext = () => {
    if (!pendingResult) return;

    setResults((prev) => [...prev, pendingResult]);
    setTotalScore((prev) => prev + pendingResult.score);

    if (index >= VOCAB_DATA.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
  };

  const restartAll = () => {
    setIndex(0);
    setOptions(buildOptions(VOCAB_DATA[0]));
    setSelectedMap({});
    setLockedMap({});
    setHintUsed(false);
    setRetryUsed(false);
    setRoundState('playing');
    setPendingResult(null);
    setTotalScore(0);
    setResults([]);
    setIsComplete(false);
    setFeedback({ type: 'info', msg: '관련된 단어 4개를 고르세요.' });
  };

  if (isComplete) {
    const solved = results.filter((r) => r.passed).length;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="mx-auto mb-5 w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Step 3 완료</h1>
          <p className="text-slate-500 mb-8">기본형 완료. 미니게임(기존 `03_game.jsx`)은 별도 운영 가능합니다.</p>
          <div className="bg-indigo-50 rounded-2xl p-6 mb-6">
            <div className="text-sm text-indigo-500 font-bold mb-2">최종 점수</div>
            <div className="text-5xl font-black text-indigo-600">{totalScore} / {maxScore}</div>
            <div className="text-sm text-indigo-400 mt-2">정답 문제 수: {solved} / {VOCAB_DATA.length}</div>
          </div>
          <button
            onClick={restartAll}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> 처음부터 다시
          </button>
        </div>
      </div>
    );
  }

  const feedbackColor =
    feedback.type === 'success'
      ? 'text-green-700 bg-green-50'
      : feedback.type === 'error'
        ? 'text-rose-700 bg-rose-50'
        : feedback.type === 'warning'
          ? 'text-amber-700 bg-amber-50'
          : 'text-slate-600 bg-slate-100';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-slate-800">어휘의 징검다리 - Step 3 Basic</h1>
            <p className="text-xs text-slate-500">관련어 4개 고르기 (미니게임 분리형)</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-700">{index + 1} / {VOCAB_DATA.length}</div>
            <div className="text-xs text-slate-500">점수: {totalScore}</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <section className="bg-white border border-slate-200 rounded-3xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-indigo-600 mb-1">핵심 단어</div>
              <div className="text-4xl font-black text-slate-800">{topic.word}</div>
            </div>
            <button
              onClick={() => speak(topic.word)}
              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-bold hover:bg-indigo-100"
            >
              단어 듣기
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {options.map((option) => {
              const isSelected = !!selectedMap[option.id];
              const isLocked = !!lockedMap[option.id];

              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option)}
                  disabled={roundState !== 'playing'}
                  className={[
                    'h-14 rounded-xl font-bold border-2 transition-all',
                    isSelected ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300',
                    isLocked ? 'ring-2 ring-amber-300' : '',
                  ].join(' ')}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          <div className="mt-5 text-xs text-slate-500">
            선택: <b>{selectedCount}</b> / {REQUIRED_COUNT}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-5 mb-5">
          <div className={`rounded-xl px-4 py-3 text-sm font-bold ${feedbackColor}`}>
            {feedback.msg}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <button
              onClick={handleHint}
              disabled={hintUsed || roundState !== 'playing'}
              className={`py-3 rounded-xl font-bold border flex items-center justify-center gap-2 ${
                hintUsed || roundState !== 'playing'
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Lightbulb size={16} /> {hintUsed ? '힌트 사용됨' : '힌트 1회'}
            </button>

            <button
              onClick={handleReset}
              disabled={roundState !== 'playing'}
              className={`py-3 rounded-xl font-bold border flex items-center justify-center gap-2 ${
                roundState !== 'playing'
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <RefreshCcw size={16} /> 선택 초기화
            </button>

            <button
              onClick={handleCheck}
              disabled={roundState !== 'playing'}
              className={`py-3 rounded-xl font-bold border md:col-span-2 flex items-center justify-center gap-2 ${
                roundState !== 'playing'
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-500'
              }`}
            >
              {retryUsed ? <HelpCircle size={16} /> : <CheckCircle2 size={16} />}
              {retryUsed ? '재시도 채점' : '채점하기'}
            </button>
          </div>

          {roundState === 'resolved' && pendingResult && (
            <button
              onClick={goNext}
              className="w-full mt-4 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 flex items-center justify-center gap-2"
            >
              {pendingResult.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              다음 문제로 이동 <ArrowRight size={16} />
            </button>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-5">
          <h2 className="text-sm font-black text-slate-700 mb-3">공통 채점 규칙 (2~5단계)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="bg-green-50 text-green-700 rounded-lg p-2">정답(힌트X): 2점</div>
            <div className="bg-amber-50 text-amber-700 rounded-lg p-2">정답(힌트O): 1점</div>
            <div className="bg-rose-50 text-rose-700 rounded-lg p-2">오답: 0점</div>
          </div>
          <p className="text-xs text-slate-500 mt-3">힌트 1회, 재시도 1회 정책을 적용했습니다.</p>
        </section>
      </main>
    </div>
  );
}
