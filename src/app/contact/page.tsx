'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Cursor } from '@/components/layout/Cursor';

const SERVICES = [
  'Fotografía Aérea',
  'Video Cinematográfico',
  'Real Estate',
  'Cobertura de Eventos',
  'Inspección de Infraestructura',
  'Hyperlapse',
  'Otro',
];

export default function ContactPage() {
  const [selectedService, setSelectedService] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, service: selectedService }),
      });

      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError('Hubo un error al enviar tu mensaje. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Cursor />
      <SmoothScroll>
        <Navigation />
        <main className="min-h-screen pt-32 pb-0">
          <div className="container-custom">

            {/* Header */}
            <div className="mb-20">
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">Contacto</p>
              <h1
                className="text-[var(--text-h1)] font-bold uppercase leading-none"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                ¿Tienes un proyecto<br />
                <span className="text-gradient">que necesita verse?</span>
              </h1>
              <p className="mt-8 max-w-xl text-[var(--text-body)] leading-relaxed text-[var(--color-text-muted)]">
                Cuéntame qué tienes en mente. Respondo en menos de 24 horas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 lg:gap-24 pb-[var(--section-padding)]">

              {/* Left — Info */}
              <div className="flex flex-col gap-12">
                {/* Direct contact */}
                <div>
                  <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Contacto directo</h3>
                  <div className="flex flex-col gap-5">
                    <a
                      href="mailto:pabloyamamoto19@gmail.com"
                      className="group flex items-center gap-4 text-[var(--text-body)] transition-colors hover:text-[var(--color-accent)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] group-hover:border-[var(--color-accent)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </span>
                      pabloyamamoto19@gmail.com
                    </a>
                    <a
                      href="tel:+525585699724"
                      className="group flex items-center gap-4 text-[var(--text-body)] transition-colors hover:text-[var(--color-accent)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] group-hover:border-[var(--color-accent)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                      </span>
                      +52 55 8569 9724
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Ubicación</h3>
                  <p className="text-[var(--text-body)] text-[var(--color-text-muted)]">Ciudad de México, México</p>
                  <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]/60">19.4326° N, 99.1332° W</p>
                  <p className="mt-3 text-sm text-[var(--color-text-muted)]">Disponible para proyectos en todo México e internacionales.</p>
                </div>

                {/* Response time */}
                <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm text-[var(--color-text-muted)]">Disponible para nuevos proyectos</span>
                  </div>
                  <p className="mt-3 text-xs text-[var(--color-text-muted)]/70 uppercase tracking-wider">Tiempo de respuesta: &lt; 24 horas</p>
                </div>
              </div>

              {/* Right — Form */}
              <div>
                {submitted ? (
                  <div className="flex flex-col items-start gap-6 py-12">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-accent)]">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h3 className="text-[var(--text-h2)] font-bold uppercase" style={{ fontFamily: 'var(--font-clash)' }}>
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-[var(--color-text-muted)]">Gracias por escribirme. Te respondo en menos de 24 horas.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); setSelectedService(''); }}
                      className="mt-2 text-sm uppercase tracking-wider text-[var(--color-accent)] underline-offset-4 hover:underline"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Nombre</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Tu nombre"
                          className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 outline-none transition-colors focus:border-[var(--color-accent)]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Email</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="tu@email.com"
                          className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 outline-none transition-colors focus:border-[var(--color-accent)]"
                        />
                      </div>
                    </div>

                    {/* Service selector */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">¿Qué tipo de proyecto?</label>
                      <div className="flex flex-wrap gap-3">
                        {SERVICES.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedService(s)}
                            className={`rounded-full border px-5 py-2.5 text-xs uppercase tracking-wider transition-all duration-300 ${
                              selectedService === s
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                : 'border-[var(--glass-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Cuéntame más</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Describe tu proyecto, ubicación, fecha estimada..."
                        className="resize-none rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 outline-none transition-colors focus:border-[var(--color-accent)]"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-400">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="group flex items-center gap-3 self-start rounded-full bg-[var(--color-accent)] px-10 py-5 text-sm font-semibold uppercase tracking-wider text-[var(--color-bg)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {sending ? 'Enviando...' : 'Enviar mensaje'}
                      {!sending && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" className="transition-transform duration-300 group-hover:translate-x-1">
                          <path d="M3 8h10M9 4l4 4-4 4" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </button>

                  </form>
                )}
              </div>

            </div>
          </div>
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
