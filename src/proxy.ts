/**
 * Edge proxy (the Next 16 successor to `middleware.ts`).
 *
 * Two jobs, both about making the site legible to automated clients:
 *
 * 1. Proactive content negotiation per https://acceptmarkdown.com — a request
 *    that ranks `text/markdown` above `text/html` gets the Markdown
 *    representation of the same URL, with `Vary: Accept` so a shared cache
 *    cannot cross-serve the two variants.
 * 2. The `.md` suffix convention — `/about.md` serves the same Markdown body
 *    without needing a custom header.
 *
 * Browsers are untouched: they rank `text/html` first, so they always take the
 * `NextResponse.next()` branch.
 */

import { NextResponse, type NextRequest } from 'next/server';
import {
  MARKDOWN_PATH_HEADER,
  MARKDOWN_TYPE,
  MARKDOWN_TYPE_HEADER,
  negotiate,
} from '@/lib/contentNegotiation';
import {
  normalizeMarkdownPath,
  renderNotAcceptableMarkdown,
} from '@/lib/markdownPages';

/** Vary values that make the Accept-negotiated pair cacheable and correct. */
const VARY = 'Accept, Accept-Encoding';

/** True for `/llms.txt`, `/og-image.jpg`, `/agents.md` — anything with a file extension. */
function hasFileExtension(pathname: string): boolean {
  return pathname.slice(pathname.lastIndexOf('/') + 1).includes('.');
}

/**
 * React Server Component navigations set these headers. They are internal
 * transport, not a content-type preference, so they must bypass negotiation.
 */
function isInternalNavigation(request: NextRequest): boolean {
  return (
    request.headers.get('rsc') !== null
    || request.headers.get('next-router-prefetch') !== null
    || request.headers.get('next-router-state-tree') !== null
    || request.headers.get('next-router-segment-prefetch') !== null
  );
}

function markdownResponse(request: NextRequest, path: string, mediaType: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/api/markdown';
  url.search = '';

  const response = NextResponse.rewrite(url, {
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        [MARKDOWN_PATH_HEADER]: path,
        [MARKDOWN_TYPE_HEADER]: mediaType,
      }),
    },
  });
  response.headers.set('Vary', VARY);
  return response;
}

function htmlResponse(pathname: string) {
  const response = NextResponse.next();
  // Next's app-page handler overwrites `Vary` with its own RSC list, so the
  // authoritative copy for the HTML branch is the routing-layer rule in
  // next.config.ts. This one still applies wherever the proxy's headers
  // survive, and costs nothing where they do not.
  response.headers.append('Vary', VARY);
  response.headers.set(
    'Link',
    `<${pathname === '/' ? '/index.md' : `${pathname}.md`}>; rel="alternate"; type="text/markdown"`,
  );
  return response;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* Anything with a file extension is a concrete file, not a negotiable page.
     The one exception is a `.md` suffix that resolves to a real page — that is
     the opt-in alias for its Markdown representation. Everything else (an
     actual public/*.md file included) is served as-is. */
  if (hasFileExtension(pathname)) {
    const suffixRoute = pathname.endsWith('.md') ? normalizeMarkdownPath(pathname) : null;
    return suffixRoute
      ? markdownResponse(request, suffixRoute, MARKDOWN_TYPE)
      : NextResponse.next();
  }

  if (isInternalNavigation(request)) {
    return NextResponse.next();
  }

  const accept = request.headers.get('accept');
  const { mediaType, markdown } = negotiate(accept);

  if (mediaType === null) {
    return new NextResponse(renderNotAcceptableMarkdown(accept ?? ''), {
      status: 406,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: VARY,
        'Cache-Control': 'no-store',
      },
    });
  }

  return markdown
    ? markdownResponse(request, pathname, mediaType)
    : htmlResponse(pathname);
}

export const config = {
  matcher: [
    /*
     * Everything except Next's own asset pipeline and API routes. Concrete
     * files that slip through are filtered by hasFileExtension() above.
     */
    '/((?!_next/static|_next/image|_next/data|api/).*)',
  ],
};
