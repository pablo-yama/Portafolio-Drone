import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ARCHIVE, CATEGORY_COUNTS } from '@/lib/archive';
import { ArchiveGrid } from './ArchiveGrid';
import { FlightMap, type FlightLocation } from './FlightMap';

/**
 * /archivo — full archive page.
 *
 * Server component: renders static chrome (header, stats, map, CTA) on the
 * server so SEO + initial paint are fast, and hands off the interactive
 * grid/list + filter bar to the `ArchiveGrid` client component and the
 * Leaflet-based `FlightMap` client component.
 *
 * Real-world coordinates for each location referenced in the archive.
 * Keys must match the `loc` field used on ArchiveEntry rows.
 */
const LOC_COORDS: Record<string, { lat: number; lng: number; detail?: string; color: 'signal' | 'green' | 'scan' }> = {
  CDMX:     { lat: 19.4326, lng: -99.1332, detail: 'Ciudad de México', color: 'signal' },
  Morelos:  { lat: 18.8811, lng: -99.1809, detail: 'Jiutepec',         color: 'green'  },
  Guerrero: { lat: 16.8531, lng: -99.8237, detail: 'Acapulco',         color: 'scan'   },
};

export default function ArchivoPage() {
  const totalPieces = ARCHIVE.length;
  const years = Array.from(new Set(ARCHIVE.map((a) => a.year))).sort();
  const firstYear = years[0] ?? 2016;
  const lastYear = years[years.length - 1] ?? 2026;

  // Derive map locations from ARCHIVE so counts stay in sync with the data
  const locCounts = ARCHIVE.reduce<Record<string, number>>((acc, e) => {
    acc[e.loc] = (acc[e.loc] ?? 0) + 1;
    return acc;
  }, {});
  const mapLocations: FlightLocation[] = Object.entries(locCounts).flatMap(
    ([name, count]) => {
      const c = LOC_COORDS[name];
      if (!c) return [];
      const entry: FlightLocation = {
        name,
        count,
        lat: c.lat,
        lng: c.lng,
        color: c.color,
      };
      if (c.detail) entry.detail = c.detail;
      return [entry];
    },
  );

  return (
    <div className="apage">
      <Navigation />

      <main>
        {/* ===== HEADER ===== */}
        <section className="apage-top">
          <div className="kicker">
            <span>§ 01 / ARCHIVO COMPLETO</span>
            <span className="slash">/</span>
            <span>{totalPieces} piezas</span>
            <span className="slash">/</span>
            <span>
              {firstYear} — {lastYear}
            </span>
          </div>
          <h1>
            Diez años, <span className="u">treinta</span>
            <br />y <span className="b">siete</span> <em>vuelos</em>.
          </h1>
          <p className="sub">
            Cada pieza del archivo fue ejecutada con equipo profesional y normativa vigente.
            Selección curada por categoría, ubicación y año — filtra, explora o busca la pieza
            que necesitas.
          </p>
        </section>

        {/* ===== STATS BAR ===== */}
        <div className="astats">
          <div className="s">
            <span className="k">Total piezas</span>
            <span className="v">
              {totalPieces}
              <span className="u">·</span>
            </span>
          </div>
          <div className="s">
            <span className="k">Horas de vuelo</span>
            <span className="v">
              300<span className="u">h</span>
            </span>
          </div>
          <div className="s">
            <span className="k">Ubicaciones</span>
            <span className="v">
              3<span className="u">estados</span>
            </span>
          </div>
          <div className="s">
            <span className="k">Formato</span>
            <span className="v">
              RAW<span className="u">24MP</span>
            </span>
          </div>
          <div className="s">
            <span className="k">Última adición</span>
            <span className="v">
              2025<span className="u">#0037</span>
            </span>
          </div>
        </div>

        {/* ===== FILTER + GRID (client) ===== */}
        <ArchiveGrid entries={ARCHIVE} categories={CATEGORY_COUNTS} />

        {/* ===== MAP ===== */}
        <section className="mapsec">
          <div className="hd">
            <h2>
              Mapa <span className="b">de</span> <em>vuelos</em>.
            </h2>
            <div className="legend">
              <span>CDMX</span>
              <span className="g">Morelos</span>
              <span className="s">Guerrero</span>
            </div>
          </div>
          <FlightMap locations={mapLocations} />
        </section>

        {/* ===== END CTA ===== */}
        <section className="aend">
          <h3>
            ¿Buscas algo <em>específico?</em>
          </h3>
          <p>
            Si necesitas una pieza que no ves aquí, escríbeme. Tengo material adicional sin
            publicar y puedo ejecutar nuevas locaciones bajo briefing.
          </p>
          <div className="cta">
            <Link href="/contact" className="btn btn-fill">
              Cotizar vuelo <span className="arr">→</span>
            </Link>
            <Link href="/" className="btn btn-out">
              Volver al inicio <span className="arr">↗</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
