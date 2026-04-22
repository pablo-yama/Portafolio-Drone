---
description: Naming, component structure, and git conventions for this project
alwaysApply: true
---

# Code Conventions

## Naming

- Components: `PascalCase` (e.g. `HeroSection.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g. `useScrollProgress.ts` in [src/hooks/](../../src/hooks/))
- Utilities / libs: `camelCase` (e.g. `animations.ts`, `jsonLd.ts` in [src/lib/](../../src/lib/))
- GLSL files (if added): `camelCase` (e.g. `imageReveal.frag`)
- Styles: Tailwind utilities + CSS custom properties from [src/app/globals.css](../../src/app/globals.css). No CSS Modules.

## Imports

- Use the `@/*` path alias (→ `./src/*`) for anything under `src/`. Don't write deep relative paths like `../../../lib/constants`.
- Client-only files start with `'use client';` on the first line. Server Components (the default in App Router) omit it.
- Three.js / R3F components must be loaded via `next/dynamic` with `{ ssr: false }` — see Three.js imports in [HeroSection](../../src/components/sections/HeroSection.tsx), [ContactSection](../../src/components/sections/ContactSection.tsx).

## Components

- Functional components with arrow functions or named `function` exports
- Props typed with `interface` (not `type`)
- Pages (`src/app/<route>/page.tsx`): `export default function Page()`
- Reusable components: `export function Name()` (named export)
- Animation logic goes in hooks or [src/lib/animations.ts](../../src/lib/animations.ts), not inline in components
- Keep `useEffect` cleanup strict — remove event listeners, destroy Lenis instances, `gsap.ticker.remove(callback)`. See [SmoothScroll.tsx](../../src/components/layout/SmoothScroll.tsx) for the canonical cleanup pattern.

## Data flow

Content that appears on the site — services, pricing tiers, projects, FAQ, stats, bio, social links, nav links — lives in [src/lib/constants.ts](../../src/lib/constants.ts) as `as const` exports. Section components import from there. The archive feed is separate: [src/lib/archive.ts](../../src/lib/archive.ts). **Do not duplicate this data inside components**; update the constant and let the JSON-LD builders ([src/lib/jsonLd.ts](../../src/lib/jsonLd.ts)) and sections update together.

## Git

- Conventional commits: `feat:`, `fix:`, `style:`, `perf:`, `refactor:`, `chore:`, `docs:`
- Branches: `feature/name`, `fix/name`, `perf/name`
- Work on a branch; open a PR to merge to `main` (see [.gitignore](../../.gitignore) — `ACTION-PLAN.md` and `FULL-AUDIT-REPORT.md` are intentionally untracked)
- No test or typecheck script exists — run `npm run lint` and, if changes are substantial, `npx tsc --noEmit` before committing
