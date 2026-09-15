'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type PointerEvent } from 'react';
import { m, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { ARCHIVE, type ArchiveEntry } from '@/lib/archive';
import { titleToText } from '@/lib/archiveTitle';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { FilmStrip } from '@/components/archive/FilmStrip';
import { SplitReveal } from '@/components/textfx';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

const FEATURED_IDS = ['0023', '0037', '0032', '0013'];
const STRIP_IDS = ['0031', '0028', '0018', '0016'];
const selected = FEATURED_IDS.map(id => ARCHIVE.find(entry => entry.id === id)!);
const frames = STRIP_IDS.map(id => ARCHIVE.find(entry => entry.id === id)!);

function WorkCard({ entry, index, onOpen }: { entry: ArchiveEntry; index: number; onOpen: (entry: ArchiveEntry) => void }) {
  const ref = useRef<HTMLElement>(null);
  const { finePointer, reduced, desktop } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const parallax = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(mx, { stiffness: 150, damping: 24 });
  const rotateY = useSpring(my, { stiffness: 150, damping: 24 });
  const enabled = finePointer && !reduced;
  const title = titleToText(entry.title);

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((0.5 - (event.clientY - rect.top) / rect.height) * 6);
    my.set(((event.clientX - rect.left) / rect.width - 0.5) * 6);
  };

  return (
    <m.article ref={ref} className={`work-card work-card--${index + 1}`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.7 }}>
      <m.div className="work-depth" style={enabled ? { rotateX, rotateY } : undefined}>
        <button className="work-image" onClick={() => onOpen(entry)} onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0); }} onBlur={() => { mx.set(0); my.set(0); }} aria-label={`Ampliar ${title}`}>
          <m.div className="work-image-in" style={desktop && !reduced ? { y: parallax } : undefined}>
            <Image src={entry.thumbUrl!} alt={`${title}, fotografía aérea de ${entry.loc}`} fill sizes="(max-width: 760px) 100vw, 58vw" />
          </m.div>
          <span className="work-badge">{entry.cat}</span>
          <span className="work-view" aria-hidden="true">Ver imagen ↗</span>
        </button>
      </m.div>
      <div className="work-caption"><div><small>{String(index + 1).padStart(2, '0')} / {entry.loc} · {entry.year}</small><h3>{title}</h3></div><span className="work-arrow" aria-hidden="true">↗</span></div>
    </m.article>
  );
}

export function SelectedWork() {
  const [active, setActive] = useState<ArchiveEntry | null>(null);
  return (
    <section className="selected-work" id="archive" aria-labelledby="selected-title">
      <div className="selected-heading"><div><span className="editorial-label">02 — Archivo seleccionado</span><SplitReveal as="h2" id="selected-title" mode="words">El mundo. <br /><em>Otro punto de vista.</em></SplitReveal></div><Link href="/archivo" className="editorial-link">Ver las 37 piezas <span aria-hidden="true">↗</span></Link></div>
      <div className="work-grid">{selected.map((entry, index) => <WorkCard key={entry.id} entry={entry} index={index} onOpen={setActive} />)}</div>
      <FilmStrip frames={frames} onOpen={(index) => setActive(frames[index])} />
      <div className="archive-closing"><span>Cada vuelo, una historia distinta.</span><Link href="/archivo" className="editorial-link">Explorar el archivo completo ↗</Link></div>
      <ImageLightbox image={active ? { src: active.thumbUrl!, alt: titleToText(active.title), title: titleToText(active.title), meta: `${active.cat} · ${active.loc} · ${active.year}` } : null} onClose={() => setActive(null)} />
    </section>
  );
}
