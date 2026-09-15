'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { m, useMotionValue, useTransform, type Variants } from 'framer-motion';
import { getMotionPrefs, useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useSectionProgress } from '@/hooks/useSectionProgress';
import { DotGrid } from '@/components/backgrounds/DotGrid';
import { Magnetic } from '@/components/motion/Magnetic';
import { HoverLetters, Scramble, SplitReveal } from '@/components/textfx';

const UplinkScene = dynamic(() => import('@/components/three/UplinkScene'), {
  ssr: false,
  loading: () => null,
});

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/** WebGL + enough cores; called inside the IO callback (never during render). */
const canRender3D = (): boolean => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const cores = navigator.hardwareConcurrency || 2;
    return gl !== null && cores >= 4;
  } catch {
    return false;
  }
};

/* Copy verbatim from the previous ContactSection contact card. */
const ROWS = [
  { k: 'Operador', v: 'Pablo Yamamoto' },
  { k: 'Email', v: 'pabloyamamoto19@gmail.com', href: 'mailto:pabloyamamoto19@gmail.com', mono: true },
  { k: 'Teléfono', v: '+52 55 8569 9724', href: 'tel:+525585699724', mono: true },
  { k: 'Base', v: 'Polanco · CDMX' },
  { k: 'Coords', v: '19.4326°N · 99.1332°W', mono: true },
  { k: 'Horario', v: 'LUN–VIE · 08–19H', mono: true },
  { k: 'Respuesta', v: '< 24 h' },
] as const;

const cardVariants: Variants = {
  hide: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

const rowVariants: Variants = {
  hide: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EXPO } },
};

const hairVariants: Variants = {
  hide: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1, ease: EASE_EXPO } },
};

/**
 * UplinkSection — § 05 Uplink (replaces ContactSection; markup, classes and
 * copy identical). Adds: a cursor-following DotGrid, a radial signal glow
 * scrubbed by section progress, the UplinkScene icosahedron (lazy, fine
 * pointer + WebGL only, rotation scrubbed by the same progress), SplitReveal
 * words on the H2 and lines on the lead, magnetic CTAs with hover-letters,
 * and contact-card rows that stagger in while their hairlines draw.
 * Reduced motion: glow static, no scene, rows fade, dot-grid static.
 */
export function UplinkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const [sceneMounted, setSceneMounted] = useState(false);

  /* 0 → 1 while the section crosses the viewport (raw, Lenis-smoothed) */
  const p = useSectionProgress(sectionRef);

  /* 1 = full motion, 0 = static (reduced motion). Motion value, not state. */
  const amp = useMotionValue(1);
  useEffect(() => {
    amp.set(reduced ? 0 : 1);
  }, [reduced, amp]);

  const glowScale = useTransform([p, amp], ([v, a]: number[]) => {
    if (a === 0) return 1;
    return v < 0.5 ? 0.55 + (v / 0.5) * 0.55 : 1.1 + ((v - 0.5) / 0.5) * 0.25;
  });
  const glowOpacity = useTransform([p, amp], ([v, a]: number[]) => {
    if (a === 0) return 0.35;
    if (v < 0.35) return (v / 0.35) * 0.6;
    if (v < 0.65) return 0.6 - ((v - 0.35) / 0.3) * 0.15;
    return 0.45 - ((v - 0.65) / 0.35) * 0.35;
  });
  const cardY = useTransform([p, amp], ([v, a]: number[]) => (0.5 - v) * 90 * a);
  const copyY = useTransform([p, amp], ([v, a]: number[]) => (0.5 - v) * 36 * a);

  /* Mount the three.js chunk only when the section is within one viewport,
     and only for fine pointers with WebGL (state set inside the IO callback). */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        const prefs = getMotionPrefs();
        if (prefs.finePointer && !prefs.reduced && !prefs.saveData && canRender3D()) {
          setSceneMounted(true);
        }
        io.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="contact" className="contact uplink-v" data-chapter="uplink" ref={sectionRef}>
      <DotGrid follow radius={380} opacity={0.9} center={['78%', '48%']} />
      <m.div className="uplink-glow" aria-hidden="true" style={{ scale: glowScale, opacity: glowOpacity }} />
      {sceneMounted && !reduced && <UplinkScene progress={p} />}

      <div className="section-head uplink-head">
        <div className="idx">
          <Scramble text="§ 05 / Contacto" />
        </div>
        <div />
      </div>

      <div className="contact-grid">
        <m.div className="uplink-copy" style={{ y: copyY }}>
          <SplitReveal as="h2" mode="words" stagger={0.05}>
            ¿Un <span className="b">proyecto</span> que necesita
            <br />
            <span className="u">verse</span> desde el cielo?
          </SplitReveal>
          <SplitReveal as="p" className="contact-lead" mode="lines" delay={0.2}>
            Escríbeme con una descripción breve: ubicación, objetivo, fechas tentativas y uso
            final. Respondo en menos de 24 horas con una propuesta concreta y cotización formal
            en 48.
          </SplitReveal>
          <div className="uplink-ctas">
            <Magnetic strength={0.3}>
              <Link href="/contact" className="btn btn-fill" data-cursor-text="Contactar">
                <HoverLetters text="Hablemos de tu proyecto" />
                <span className="arr">→</span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href="https://instagram.com/the_pym_project"
                className="btn btn-out"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-text="Contactar"
              >
                <HoverLetters text="@the_pym_project" />
                <span className="arr">↗</span>
              </a>
            </Magnetic>
          </div>
        </m.div>

        <m.aside
          className="contact-card uplink-card"
          style={{ y: cardY }}
          variants={cardVariants}
          initial="hide"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <h3>
            <Scramble text="Canal directo" />
          </h3>
          {ROWS.map((row) => {
            const mono = 'mono' in row && row.mono;
            const href = 'href' in row ? row.href : undefined;
            const value = mono ? <Scramble text={row.v} /> : row.v;
            return (
              <m.div className="line" key={row.k} variants={rowVariants}>
                <span className="k">{row.k}</span>
                {href ? (
                  <a href={href} className={mono ? 'v mono' : 'v'}>
                    {value}
                  </a>
                ) : (
                  <span className={mono ? 'v mono' : 'v'}>{value}</span>
                )}
                <m.span className="uplink-hair" aria-hidden="true" variants={hairVariants} />
              </m.div>
            );
          })}
        </m.aside>
      </div>
    </section>
  );
}

export default UplinkSection;
