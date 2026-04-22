'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { SERVICE_PACKAGES } from '@/lib/constants';

/* Raw Three.js scene — client-only, no SSR */
const ContactUplinkScene = dynamic(
  () =>
    import('@/components/three/ContactUplinkScene').then(
      (m) => m.ContactUplinkScene,
    ),
  { ssr: false },
);

const PROJECT_TYPES = [
  'Real Estate',
  'Arquitectura',
  'Evento',
  'Cinematográfico',
  'Infraestructura',
  'Hyperlapse',
  'Otro',
];

const DATE_OPTIONS = [
  'Esta semana',
  'Próximos 15 días',
  'Este mes',
  'Próximos 2 meses',
  'Flexible',
];

const BUDGET_OPTIONS = [
  '$3,500 – $10,000 MXN',
  '$10,000 – $25,000 MXN',
  '$25,000 – $60,000 MXN',
  '$60,000+ MXN',
  'Por definir',
];

const STATUS_TICKER = [
  'ESTADO · LISTO PARA TRANSMITIR',
  'ESTADO · CANAL ESTABLE · 22/22 SAT',
  'ESTADO · LATENCIA 14MS · SEGURO',
  'ESTADO · UPLINK CIFRADO · AES-256',
];

/* Map service slug → chip label so deep links prefill the tipo row */
const SLUG_TO_SERVICE: Record<string, string> = {
  'fotografia-video': 'Cinematográfico',
  eventos: 'Evento',
  inspeccion: 'Infraestructura',
};

interface SelectedPackage {
  serviceTitle: string;
  tierName: string;
  tierPrice: number;
  tierDescription: string;
}

function resolvePackageFromParams(
  serviceSlug: string | null,
  tierParam: string | null,
): SelectedPackage | null {
  if (!serviceSlug || !tierParam) return null;

  const pkg = SERVICE_PACKAGES.find((s) => s.slug === serviceSlug);
  if (!pkg) return null;

  const tier = pkg.tiers.find(
    (t) => t.name.toLowerCase() === tierParam.toLowerCase(),
  );
  if (!tier) return null;

  return {
    serviceTitle: pkg.title,
    tierName: tier.name,
    tierPrice: tier.price,
    tierDescription: tier.description,
  };
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
}

