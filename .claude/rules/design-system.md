---
description: Color palette, typography, and CSS design tokens for the aerial portfolio
globs: ["**/*.css", "**/*.tsx", "**/*.ts"]
---

# Design System

The design system is **CSS-first**. All tokens live as custom properties at the top of [src/app/globals.css](../../src/app/globals.css) and are surfaced to Tailwind v4 via `@theme inline { ... }` in the same file. There is no `tailwind.config.*`. Edit `globals.css` to change tokens — don't duplicate them in component styles.

> Earlier drafts of this file described a cyan / Clash Display / Satoshi palette. That was superseded by the warm-beige **Archive v2** system below. Treat [src/app/globals.css](../../src/app/globals.css) as authoritative; if it conflicts with this file, the CSS wins.

## Palette — "Archive v2"

Warm beige on near-black, burnt-orange signal accent.

```css
:root {
  --bg:        #0a0a0a;                 /* page background */
  --panel:     #131313;
  --panel-2:   #191917;
  --fg:        #e8e6e1;                 /* primary text */
  --dim:       #807a72;                 /* muted text */
  --dim-2:     #5a5650;                 /* tertiary text */
  --line:      rgba(232, 230, 225, 0.1);
  --line-2:    rgba(232, 230, 225, 0.05);
  --signal:    oklch(0.72 0.18 32);     /* burnt orange — primary accent */
  --signal-rgb: 195, 105, 45;
  --scan:      oklch(0.82 0.04 180);    /* cool cyan — secondary */
  --green:     oklch(0.82 0.18 140);    /* live/status */
}
```

Legacy aliases (`--color-bg`, `--color-text`, `--color-accent`, `--glass-bg`, `--glass-border`) exist in `globals.css` and map onto the new tokens — prefer the new names in new code.

## Typography

Fonts are loaded via `next/font/google` in [src/app/layout.tsx](../../src/app/layout.tsx) and exposed as CSS variables.

- **Serif (headings, emphasis)**: `Fraunces` — weights 300/400/500/600, normal + italic — CSS var `--serif` / `--font-fraunces`
- **Monospace (default body, UI chrome, numerics)**: `JetBrains Mono` — weights 400/500/600 — CSS var `--mono` / `--font-mono`

No `--text-*` clamp scale is defined as tokens. Oversized display type uses ad-hoc `clamp(px, vw, px)` at the component or class level in `globals.css`. Base body is `13px` / `line-height: 1.5` on `<body>`. Default `font-family` is `var(--mono)`; opt into the serif with the `.serif` or `.serif-i` utility classes (defined in `globals.css`).

## Z-index layers

Always use the tokens — don't hardcode z-index values.

```css
--z-cursor:     9999;
--z-preloader:  9000;
--z-scanline:    100;
--z-vignette:     99;
--z-nav:          80;
```

## Chrome effects

Global visual layers live in `globals.css` and are mounted once by the root layout / `<body>`:

- **Scanlines**: `body::after` — thin repeating gradient across the whole page
- **Vignette**: `.vignette` in [src/app/layout.tsx](../../src/app/layout.tsx) — fixed full-viewport radial fade; its center can be driven by the `--vy` custom property on scroll
- **Nav bar** `header.bar` — fixed, 44px tall, three-column grid (brand · links · status)

## Custom Cursor

[src/components/layout/Cursor.tsx](../../src/components/layout/Cursor.tsx) is the reference implementation. It renders two elements — a soft outer circle and a hard dot — driven by `gsap.quickTo`. Disabled on coarse-pointer devices (`(pointer: coarse)`). Hover targets are `a, button, [data-cursor-hover], input, textarea`; the hover label text comes from `data-cursor-text="…"` on the target element.

Spanish labels used in practice: `"Ver proyecto"`, `"Reproducir"`, `"Contactar"`, `"Arrastra"`. Add new ones via `data-cursor-text`, not by extending the cursor component.
