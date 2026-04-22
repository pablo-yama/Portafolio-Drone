'use client';

import { useState } from 'react';

interface Tier {
  idx: string;
  name: string;
  desc: string;
  amt: string;
  cur: string;
  feat: string[];
  featured?: boolean;
  tierSlug: string;
}

interface TierGroup {
  label: string;
  slug: string;
  tiers: Tier[];
}

const TIER_GROUPS: TierGroup[] = [
  {
    label: 'Foto & Video',
    slug: 'fotografia-video',
    tiers: [
      {
        idx: '01 · Básico',
        name: 'Básico.',
        desc: '1 ubicación · sesión de 1 hora. Ideal para catálogo o anuncio único.',
        amt: '$3,500',
        cur: 'MXN',
        tierSlug: 'Básico',
        feat: [
          '10–15 fotografías editadas en alta resolución',
          'Edición y retoque básico de color',
          'Entrega digital en 5 días hábiles',
          '1 ronda de ajustes incluida',
        ],
      },
      {
        idx: '02 · Estándar',
        name: 'Estándar.',
        desc: '2 ubicaciones · medio día. Foto + video en un mismo entregable.',
        amt: '$9,500',
        cur: 'MXN',
        tierSlug: 'Estándar',
        featured: true,
        feat: [
          '25–30 fotos editadas + retoque avanzado',
          'Video aéreo editado 2–3 min en 4K',
          'Color grading cinematográfico',
          'Banda sonora curada',
          'Entrega en 5 días hábiles',
        ],
      },
      {
        idx: '03 · Premium',
        name: 'Premium.',
        desc: 'Día completo · múltiples ubicaciones. Producción integral.',
        amt: '$19,500',
        cur: 'MXN',
        tierSlug: 'Premium',
        feat: [
          '50+ fotos editadas, retoque premium',
          'Video cinematográfico 5+ min 4K',
          'Color grading + motion graphics',
          'Versiones para redes sociales',
          'Entrega express en 3 días',
          'Archivos RAW incluidos',
        ],
      },
    ],
  },
  {
    label: 'Eventos',
    slug: 'eventos',
    tiers: [
      {
        idx: '01 · Express',
        name: 'Express.',
        desc: 'Cobertura puntual · 2 horas. Para aperturas, llegadas o momentos clave.',
        amt: '$4,500',
        cur: 'MXN',
        tierSlug: 'Express',
        feat: [
          'Cobertura aérea de 2 horas',
          '15–20 fotografías editadas',
          'Clip resumen de 60 segundos',
          'Entrega en 4 días hábiles',
        ],
      },
      {
        idx: '02 · Medio día',
        name: 'Medio día.',
        desc: 'Cobertura de 4–5 horas. Bodas, festivales, corporativos.',
        amt: '$11,500',
        cur: 'MXN',
        tierSlug: 'Medio día',
        featured: true,
        feat: [
          'Cobertura de 4–5 horas continuas',
          '30–40 fotografías editadas',
          'Video highlights 2–3 min en 4K',
          'Tomas de apoyo desde tierra',
          'Entrega en 5 días hábiles',
        ],
      },
      {
        idx: '03 · Integral',
        name: 'Integral.',
        desc: 'Día completo. Cobertura sin cortes, multicamarógrafo, after movie.',
        amt: '$22,500',
        cur: 'MXN',
        tierSlug: 'Integral',
        feat: [
          'Cobertura hasta 8 horas',
          '60+ fotografías editadas',
          'After movie 3–5 min en 4K',
          'Reel vertical para redes',
          'Copia maestra + respaldo en la nube',
          'Entrega en 5 días hábiles',
        ],
      },
    ],
  },
  {
    label: 'Infraestructura',
    slug: 'inspeccion',
    tiers: [
      {
        idx: '01 · Inspección',
        name: 'Inspección.',
        desc: 'Diagnóstico puntual · 1 jornada. Obra, azotea, fachada o predio.',
        amt: '$5,500',
        cur: 'MXN',
        tierSlug: 'Inspección',
        feat: [
          'Inspección visual hasta 4 horas',
          '40+ fotografías georreferenciadas',
          'Clip de avance 60–90 seg',
          'Reporte PDF de hallazgos',
          'Entrega en 4 días hábiles',
        ],
      },
      {
        idx: '02 · Monitoreo',
        name: 'Monitoreo.',
        desc: 'Seguimiento mensual de obra o predio. Comparativas mes a mes.',
        amt: '$14,500',
        cur: 'MXN / mes',
        tierSlug: 'Monitoreo',
        featured: true,
        feat: [
          '2 vuelos por mes, misma ruta',
          'Timelapse comparativo de avance',
          '30–40 fotos editadas por vuelo',
          'Dashboard de progreso trimestral',
          'Archivo consolidado mensual',
        ],
      },
      {
        idx: '03 · Topografía',
        name: 'Topografía.',
        desc: 'Levantamiento fotogramétrico. Ortomosaico, curvas y volúmenes.',
        amt: '$28,000',
        cur: 'MXN',
        tierSlug: 'Topografía',
        feat: [
          'Vuelo fotogramétrico con solape 80%',
          'Ortomosaico georreferenciado',
          'Modelo 3D + nube de puntos',
          'Curvas de nivel editables',
          'Cálculo de volúmenes',
          'Entrega en 7 días hábiles',
        ],
      },
    ],
  },
];

/**
 * PricingSection — three-tier card set with a functional category toggle.
 *
 * Tabs switch between Foto & Video, Eventos and Infraestructura. Each tab
 * swaps `group.tiers` and re-keys the grid so the entrance animation replays.
 * The featured card has a burnt-orange tint and "Más solicitado" badge. Every
 * CTA deep-links into /contact with `?service=&tier=` so the form prefills.
 */
export function PricingSection() {
  const [active, setActive] = useState(0);
  const group = TIER_GROUPS[active];

  return (
    <section id="rates" className="pricing">
      <div className="sect-top">
        <h2>
          Paquetes, <span className="b">diseñados</span> por proyecto.
        </h2>
        <div className="tabs" role="tablist">
          {TIER_GROUPS.map((g, i) => (
            <button
              key={g.label}
              role="tab"
              aria-selected={i === active}
              className={i === active ? 'on' : ''}
              onClick={() => setActive(i)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tier-grid" key={group.label}>
        {group.tiers.map((t) => (
          <div className={`tier${t.featured ? ' fea' : ''}`} key={t.name}>
            <div className="tier-lbl">
              <span>{t.idx}</span>
              {t.featured && <span className="pill">Más solicitado</span>}
            </div>
            <h3>{t.name}</h3>
            <p className="desc">{t.desc}</p>
            <div className="price">
              <span className="from">Desde</span>
              <span className="amt">{t.amt}</span>
              <span className="cur">{t.cur}</span>
            </div>
            <ul>
              {t.feat.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              href={`/contact?service=${group.slug}&tier=${encodeURIComponent(t.tierSlug)}`}
              className="act"
            >
              Cotizar →
            </a>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 40,
          fontSize: 13,
          color: 'var(--dim)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <span>¿Necesitas algo diferente? Cada proyecto es único.</span>
        <a
          href="/contact"
          style={{
            color: 'var(--signal)',
            borderBottom: '1px solid var(--signal)',
            paddingBottom: 2,
          }}
        >
          Cotización personalizada →
        </a>
      </div>
    </section>
  );
}
