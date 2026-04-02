'use client';

import { useState, useEffect, useRef } from 'react';
import { media } from '@/lib/media';

const TIMEOUT_MS = 20000;

export function useAssetPreloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const loadedRef = useRef(0);
  const completeRef = useRef(false);

  useEffect(() => {
    const imageUrls = Object.values(media.images);
    const videoUrls = Object.values(media.videos);
    const total = imageUrls.length + videoUrls.length;

    if (total === 0) {
      setProgress(1);
      setIsComplete(true);
      return;
    }

    const update = () => {
      if (completeRef.current) return;
      loadedRef.current++;
      const p = loadedRef.current / total;
      setProgress(p);
      if (loadedRef.current >= total) {
        completeRef.current = true;
        setIsComplete(true);
      }
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.onload = update;
      img.onerror = update;
      img.src = url;
    });

    videoUrls.forEach((url) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const handler = () => {
        video.removeEventListener('canplay', handler);
        video.removeEventListener('error', handler);
        update();
      };
      video.addEventListener('canplay', handler);
      video.addEventListener('error', handler);
      video.src = url;
    });

    const timeout = setTimeout(() => {
      if (!completeRef.current) {
        completeRef.current = true;
        setProgress(1);
        setIsComplete(true);
      }
    }, TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, []);

  return { progress, isComplete };
}
