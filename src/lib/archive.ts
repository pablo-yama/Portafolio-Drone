/**
 * ARCHIVE — Flight archive data, rendered on /archivo.
 *
 * Each entry represents a delivered aerial piece (still or reel).
 * `thumb` (t1..t8) maps to a CSS gradient placeholder in globals.css and
 * is used as a fallback whenever `thumbUrl` is absent.
 *
 * Filename convention in public/img/archivo/:
 *   lugar-categoria-ubicacion-año[-numero].jpg
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
  // ===== 2025 =====
  { id: '0037', title: 'Ciudad Universitaria · <em>campus</em>',      cat: 'Arquitectura', loc: 'CDMX',    year: 2025, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/cu-arquitectura-cdmx-2025.jpg`, feat: true },
  { id: '0036', title: 'Parque La Mexicana',                          cat: 'Naturaleza',   loc: 'CDMX',    year: 2025, fmt: 'RAW 24MP', thumb: 't5', thumbUrl: `${base}/parque-la-mexicana-naturaleza-cdmx-2025.jpg` },
  { id: '0035', title: 'Santa Fe · <em>residencial</em>',             cat: 'Real Estate',  loc: 'CDMX',    year: 2025, fmt: 'RAW 24MP', thumb: 't3', thumbUrl: `${base}/santa-fe-real-estate-cdmx-2025.jpg` },

  // ===== 2024 =====
  { id: '0034', title: 'Paseo de la Reforma',                         cat: 'Arquitectura', loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/paseo-reforma-arquitectura-cdmx-2024.jpg`, feat: true },
  { id: '0033', title: 'Museo Soumaya · <em>exterior</em>',           cat: 'Arquitectura', loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/soumaya-arquitectura-cdmx-2024.jpg` },
  { id: '0032', title: 'Castillo de Chapultepec',                     cat: 'Arquitectura', loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/castillo-chapultepec-arquitectura-cdmx-2024.jpg` },
  { id: '0031', title: 'Arcos Bosques',                               cat: 'Arquitectura', loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/arcos-bosques-arquitectura-cdmx-2024.jpg` },
  { id: '0030', title: 'Cancha de basquetbol',                        cat: 'Arquitectura', loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/cancha-basquetball-arquitectura-cdmx-2024.jpg` },
  { id: '0029', title: 'Santa Fe · <em>torres</em>',                  cat: 'Arquitectura', loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/santa-fe-arquitectura-cdmx-2024.jpg` },
  { id: '0028', title: 'Santa Fe · torres II',                        cat: 'Arquitectura', loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/santa-fe-arquitectura-cdmx-2024-2.jpg` },
  { id: '0027', title: 'Chapultepec · <em>urbanismo</em>',            cat: 'Urbanismo',    loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/chapultepec-urbanismo-cdmx-2024.jpg` },
  { id: '0026', title: 'Lago de Chapultepec',                         cat: 'Urbanismo',    loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/lago-chapultepec-urbanismo-cdmx-2024.jpg` },
  { id: '0025', title: 'San Jerónimo',                                cat: 'Urbanismo',    loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't1', thumbUrl: `${base}/san-jeronimo-urbanismo-cdmx-2024.jpg` },
  { id: '0024', title: 'Estadio GNP · <em>panorámica</em>',           cat: 'Deportes',     loc: 'Guerrero', year: 2024, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/estadio-gnp-deportes-guerrero-2024.jpg`, feat: true },
  { id: '0023', title: 'Estadio GNP · acercamiento',                  cat: 'Deportes',     loc: 'Guerrero', year: 2024, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/estadio-gnp-deportes-guerrero-2024-2.jpg` },
  { id: '0022', title: 'Estadio GNP · cancha',                        cat: 'Deportes',     loc: 'Guerrero', year: 2024, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/estadio-gnp-deportes-guerrero-2024-3.jpg` },
  { id: '0021', title: 'Estadio GNP · vuelo alto',                    cat: 'Deportes',     loc: 'Guerrero', year: 2024, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/estadio-gnp-deportes-guerrero-2024-4.jpg` },
  { id: '0020', title: 'Estadio GNP · contexto',                      cat: 'Deportes',     loc: 'Guerrero', year: 2024, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/estadio-gnp-deportes-guerrero-2024-5.jpg` },
  { id: '0019', title: 'Estela de Luz',                               cat: 'Eventos',      loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't6', thumbUrl: `${base}/estela-luz-eventos-cdmx-2024.jpg` },
  { id: '0018', title: 'Ex Convento Desierto de los Leones',          cat: 'Naturaleza',   loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't5', thumbUrl: `${base}/ex-convento-desierto-leones-naturaleza-cdmx-2024.jpg`, feat: true },
  { id: '0017', title: 'Ex Convento Desierto · <em>II</em>',          cat: 'Naturaleza',   loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't5', thumbUrl: `${base}/ex-convento-desierto-leones-naturaleza-cdmx-2024-2.jpg` },
  { id: '0016', title: 'Ex Convento Desierto · III',                  cat: 'Naturaleza',   loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't5', thumbUrl: `${base}/ex-convento-desierto-leones-naturaleza-cdmx-2024-3.jpg` },
  { id: '0015', title: 'Museo de Antropología',                       cat: 'Naturaleza',   loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't5', thumbUrl: `${base}/museo-antropologia-naturaleza-cdmx-2024.jpg` },
  { id: '0014', title: 'Mundo Imayina · <em>naturaleza</em>',         cat: 'Naturaleza',   loc: 'Morelos', year: 2024, fmt: 'RAW 24MP', thumb: 't5', thumbUrl: `${base}/mundo-imayina-naturaleza-morelos-2024.jpg` },
  { id: '0013', title: 'Mundo Imayina · residencial',                 cat: 'Real Estate',  loc: 'Morelos', year: 2024, fmt: 'RAW 24MP', thumb: 't3', thumbUrl: `${base}/mundo-imayina-real-estate-morelos-2024.jpg` },
  { id: '0012', title: 'Mundo Imayina · residencial II',              cat: 'Real Estate',  loc: 'Morelos', year: 2024, fmt: 'RAW 24MP', thumb: 't3', thumbUrl: `${base}/mundo-imayina-real-estate-morelos-2024-2.jpg` },
  { id: '0011', title: 'Paneles Solares · <em>aéreo</em>',            cat: 'Real Estate',  loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't3', thumbUrl: `${base}/paneles-solares-real-estate-cdmx-2024.jpg` },
  { id: '0010', title: 'Paneles Solares · cerrado',                   cat: 'Real Estate',  loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't3', thumbUrl: `${base}/paneles-solares-real-estate-cdmx-2024-2.jpg` },
  { id: '0009', title: 'Paneles Solares · detalle',                   cat: 'Real Estate',  loc: 'CDMX',    year: 2024, fmt: 'RAW 24MP', thumb: 't3', thumbUrl: `${base}/paneles-solares-real-estate-cdmx-2024-3.jpg` },

  // ===== 2023 =====
  { id: '0008', title: 'Torres Mitikah · <em>icónico</em>',           cat: 'Arquitectura', loc: 'CDMX',    year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/mitikah-arquitectura-cdmx-2023.jpg`, feat: true },
  { id: '0007', title: 'Reforma · <em>avenida</em>',                  cat: 'Arquitectura', loc: 'CDMX',    year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/reforma-arquitectura-cdmx-2023.jpg` },
  { id: '0006', title: 'Garden Santa Fe',                             cat: 'Arquitectura', loc: 'CDMX',    year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/garden-santa-fe-arquitectura-cdmx-2023.jpg` },
  { id: '0005', title: 'Santa Fe · <em>skyline</em>',                 cat: 'Arquitectura', loc: 'CDMX',    year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/santa-fe-arquitectura-cdmx-2023.jpg` },
  { id: '0004', title: 'Santa Fe · skyline II',                       cat: 'Arquitectura', loc: 'CDMX',    year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/santa-fe-arquitectura-cdmx-2023-2.jpg` },
  { id: '0003', title: 'Vista Hermosa',                               cat: 'Arquitectura', loc: 'CDMX',    year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/vista-hermosa-arquitectura-cdmx-2023.jpg` },
  { id: '0002', title: 'Vista Hermosa · II',                          cat: 'Arquitectura', loc: 'CDMX',    year: 2023, fmt: 'RAW 24MP', thumb: 't2', thumbUrl: `${base}/vista-hermosa-arquitectura-cdmx-2023-2.jpg` },
  { id: '0001', title: 'Desierto de los Leones · <em>aventura</em>',  cat: 'Deportes',     loc: 'CDMX',    year: 2023, fmt: 'RAW 24MP', thumb: 't7', thumbUrl: `${base}/desierto-leones-deportes-cdmx-2023.jpg` },
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
