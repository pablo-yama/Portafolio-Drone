/**
 * bootSignals — tiny promise-based handshake between the hero video and the
 * session-gated BootPreloader (and anything that wants to wait for the
 * curtain to open before starting its own choreography).
 *
 *   HudVideo (hero)  ──loadedmetadata──▶ markHeroReady()
 *   BootPreloader    ──await whenHeroReady(1500)── 30% of the boot progress
 *   BootPreloader    ──curtain done──▶ markBootDone()
 *   Hero entrance    ──await whenBootDone()── SplitReveal / HUD draw-in
 *
 * Plain module, no React, safe to import from server files (no window access
 * at module scope).
 */

type Deferred = { promise: Promise<void>; resolve: () => void; done: boolean };

const createDeferred = (): Deferred => {
  let resolve: () => void = () => {};
  const d: Deferred = {
    done: false,
    resolve: () => {},
    promise: new Promise<void>((r) => {
      resolve = r;
    }),
  };
  d.resolve = () => {
    if (d.done) return;
    d.done = true;
    resolve();
  };
  return d;
};

const heroReady = createDeferred();
const bootDone = createDeferred();

const withTimeout = (p: Promise<void>, ms: number): Promise<void> => {
  if (!Number.isFinite(ms) || ms <= 0) return p;
  return new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    p.then(() => {
      clearTimeout(t);
      resolve();
    });
  });
};

/** Call once the hero video has metadata (or whenever the hero is "ready enough"). */
export function markHeroReady(): void {
  heroReady.resolve();
}

export function isHeroReady(): boolean {
  return heroReady.done;
}

/** Resolves when the hero is ready or after `timeoutMs` — never rejects. */
export function whenHeroReady(timeoutMs = 1500): Promise<void> {
  return withTimeout(heroReady.promise, timeoutMs);
}

/** True while the beforeInteractive gate script has flagged a pending boot (home, first visit, no reduced motion). */
export function isBootPending(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.boot === 'pending';
}

/** Called by BootPreloader when the curtain has fully opened (or when it never mounts). */
export function markBootDone(): void {
  bootDone.resolve();
}

export function isBootDone(): boolean {
  return bootDone.done;
}

/**
 * Resolves when the preloader curtain has opened. If no boot gate is pending
 * (returning visitor, sub-page, reduced motion) it resolves on the next tick
 * so callers can `await` it unconditionally.
 */
export function whenBootDone(timeoutMs = 2500): Promise<void> {
  if (bootDone.done) return Promise.resolve();
  if (!isBootPending()) {
    bootDone.resolve();
    return Promise.resolve();
  }
  return withTimeout(bootDone.promise, timeoutMs);
}
