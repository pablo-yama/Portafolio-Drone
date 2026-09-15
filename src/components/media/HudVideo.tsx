'use client';

import Image from 'next/image';
import { m, type MotionStyle } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { HERO_CLIPS, useVideoSource, type HeroClip } from '@/hooks/useVideoSource';
import { isBootPending } from '@/lib/bootSignals';

/**
 * HudVideo — the poster-first background video plate used by the hero and
 * the showreel.
 *
 *  - The poster (next/image fill) is the LCP; the <video> never carries a src
 *    in the HTML. The src is attached by DOM mutation: after window 'load'
 *    (or an idle slice ≤2s) for `priority`, immediately when the boot
 *    preloader is pending, or when an IntersectionObserver with
 *    `lazyRootMargin` fires for lazy instances.
 *  - Playback is driven by visibility (`playAmount`); a rejected play()
 *    (iOS Low Power, data saver) sets data-standby and keeps the poster.
 *  - 'playing' → data-playing="1" (CSS fades the video in); 'loadedmetadata'
 *    → onReady (once). Both events also feed onPlayingChange.
 *  - `pauseControl` renders a 44×44 button with aria-pressed; a user pause
 *    is remembered (no auto-resume on re-entry).
 *  - Reduced motion / saveData (useVideoSource → null): no autoplay video,
 *    only a 44px "▶ Reproducir" button that mounts a native-controls player
 *    with the 720p clip on click.
 */
export interface HudVideoProps {
  clip: HeroClip;
  poster: string;
  priority?: boolean;
  lazyRootMargin?: string;
  playAmount?: number;
  objectPosition?: string;
  plateStyle?: MotionStyle;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onReady?: () => void;
  onPlayingChange?: (playing: boolean) => void;
  pauseControl?: boolean;
  className?: string;
  posterSizes?: string;
}

type CtlState = 'idle' | 'playing' | 'paused' | 'standby';

const CTL_TEXT: Record<CtlState, string> = {
  idle: 'PLAY',
  playing: 'PAUSA',
  paused: 'PLAY',
  standby: 'STANDBY',
};

