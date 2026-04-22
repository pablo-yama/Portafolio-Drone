'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import type {
  ArchiveEntry,
  ArchiveCategory,
} from '@/lib/archive';

type FilterKey = 'all' | ArchiveCategory;

interface CategoryChip {
  key: FilterKey;
  label: string;
  count: number;
}

interface ArchiveGridProps {
  entries: ArchiveEntry[];
  categories: CategoryChip[];
}

/**
 * ArchiveGrid — filter bar + grid/list switcher.
 *
 * All filtering happens in-memory against the prop `entries` — no network
 * calls on filter change, which keeps the interaction instant even on slow
 * connections. Cards fade in on mount using IntersectionObserver so offscreen
 * cards don't kick off their animation until the user scrolls near them.
 */
export function ArchiveGrid({ entries, categories }: ArchiveGridProps) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const gridRef = useRef<HTMLDivElement>(null);

  /** Strip <em> tags for the search haystack */
  const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const okCat = filter === 'all' || e.cat === filter;
      if (!okCat) return false;
      if (!q) return true;
      const hay = (
        stripTags(e.title) + ' ' + e.loc + ' ' + String(e.year) + ' ' + e.cat
      ).toLowerCase();
      return hay.includes(q);
    });
  }, [entries, filter, query]);

  /* Fade-in cards as they enter the viewport */
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll<HTMLElement>('.card');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.transitionDelay =
              (i % 9) * 40 + 'ms';
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px 0px' },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [filtered]);

  const isEmpty = filtered.length === 0;

  return (
    <>
      {/* ===== FILTER BAR ===== */}
      <div className="fbar">
        <div className="left">
          <span className="lbl">FILTRAR</span>
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`fb-chip${filter === c.key ? ' on' : ''}`}
              onClick={() => setFilter(c.key)}
            >
              {c.label} <span className="ct">{c.count}</span>
            </button>
          ))}
        </div>
        <div className="right">
          <input
            type="search"
            placeholder="BUSCAR PROYECTO"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar proyecto por nombre o ubicación"
          />
          <div className="view-toggle" role="tablist" aria-label="Vista">
            <button
              type="button"
              className={view === 'grid' ? 'on' : ''}
              onClick={() => setView('grid')}
              aria-selected={view === 'grid'}
            >
              ■ GRID
            </button>
            <button
              type="button"
              className={view === 'list' ? 'on' : ''}
              onClick={() => setView('list')}
              aria-selected={view === 'list'}
            >
              ☰ LIST
            </button>
          </div>
        </div>
      </div>

      {/* ===== GRID / LIST ===== */}
      <section className="grid-wrap">
        {view === 'grid' && (
          <div className="grid" ref={gridRef}>
            {filtered.map((it) => (
              <article
                key={it.id}
                className={`card fade${it.feat ? ' feat' : ''}`}
                data-cat={it.cat}
              >
                <div className="img">
                  <div
                    className={`bg ${it.thumb}`}
                    style={
                      it.thumbUrl
                        ? { backgroundImage: `url(${it.thumbUrl})` }
                        : undefined
                    }
                  />
                  <span className="idx">#{it.id}</span>
                  <span className="cat">{it.cat}</span>
                  <span className="fmt">{it.fmt}</span>
                  <div className="play" aria-hidden="true">
                    ▶
                  </div>
                </div>
                <div className="meta">
                  <div
                    className="title"
                    dangerouslySetInnerHTML={{ __html: it.title }}
                  />
                  <div className="info">
                    <span>{it.loc}</span>
                    <span>{it.year}</span>
                    {it.dur && <span>{it.dur}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {view === 'list' && (
          <div className="list active">
            <div className="l-head">
              <span>#</span>
              <span>Frame</span>
              <span>Proyecto</span>
              <span>Categoría</span>
              <span>Ubicación</span>
              <span>Año</span>
              <span>Formato</span>
              <span>Duración</span>
            </div>
            {filtered.map((it) => (
              <div className="l-row" key={it.id} data-cat={it.cat}>
                <span className="idx">#{it.id}</span>
                <div className="thumb">
                  <div
                    className={`bg ${it.thumb}`}
                    style={
                      it.thumbUrl
                        ? { backgroundImage: `url(${it.thumbUrl})` }
                        : undefined
                    }
                  />
                </div>
                <div
                  className="title"
                  dangerouslySetInnerHTML={{ __html: it.title }}
                />
                <span className="cat">{it.cat}</span>
                <span className="loc">{it.loc}</span>
                <span className="year">{it.year}</span>
                <span className="fmt">{it.fmt}</span>
                <span className="dur">{it.dur ?? '—'}</span>
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="empty show">Sin resultados en este filtro.</div>
        )}
      </section>
    </>
  );
}
