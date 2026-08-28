/**
 * Markdown representation of a page URL.
 *
 * Never requested directly by a client: src/proxy.ts rewrites to it when a
 * request negotiates `Accept: text/markdown` (https://acceptmarkdown.com) or
 * asks for the `.md` variant of a path. The original URL is preserved in the
 * browser/agent — only the internal handler changes.
 */

import {
  contentTypeFor,
  MARKDOWN_TYPE,
  type AvailableType,
  AVAILABLE_TYPES,
  MARKDOWN_PATH_HEADER,
  MARKDOWN_TYPE_HEADER,
} from '@/lib/contentNegotiation';
import {
  renderMarkdownPage,
  renderNotFoundMarkdown,
} from '@/lib/markdownPages';

export const dynamic = 'force-dynamic';

function resolveType(raw: string | null): AvailableType {
  const match = (AVAILABLE_TYPES as readonly string[]).includes(raw ?? '')
    ? (raw as AvailableType)
    : MARKDOWN_TYPE;
  // HTML is never a valid outcome for this handler.
  return match === 'text/html' || match === 'application/xhtml+xml' ? MARKDOWN_TYPE : match;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = request.headers.get(MARKDOWN_PATH_HEADER) ?? url.searchParams.get('path') ?? '/';
  const mediaType = resolveType(
    request.headers.get(MARKDOWN_TYPE_HEADER) ?? url.searchParams.get('type'),
  );

  const body = renderMarkdownPage(path);
  const found = body !== null;

  return new Response(found ? body : renderNotFoundMarkdown(path), {
    status: found ? 200 : 404,
    headers: {
      'Content-Type': contentTypeFor(mediaType),
      // One URL, two representations: caches must key on Accept or they will
      // hand the HTML variant to an agent asking for Markdown.
      Vary: 'Accept, Accept-Encoding',
      /* Deliberately uncacheable. The Markdown variant shares a URL with the
         HTML page, and not every shared cache honours `Vary: Accept` — a CDN
         that stored this body under the page URL would start handing Markdown
         to browsers. The bodies are small and built from in-memory constants,
         so there is nothing to gain by caching them. */
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

export async function HEAD(request: Request) {
  const response = await GET(request);
  return new Response(null, {
    status: response.status,
    headers: response.headers,
  });
}
