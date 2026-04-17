'use client';

import { Navigation } from '@/components/layout/Navigation';
import { Cursor } from '@/components/layout/Cursor';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Footer } from '@/components/layout/Footer';
import { FAQSection } from '@/components/sections/FAQSection';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

export default function FAQPage() {
  return (
    <>
      <Cursor />
      <WhatsAppButton />
      <Navigation />
      <SmoothScroll>
        <main className="pt-32">
          {/* SEO H1 — visually styled as a page header */}
          <header className="container-custom pb-[var(--space-lg)]">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
              FAQ &bull; Drones CDMX
            </p>
            <h1
              className="text-[var(--text-h1)] font-bold uppercase leading-[1.05]"
              style={{ fontFamily: 'var(--font-clash)' }}
            >
              Preguntas frecuentes sobre<br />
              <span className="text-gradient">servicios de drones en CDMX</span>
            </h1>
            <p className="mt-8 max-w-2xl text-[var(--text-body)] leading-relaxed text-[var(--color-text-muted)]">
              Todo lo que necesitas saber sobre permisos, seguros, clima,
              tiempos de entrega, formatos y cobertura de vuelos con drones en Ciudad de México.
            </p>
          </header>

          <FAQSection />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
