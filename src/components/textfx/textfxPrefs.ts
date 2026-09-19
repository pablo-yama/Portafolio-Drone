'use client';

import { useSyncExternalStore } from 'react';

/**
 * Package-local motion preferences for the TextFX primitives.
 * Mirrors the shape of WP1's `useMotionPrefs` (reduced / finePointer / saveData)
 * so the two can be swapped later without touching call sites.
 *
 * Everything is read through `useSyncExternalStore`: no setState in effects,
 * server snapshot = all false (SSR renders the plain, final text).
 */

export interface TextFxPrefs {
  reduced: boolean;
  finePointer: boolean;
  saveData: boolean;
}

const SERVER_PREFS: TextFxPrefs = { reduced: false, finePointer: false, saveData: false };

const REDUCED_Q = '(prefers-reduced-motion: reduce)';
const FINE_Q = '(hover: hover) and (pointer: fine)';

interface NetworkInformationLike {
  saveData?: boolean;
}

const hasWindow = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

export const prefersReducedMotion = (): boolean =>
  hasWindow() ? window.matchMedia(REDUCED_Q).matches : false;

export const isFinePointer = (): boolean =>
  hasWindow() ? window.matchMedia(FINE_Q).matches : false;

export const isSaveData = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return Boolean(conn?.saveData);
};

/* Snapshot cache so useSyncExternalStore receives a stable reference per state */
let cached: TextFxPrefs = SERVER_PREFS;

const readPrefs = (): TextFxPrefs => {
  const next: TextFxPrefs = {
    reduced: prefersReducedMotion(),
    finePointer: isFinePointer(),
    saveData: isSaveData(),
  };
  if (
    next.reduced !== cached.reduced ||
    next.finePointer !== cached.finePointer ||
    next.saveData !== cached.saveData
  ) {
    cached = next;
  }
  return cached;
};

const subscribe = (onChange: () => void) => {
  if (!hasWindow()) return () => {};
  const queries = [window.matchMedia(REDUCED_Q), window.matchMedia(FINE_Q)];
  queries.forEach((q) => q.addEventListener('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener('change', onChange));
};

const getServerSnapshot = () => SERVER_PREFS;

export function useTextFxPrefs(): TextFxPrefs {
  return useSyncExternalStore(subscribe, readPrefs, getServerSnapshot);
}

/** `true` once the component has hydrated on the client (server + hydration render → false). */
const noopSubscribe = () => () => {};
const clientTrue = () => true;
const serverFalse = () => false;

export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, clientTrue, serverFalse);
}
