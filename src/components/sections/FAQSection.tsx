'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FAQ_ITEMS, EASE } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!answerRef.current) return;

    if (isOpen) {
      gsap.to(answerRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.5,
        ease: EASE.smooth,
      });
    } else {
      gsap.to(answerRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    }
  }, [isOpen]);

  return (
    <div
      className="faq-item border-b border-[var(--glass-border)] transition-colors duration-300"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors duration-300 hover:text-[var(--color-accent)]"
        data-cursor-text={isOpen ? 'Cerrar' : 'Abrir'}
      >
        <span className="text-base font-medium lg:text-lg">{item.question}</span>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] transition-all duration-300"
          style={{
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            borderColor: isOpen ? 'var(--color-accent)' : undefined,
            color: isOpen ? 'var(--color-accent)' : undefined,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
        </span>
      </button>
      <div ref={answerRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
        <p className="pb-6 pr-12 text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.faq-heading', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: EASE.smooth,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });

      gsap.from('.faq-item', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: EASE.smooth,
        scrollTrigger: {
          trigger: '.faq-list',
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative py-[var(--section-padding)]"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, rgba(0,212,255,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="container-custom relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          {/* Left column — heading */}
          <div className="faq-heading">
            <p className="section-label">FAQ</p>
            <h2
              className="text-[var(--text-h2)] font-bold uppercase leading-tight"
              style={{ fontFamily: 'var(--font-clash)' }}
            >
              Preguntas{' '}
              <span className="text-gradient">frecuentes</span>
            </h2>
            <p className="mt-6 text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
              Todo lo que necesitas saber antes de volar. Si no encuentras la respuesta
              que buscas, no dudes en contactarme.
            </p>
          </div>

          {/* Right column — accordion */}
          <div className="faq-list border-t border-[var(--glass-border)]">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
