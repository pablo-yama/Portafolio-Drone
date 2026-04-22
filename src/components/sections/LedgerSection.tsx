'use client';

import { useEffect, useRef } from 'react';
import { CountUp } from '@/components/ui/CountUp';

interface LedgerCard {
  k: string;
  count: number;
  unit: string;
  note: string;
}

const CARDS: LedgerCard[] = [
  { k: 'Proyectos realizados', count: 10, unit: '+', note: 'Registro 2016 — hoy' },
  { k: 'Clientes', count: 10, unit: '·', note: 'Agencias, devs, marcas' },
  { k: 'Años de operación', count: 10, unit: '·', note: 'Cero incidentes' },
  { k: 'Horas de vuelo', count: 300, unit: 'h', note: 'Documentadas en bitácora' },
];

/**
 * LedgerSection — 4-card operational ledger with per-card 3D tilt + spotlight.
 *
 * Each card tracks the cursor: rotateY/X pan with the pointer, and a radial
 * spotlight (`--mx`, `--my`) follows it.
 */
export function LedgerSection() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll<HTMLDivElement>('.led');
    if (!cards) return;

    const cleanups: Array<() => void> = [];
    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.transform = `rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 8}deg) translateZ(0)`;
        card.style.setProperty('--mx', x * 100 + '%');
        card.style.setProperty('--my', y * 100 + '%');
      };
      const onLeave = () => {
        card.style.transform = '';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="ledger">
      <h2>
        Bitácora <span className="b">en</span> números.
      </h2>
      <div className="led-grid" ref={gridRef}>
        {CARDS.map((c) => (
          <div className="led" key={c.k}>
            <div className="glow" />
            <span className="k">{c.k}</span>
            <div>
              <CountUp className="n" target={c.count} />
              <span className="unit">{c.unit}</span>
            </div>
            <span className="note">{c.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
