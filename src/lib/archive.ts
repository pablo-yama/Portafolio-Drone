/**
 * ARCHIVE — Flight archive data, rendered on /archivo.
 *
 * Each entry represents a delivered aerial piece (still or reel).
 * `thumb` (t1..t8) maps to a CSS gradient placeholder in globals.css and
 * is used as a fallback whenever `thumbUrl` is absent.
 *
 * Filename convention in public/img/archivo/:
 *   lugar_categoria_ubicacion_año[_numero].jpg
 */

export type ArchiveCategory =
  | 'Arquitectura'
  | 'Real Estate'
  | 'Urbanismo'
  | 'Naturaleza'
  | 'Deportes'
  | 'Eventos';

export interface ArchiveEntry {
  /** Zero-padded sequential id, newest first (e.g. "0037") */
  id: string;
  /** Display title — may contain <em> for italic emphasis */
  title: string;
  cat: ArchiveCategory;
  loc: string;
  year: number;
  /** Capture format, e.g. "RAW 24MP" / "4K 60P" */
  fmt: string;
  /** Optional duration mm:ss (video only — omitted for stills) */
  dur?: string;
  /** Thumbnail gradient class t1..t8 (fallback when no image) */
  thumb: string;
  /** Optional CDN- or /public-hosted thumbnail URL (preferred when present) */
  thumbUrl?: string;
  /** Optional preview video URL (hover playback on desktop) */
  previewUrl?: string;
  /** Featured cards span 2 columns in the grid */
  feat?: boolean;
}

const base = '/img/archivo';

