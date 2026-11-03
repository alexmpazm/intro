import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Object3D, type InstancedMesh } from 'three'
import type { Maze } from './maze'

type Box = { pos: [number, number, number]; size: [number, number, number] }

const WALL_HEIGHT = 0.9
const WALL_THICKNESS = 0.14

/** Many identical-colour boxes drawn in one go. */
function Boxes({ items, capacity, color }: { items: Box[]; capacity: number; color: string }) {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const dummy = new Object3D()
    items.forEach((b, i) => {
      dummy.position.set(...b.pos)
      dummy.scale.set(...b.size)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.count = items.length
    m.instanceMatrix.needsUpdate = true
  }, [items])

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, capacity]}>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </instancedMesh>
  )
}

/** Box sitting on the floor in cell i (cell 0 is the top-left). */
const floorTile = (height: number, cols: number, rows: number) => (i: number): Box => ({
  pos: [(i % cols) - cols / 2 + 0.5, height / 2, Math.floor(i / cols) - rows / 2 + 0.5],
  size: [0.8, height, 0.8],
})
export function Maze3D({ maze, visited, path }: { maze: Maze; visited: number[]; path: number[] }) {
  const { cols, rows } = maze
  const capacity = cols * rows * 2 + cols + rows

  const walls = useMemo(() => {
    const out: Box[] = []
    const h = WALL_HEIGHT / 2
    const long = 1 + WALL_THICKNESS
    maze.cells.forEach((c, i) => {
      const x = i % cols
      const y = Math.floor(i / cols)
      const left = x - cols / 2
      const top = y - rows / 2
      // Each shared wall is drawn once: top/left always, right/bottom only on the outer edge.
      if (c.top) out.push({ pos: [left + 0.5, h, top], size: [long, WALL_HEIGHT, WALL_THICKNESS] })
      if (c.left) out.push({ pos: [left, h, top + 0.5], size: [WALL_THICKNESS, WALL_HEIGHT, long] })
      if (c.right && x === cols - 1) out.push({ pos: [left + 1, h, top + 0.5], size: [WALL_THICKNESS, WALL_HEIGHT, long] })
      if (c.bottom && y === rows - 1) out.push({ pos: [left + 0.5, h, top + 1], size: [long, WALL_HEIGHT, WALL_THICKNESS] })
    })
    return out
  }, [maze, cols, rows])

  const visitedBoxes = useMemo(() => visited.map(floorTile(0.08, cols, rows)), [visited, cols, rows])
  const pathBoxes = useMemo(() => path.map(floorTile(0.3, cols, rows)), [path, cols, rows])
  const endpoints = useMemo(() => [maze.start, maze.goal].map(floorTile(0.6, cols, rows)), [maze.start, maze.goal, cols, rows])

  return (
    <Canvas camera={{ position: [0, 26, 20], fov: 45 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 8]} intensity={1.6} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cols + 1, rows + 1]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      <Boxes items={walls} capacity={capacity} color="#334155" />
      <Boxes items={visitedBoxes} capacity={cols * rows} color="#a78bfa" />
      <Boxes items={pathBoxes} capacity={cols * rows} color="#f59e0b" />
      <Boxes items={endpoints.slice(0, 1)} capacity={1} color="#22c55e" />
      <Boxes items={endpoints.slice(1)} capacity={1} color="#ef4444" />

      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} minDistance={8} maxDistance={50} />
    </Canvas>
  )
}
