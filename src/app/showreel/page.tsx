'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Cursor } from '@/components/layout/Cursor';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ShowreelSection } from '@/components/sections/ShowreelSection';

/* Reusable chip for specs / locations */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
      {children}
    </span>
  );
}

export default function ShowreelPage() {
  return (
    <>
      <Cursor />
      <WhatsAppButton />
      <Navigation />
      <SmoothScroll>
        <main className="pt-32">
          {/* Page header with SEO H1 */}
          <header className="container-custom pb-[var(--space-lg)]">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Showreel &bull; 4K &bull; CDMX
            </p>
            <h1
              className="text-[var(--text-h1)] font-bold uppercase leading-[1.05]"
              style={{ fontFamily: 'var(--font-clash)' }}
            >
              Video aéreo con drones<br />
              <span className="text-gradient">en Ciudad de México</span>
            </h1>
            <p className="mt-8 max-w-2xl text-[var(--text-body)] leading-relaxed text-[var(--color-text-muted)]">
              Una selección de tomas cinematográficas en 4K grabadas sobre CDMX y su zona
              metropolitana: hyperlapses, vuelo nocturno, rascacielos, bosques urbanos y
              recorridos inmobiliarios. Todas las secuencias fueron capturadas por Pablo
              Yamamoto a lo largo de más de 10 años volando drones sobre la ciudad.
            </p>
          </header>

          {/* Reel grid */}
          <ShowreelSection />

          {/* Content: locations, equipment, techniques */}
          <section className="py-[var(--section-padding)]">
            <div className="container-custom grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
              {/* Left column — narrative */}
              <div>
                <p className="section-label">Qué verás</p>
                <h2
                  className="mt-3 text-[var(--text-h2)] font-bold uppercase leading-tight"
                  style={{ fontFamily: 'var(--font-clash)' }}
                >
                  Un recorrido aéreo por CDMX
                </h2>
                <div className="mt-8 space-y-6 text-[var(--text-body)] leading-relaxed text-[var(--color-text-muted)]">
                  <p>
                    El showreel reúne algunas de las tomas más representativas de mi trabajo
                    de los últimos años sobre la Ciudad de México. Encontrarás vuelo nocturno
                    en Paseo de la Reforma, hyperlapses al amanecer sobre Polanco, bosques
                    urbanos como Chapultepec y Los Dinamos, fachadas inmobiliarias, eventos
                    deportivos y paneles solares fotografiados para reportes técnicos.
                  </p>
                  <p>
                    Cada secuencia está planeada con anticipación: reviso el espacio aéreo,
                    coordino horarios de luz y preparo el plan de vuelo para obtener tomas
                    limpias, estables y cinematográficas. Todas las tomas fueron capturadas
                    en 4K a 24 o 30 fps, con color grading LUT cinematográfico aplicado en
                    postproducción.
                  </p>
                  <p>
                    Si lo que buscas es un estilo similar para tu proyecto &mdash; ya sea
                    real estate, branding, cobertura de eventos, arquitectura o inspección
                    de infraestructura &mdash; el showreel funciona como referencia directa de
                    calidad, ritmo y lenguaje visual.
                  </p>
                </div>
              </div>

              {/* Right column — specs */}
              <aside className="space-y-10">
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                    Ubicaciones destacadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Chip>Paseo de la Reforma</Chip>
                    <Chip>Polanco</Chip>
                    <Chip>Santa Fe</Chip>
                    <Chip>Chapultepec</Chip>
                    <Chip>Los Dinamos</Chip>
                    <Chip>Centro Histórico</Chip>
                    <Chip>Coyoacán</Chip>
                    <Chip>Xochimilco</Chip>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                    Tipos de proyecto
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Chip>Real Estate</Chip>
                    <Chip>Eventos</Chip>
                    <Chip>Arquitectura</Chip>
                    <Chip>Construcción</Chip>
                    <Chip>Branding</Chip>
                    <Chip>Inspección</Chip>
                    <Chip>Cinematografía</Chip>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                    Equipo y especificaciones
                  </h3>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
                    <li>Drones DJI con sensor de 1&apos; y cámara Hasselblad (4K/5.1K a 30fps)</li>
                    <li>Filtros ND variables para exposición cinematográfica</li>
                    <li>Operación profesional con seguro de responsabilidad civil vigente</li>
                    <li>Workflow en DaVinci Resolve con LUTs personalizados</li>
                    <li>Entrega en H.264 / H.265 y ProRes bajo solicitud</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                    Técnicas de captura
                  </h3>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
                    <li>Hyperlapse aéreo (vuelos programados punto a punto)</li>
                    <li>Orbital cinematográfico y reveal shots</li>
                    <li>Vuelo nocturno con iluminación natural urbana</li>
                    <li>Seguimiento de sujetos a velocidad controlada</li>
                    <li>Tomas tipo &laquo;dronie&raquo; para inmobiliarios</li>
                  </ul>
                </div>
              </aside>
            </div>
          </section>

          {/* CTA */}
          <section className="border-t border-[var(--glass-border)] py-[var(--section-padding)]">
            <div className="container-custom text-center">
              <h2
                className="text-[var(--text-h2)] font-bold uppercase"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                ¿Quieres tomas así para tu proyecto?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
                Cotiza tu sesión de video aéreo con drones en CDMX. Paquetes desde $4,500 MXN.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-bg)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
                  data-cursor-text="Cotizar"
                >
                  Cotiza tu proyecto
                </Link>
                <Link
                  href="/services"
                  className="pill-btn hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Ver servicios y precios
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