export const ARCHIVE: ArchiveEntry[] = [
  // ===== 2026 =====
  { id: '0037', title: 'Estadio GNP · <em>panorámica</em>',      cat: 'Deportes',     loc: 'Guerrero', year: 2026, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/estadio-gnp_deportes_guerrero_2026.jpg`, feat: true },
  { id: '0036', title: 'Estadio GNP · <em>cenital</em>',         cat: 'Deportes',     loc: 'Guerrero', year: 2026, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/estadio-gnp-top_deportes_guerrero_2026.jpg` },
  { id: '0035', title: 'Premier Pádel · <em>Acapulco</em>',      cat: 'Deportes',     loc: 'Guerrero', year: 2026, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/premier-padel_deportes_guerrero_2026.jpg` },
  { id: '0034', title: 'Premier Pádel · complejo',               cat: 'Deportes',     loc: 'Guerrero', year: 2026, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/premier-padel_deportes_guerrero_2026_2.jpg` },
  { id: '0033', title: 'Premier Pádel · atardecer',              cat: 'Deportes',     loc: 'Guerrero', year: 2026, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/premier-padel_deportes_guerrero_2026_3.jpg` },
  { id: '0032', title: 'Bosques de las <em>Lomas</em>',          cat: 'Real Estate',  loc: 'CDMX',     year: 2026, fmt: 'RAW 24MP', thumb: 't3', thumbUrl: `${base}/bosques-lomas_real-estate_cdmx_2026.jpg` },

  // ===== 2025 =====
  { id: '0031', title: 'Torres <em>Mitikah</em>',                cat: 'Arquitectura', loc: 'CDMX',     year: 2025, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/mitikah_arquitectura_cdmx_2025.jpg`, feat: true },
  { id: '0030', title: 'Estadio Olímpico · <em>CU</em>',         cat: 'Deportes',     loc: 'CDMX',     year: 2025, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/estadio-cu_deportes_cdmx_2025.jpg` },
  { id: '0029', title: 'Santa Fe · <em>dorado</em>',             cat: 'Urbanismo',    loc: 'CDMX',     year: 2025, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/santa-fe-dorado_urbanismo_cdmx_2025.jpg` },
  { id: '0028', title: 'Aztlán · <em>rueda</em>',                cat: 'Eventos',      loc: 'CDMX',     year: 2025, fmt: 'RAW 24MP', thumb: 't6', thumbUrl: `${base}/aztlan-rueda_eventos_cdmx_2025.jpg` },
  { id: '0027', title: 'Chapultepec · rueda de la fortuna',      cat: 'Urbanismo',    loc: 'CDMX',     year: 2025, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/chapultepec-rueda_urbanismo_cdmx_2025.jpg` },
  { id: '0026', title: 'Paneles Solares · <em>aéreo</em>',       cat: 'Arquitectura', loc: 'CDMX',     year: 2025, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/paneles-solares_arquitectura_cdmx_2025.jpg` },
  { id: '0025', title: 'Paneles Solares · inspección',           cat: 'Arquitectura', loc: 'CDMX',     year: 2025, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/paneles-solares_arquitectura_cdmx_2025_2.jpg` },
  { id: '0024', title: 'Paneles Solares · detalle',              cat: 'Arquitectura', loc: 'CDMX',     year: 2025, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/paneles-solares_arquitectura_cdmx_2025_3.jpg` },

  // ===== 2024 =====
  { id: '0023', title: 'Paseo de la <em>Reforma</em>',           cat: 'Urbanismo',    loc: 'CDMX',     year: 2024, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/reforma-bbva_urbanismo_cdmx_2024.jpg`, feat: true },
  { id: '0022', title: 'Coyoacán · <em>cenital</em>',            cat: 'Real Estate',  loc: 'CDMX',     year: 2024, fmt: 'RAW 24MP', thumb: 't3', thumbUrl: `${base}/coyoacan-aerial_real-estate_cdmx_2024.jpg` },
  { id: '0021', title: 'Parques Polanco',                        cat: 'Arquitectura', loc: 'CDMX',     year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/parques-polanco_arquitectura_cdmx_2024.jpg` },
  { id: '0020', title: 'Pabellón Polanco · <em>cenital</em>',    cat: 'Arquitectura', loc: 'CDMX',     year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/pabellon-polanco_arquitectura_cdmx_2024.jpg` },
  { id: '0019', title: 'Canchas Tlalpan',                        cat: 'Deportes',     loc: 'CDMX',     year: 2024, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/canchas-tlalpan_deportes_cdmx_2024.jpg` },
  { id: '0018', title: 'Castillo de Chapultepec · <em>cenital</em>', cat: 'Arquitectura', loc: 'CDMX', year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/castillo-chapultepec-top_arquitectura_cdmx_2024.jpg` },
  { id: '0017', title: 'Castillo de Chapultepec',                cat: 'Arquitectura', loc: 'CDMX',     year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/castillo-chapultepec_arquitectura_cdmx_2024.jpg` },
  { id: '0016', title: 'Parque Acuático · <em>Morelos</em>',     cat: 'Eventos',      loc: 'Morelos',  year: 2024, fmt: 'RAW 24MP', thumb: 't6', thumbUrl: `${base}/parque-acuatico_eventos_morelos_2024.jpg` },
  { id: '0015', title: 'Parque Acuático · cenital',              cat: 'Eventos',      loc: 'Morelos',  year: 2024, fmt: 'RAW 24MP', thumb: 't6', thumbUrl: `${base}/parque-acuatico_eventos_morelos_2024_2.jpg` },
  { id: '0014', title: 'Parque Acuático · valle',                cat: 'Eventos',      loc: 'Morelos',  year: 2024, fmt: 'RAW 24MP', thumb: 't6', thumbUrl: `${base}/parque-acuatico_eventos_morelos_2024_3.jpg` },

  // ===== 2023 =====
  { id: '0013', title: 'Museo <em>Soumaya</em>',                 cat: 'Arquitectura', loc: 'CDMX',     year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/soumaya_arquitectura_cdmx_2023.jpg`, feat: true },
  { id: '0012', title: 'Santa Fe · <em>La Mexicana</em>',        cat: 'Urbanismo',    loc: 'CDMX',     year: 2023, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/santa-fe-mexicana_urbanismo_cdmx_2023.jpg` },
  { id: '0011', title: 'Santa Fe · atardecer',                   cat: 'Urbanismo',    loc: 'CDMX',     year: 2023, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/santa-fe-atardecer_urbanismo_cdmx_2023.jpg` },
  { id: '0010', title: 'Santa Fe · hora azul',                   cat: 'Urbanismo',    loc: 'CDMX',     year: 2023, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/santa-fe-azul_urbanismo_cdmx_2023.jpg` },
  { id: '0009', title: 'Santa Fe · <em>Posadas</em>',            cat: 'Urbanismo',    loc: 'CDMX',     year: 2023, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/santa-fe-posadas_urbanismo_cdmx_2023.jpg` },
  { id: '0008', title: 'Museo de Antropología',                  cat: 'Arquitectura', loc: 'CDMX',     year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/museo-antropologia_arquitectura_cdmx_2023.jpg` },
  { id: '0007', title: 'Ritz & <em>BBVA</em> · nocturna',        cat: 'Urbanismo',    loc: 'CDMX',     year: 2023, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/ritz-bbva_urbanismo_cdmx_2023.jpg` },

  // ===== 2022 =====
  { id: '0006', title: 'Desierto de los Leones · <em>bosque</em>', cat: 'Naturaleza', loc: 'CDMX',     year: 2022, fmt: 'RAW 24MP', thumb: 't5', thumbUrl: `${base}/desierto-leones-bosque_naturaleza_cdmx_2022.jpg`, feat: true },
  { id: '0005', title: 'Ex Convento · Los Leones',               cat: 'Arquitectura', loc: 'CDMX',     year: 2022, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/desierto-leones_arquitectura_cdmx_2022.jpg` },
  { id: '0004', title: 'Interlomas · <em>nocturna</em>',         cat: 'Urbanismo',    loc: 'CDMX',     year: 2022, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/interlomas-noche_urbanismo_cdmx_2022.jpg` },
  { id: '0003', title: 'Interlomas · panorama',                  cat: 'Urbanismo',    loc: 'CDMX',     year: 2022, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/interlomas-panorama_urbanismo_cdmx_2022.jpg` },
  { id: '0002', title: 'Las Peñas · <em>roca viva</em>',         cat: 'Naturaleza',   loc: 'Morelos',  year: 2022, fmt: 'RAW 24MP', thumb: 't5', thumbUrl: `${base}/las-penas_naturaleza_morelos_2022.jpg` },
  { id: '0001', title: 'Zócalo · <em>15 Septiembre</em>',        cat: 'Eventos',      loc: 'CDMX',     year: 2022, fmt: 'RAW 24MP', thumb: 't6', thumbUrl: `${base}/zocalo-independencia_eventos_cdmx_2022.jpg` },
];

