import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { renderNotFoundMarkdown } from '@/lib/markdownPages';

export const metadata: Metadata = {
  title: 'Página no encontrada (404)',
  description:
    'La ruta solicitada no existe en yamamotoaerial.com. Aquí está el mapa completo del sitio '
    + 'y las rutas legibles por máquina para continuar la búsqueda.',
  robots: { index: false, follow: true },
};

/* Every entry here also appears in the Markdown recovery block below and in
   src/app/sitemap.ts — three representations of one list. */
const ROUTES = [
  { href: '/', label: 'Inicio', note: 'Servicios, paquetes, precios y contacto' },
  { href: '/about', label: 'Sobre Pablo', note: 'Trayectoria, credenciales AFAC, equipo y cobertura' },
  { href: '/work', label: 'Portafolio', note: 'Proyectos seleccionados' },
  { href: '/archivo', label: 'Archivo de vuelos', note: 'Archivo completo 2022–2026, filtrable' },
  { href: '/faq', label: 'Preguntas frecuentes', note: 'Clima, entregas, formatos y cobertura' },
  { href: '/contact', label: 'Contacto', note: 'Cotización en menos de 24 horas hábiles' },
  { href: '/privacy', label: 'Aviso de privacidad', note: 'Tratamiento de datos y derechos ARCO' },
] as const;

const MACHINE_ROUTES = [
  { href: '/agents.md', label: 'agents.md', note: 'Cuándo usar este sitio y cómo citarlo' },
  { href: '/llms.txt', label: 'llms.txt', note: 'Resumen completo del negocio en texto plano' },
  { href: '/sitemap.xml', label: 'sitemap.xml', note: 'Todas las URLs públicas' },
  { href: '/robots.txt', label: 'robots.txt', note: 'Reglas de rastreo' },
] as const;

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="docpage">
        <header className="doc-top">
          <div className="kicker">
            <span>HTTP 404</span>
            <span className="slash">—</span>
            <span>Señal perdida</span>
          </div>
          <h1>
            Ruta <span className="b">no encontrada</span>
          </h1>
          <p className="doc-sub">
            Esta dirección no existe en yamamotoaerial.com. Abajo está el mapa completo
            del sitio y las rutas legibles por máquina para seguir buscando.
          </p>
        </header>

        <div className="doc-body">
          <section>
            <h2>Páginas del sitio</h2>
            <ul>
              {ROUTES.map((route) => (
                <li key={route.href}>
                  <Link href={route.href}>{route.label}</Link> — {route.note}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Rutas para agentes</h2>
            <ul>
              {MACHINE_ROUTES.map((route) => (
                <li key={route.href}>
                  <Link href={route.href}>{route.label}</Link> — {route.note}
                </li>
              ))}
            </ul>
            <p>
              Cualquier página responde también a <code>Accept: text/markdown</code>, o
              añadiendo <code>.md</code> a la ruta.
            </p>
          </section>

          <section>
            <h2>Mapa del sitio en Markdown</h2>
            {/* The same recovery body an agent gets from
                `curl -H 'Accept: text/markdown'`, inlined so a client that only
                reads the HTML still finds machine-parseable links. */}
            <pre className="doc-md">{renderNotFoundMarkdown()}</pre>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
