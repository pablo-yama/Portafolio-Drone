'use client';

import { useMemo, useSyncExternalStore } from 'react';

/**
 * useMotionPrefs — one subscription for every "how much motion can I afford"
 * question the premium sections ask: reduced motion, data saver, fine pointer,
 * desktop viewport. Backed by useSyncExternalStore so no state is set inside an
 * effect body (React 19 lint) and SSR/hydration render the same conservative
 * snapshot (`resolved: false`) — flip visuals only after `resolved` is true.
 */
export interface MotionPrefs {
  /** prefers-reduced-motion: reduce */
  reduced: boolean;
  /** navigator.connection.saveData */
  saveData: boolean;
  /** pointer: fine (mouse / trackpad) */
  finePointer: boolean;
  /** min-width: 1024px */
  desktop: boolean;
  /** false on the server and during hydration; true once the client snapshot is live */
  resolved: boolean;
}

const QUERIES = {
  reduced: '(prefers-reduced-motion: reduce)',
  finePointer: '(pointer: fine)',
  desktop: '(min-width: 1024px)',
} as const;

type NetworkNavigator = Navigator & { connection?: { saveData?: boolean } };

const BIT = { reduced: 1, saveData: 2, finePointer: 4, desktop: 8, resolved: 16 } as const;

const SERVER_SNAPSHOT: MotionPrefs = {
  reduced: false,
  saveData: false,
  finePointer: false,
  desktop: false,
  resolved: false,
};

const readSaveData = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  try {
    return Boolean((navigator as NetworkNavigator).connection?.saveData);
  } catch {
    return false;
  }
};

/** Bit-packed snapshot so useSyncExternalStore compares a primitive. */
const readBits = (): number => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 0;
  let bits = BIT.resolved;
  if (window.matchMedia(QUERIES.reduced).matches) bits |= BIT.reduced;
  if (readSaveData()) bits |= BIT.saveData;
  if (window.matchMedia(QUERIES.finePointer).matches) bits |= BIT.finePointer;
  if (window.matchMedia(QUERIES.desktop).matches) bits |= BIT.desktop;
  return bits;
};

const unpack = (bits: number): MotionPrefs => ({
  reduced: (bits & BIT.reduced) !== 0,
  saveData: (bits & BIT.saveData) !== 0,
  finePointer: (bits & BIT.finePointer) !== 0,
  desktop: (bits & BIT.desktop) !== 0,
  resolved: (bits & BIT.resolved) !== 0,
});

const subscribe = (onChange: () => void): (() => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const lists = Object.values(QUERIES).map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener('change', onChange));
  const conn = (navigator as NetworkNavigator).connection as
    | (EventTarget & { saveData?: boolean })
    | undefined;
  conn?.addEventListener?.('change', onChange);
  return () => {
    lists.forEach((l) => l.removeEventListener('change', onChange));
    conn?.removeEventListener?.('change', onChange);
  };
};

const getServerSnapshot = () => 0;

/** Imperative read — safe inside effects and event handlers. */
export function getMotionPrefs(): MotionPrefs {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  return unpack(readBits());
}

export function useMotionPrefs(): MotionPrefs {
  const bits = useSyncExternalStore(subscribe, readBits, getServerSnapshot);
  return useMemo(() => (bits === 0 ? SERVER_SNAPSHOT : unpack(bits)), [bits]);
}
