---
description: GSAP animation principles, presets, and patterns for the drone portfolio
globs: ["**/*.tsx", "**/*.ts"]
---

# Animation Guidelines

## Core Principles

1. **60fps always** — Animate only `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`.
2. **Reduced motion** — Respect `prefers-reduced-motion`: disable parallax, particles, and complex animations. Keep basic fades.
3. **Mobile first** — On mobile: replace heavy 3D scenes with static images/video, reduce particles, simplify shaders.
4. **Always stagger** — Never animate elements simultaneously. Use stagger `0.05–0.15s` between elements.
5. **Cinematic easing** — `power3.out` / `power4.out` for entrances, `power2.inOut` for transitions. Avoid `linear`.
6. **GSAP context** — Always wrap animations in `gsap.context(() => {...}, scopeRef)` and call `ctx.revert()` on cleanup.

## GSAP Presets (`lib/animations.ts`)

```typescript
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

## Common Patterns

### Text reveal from below
```typescript
gsap.from(element, {
  y: '110%', opacity: 0,
  duration: DURATION.slow, ease: EASE.smooth, stagger: 0.03,
});
```

### Image reveal with clip-path
```typescript
// IMPORTANT: do NOT set clipPath as an inline JSX style when GSAP also controls it.
// Let GSAP own the initial state via gsap.set() inside useEffect.
gsap.fromTo(element,
  { clipPath: 'inset(100% 0 0 0)' },
  { clipPath: 'inset(0% 0 0 0)', duration: DURATION.cinematic, ease: EASE.cinematic }
);
```

### Parallax on scroll
```typescript
gsap.to(element, {
  y: () => window.innerHeight * speed * -1,
  ease: 'none',
  scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
});
```

### GPU-accelerated parallax (preferred for performance)
```typescript
const setY = gsap.quickSetter(element, 'y', 'px');
ScrollTrigger.create({
  trigger: section,
  start: 'top top', end: 'bottom top',
  scrub: true,
  onUpdate: (self) => setY(self.progress * 150),
});
```

### Animated counter
```typescript
gsap.to(element, {
  textContent: target,
  duration: DURATION.cinematic, ease: EASE.smooth,
  snap: { textContent: 1 },
  scrollTrigger: { trigger: element, start: 'top 80%', toggleActions: 'play none none none' },
});
```

### Horizontal scroll section (pin)
```typescript
const panels = gsap.utils.toArray('.service-panel');
gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.services-container',
    pin: true, scrub: 1,
    snap: 1 / (panels.length - 1),
    end: () => '+=' + document.querySelector('.services-container').offsetWidth,
  },
});
```

### Cursor with quickTo
```typescript
const xTo = gsap.quickTo(cursorRef.current, 'x', { duration: 0.6, ease: 'power3' });
const yTo = gsap.quickTo(cursorRef.current, 'y', { duration: 0.6, ease: 'power3' });
window.addEventListener('mousemove', (e) => { xTo(e.clientX); yTo(e.clientY); });
```

## Lenis Smooth Scroll

Sync Lenis with GSAP ticker — store the callback reference so it can be removed on cleanup:
```typescript
const rafCallback = (time: number) => lenis.raf(time * 1000);
gsap.ticker.add(rafCallback);
gsap.ticker.lagSmoothing(0);
// cleanup:
gsap.ticker.remove(rafCallback);
```
