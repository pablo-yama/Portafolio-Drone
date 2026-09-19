import { ARCHIVE, ARCHIVE_PINS, type ArchiveCategory, type ArchiveEntry } from '@/lib/archive';
import { titleToText } from '@/lib/archiveTitle';

/**
 * archiveStats — every number the home page prints about the flight archive,
 * derived once at module scope from ARCHIVE so /archivo and the home never
 * disagree. Pure and server-renderable (charts SSR in their final state).
 */
export interface YearStat {
  year: number;
  count: number;
}

export interface CategoryStat {
  cat: ArchiveCategory;
  count: number;
  /** Rounded percentage of TOTAL_PIECES */
  pct: number;
}

export type LocationTone = 'signal' | 'scan' | 'green';

export interface LocationStat {
  loc: string;
  count: number;
  pct: number;
  /** CSS token name (matches ARCHIVE_PINS so the map and the dots agree) */
  color: LocationTone;
}

export const TOTAL_PIECES = ARCHIVE.length;

const pct = (count: number) => Math.round((count / TOTAL_PIECES) * 100);

/** Category order used for tie-breaking (mirrors the /archivo filter chips). */
const CATEGORY_ORDER: ArchiveCategory[] = [
  'Arquitectura',
  'Real Estate',
  'Urbanismo',
  'Naturaleza',
  'Deportes',
  'Eventos',
];

export const PIECES_BY_YEAR: YearStat[] = Array.from(
  ARCHIVE.reduce((acc, e) => acc.set(e.year, (acc.get(e.year) ?? 0) + 1), new Map<number, number>()),
)
  .map(([year, count]) => ({ year, count }))
  .sort((a, b) => a.year - b.year);

export const PIECES_BY_CATEGORY: CategoryStat[] = CATEGORY_ORDER.map((cat) => {
  const count = ARCHIVE.filter((e) => e.cat === cat).length;
  return { cat, count, pct: pct(count) };
}).sort((a, b) => b.count - a.count);

const PIN_TONE = new Map<string, LocationTone>(ARCHIVE_PINS.map((p) => [p.city, p.color]));

export const PIECES_BY_LOCATION: LocationStat[] = Array.from(
  ARCHIVE.reduce((acc, e) => acc.set(e.loc, (acc.get(e.loc) ?? 0) + 1), new Map<string, number>()),
)
  .map(([loc, count]) => ({ loc, count, pct: pct(count), color: PIN_TONE.get(loc) ?? 'signal' }))
  .sort((a, b) => b.count - a.count);

export const YEAR_RANGE = {
  first: PIECES_BY_YEAR[0]?.year ?? 0,
  last: PIECES_BY_YEAR[PIECES_BY_YEAR.length - 1]?.year ?? 0,
} as const;

export const MAX_YEAR_COUNT = PIECES_BY_YEAR.reduce((m, y) => Math.max(m, y.count), 0);

/** Chart fills per category, in token form (ring arcs + legends). */
export const CATEGORY_TONES: Record<ArchiveCategory, string> = {
  Arquitectura: 'var(--signal)',
  Urbanismo: 'rgba(232, 230, 225, 0.7)',
  Deportes: 'var(--scan)',
  Eventos: 'rgba(232, 230, 225, 0.45)',
  'Real Estate': 'var(--green)',
  Naturaleza: 'rgba(232, 230, 225, 0.3)',
};

/** The curated eight rows on the home flight log (NOT ARCHIVE.slice(0, 8)). */
export const HOME_ROW_IDS = ['0037', '0032', '0031', '0028', '0023', '0018', '0016', '0013'] as const;

/** Film-strip frames: the five `feat` pieces in order + three for category/state variety. */
export const STRIP_IDS = ['0037', '0031', '0023', '0013', '0006', '0032', '0028', '0016'] as const;

const INDEX = new Map<string, ArchiveEntry>(ARCHIVE.map((e) => [e.id, e]));

export function byId(id: string): ArchiveEntry {
  const entry = INDEX.get(id);
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`archiveStats: no ARCHIVE entry with id "${id}"`);
    }
    return ARCHIVE[0];
  }
  return entry;
}

export const HOME_ROWS: ArchiveEntry[] = HOME_ROW_IDS.map(byId);
export const STRIP_FRAMES: ArchiveEntry[] = STRIP_IDS.map(byId);

/** Alt text: real place + medium + state + year, for next/image and lightbox. */
export function altFor(e: ArchiveEntry): string {
  return `${titleToText(e.title)} — fotografía aérea con drone de ${e.loc}, ${e.year}`;
}

/** Mono stamp printed on strip frames: `#0037 · GUERRERO · 2026 · RAW 24MP`. */
export function stampFor(e: ArchiveEntry): string {
  return `#${e.id} · ${e.loc.toUpperCase()} · ${e.year} · ${e.fmt}`;
}

if (process.env.NODE_ENV !== 'production') {
  const sum = (xs: { count: number }[]) => xs.reduce((s, x) => s + x.count, 0);
  const checks: Array<[string, number]> = [
    ['PIECES_BY_YEAR', sum(PIECES_BY_YEAR)],
    ['PIECES_BY_CATEGORY', sum(PIECES_BY_CATEGORY)],
    ['PIECES_BY_LOCATION', sum(PIECES_BY_LOCATION)],
  ];
  for (const [name, total] of checks) {
    if (total !== TOTAL_PIECES) {
      throw new Error(`archiveStats: ${name} sums to ${total}, expected ${TOTAL_PIECES}`);
    }
  }
}
