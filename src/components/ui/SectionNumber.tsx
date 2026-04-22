'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionNumberProps {
  /** Two-digit section index, e.g. "01" */
  index: string;
  /** Uppercase label, e.g. "SERVICIOS" */
  label: string;
  /** Optional sub-label for extra context, e.g. "3 PAQUETES" */
  meta?: string;
  /** Optional alignment — defaults to left */
  align?: 'left' | 'right';
}

/**
 * SectionNumber — monospace index + label stamp that sits at the top of each section.
 * Terminal-industrial aesthetic: `01 / SERVICIOS   ·   3 PAQUETES`.
 * Fades in from below when the section scrolls into view.
 */
export function SectionNumber({ index, label, meta, align = 'left' }: SectionNumberProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(rootRef.current!.children, {
        y: 16,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`mb-10 flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-muted)] ${
        align === 'right' ? 'justify-end' : ''
      }`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className="text-[var(--color-accent)]">{index}</span>
      <span className="h-px w-8 bg-[var(--glass-border)]" />
      <span>{label}</span>
      {meta && (
        <>
          <span className="opacity-40">·</span>
          <span className="opacity-70">{meta}</span>
        </>
      )}
    </div>
  );
}
