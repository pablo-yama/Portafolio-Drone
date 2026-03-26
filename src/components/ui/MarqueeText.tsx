'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MarqueeTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export function MarqueeText({ text, speed = 50, className = '' }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!innerRef.current) return;

    const inner = innerRef.current;
    const totalWidth = inner.scrollWidth / 2;

    gsap.set(inner, { x: 0 });
    gsap.to(inner, {
      x: -totalWidth,
      duration: totalWidth / speed,
      ease: 'none',
      repeat: -1,
    });
  }, [speed]);

  const repeatedText = `${text} ${text} ${text} ${text} `;

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div ref={innerRef} className="inline-flex">
        <span
          className="text-6xl font-bold uppercase tracking-wider text-[var(--color-text)] opacity-10 lg:text-8xl"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          {repeatedText}
        </span>
        <span
          className="text-6xl font-bold uppercase tracking-wider text-[var(--color-text)] opacity-10 lg:text-8xl"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
