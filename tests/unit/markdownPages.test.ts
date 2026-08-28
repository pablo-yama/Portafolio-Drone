/**
 * Unit tests for the Markdown representations of the site's pages and for the
 * trust-anchor content those pages are built from.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  MARKDOWN_ROUTES,
  normalizeMarkdownPath,
  renderMarkdownPage,
  renderNotAcceptableMarkdown,
  renderNotFoundMarkdown,
} from '@/lib/markdownPages';
import { ABOUT_PAGE, AGENT_GUIDE, PRIVACY_POLICY } from '@/lib/constants';

/** Character count of the prose an agent or crawler would actually read. */
function proseLength(page: { lead: string; sections: readonly { heading: string; paragraphs?: readonly string[]; bullets?: readonly string[] }[] }): number {
  return page.sections.reduce(
    (total, section) =>
      total
      + section.heading.length
      + (section.paragraphs ?? []).join(' ').length
      + (section.bullets ?? []).join(' ').length,
    page.lead.length,
  );
}

describe('normalizeMarkdownPath', () => {
  it('resolves every known route to itself', () => {
    for (const route of MARKDOWN_ROUTES) {
      assert.equal(normalizeMarkdownPath(route), route);
    }
  });

  it('strips a .md suffix', () => {
    assert.equal(normalizeMarkdownPath('/about.md'), '/about');
    assert.equal(normalizeMarkdownPath('/privacy.md'), '/privacy');
  });

  it('maps the root aliases to /', () => {
    assert.equal(normalizeMarkdownPath('/'), '/');
    assert.equal(normalizeMarkdownPath('/index.md'), '/');
    assert.equal(normalizeMarkdownPath(''), '/');
  });

  it('ignores a trailing slash and letter case', () => {
    assert.equal(normalizeMarkdownPath('/about/'), '/about');
    assert.equal(normalizeMarkdownPath('/ABOUT'), '/about');
  });

  it('returns null for a path with no page', () => {
    assert.equal(normalizeMarkdownPath('/nope'), null);
    assert.equal(normalizeMarkdownPath('/agents.md'), null);
    assert.equal(normalizeMarkdownPath('/about/deeper'), null);
  });
});

describe('renderMarkdownPage', () => {
  it('renders every route in MARKDOWN_ROUTES', () => {
    for (const route of MARKDOWN_ROUTES) {
      const body = renderMarkdownPage(route);
      assert.ok(body, `expected Markdown for ${route}`);
      assert.match(body, /^# .+/, `${route} must open with an H1`);
      assert.ok(body.length > 400, `${route} Markdown looks too thin`);
    }
  });

  it('returns null for an unknown route', () => {
    assert.equal(renderMarkdownPage('/nope'), null);
  });

  it('links onward to the rest of the site and to the agent files', () => {
    const body = renderMarkdownPage('/about');
    assert.ok(body);
    assert.match(body, /## Mapa del sitio/);
    assert.match(body, /\/sitemap\.xml/);
    assert.match(body, /\/llms\.txt/);
    assert.match(body, /\/agents\.md/);
    // A page never links to itself in its own site map.
    assert.doesNotMatch(body, /\]\(https:\/\/[^)]*\/about\)/);
  });

  it('strips the inline HTML the archive titles carry for the rendered view', () => {
    const body = renderMarkdownPage('/archivo');
    assert.ok(body);
    assert.doesNotMatch(body, /<em>|<\/em>|<[a-z]+>/);
  });

  it('quotes real prices on the home page rather than a placeholder', () => {
    const body = renderMarkdownPage('/');
    assert.ok(body);
    assert.match(body, /\$4,500 MXN/);
    assert.match(body, /\$40,000 MXN/);
  });

  it('carries the when-to-use guidance agents need', () => {
    const body = renderMarkdownPage('/');
    assert.ok(body);
    assert.match(body, /## When to use this business/);
    for (const item of AGENT_GUIDE.useWhen) {
      assert.ok(body.includes(item), `home Markdown is missing: ${item.slice(0, 40)}…`);
    }
  });
});

describe('renderNotFoundMarkdown', () => {
  it('names every public route so an agent can recover in one request', () => {
    const body = renderNotFoundMarkdown('/typo');
    assert.match(body, /^# 404 — Página no encontrada/);
    assert.ok(body.includes('/typo'), 'echoes the path that was requested');
    for (const route of MARKDOWN_ROUTES) {
      assert.ok(body.includes(`](https://yamamotoaerial.com${route}`), `missing link to ${route}`);
    }
  });

  it('points at the machine-readable entry points', () => {
    const body = renderNotFoundMarkdown();
    assert.match(body, /\/sitemap\.xml/);
    assert.match(body, /\/llms\.txt/);
    assert.match(body, /\/agents\.md/);
    assert.match(body, /\/robots\.txt/);
  });

  it('stays short enough to be an error body', () => {
    assert.ok(renderNotFoundMarkdown().length < 2000);
  });
});

describe('renderNotAcceptableMarkdown', () => {
  it('echoes the rejected Accept header and lists what is on offer', () => {
    const body = renderNotAcceptableMarkdown('application/json');
    assert.match(body, /^# 406 — Not Acceptable/);
    assert.ok(body.includes('application/json'));
    assert.match(body, /text\/html/);
    assert.match(body, /text\/markdown/);
  });
});

/* The trust-anchor threshold AI crawlers check for is 500 characters of real
   content on each of /about, /contact and /privacy. */
describe('trust anchor content', () => {
  it('gives /about well over 500 characters of prose', () => {
    assert.ok(proseLength(ABOUT_PAGE) > 500, `about prose is ${proseLength(ABOUT_PAGE)} chars`);
  });

  it('gives /privacy well over 500 characters of prose', () => {
    assert.ok(proseLength(PRIVACY_POLICY) > 500, `privacy prose is ${proseLength(PRIVACY_POLICY)} chars`);
  });

  it('renders each trust-anchor page to more than 500 characters of Markdown', () => {
    for (const route of ['/about', '/contact', '/privacy'] as const) {
      const body = renderMarkdownPage(route);
      assert.ok(body && body.length > 500, `${route} Markdown is too short`);
    }
  });

  it('covers the LFPDPPP disclosures a Mexican privacy notice has to make', () => {
    const headings = PRIVACY_POLICY.sections.map((section) => section.heading).join(' | ');
    assert.match(headings, /Responsable/);
    assert.match(headings, /Datos personales/);
    assert.match(headings, /Finalidades/);
    assert.match(headings, /Transferencias/);
    assert.match(headings, /ARCO/);
    assert.match(headings, /Conservación/);
  });
});
