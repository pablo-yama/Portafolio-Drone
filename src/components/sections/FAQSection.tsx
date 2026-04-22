'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FAQ_ITEMS, EASE, DURATION } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

interface FAQItemProps {
  idx: string;
  item: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ idx, item, isOpen, onToggle }: FAQItemProps) {
  const answerRef = useRef<HTMLDivElement>(null);
  const panelId = `faq-panel-${idx}`;
  const buttonId = `faq-q-${idx}`;

  useEffect(() => {
    if (!answerRef.current) return;

    if (isOpen) {
      gsap.to(answerRef.current, {
        height: 'auto',
        opacity: 1,
        duration: DURATION.normal,
        ease: EASE.smooth,
      });
    } else {
      gsap.to(answerRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: EASE.cinematic,
      });
    }
  }, [isOpen]);

  return (
    <li className={`faq-row${isOpen ? ' open' : ''}`}>
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="faq-q"
        data-cursor-text={isOpen ? 'Cerrar' : 'Abrir'}
      >
        <span className="idx">§ {idx}</span>
        <span className="q">{item.question}</span>
        <span className="mk" aria-hidden="true">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          >
            <line x1="6" y1="1" x2="6" y2="11" />
            <line x1="1" y1="6" x2="11" y2="6" />
          </svg>
        </span>
      </button>
      <div
        ref={answerRef}
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-a"
        style={{ height: 0, opacity: 0 }}
      >
        <div className="faq-a-inner">
          <p>{item.answer}</p>
        </div>
      </div>
    </li>
  );
}

/**
 * FAQSection — editorial accordion in the Archive v2 language.
 *
 * Each row: mono `§ 0X` index · serif italic question · signal plus-marker.
 * Open state tints the row with a warm signal wash and lights a left rail.
 * Answers are indented under the question column and open with a GSAP
 * auto-height tween. Emits no FAQPage schema — that is handled in
 * `src/lib/jsonLd.ts` and injected by the /faq layout.
 */
export function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.faq-head', {
        y: 32,
        opacity: 0,
        duration: DURATION.slow,
        ease: EASE.smooth,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      });

      gsap.from('.faq-row', {
        y: 24,
        opacity: 0,
        duration: 0.55,
        stagger: 0.05,
        ease: EASE.smooth,
        scrollTrigger: {
          trigger: '.faq-list',
          start: 'top 82%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="faq">
      <div className="sect-top faq-head">
        <h2>
          Dudas frecuentes <span className="b">antes de volar.</span>
        </h2>
        <div className="faq-meta">
          § 07 / Preguntas
          <br />
          {String(FAQ_ITEMS.length).padStart(2, '0')} entradas
        </div>
      </div>

      <ol className="faq-list">
        {FAQ_ITEMS.map((item, i) => {
          const idx = String(i + 1).padStart(2, '0');
          return (
            <FAQItem
              key={idx}
              idx={idx}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          );
        })}
      </ol>

      <div className="faq-foot">
        <span>¿No encontraste tu respuesta? Cada proyecto es único.</span>
        <a href="/contact" data-cursor-text="Contactar">
          Escríbeme directo →
        </a>
      </div>
    </section>
  );
}
