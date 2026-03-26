---
description: Naming, component structure, and git conventions for this project
alwaysApply: true
---

# Code Conventions

## Naming
- Components: `PascalCase` (e.g. `HeroSection.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g. `useScrollProgress.ts`)
- Utilities: `camelCase` (e.g. `animations.ts`)
- GLSL files: `camelCase` (e.g. `imageReveal.frag`)
- CSS: Tailwind utilities only — no CSS Modules

## Components
- Functional components with arrow functions
- Props typed with `interface` (not `type`)
- Pages: `export default`
- Reusable components: `export function`
- Animation logic goes in custom hooks, not inline in the component

## Git
- Conventional commits: `feat:`, `fix:`, `style:`, `perf:`, `refactor:`
- Branches: `feature/name`, `fix/name`, `perf/name`
- PR required to merge to `main`
