import { useEffect, useMemo, useState } from 'react'
import { generateMaze, solve, type Algo, type Maze, type SolveResult } from './maze'
import { Maze3D } from './Maze3D'
import './App.css'

const COLS = 25
const ROWS = 25

const ALGOS: { id: Algo; label: string }[] = [
  { id: 'bfs', label: 'Breadth-first (BFS)' },
  { id: 'dfs', label: 'Depth-first (DFS)' },
  { id: 'astar', label: 'A*' },
]

function App() {
  const [maze, setMaze] = useState<Maze>(() => generateMaze(COLS, ROWS))
  const [algo, setAlgo] = useState<Algo>('bfs')
  const [result, setResult] = useState<SolveResult | null>(null)
  const [step, setStep] = useState(0)
  const running = result !== null && step < result.visited.length
  const finished = result !== null && !running

  const newMaze = () => {
    setMaze(generateMaze(COLS, ROWS))
    setResult(null)
    setStep(0)
  }

  const start = () => {
    setResult(solve(maze, algo))
    setStep(0)
  }

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setStep((s) => s + 2), 20)
    return () => clearInterval(timer)
  }, [running])

  const visited = useMemo(() => (result ? result.visited.slice(0, step) : []), [result, step])
  const path = useMemo(() => (finished ? result.path : []), [finished, result])

  return (
    <main className="maze-app">
      <h1>Maze</h1>
      <div className="controls">
        <select value={algo} onChange={(e) => setAlgo(e.target.value as Algo)} disabled={running}>
          {ALGOS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        <button onClick={start} disabled={running}>
          Solve
        </button>
        <button onClick={newMaze} disabled={running}>
          New maze
        </button>
      </div>
      <div className="viewport">
        <Maze3D maze={maze} visited={visited} path={path} />
      </div>
      <p className="stats">
        {finished
          ? `Explored ${result.visited.length} cells · path length ${result.path.length}`
          : 'Green is the start, red is the goal. Drag to rotate, scroll to zoom.'}
      </p>
    </main>
  )
}

export default App
