'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { HudVideo } from '@/components/media/HudVideo';
import { Magnetic } from '@/components/motion/Magnetic';
import { SplitReveal } from '@/components/textfx';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

export function CinematicHero() {
  const root = useRef<HTMLElement>(null);
  const { reduced, desktop } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const titleY = useTransform(scrollYProgress, [0, 0.8], [0, -100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const move = desktop && !reduced;

  return (
    <section ref={root} id="hero" className="cinema-hero" aria-labelledby="hero-title">
      <m.div className="cinema-media" style={move ? { y: imageY, scale: imageScale } : undefined}>
        <HudVideo clip="reforma" poster="/videos/hero/reforma-poster.jpg" priority pauseControl playAmount={0.05} objectPosition="50% 50%" />
      </m.div>
      <div className="cinema-shade" aria-hidden="true" />
      <div className="cinema-topline">
        <span>Fotografía & video aéreo</span>
        <span>Ciudad de México · Est. 2016</span>
      </div>
      <m.div className="cinema-title" style={move ? { y: titleY, opacity: titleOpacity } : undefined}>
        <div className="cinema-eyebrow"><span /> Una perspectiva de Pablo Yamamoto</div>
        <h1 id="hero-title">
          <SplitReveal as="span" className="cinema-line" mode="words" trigger="mount" delay={0.12}>Otra forma</SplitReveal>
          <SplitReveal as="span" className="cinema-line cinema-line--serif" mode="words" trigger="mount" delay={0.25}>de ver.</SplitReveal>
        </h1>
      </m.div>
      <div className="cinema-bottom">
        <a className="cinema-scroll" href="#archive"><span aria-hidden="true">↓</span><span>Explora el archivo<br /><small>Una mirada desde arriba</small></span></a>
        <div className="cinema-description">
          <p>El ángulo cambia.<br />La historia comienza.</p>
          <span>Imágenes cinematográficas de lugares,<br className="desktop-break" /> espacios y momentos que merecen altura.</span>
        </div>
        <Magnetic strength={0.12} radius={35}>
          <Link className="cinema-project" href="/contact" aria-label="Hablemos de tu proyecto"><span>Tu próximo<br />proyecto</span><span aria-hidden="true">↗</span></Link>
        </Magnetic>
      </div>
      <div className="cinema-caption"><span>01 / Paseo de la Reforma</span><span>19.4270° N · 99.1677° W</span><span>CDMX, México</span></div>
    </section>
  );
}

export function AerialIntroduction() {
  return (
    <section className="aerial-intro" aria-label="Fotografía y video aéreo en México">
      <div className="editorial-label"><span>01 — La perspectiva</span><span>Más allá de lo evidente</span></div>
      <div className="intro-grid">
        <SplitReveal as="h2" mode="words" stagger={0.035}>Hay historias que <br />solo se ven <em>desde arriba.</em></SplitReveal>
        <div className="intro-details">
          <p>Arquitectura, ciudades y naturaleza. Diez años encontrando ese encuadre que transforma un lugar en una historia.</p>
          <Link href="/contact" className="editorial-link">Hablemos de tu proyecto <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className="intro-facts">
        <span>CDMX & vuelos nacionales</span>
        <a href="#rates">Producciones desde $4,500 MXN</a>
        <span>Entrega en 5 días hábiles</span>
        <Link href="/faq">Operación AFAC & seguro RC ↗</Link>
      </div>
    </section>
  );
}
