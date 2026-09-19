'use client';

import Image from 'next/image';
import {
  animate,
  m,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion';
import { memo, useCallback, useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import type { ArchiveEntry } from '@/lib/archive';
import { altFor, stampFor } from '@/lib/archiveStats';
import { titleToText } from '@/lib/archiveTitle';
import { HoverLetters, Scramble } from '@/components/textfx';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useSectionProgress } from '@/hooks/useSectionProgress';

/**
 * FilmStrip — the eight featured frames on a draggable, perspective film strip.
 *
 * Fine pointer: framer drag="x" with inertia; every frame recomputes rotateY /
 * scale from its position in the viewport (cover-flow) and skews with the
 * drag velocity. Coarse pointer: native scroll-snap (data-lenis-prevent).
 * Keyboard: ← → Home End on the focused region, plus 44px prev/next buttons.
 * Frames are buttons that open the shared-layout lightbox (`strip-${id}`).
 */
export interface FilmStripProps {
  frames: ArchiveEntry[];
  onOpen: (index: number, trigger: HTMLElement) => void;
}

interface StripLayout {
  vpW: number;
  frames: { left: number; width: number }[];
}

const EMPTY_LAYOUT: StripLayout = { vpW: 0, frames: [] };
const EXPO = [0.16, 1, 0.3, 1] as const;
const STEP_SPRING = { type: 'spring', stiffness: 220, damping: 30 } as const;
const FALLBACK_STEP = 332;
const MAX_TILT = 28;
const MIN_SCALE = 0.94;
const GRIP_SCALE = 0.015;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const pad2 = (n: number) => String(n).padStart(2, '0');

interface FrameProps {
  entry: ArchiveEntry;
  index: number;
  total: number;
  x: MotionValue<number>;
  layout: MotionValue<StripLayout>;
  grip: MotionValue<number>;
  skewX: MotionValue<number>;
  enable3d: boolean;
  fadeOnly: boolean;
  suppressClick: RefObject<boolean>;
  onOpen: (index: number, trigger: HTMLElement) => void;
}

function Frame({
  entry,
  index,
  total,
  x,
  layout,
  grip,
  skewX,
  enable3d,
  fadeOnly,
  suppressClick,
  onOpen,
}: FrameProps) {
  /* Normalised distance of the frame centre from the viewport centre (−1 … 1). */
  const offset = useTransform(() => {
    const xv = x.get();
    const lay = layout.get();
    const f = lay.frames[index];
    if (!f || !lay.vpW) return 0;
    const centre = f.left + xv + f.width / 2 - lay.vpW / 2;
    return clamp(centre / lay.vpW, -1, 1);
  });
  const rotateY = useTransform(offset, (n) => n * MAX_TILT);
  const scale = useTransform([offset, grip], ([n, g]) => {
    const base = 1 - Math.abs(n as number) * (1 - MIN_SCALE);
    return base * (1 - (g as number) * GRIP_SCALE);
  });

  const title = titleToText(entry.title);

  return (
    <m.li
      className="frame"
      initial={fadeOnly ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: index * 0.06, duration: 0.9, ease: EXPO }}
    >
      <m.div className="frame-inner" style={enable3d ? { rotateY, scale, skewX } : undefined}>
        <button
          type="button"
          className={`frame-hit ${entry.thumb}`}
          aria-label={`Ampliar ${title}`}
          data-cursor-text="Ver"
          onClick={(e) => {
            if (suppressClick.current) return;
            onOpen(index, e.currentTarget);
          }}
        >
          <m.div className="frame-img" layoutId={`strip-${entry.id}`}>
            {entry.thumbUrl && (
              <Image
                src={entry.thumbUrl}
                alt={altFor(entry)}
                fill
                sizes="(max-width: 768px) 240px, 320px"
                draggable={false}
              />
            )}
          </m.div>
          <span className="frame-stamp">
            <HoverLetters text={stampFor(entry)} />
          </span>
          <span className="frame-num tnum" aria-hidden="true">
            {pad2(index + 1)} / {pad2(total)}
          </span>
        </button>
      </m.div>
    </m.li>
  );
}

