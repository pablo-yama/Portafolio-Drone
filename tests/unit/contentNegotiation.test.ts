/**
 * Unit tests for the Accept-header parser and the proactive content
 * negotiation used by src/proxy.ts.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  contentTypeFor,
  negotiate,
  parseAccept,
  qualityFor,
} from '@/lib/contentNegotiation';

describe('parseAccept', () => {
  it('returns an empty list for a missing or blank header', () => {
    assert.deepEqual(parseAccept(null), []);
    assert.deepEqual(parseAccept(undefined), []);
    assert.deepEqual(parseAccept(''), []);
  });

  it('sorts by q value, descending', () => {
    const ranges = parseAccept('text/html;q=0.3, text/markdown;q=0.9, text/plain;q=0.5');
    assert.deepEqual(
      ranges.map((r) => `${r.type}/${r.subtype}`),
      ['text/markdown', 'text/plain', 'text/html'],
    );
  });

  it('breaks q ties by specificity, then by original order', () => {
    const ranges = parseAccept('*/*, text/*, text/markdown');
    assert.deepEqual(
      ranges.map((r) => `${r.type}/${r.subtype}`),
      ['text/markdown', 'text/*', '*/*'],
    );
  });

  it('treats a media-type parameter as more specific than a bare type', () => {
    const ranges = parseAccept('text/markdown, text/markdown;variant=GFM');
    assert.equal(`${ranges[0].type}/${ranges[0].subtype}`, 'text/markdown');
    assert.equal(ranges[0].specificity, 4);
  });

  it('defaults a missing or malformed q to 1 and clamps out-of-range values', () => {
    assert.equal(parseAccept('text/html')[0].q, 1);
    assert.equal(parseAccept('text/html;q=bogus')[0].q, 1);
    assert.equal(parseAccept('text/html;q=7')[0].q, 1);
    assert.equal(parseAccept('text/html;q=-3')[0].q, 0);
  });

  it('does not split on a comma inside a quoted parameter', () => {
    const ranges = parseAccept('text/markdown;variant="a,b", text/html');
    assert.equal(ranges.length, 2);
    assert.deepEqual(
      ranges.map((r) => `${r.type}/${r.subtype}`).sort(),
      ['text/html', 'text/markdown'],
    );
  });

  it('ignores entries that are not a media range', () => {
    assert.deepEqual(parseAccept('text, , /plain, text/html').map((r) => r.subtype), ['html']);
  });

  it('lowercases the media range', () => {
    const [range] = parseAccept('TEXT/MarkDown');
    assert.equal(`${range.type}/${range.subtype}`, 'text/markdown');
  });
});

describe('qualityFor', () => {
  it('treats an absent Accept header as accepting everything', () => {
    assert.equal(qualityFor(parseAccept(null), 'text/html'), 1);
    assert.equal(qualityFor(parseAccept(null), 'text/markdown'), 1);
  });

  it('uses the most specific matching range, not the first', () => {
    const ranges = parseAccept('*/*;q=0.1, text/*;q=0.5, text/markdown;q=0.9');
    assert.equal(qualityFor(ranges, 'text/markdown'), 0.9);
    assert.equal(qualityFor(ranges, 'text/plain'), 0.5);
    assert.equal(qualityFor(ranges, 'application/pdf'), 0.1);
  });

  it('reports 0 for a type the header excludes', () => {
    assert.equal(qualityFor(parseAccept('application/json'), 'text/html'), 0);
    assert.equal(qualityFor(parseAccept('*/*, text/html;q=0'), 'text/html'), 0);
  });
});

describe('negotiate', () => {
  it('serves HTML to a browser', () => {
    const browser = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
    assert.deepEqual(negotiate(browser), { mediaType: 'text/html', markdown: false });
  });

  it('serves HTML when no Accept header is sent', () => {
    assert.deepEqual(negotiate(null), { mediaType: 'text/html', markdown: false });
  });

  it('serves HTML for a bare wildcard, the default of most HTTP clients', () => {
    assert.deepEqual(negotiate('*/*'), { mediaType: 'text/html', markdown: false });
  });

  it('serves Markdown for the acceptmarkdown.com request', () => {
    assert.deepEqual(negotiate('text/markdown'), {
      mediaType: 'text/markdown',
      markdown: true,
    });
  });

  it('serves Markdown when it outranks HTML on q value', () => {
    assert.deepEqual(negotiate('text/markdown;q=1.0, text/html;q=0.5'), {
      mediaType: 'text/markdown',
      markdown: true,
    });
  });

  it('serves HTML when HTML ties with Markdown, so browsers never regress', () => {
    assert.deepEqual(negotiate('text/markdown, text/html'), {
      mediaType: 'text/html',
      markdown: false,
    });
  });

  it('accepts the legacy text/x-markdown spelling', () => {
    assert.deepEqual(negotiate('text/x-markdown'), {
      mediaType: 'text/x-markdown',
      markdown: true,
    });
  });

  it('treats text/plain as a Markdown-family request', () => {
    assert.deepEqual(negotiate('text/plain'), {
      mediaType: 'text/plain',
      markdown: true,
    });
  });

  it('returns no media type when nothing on offer is acceptable', () => {
    assert.deepEqual(negotiate('application/json'), { mediaType: null, markdown: false });
    assert.deepEqual(negotiate('image/png, application/pdf'), {
      mediaType: null,
      markdown: false,
    });
  });

  it('still serves HTML to a client that only accepts XHTML', () => {
    assert.deepEqual(negotiate('application/xhtml+xml'), {
      mediaType: 'application/xhtml+xml',
      markdown: false,
    });
  });
});

describe('contentTypeFor', () => {
  it('always names a charset', () => {
    assert.equal(contentTypeFor('text/markdown'), 'text/markdown; charset=utf-8');
    assert.equal(contentTypeFor('text/x-markdown'), 'text/x-markdown; charset=utf-8');
    assert.equal(contentTypeFor('text/plain'), 'text/plain; charset=utf-8');
    assert.equal(contentTypeFor('text/html'), 'text/html; charset=utf-8');
  });
});
