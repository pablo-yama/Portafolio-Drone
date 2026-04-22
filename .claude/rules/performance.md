---
description: Performance targets, loading strategies, and mobile fallbacks
alwaysApply: true
---

# Performance

## Targets

- Lighthouse Performance: **> 90**
- LCP: **< 2.5s**
- INP: **< 200ms** (INP replaced FID in 2024 — the current Core Web Vital)
- CLS: **< 0.1**
- JS bundle: **< 350KB gzipped** (excluding lazy-loaded Three.js)

## Rules

- **Three.js / R3F** must be loaded with `dynamic(() => import(...), { ssr: false })`. Existing scenes in [src/components/three/](../../src/components/three/) are consumed this way by [HeroSection](../../src/components/sections/HeroSection.tsx), [ContactSection](../../src/components/sections/ContactSection.tsx), and [StatsSection](../../src/components/sections/StatsSection.tsx).
- **Images**: use `next/image`. WebP/AVIF are preferred in [next.config.ts](../../next.config.ts) (`formats: ['image/avif', 'image/webp']`). Provide `blur` placeholders via static imports when practical. Mark the LCP hero image with `priority`; everything below the fold gets `loading="lazy"` implicitly.
- **Images — remote**: `remotePatterns` in [next.config.ts](../../next.config.ts) currently whitelists `*.public.blob.vercel-storage.com` only. If a new host is needed, add it there rather than disabling optimization.
- **Videos**: MP4 H.265 + H.264 fallback; max ~8MB for hero loop; `preload="none"` on all non-autoplay videos. Large videos (`public/videos/`) are **gitignored** and served from Vercel Blob in production — see [src/lib/media.ts](../../src/lib/media.ts).
- **Fonts**: loaded via `next/font/google` in [src/app/layout.tsx](../../src/app/layout.tsx) with `display: 'swap'`. Don't import fonts manually from CSS.
- **Do NOT use `content-visibility: auto`** — it breaks GSAP ScrollTrigger's scroll-position calculations.
- **`will-change: transform`** only on elements that are actively animating. Remove it when the tween completes.
- **Image cache TTL** is 30 days (`minimumCacheTTL` in [next.config.ts](../../next.config.ts)); bust by filename, not query string.

## Security headers (already wired)

[next.config.ts](../../next.config.ts) sets `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and a permissive Content-Security-Policy. If a new third-party script host is required, update the CSP there — don't paste inline script hosts into individual pages.

## Mobile / low-end fallback

Pattern to gate heavy WebGL scenes (not yet extracted to a hook — copy inline or promote into [src/hooks/](../../src/hooks/) when you reach for it a second time):

```typescript
const canRender3D = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const cores = navigator.hardwareConcurrency || 2;
  return gl !== null && cores >= 4;
};

// In 3D section components:
{canRender3D() ? <DroneScene /> : <FallbackVideoHero />}
```

Also short-circuit on coarse pointer for interaction-heavy code (the cursor uses this):

```typescript
if (window.matchMedia('(pointer: coarse)').matches) return;
```

## Image compression

Committed assets live under [public/img/](../../public/img/) (flight archive in `public/img/archivo/` follows the `lugar_categoria_ubicacion_año[_numero].jpg` naming). Before committing new photography:

1. `sips -Z 2400 <file>` — cap longest edge at 2400px
2. `sharp` with mozjpeg quality 80 (use the installed `sharp` dev dependency, e.g. via a one-off script)

Keep untouched originals **outside** the repo (e.g. local Dropbox / cloud) — `public/videos/` and large raw folders should never be committed.