function FilmStripBase({ frames, onOpen }: FilmStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const suppressClick = useRef(false);
  const releaseTimer = useRef(0);

  const { finePointer, reduced, resolved } = useMotionPrefs();
  const dragEnabled = resolved && finePointer;
  const native = resolved && !finePointer;
  const enable3d = dragEnabled && !reduced;

  /* Drag position + derived velocity skew (fine pointer, not reduced). */
  const x = useMotionValue(0);
  const vx = useVelocity(x);
  const skewRaw = useTransform(vx, [-1800, 1800], [2, -2]);
  const skewX = useSpring(skewRaw, { stiffness: 320, damping: 40, mass: 0.6 });

  /* 0 → 1 while the pointer holds the strip (frames settle slightly smaller). */
  const gripRaw = useMotionValue(0);
  const grip = useSpring(gripRaw, { stiffness: 300, damping: 30 });

  /* Layout measurements as a MotionValue so every frame's transform re-derives on resize. */
  const layout = useMotionValue<StripLayout>(EMPTY_LAYOUT);

  /* Sprocket rulers: half the drag travel + a scroll-scrubbed drift. */
  const progress = useSectionProgress(stripRef);
  const sprocketX = useTransform([x, progress], ([xv, p]) => (xv as number) * 0.5 - ((p as number) - 0.5) * 160);

  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;

    const measure = () => {
      const items = Array.from(track.children) as HTMLElement[];
      layout.set({
        vpW: vp.clientWidth,
        frames: items.map((el) => ({ left: el.offsetLeft, width: el.offsetWidth })),
      });
      const min = Math.min(0, vp.clientWidth - track.offsetWidth);
      if (x.get() < min) x.set(min);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    ro.observe(track);
    return () => ro.disconnect();
  }, [layout, x]);

  useEffect(() => () => window.clearTimeout(releaseTimer.current), []);

  const bounds = useCallback(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return 0;
    return Math.min(0, vp.clientWidth - track.offsetWidth);
  }, []);

  const stepSize = useCallback(() => {
    const L = layout.get();
    return L.frames.length > 1 ? L.frames[1].left - L.frames[0].left : FALLBACK_STEP;
  }, [layout]);

  const goTo = useCallback(
    (target: number) => {
      const vp = viewportRef.current;
      if (native) {
        vp?.scrollTo({ left: -target, behavior: reduced ? 'auto' : 'smooth' });
        return;
      }
      const next = clamp(target, bounds(), 0);
      if (reduced) {
        x.set(next);
        return;
      }
      animate(x, next, STEP_SPRING);
    },
    [native, reduced, bounds, x],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const vp = viewportRef.current;
      const size = stepSize();
      if (native) {
        vp?.scrollBy({ left: dir * size, behavior: reduced ? 'auto' : 'smooth' });
        return;
      }
      goTo(x.get() - dir * size);
    },
    [native, reduced, stepSize, goTo, x],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target !== e.currentTarget && !target.classList.contains('frame-hit')) return;
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        step(1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        step(-1);
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(bounds());
        break;
      default:
    }
  };

  const onDragStart = () => {
    window.clearTimeout(releaseTimer.current);
    suppressClick.current = true;
    gripRaw.set(1);
    if (trackRef.current) trackRef.current.style.willChange = 'transform';
  };
  const onDragEnd = () => {
    gripRaw.set(0);
    releaseTimer.current = window.setTimeout(() => {
      suppressClick.current = false;
    }, 80);
  };
  const onDragTransitionEnd = () => {
    if (trackRef.current) trackRef.current.style.willChange = '';
  };

  const total = frames.length;

  return (
    <div className="strip" ref={stripRef}>
      <div className="strip-bar">
        <div className="strip-label folio">
          <Scramble text={`Fotogramas · ${pad2(total)}`} />
          <span className="strip-hint" aria-hidden="true">
            {native ? 'Desliza' : 'Arrastra · ← →'}
          </span>
        </div>
        <div className="strip-nav">
          <button type="button" className="strip-btn" aria-label="Anterior" onClick={() => step(-1)}>
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" className="strip-btn" aria-label="Siguiente" onClick={() => step(1)}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <m.div className="strip-sprocket" aria-hidden="true" style={reduced ? undefined : { x: sprocketX }} />

      <div
        ref={viewportRef}
        className="strip-viewport"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Fotogramas destacados"
        tabIndex={0}
        data-cursor-text="Arrastra"
        data-native={native ? '1' : undefined}
        data-lenis-prevent={native ? '' : undefined}
        onKeyDown={onKeyDown}
      >
        <m.ul
          ref={trackRef}
          className="strip-track"
          drag={dragEnabled ? 'x' : false}
          dragConstraints={viewportRef}
          dragElastic={0.06}
          dragMomentum={!reduced}
          dragTransition={{ power: 0.35, timeConstant: 220 }}
          dragDirectionLock
          style={{ x }}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragTransitionEnd={onDragTransitionEnd}
        >
          {frames.map((entry, i) => (
            <Frame
              key={entry.id}
              entry={entry}
              index={i}
              total={total}
              x={x}
              layout={layout}
              grip={grip}
              skewX={skewX}
              enable3d={enable3d}
              fadeOnly={reduced}
              suppressClick={suppressClick}
              onOpen={onOpen}
            />
          ))}
        </m.ul>
      </div>

      <m.div className="strip-sprocket" aria-hidden="true" style={reduced ? undefined : { x: sprocketX }} />
    </div>
  );
}

export const FilmStrip = memo(FilmStripBase);
