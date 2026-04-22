'use client';

/**
 * Footer — archive-style sitemap. Direct children of `footer.footer` are the
 * four columns (brand block + Sitio + Servicios + Canales) so the CSS grid
 * `grid-template-columns: 2fr 1fr 1fr 1fr` lays them out horizontally. The
 * `.foot-bar` row spans the full width below and carries the copyright stamp.
 */
export function Footer() {
  return (
    <footer className="footer" id="footer">
      <div>
        <div className="foot-brand">
          Yamamoto <span className="b">Aerial</span>
        </div>
        <p>
          Fotografía y video aéreo cinematográfico. Operación con base en Ciudad
          de México y vuelos nacionales bajo contrato.
        </p>
      </div>

      <div>
        <h5>Sitio</h5>
        <ul>
          <li>
            <a href="/#archive">Archivo</a>
          </li>
          <li>
            <a href="/#about">Piloto</a>
          </li>
          <li>
            <a href="/#method">Método</a>
          </li>
          <li>
            <a href="/#rates">Tarifas</a>
          </li>
          <li>
            <a href="/contact">Contacto</a>
          </li>
        </ul>
      </div>

      <div>
        <h5>Servicios</h5>
        <ul>
          <li>Arquitectura &amp; real estate</li>
          <li>Eventos &amp; festivales</li>
          <li>Paisaje &amp; hyperlapse</li>
          <li>Inspección de infraestructura</li>
          <li>Compilados editoriales</li>
        </ul>
      </div>

      <div>
        <h5>Canales</h5>
        <ul>
          <li>
            <a
              href="https://instagram.com/the_pym_project"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram ↗
            </a>
          </li>
          <li>
            <a
              href="https://stock.adobe.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Adobe Stock ↗
            </a>
          </li>
          <li>
            <a href="mailto:pabloyamamoto19@gmail.com">
              pabloyamamoto19@gmail.com
            </a>
          </li>
          <li>
            <a href="tel:+525585699724">+52 55 8569 9724</a>
          </li>
        </ul>
      </div>

      <div className="foot-bar mono">
        <span>© 2026 · Pablo Yamamoto / Yamamoto Aerial</span>
        <span>CDMX · MX</span>
        <span>v.26.04 · BUILD 0412</span>
      </div>
    </footer>
  );
}
