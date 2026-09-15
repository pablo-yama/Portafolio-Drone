import Link from 'next/link';
import { TldrCell, TldrReveal } from '@/components/sections/TldrReveal';

/**
 * TldrChecklist — the "en corto" summary under the hero, restyled as a
 * pre-flight checklist slate (Server Component).
 *
 * The four <li> are copied byte-for-byte from the previous TldrSection
 * (same text nodes, same hrefs: #rates, /archivo, /faq, /contact) — they are
 * the SEO/answer-engine summary and must not change. Only presentation moves:
 * a 4-cell instrument row, a drawn TickMark per cell, folio numbers via CSS
 * `attr(data-num)`, and `.link-ul` underline reveals on the links.
 * Motion lives in the client children (TldrReveal / TldrCell / TickMark).
 */
export function TldrChecklist() {
  return (
    <section className="tldr tldr-v3" aria-label="Resumen del servicio">
      <div className="tldr-kicker">En corto · TL;DR</div>
      <TldrReveal>
        <TldrCell num="01" index={0}>
          <strong>Fotografía y video aéreo con drone</strong> en CDMX — cobertura de las 16
          alcaldías, zona metropolitana y vuelos nacionales.
        </TldrCell>
        <TldrCell num="02" index={1}>
          Paquetes <a href="#rates" className="link-ul">desde $4,500 MXN</a>; entrega estándar en 5 días hábiles.
        </TldrCell>
        <TldrCell num="03" index={2}>
          Operación bajo normativa <strong>AFAC</strong> con seguro de responsabilidad civil y
          0 incidentes en 10 años.
        </TldrCell>
        <TldrCell num="04" index={3}>
          Revisa el <Link href="/archivo" className="link-ul">archivo de vuelos</Link>, las{' '}
          <Link href="/faq" className="link-ul">preguntas frecuentes</Link> o{' '}
          <Link href="/contact" className="link-ul">cotiza tu vuelo</Link> — respuesta en 24 h.
        </TldrCell>
      </TldrReveal>
    </section>
  );
}
