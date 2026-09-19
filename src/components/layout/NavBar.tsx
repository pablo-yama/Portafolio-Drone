'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  m,
  useMotionValueEvent,
  useScroll,
  type Variants,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { HoverLetters, Scramble, SplitReveal, type ScrambleHandle } from '@/components/textfx';
import { DotGrid } from '@/components/backgrounds/DotGrid';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { observeSections, useActiveSection } from '@/lib/activeSection';
import { getLenis } from '@/lib/lenisStore';
import { whenBootDone } from '@/lib/bootSignals';

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * NavBar — Archive v2 bar, premium edition (WP3).
 *
 *   • scroll-aware: hides on scroll-down past 120px, returns on scroll-up,
 *     darkens after 24px — DOM attribute writes from useMotionValueEvent, no state
 *   • 1px signal progress line (scaleX = scrollYProgress) at the bar's bottom edge
 *   • layoutId indicator under the active chapter (activeSection store, home only)
 *   • links: numeral Scrambles + label letters flip on hover; ALT readout Scrambles
 *     whenever the hero telemetry writes into #altBar
 *   • full-screen mobile menu: curtain drop, chars reveal per link, marquee strip,
 *     closing wipe; Esc / focus trap / Lenis stop-start / html[data-menu]
 *
 * Same LINKS and header.bar markup as the legacy Navigation so globals.css keeps
 * styling the bar; new rules live in src/styles/nav.css.
 */

interface NavLink {
  n: string;
  label: string;
  /** Anchor hash (e.g. '#archive') or a full path (e.g. '/contact') */
  href: string;
  /** Home section id the indicator follows (from activeSection) */
  section?: string;
}

const LINKS: NavLink[] = [
  { n: '01', label: 'Archivo', href: '#archive', section: 'archive' },
  { n: '02', label: 'Piloto', href: '#about', section: 'about' },
  { n: '03', label: 'Método', href: '#method', section: 'method' },
  { n: '04', label: 'Tarifas', href: '#rates', section: 'rates' },
  { n: '05', label: 'FAQ', href: '/faq' },
  { n: '06', label: 'Contacto', href: '/contact', section: 'contact' },
];

const SECTION_IDS = LINKS.flatMap((l) => (l.section ? [l.section] : []));

const HIDE_AFTER = 120;
const SCROLLED_AFTER = 24;
const DESKTOP_QUERY = '(min-width: 1101px)';
const ALT_DEFAULT = 'ALT 120M';
/** The telemetry eases ALT every frame; decode pulses are rate-limited so the
    readout reads as periodic "re-locks", not a permanent flicker. */
const ALT_COOLDOWN_MS = 2200;
const ALT_DECODE_S = 0.45;

const TAPE_ITEMS = [
  'CDMX',
  '19.4326° N',
  '99.1332° W',
  'Hora azul',
  'Mavic 3 Pro',
  'Fotografía aérea',
  'Video 5.1K',
  'Piloto certificado',
];

const NAV_IND_SPRING = { type: 'spring', stiffness: 380, damping: 36 } as const;

/* ------------------------------------------------------------------------- */
/* ALT readout: decode into whatever the hero writes into #altBar             */
/* ------------------------------------------------------------------------- */

function useAltScramble(ref: RefObject<HTMLSpanElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let target = el.textContent ?? ALT_DEFAULT;
    let lastInternal = target;
    let pending: string | null = null;
    let lastRun = 0;
    let tween: gsap.core.Tween | null = null;

    const run = (next: string) => {
      target = next;
      lastRun = performance.now();
      tween?.kill();
      el.dataset.scrambling = '1';
      tween = gsap.to(el, {
        duration: ALT_DECODE_S,
        ease: 'none',
        scrambleText: { text: next, chars: '0123456789', speed: 0.7, tweenLength: false },
        onUpdate: () => {
          lastInternal = el.textContent ?? '';
        },
        onComplete: () => {
          tween = null;
          el.dataset.scrambling = '0';
          el.textContent = target;
          lastInternal = target;
          if (pending !== null && pending !== target) {
            const p = pending;
            pending = null;
            run(p);
          } else {
            pending = null;
          }
        },
      });
    };

    const mo = new MutationObserver(() => {
      const now = el.textContent ?? '';
      if (now === target || now === lastInternal) return; // our own writes
      if (tween) {
        pending = now;
        return;
      }
      if (performance.now() - lastRun < ALT_COOLDOWN_MS) {
        // telemetry ticking fast: let the plain write through, decode again later
        target = now;
        lastInternal = now;
        return;
      }
      run(now);
    });
    mo.observe(el, { childList: true, characterData: true, subtree: true });

    return () => {
      mo.disconnect();
      tween?.kill();
      tween = null;
      el.dataset.scrambling = '0';
      el.textContent = target;
    };
  }, [ref, enabled]);
}

