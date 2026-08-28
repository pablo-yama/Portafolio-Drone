import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { DocumentBody } from '@/components/sections/DocumentBody';
import { ABOUT_PAGE } from '@/lib/constants';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="docpage">
        <header className="doc-top">
          <div className="kicker">
            <span>§ 02 / Piloto</span>
            <span className="slash">—</span>
            <span>Expediente</span>
          </div>
          <h1>
            Pablo <span className="b">Yamamoto</span>
          </h1>
          <p className="doc-sub">{ABOUT_PAGE.lead}</p>
          <div className="doc-meta">
            <span>
              <strong>Base</strong> · Polanco, CDMX
            </span>
            <span>
              <strong>Desde</strong> · 2016
            </span>
            <span>
              <strong>Horas de vuelo</strong> · 300+
            </span>
            <span>
              <strong>Incidentes</strong> · 0
            </span>
          </div>
        </header>

        <DocumentBody sections={ABOUT_PAGE.sections} />

        <div className="doc-body">
          <section>
            <h2>Trabajemos juntos</h2>
            <p>
              Si tienes un proyecto que necesita perspectiva aérea, escribe con la
              ubicación y la fecha tentativa y te regreso una cotización en menos de
              24 horas hábiles.
            </p>
            <div className="doc-cta">
              <Link className="btn btn-fill" href="/contact" data-cursor-text="Contactar">
                Cotizar proyecto <span className="arr">→</span>
              </Link>
              <Link className="btn btn-out" href="/archivo" data-cursor-text="Ver proyecto">
                Ver archivo <span className="arr">→</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
