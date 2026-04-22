---
description: GSAP animation principles, presets, and patterns for the aerial portfolio
globs: ["**/*.tsx", "**/*.ts"]
---

# Animation Guidelines

## Core Principles

1. **60fps always** — animate only `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`.
2. **Reduced motion** — respect `prefers-reduced-motion`: disable parallax, particles, and complex animations; keep basic fades.
3. **Mobile first** — on coarse-pointer / low-core devices, replace heavy 3D scenes with static images or video. See the `canRender3D()` pattern in [.claude/rules/performance.md](performance.md).
4. **Stagger everything** — don't animate elements simultaneously. Use stagger `0.05–0.15s`.
5. **Cinematic easing** — `power3.out` / `power4.out` for entrances, `power2.inOut` for transitions. Avoid `linear` unless paired with `scrub`.
6. **Cleanup is mandatory** — every `useEffect` that creates GSAP tweens / ScrollTriggers / event listeners must reverse them in the return function. Wrap scoped animations in `gsap.context(() => {...}, scopeRef)` and call `ctx.revert()`.

## Where the presets live

`EASE` and `DURATION` are exported from [src/lib/constants.ts](../../src/lib/constants.ts), and reusable animation helpers are in [src/lib/animations.ts](../../src/lib/animations.ts) (`animateTextReveal`, `animateImageReveal`, `animateFadeIn`, `animateStaggerIn`, `createParallax`, `animateCounter`). Prefer these over inline one-offs.

```typescript
// src/lib/constants.ts
export const EASE = {
  smooth:    'power3.out',
  smoother:  'power4.out',
  snappy:    'back.out(1.4)',
  elastic:   'elastic.out(1, 0.5)',
  cinematic: 'power2.inOut',
} as const;

export const DURATION = {
  fast:      0.4,
  normal:    0.8,
  slow:      1.2,
  cinematic: 1.8,
} as const;
```

## ScrollTrigger registration

`ScrollTrigger` is registered **once** in [src/components/layout/SmoothScroll.tsx](../../src/components/layout/SmoothScroll.tsx) via `gsap.registerPlugin(ScrollTrigger)`. If you add another GSAP plugin (Flip, SplitText, DrawSVG), register it at module scope in the file that first imports it, not inside `useEffect`.

## Lenis + GSAP integration (the real pattern from the codebase)

[src/components/layout/SmoothScroll.tsx](../../src/components/layout/SmoothScroll.tsx) is the canonical wiring. Don't reinvent it — if smooth scroll breaks, fix it there.

```tsx
'use client';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

useEffect(() => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
  });

  lenis.on('scroll', ScrollTrigger.update);

  // Store the exact reference so cleanup removes the right function
  const rafCallback = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(rafCallback);
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis.destroy();
    gsap.ticker.remove(rafCallback);
  };
}, []);
```

## Common patterns

### Text reveal from below

```typescript
gsap.from(element, {
  y: '110%', opacity: 0,
  duration: DURATION.slow, ease: EASE.smooth, stagger: 0.03,
});
```

### Image reveal with clip-path

```typescript
// IMPORTANT: don't set clipPath as an inline JSX style when GSAP also controls it.
// Let GSAP own the initial state via gsap.set() inside useEffect.
gsap.fromTo(element,
  { clipPath: 'inset(100% 0 0 0)' },
  { clipPath: 'inset(0% 0 0 0)', duration: DURATION.cinematic, ease: EASE.cinematic },
);
```

### Parallax on scroll (simple)

```typescript
gsap.to(element, {
  y: () => window.innerHeight * speed * -1,
  ease: 'none',
  scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
});
```

### GPU-accelerated parallax (preferred for long lists)

```typescript
const setY = gsap.quickSetter(element, 'y', 'px');
ScrollTrigger.create({
  trigger: section,
  start: 'top top', end: 'bottom top',
  scrub: true,
  onUpdate: (self) => setY(self.progress * 150),
});
```

### Animated counter (used in [StatsSection](../../src/components/sections/StatsSection.tsx))

```typescript
gsap.to(element, {
  textContent: target,
  duration: DURATION.cinematic, ease: EASE.smooth,
  snap: { textContent: 1 },
  scrollTrigger: { trigger: element, start: 'top 80%', toggleActions: 'play none none none' },
});
```

### Cursor with quickTo — see [Cursor.tsx](../../src/components/layout/Cursor.tsx)

```typescript
const xTo = gsap.quickTo(cursorRef.current, 'x', { duration: 0.6, ease: 'power3' });
const yTo = gsap.quickTo(cursorRef.current, 'y', { duration: 0.6, ease: 'power3' });
window.addEventListener('mousemove', (e) => { xTo(e.clientX); yTo(e.clientY); });
```

### Horizontal scroll / pinned sections (reference only — not currently on the homepage)

```typescript
const panels = gsap.utils.toArray<HTMLElement>('.service-panel');
gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.services-container',
    pin: true, scrub: 1,
    snap: 1 / (panels.length - 1),
    end: () => '+=' + (document.querySelector('.services-container') as HTMLElement).offsetWidth,
  },
});
```
