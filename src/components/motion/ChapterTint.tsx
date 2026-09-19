'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

gsap.registerPlugin(ScrollTrigger);

/**
 * ChapterTint — shifts the page background per chapter as the reader scrolls.
 *
 * One ScrollTrigger per chapter element writes `--chapter-bg` on the target
 * (default <main>); premium-base.css paints `main { background-color:
 * var(--chapter-bg); transition: background-color .9s }` — the documented
 * solid-fill paint exception. Sections opt in with `data-chapter="<key>"` on
 * their root; well-known ids are auto-mapped as a fallback. Renders nothing.
 * Reduced motion: no triggers, variable cleared (static --bg).
 */
export type ChapterKey =
  | 'hero'
  | 'archive'
  | 'showreel'
  | 'pilot'
  | 'ledger'
  | 'route'
  | 'method'
  | 'rates'
  | 'uplink';

export const CHAPTER_BG: Record<ChapterKey, string> = {
  hero: '#0a0a0a',
  archive: '#0d0b09',
  showreel: '#070707',
  pilot: '#0e0d0b',
  ledger: '#0a0a0a',
  route: '#0b0b0d',
  method: '#0c0c0b',
  rates: '#0a0a0a',
  uplink: '#080808',
};

/** Element ids that map to a chapter when no data-chapter attribute is present. */
const ID_TO_CHAPTER: Record<string, ChapterKey> = {
  hero: 'hero',
  archive: 'archive',
  showreel: 'showreel',
  about: 'pilot',
  pilot: 'pilot',
  ledger: 'ledger',
  route: 'route',
  method: 'method',
  rates: 'rates',
  contact: 'uplink',
  uplink: 'uplink',
};

export interface ChapterTintProps {
  /** Override / extend the palette. */
  chapters?: Partial<Record<ChapterKey, string>>;
  /** Selector of the element that receives --chapter-bg (default 'main'). */
  target?: string;
}

let targetEl: HTMLElement | null = null;

const applyChapter = (el: HTMLElement, key: string, color: string) => {
  el.style.setProperty('--chapter-bg', color);
  el.dataset.chapter = key;
};

/** Imperative override (e.g. a lightbox wanting a darker plate). */
export function setChapter(key: ChapterKey | string, bg?: string): void {
  if (typeof document === 'undefined') return;
  const el = targetEl ?? document.querySelector<HTMLElement>('main');
  const color = bg ?? (key in CHAPTER_BG ? CHAPTER_BG[key as ChapterKey] : null);
  if (!el || !color) return;
  applyChapter(el, key, color);
}

const isChapterKey = (v: string): v is ChapterKey => v in CHAPTER_BG;

export function ChapterTint({ chapters, target = 'main' }: ChapterTintProps) {
  const { reduced } = useMotionPrefs();
  const paletteKey = chapters ? JSON.stringify(chapters) : '';

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    targetEl = el;

    if (reduced) {
      el.style.removeProperty('--chapter-bg');
      delete el.dataset.chapter;
      return;
    }

    const overrides = paletteKey ? (JSON.parse(paletteKey) as Partial<Record<ChapterKey, string>>) : {};
    const palette: Record<ChapterKey, string> = { ...CHAPTER_BG, ...overrides };

    const seen = new Set<Element>();
    const items: Array<{ node: HTMLElement; key: ChapterKey }> = [];
    document.querySelectorAll<HTMLElement>('[data-chapter]').forEach((node) => {
      const key = node.dataset.chapter ?? '';
      if (isChapterKey(key) && !seen.has(node)) {
        items.push({ node, key });
        seen.add(node);
      }
    });
    for (const [id, key] of Object.entries(ID_TO_CHAPTER)) {
      const node = document.getElementById(id);
      if (node && !seen.has(node)) {
        items.push({ node, key });
        seen.add(node);
      }
    }
    if (items.length === 0) return;
    items.sort((a, b) => (a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    const ctx = gsap.context(() => {
      items.forEach(({ node, key }) => {
        ScrollTrigger.create({
          trigger: node,
          start: 'top 60%',
          end: 'bottom 60%',
          onEnter: () => applyChapter(el, key, palette[key]),
          onEnterBack: () => applyChapter(el, key, palette[key]),
        });
      });
    });

    /* Initial state: whichever chapter straddles the 60% line right now. */
    const line = window.innerHeight * 0.6;
    let current: { node: HTMLElement; key: ChapterKey } | null = null;
    for (const item of items) {
      const r = item.node.getBoundingClientRect();
      if (r.top <= line) current = item;
    }
    if (current) applyChapter(el, current.key, palette[current.key]);

    return () => {
      ctx.revert();
      el.style.removeProperty('--chapter-bg');
      delete el.dataset.chapter;
      if (targetEl === el) targetEl = null;
    };
  }, [reduced, paletteKey, target]);

  return null;
}