/* ------------------------------------------------------------------------- */

/* `custom` = prefers-reduced-motion. Normal: curtain drops from above and wipes
   back up (transform only, the panel stays opaque so .mm-edge trails it).
   Reduced: MotionConfig strips the transforms, so the panel cross-fades instead. */
const mmPanel: Variants = {
  hidden: (reduced: boolean) => ({ y: '-100%', opacity: reduced ? 0 : 1 }),
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      opacity: { duration: 0.35 },
      staggerChildren: 0.06,
      delayChildren: 0.22,
    },
  },
  exit: (reduced: boolean) => ({
    y: '-100%',
    opacity: reduced ? 0 : 1,
    transition: {
      duration: 0.55,
      ease: [0.7, 0, 0.2, 1],
      opacity: { duration: 0.3 },
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  }),
};

const mmItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
};

interface NavAnchorProps {
  link: NavLink;
  isHome: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  'data-active'?: '1' | undefined;
  'aria-current'?: 'page' | undefined;
  'data-cursor-text'?: string;
}

/**
 * Home anchors stay plain <a href="#…"> so Lenis `anchors` scrolls them with the
 * -44px offset (no preventDefault, no scrollIntoView). Off home they become
 * <Link href="/#…"> and template.tsx handles the hash after navigation.
 */
