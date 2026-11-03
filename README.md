# Maze Solver

An interactive 3D maze built with React, TypeScript and Three.js. It generates a random maze and animates three search algorithms solving it, so you can compare how they explore.

**Live demo:**

- Cloudflare: https://maze-solver.alexmpazm.workers.dev/
- Vercel: https://maze-solver-sigma.vercel.app/
- Netlify: https://maze-solver-sigma.netlify.app/

## Features

- Random 25×25 maze, generated with a depth-first backtracker. A few extra walls are removed so there is more than one route.
- Random start (green) and goal (red) cells, placed at least half the maze apart.
- Three solvers: Breadth-first search (BFS), Depth-first search (DFS) and A*.
- The animation shows the explored cells in purple, then the final path in orange.
- Stats show how many cells were explored and the path length.
- Drag to rotate the view and scroll to zoom.

## Tech stack

- [React 19](https://react.dev) for the UI and state
- [Three.js](https://threejs.org) with [@react-three/fiber](https://r3f.docs.pmnd.rs) and [@react-three/drei](https://drei.docs.pmnd.rs) for the 3D scene
- [Vite](https://vite.dev) for dev server and build
- TypeScript and [Oxlint](https://oxc.rs/docs/guide/usage/linter)

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL that Vite prints.

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload           |
| `npm run build`   | Type-check and build the site into `dist/`     |
| `npm run preview` | Serve the built `dist/` folder locally         |
| `npm run lint`    | Lint the code with Oxlint                      |

## Project structure

```
src/
  maze.ts     Maze generation (generateMaze) and the BFS / DFS / A* solver (solve)
  App.tsx     UI, state and the solve animation
  Maze3D.tsx  3D rendering of the maze, explored cells and path
  main.tsx    App entry point
```

## Configuration

The maze size is set by `COLS` and `ROWS` at the top of `src/App.tsx`. The start and goal are chosen in `generateMaze` in `src/maze.ts`.

## Deployment

The build output is a static site in `dist/`, so it can be hosted on any static host such as Cloudflare or Vercel. Use `npm run build` as the build command and `dist` as the output directory.
