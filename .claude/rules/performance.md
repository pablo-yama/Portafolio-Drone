---
description: Performance targets, loading strategies, and mobile fallbacks
alwaysApply: true
---

# Performance

## Targets
- Lighthouse Performance: **> 90**
- LCP: **< 2.5s**
- FID: **< 100ms**
- CLS: **< 0.1**
- JS bundle: **< 350KB gzipped** (excluding lazy-loaded Three.js)

## Rules

- Three.js and R3F must be loaded with `dynamic(() => import(...), { ssr: false })`
- Videos: MP4 H.265 + H.264 fallback, max 8MB for hero loop; `preload="none"` on all non-autoplay videos
- Images: WebP/AVIF via `next/image`, always provide `blur` placeholder using static imports; `priority` on hero, `loading="lazy"` on everything below the fold
- Fonts: `font-display: swap`, preload primary font files
- Do NOT use `content-visibility: auto` — it breaks GSAP ScrollTrigger scroll position calculations
- Only apply `will-change-transform` to elements that are actively animating; remove it from static elements

## Mobile / Low-end Fallback

```typescript
const canRender3D = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const cores = navigator.hardwareConcurrency || 2;
  return gl !== null && cores >= 4;
};

// In 3D components:
{canRender3D() ? <DroneScene /> : <FallbackVideoHero />}
```

## Image Compression (local assets)

Two-pass compression for `src/img/`:
1. `sips -Z 2400` to resize to max 2400px
2. `sharp` with mozjpeg quality 80

Keep originals backed up in `src/img/originals/`.
