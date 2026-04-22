---
description: SEO metadata and Schema.org structured data patterns
globs: ["**/layout.tsx", "**/page.tsx", "src/lib/jsonLd.ts"]
---

# SEO & Metadata

This project's SEO surface is already built. **Don't copy-paste hardcoded metadata into new pages.** The two authoritative files are:

- [src/app/layout.tsx](../../src/app/layout.tsx) — root `Metadata` object + global JSON-LD injection
- [src/lib/jsonLd.ts](../../src/lib/jsonLd.ts) — `LocalBusiness`, `Person`, `OfferCatalog`, `WebSite`, and `FAQPage` builders

Domain: `https://yamamotoaerial.com`. Locale: `es-MX`. Brand: **Pablo Yamamoto Aerial**.

## Adding a new page

Per-route metadata is set in the route's `layout.tsx` (not `page.tsx`), because `page.tsx` files are often Client Components. Pattern:

```typescript
// src/app/<route>/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Pablo Yamamoto',
  description: '…',
  alternates: { canonical: '/about' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
```

Title templating, Open Graph images (`/og-image.jpg`, 1200×630), Twitter card, robots directives, and `metadataBase` are already set in the root layout — each per-route override only needs `title`, `description`, and `alternates.canonical`.

Then add the route to [src/app/sitemap.ts](../../src/app/sitemap.ts). **Every public route must appear there.**

## JSON-LD — use the builders, don't hand-write

[src/app/layout.tsx](../../src/app/layout.tsx) calls `buildGlobalStructuredData()` and emits the returned objects as `<script type="application/ld+json">` tags on every page. That bundle contains `LocalBusiness` (`#business`), `Person` (`#person`), `OfferCatalog` (`#services`, derived from `SERVICE_PACKAGES`), and `WebSite` (`#website`), all cross-referenced by `@id`.

Two rules:

1. **If you change pricing, service tiers, FAQ, or bio, update [src/lib/constants.ts](../../src/lib/constants.ts) — don't touch the JSON-LD.** The `OfferCatalog` rebuilds from `SERVICE_PACKAGES.tiers`; `FAQPage` rebuilds from `FAQ_ITEMS`.
2. **Page-scoped schemas** (e.g. `FAQPage` on `/faq`, future `Article`, `ImageGallery`, `BreadcrumbList`) belong in that route's layout or page, not in the global bundle. `FAQPage` is already set up this way — see `buildFAQPage()` in [src/lib/jsonLd.ts](../../src/lib/jsonLd.ts) and emit it only from [src/app/faq/](../../src/app/faq/).

## URL handling

- Read `SITE_URL` (exported from [src/lib/jsonLd.ts](../../src/lib/jsonLd.ts)) instead of hardcoding the domain. It resolves `NEXT_PUBLIC_SITE_URL` with a `https://yamamotoaerial.com` fallback.
- `hreflang` is set in the root layout: `<link rel="alternate" hrefLang="es-MX" href={SITE_URL} />`. Site is Spanish-only for now — don't add English variants unless the copy actually exists.
- The www → apex 308 redirect is in [next.config.ts](../../next.config.ts). Vercel's domain-level redirect defaults to 307; the in-app rule forces 308 for PageRank consolidation. Keep both in place.

## Pricing schema gotcha

Google requires `priceValidUntil` on every `Offer`. [src/lib/jsonLd.ts](../../src/lib/jsonLd.ts) exports `priceValidUntil()` which returns `${current_year}-12-31`. Don't remove this helper or hardcode a date.

## What the root layout already emits — don't duplicate

```typescript
// Already set in src/app/layout.tsx — do not re-declare per route:
metadataBase, title.default, title.template,
description, keywords,
alternates.languages,
openGraph (type/locale/siteName/images),
twitter (card/images),
robots (index/follow + googleBot directives),
<link rel="alternate" hrefLang="es-MX" />,
buildGlobalStructuredData() injection.
```

Per-route metadata should be **additive** — title/description/canonical only — unless you're intentionally overriding a global.
