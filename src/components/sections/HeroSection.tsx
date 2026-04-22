'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { CountUp } from '@/components/ui/CountUp';

const HeroDroneScene = dynamic(() => import('@/components/three/HeroDroneScene'), {
  ssr: false,
  loading: () => null,
});

/**
 * HeroSection — split hero: topographic 3D on the left, live telemetry on the right.
 *
 * The left pane hosts the dynamic Three.js scene plus the flight-log header, oversized
 * italic-serif headline with staggered entry, copy, CTAs and a compact metric strip.
 * The right pane is a mock telemetry dashboard driven by `useTelemetry`, which
 * animates altitude/speed/GPS/battery readouts and a crosshair along an SVG flight
 * path. Class names match the CSS tokens in globals.css.
 */
export function HeroSection() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useTelemetry();

  useEffect(() => {
    const left = leftRef.current;
    if (!left) return;
    const reveals = left.querySelectorAll<HTMLElement>('.fade-up');
    reveals.forEach((el, i) => {
      el.style.transitionDelay = i * 80 + 'ms';
      requestAnimationFrame(() => el.classList.add('in'));
    });
  }, []);

  useEffect(() => {
    const right = rightRef.current;
    if (!right) return;
    const els = right.querySelectorAll<HTMLElement>('.fade-up');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.transitionDelay = i * 60 + 'ms';
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-left" ref={leftRef}>
        <HeroDroneScene />

        <div className="kicker fade-up">
          FLIGHT LOG · 2016 — 2026
          <span className="slash">//</span>
          <span id="sessClock">SESIÓN · 00:00:00</span>
        </div>

        <h1>
          <span className="reveal d1">
            <span>Una cámara,</span>
          </span>
          <br />
          <span className="reveal d2">
            <span>
              mil <em>ángulos</em>
            </span>
          </span>
          <br />
          <span className="reveal d3">
            <span>
              que <span className="b">no existen</span>
            </span>
          </span>
          <br />
          <span className="reveal d4">
            <span>
              desde el <span className="u">suelo</span>.
            </span>
          </span>
        </h1>

        <p className="hero-lead fade-up">
          Fotografía y video aéreo cinematográfico para arquitectura, eventos, paisaje e
          infraestructura. Diez años de vuelos en CDMX, el Valle y cualquier sitio que
          pida altura.
        </p>

        <div className="hero-cta fade-up">
          <a href="#archive" className="btn btn-fill">
            Abrir archivo <span className="arr">→</span>
          </a>
          <a href="/contact" className="btn btn-out">
            Iniciar uplink <span className="arr">↗</span>
          </a>
        </div>

        <div className="hero-foot fade-up">
          <div>
            Vuelos
            <span className="v">
              <CountUp target={1240} />+
            </span>
          </div>
          <div>
            Clientes
            <span className="v">
              <CountUp target={140} />+
            </span>
          </div>
          <div>
            Años
            <span className="v">
              <CountUp target={10} />
            </span>
          </div>
          <div>
            Incidentes
            <span className="v">
              <CountUp target={0} pad={2} />
            </span>
          </div>
        </div>
      </div>

      <aside className="hero-right" ref={rightRef}>
        <div className="tick fade-up">
          <span>TELEMETRÍA · LIVE</span>
          <span className="rec">OPERANDO</span>
        </div>

        <div className="telem-feed">
          <div className="telem-map fade-up">
            <svg viewBox="0 0 400 220" preserveAspectRatio="none">
              <defs>
                <pattern id="hgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="rgba(232,230,225,0.06)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="400" height="220" fill="url(#hgrid)" />
              <path
                id="flightPath"
                d="M 10 180 Q 80 120 150 140 T 300 90 T 400 70"
                fill="none"
                stroke="var(--signal)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <circle cx="10" cy="180" r="3" fill="var(--signal)" />
              <circle cx="390" cy="72" r="3" fill="var(--fg)" />
            </svg>
            <div className="crosshair" id="crosshair" />
            <span className="coord tl">ORIGIN · 19.4326°N</span>
            <span className="coord br">TARGET · 99.1332°W</span>
          </div>

          <div className="telem-row fade-up">
            <span className="lbl">ALT</span>
            <div className="bar-wrap">
              <div className="bar-fill" id="bAlt" />
            </div>
            <span className="val" id="vAlt">0 M</span>
          </div>
          <div className="telem-row fade-up">
            <span className="lbl">SPD</span>
            <div className="bar-wrap">
              <div className="bar-fill" id="bSpd" />
            </div>
            <span className="val" id="vSpd">0 M/S</span>
          </div>
          <div className="telem-row fade-up">
            <span className="lbl">GPS</span>
            <div className="bar-wrap">
              <div className="bar-fill" id="bGps" />
            </div>
            <span className="val" id="vGps">0/22</span>
          </div>
          <div className="telem-row fade-up warn">
            <span className="lbl">BAT</span>
            <div className="bar-wrap">
              <div className="bar-fill" id="bBat" />
            </div>
            <span className="val" id="vBat">0%</span>
          </div>

          <div className="telem-grid fade-up">
            <div className="telem-card">
              <span className="k">Equipo</span>
              <span className="v">Mavic 3 Pro</span>
            </div>
            <div className="telem-card">
              <span className="k">Sensor</span>
              <span className="v">4/3 CMOS</span>
            </div>
            <div className="telem-card">
              <span className="k">Formato</span>
              <span className="v">DNG · ProRes</span>
            </div>
            <div className="telem-card">
              <span className="k">Ventana</span>
              <span className="v">Hora azul</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
