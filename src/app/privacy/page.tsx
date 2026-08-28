import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { DocumentBody } from '@/components/sections/DocumentBody';
import { PRIVACY_POLICY } from '@/lib/constants';

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <main className="docpage">
        <header className="doc-top">
          <div className="kicker">
            <span>Legal</span>
            <span className="slash">—</span>
            <span>LFPDPPP</span>
          </div>
          <h1>
            Aviso de <span className="b">Privacidad</span>
          </h1>
          <p className="doc-sub">{PRIVACY_POLICY.lead}</p>
          <div className="doc-meta">
            <span>
              <strong>Responsable</strong> · Pablo Yamamoto Magaña
            </span>
            <span>
              <strong>Última actualización</strong> · {PRIVACY_POLICY.updated}
            </span>
            <span>
              <strong>Jurisdicción</strong> · México
            </span>
          </div>
        </header>

        <DocumentBody sections={PRIVACY_POLICY.sections} />
      </main>
      <Footer />
    </>
  );
}
