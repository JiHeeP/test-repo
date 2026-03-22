import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Player = 'X' | 'O'
type Cell = Player | null
type LevelKey = 'level1' | 'level2' | 'level3'
type Mode = 'pvp' | 'pvc'
type TimeLimit = 10 | 15 | 20 | 0

type Problem = { text: string; answer: number }
type Point = { row: number; col: number }

type Setup = {
  mode: Mode
  level: Exclude<LevelKey, 'level3'>
  timeLimit: TimeLimit
}

const BOARD_SIZE = 10
const WIN_LENGTH = 5
const DEFAULT_SETUP: Setup = {
  mode: 'pvc',
  level: 'level2',
  timeLimit: 20,
}

const LEVEL_LABEL: Record<LevelKey, string> = {
  level1: 'Level 1',
  level2: 'Level 2',
  level3: 'Level 3',
}

const emptyBoard = () => Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(null))
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const nextPlayer = (p: Player): Player => (p === 'X' ? 'O' : 'X')

function generateProblem(level: Exclude<LevelKey, 'level3'>): Problem {
  if (level === 'level1') {
    const a = randInt(2, 9)
    const b = randInt(2, 9)
    if (Math.random() < 0.5) return { text: `${a} × ${b} = ?`, answer: a * b }
    return { text: `${a * b} ÷ ${a} = ?`, answer: b }
  }

  if (Math.random() < 0.5) {
    const a = randInt(10, 99)
    const b = randInt(2, 9)
    return { text: `${a} × ${b} = ?`, answer: a * b }
  }

  // 두자리수 ÷ 한자리수 (나머지 없음): 피제수(앞 숫자)를 반드시 10~99로 고정
  const divCandidates: Array<{ dividend: number; divisor: number; quotient: number }> = []
  for (let dividend = 10; dividend <= 99; dividend += 1) {
    for (let divisor = 2; divisor <= 9; divisor += 1) {
      if (dividend % divisor === 0) {
        divCandidates.push({ dividend, divisor, quotient: dividend / divisor })
      }
    }
  }
  const picked = divCandidates[randInt(0, divCandidates.length - 1)]
  return { text: `${picked.dividend} ÷ ${picked.divisor} = ?`, answer: picked.quotient }
}

function countDir(board: Cell[][], row: number, col: number, dr: number, dc: number, player: Player) {
  let r = row + dr
  let c = col + dc
  let count = 0
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count += 1
    r += dr
    c += dc
  }
  return count
}

function checkWin(board: Cell[][], row: number, col: number, player: Player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (const [dr, dc] of dirs) {
    const count = 1 + countDir(board, row, col, dr, dc, player) + countDir(board, row, col, -dr, -dc, player)
    if (count >= WIN_LENGTH) return true
  }
  return false
}

function getEmptyCells(board: Cell[][]): Point[] {
  const out: Point[] = []
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (!board[r][c]) out.push({ row: r, col: c })
  return out
}

function evaluateMove(board: Cell[][], row: number, col: number, player: Player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  let score = 0
  for (const [dr, dc] of dirs) {
    const count = 1 + countDir(board, row, col, dr, dc, player) + countDir(board, row, col, -dr, -dc, player)
    score += count * count
  }
  const center = (BOARD_SIZE - 1) / 2
  const dist = Math.abs(row - center) + Math.abs(col - center)
  score += Math.max(0, 8 - dist)
  return score
}

function chooseAiMove(board: Cell[][]): Point | null {
  const empties = getEmptyCells(board)
  if (!empties.length) return null

  for (const p of empties) {
    const next = board.map(r => [...r])
    next[p.row][p.col] = 'O'
    if (checkWin(next, p.row, p.col, 'O')) return p
  }
  for (const p of empties) {
    const next = board.map(r => [...r])
    next[p.row][p.col] = 'X'
    if (checkWin(next, p.row, p.col, 'X')) return p
  }

  let bestScore = -Infinity
  let best: Point[] = []
  for (const p of empties) {
    const oBoard = board.map(r => [...r]); oBoard[p.row][p.col] = 'O'
    const xBoard = board.map(r => [...r]); xBoard[p.row][p.col] = 'X'
    const total = evaluateMove(oBoard, p.row, p.col, 'O') * 1.1 + evaluateMove(xBoard, p.row, p.col, 'X') * 1.25
    if (total > bestScore) { bestScore = total; best = [p] }
    else if (total === bestScore) best.push(p)
  }
  return best[Math.floor(Math.random() * best.length)]
}