export function HudVideo({
  clip,
  poster,
  priority = false,
  lazyRootMargin = '150% 0px',
  playAmount = 0.4,
  objectPosition = '50% 50%',
  plateStyle,
  videoRef,
  onReady,
  onPlayingChange,
  pauseControl = false,
  className,
  posterSizes = '100vw',
}: HudVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const attachedSrcRef = useRef<string | null>(null);
  const userPausedRef = useRef(false);
  const wantPlayRef = useRef(false);
  const readyFiredRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onPlayingChangeRef = useRef(onPlayingChange);

  const { src, resolved } = useVideoSource(clip);
  const posterOnly = resolved && src === null;

  const [ctl, setCtl] = useState<CtlState>('idle');
  const [manual, setManual] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
    onPlayingChangeRef.current = onPlayingChange;
  }, [onReady, onPlayingChange]);

  const setVideoEl = useCallback(
    (el: HTMLVideoElement | null) => {
      videoElRef.current = el;
      if (videoRef) videoRef.current = el;
    },
    [videoRef],
  );

  const tryPlay = useCallback(() => {
    const video = videoElRef.current;
    const root = rootRef.current;
    if (!video || !root || !attachedSrcRef.current || userPausedRef.current) return;
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.then(() => {
        delete root.dataset.standby;
      }).catch(() => {
        root.dataset.standby = '1';
        setCtl('standby');
        onPlayingChangeRef.current?.(false);
      });
    }
  }, []);

  const attachSrc = useCallback(
    (next: string) => {
      const video = videoElRef.current;
      const root = rootRef.current;
      if (!video || !root || attachedSrcRef.current === next) return;
      const resumeAt = video.currentTime;
      attachedSrcRef.current = next;
      video.muted = true;
      video.defaultMuted = true;
      video.src = next;
      video.load();
      if (resumeAt > 0) {
        try {
          video.currentTime = resumeAt;
        } catch {
          /* metadata not ready yet — ignore */
        }
      }
      root.dataset.attached = '1';
      if (wantPlayRef.current) tryPlay();
    },
    [tryPlay],
  );

  /* Source attachment: after load / idle (priority), now (boot pending), or near viewport (lazy). */
  useEffect(() => {
    if (!src || manual) return;
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    const attach = () => {
      if (!cancelled) attachSrc(src);
    };

    if (priority) {
      if (isBootPending() || document.readyState === 'complete') {
        const id = requestAnimationFrame(attach);
        return () => {
          cancelled = true;
          cancelAnimationFrame(id);
        };
      }
      window.addEventListener('load', attach, { once: true });
      const hasIdle = typeof window.requestIdleCallback === 'function';
      const idleId = hasIdle
        ? window.requestIdleCallback(attach, { timeout: 2000 })
        : window.setTimeout(attach, 2000);
      return () => {
        cancelled = true;
        window.removeEventListener('load', attach);
        if (hasIdle) window.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      };
    }

    if (typeof IntersectionObserver === 'undefined') {
      attach();
      return () => {
        cancelled = true;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          attach();
          io.disconnect();
        }
      },
      { rootMargin: lazyRootMargin },
    );
    io.observe(root);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [src, priority, lazyRootMargin, manual, attachSrc]);

  /* Visibility-driven playback. */
  useEffect(() => {
    if (!src || manual) return;
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const amount = Math.min(Math.max(playAmount, 0), 1);
    const thresholds = amount > 0 ? [0, amount] : [0];
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        const visible = entry.isIntersecting && entry.intersectionRatio >= amount;
        wantPlayRef.current = visible;
        const video = videoElRef.current;
        if (visible) tryPlay();
        else if (video && !video.paused) video.pause();
      },
      { threshold: thresholds },
    );
    io.observe(root);
    return () => {
      wantPlayRef.current = false;
      io.disconnect();
    };
  }, [src, manual, playAmount, tryPlay]);

  /* Video element events (re-bound when the manual player mounts). */
  useEffect(() => {
    const root = rootRef.current;
    const video = videoElRef.current;
    if (!root || !video) return;
    const onPlaying = () => {
      root.dataset.playing = '1';
      delete root.dataset.standby;
      setCtl('playing');
      onPlayingChangeRef.current?.(true);
    };
    const onPause = () => {
      setCtl(userPausedRef.current ? 'paused' : 'idle');
      onPlayingChangeRef.current?.(false);
    };
    const onMeta = () => {
      if (readyFiredRef.current) return;
      readyFiredRef.current = true;
      onReadyRef.current?.();
    };
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onMeta);
    if (manual) {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, [manual]);

  const onCtlClick = () => {
    const video = videoElRef.current;
    const root = rootRef.current;
    if (!video || !root) return;
    if (ctl === 'playing') {
      userPausedRef.current = true;
      video.pause();
      setCtl('paused');
      return;
    }
    userPausedRef.current = false;
    delete root.dataset.standby;
    if (!attachedSrcRef.current && src) attachSrc(src);
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        root.dataset.standby = '1';
        setCtl('standby');
      });
    }
  };

  const asset = HERO_CLIPS[clip];
  const cls = ['hv', className].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      className={cls}
      data-clip={clip}
      data-poster-only={posterOnly ? '1' : undefined}
    >
      <m.div className="hv-plate" style={plateStyle}>
        <Image
          src={poster}
          alt=""
          fill
          sizes={posterSizes}
          priority={priority}
          className="hv-poster"
          style={{ objectFit: 'cover', objectPosition }}
          draggable={false}
        />
        {!posterOnly && !manual && (
          <video
            ref={setVideoEl}
            className="hv-video"
            muted
            playsInline
            loop
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            tabIndex={-1}
            preload={priority ? 'metadata' : 'none'}
            style={{ objectPosition }}
          />
        )}
        {manual && (
          <video
            ref={setVideoEl}
            className="hv-video hv-video--manual"
            controls
            playsInline
            preload="metadata"
            src={asset.mp4[720]}
            poster={poster}
            aria-label={`Video: ${asset.label}`}
            style={{ objectPosition }}
          />
        )}
      </m.div>

      {posterOnly && !manual && (
        <button
          type="button"
          className="hv-play"
          onClick={() => setManual(true)}
          aria-label={`Reproducir video · ${asset.label}`}
        >
          <span className="hv-play-ic" aria-hidden="true">
            ▶
          </span>
          <span className="hv-play-txt">Reproducir</span>
        </button>
      )}

      {pauseControl && !posterOnly && !manual && (
        <button
          type="button"
          className="hv-ctl"
          onClick={onCtlClick}
          aria-pressed={ctl === 'paused'}
          aria-label={ctl === 'playing' ? 'Pausar video' : 'Reproducir video'}
          data-state={ctl}
        >
          <span className="hv-ctl-ic" aria-hidden="true" />
          <span className="hv-ctl-txt tnum">{CTL_TEXT[ctl]}</span>
        </button>
      )}
    </div>
  );
}
