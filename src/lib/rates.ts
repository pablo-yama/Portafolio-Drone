/**
 * rates.ts — the three tariff groups rendered by RatesSection (§ 04 Tarifas).
 *
 * Moved verbatim from PricingSection.tsx so the new section and the retired
 * one never share a file. Prices mirror SERVICE_PACKAGES / the OfferCatalog
 * JSON-LD in src/lib/jsonLd.ts — change prices there first, then here.
 */

export interface Tier {
  idx: string;
  name: string;
  desc: string;
  amt: string;
  cur: string;
  feat: string[];
  featured?: boolean;
  tierSlug: string;
}

export interface TierGroup {
  label: string;
  slug: string;
  tiers: Tier[];
}

export const TIER_GROUPS: TierGroup[] = [
  {
    label: 'Foto & Video',
    slug: 'fotografia-video',
    tiers: [
      {
        idx: '01 · Básico',
        name: 'Básico.',
        desc: '1 ubicación · sesión de 1 hora. Ideal para catálogo o anuncio único.',
        amt: '$4,500',
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

/** Deep link into the contact form with the service + tier prefilled. */
export const tierHref = (groupSlug: string, tierSlug: string): string =>
  `/contact?service=${encodeURIComponent(groupSlug)}&tier=${encodeURIComponent(tierSlug)}`;

/** Find a tier by group + tier slug (used by /contact prefill helpers). */
export const findTier = (
  groupSlug: string,
  tierSlug: string,
): { group: TierGroup; tier: Tier } | null => {
  const group = TIER_GROUPS.find((g) => g.slug === groupSlug);
  const tier = group?.tiers.find((t) => t.tierSlug === tierSlug);
  return group && tier ? { group, tier } : null;
};
