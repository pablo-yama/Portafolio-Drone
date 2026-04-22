'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface ArchiveEntry {
  idx: string;
  thumb: string; // class t1..t8 (fallback gradient)
  thumbUrl?: string; // preferred static image
  title: React.ReactNode;
  cat: string;
  loc: string;
  year: string;
}

const base = '/img/archivo';

const ENTRIES: ArchiveEntry[] = [
  { idx: '0037', thumb: 't7', thumbUrl: `${base}/estadio-gnp_deportes_guerrero_2026.jpg`,               title: (<>Estadio GNP · <em>Acapulco</em></>),        cat: 'Deportes',     loc: 'Guerrero', year: '2026' },
  { idx: '0032', thumb: 't3', thumbUrl: `${base}/bosques-lomas_real-estate_cdmx_2026.jpg`,              title: (<>Bosques de las <em>Lomas</em></>),          cat: 'Real Estate',  loc: 'CDMX',     year: '2026' },
  { idx: '0031', thumb: 't2', thumbUrl: `${base}/mitikah_arquitectura_cdmx_2025.jpg`,                   title: (<>Torres <em>Mitikah</em></>),                cat: 'Arquitectura', loc: 'CDMX',     year: '2025' },
  { idx: '0028', thumb: 't6', thumbUrl: `${base}/aztlan-rueda_eventos_cdmx_2025.jpg`,                   title: (<>Aztlán · <em>rueda</em></>),                cat: 'Eventos',      loc: 'CDMX',     year: '2025' },
  { idx: '0023', thumb: 't1', thumbUrl: `${base}/reforma-bbva_urbanismo_cdmx_2024.jpg`,                 title: (<>Paseo de la <em>Reforma</em></>),           cat: 'Urbanismo',    loc: 'CDMX',     year: '2024' },
  { idx: '0018', thumb: 't2', thumbUrl: `${base}/castillo-chapultepec-top_arquitectura_cdmx_2024.jpg`,  title: (<>Castillo de <em>Chapultepec</em></>),       cat: 'Arquitectura', loc: 'CDMX',     year: '2024' },
  { idx: '0016', thumb: 't6', thumbUrl: `${base}/parque-acuatico_eventos_morelos_2024.jpg`,             title: (<>Parque <em>Acuático</em></>),               cat: 'Eventos',      loc: 'Morelos',  year: '2024' },
  { idx: '0013', thumb: 't2', thumbUrl: `${base}/soumaya_arquitectura_cdmx_2023.jpg`,                   title: (<>Museo <em>Soumaya</em></>),                 cat: 'Arquitectura', loc: 'CDMX',     year: '2023' },
];

/**
 * ArchiveSection — tabular flight log with per-row hover 3D tilt + preview.
 *
 * Rows fade/slide in with a staggered delay as they enter the viewport.
 * On hover, the thumb tilts with mouse position (rotateY + rotateX) and a
 * 320×200 preview pane floats out to the right of the row.
 */
export function ArchiveSection() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const rows = listRef.current.querySelectorAll<HTMLDivElement>('.arch-row');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.transitionDelay = (i % 6) * 40 + 'ms';
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    rows.forEach((r) => io.observe(r));

    const listeners: Array<() => void> = [];
    rows.forEach((row) => {
      const thumb = row.querySelector<HTMLElement>('.thumb');
      const preview = row.querySelector<HTMLElement>('.preview');
      const onMove = (e: MouseEvent) => {
        const r = row.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        if (thumb) {
          thumb.style.transform = `scale(1.06) rotateY(${(x - 0.5) * 24}deg) rotateX(${(0.5 - y) * 18}deg)`;
        }
        if (preview) {
          preview.style.left =
            Math.min(r.width - 340, Math.max(180, e.clientX - r.left + 20)) + 'px';
        }
      };
      const onLeave = () => {
        if (thumb) thumb.style.transform = '';
      };
      row.addEventListener('mousemove', onMove);
      row.addEventListener('mouseleave', onLeave);
      listeners.push(() => {
        row.removeEventListener('mousemove', onMove);
        row.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      io.disconnect();
      listeners.forEach((fn) => fn());
    };
  }, []);

  return (
    <section id="archive">
      <div className="section-head">
        <div className="idx">§ 01 / Archivo</div>
        <h2>
          Registros <span className="b">de</span> vuelo.
        </h2>
        <div className="meta">
          08 de 37 piezas
          <br />
          Últimos 24 meses
        </div>
      </div>

      <div className="archive" ref={listRef}>
        <div className="arch-head">
          <span>#</span>
          <span>Frame</span>
          <span>Proyecto</span>
          <span>Categoría</span>
          <span>Ubicación</span>
          <span>Año</span>
          <span>&nbsp;</span>
        </div>

        {ENTRIES.map((e) => {
          const bgStyle = e.thumbUrl ? { backgroundImage: `url(${e.thumbUrl})` } : undefined;
          return (
            <div className="arch-row" key={e.idx}>
              <span className="idx">{e.idx}</span>
              <div className="thumb-wrap">
                <div className={`thumb ${e.thumb}`} style={bgStyle} />
              </div>
              <div className="title">{e.title}</div>
              <span className="cat">{e.cat}</span>
              <span className="loc">{e.loc}</span>
              <span className="year">{e.year}</span>
              <span className="cta">
                Ver <span>→</span>
              </span>
              <div className={`preview ${e.thumb}`} style={bgStyle} />
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Link href="/archivo" className="btn btn-out">
            Ver archivo completo · 37 piezas <span className="arr">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
