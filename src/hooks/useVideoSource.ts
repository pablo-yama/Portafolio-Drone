'use client';

import { useMemo, useSyncExternalStore } from 'react';

/**
 * useVideoSource — resolves which hero clip file to attach.
 *
 *  - `src` is null when the user prefers reduced motion or has data saver on
 *    (poster-only branch: HudVideo renders the 44px "▶ Reproducir" button).
 *  - 720p under 1024px, 1080p above.
 *  - Server + hydration snapshot: `{ src: null, isMobile: false, resolved: false }`
 *    — only treat `src === null` as poster-only once `resolved` is true.
 */
export type HeroClip = 'reforma' | 'bosques';

export interface VideoSource {
  src: string | null;
  isMobile: boolean;
  resolved: boolean;
}

export interface HeroClipAsset {
  poster: string;
  posterWebp: string;
  mp4: { 1080: string; 720: string };
  /** seconds */
  duration: number;
  width: number;
  height: number;
  /** Human label used by HUD stamps */
  label: string;
}

const BASE = '/videos/hero';

export const HERO_CLIPS: Record<HeroClip, HeroClipAsset> = {
  reforma: {
    poster: `${BASE}/reforma-poster.jpg`,
    posterWebp: `${BASE}/reforma-poster.webp`,
    mp4: { 1080: `${BASE}/reforma-1080.mp4`, 720: `${BASE}/reforma-720.mp4` },
    duration: 10,
    width: 1920,
    height: 1012,
    label: 'PASEO DE LA REFORMA · NOCTURNO',
  },
  bosques: {
    poster: `${BASE}/bosques-poster.jpg`,
    posterWebp: `${BASE}/bosques-poster.webp`,
    mp4: { 1080: `${BASE}/bosques-1080.mp4`, 720: `${BASE}/bosques-720.mp4` },
    duration: 10,
    width: 1920,
    height: 1012,
    label: 'BOSQUES DE LAS LOMAS · HORA DORADA',
  },
};

export const videoSrcFor = (clip: HeroClip, mobile: boolean): string =>
  HERO_CLIPS[clip].mp4[mobile ? 720 : 1080];

const MOBILE_QUERY = '(max-width: 1023px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

type NetworkNavigator = Navigator & { connection?: { saveData?: boolean } };

/** Snapshot encoded as a small string so uSES compares by value. */
const readState = (): string => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return '';
  const mobile = window.matchMedia(MOBILE_QUERY).matches;
  const reduced = window.matchMedia(REDUCED_QUERY).matches;
  let saveData = false;
  try {
    saveData = Boolean((navigator as NetworkNavigator).connection?.saveData);
  } catch {
    saveData = false;
  }
  return `${mobile ? 'm' : 'd'}${reduced || saveData ? '0' : '1'}`;
};

const subscribe = (onChange: () => void): (() => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const a = window.matchMedia(MOBILE_QUERY);
  const b = window.matchMedia(REDUCED_QUERY);
  a.addEventListener('change', onChange);
  b.addEventListener('change', onChange);
  const conn = (navigator as NetworkNavigator).connection as EventTarget | undefined;
  conn?.addEventListener?.('change', onChange);
  return () => {
    a.removeEventListener('change', onChange);
    b.removeEventListener('change', onChange);
    conn?.removeEventListener?.('change', onChange);
  };
};

const getServerSnapshot = () => '';

export function useVideoSource(clip: HeroClip): VideoSource {
  const state = useSyncExternalStore(subscribe, readState, getServerSnapshot);
  return useMemo<VideoSource>(() => {
    if (state === '') return { src: null, isMobile: false, resolved: false };
    const isMobile = state[0] === 'm';
    const allowed = state[1] === '1';
    return { src: allowed ? videoSrcFor(clip, isMobile) : null, isMobile, resolved: true };
  }, [state, clip]);
}
