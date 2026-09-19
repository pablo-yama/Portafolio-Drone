import Link from 'next/link';

/**
 * TldrSection — resumen "en corto" bajo el hero: los datos que un visitante
 * (o un motor de respuesta) necesita sin scroll. Solo hechos verificables
 * que ya viven en constants/FAQ.
 */
export function TldrSection() {
  return (
    <section className="tldr" aria-label="Resumen del servicio">
      <div className="tldr-kicker">En corto · TL;DR</div>
      <ul>
        <li>
          <strong>Fotografía y video aéreo con drone</strong> en CDMX — cobertura de las 16
          alcaldías, zona metropolitana y vuelos nacionales.
        </li>
        <li>
          Paquetes <a href="#rates">desde $4,500 MXN</a>; entrega estándar en 5 días hábiles.
        </li>
        <li>
          Operación bajo normativa <strong>AFAC</strong> con seguro de responsabilidad civil y
          0 incidentes en 10 años.
        </li>
        <li>
          Revisa el <Link href="/archivo">archivo de vuelos</Link>, las{' '}
          <Link href="/faq">preguntas frecuentes</Link> o{' '}
          <Link href="/contact">cotiza tu vuelo</Link> — respuesta en 24 h.
        </li>
      </ul>
    </section>
  );
}
