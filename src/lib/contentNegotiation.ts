/**
 * RFC 9110 §12.5.1 `Accept` header parsing and proactive content negotiation.
 *
 * Used by the edge proxy (see `src/proxy.ts`) to decide whether a request wants
 * the rendered HTML page or the Markdown representation of the same URL, per the
 * `Accept: text/markdown` convention documented at https://acceptmarkdown.com.
 *
 * Pure functions only — no Next.js imports — so they can be unit tested directly.
 */

/** Media types this site is able to produce for a negotiable page URL. */
export const HTML_TYPE = 'text/html';
export const MARKDOWN_TYPE = 'text/markdown';
export const MARKDOWN_TYPE_LEGACY = 'text/x-markdown';
export const PLAIN_TYPE = 'text/plain';
export const XHTML_TYPE = 'application/xhtml+xml';

/**
 * Ordered by server preference. When a client expresses no preference (no
 * `Accept`, or `*&#47;*`), the first entry wins — browsers keep getting HTML.
 */
export const AVAILABLE_TYPES = [
  HTML_TYPE,
  XHTML_TYPE,
  MARKDOWN_TYPE,
  MARKDOWN_TYPE_LEGACY,
  PLAIN_TYPE,
] as const;

export type AvailableType = (typeof AVAILABLE_TYPES)[number];

/** The media types that mean "give me the Markdown representation". */
const MARKDOWN_FAMILY: readonly string[] = [
  MARKDOWN_TYPE,
  MARKDOWN_TYPE_LEGACY,
  PLAIN_TYPE,
];

export interface MediaRange {
  /** Top-level type, lowercased. `*` for a wildcard. */
  type: string;
  /** Subtype, lowercased. `*` for a wildcard. */
  subtype: string;
  /** Quality value in [0, 1]. Defaults to 1 when absent or malformed. */
  q: number;
  /**
   * RFC 9110 precedence: 3 = `type/subtype`, 2 = `type/*`, 1 = `*&#47;*`.
   * Extra media-type parameters add 1 so `text/markdown;variant=GFM` outranks
   * a bare `text/markdown` at the same q.
   */
  specificity: number;
  /** Position in the original header, used as the final tie-breaker. */
  order: number;
}

/**
 * Splits an `Accept` header on commas that sit outside of quoted strings, so a
 * parameter such as `;variant="a,b"` does not get torn in half.
 */
function splitOutsideQuotes(header: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let escaped = false;

  for (const char of header) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === '\\' && inQuotes) {
      current += char;
      escaped = true;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
      continue;
    }
    if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);

  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
}

