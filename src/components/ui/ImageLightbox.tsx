'use client';

import { useEffect, useId } from 'react';

interface LightboxImage {
  src: string;
  alt: string;
  title?: string;
  meta?: string;
}

interface ImageLightboxProps {
  image: LightboxImage | null;
  onClose: () => void;
}

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  const titleId = useId();

  useEffect(() => {
    if (!image) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <button
        type="button"
        className="image-lightbox__close"
        aria-label="Cerrar imagen ampliada"
        onClick={onClose}
      >
        ×
      </button>
      <figure
        className="image-lightbox__figure"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} className="image-lightbox__image" />
        {(image.title || image.meta) && (
          <figcaption className="image-lightbox__caption">
            {image.title && <span id={titleId}>{image.title}</span>}
            {image.meta && <small>{image.meta}</small>}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
