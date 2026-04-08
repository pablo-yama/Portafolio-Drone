'use client';

import { useState, useEffect, useRef } from 'react';
import { media } from '@/lib/media';

const TIMEOUT_MS = 8000;

export function useAssetPreloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const loadedRef = useRef(0);
  const completeRef = useRef(false);

  useEffect(() => {
    const imageUrls = Object.values(media.images);
    const total = imageUrls.length;

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
