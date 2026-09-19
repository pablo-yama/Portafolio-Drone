'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import gsap from 'gsap';
import {
  AnimatePresence,
  LayoutGroup,
  m,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useSectionProgress, type ScrollOffset } from '@/hooks/useSectionProgress';
import { TIER_GROUPS, tierHref, type Tier, type TierGroup } from '@/lib/rates';
import { BeamBorder } from '@/components/ui/BeamBorder';
import { Magnetic } from '@/components/motion/Magnetic';
import { HoverLetters, Scramble, SplitReveal } from '@/components/textfx';

const EASE_EDITORIAL = [0.2, 0.8, 0.2, 1] as const;
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
const PILL_SPRING = { type: 'spring', stiffness: 400, damping: 34 } as const;

/* Sticky-stack (<1024px): the previous card scales to .94 and dims to .6
   while the NEXT card travels from 88% of the viewport to the sticky line. */
const STACK_TOP = 72;
const STACK_OFFSET: ScrollOffset = ['start 88%', `start ${STACK_TOP}px`];

const liVariants: Variants = {
  hide: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE_EXPO } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

interface TierCardProps {
  tier: Tier;
  groupSlug: string;
  slotRef: RefObject<HTMLDivElement | null>;
  nextRef: RefObject<HTMLDivElement | null> | null;
  slotVariants: Variants;
  /** sticky-stack transforms on (<1024px, not reduced) */
  stackOn: boolean;
  /** 3D tilt + spotlight on (desktop, fine pointer, not reduced) */
  tilt: boolean;
  beamActive: boolean;
}

function TierCard({
  tier,
  groupSlug,
  slotRef,
  nextRef,
  slotVariants,
  stackOn,
  tilt,
  beamActive,
}: TierCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasNext = nextRef !== null;

  /* progress of the NEXT card's approach (its own layout stays stable until it sticks) */
  const { scrollYProgress } = useScroll({ target: nextRef ?? slotRef, offset: STACK_OFFSET });
  const stackAmp = useMotionValue(0);
  useEffect(() => {
    stackAmp.set(stackOn && hasNext ? 1 : 0);
  }, [stackOn, hasNext, stackAmp]);
  const stackScale = useTransform([scrollYProgress, stackAmp], ([v, a]: number[]) => 1 - v * 0.06 * a);
  const stackOpacity = useTransform([scrollYProgress, stackAmp], ([v, a]: number[]) => 1 - v * 0.4 * a);

  /* 3D tilt (quickTo rotateX/Y ±5°, lift) + spotlight --mx/--my — GSAP, fine pointer only */
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !tilt) return;
    const ctx = gsap.context(() => {
      gsap.set(el, { transformPerspective: 1100, transformOrigin: '50% 50%' });
      const rx = gsap.quickTo(el, 'rotateX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(el, 'rotateY', { duration: 0.6, ease: 'power3.out' });
      const ty = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      let raf = 0;
      let lx = 0;
      let ly = 0;
      let settle: gsap.core.Tween | null = null;
      const paint = () => {
        raf = 0;
        el.style.setProperty('--mx', `${lx}px`);
        el.style.setProperty('--my', `${ly}px`);
      };
      const onEnter = () => {
        settle?.kill();
        el.dataset.tilt = '1';
        ty(tier.featured ? -8 : -4);
      };
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        lx = e.clientX - r.left;
        ly = e.clientY - r.top;
        ry((lx / r.width - 0.5) * 10);
        rx((0.5 - ly / r.height) * 10);
        if (!raf) raf = requestAnimationFrame(paint);
      };
      const onLeave = () => {
        rx(0);
        ry(0);
        ty(0);
        settle = gsap.delayedCall(0.7, () => {
          delete el.dataset.tilt;
        });
      };
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        if (raf) cancelAnimationFrame(raf);
        delete el.dataset.tilt;
      };
    }, el);
    return () => ctx.revert();
  }, [tilt, tier.featured]);

  return (
    <m.div className="tier-slot" ref={slotRef} variants={slotVariants}>
      <m.div className="tier-stack" style={{ scale: stackScale, opacity: stackOpacity }}>
        <div className={`tier${tier.featured ? ' fea' : ''}`} ref={cardRef}>
          <span className="tier-glow" aria-hidden="true" />
          <div className="tier-lbl">
            <span>
              <Scramble text={tier.idx} />
            </span>
            {tier.featured && <span className="pill">Más solicitado</span>}
          </div>
          <SplitReveal as="h3" mode="chars" stagger={0.03} start="top 92%" mobileChars>
            {tier.name}
          </SplitReveal>
          <p className="desc">{tier.desc}</p>
          <div className="price">
            <span className="from">Desde</span>
            <span className="amt tnum">{tier.amt}</span>
            <span className="cur">{tier.cur}</span>
          </div>
          <ul>
            {tier.feat.map((f) => (
              <m.li key={f} variants={liVariants}>
                {f}
              </m.li>
            ))}
          </ul>
          <Magnetic strength={0.3} className="tier-act-wrap">
            <Link
              href={tierHref(groupSlug, tier.tierSlug)}
              className="act"
              data-cursor-text="Cotizar"
              aria-label={`Cotizar ${tier.name.replace(/\.$/, '')} — ${tier.amt} ${tier.cur}`}
            >
              <HoverLetters text="Cotizar →" />
            </Link>
          </Magnetic>
          {tier.featured && <BeamBorder active={beamActive} />}
        </div>
      </m.div>
    </m.div>
  );
}

