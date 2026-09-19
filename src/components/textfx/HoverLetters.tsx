import type { CSSProperties } from 'react';

export interface HoverLettersProps {
  /** Visible label (also the screen-reader text). */
  text: string;
  /** Optional different label on the alternate face (defaults to `text`). */
  alt?: string;
  as?: 'span' | 'div';
  className?: string;
}

const toChars = (s: string) => Array.from(s).map((c) => (c === ' ' ? ' ' : c));

/**
 * HoverLetters — two stacked copies of a label; on hover (fine pointer) the
 * chars flip up with a per-letter stagger (`--i`). The flip is triggered by the
 * element itself or its closest `a`, `button` or `[data-hl]` ancestor.
 * Server-renderable (no hooks); the whole effect lives in textfx.css.
 */
export function HoverLetters({ text, alt, as: Tag = 'span', className }: HoverLettersProps) {
  const face = (label: string, isAlt: boolean) => (
    <span className={isAlt ? 'hl-face hl-face--alt' : 'hl-face'} aria-hidden="true">
      {toChars(label).map((c, i) => (
        <span key={i} className="hl-ch" style={{ '--i': i } as CSSProperties}>
          {c}
        </span>
      ))}
    </span>
  );

  return (
    <Tag className={['hover-letters', className].filter(Boolean).join(' ')}>
      <span className="hl-sr">{text}</span>
      {face(text, false)}
      {face(alt ?? text, true)}
    </Tag>
  );
}