export default function App() {
  const [phase, setPhase] = useState<'setup' | 'play'>('setup')
  const [setup, setSetup] = useState<Setup>(DEFAULT_SETUP)
  const [board, setBoard] = useState<Cell[][]>(emptyBoard)
  const [player, setPlayer] = useState<Player>('X')
  const [winner, setWinner] = useState<Player | null>(null)
  const [problem, setProblem] = useState<Problem>(() => generateProblem('level2'))
  const [selected, setSelected] = useState<Point | null>(null)
  const [answerInput, setAnswerInput] = useState('')
  const [message, setMessage] = useState('칸을 클릭하면 문제 팝업이 뜹니다.')
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SETUP.timeLimit)
  const [questionOpen, setQuestionOpen] = useState(false)
  const [turnNotice, setTurnNotice] = useState('')

  const isDraw = useMemo(() => board.flat().every(Boolean), [board])

  const playerLabel = (p: Player) => {
    if (setup.mode === 'pvc') return p === 'X' ? '나' : '컴퓨터'
    return p === 'X' ? '선수 1' : '선수 2'
  }

  useEffect(() => {
    if (phase !== 'play' || winner) return
    setTurnNotice(`${playerLabel(player)} 턴`)
    const t = setTimeout(() => setTurnNotice(''), 900)
    return () => clearTimeout(t)
  }, [player, phase, winner, setup.mode])

  const resetRound = (s = setup) => {
    setBoard(emptyBoard())
    setPlayer('X')
    setWinner(null)
    setSelected(null)
    setAnswerInput('')
    setProblem(generateProblem(s.level))
    setMessage('칸을 클릭하면 문제 팝업이 뜹니다.')
    setTimeLeft(s.timeLimit)
    setQuestionOpen(false)
  }

  const switchTurn = () => {
    setSelected(null)
    setAnswerInput('')
    setPlayer(p => nextPlayer(p))
    setProblem(generateProblem(setup.level))
    setTimeLeft(setup.timeLimit)
    setQuestionOpen(false)
  }

  const placeStone = (p: Point, who: Player) => {
    const next = board.map(r => [...r])
    next[p.row][p.col] = who
    setBoard(next)
    if (checkWin(next, p.row, p.col, who)) { setWinner(who); setMessage(`${playerLabel(who)} 승리!`); return true }
    if (next.flat().every(Boolean)) { setMessage('무승부!'); return true }
    return false
  }

  const submit = () => {
    if (!selected || winner || isDraw || phase !== 'play' || !questionOpen) return
    const value = Number(answerInput.trim())
    if (!Number.isFinite(value)) return setMessage('숫자를 입력해 주세요.')
    if (value !== problem.answer) {
      setMessage(`오답(정답: ${problem.answer}) — 턴 종료`)
      return switchTurn()
    }
    if (placeStone(selected, player)) return setQuestionOpen(false)
    setMessage('정답! 착수 완료, 턴 교대')
    switchTurn()
  }

  const clickBoard = (row: number, col: number) => {
    if (winner || isDraw) return
    if (setup.mode === 'pvc' && player === 'O') return
    if (board[row][col]) return
    setSelected({ row, col })
    setAnswerInput('')
    setProblem(generateProblem(setup.level))
    setQuestionOpen(true)
  }

  const keyPadInput = (v: string) => {
    setAnswerInput(prev => {
      if (v === '⌫') return prev.slice(0, -1)
      if (v === 'C') return ''
      if (v === '-') return prev.startsWith('-') ? prev.slice(1) : `-${prev}`
      if (prev.length > 8) return prev
      return prev + v
    })
  }

  useEffect(() => {
    if (phase !== 'play' || setup.timeLimit === 0 || winner || isDraw || !questionOpen) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setMessage('시간 초과 — 턴 종료')
          switchTurn()
          return setup.timeLimit
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase, setup, winner, isDraw, questionOpen])

  useEffect(() => {
    if (phase !== 'play' || setup.mode !== 'pvc' || player !== 'O' || winner || isDraw) return
    const t = setTimeout(() => {
      const move = chooseAiMove(board)
      if (!move) return
      if (placeStone(move, 'O')) return
      setMessage('컴퓨터 착수 완료')
      setPlayer('X')
      setProblem(generateProblem(setup.level))
      setTimeLeft(setup.timeLimit)
      setQuestionOpen(false)
    }, 500)
    return () => clearTimeout(t)
  }, [phase, setup, player, board, winner, isDraw])

  if (phase === 'setup') {
    return (
      <main className="container">
        <h1>수학 오목</h1>
        <p className="sub">칸 클릭 → 문제 팝업 → 답 입력(숫자 키패드) → 맞으면 착수</p>

        <section className="card">
          <h3>모드</h3>
          <div className="row">
            <button className={setup.mode === 'pvp' ? 'active' : ''} onClick={() => setSetup(s => ({ ...s, mode: 'pvp' }))}>사람 vs 사람</button>
            <button className={setup.mode === 'pvc' ? 'active' : ''} onClick={() => setSetup(s => ({ ...s, mode: 'pvc' }))}>사람 vs 컴퓨터</button>
          </div>

          <h3>레벨</h3>
          <div className="row">
            {(['level1', 'level2', 'level3'] as LevelKey[]).map(k => (
              <button
                key={k}
                disabled={k === 'level3'}
                className={`${setup.level === k ? 'active' : ''} ${k === 'level3' ? 'locked' : ''}`}
                onClick={() => k !== 'level3' && setSetup(s => ({ ...s, level: k as Exclude<LevelKey, 'level3'> }))}
              >
                {LEVEL_LABEL[k]}
              </button>
            ))}
          </div>

          <h3>제한 시간</h3>
          <div className="row">
            {[10,15,20,0].map(v => (
              <button key={v} className={setup.timeLimit === v ? 'active' : ''} onClick={() => setSetup(s => ({ ...s, timeLimit: v as TimeLimit }))}>{v === 0 ? '무제한' : `${v}초`}</button>
            ))}
          </div>

          <button className="start" onClick={() => { setPhase('play'); resetRound(setup) }}>게임 시작</button>
        </section>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="tablet">
        <header className="topbar">
          <span className="turnBadge">
            <span className={`stone ${player === 'X' ? 'black' : 'white'}`} />
            턴: {playerLabel(player)}
          </span>
          <span className="modeBadge">모드: {setup.mode === 'pvc' ? '사람 vs 컴퓨터' : '사람 vs 사람'}</span>
          <span className="timeBadge">시간: {setup.timeLimit === 0 ? '무제한' : `${timeLeft}초`}</span>
        </header>

        <div className="boardWrap">
          <div
            className="board"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            }}
          >
            {board.map((row, r) => row.map((cell, c) => {
              const picked = selected?.row === r && selected?.col === c
              const disabled = !!cell || !!winner || isDraw || (setup.mode === 'pvc' && player === 'O')
              return (
                <button key={`${r}-${c}`} disabled={disabled} onClick={() => clickBoard(r, c)} className={`cell ${picked ? 'picked' : ''} ${cell === 'X' ? 'x' : ''} ${cell === 'O' ? 'o' : ''}`}>
                  {cell === 'X' && <span className="stone black" />}
                  {cell === 'O' && <span className="stone white" />}
                </button>
              )
            }))}
          </div>
        </div>

        {turnNotice && <div className="turnNotice">{turnNotice}</div>}

        {questionOpen && (
          <div className="questionModal">
            <div className="problemBox">
              <div className="problemHead">문제</div>
              <strong>{problem.text}</strong>
              <small>선택 칸: {selected ? `${selected.row + 1}, ${selected.col + 1}` : '없음'}</small>
              <input value={answerInput} readOnly placeholder="숫자 입력" />

              <div className="keypad">
                {['7','8','9','4','5','6','1','2','3','C','0','⌫'].map(k => (
                  <button key={k} onClick={() => keyPadInput(k)}>{k}</button>
                ))}
              </div>

              <div className="modalActions">
                <button className="submit" onClick={submit}>제출</button>
                <button onClick={() => { setQuestionOpen(false); setSelected(null); setAnswerInput('') }}>취소</button>
              </div>
            </div>
          </div>
        )}

        <div className="actions">
          <button onClick={() => { setPhase('setup'); resetRound(setup) }}>처음으로</button>
        </div>

        <p className="msg">{winner ? `${playerLabel(winner)} 승리!` : isDraw ? '무승부!' : message}</p>
      </div>

      {winner && (
        <div className="questionModal">
          <div className="resultPopup">
            <p>게임이 종료되었습니다.</p>
            <strong>{winner ? `${playerLabel(winner)}이 이겼습니다.` : ''}</strong>
            <button className="submit" onClick={() => { setPhase('setup'); resetRound(setup) }}>확인</button>
          </div>
        </div>
      )}
    </main>
  )
}
