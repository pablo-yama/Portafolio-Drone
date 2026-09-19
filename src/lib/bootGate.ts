/**
 * bootGate — the beforeInteractive gate for the session-gated BootPreloader.
 *
 * Plain module WITHOUT 'use client' on purpose: src/app/layout.tsx (a Server
 * Component) must be able to read the string. Exports of a 'use client' module
 * become client references when imported from the server, so the string has to
 * live here. BootPreloader.tsx re-exports it for client-side consumers.
 *
 * What the script does (before hydration, on every page):
 *   · home + first visit of the session + no reduced motion
 *       → html[data-boot="pending"]  (chrome.css paints an opaque cover so the
 *         page never flashes before the overlay mounts; HudVideo attaches the
 *         hero src immediately when it sees the flag)
 *   · safety: if no boot UI has claimed the flag after 5 s (hydration failed,
 *     script blocked…) the flag is removed and the page is revealed.
 */
export const BOOT_SESSION_KEY = 'ya-boot';

export const BOOT_GATE_SCRIPT =
  "try{var d=document.documentElement;if(location.pathname==='/'&&sessionStorage.getItem('" +
  BOOT_SESSION_KEY +
  "')!=='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.boot='pending';" +
  "setTimeout(function(){if(d.dataset.boot==='pending'&&!d.dataset.bootUi){delete d.dataset.boot}},5000)}}catch(e){}";