function NavAnchor({ link, isHome, children, ...rest }: NavAnchorProps) {
  if (link.href.startsWith('#')) {
    if (isHome) {
      return (
        <a href={link.href} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={`/${link.href}`} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <Link href={link.href} {...rest}>
      {children}
    </Link>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const prefs = useMotionPrefs();
  const activeSection = useActiveSection();

  const headerRef = useRef<HTMLElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);
  const openRef = useRef(false);
  const reducedRef = useRef(prefs.reduced);
  const numeralHandles = useRef<(ScrambleHandle | null)[]>([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    reducedRef.current = prefs.reduced;
  }, [prefs.reduced]);

  /* Which link carries the indicator */
  const activeHref = useMemo(() => {
    if (isHome) return LINKS.find((l) => l.section === activeSection)?.href ?? null;
    return LINKS.find((l) => l.href === pathname)?.href ?? null;
  }, [isHome, activeSection, pathname]);

  /* Stable imperative refs for the six numerals (boot-in scramble) */
  const [setNumeralHandle] = useState(() =>
    LINKS.map((_, i) => (h: ScrambleHandle | null) => {
      numeralHandles.current[i] = h;
    }),
  );

  /* ---- scroll-aware bar: attribute writes only, no React state ---- */
  const { scrollY, scrollYProgress } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    const el = headerRef.current;
    if (!el) return;
    const dy = y - lastY.current;
    if (!reducedRef.current && !openRef.current) {
      if (y > HIDE_AFTER && dy > 2) el.dataset.hidden = '1';
      else if (dy < -2 || y <= HIDE_AFTER) delete el.dataset.hidden;
    }
    if (y > SCROLLED_AFTER) el.dataset.scrolled = '1';
    else delete el.dataset.scrolled;
    lastY.current = y;
  });

  /* ---- boot-in: drop the bar once the preloader curtain opens, then wake the numerals ---- */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    /* restored scroll positions (bfcache / reload) must not read as a scroll-down */
    lastY.current = window.scrollY;
    let cancelled = false;
    const timers: number[] = [];
    whenBootDone().then(() => {
      if (cancelled) return;
      delete el.dataset.boot;
      if (reducedRef.current) return;
      numeralHandles.current.forEach((h, i) => {
        timers.push(window.setTimeout(() => h?.play(), 420 + i * 70));
      });
    });
    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  /* ---- active chapter (home only) ---- */
  useEffect(() => {
    if (!isHome) return;
    return observeSections(SECTION_IDS);
  }, [isHome]);

  /* ---- ALT readout decode ---- */
  useAltScramble(altRef, !prefs.reduced);

  /* ---- mobile menu: scroll lock, Esc, focus trap, html[data-menu] ---- */
  const close = () => setOpen(false);
  const toggle = () => setOpen((o) => !o);

  useEffect(() => {
    openRef.current = open;
    if (!open) return;

    const html = document.documentElement;
    const header = headerRef.current;
    const burger = burgerRef.current;
    html.dataset.menu = 'open';
    if (header) delete header.dataset.hidden;
    getLenis()?.stop();

    const focusables = (): HTMLElement[] => {
      const panel = panelRef.current;
      const inPanel = panel
        ? Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        : [];
      return burger ? [burger, ...inPanel] : inPanel;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current ? nodes.includes(current) : false;
      if (e.shiftKey && (!inside || current === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || current === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    const mq = window.matchMedia(DESKTOP_QUERY);
    const onMq = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    const onPop = () => setOpen(false);

    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    window.addEventListener('popstate', onPop);

    const raf = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
      window.removeEventListener('popstate', onPop);
      delete html.dataset.menu;
      getLenis()?.start();
      burger?.focus({ preventScroll: true });
    };
  }, [open]);

  /* Menu link click: Lenis must be running BEFORE its own window click
     listener handles the anchor (React's root listener fires first). */
  const onMenuLink = () => {
    getLenis()?.start();
    setOpen(false);
  };

  const tapeCopy = (hidden: boolean) => (
    <span className="mm-tape-copy" aria-hidden={hidden || undefined}>
      {TAPE_ITEMS.map((t, i) => (
        <span key={t}>
          {i > 0 && <em> · </em>}
          {t}
        </span>
      ))}
      <em> · </em>
    </span>
  );

  return (
    <LayoutGroup id="nav">
      <header className="bar" ref={headerRef} data-boot="1">
        <Link href="/" className="brand" aria-label="Ir al inicio" data-cursor-text="Inicio">
          <span className="sig" />
          <HoverLetters text="YAMAMOTO · AERIAL" />
          <span className="brand-mx">/ MX</span>
        </Link>

        <div className="mid" role="navigation" aria-label="Secciones">
          {LINKS.map((l, i) => {
            const active = activeHref === l.href;
            return (
              <NavAnchor
                key={l.href}
                link={l}
                isHome={isHome}
                className="link-ul"
                data-active={active ? '1' : undefined}
                aria-current={!isHome && pathname === l.href ? 'page' : undefined}
              >
                <Scramble
                  as="span"
                  className="n"
                  text={l.n}
                  chars="0123456789"
                  duration={0.45}
                  speed={0.6}
                  enter={false}
                  hover="parent"
                  flash={false}
                  ref={setNumeralHandle[i]}
                />
                <HoverLetters text={l.label} />
                {active && (
                  <m.span layoutId="nav-ind" className="nav-ind" transition={NAV_IND_SPRING} />
                )}
              </NavAnchor>
            );
          })}
        </div>

        <div className="right">
          {/* the hero telemetry writes this span's textContent; useAltScramble decodes each change */}
          <span className="alt tnum" id="altBar" ref={altRef}>
            {ALT_DEFAULT}
          </span>
          <span className="live">
            <span className="live-txt">Disponible</span>
          </span>
          <button
            ref={burgerRef}
            type="button"
            className={`nav-burger${open ? ' open' : ''}`}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mm-panel"
            onClick={toggle}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <m.div className="bar-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      </header>

      <AnimatePresence custom={prefs.reduced}>
        {open && (
          <m.nav
            key="mm"
            id="mm-panel"
            ref={panelRef}
            className="mm-panel"
            aria-label="Menú"
            data-lenis-prevent=""
            custom={prefs.reduced}
            variants={mmPanel}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <DotGrid center={['82%', '22%']} radius={360} size={24} opacity={0.55} />

            <m.div className="mm-head" variants={mmItem}>
              <span>Menú · Navegación</span>
              <Scramble
                as="span"
                className="mm-coords"
                text="19.4326° N · 99.1332° W"
                trigger="mount"
                delay={0.25}
                duration={1}
                flash={false}
              />
            </m.div>

            <ul className="mm-list">
              {LINKS.map((l, i) => {
                const active = activeHref === l.href || (!isHome && pathname === l.href);
                return (
                  <m.li key={l.href} className="mm-item" variants={mmItem}>
                    <NavAnchor
                      link={l}
                      isHome={isHome}
                      className="mm-link"
                      onClick={onMenuLink}
                      data-active={active ? '1' : undefined}
                      aria-current={!isHome && pathname === l.href ? 'page' : undefined}
                    >
                      <span className="n">{l.n}</span>
                      <SplitReveal
                        as="span"
                        mode="chars"
                        trigger="mount"
                        delay={0.28 + i * 0.05}
                        duration={0.8}
                        stagger={0.028}
                        mobileChars
                        className="mm-label"
                      >
                        {l.label}
                      </SplitReveal>
                      <span className="mm-arrow" aria-hidden="true">
                        →
                      </span>
                    </NavAnchor>
                  </m.li>
                );
              })}
            </ul>

            <m.div className="mm-cta-wrap" variants={mmItem}>
              <Link className="mm-cta" href="/contact" onClick={close} data-cursor-text="Cotizar">
                Cotiza tu vuelo <span aria-hidden="true">→</span>
              </Link>
            </m.div>

            <m.div className="mm-meta" variants={mmItem}>
              <span className="mm-live">Disponible</span>
              <span>CDMX · MX</span>
              <span>Reserva abierta</span>
            </m.div>

            <m.div className="mm-tape" variants={mmItem}>
              <div className="mm-tape-track">
                {tapeCopy(false)}
                {tapeCopy(true)}
              </div>
            </m.div>

            <span className="mm-edge" aria-hidden="true" />
          </m.nav>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