function parseQValue(raw: string): number {
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return 1;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * Parses an `Accept` header into media ranges sorted by descending preference:
 * q value first, then specificity, then the order they appeared in.
 */
export function parseAccept(header: string | null | undefined): MediaRange[] {
  if (!header) return [];

  const ranges: MediaRange[] = [];

  splitOutsideQuotes(header).forEach((entry, order) => {
    const [rawRange, ...rawParams] = entry.split(';');
    const trimmedRange = rawRange.trim().toLowerCase();
    if (!trimmedRange) return;

    const slash = trimmedRange.indexOf('/');
    // A media range without a slash (e.g. `text`) is malformed — RFC 9110 says
    // to ignore what we cannot parse rather than guess at it.
    if (slash === -1) return;

    const type = trimmedRange.slice(0, slash);
    const subtype = trimmedRange.slice(slash + 1);
    if (!type || !subtype) return;

    let q = 1;
    let seenQ = false;
    let extensionParams = 0;

    for (const rawParam of rawParams) {
      const param = rawParam.trim();
      if (!param) continue;
      const eq = param.indexOf('=');
      const key = (eq === -1 ? param : param.slice(0, eq)).trim().toLowerCase();
      const value = eq === -1 ? '' : param.slice(eq + 1).trim().replace(/^"|"$/g, '');

      if (key === 'q' && !seenQ) {
        q = parseQValue(value);
        seenQ = true;
        continue;
      }
      // Parameters before `q` are media-type parameters and raise specificity.
      // Anything after `q` is an accept-ext and is ignored for ranking.
      if (!seenQ) extensionParams += 1;
    }

    const wildcards = (type === '*' ? 1 : 0) + (subtype === '*' ? 1 : 0);
    const specificity = (wildcards === 2 ? 1 : wildcards === 1 ? 2 : 3) + (extensionParams > 0 ? 1 : 0);

    ranges.push({ type, subtype, q, specificity, order });
  });

  return ranges.sort((a, b) => {
    if (b.q !== a.q) return b.q - a.q;
    if (b.specificity !== a.specificity) return b.specificity - a.specificity;
    return a.order - b.order;
  });
}

function matches(range: MediaRange, mediaType: string): boolean {
  const slash = mediaType.indexOf('/');
  const type = mediaType.slice(0, slash);
  const subtype = mediaType.slice(slash + 1);

  if (range.type === '*' && range.subtype === '*') return true;
  if (range.type === type && range.subtype === '*') return true;
  return range.type === type && range.subtype === subtype;
}

/**
 * Returns the effective q value the client assigned to `mediaType`, using the
 * most specific matching range (RFC 9110 §12.5.1). `0` means "not acceptable".
 */
export function qualityFor(ranges: MediaRange[], mediaType: string): number {
  let best: MediaRange | null = null;

  for (const range of ranges) {
    if (!matches(range, mediaType)) continue;
    if (!best || range.specificity > best.specificity) best = range;
  }

  // No `Accept` header at all, or nothing matched: RFC 9110 says an absent
  // Accept means every media type is acceptable.
  if (!best) return ranges.length === 0 ? 1 : 0;
  return best.q;
}

export interface NegotiationResult {
  /** The media type to serve, or `null` when nothing acceptable can be produced. */
  mediaType: AvailableType | null;
  /** True when the winning type is one of the Markdown-family types. */
  markdown: boolean;
}

/**
 * Picks the representation to serve for a negotiable page URL.
 *
 * - No `Accept` header, or a header that ranks HTML at least as high as
 *   Markdown, yields HTML — browsers and existing crawlers are unaffected.
 * - A header that ranks `text/markdown` (or `text/x-markdown` / `text/plain`)
 *   strictly above HTML yields Markdown.
 * - A header that accepts none of the representations yields `null`, which the
 *   caller turns into `406 Not Acceptable`.
 */
export function negotiate(header: string | null | undefined): NegotiationResult {
  const ranges = parseAccept(header);

  let bestType: AvailableType | null = null;
  let bestQuality = 0;

  for (const candidate of AVAILABLE_TYPES) {
    const q = qualityFor(ranges, candidate);
    if (q <= 0) continue;
    // AVAILABLE_TYPES is in server-preference order, so only a strictly higher
    // client q value may displace an earlier candidate.
    if (q > bestQuality) {
      bestQuality = q;
      bestType = candidate;
    }
  }

  return {
    mediaType: bestType,
    markdown: bestType !== null && MARKDOWN_FAMILY.includes(bestType),
  };
}

/** `Content-Type` to send for a negotiated media type. */
export function contentTypeFor(mediaType: AvailableType): string {
  if (mediaType === MARKDOWN_TYPE) return 'text/markdown; charset=utf-8';
  if (mediaType === MARKDOWN_TYPE_LEGACY) return 'text/x-markdown; charset=utf-8';
  if (mediaType === PLAIN_TYPE) return 'text/plain; charset=utf-8';
  return 'text/html; charset=utf-8';
}

/**
 * Internal headers the proxy uses to hand the original path and the negotiated
 * media type over to the Markdown route handler across a rewrite.
 */
export const MARKDOWN_PATH_HEADER = 'x-markdown-path';
export const MARKDOWN_TYPE_HEADER = 'x-markdown-type';