interface TierGridProps {
  group: TierGroup;
  gridVariants: Variants;
  slotVariants: Variants;
  stackOn: boolean;
  tilt: boolean;
  beamActive: boolean;
}

/** One grid per tariff group — re-keyed by AnimatePresence so the refs are fresh per swap. */
function TierGrid({ group, gridVariants, slotVariants, stackOn, tilt, beamActive }: TierGridProps) {
  /* Every group ships exactly three tiers (see src/lib/rates.ts). */
  const r0 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const refs = [r0, r1, r2];

  return (
    <m.div
      className="tier-grid"
      role="tabpanel"
      id={`rates-panel-${group.slug}`}
      aria-labelledby={`rates-tab-${group.slug}`}
      variants={gridVariants}
      initial="hide"
      animate="show"
      exit="exit"
    >
      {group.tiers.map((t, i) => (
        <TierCard
          key={t.tierSlug}
          tier={t}
          groupSlug={group.slug}
          slotRef={refs[i] ?? r2}
          nextRef={refs[i + 1] ?? null}
          slotVariants={slotVariants}
          stackOn={stackOn}
          tilt={tilt}
          beamActive={beamActive}
        />
      ))}
    </m.div>
  );
}

/**
 * RatesSection — § 04 Tarifas (replaces PricingSection; markup, classes and
 * copy identical, data from src/lib/rates.ts).
 *
 * Desktop: LayoutGroup pill tabs (roving tabindex, ←/→/Home/End),
 * AnimatePresence card swap with stagger inside a min-height grid (no CLS),
 * GSAP 3D tilt ±5° + spotlight per card, BeamBorder on the featured card,
 * magnetic CTAs with hover-letters, SplitReveal chars on each h3, a scrubbed
 * hairline and a parallax "04" watermark. Mobile <1024: sticky-stack — each
 * card sticks at 72px and the previous one scales to .94 / dims to .6 as the
 * next arrives. Comparison table kept verbatim (SEO text). Reduced motion:
 * pill snaps, 0.15s crossfade without stagger, no tilt / beam / magnetism.
 */
