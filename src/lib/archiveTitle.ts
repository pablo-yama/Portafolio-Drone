import { createElement, Fragment, type ReactNode } from 'react';

/**
 * archiveTitle — ARCHIVE titles carry `<em>…</em>` for the italic beat
 * ("Museo <em>Soumaya</em>"). These helpers turn that string into React nodes
 * without dangerouslySetInnerHTML, or strip it for alt text / aria labels.
 */
const EM_SPLIT = /<em>(.*?)<\/em>/g;
const TAG_STRIP = /<[^>]+>/g;

export function titleToText(title: string): string {
  return title.replace(TAG_STRIP, '').replace(/\s+/g, ' ').trim();
}

export function titleToNodes(title: string): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of title.matchAll(EM_SPLIT)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(title.slice(last, start));
    nodes.push(createElement('em', { key: `em-${key++}` }, match[1]));
    last = start + match[0].length;
  }
  if (last < title.length) nodes.push(title.slice(last));
  if (nodes.length === 1 && typeof nodes[0] === 'string') return nodes[0];
  return createElement(Fragment, null, ...nodes);
}
