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
  selectedTables: number[]
  timeLimit: TimeLimit
}

const BOARD_SIZE = 10
const WIN_LENGTH = 5
const DEFAULT_SETUP: Setup = {
  mode: 'pvc',
  level: 'level2',
  selectedTables: [2, 3, 4, 5, 6, 7, 8, 9],
  timeLimit: 15,
}

const LEVEL_LABEL: Record<LevelKey, string> = {
  level1: 'Level 1',
  level2: 'Level 2',
  level3: 'Level 3',
}

const emptyBoard = () => Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(null))
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(arr: T[]) => arr[randInt(0, arr.length - 1)]
const nextPlayer = (p: Player): Player => (p === 'X' ? 'O' : 'X')

function generateProblem(level: Exclude<LevelKey, 'level3'>, selectedTables: number[]): Problem {
  const tables = selectedTables.length ? selectedTables : [2, 3, 4, 5, 6, 7, 8, 9]

  if (level === 'level1') {
    const table = pick(tables)
    const rhs = randInt(2, 9)
    if (Math.random() < 0.5) return { text: `${table} × ${rhs} = ?`, answer: table * rhs }
    return { text: `${table * rhs} ÷ ${table} = ?`, answer: rhs }
  }

  if (Math.random() < 0.5) {
    const a = randInt(10, 99)
    const b = randInt(2, 9)
    return { text: `${a} × ${b} = ?`, answer: a * b }
  }

  const divisor = randInt(2, 9)
  const quotient = randInt(10, 99)
  return { text: `${divisor * quotient} ÷ ${divisor} = ?`, answer: quotient }
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
  return pick(best)
}

