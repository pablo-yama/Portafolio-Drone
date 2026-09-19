'use client';

import { useSyncExternalStore } from 'react';

/**
 * activeSection — which home chapter is under the reading line right now.
 *
 * `observeSections(ids)` mounts ONE IntersectionObserver whose root is shrunk
 * to a thin band around 45–50% of the viewport height; the last id (in the
 * order given) that intersects that band wins. NavBar reads it through
 * `useActiveSection()` for the layoutId indicator.
 */
type Listener = () => void;

let activeId: string | null = null;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((cb) => cb());

export function getActiveSection(): string | null {
  return activeId;
}

export function setActiveSection(id: string | null): void {
  if (activeId === id) return;
  activeId = id;
  emit();
}

export interface ObserveSectionsOptions {
  /** Default '-45% 0px -50% 0px' — a 5% band just above the viewport centre. */
  rootMargin?: string;
}

/**
 * Starts observing the given element ids. Returns a disconnect function; ids
 * that do not exist in the DOM are skipped (the hook tolerates sub-pages).
 */
export function observeSections(
  ids: string[],
  options: ObserveSectionsOptions = {},
): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }
  const { rootMargin = '-45% 0px -50% 0px' } = options;
  const order = ids.slice();
  const visible = new Map<string, boolean>();
  const elements: HTMLElement[] = [];

  const resolve = () => {
    let next: string | null = null;
    for (const id of order) {
      if (visible.get(id)) next = id;
    }
    setActiveSection(next);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        if (!id) continue;
        visible.set(id, entry.isIntersecting);
      }
      resolve();
    },
    { rootMargin, threshold: 0 },
  );

  for (const id of order) {
    const el = document.getElementById(id);
    if (!el) continue;
    elements.push(el);
    visible.set(id, false);
    io.observe(el);
  }

  return () => {
    io.disconnect();
    elements.length = 0;
    visible.clear();
    setActiveSection(null);
  };
}

const subscribe = (cb: Listener) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const getSnapshot = () => activeId;
const getServerSnapshot = (): string | null => null;

export function useActiveSection(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