/** Counts per filter chip, derived from ARCHIVE to stay in sync */
export const CATEGORY_COUNTS: Array<{ key: 'all' | ArchiveCategory; label: string; count: number }> = (() => {
  const cats: ArchiveCategory[] = [
    'Arquitectura', 'Real Estate', 'Urbanismo', 'Naturaleza', 'Deportes', 'Eventos',
  ];
  return [
    { key: 'all', label: 'Todas', count: ARCHIVE.length },
    ...cats.map((c) => ({
      key: c,
      label: c,
      count: ARCHIVE.filter((a) => a.cat === c).length,
    })),
  ];
})();

/** Pins rendered on the "Mapa de vuelos" SVG (% positioned). */
export interface ArchivePin {
  city: string;
  count: number;
  top: string;
  left: string;
  /** CSS variable name for the dot color */
  color: 'signal' | 'green' | 'scan';
}

export const ARCHIVE_PINS: ArchivePin[] = [
  { city: 'CDMX',     count: ARCHIVE.filter((a) => a.loc === 'CDMX').length,     top: '62%', left: '48%', color: 'signal' },
  { city: 'Morelos',  count: ARCHIVE.filter((a) => a.loc === 'Morelos').length,  top: '67%', left: '50%', color: 'green'  },
  { city: 'Guerrero', count: ARCHIVE.filter((a) => a.loc === 'Guerrero').length, top: '78%', left: '43%', color: 'scan'   },
];