export default function App() {
  const [phase, setPhase] = useState<'setup' | 'play'>('setup')
  const [setup, setSetup] = useState<Setup>(DEFAULT_SETUP)
  const [board, setBoard] = useState<Cell[][]>(emptyBoard)
  const [player, setPlayer] = useState<Player>('X')
  const [winner, setWinner] = useState<Player | null>(null)
  const [problem, setProblem] = useState<Problem>(() => generateProblem('level2', DEFAULT_SETUP.selectedTables))
  const [selected, setSelected] = useState<Point | null>(null)
  const [input, setInput] = useState('')
  const [message, setMessage] = useState('칸 선택 → 정답 제출!')
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SETUP.timeLimit)

  const isDraw = useMemo(() => board.flat().every(Boolean), [board])

  const resetRound = (s = setup) => {
    setBoard(emptyBoard())
    setPlayer('X')
    setWinner(null)
    setSelected(null)
    setInput('')
    setProblem(generateProblem(s.level, s.selectedTables))
    setMessage('칸 선택 → 정답 제출!')
    setTimeLeft(s.timeLimit)
  }

  const switchTurn = () => {
    setSelected(null)
    setInput('')
    setPlayer(p => nextPlayer(p))
    setProblem(generateProblem(setup.level, setup.selectedTables))
    setTimeLeft(setup.timeLimit)
  }

  const placeStone = (p: Point, who: Player) => {
    const next = board.map(r => [...r])
    next[p.row][p.col] = who
    setBoard(next)
    if (checkWin(next, p.row, p.col, who)) { setWinner(who); setMessage(`${who} 승리!`); return true }
    if (next.flat().every(Boolean)) { setMessage('무승부!'); return true }
    return false
  }

  const submit = () => {
    if (!selected || winner || isDraw || phase !== 'play') return
    const value = Number(input.trim())
    if (!Number.isFinite(value)) return setMessage('숫자를 입력해 주세요.')
    if (value !== problem.answer) { setMessage(`오답(정답: ${problem.answer}) — 턴 종료`); return switchTurn() }
    if (placeStone(selected, player)) return
    setMessage('정답! 턴 교대')
    switchTurn()
  }

  useEffect(() => {
    if (phase !== 'play' || setup.timeLimit === 0 || winner || isDraw) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setMessage('시간 초과 — 턴 종료')
          setSelected(null); setInput(''); setPlayer(p => nextPlayer(p)); setProblem(generateProblem(setup.level, setup.selectedTables))
          return setup.timeLimit
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase, setup, winner, isDraw])

  useEffect(() => {
    if (phase !== 'play' || setup.mode !== 'pvc' || player !== 'O' || winner || isDraw) return
    const t = setTimeout(() => {
      const move = chooseAiMove(board)
      if (!move) return
      if (placeStone(move, 'O')) return
      setMessage('컴퓨터 착수 완료')
      setPlayer('X')
      setProblem(generateProblem(setup.level, setup.selectedTables))
      setTimeLeft(setup.timeLimit)
    }, 450)
    return () => clearTimeout(t)
  }, [phase, setup, player, board, winner, isDraw])

  if (phase === 'setup') {
    return (
      <main className="container">
        <h1>똑똑한 구구단 오목</h1>
        <p className="sub">태블릿 전용 4:3 · 정답 맞혀야 착수</p>

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

          <h3>구구단 선택</h3>
          <div className="grid8">
            {[2,3,4,5,6,7,8,9].map(n => (
              <button
                key={n}
                className={setup.selectedTables.includes(n) ? 'active' : ''}
                onClick={() => setSetup(s => ({ ...s, selectedTables: s.selectedTables.includes(n) ? s.selectedTables.filter(v => v !== n) : [...s.selectedTables, n].sort() }))}
              >{n}단</button>
            ))}
          </div>

          <h3>제한 시간</h3>
          <div className="row">
            {[10,15,20,0].map(v => (
              <button key={v} className={setup.timeLimit === v ? 'active' : ''} onClick={() => setSetup(s => ({ ...s, timeLimit: v as TimeLimit }))}>{v === 0 ? '무제한' : `${v}초`}</button>
            ))}
          </div>

          <button className="start" disabled={!setup.selectedTables.length} onClick={() => { setPhase('play'); resetRound(setup) }}>게임 시작</button>
        </section>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="tablet">
        <header className="topbar">
          <span>{player} 턴</span>
          <span>{setup.mode === 'pvc' ? '사람 vs 컴퓨터' : '사람 vs 사람'}</span>
          <span>{setup.timeLimit === 0 ? '∞' : `${timeLeft}s`}</span>
        </header>

        <div className="boardWrap">
          <div className="board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
            {board.map((row, r) => row.map((cell, c) => {
              const picked = selected?.row === r && selected?.col === c
              const disabled = !!cell || !!winner || isDraw || (setup.mode === 'pvc' && player === 'O')
              return (
                <button key={`${r}-${c}`} disabled={disabled} onClick={() => setSelected({ row: r, col: c })} className={`cell ${picked ? 'picked' : ''} ${cell === 'X' ? 'x' : ''} ${cell === 'O' ? 'o' : ''}`}>
                  {cell ?? ''}
                </button>
              )
            }))}
          </div>

          <div className="overlay">
            <div className="problem">
              <div>문제</div>
              <strong>{problem.text}</strong>
              <small>선택 칸: {selected ? `${selected.row + 1}, ${selected.col + 1}` : '없음'}</small>
            </div>
          </div>
        </div>

        <div className="actions">
          <input type="number" value={input} onChange={e => setInput(e.target.value)} placeholder="정답 입력" disabled={!!winner || isDraw || (setup.mode === 'pvc' && player === 'O')} />
          <button onClick={submit} disabled={!selected || !!winner || isDraw || (setup.mode === 'pvc' && player === 'O')}>제출</button>
          <button onClick={() => { setPhase('setup'); resetRound(setup) }}>처음으로</button>
        </div>

        <p className="msg">{winner ? `${winner} 승리!` : isDraw ? '무승부!' : message}</p>
      </div>
    </main>
  )
}
