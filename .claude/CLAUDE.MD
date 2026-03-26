# CLAUDE.md — Drone Aerial Portfolio

**What**: Immersive portfolio site for Pablo's aerial drone photography/videography services.
**Goal**: Cinematic browser experience that sells the work before the visitor sees a single photo. It should feel like flying.
**Audience**: Real estate agencies, production companies, construction firms, ad agencies, event organizers, architects.

Coding rules live in `.claude/rules/` and are loaded automatically:
- `nextjs-version` — Read Next.js docs before writing any code (breaking API changes)
- `code-conventions` — Naming, component patterns, git
- `design-system` — Color tokens, typography scale, custom cursor
- `animation-guidelines` — GSAP principles, presets, known pitfalls
- `performance` — Targets, loading strategy, mobile fallbacks
- `seo-metadata` — Metadata and Schema.org patterns

---

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript strict
- **Styles**: Tailwind CSS v4
- **Animation**: GSAP v3 (ScrollTrigger, Flip, SplitText, DrawSVG) + Lenis smooth scroll
- **3D**: Three.js + React Three Fiber + @react-three/drei + postprocessing
- **Media**: next/image (WebP/AVIF), Mux or Cloudinary for video streaming
- **CMS**: Sanity.io or Prismic
- **Email**: Resend
- **Analytics**: Vercel Analytics + Speed Insights
- **Deployment**: Vercel

---

## Homepage Sections (Scroll Narrative)

Each section is ≥ 100vh and reveals cinematically.

1. **Preloader** — Black bg, logo with DrawSVG, asset progress bar, noise-dissolve exit
2. **Hero** — Looping aerial video (or R3F drone scene), SplitText heading, parallax at 0.5×
3. **Showreel** — Iris/circle reveal; video expands to fullscreen via GSAP Flip on play
4. **Projects Grid** — Asymmetric editorial grid, per-image parallax, GSAP Flip transition to case study
5. **Services** — Horizontal scroll (pin + scrub), 6 panels × 100vw, progress bar
6. **Stats** — Count-up counters: 2000+ flight hours, 10+ clients, 10 yrs, 20+ projects
7. **Testimonials** — Drag/swipe carousel with morphing text transitions
8. **Work Process** — Animated SVG timeline: Briefing → Flight plan → Capture → Post → Delivery
9. **CTA** — Large text + parallax; links to /contact
10. **Footer** — Infinite marquee, GPS coordinates in monospace, footer reveals under content

---

## Internal Pages

| Route | Description |
|-------|-------------|
| `/work` | Filterable grid with GSAP Flip reorganization |
| `/work/[slug]` | Case study: hero, gallery lightbox, technical specs, client testimonial |
| `/services` | Expanded service detail, pricing, FAQ, per-service CTA |
| `/about` | Personal story, drone equipment, certifications, client logos |
| `/contact` | Form + map + Cal.com embed |

---

## Design References

- [Lusion](https://lusion.co) — immersive 3D / WebGL
- [Petra Leary](https://petraleary.com) — minimal drone portfolio
- [Codrops](https://tympanus.net/codrops) — creative web effect tutorials
- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