export function RatesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const group = TIER_GROUPS[active];

  const { reduced, finePointer, desktop, resolved } = useMotionPrefs();
  const inView = useInView(sectionRef, { amount: 0.15 });

  const tilt = resolved && desktop && finePointer && !reduced;
  const stackOn = resolved && !desktop && !reduced;
  const beamActive = inView && finePointer && !reduced;

  /* section progress → scrubbed hairline + watermark parallax */
  const p = useSectionProgress(sectionRef);
  const amp = useMotionValue(1);
  useEffect(() => {
    amp.set(reduced ? 0 : 1);
  }, [reduced, amp]);
  const ruleScale = useTransform([p, amp], ([v, a]: number[]) => {
    if (a === 0) return 1;
    const t = (v - 0.04) / 0.3;
    return t < 0 ? 0 : t > 1 ? 1 : t;
  });
  const wmY = useTransform([p, amp], ([v, a]: number[]) => (0.5 - v) * 220 * a);
  const wmOpacity = useTransform([p, amp], ([v, a]: number[]) => {
    if (a === 0) return 0.08;
    return v < 0.2 ? (v / 0.2) * 0.12 : v > 0.8 ? ((1 - v) / 0.2) * 0.12 : 0.12;
  });

  const { gridVariants, slotVariants } = useMemo(() => {
    if (reduced) {
      return {
        gridVariants: { hide: {}, show: {}, exit: {} } as Variants,
        slotVariants: {
          hide: { opacity: 0 },
          show: { opacity: 1, transition: { duration: 0.15 } },
          exit: { opacity: 0, transition: { duration: 0.15 } },
        } as Variants,
      };
    }
    return {
      gridVariants: {
        hide: {},
        show: { transition: { staggerChildren: 0.08 } },
        exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
      } as Variants,
      slotVariants: {
        hide: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.45,
            ease: EASE_EDITORIAL,
            delayChildren: 0.12,
            staggerChildren: 0.05,
          },
        },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
      } as Variants,
    };
  }, [reduced]);

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = TIER_GROUPS.length;
    let next = active;
    switch (e.key) {
      case 'ArrowRight':
        next = (active + 1) % n;
        break;
      case 'ArrowLeft':
        next = (active - 1 + n) % n;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="rates" className="pricing rates-v" data-chapter="rates" ref={sectionRef}>
      <m.span className="rates-wm serif-i" aria-hidden="true" style={{ y: wmY, opacity: wmOpacity }}>
        04
      </m.span>

      <div className="sect-top">
        <div className="rates-head">
          <div className="rates-kicker folio">
            <Scramble text="§ 04 / Tarifas" />
          </div>
          <SplitReveal as="h2" mode="words" stagger={0.06}>
            Paquetes, <span className="b">diseñados</span> por proyecto.
          </SplitReveal>
        </div>

        <LayoutGroup id="rates">
          <div
            className="tabs rates-tabs"
            role="tablist"
            aria-label="Categoría de servicio"
            onKeyDown={onTabKeyDown}
          >
            {TIER_GROUPS.map((g, i) => {
              const on = i === active;
              return (
                <button
                  key={g.slug}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`rates-tab-${g.slug}`}
                  aria-selected={on}
                  aria-controls={`rates-panel-${g.slug}`}
                  tabIndex={on ? 0 : -1}
                  className={on ? 'on' : ''}
                  onClick={() => setActive(i)}
                >
                  {on && (
                    <m.span className="rates-pill" layoutId="rates-pill" transition={PILL_SPRING} />
                  )}
                  <span className="rates-tab-lbl">
                    <HoverLetters text={g.label} />
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <m.span className="rates-rule" aria-hidden="true" style={{ scaleX: ruleScale }} />

      <AnimatePresence mode="wait" initial={false}>
        <TierGrid
          key={group.slug}
          group={group}
          gridVariants={gridVariants}
          slotVariants={slotVariants}
          stackOn={stackOn}
          tilt={tilt}
          beamActive={beamActive}
        />
      </AnimatePresence>

      <div className="tier-table-wrap" data-lenis-prevent>
        <table className="tier-table">
          <caption>Comparativa de paquetes — {group.label}</caption>
          <thead>
            <tr>
              <th scope="col">Paquete</th>
              <th scope="col">Desde</th>
              <th scope="col">Alcance</th>
            </tr>
          </thead>
          <tbody>
            {group.tiers.map((t) => (
              <tr key={t.name}>
                <th scope="row">{t.name}</th>
                <td className="amt tnum">
                  {t.amt} {t.cur}
                </td>
                <td>{t.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rates-foot">
        <span>¿Necesitas algo diferente? Cada proyecto es único.</span>
        <Link href="/contact" className="link-ul rates-foot-link">
          Cotización personalizada →
        </Link>
      </div>
    </section>
  );
}

export default RatesSection;
