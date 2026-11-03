export type Cell = { top: boolean; right: boolean; bottom: boolean; left: boolean }
export type Maze = { cols: number; rows: number; cells: Cell[] } // index = y * cols + x
export type Algo = 'bfs' | 'dfs' | 'astar'
export type SolveResult = { visited: number[]; path: number[] }

// Wall to knock down between a cell and its neighbour, per direction.
const DIRS = [
  { dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },
  { dx: 1, dy: 0, wall: 'right', opposite: 'left' },
  { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },
  { dx: -1, dy: 0, wall: 'left', opposite: 'right' },
] as const

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function neighbour(maze: Maze, i: number, d: (typeof DIRS)[number]): number | null {
  const x = (i % maze.cols) + d.dx
  const y = Math.floor(i / maze.cols) + d.dy
  if (x < 0 || y < 0 || x >= maze.cols || y >= maze.rows) return null
  return y * maze.cols + x
}

function carve(maze: Maze, i: number, d: (typeof DIRS)[number], n: number) {
  maze.cells[i][d.wall] = false
  maze.cells[n][d.opposite] = false
}

/** Random maze (depth-first backtracker). `loops` is the share of extra walls removed, so there are several routes. */
export function generateMaze(cols: number, rows: number, loops = 0.08): Maze {
  const maze: Maze = {
    cols,
    rows,
    cells: Array.from({ length: cols * rows }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
    })),
  }

  const seen = new Set<number>([0])
  const stack = [0]
  while (stack.length) {
    const current = stack[stack.length - 1]
    const options = shuffle([...DIRS]).flatMap((d) => {
      const n = neighbour(maze, current, d)
      return n !== null && !seen.has(n) ? [{ d, n }] : []
    })
    if (options.length === 0) {
      stack.pop()
      continue
    }
    const { d, n } = options[0]
    carve(maze, current, d, n)
    seen.add(n)
    stack.push(n)
  }

  // Knock out some extra walls to create loops.
  for (let i = 0; i < maze.cells.length; i++) {
    for (const d of [DIRS[1], DIRS[2]]) {
      const n = neighbour(maze, i, d)
      if (n !== null && maze.cells[i][d.wall] && Math.random() < loops) carve(maze, i, d, n)
    }
  }
  return maze
}

function openNeighbours(maze: Maze, i: number): number[] {
  return DIRS.flatMap((d) => {
    const n = neighbour(maze, i, d)
    return n !== null && !maze.cells[i][d.wall] ? [n] : []
  })
}

/** Search from the top-left to the bottom-right cell. `visited` is the order cells were explored in. */
export function solve(maze: Maze, algo: Algo): SolveResult {
  const { cols, rows } = maze
  const start = 0
  const goal = cols * rows - 1
  const heuristic = (i: number) => Math.abs((i % cols) - (cols - 1)) + Math.abs(Math.floor(i / cols) - (rows - 1))

  const cost = new Map<number, number>([[start, 0]])
  const parent = new Map<number, number>()
  const closed = new Set<number>()
  const open = [start]
  const visited: number[] = []

  while (open.length) {
    let pick = 0 // bfs: oldest first
    if (algo === 'dfs') pick = open.length - 1 // newest first
    if (algo === 'astar') {
      const score = (i: number) => cost.get(i)! + heuristic(i)
      open.forEach((c, k) => {
        if (score(c) < score(open[pick])) pick = k
      })
    }
    const [current] = open.splice(pick, 1)
    if (closed.has(current)) continue
    closed.add(current)
    visited.push(current)
    if (current === goal) break

    for (const n of openNeighbours(maze, current)) {
      if (closed.has(n)) continue
      const next = cost.get(current)! + 1
      if (!cost.has(n) || next < cost.get(n)!) {
        cost.set(n, next)
        parent.set(n, current)
        open.push(n)
      }
    }
  }

  const path: number[] = []
  if (closed.has(goal)) {
    for (let at: number | undefined = goal; at !== undefined; at = parent.get(at)) path.push(at)
    path.reverse()
  }
  return { visited, path }
}
