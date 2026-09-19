'use client';

import { useSyncExternalStore } from 'react';

/**
 * useMediaQuery — subscribes to a CSS media query without setting state inside
 * an effect (React 19 lint rule). SSR snapshot is `false`.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
