'use client';

import { useSyncExternalStore } from 'react';
import type Lenis from 'lenis';

/**
 * lenisStore — the single Lenis instance, published by LenisProvider and read
 * by anything that needs to scrollTo / stop / start (template.tsx, lightbox,
 * mobile menu). An external store so components subscribe without effects.
 */
type Listener = (lenis: Lenis | null) => void;

let current: Lenis | null = null;
const listeners = new Set<Listener>();

export function setLenis(lenis: Lenis | null): void {
  if (current === lenis) return;
  current = lenis;
  listeners.forEach((cb) => cb(current));
}

export function getLenis(): Lenis | null {
  return current;
}

export function subscribeLenis(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const subscribe = (onChange: () => void) => subscribeLenis(() => onChange());
const getSnapshot = () => current;
const getServerSnapshot = (): Lenis | null => null;

/** Reactive access — re-renders when the instance is created or destroyed. */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
