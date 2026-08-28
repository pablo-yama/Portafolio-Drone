/**
 * End-to-end checks against a real `next start` server.
 *
 * These cover behaviour that only exists once the proxy, the routing-layer
 * header rules and the route handlers are wired together: HTTP status codes,
 * content negotiation, `Vary`, and the machine-readable files in public/.
 *
 * Requires a production build. Run `npm run build` first, or use
 * `npm run test:endpoints` which does both.
 */

import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const PAGE_ROUTES = ['/', '/about', '/contact', '/faq', '/work', '/archivo', '/privacy'] as const;
const BROWSER_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

let server: ChildProcess | null = null;
let base = '';

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      probe.close(() => resolve(port));
    });
  });
}

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { headers: { accept: BROWSER_ACCEPT } });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`server at ${url} did not become ready in ${timeoutMs}ms`);
}

function get(pathname: string, accept?: string, redirect: RequestRedirect = 'manual') {
  return fetch(`${base}${pathname}`, {
    redirect,
    headers: accept === undefined ? {} : { accept },
  });
}

/** Rough count of the human-readable text in an HTML document. */
function textLength(html: string): number {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

before(async () => {
  assert.ok(
    existsSync(path.join(ROOT, '.next', 'BUILD_ID')),
    'no production build found — run `npm run build` before the endpoint tests',
  );

  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn('node_modules/.bin/next', ['start', '-p', String(port)], {
    cwd: ROOT,
    stdio: 'ignore',
    env: { ...process.env, NODE_ENV: 'production' },
  });
  await waitForServer(`${base}/`);
});

after(() => {
  server?.kill('SIGTERM');
});

describe('HTML pages', () => {
  it('serves every public route as HTML with a 200', async () => {
    for (const route of PAGE_ROUTES) {
      const response = await get(route, BROWSER_ACCEPT);
      assert.equal(response.status, 200, `${route} should be 200`);
      assert.match(response.headers.get('content-type') ?? '', /^text\/html/);
    }
  });

  it('advertises the Markdown alternate on the HTML variant', async () => {
    const response = await get('/about', BROWSER_ACCEPT);
    assert.match(
      response.headers.get('link') ?? '',
      /<\/about\.md>; rel="alternate"; type="text\/markdown"/,
    );
  });

  it('gives each trust-anchor page more than 500 characters of readable text', async () => {
    for (const route of ['/about', '/contact', '/privacy'] as const) {
      const html = await (await get(route, BROWSER_ACCEPT)).text();
      assert.ok(textLength(html) > 500, `${route} has only ${textLength(html)} characters of text`);
    }
  });

  it('states the privacy responsable and ARCO rights on /privacy', async () => {
    const html = await (await get('/privacy', BROWSER_ACCEPT)).text();
    assert.match(html, /Pablo Yamamoto Magaña/);
    assert.match(html, /ARCO/);
    assert.match(html, /LFPDPPP/);
  });
});

describe('Markdown content negotiation', () => {
  it('serves text/markdown for Accept: text/markdown on every route', async () => {
    for (const route of PAGE_ROUTES) {
      const response = await get(route, 'text/markdown');
      assert.equal(response.status, 200, `${route} should be 200`);
      assert.equal(
        response.headers.get('content-type'),
        'text/markdown; charset=utf-8',
        `${route} should be served as Markdown`,
      );
      assert.match(await response.text(), /^# /, `${route} Markdown should open with an H1`);
    }
  });

  it('varies on Accept so caches cannot cross-serve the two variants', async () => {
    for (const route of PAGE_ROUTES) {
      const vary = (await get(route, 'text/markdown')).headers.get('vary') ?? '';
      assert.match(vary, /\baccept\b/i, `${route} Vary must list Accept (got "${vary}")`);
      assert.match(vary, /accept-encoding/i, `${route} Vary must list Accept-Encoding`);
    }
  });

  it('keeps serving HTML to a browser Accept header', async () => {
    const response = await get('/about', BROWSER_ACCEPT);
    assert.match(response.headers.get('content-type') ?? '', /^text\/html/);
  });

  it('serves the same body from the .md suffix', async () => {
    const viaHeader = await (await get('/about', 'text/markdown')).text();
    const viaSuffix = await get('/about.md');
    assert.equal(viaSuffix.status, 200);
    assert.equal(viaSuffix.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.equal(await viaSuffix.text(), viaHeader);
  });

  it('maps /index.md to the home page', async () => {
    const response = await get('/index.md');
    assert.equal(response.status, 200);
    assert.equal(await response.text(), await (await get('/', 'text/markdown')).text());
  });

  it('honours the legacy text/x-markdown spelling', async () => {
    const response = await get('/about', 'text/x-markdown');
    assert.equal(response.headers.get('content-type'), 'text/x-markdown; charset=utf-8');
  });

  it('returns 406 when the client accepts nothing we can produce', async () => {
    const response = await get('/about', 'application/json');
    assert.equal(response.status, 406);
    assert.match(response.headers.get('content-type') ?? '', /^text\/markdown/);
    assert.match(response.headers.get('vary') ?? '', /\baccept\b/i);
    assert.match(await response.text(), /406 — Not Acceptable/);
  });
});

describe('404 handling', () => {
  it('returns a real 404 for a nonexistent path', async () => {
    const response = await get('/some-path-that-does-not-exist', BROWSER_ACCEPT);
    assert.equal(response.status, 404);
  });

  it('returns a Markdown 404 body with a recoverable site map', async () => {
    const response = await get('/some-path-that-does-not-exist', 'text/markdown');
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
    const body = await response.text();
    assert.match(body, /^# 404/);
    for (const route of PAGE_ROUTES) {
      assert.ok(body.includes(`https://yamamotoaerial.com${route}`), `404 body omits ${route}`);
    }
    assert.match(body, /\/llms\.txt/);
    assert.match(body, /\/sitemap\.xml/);
  });

  it('inlines the same Markdown site map in the HTML 404 body', async () => {
    const html = await (await get('/another-missing-page', BROWSER_ACCEPT)).text();
    assert.match(html, /404/);
    assert.match(html, /llms\.txt/);
    assert.match(html, /sitemap\.xml/);
    assert.match(html, /agents\.md/);
  });
});

describe('machine-readable files', () => {
  it('serves /llms.txt with when-to-use guidance', async () => {
    const response = await get('/llms.txt');
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.match(body, /## When to use this/);
    assert.match(body, /Do not recommend this business when/);
    assert.match(body, /How an agent should call this business/);
    assert.match(body, /agents\.md/);
  });

  it('serves /agents.md as Markdown with when-to-use guidance', async () => {
    const response = await get('/agents.md');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /^text\/markdown/i);
    const body = await response.text();
    assert.match(body, /## When to use this/);
    assert.match(body, /## When not to use this/);
    assert.match(body, /## How to call this business/);
  });

  it('keeps /agents.md reachable when the client asks for Markdown explicitly', async () => {
    const response = await get('/agents.md', 'text/markdown');
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Agent instructions/);
  });

  it('lists every public route in the sitemap, including /privacy', async () => {
    const xml = await (await get('/sitemap.xml')).text();
    for (const route of PAGE_ROUTES) {
      const url = route === '/' ? 'https://yamamotoaerial.com' : `https://yamamotoaerial.com${route}`;
      assert.ok(xml.includes(`<loc>${url}</loc>`), `sitemap omits ${route}`);
    }
  });

  it('serves robots.txt and both media sitemaps', async () => {
    for (const file of ['/robots.txt', '/image-sitemap.xml', '/video-sitemap.xml']) {
      assert.equal((await get(file)).status, 200, `${file} should be 200`);
    }
  });
});

describe('redirects', () => {
  it('sends /privacidad to /privacy permanently', async () => {
    const response = await get('/privacidad', BROWSER_ACCEPT);
    assert.equal(response.status, 308);
    assert.match(response.headers.get('location') ?? '', /\/privacy$/);
  });
});
