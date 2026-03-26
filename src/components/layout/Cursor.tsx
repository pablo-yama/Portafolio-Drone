'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');

  useEffect(() => {
    if (!cursorRef.current || !cursorDotRef.current) return;

    // Check for touch device
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.6, ease: 'power3' });
    const dotXTo = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3' });
    const dotYTo = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3' });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      dotXTo(e.clientX);
      dotYTo(e.clientY);
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const text = target.dataset.cursorText || '';
      setIsHovering(true);
      setCursorText(text);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setCursorText('');
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor-hover], input, textarea'
    );
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Outer ring */}
      <div
        ref={cursorRef}
        className="custom-cursor pointer-events-none fixed top-0 left-0 z-[var(--z-cursor)] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      >
        <div
          className="flex items-center justify-center rounded-full border border-white/60 transition-all duration-300"
          style={{
            width: isHovering ? 80 : 32,
            height: isHovering ? 80 : 32,
          }}
        >
          {cursorText && (
            <span className="text-[10px] uppercase tracking-wider text-white">
              {cursorText}
            </span>
          )}
        </div>
      </div>

      {/* Inner dot */}
      <div
        ref={cursorDotRef}
        className="custom-cursor pointer-events-none fixed top-0 left-0 z-[var(--z-cursor)] -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="rounded-full bg-white transition-all duration-300"
          style={{
            width: isHovering ? 4 : 6,
            height: isHovering ? 4 : 6,
          }}
        />
      </div>
    </>
  );
}
