'use client';

import { useEffect, useId, useRef } from 'react';
import { getLenis } from '@/lib/lenisStore';

interface LightboxImage { src: string; alt: string; title?: string; meta?: string; }
interface ImageLightboxProps { image: LightboxImage | null; onClose: () => void; }

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!image) return;
    const dialog = dialogRef.current;
    const trigger = document.activeElement as HTMLElement | null;
    const lenis = getLenis();
    const overflow = document.documentElement.style.overflow;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.dataset.lightbox = 'open';
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.documentElement.style.overflow = overflow;
      delete document.documentElement.dataset.lightbox;
      lenis?.start();
      trigger?.focus({ preventScroll: true });
    };
  }, [image]);
  if (!image) return null;
  return (
    <dialog ref={dialogRef} className="image-lightbox" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <button type="button" className="image-lightbox__close" aria-label="Cerrar imagen ampliada" onClick={onClose}>×</button>
      <figure className="image-lightbox__figure">
        {/* Full-resolution original, loaded only when the viewer opens. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} className="image-lightbox__image" />
        <figcaption className="image-lightbox__caption"><span id={titleId}>{image.title || image.alt}</span>{image.meta && <small>{image.meta}</small>}</figcaption>
      </figure>
    </dialog>
  );
}