function ContactContent() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    empresa: '',
    ubicacion: '',
    fecha: '',
    presupuesto: '',
    message: '',
  });
  const [tipo, setTipo] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusText, setStatusText] = useState(STATUS_TICKER[0]);
  const [statusErr, setStatusErr] = useState(false);
  const [error, setError] = useState('');

  const statusIndex = useRef(0);

  /* Prefill from URL params (?service=&tier=) */
  useEffect(() => {
    const serviceSlug = searchParams.get('service');
    const tierParam = searchParams.get('tier');
    const pkg = resolvePackageFromParams(serviceSlug, tierParam);
    if (pkg) {
      setSelectedPackage(pkg);
      const chip = SLUG_TO_SERVICE[serviceSlug!];
      if (chip) setTipo(chip);
      setForm((f) => ({
        ...f,
        message: `Hola, me interesa el paquete ${pkg.tierName} de ${pkg.serviceTitle} (desde $${pkg.tierPrice.toLocaleString('es-MX')} MXN).`,
      }));
    }
  }, [searchParams]);

  /* Cycle the status ticker at the bottom of the panel */
  useEffect(() => {
    if (submitted || statusErr) return;
    const id = window.setInterval(() => {
      statusIndex.current = (statusIndex.current + 1) % STATUS_TICKER.length;
      setStatusText(STATUS_TICKER[statusIndex.current]);
    }, 4200);
    return () => window.clearInterval(id);
  }, [submitted, statusErr]);

  const clearPackage = () => {
    setSelectedPackage(null);
    setForm((f) => ({ ...f, message: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required = !form.name || !form.email || !tipo || !form.message;
    if (required) {
      setStatusErr(true);
      setStatusText('ESTADO · FALTAN CAMPOS OBLIGATORIOS');
      setError('Completa los campos obligatorios (REQ).');
      return;
    }

    setSending(true);
    setError('');
    setStatusErr(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          empresa: form.empresa,
          service: tipo,
          ubicacion: form.ubicacion,
          fecha: form.fecha,
          presupuesto: form.presupuesto,
          message: form.message,
          package: selectedPackage
            ? `${selectedPackage.serviceTitle} — ${selectedPackage.tierName} ($${selectedPackage.tierPrice.toLocaleString('es-MX')} MXN)`
            : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setStatusText('ESTADO · UPLINK TRANSMITIDO');
    } catch {
      setError('Hubo un error al enviar el uplink. Intenta de nuevo.');
      setStatusErr(true);
      setStatusText('ESTADO · FALLÓ LA TRANSMISIÓN');
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setForm({
      name: '',
      email: '',
      empresa: '',
      ubicacion: '',
      fecha: '',
      presupuesto: '',
      message: '',
    });
    setTipo('');
    setSelectedPackage(null);
    setStatusErr(false);
    setStatusText(STATUS_TICKER[0]);
    statusIndex.current = 0;
  };

  const charCount = form.message.length;

  return (
    <>
      <Navigation />
      <main>
        <section className="cpage">
          {/* ============ LEFT: editorial intro ============ */}
          <div className="left">
            <ContactUplinkScene />

            <div className="kicker">
              <span>§ 05 / UPLINK</span>
              <span className="slash">/</span>
              <span>Canal abierto</span>
              <span className="slash">/</span>
              <span>Respuesta &lt; 24 h</span>
            </div>

            <h1>
              Envía
              <br />
              <span className="b">las</span>{' '}
              <span className="u">coordenadas.</span>
              <br />
              Yo llevo <span className="b">el</span>
              <br />
              <em>cielo.</em>
            </h1>

            <p className="clead">
              Cuéntame del proyecto —{' '}
              <strong>
                ubicación, objetivo, fechas tentativas y uso final.
              </strong>{' '}
              Con eso preparo una propuesta concreta y cotización formal.
              Respondo en menos de 24 horas; propuesta en 48.
            </p>

            <div className="cstrip">
              <div>
                Respuesta<span className="v">&lt; 24 h</span>
              </div>
              <div>
                Propuesta<span className="v">48 h</span>
              </div>
              <div>
                Cobertura<span className="v">Nacional</span>
              </div>
              <div>
                Idiomas<span className="v">ES · EN · JP</span>
              </div>
            </div>

            <div className="cproc">
              <div className="s">
                <div className="idx">01 · Envías</div>
                <h5>Briefing inicial</h5>
                <p>
                  Describe el proyecto, ubicaciones, fechas y formato de entrega
                  deseado.
                </p>
              </div>
              <div className="s">
                <div className="idx">02 · Revisamos</div>
                <h5>Llamada &amp; propuesta</h5>
                <p>
                  Una call de 20 min, alcance técnico y envío de cotización
                  formal en 48 h.
                </p>
              </div>
              <div className="s">
                <div className="idx">03 · Volamos</div>
                <h5>Captura &amp; entrega</h5>
                <p>
                  Plan de vuelo, operación y postproducción — todo en una
                  pieza.
                </p>
              </div>
            </div>

            <div className="cinfo">
              <div>
                <div className="k">Canal directo</div>
                <a className="v" href="mailto:pabloyamamoto19@gmail.com">
                  pabloyamamoto19@gmail.com
                </a>
              </div>
              <div>
                <div className="k">Teléfono</div>
                <a className="v" href="tel:+525585699724">
                  +52 55 8569 9724
                </a>
              </div>
              <div>
                <div className="k">Base</div>
                <div className="v">Polanco · CDMX</div>
                <div className="sub">19.4326°N · 099.1332°W</div>
              </div>
              <div>
                <div className="k">Social</div>
                <a
                  className="v"
                  href="https://instagram.com/the_pym_project"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @the_pym_project ↗
                </a>
              </div>
            </div>
          </div>

          {/* ============ RIGHT: form panel ============ */}
          <aside className="fpanel">
            <div className="tick">
              <span>FORMULARIO · OP-001</span>
              <span className="rec">CANAL ABIERTO</span>
            </div>

            <form className="uplink-form" onSubmit={handleSubmit} noValidate>
              {selectedPackage && (
                <div className="pkg-banner">
                  <div>
                    <div className="pkg-k">Paquete seleccionado</div>
                    <div className="pkg-name">
                      {selectedPackage.serviceTitle} — {selectedPackage.tierName}
                    </div>
                    <div className="pkg-desc">
                      {selectedPackage.tierDescription} · Desde $
                      {selectedPackage.tierPrice.toLocaleString('es-MX')} MXN
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pkg-clear"
                    onClick={clearPackage}
                    aria-label="Quitar selección"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="fld">
                <div className="head">
                  <span>01 · Nombre</span>
                  <span className="req">REQ</span>
                </div>
                <input
                  id="f-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="fld">
                <div className="head">
                  <span>02 · Email</span>
                  <span className="req">REQ</span>
                </div>
                <input
                  id="f-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="nombre@dominio.com"
                />
              </div>

              <div className="fld">
                <div className="head">
                  <span>03 · Empresa · Proyecto</span>
                  <span>OPT</span>
                </div>
                <input
                  id="f-empresa"
                  type="text"
                  value={form.empresa}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, empresa: e.target.value }))
                  }
                  placeholder="Nombre del proyecto o empresa"
                />
              </div>

              <div className="fld">
                <div className="head">
                  <span>04 · Tipo de proyecto</span>
                  <span className="req">REQ</span>
                </div>
                <div className="chips" role="group" aria-label="Tipo de proyecto">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`chip${tipo === t ? ' on' : ''}`}
                      onClick={() => setTipo(t)}
                      aria-pressed={tipo === t}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fld">
                <div className="head">
                  <span>05 · Ubicación</span>
                  <span>OPT</span>
                </div>
                <input
                  id="f-ubicacion"
                  type="text"
                  value={form.ubicacion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ubicacion: e.target.value }))
                  }
                  placeholder="Ciudad · Estado · dirección aproximada"
                />
              </div>

              <div className="fld">
                <div className="head">
                  <span>06 · Fecha tentativa</span>
                  <span>OPT</span>
                </div>
                <select
                  id="f-fecha"
                  value={form.fecha}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fecha: e.target.value }))
                  }
                >
                  <option value="">Selecciona una ventana</option>
                  {DATE_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fld">
                <div className="head">
                  <span>07 · Presupuesto</span>
                  <span>OPT</span>
                </div>
                <select
                  id="f-presupuesto"
                  value={form.presupuesto}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, presupuesto: e.target.value }))
                  }
                >
                  <option value="">Selecciona un rango</option>
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fld">
                <div className="head">
                  <span>08 · Briefing</span>
                  <span className="count">
                    <span>{charCount}</span>/600
                  </span>
                </div>
                <textarea
                  id="f-msg"
                  name="mensaje"
                  required
                  maxLength={600}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Cuéntame del proyecto: objetivo, referencias, uso final, entregables..."
                />
              </div>

              {error && <p className="form-err">{error}</p>}

              <div className="submit">
                <button type="submit" disabled={sending}>
                  {sending ? 'ENVIANDO…' : 'ENVIAR UPLINK'}
                  <span aria-hidden="true" style={{ fontSize: 14 }}>
                    {sending ? '·' : '→'}
                  </span>
                </button>
                <a className="sec" href="mailto:pabloyamamoto19@gmail.com">
                  EMAIL ↗
                </a>
              </div>

              <div className="fnote">
                <span>Respuesta &lt; 24 h · propuesta 48 h</span>
                <span>Canal seguro · TLS</span>
              </div>
            </form>

            <div className="tick-bot">
              <span style={statusErr ? { color: 'var(--signal)' } : undefined}>
                {statusText}
              </span>
              <span className="ok">■ SEGURO</span>
            </div>

            {/* success overlay */}
            <div className={`sent${submitted ? ' show' : ''}`}>
              <div className="rad" aria-hidden="true" />
              <h4>
                Uplink <em>recibido.</em>
              </h4>
              <p>
                Gracias por escribir. Reviso tu briefing y te respondo en menos
                de 24 horas con una propuesta inicial.
              </p>
              <div className="sig">OP-001 · PABLO YAMAMOTO · CONFIRMADO</div>
              <button type="button" onClick={reset}>
                Enviar otro mensaje →
              </button>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
