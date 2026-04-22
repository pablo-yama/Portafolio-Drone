# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal aerial-drone portfolio for Pablo Yamamoto (CDMX). Copy and metadata are Spanish (`es-MX`). The site ships as a single long scroll with a handful of supporting pages (`/about`, `/services`, `/work`, `/archivo`, `/faq`, `/contact`, `/showreel`). Domain is `yamamotoaerial.com`; www → apex 308 redirect is enforced in `next.config.ts`.

## Commands

```bash
npm run dev      # Next dev server (localhost:3000)
npm run build    # Production build
npm start        # Serve the production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

No test runner is configured. There is no typecheck script — use `npx tsc --noEmit` if you need one. No formatter is wired up (no Prettier config).

## Stack caveats

- **Next.js 16 + React 19.2**. This is NOT the Next.js in your training data. [AGENTS.md](AGENTS.md) is explicit: read `node_modules/next/dist/docs/` before writing routing/metadata/server-component code, and heed deprecation notices. The same applies to React 19 APIs.
- **Tailwind v4** via `@tailwindcss/postcss`. Theme tokens live inside `@theme inline { ... }` in [src/app/globals.css](src/app/globals.css) — no `tailwind.config` file.
- **App Router only**. No `pages/` directory. Route groups are plain folders under [src/app/](src/app/).
- **Path alias**: `@/*` → `./src/*` (see [tsconfig.json](tsconfig.json)).

## Architecture

### Homepage is a scroll narrative composed of section components

[src/app/page.tsx](src/app/page.tsx) is the whole homepage. It mounts, in order: `HeroSection → ArchiveSection → AboutSection → LedgerSection → MethodSection → PricingSection → ContactSection`, wrapped by `Navigation` + `Footer`. Adding a section = add a component to [src/components/sections/](src/components/sections/) and drop it into this page. Other section files in that directory (`ShowreelSection`, `StatsSection`, `FAQSection`, `WorkGrid`, etc.) are used by the dedicated sub-pages, not by the homepage.

Internal pages follow the same composition pattern: each `src/app/<route>/page.tsx` imports one or more section components plus `Navigation` + `Footer`. Per-route `layout.tsx` files exist primarily to set route-specific metadata.

### Single source of truth: `src/lib/constants.ts`

`SERVICES`, `SERVICE_PACKAGES` (tiered pricing), `PROJECTS`, `FAQ_ITEMS`, `STATS`, `NAV_LINKS`, `SOCIAL_LINKS`, and the `ABOUT` bio all live in [src/lib/constants.ts](src/lib/constants.ts). Section components, the JSON-LD builders, and the contact form all read from here — update the constant, everything downstream updates. The archive (flight log for `/archivo`) is separate and lives in [src/lib/archive.ts](src/lib/archive.ts); filenames under `public/img/archivo/` follow `lugar_categoria_ubicacion_año[_numero].jpg`.

### SEO / JSON-LD is centralized and fed from constants

[src/lib/jsonLd.ts](src/lib/jsonLd.ts) builds `LocalBusiness`, `Person`, `OfferCatalog` (derived from `SERVICE_PACKAGES`), and `WebSite` schemas. `buildGlobalStructuredData()` is injected in the root [src/app/layout.tsx](src/app/layout.tsx) and emitted on every page. `FAQPage` is deliberately emitted only on `/faq`. When adding a service tier or changing prices, don't hand-edit JSON-LD — update `SERVICE_PACKAGES` and the OfferCatalog rebuilds. `SITE_URL` is read from `NEXT_PUBLIC_SITE_URL` with a production fallback.

Sitemap ([src/app/sitemap.ts](src/app/sitemap.ts)) and [public/robots.txt](public/robots.txt) / [public/llms.txt](public/llms.txt) are hand-maintained — add new routes to the sitemap when you add them under `src/app/`.

### Media resolution

[src/lib/media.ts](src/lib/media.ts) exposes `getMediaUrl(path)` and a `media` object. If `NEXT_PUBLIC_BLOB_URL` is set, assets resolve to Vercel Blob storage; otherwise to `/public`. Prefer `media.images.*` / `media.videos.*` over hardcoded paths so blob/local switching keeps working. Heavy videos (`public/videos/`) are gitignored — they live on Blob in production.

### Contact form → Gmail SMTP

[src/app/api/contact/route.ts](src/app/api/contact/route.ts) is `force-dynamic`, uses Nodemailer over Gmail SMTP (`GMAIL_USER` + `GMAIL_APP_PASSWORD`), and HTML-escapes every user input before composing the email body. No database, no queue — if SMTP fails, the user sees a 500. Don't introduce a rate limiter or persistence layer unless asked.

### Animation + scroll

GSAP is the animation engine; Lenis is the smooth-scroll layer; `framer-motion`, `lottie-react`, and `@react-three/*` are also installed. Animation helpers and the cinematic easing/duration constants live in [src/lib/animations.ts](src/lib/animations.ts) and the `EASE` / `DURATION` exports at the top of [src/lib/constants.ts](src/lib/constants.ts). Three.js scenes in [src/components/three/](src/components/three/) must be dynamically imported with `{ ssr: false }`.

### Design system lives in CSS, not Tailwind config

All color tokens, z-index layers, and font variables are defined as CSS custom properties at the top of [src/app/globals.css](src/app/globals.css), then surfaced to Tailwind via `@theme inline`. The palette in use is warm beige (`--fg: #e8e6e1`) on near-black (`--bg: #0a0a0a`) with a burnt-orange signal accent (`--signal`). Fonts are Fraunces (serif, headings) + JetBrains Mono (default body) loaded via `next/font/google` in the root layout. **Note**: [.claude/rules/design-system.md](.claude/rules/design-system.md) documents an earlier palette (cyan accent, Clash Display/Satoshi); the actual implementation is the warm-beige "Archive v2" system in `globals.css`. Treat `globals.css` as authoritative.

## Project-specific conventions

Coding rules are loaded automatically from [.claude/rules/](.claude/rules/). Read them before making non-trivial changes — they cover:

- [code-conventions.md](.claude/rules/code-conventions.md) — PascalCase components, `interface` (not `type`) for props, arrow-function components, conventional commit prefixes
- [animation-guidelines.md](.claude/rules/animation-guidelines.md) — GSAP context wrapping, `transform`/`opacity` only, reduced-motion fallbacks, the Lenis-ticker cleanup pattern
- [performance.md](.claude/rules/performance.md) — Lighthouse > 90, lazy-load Three.js, WebP/AVIF via `next/image`, do NOT use `content-visibility: auto` (breaks ScrollTrigger)
- [seo-metadata.md](.claude/rules/seo-metadata.md) — Metadata and Schema.org patterns (partially superseded by `src/lib/jsonLd.ts`)
- [design-system.md](.claude/rules/design-system.md) — See note above; `globals.css` is the current truth
- [.claude/CLAUDE.md](.claude/CLAUDE.md) — Aspirational section list and reference designs; the homepage has evolved, so cross-check against `src/app/page.tsx`

## Environment variables

Required / read at runtime:

- `GMAIL_USER`, `GMAIL_APP_PASSWORD` — contact form SMTP (server-only)
- `NEXT_PUBLIC_SITE_URL` — used by sitemap and JSON-LD (defaults to `https://yamamotoaerial.com`)
- `NEXT_PUBLIC_BLOB_URL` — Vercel Blob base URL for media; if unset, media falls back to `/public`

`.env.local` is gitignored and already present locally — don't overwrite it without checking first.
