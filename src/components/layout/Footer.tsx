'use client';

import Link from 'next/link';
import { NAV_LINKS, SOCIAL_LINKS } from '@/lib/constants';
import { MarqueeText } from '@/components/ui/MarqueeText';

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--glass-border)]">
      {/* Marquee */}
      <div className="overflow-hidden py-6 border-b border-[var(--glass-border)]">
        <MarqueeText
          text="DRONE PILOT • FOTOGRAFÍA AÉREA • VIDEO AÉREO • PABLO"
          speed={40}
        />
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Personal Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-2xl font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-clash)' }}
            >
              PABLO<span className="text-[var(--color-accent)]">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
              Piloto de drones y fotógrafo aéreo profesional. Capturando el
              mundo desde perspectivas que inspiran.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Navegación
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Lo que hago
            </h4>
            <ul className="space-y-3">
              {[
                'Fotografía & Video Aéreo',
                'Real Estate & Arquitectura',
                'Cobertura de Eventos',
                'Inspección de Infraestructura',
                'Hyperlapses Aéreos',
              ].map((service) => (
                <li key={service}>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li>Pablo Yamamoto Magaña</li>
              <li>
                <a href="mailto:pabloyamamoto19@gmail.com" className="transition-colors hover:text-[var(--color-text)]">
                  pabloyamamoto19@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+525585699724" className="transition-colors hover:text-[var(--color-text)]">
                  +52 55 8569 9724
                </a>
              </li>
              <li className="font-mono text-xs">
                19.4326° N, 99.1332° W
              </li>
            </ul>

            {/* Social */}
            <div className="mt-6 flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
                  aria-label={social.label}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--glass-border)] py-6">
        <div className="container-custom flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} Pablo Aerial. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Privacidad
            </Link>
            <Link
              href="#"
              className="text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
